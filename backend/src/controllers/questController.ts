import { Request, Response } from 'express';
import pool from '../config/database';

export async function getQuests(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const { category } = req.query;

    let query = `
      SELECT q.id, q.name, q.description, q.category, q.region, q.difficulty, q.is_missable, q.sort_order
      FROM quests q
      JOIN games g ON q.game_id = g.id
      WHERE g.slug = $1
    `;
    const params: any[] = [slug];

    if (category) {
      params.push(category);
      query += ` AND q.category = $${params.length}`;
    }

    query += ' ORDER BY q.sort_order, q.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
}

export async function getQuestProgress(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT qp.quest_id, qp.completed, qp.notes, qp.completed_at
       FROM quest_progress qp
       JOIN quests q ON qp.quest_id = q.id
       JOIN games g ON q.game_id = g.id
       WHERE qp.session_id = $1 AND g.slug = $2`,
      [req.sessionId, slug]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quest progress:', error);
    res.status(500).json({ error: 'Failed to fetch quest progress' });
  }
}

export async function updateQuestProgress(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { completed, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO quest_progress (session_id, quest_id, completed, notes, completed_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (session_id, quest_id) DO UPDATE SET
         completed = EXCLUDED.completed,
         notes = EXCLUDED.notes,
         completed_at = EXCLUDED.completed_at
       RETURNING *`,
      [
        req.sessionId,
        id,
        completed ?? false,
        notes ?? null,
        completed ? new Date().toISOString() : null,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quest progress:', error);
    res.status(500).json({ error: 'Failed to update quest progress' });
  }
}
