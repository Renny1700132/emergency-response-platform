import { createDatabase } from './database.mjs';
import { loadConfig } from './config.mjs';
import { createServer } from './server.mjs';

const config = loadConfig();
const database = createDatabase(config);
const server = createServer({ config, database });
server.listen(config.port, () => console.info(JSON.stringify({ event: 'server.started', port: config.port, mode: config.mode })));

async function shutdown(signal) {
  console.info(JSON.stringify({ event: 'server.stopping', signal }));
  server.close(async () => { await database?.close(); process.exit(0); });
}
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
