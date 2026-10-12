import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const direction = process.argv[2] ?? 'up';
const flags = new Map(process.argv.slice(3).map((argument) => {
  const [name, value = 'true'] = argument.split('=', 2);
  return [name, value];
}));
if (!['up', 'down'].includes(direction)) throw new Error('usage: node backend/scripts/migrate.mjs <up|down> [--steps=N] [--to=MIGRATION_ID]');
const steps = flags.has('--steps') ? Number(flags.get('--steps')) : null;
const target = flags.get('--to') ?? null;
if (steps !== null && (!Number.isSafeInteger(steps) || steps < 1)) throw new Error('--steps must be a positive integer');
if (steps !== null && target) throw new Error('--steps and --to are mutually exclusive');
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
  const applicable = direction === 'up'
    ? files.filter((file) => !applied.has(idFrom(file)))
    : files.filter((file) => applied.has(idFrom(file))).reverse();
  let ordered = applicable;
  if (target) {
    const knownTargets = new Set(files.map(idFrom));
    if (!knownTargets.has(target)) throw new Error(`unknown migration target: ${target}`);
    ordered = direction === 'up'
      ? applicable.filter((file) => idFrom(file) <= target)
      : applicable.filter((file) => idFrom(file) > target);
  }
  if (steps !== null) ordered = applicable.slice(0, steps);
  console.info(JSON.stringify({ direction, steps, target, selected: ordered.map(idFrom), status: 'planned' }));
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
