import { Request, Response } from 'express';
import pool from '../config/database';

export async function listGames(_req: Request, res: Response) {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, icon, color_accent FROM games ORDER BY sort_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
}
