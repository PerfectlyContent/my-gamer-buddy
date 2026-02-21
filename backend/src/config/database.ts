import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
    }
    client = createClient(url, key);
  }
  return client;
}

function escapeValue(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  // String — escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

function interpolate(text: string, params?: any[]): string {
  if (!params || params.length === 0) return text;
  let result = text;
  // Replace from highest index first to avoid $1 matching $10, $11 etc.
  for (let i = params.length; i >= 1; i--) {
    const placeholder = `$${i}`;
    const escaped = escapeValue(params[i - 1]);
    result = result.split(placeholder).join(escaped);
  }
  return result;
}

// pg-compatible pool wrapper using Supabase RPC
const pool = {
  async query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
    const sb = getClient();
    // Normalize whitespace — collapse newlines/tabs to single spaces
    const normalized = text.replace(/\s+/g, ' ').trim();
    const sql = interpolate(normalized, params);

    const { data, error } = await sb.rpc('exec_sql', { query: sql });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const rows = Array.isArray(data) ? data : [];
    return { rows, rowCount: rows.length };
  }
};

export default pool;
