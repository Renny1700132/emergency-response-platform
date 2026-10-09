import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createDatabase } from './database.mjs';
import { loadConfig } from './config.mjs';
import { createServer } from './server.mjs';
import { createMessagePort } from './message-port.mjs';
import { createMiddlePlatformPort } from './middle-platform-port.mjs';
import { createExternalAdapters } from './external-adapters.mjs';
import { createSprint2Persistence } from './sprint2-persistence.mjs';
import { createSprint2Service } from './sprint2-service.mjs';

export function createApplication({ environment = process.env, logger = console } = {}) {
  const config = loadConfig(environment);
  const database = createDatabase(config);
  const messagePort = config.simulatedIntegrationBaseUrl
    ? createMessagePort({ baseUrl: config.simulatedIntegrationBaseUrl, timeoutMs: config.requestTimeoutMs, scenario: config.simulatedMessageScenario })
    : null;
  const middlePlatformPort = config.middlePlatformBaseUrl
    ? createMiddlePlatformPort({
      baseUrl: config.middlePlatformBaseUrl,
      identityPath: config.middlePlatformIdentityPath,
      filePresignPath: config.middlePlatformFilePresignPath,
      timeoutMs: config.requestTimeoutMs
    })
    : null;
  const sprint2Persistence = createSprint2Persistence(database);
  const externalAdapters = config.simulatedIntegrationBaseUrl
    ? createExternalAdapters({
      baseUrl: config.simulatedIntegrationBaseUrl,
      timeoutMs: config.requestTimeoutMs,
      callLog: (record) => sprint2Persistence.save?.('externalCall', { id: randomUUID(), ...record })
    })
    : null;
  const sprint2Service = createSprint2Service({ persistence: sprint2Persistence, adapters: externalAdapters });
  const server = createServer({
    config, database, logger, messagePort,
    identityProvider: middlePlatformPort,
    filePort: middlePlatformPort,
    sprint2Service
  });
  return Object.freeze({ config, database, server });
}

export function startApplication({ environment = process.env, logger = console } = {}) {
  const application = createApplication({ environment, logger });
  application.server.listen(application.config.port, () => logger.info(JSON.stringify({ event: 'server.started', port: application.config.port, mode: application.config.mode })));
  return application;
}

export function isMainModule(metaUrl, { argv1 = process.argv[1], cwd = process.cwd() } = {}) {
  return Boolean(argv1) && pathToFileURL(resolve(cwd, argv1)).href === metaUrl;
}

if (isMainModule(import.meta.url)) {
  const application = startApplication();
  const shutdown = (signal) => {
    console.info(JSON.stringify({ event: 'server.stopping', signal }));
    application.server.close(async () => { await application.database?.close(); process.exit(0); });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}
