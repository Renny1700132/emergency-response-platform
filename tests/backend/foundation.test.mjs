import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadConfig } from '../../backend/src/config.mjs';
import { createAuditRecord, createAuditSink, redact } from '../../backend/src/audit.mjs';
import { createDatabase } from '../../backend/src/database.mjs';
import { requireRole, resolveIdentity } from '../../backend/src/identity.mjs';
import { createApplication, startApplication } from '../../backend/src/main.mjs';
import { createServer } from '../../backend/src/server.mjs';
import { createMiddlePlatformPort } from '../../backend/src/middle-platform-port.mjs';

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
  const identity = await resolveIdentity({ headers: { 'x-actor-id': 'user-1', 'x-actor-roles': 'emergency.read, emergency.write' } }, config);
  assert.equal(identity.actorId, 'user-1');
  assert.equal(requireRole(identity, 'emergency.read'), true);
  assert.equal(requireRole(identity, 'missing'), false);
  assert.equal(await resolveIdentity({ headers: {} }, config), null);
  assert.equal(await resolveIdentity({ headers: { 'x-actor-id': 'user-1' } }, { allowDevelopmentIdentityHeaders: false }), null);
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

test('middle-platform bearer adapter validates identity and forwards file requests', async () => {
  const calls = [];
  const port = createMiddlePlatformPort({
    baseUrl: 'https://middle.invalid/root/', timeoutMs: 50,
    fetcher: async (url, options) => {
      calls.push({ url: String(url), options });
      if (String(url).endsWith('/api/v1/platform/context')) {
        return new Response(JSON.stringify({ data: {
          userId: 'user-2', displayName: 'User Two', roles: ['emergency.read'], permissions: ['task:feedback']
        } }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ data: { id: 'file-2', attributes: { fileId: 'file-2', uploadUrl: 'https://upload.invalid/file-2' } } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
  });
  const identity = await port.resolveBearer('secret-token', { traceId: 'trace-2' });
  assert.equal(identity.actorId, 'user-2');
  assert.ok(identity.permissions.includes('task:feedback'));
  const file = await port.presignFile('secret-token', { fileName: 'a.jpg' }, { traceId: 'trace-3' });
  assert.equal(file.attributes.fileId, 'file-2');
  assert.equal(calls[0].options.headers.authorization, 'Bearer secret-token');
  assert.equal(calls[1].options.method, 'POST');
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
  const workflowUp = await readFile(new URL('../../backend/migrations/002_event_workflow.up.sql', import.meta.url), 'utf8');
  const workflowDown = await readFile(new URL('../../backend/migrations/002_event_workflow.down.sql', import.meta.url), 'utf8');
  for (const table of ['em_plan_version', 'em_task_template', 'em_incident', 'em_verification_action', 'em_response_task',
    'em_task_assignment_history', 'em_task_feedback', 'em_incident_closure', 'em_message_delivery']) {
    assert.match(workflowUp, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
    assert.match(workflowDown, new RegExp(`DROP TABLE IF EXISTS ${table}`));
  }
});

test('database transaction commits success and rolls back failure', async () => {
  const calls = [];
  const client = {
    async query(text, parameters = []) { calls.push([text, parameters]); return { rows: [], rowCount: 1 }; },
    release() { calls.push(['RELEASE']); }
  };
  class TransactionPool {
    async query() { return { rows: [] }; }
    async connect() { calls.push(['CONNECT']); return client; }
    async end() {}
  }
  const database = createDatabase({ databaseUrl: 'postgres://test' }, TransactionPool);
  await database.transaction(async (tx) => tx.query('INSERT INTO sample(value) VALUES ($1)', ['ok']));
  assert.deepEqual(calls.map(([name]) => name), ['CONNECT', 'BEGIN', 'INSERT INTO sample(value) VALUES ($1)', 'COMMIT', 'RELEASE']);

  calls.length = 0;
  await assert.rejects(() => database.transaction(async (tx) => {
    await tx.query('INSERT INTO sample(value) VALUES ($1)', ['fail']);
    throw new Error('injected failure');
  }), /injected failure/);
  assert.deepEqual(calls.map(([name]) => name), ['CONNECT', 'BEGIN', 'INSERT INTO sample(value) VALUES ($1)', 'ROLLBACK', 'RELEASE']);
});
