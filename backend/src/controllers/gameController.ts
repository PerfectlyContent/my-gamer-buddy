import { Request, Response } from 'express';
import pool from '../config/database';

export async function seedGames() {
  try {
    await pool.query(`
      INSERT INTO games (name, slug, icon, color_accent, sort_order) VALUES
        ('Fortnite', 'fortnite', '🏗️', '#00d4ff', 1),
        ('Call of Duty', 'cod', '🎯', '#ff6b00', 2),
        ('GTA', 'gta', '🚗', '#39ff14', 3),
        ('Valorant', 'valorant', '🔫', '#ff4655', 4),
        ('Minecraft', 'minecraft', '⛏️', '#8b5cf6', 5),
        ('Apex Legends', 'apex', '🦅', '#ff3333', 6),
        ('Elden Ring', 'elden-ring', '🗡️', '#d4a017', 7),
        ('League of Legends', 'lol', '🏆', '#c89b3c', 8),
        ('Zelda', 'zelda', '🛡️', '#00cc66', 9),
        ('Red Dead Redemption 2', 'rdr2', '🤠', '#c41e3a', 10),
        ('Elder Scrolls', 'elder-scrolls', '📜', '#8b7355', 11),
        ('Rainbow Six Siege', 'rainbow-six', '🛡️', '#1f4e78', 12)
      ON CONFLICT (slug) DO NOTHING
    `);
    console.log('Games seeded successfully');
  } catch (error) {
    console.error('Failed to seed games:', error);
  }
}

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
