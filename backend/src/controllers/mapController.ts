import { Request, Response } from 'express';
import pool from '../config/database';

// ─── Generic cache helper ───────────────────────────────────────────────────
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry<T> { ts: number; data: T }
const cache = new Map<string, CacheEntry<any>>();

async function cachedFetch<T>(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  const data = await fetcher();
  if (data) cache.set(key, { ts: Date.now(), data });
  return data;
}

// ─── Fortnite ───────────────────────────────────────────────────────────────
const FORTNITE_MAP_WORLD_MIN = -2500;
const FORTNITE_MAP_WORLD_MAX = 2500;
const FORTNITE_MAP_WORLD_RANGE = FORTNITE_MAP_WORLD_MAX - FORTNITE_MAP_WORLD_MIN;

function fortniteWorldToPercent(worldX: number, worldY: number) {
  const x = ((worldX - FORTNITE_MAP_WORLD_MIN) / FORTNITE_MAP_WORLD_RANGE) * 100;
  const y = ((FORTNITE_MAP_WORLD_MAX - worldY) / FORTNITE_MAP_WORLD_RANGE) * 100;
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

interface FortnitePOI { id: string; name: string; location: { x: number; y: number } }
interface FortniteMapImages { blank: string; pois?: string }

async function fetchFortniteMapData(): Promise<{ images: FortniteMapImages; pois: FortnitePOI[] } | null> {
  return cachedFetch('fortnite-map', async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://fortnite-api.com/v1/map', { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json() as any;
    if (json.status !== 200 || !json.data) return null;

    const images: FortniteMapImages = json.data.images ?? {};
    const pois: FortnitePOI[] = (json.data.pois ?? []).filter(
      (p: FortnitePOI) => p.name && p.name.trim() !== ''
    );
    return { images, pois };
  });
}

// ─── Valorant (valorant-api.com – no auth required) ─────────────────────────
interface ValorantMap {
  uuid: string;
  displayName: string;
  displayIcon: string | null;   // minimap overhead view
  splash: string | null;
  mapUrl: string;
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
  callouts: { regionName: string; superRegionName: string; location: { x: number; y: number } }[] | null;
}

async function fetchValorantMaps(): Promise<ValorantMap[] | null> {
  return cachedFetch('valorant-maps', async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://valorant-api.com/v1/maps', { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json() as any;
    return (json.data ?? []) as ValorantMap[];
  });
}

// Map valorant-api mapUrl paths to our DB slugs
const VALORANT_MAP_SLUGS: Record<string, string> = {
  '/Game/Maps/Ascent/Ascent': 'ascent',
  '/Game/Maps/Bind/Bind': 'bind',
  '/Game/Maps/Bonsai/Bonsai': 'split',
  '/Game/Maps/Canyon/Canyon': 'fracture',
  '/Game/Maps/Duality/Duality': 'haven',
  '/Game/Maps/Foxtrot/Foxtrot': 'breeze',
  '/Game/Maps/Jam/Jam': 'lotus',
  '/Game/Maps/Juliett/Juliett': 'sunset',
  '/Game/Maps/Pitt/Pitt': 'pearl',
  '/Game/Maps/Port/Port': 'icebox',
  '/Game/Maps/Triad/Triad': 'haven',
  '/Game/Maps/HURM/HURM_Alley/HURM_Alley': 'district',
  '/Game/Maps/HURM/HURM_Bowl/HURM_Bowl': 'kasbah',
  '/Game/Maps/HURM/HURM_Yard/HURM_Yard': 'piazza',
  '/Game/Maps/Infinity/Infinity': 'abyss',
};

function valorantCalloutToPercent(
  callout: { location: { x: number; y: number } },
  map: ValorantMap,
): { x: number; y: number } {
  // valorant-api provides multipliers to convert game coords → 0-1 range on the minimap
  const x = (callout.location.y * map.xMultiplier + map.xScalarToAdd) * 100;
  const y = (callout.location.x * map.yMultiplier + map.yScalarToAdd) * 100;
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

// ─── League of Legends (Riot Data Dragon – no auth required) ────────────────
async function fetchLoLMapImageUrl(): Promise<string | null> {
  return cachedFetch('lol-map-url', async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const versions = await res.json() as string[];
    const latest = versions[0];
    return `https://ddragon.leagueoflegends.com/cdn/${latest}/img/map/map11.png`;
  });
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

    // Fortnite: serve latest map image from fortnite-api.com
    if (slug === 'fortnite' && maps.length > 0) {
      const live = await fetchFortniteMapData();
      if (live?.images?.blank) {
        maps[0].image_url = live.images.blank;
        pool.query('UPDATE game_maps SET image_url = $1 WHERE id = $2', [
          live.images.blank, maps[0].id,
        ]).catch(() => {});
      }
    }

    // Valorant: replace DB image URLs with live displayIcon from valorant-api.com
    if (slug === 'valorant' && maps.length > 0) {
      const valMaps = await fetchValorantMaps();
      if (valMaps) {
        for (const dbMap of maps) {
          const match = valMaps.find((vm) => {
            const apiSlug = VALORANT_MAP_SLUGS[vm.mapUrl];
            return apiSlug === dbMap.slug;
          });
          if (match?.displayIcon) {
            dbMap.image_url = match.displayIcon;
            pool.query('UPDATE game_maps SET image_url = $1 WHERE id = $2', [
              match.displayIcon, dbMap.id,
            ]).catch(() => {});
          }
        }
      }
    }

    // League of Legends: serve minimap from Riot Data Dragon CDN
    if (slug === 'lol' && maps.length > 0) {
      const lolUrl = await fetchLoLMapImageUrl();
      if (lolUrl) {
        maps[0].image_url = lolUrl;
        pool.query('UPDATE game_maps SET image_url = $1 WHERE id = $2', [
          lolUrl, maps[0].id,
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

    // Look up which game/map this belongs to
    const mapRow = await pool.query(
      `SELECT gm.slug AS map_slug, g.slug AS game_slug
       FROM game_maps gm
       JOIN games g ON gm.game_id = g.id
       WHERE gm.id = $1`,
      [id]
    );

    const gameSlug = mapRow.rows[0]?.game_slug;
    const mapSlug = mapRow.rows[0]?.map_slug;

    // ── Fortnite: live POIs ──
    if (gameSlug === 'fortnite') {
      const live = await fetchFortniteMapData();
      if (live && live.pois.length > 0) {
        const markers = live.pois
          .filter(() => !type || type === 'loot')
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

    // ── Valorant: live callouts ──
    if (gameSlug === 'valorant') {
      const valMaps = await fetchValorantMaps();
      if (valMaps) {
        const match = valMaps.find((vm) => VALORANT_MAP_SLUGS[vm.mapUrl] === mapSlug);
        if (match?.callouts && match.callouts.length > 0) {
          const markers = match.callouts
            .filter(() => !type || type === 'loot') // callouts map to 'loot' type (map regions)
            .map((callout, i) => {
              const { x, y } = valorantCalloutToPercent(callout, match);
              return {
                id: `valapi-${match.uuid}-${i}`,
                map_id: id,
                marker_type: 'loot' as const,
                label: callout.regionName,
                description: `${callout.superRegionName} region`,
                x_coord: x,
                y_coord: y,
                icon: null,
              };
            })
            .filter((m) => m.x_coord >= 0 && m.x_coord <= 100 && m.y_coord >= 0 && m.y_coord <= 100);
          if (markers.length > 0) return res.json(markers);
        }
      }
      // Fall through to DB markers if API unavailable
    }

    // ── Default: DB markers ──
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
