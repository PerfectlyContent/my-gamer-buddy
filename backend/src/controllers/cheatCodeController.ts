import { Request, Response } from 'express';
import pool from '../config/database';

export async function getCheatCodes(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const { category, platform } = req.query;

    let query = `
      SELECT cc.id, cc.title, cc.code, cc.platform, cc.category, cc.description, cc.created_at
      FROM cheat_codes cc
      JOIN games g ON cc.game_id = g.id
      WHERE g.slug = $1
    `;
    const params: any[] = [slug];

    if (category) {
      params.push(category);
      query += ` AND cc.category = $${params.length}`;
    }

    if (platform && platform !== 'All') {
      params.push(platform);
      query += ` AND (cc.platform = $${params.length} OR cc.platform = 'All')`;
    }

    query += ' ORDER BY cc.category, cc.title';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cheat codes:', error);
    res.status(500).json({ error: 'Failed to fetch cheat codes' });
  }
}
