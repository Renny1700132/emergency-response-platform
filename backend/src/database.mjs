import pg from 'pg';

export function createDatabase(config, Pool = pg.Pool) {
  if (!config.databaseUrl) return null;
  const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });
  return Object.freeze({
    async query(text, parameters = []) { return pool.query(text, parameters); },
    async transaction(action) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await action(Object.freeze({
          async query(text, parameters = []) { return client.query(text, parameters); }
        }));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async healthcheck() { await pool.query('SELECT 1'); return true; },
    async close() { await pool.end(); }
  });
}
