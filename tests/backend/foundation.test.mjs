import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadConfig } from '../../backend/src/config.mjs';
import { createAuditRecord, createAuditSink, redact } from '../../backend/src/audit.mjs';
import { createDatabase } from '../../backend/src/database.mjs';
import { requireRole, resolveIdentity } from '../../backend/src/identity.mjs';
import { createApplication, startApplication } from '../../backend/src/main.mjs';
import { createServer } from '../../backend/src/server.mjs';

async function request(server, path, headers = {}) {
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { headers });
  return { status: response.status, body: await response.json(), headers: response.headers };
}

test('production configuration requires database and middle-platform endpoints', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /DATABASE_URL, MIDDLE_PLATFORM_BASE_URL/);
  assert.throws(() => loadConfig({ PORT: '0' }), /PORT must be an integer/);
  assert.equal(loadConfig({ PORT: '3001' }).port, 3001);
});

test('audit redacts credentials and keeps traceability fields', async () => {
  const record = createAuditRecord({ traceId: 'trace-1', actorId: 'u-1', action: 'identity.read', outcome: 'allowed', details: { token: 'never-log-me', nested: { password: 'never-log-me' } } });
  assert.equal(record.details.token, '[REDACTED]');
  assert.equal(record.details.nested.password, '[REDACTED]');
  assert.equal(redact({ authorization: 'Bearer no' }).authorization, '[REDACTED]');

  const writes = [];
  const sink = createAuditSink({ database: { query: async (...args) => writes.push(args) }, logger: { info() {} } });
  await sink.record(record);
  assert.match(writes[0][0], /INSERT INTO em_audit_log/);
  assert.equal(writes[0][1][6], JSON.stringify(record.details));
});

test('identity and database adapters retain their infrastructure boundary', async () => {
  const config = loadConfig({ NODE_ENV: 'development', ALLOW_DEVELOPMENT_IDENTITY_HEADERS: 'true' });
  const identity = resolveIdentity({ headers: { 'x-actor-id': 'user-1', 'x-actor-roles': 'emergency.read, emergency.write' } }, config);
  assert.equal(identity.actorId, 'user-1');
  assert.equal(requireRole(identity, 'emergency.read'), true);
  assert.equal(requireRole(identity, 'missing'), false);
  assert.equal(resolveIdentity({ headers: {} }, config), null);
  assert.equal(resolveIdentity({ headers: { 'x-actor-id': 'user-1' } }, { allowDevelopmentIdentityHeaders: false }), null);
  assert.equal(createDatabase({ databaseUrl: null }), null);

  const calls = [];
  class FakePool {
    constructor(options) { calls.push(['create', options]); }
    async query(...args) { calls.push(['query', args]); return { rows: [] }; }
    async end() { calls.push(['end']); }
  }
  const database = createDatabase({ databaseUrl: 'postgres://test' }, FakePool);
  await database.query('SELECT $1', ['value']);
  await database.healthcheck();
  await database.close();
  assert.deepEqual(calls.map(([name]) => name), ['create', 'query', 'query', 'end']);
});

test('health, readiness and minimal authorization return controlled responses', async (t) => {
  const records = [];
  const logger = { info: (line) => records.push(JSON.parse(line)) };
  const config = loadConfig({ NODE_ENV: 'development', ALLOW_DEVELOPMENT_IDENTITY_HEADERS: 'true' });
  const server = createServer({ config, logger });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const health = await request(server, '/healthz');
  assert.equal(health.status, 200);
  assert.equal(health.body.status, 'ok');
  assert.ok(health.headers.get('x-trace-id'));

  const ready = await request(server, '/readyz');
  assert.equal(ready.status, 503);
  assert.equal(ready.body.reason, 'database-not-configured');

  const denied = await request(server, '/api/v1/_internal/whoami');
  assert.equal(denied.status, 403);
  const allowed = await request(server, '/api/v1/_internal/whoami', { 'x-actor-id': 'b-user', 'x-actor-roles': 'emergency.read' });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.body.actorId, 'b-user');
  const missing = await request(server, '/unknown', { 'x-trace-id': 'fixed-trace' });
  assert.equal(missing.status, 404);
  assert.equal(missing.body.traceId, 'fixed-trace');
  assert.deepEqual(records.map((record) => record.outcome), ['denied', 'allowed']);
});

test('readiness and application bootstrap cover available and unavailable database states', async (t) => {
  const config = loadConfig({ NODE_ENV: 'development' });
  for (const [database, expected] of [
    [{ async healthcheck() {} }, 200],
    [{ async healthcheck() { throw new Error('offline'); } }, 503]
  ]) {
    const server = createServer({ config, database, logger: { info() {} } });
    await new Promise((resolve) => server.listen(0, resolve));
    const ready = await request(server, '/readyz');
    assert.equal(ready.status, expected);
    await new Promise((resolve) => server.close(resolve));
  }

  const application = createApplication({ environment: { NODE_ENV: 'development', PORT: '3010' }, logger: { info() {} } });
  assert.equal(application.config.port, 3010);
  const started = startApplication({ environment: { NODE_ENV: 'development', PORT: '3011' }, logger: { info() {} } });
  t.after(() => started.server.close());
  await new Promise((resolve) => started.server.once('listening', resolve));
  assert.ok(started.server.address().port > 0);
});

test('foundation migration has an auditable paired rollback and compose keeps credentials external', async () => {
  await access(new URL('../../backend/migrations/001_foundation.up.sql', import.meta.url));
  await access(new URL('../../backend/migrations/001_foundation.down.sql', import.meta.url));
  const down = await readFile(new URL('../../backend/migrations/001_foundation.down.sql', import.meta.url), 'utf8');
  const compose = await readFile(new URL('../../compose.yaml', import.meta.url), 'utf8');
  assert.match(down, /DROP TABLE IF EXISTS em_outbox_event/);
  assert.match(down, /DROP TABLE IF EXISTS em_idempotency_record/);
  assert.match(down, /DROP TABLE IF EXISTS em_audit_log/);
  assert.match(compose, /^\s*POSTGRES_PASSWORD:\s*\$\{POSTGRES_PASSWORD/m);
});
