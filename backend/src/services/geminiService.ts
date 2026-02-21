import { geminiModel, geminiVisionModel } from '../config/gemini';
import { getSystemPrompt } from './prompts';
import pool from '../config/database';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SendMessageOptions {
  conversationId: string;
  message: string;
  gameSlug?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export async function sendMessage(options: SendMessageOptions): Promise<string> {
  const { conversationId, message, gameSlug, imageBase64, imageMimeType } = options;

  // Get conversation history from DB — EXCLUDE the latest user message
  // because we will send it as the new message via chat.sendMessage()
  const historyResult = await pool.query(
    `SELECT role, content FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  // Remove the last message if it's the user message we're about to send
  const allMessages: ChatMessage[] = historyResult.rows.map((row) => ({
    role: row.role as 'user' | 'assistant',
    content: row.content,
  }));

  // Drop the last entry (the user message we just saved before calling this)
  const history = allMessages.slice(0, -1);

  const systemPrompt = getSystemPrompt(gameSlug);

  // Build the conversation for Gemini — ensure alternating user/model turns
  // Gemini requires the conversation to start with 'user' and alternate
  const geminiHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of history) {
    const role = msg.role === 'assistant' ? 'model' as const : 'user' as const;

    // Merge consecutive same-role messages (Gemini requires alternating)
    if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === role) {
      geminiHistory[geminiHistory.length - 1].parts[0].text += '\n\n' + msg.content;
    } else {
      geminiHistory.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  }

  let responseText: string;

  try {
    if (imageBase64 && imageMimeType) {
      // Vision request with image
      const chat = geminiVisionModel.startChat({
        history: geminiHistory,
        systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
      });

      const result = await chat.sendMessage([
        { text: message || 'Analyze this screenshot and give me gaming advice.' },
        {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        },
      ]);

      responseText = result.response.text();
    } else {
      // Text-only request
      const chat = geminiModel.startChat({
        history: geminiHistory,
        systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
      });

      const result = await chat.sendMessage(message);
      responseText = result.response.text();
    }
  } catch (error: any) {
    console.error('Gemini API error:', error?.message || error);
    throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
  }

  return responseText;
}

export async function generateTitle(message: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(
      `Generate a very short title (max 5 words) for a gaming conversation that starts with this message. Return ONLY the title, nothing else:\n\n"${message}"`
    );
    return result.response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Title generation error:', error);
    return 'Gaming Chat';
  }
}
