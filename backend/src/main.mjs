import { createDatabase } from './database.mjs';
import { loadConfig } from './config.mjs';
import { createServer } from './server.mjs';

export function createApplication({ environment = process.env, logger = console } = {}) {
  const config = loadConfig(environment);
  const database = createDatabase(config);
  const server = createServer({ config, database, logger });
  return Object.freeze({ config, database, server });
}

export function startApplication({ environment = process.env, logger = console } = {}) {
  const application = createApplication({ environment, logger });
  application.server.listen(application.config.port, () => logger.info(JSON.stringify({ event: 'server.started', port: application.config.port, mode: application.config.mode })));
  return application;
}

if (process.argv[1] && new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href === import.meta.url) {
  const application = startApplication();
  const shutdown = (signal) => {
    console.info(JSON.stringify({ event: 'server.stopping', signal }));
    application.server.close(async () => { await application.database?.close(); process.exit(0); });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}
