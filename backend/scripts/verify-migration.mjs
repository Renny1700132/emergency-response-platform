import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import pg from 'pg';

const execute = promisify(execFile);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for migration integration verification');

const expectedTables = ['em_audit_log', 'em_idempotency_record', 'em_outbox_event'];

async function migrate(direction) {
  await execute(process.execPath, ['backend/scripts/migrate.mjs', direction], {
    env: process.env,
    windowsHide: true
  });
}

async function tableNames(pool) {
  const result = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
    [expectedTables]
  );
  return new Set(result.rows.map((row) => row.tablename));
}

function assertTables(actual, shouldExist) {
  for (const table of expectedTables) {
    if (actual.has(table) !== shouldExist) {
      throw new Error(`migration verification expected ${table} existence=${shouldExist}`);
    }
  }
}

const pool = new pg.Pool({ connectionString: databaseUrl });
try {
  await migrate('up');
  assertTables(await tableNames(pool), true);
  await migrate('down');
  assertTables(await tableNames(pool), false);
  await migrate('up');
  assertTables(await tableNames(pool), true);
  console.info(JSON.stringify({ gate: 'migration-integration', status: 'PASS', sequence: 'up-down-up', tables: expectedTables }));
} finally {
  await pool.end();
}
