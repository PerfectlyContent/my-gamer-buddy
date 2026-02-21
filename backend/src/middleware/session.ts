import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// Extend Express Request to include sessionId
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      res.status(400).json({ error: 'x-session-id header is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      res.status(400).json({ error: 'x-session-id must be a valid UUID' });
      return;
    }

    // Upsert session
    await pool.query(
      'INSERT INTO sessions (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
      [sessionId]
    );

    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({ error: 'Session error' });
  }
}
