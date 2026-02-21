import { Request, Response } from 'express';
import pool from '../config/database';

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
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching maps:', error);
    res.status(500).json({ error: 'Failed to fetch maps' });
  }
}

export async function getMapMarkers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { type } = req.query;

    let query = 'SELECT * FROM map_markers WHERE map_id = $1';
    const params: any[] = [id];

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
