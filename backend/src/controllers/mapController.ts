import { Request, Response } from 'express';
import pool from '../config/database';

// Fortnite map coordinates: the API returns game-world coordinates.
// The blank map image is 2048×2048 and covers world bounds of roughly
// x: [-2500, 2500], y: [-2500, 2500] (with Y-axis inverted in image space).
const FORTNITE_MAP_WORLD_MIN = -2500;
const FORTNITE_MAP_WORLD_MAX = 2500;
const FORTNITE_MAP_WORLD_RANGE = FORTNITE_MAP_WORLD_MAX - FORTNITE_MAP_WORLD_MIN;

function fortniteWorldToPercent(worldX: number, worldY: number) {
  const x = ((worldX - FORTNITE_MAP_WORLD_MIN) / FORTNITE_MAP_WORLD_RANGE) * 100;
  // Y is inverted: positive world-Y is towards the top of the image
  const y = ((FORTNITE_MAP_WORLD_MAX - worldY) / FORTNITE_MAP_WORLD_RANGE) * 100;
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

interface FortnitePOI {
  id: string;
  name: string;
  location: { x: number; y: number };
}

interface FortniteMapImages {
  blank: string;
  pois?: string;
}

let fortnitePoiCache: { ts: number; pois: FortnitePOI[]; images: FortniteMapImages } | null = null;
const FORTNITE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function fetchFortniteMapData(): Promise<{ images: FortniteMapImages; pois: FortnitePOI[] } | null> {
  const now = Date.now();
  if (fortnitePoiCache && now - fortnitePoiCache.ts < FORTNITE_CACHE_TTL_MS) {
    return { images: fortnitePoiCache.images, pois: fortnitePoiCache.pois };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://fortnite-api.com/v1/map', { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 200 || !json.data) return null;

    const images: FortniteMapImages = json.data.images ?? {};
    const pois: FortnitePOI[] = (json.data.pois ?? []).filter(
      (p: FortnitePOI) => p.name && p.name.trim() !== ''
    );

    fortnitePoiCache = { ts: now, images, pois };
    return { images, pois };
  } catch {
    return null;
  }
}

export async function getGameMaps(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT gm.id, gm.name, gm.slug, gm.image_url, gm.width, gm.height
       FROM game_maps gm
       JOIN games g ON gm.game_id = g.id
       WHERE g.slug = $1
       ORDER BY gm.name`,
      [slug]
    );

    const maps = result.rows;

    // For Fortnite, always try to serve the latest map image from fortnite-api.com
    if (slug === 'fortnite' && maps.length > 0) {
      const live = await fetchFortniteMapData();
      if (live?.images?.blank) {
        maps[0].image_url = live.images.blank;
        // Persist updated URL to DB in the background (best-effort)
        pool.query('UPDATE game_maps SET image_url = $1 WHERE id = $2', [
          live.images.blank,
          maps[0].id,
        ]).catch(() => {});
      }
    }

    res.json(maps);
  } catch (error) {
    console.error('Error fetching maps:', error);
    res.status(500).json({ error: 'Failed to fetch maps' });
  }
}

export async function getMapMarkers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type } = req.query;

    // Check whether this map belongs to Fortnite so we can enrich with live POIs
    const mapRow = await pool.query(
      `SELECT gm.slug AS map_slug, g.slug AS game_slug
       FROM game_maps gm
       JOIN games g ON gm.game_id = g.id
       WHERE gm.id = $1`,
      [id]
    );

    if (mapRow.rows[0]?.game_slug === 'fortnite') {
      const live = await fetchFortniteMapData();
      if (live && live.pois.length > 0) {
        // Convert live POIs to our marker format; apply type filter if set
        const markers = live.pois
          .filter(() => !type || type === 'loot') // POIs are effectively loot/drop locations
          .map((poi) => {
            const { x, y } = fortniteWorldToPercent(poi.location.x, poi.location.y);
            return {
              id: `fnapi-${poi.id}`,
              map_id: id,
              marker_type: 'loot' as const,
              label: poi.name,
              description: 'Named Point of Interest – current season',
              x_coord: x,
              y_coord: y,
              icon: null,
            };
          });
        return res.json(markers);
      }
      // Fall through to DB markers if API unavailable
    }

    let query = 'SELECT * FROM map_markers WHERE map_id = $1';
    const params: unknown[] = [id];

    if (type) {
      params.push(type);
      query += ` AND marker_type = $${params.length}`;
    }

    query += ' ORDER BY label';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching markers:', error);
    res.status(500).json({ error: 'Failed to fetch markers' });
  }
}
