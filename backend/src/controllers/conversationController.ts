import { Request, Response } from 'express';
import pool from '../config/database';
import { sendMessage, generateTitle } from '../services/geminiService';
import { uploadToSupabase } from '../services/storageService';

export async function listConversations(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
              g.slug as game_slug, g.name as game_name, g.icon as game_icon
       FROM conversations c
       LEFT JOIN games g ON c.game_id = g.id
       WHERE c.session_id = $1
       ORDER BY c.updated_at DESC`,
      [req.sessionId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}

export async function createConversation(req: Request, res: Response) {
  try {
    const { game_id } = req.body;
    const result = await pool.query(
      `INSERT INTO conversations (session_id, game_id)
       VALUES ($1, $2)
       RETURNING id, title, created_at, updated_at`,
      [req.sessionId, game_id || null]
    );

    const conversation = result.rows[0];

    // If game_id provided, fetch game info
    if (game_id) {
      const gameResult = await pool.query(
        'SELECT slug as game_slug, name as game_name, icon as game_icon FROM games WHERE id = $1',
        [game_id]
      );
      if (gameResult.rows[0]) {
        Object.assign(conversation, gameResult.rows[0]);
      }
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
}

export async function getConversation(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
              g.slug as game_slug, g.name as game_name, g.icon as game_icon
       FROM conversations c
       LEFT JOIN games g ON c.game_id = g.id
       WHERE c.id = $1 AND c.session_id = $2`,
      [req.params.id, req.sessionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
}

export async function deleteConversation(req: Request, res: Response) {
  try {
    const result = await pool.query(
      'DELETE FROM conversations WHERE id = $1 AND session_id = $2 RETURNING id',
      [req.params.id, req.sessionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    // Verify conversation belongs to session
    const convCheck = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND session_id = $2',
      [req.params.id, req.sessionId]
    );

    if (convCheck.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const result = await pool.query(
      'SELECT id, role, content, image_url, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}

export async function sendMessageHandler(req: Request, res: Response) {
  try {
    const conversationId = req.params.id;
    const { message } = req.body;
    const file = req.file;

    // Verify conversation belongs to session and get game info
    const convResult = await pool.query(
      `SELECT c.id, g.slug as game_slug
       FROM conversations c
       LEFT JOIN games g ON c.game_id = g.id
       WHERE c.id = $1 AND c.session_id = $2`,
      [conversationId, req.sessionId]
    );

    if (convResult.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const gameSlug = convResult.rows[0].game_slug;

    // Handle image if uploaded
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    let imageUrl: string | undefined;

    if (file) {
      imageUrl = await uploadToSupabase(file);
      imageBase64 = file.buffer.toString('base64');
      imageMimeType = file.mimetype;
    }

    // Save user message
    await pool.query(
      'INSERT INTO messages (conversation_id, role, content, image_url) VALUES ($1, $2, $3, $4)',
      [conversationId, 'user', message || '', imageUrl || null]
    );

    // Get AI response
    const aiResponse = await sendMessage({
      conversationId,
      message: message || 'Analyze this screenshot.',
      gameSlug,
      imageBase64,
      imageMimeType,
    });

    // Save assistant message
    const assistantMsg = await pool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id, role, content, created_at',
      [conversationId, 'assistant', aiResponse]
    );

    // Update timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    // Generate title async (don't block the response, and delay to avoid rate limit)
    const msgCount = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE conversation_id = $1',
      [conversationId]
    );

    if (parseInt(msgCount.rows[0].count) <= 2) {
      // Fire and forget — delay 2 seconds to avoid Gemini rate limit
      setTimeout(async () => {
        try {
          const title = await generateTitle(message || 'Screenshot analysis');
          await pool.query(
            'UPDATE conversations SET title = $1 WHERE id = $2',
            [title, conversationId]
          );
        } catch (err) {
          console.error('Title generation failed (non-critical):', err);
        }
      }, 2000);
    }

    res.json(assistantMsg.rows[0]);
  } catch (error: any) {
    console.error('Error sending message:', error);

    // Return helpful error messages
    const errorMsg = error?.message || '';
    if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
      res.status(429).json({ error: 'Rate limited — please wait a moment and try again.' });
    } else if (errorMsg.includes('API key')) {
      res.status(401).json({ error: 'Invalid Gemini API key. Check your .env configuration.' });
    } else {
      res.status(500).json({ error: 'Failed to get a response. Please try again.' });
    }
  }
}
