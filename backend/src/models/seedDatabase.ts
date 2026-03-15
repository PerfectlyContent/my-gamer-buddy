import fs from 'fs';
import path from 'path';
import pool from '../config/database';

let seeded = false;

export async function seedDatabase() {
  if (seeded) return;
  seeded = true;

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split into individual statements, filtering out comments and empty lines
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`Running ${statements.length} seed statements...`);

    let success = 0;
    let skipped = 0;

    for (const stmt of statements) {
      // Skip pure comment blocks
      const cleaned = stmt.replace(/--[^\n]*/g, '').trim();
      if (!cleaned) {
        skipped++;
        continue;
      }
      try {
        await pool.query(cleaned);
        success++;
      } catch (err: any) {
        // Log but continue — ON CONFLICT and IF NOT EXISTS handle most cases
        if (!err.message?.includes('already exists') && !err.message?.includes('duplicate')) {
          console.warn(`Seed statement warning: ${err.message?.slice(0, 120)}`);
        }
        skipped++;
      }
    }

    console.log(`Database seeded: ${success} executed, ${skipped} skipped`);
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
