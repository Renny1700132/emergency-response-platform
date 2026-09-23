import pg from 'pg';

export function createDatabase(config, Pool = pg.Pool) {
  if (!config.databaseUrl) return null;
  const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });
  return Object.freeze({
    async query(text, parameters = []) { return pool.query(text, parameters); },
    async healthcheck() { await pool.query('SELECT 1'); return true; },
    async close() { await pool.end(); }
  });
}
