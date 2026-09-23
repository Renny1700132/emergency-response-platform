import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const direction = process.argv[2] ?? 'up';
if (!['up', 'down'].includes(direction)) throw new Error('usage: node backend/scripts/migrate.mjs <up|down>');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for migrations');
const migrationDir = path.resolve('backend/migrations');
const suffix = `.${direction}.sql`;
const files = (await readdir(migrationDir)).filter((file) => file.endsWith(suffix)).sort();
const idFrom = (file) => file.replace(/\.(up|down)\.sql$/, '');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_id text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const applied = new Set((await pool.query('SELECT migration_id FROM schema_migrations')).rows.map((row) => row.migration_id));
  const ordered = direction === 'up'
    ? files.filter((file) => !applied.has(idFrom(file)))
    : files.filter((file) => applied.has(idFrom(file))).reverse();
  for (const file of ordered) {
    const migrationId = idFrom(file);
    const sql = await readFile(path.join(migrationDir, file), 'utf8');
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      if (direction === 'up') await pool.query('INSERT INTO schema_migrations (migration_id) VALUES ($1)', [migrationId]);
      else await pool.query('DELETE FROM schema_migrations WHERE migration_id = $1', [migrationId]);
      await pool.query('COMMIT');
      console.info(JSON.stringify({ migration: file, direction, status: 'applied' }));
    }
    catch (error) { await pool.query('ROLLBACK'); throw error; }
  }
} finally { await pool.end(); }
