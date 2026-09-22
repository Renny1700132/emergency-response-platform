import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadConfig } from '../../backend/src/config.mjs';
import { createAuditRecord, redact } from '../../backend/src/audit.mjs';
import { createServer } from '../../backend/src/server.mjs';

async function request(server, path, headers = {}) {
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { headers });
  return { status: response.status, body: await response.json(), headers: response.headers };
}

test('production configuration requires database and middle-platform endpoints', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /DATABASE_URL, MIDDLE_PLATFORM_BASE_URL/);
});

test('audit redacts credentials and keeps traceability fields', () => {
  const record = createAuditRecord({ traceId: 'trace-1', actorId: 'u-1', action: 'identity.read', outcome: 'allowed', details: { token: 'never-log-me', nested: { password: 'never-log-me' } } });
  assert.equal(record.details.token, '[REDACTED]');
  assert.equal(record.details.nested.password, '[REDACTED]');
  assert.equal(redact({ authorization: 'Bearer no' }).authorization, '[REDACTED]');
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
  assert.deepEqual(records.map((record) => record.outcome), ['denied', 'allowed']);
});

test('foundation migration has an auditable paired rollback and compose keeps credentials external', async () => {
  await access(new URL('../../backend/migrations/001_foundation.up.sql', import.meta.url));
  await access(new URL('../../backend/migrations/001_foundation.down.sql', import.meta.url));
  const down = await readFile(new URL('../../backend/migrations/001_foundation.down.sql', import.meta.url), 'utf8');
  const compose = await readFile(new URL('../../compose.yaml', import.meta.url), 'utf8');
  assert.match(down, /DROP TABLE IF EXISTS outbox_messages/);
  assert.match(compose, /^\s*POSTGRES_PASSWORD:\s*\$\{POSTGRES_PASSWORD/m);
});
