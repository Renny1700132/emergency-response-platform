import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../../backend/src/config.mjs';
import { createEventPersistence } from '../../backend/src/event-persistence.mjs';
import { createMessagePort } from '../../backend/src/message-port.mjs';
import { createIdempotencyGuard } from '../../backend/src/idempotency.mjs';
import { createServer } from '../../backend/src/server.mjs';

const auth = {
  'content-type': 'application/json',
  'x-actor-id': 'commander',
  'x-actor-roles': 'emergency.write,emergency.read',
  'x-idempotency-key': 'idem-00000001'
};

async function post(server, path, body, headers = auth) {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

async function get(server, path, headers = auth) {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { headers });
  return { status: response.status, body: await response.json() };
}

test('HTTP core incident path covers authorization, idempotency, tasks and closure', async (t) => {
  const config = loadConfig({ NODE_ENV: 'development', ALLOW_DEVELOPMENT_IDENTITY_HEADERS: 'true' });
  const planProvider = { async loadPublishedPlan() {
    return { id: 'plan-v1', templates: [{ name: 'Evacuate', assigneeRef: 'commander', deadlineAt: '2026-09-24T11:00:00Z' }] };
  } };
  const messagePort = { async sendTask() { return { status: 'ACCEPTED', marker: 'SIMULATED_EVIDENCE' }; } };
  const server = createServer({ config, logger: { info() {} }, planProvider, messagePort });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  assert.equal((await post(server, '/api/v1/incidents', {}, {})).status, 403);
  const incidentInput = { incidentTypeCode: 'FIRE', title: 'Smoke', description: 'Observed', occurredAt: '2026-09-24T10:00:00Z' };
  const created = await post(server, '/api/v1/incidents', incidentInput);
  assert.equal(created.status, 200);
  assert.equal(created.body.message, 'success');
  assert.ok(created.body.timestamp);
  assert.ok(created.body.traceId);
  const replayed = await post(server, '/api/v1/incidents', incidentInput);
  assert.equal(replayed.body.data.id, created.body.data.id);
  assert.equal((await post(server, '/api/v1/incidents', { ...incidentInput, title: 'Different' })).status, 409);
  const incidentId = created.body.data.id;
  assert.equal((await post(server, `/api/v1/incidents/${incidentId}/verify`, { decision: 'CONFIRMED', reason: 'confirmed' })).status, 422);
  const verified = await post(server, `/api/v1/incidents/${incidentId}/verify`, { decision: 'CONFIRMED', reason: 'confirmed', resourceVersion: 1 });
  assert.equal(verified.status, 200);
  assert.equal((await post(server, `/api/v1/incidents/${incidentId}/start-response`, { planVersionId: 'plan-v1', resourceVersion: 1 })).status, 409);
  const started = await post(server, `/api/v1/incidents/${incidentId}/start-response`, { planVersionId: 'plan-v1', resourceVersion: 2 });
  assert.equal(started.body.data.tasks[0].deliveryStatus, 'ACCEPTED');
  const taskId = started.body.data.tasks[0].id;
  assert.equal((await post(server, `/api/v1/tasks/${taskId}/acknowledge`, { reason: 'received' })).status, 422);
  const acknowledged = await post(server, `/api/v1/tasks/${taskId}/acknowledge`, { reason: 'received', resourceVersion: 1 });
  assert.equal(acknowledged.status, 200);
  const feedbackBody = { content: 'on site', progressPercent: 50, attachmentFileIds: ['file-ref-1'], resourceVersion: 2 };
  const feedbackResult = await post(server, `/api/v1/tasks/${taskId}/feedback`, feedbackBody);
  assert.equal(feedbackResult.status, 200);
  assert.deepEqual(feedbackResult.body.data.feedback[0].attachmentFileIds, ['file-ref-1']);
  const completed = await post(server, `/api/v1/tasks/${taskId}/complete`, { reason: 'done', resourceVersion: 3 });
  assert.equal(completed.status, 200);
  const closed = await post(server, `/api/v1/incidents/${incidentId}/close`, { reason: 'safe', resourceVersion: 3, attributes: { reportRef: 'report-1' } });
  assert.equal(closed.body.data.status, 'CLOSED');
});

test('Bearer identity connects the real page routes without development headers', async (t) => {
  const config = loadConfig({ NODE_ENV: 'development' });
  const bearerHeaders = {
    authorization: 'Bearer valid-platform-token',
    'content-type': 'application/json',
    'x-idempotency-key': 'bearer-idem-0001'
  };
  const calls = [];
  const identityProvider = { async resolveBearer(token) {
    calls.push(token);
    if (token !== 'valid-platform-token') return null;
    return {
      actorId: 'commander', displayName: '值班指挥员', roles: ['emergency.read', 'emergency.write'],
      permissions: ['task:create', 'task:acknowledge', 'task:feedback', 'task:complete', 'task:remind']
    };
  } };
  const filePort = { async presignFile(token, body) {
    assert.equal(token, 'valid-platform-token');
    return { id: 'file-1', attributes: { fileId: 'file-1', uploadUrl: `https://upload.invalid/${encodeURIComponent(body.fileName)}` } };
  } };
  const planProvider = { async loadPublishedPlan() {
    return { id: 'plan-v1', templates: [{ name: 'Evacuate', assigneeRef: 'commander', deadlineAt: '2026-09-25T11:00:00Z' }] };
  } };
  const messagePort = { async sendTask() { return { status: 'ACCEPTED', marker: 'SIMULATED_EVIDENCE' }; } };
  const server = createServer({ config, logger: { info() {} }, identityProvider, filePort, planProvider, messagePort });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const context = await get(server, '/api/v1/platform/context', bearerHeaders);
  assert.equal(context.status, 200);
  assert.equal(context.body.data.userId, 'commander');
  assert.ok(context.body.data.permissions.includes('task:create'));
  assert.equal((await get(server, '/api/v1/incidents?page=1&size=50', bearerHeaders)).status, 200);
  assert.equal((await get(server, '/api/v1/tasks?page=1&size=50', bearerHeaders)).status, 200);

  const incident = await post(server, '/api/v1/incidents', {
    incidentTypeCode: 'FIRE', title: 'Bearer incident', description: 'Observed', occurredAt: '2026-09-25T10:00:00Z'
  }, bearerHeaders);
  const incidentId = incident.body.data.id;
  assert.equal((await get(server, `/api/v1/incidents/${incidentId}`, bearerHeaders)).body.data.id, incidentId);
  await post(server, `/api/v1/incidents/${incidentId}/verify`, { decision: 'CONFIRMED', reason: 'confirmed', resourceVersion: 1 }, bearerHeaders);
  await post(server, `/api/v1/incidents/${incidentId}/start-response`, { planVersionId: 'plan-v1', resourceVersion: 2 }, bearerHeaders);

  const temporary = await post(server, '/api/v1/tasks', {
    name: 'Temporary patrol', assigneeRef: 'commander', deadlineAt: '2026-09-25T12:00:00Z', description: 'Check exit'
  }, bearerHeaders);
  assert.equal(temporary.status, 200);
  assert.equal(temporary.body.data.incidentId, incidentId);
  const reminded = await post(server, `/api/v1/tasks/${temporary.body.data.id}/remind`, {
    reason: 'Please report', resourceVersion: 1
  }, bearerHeaders);
  assert.equal(reminded.status, 200);
  const listed = await get(server, '/api/v1/tasks?page=1&size=50', bearerHeaders);
  assert.equal(listed.body.data.total, 2);

  const presigned = await post(server, '/api/v1/platform/files/presign', {
    fileName: 'photo.jpg', contentType: 'image/jpeg', size: 128
  }, bearerHeaders);
  assert.equal(presigned.status, 200);
  assert.equal(presigned.body.data.attributes.fileId, 'file-1');
  assert.ok(calls.length >= 1);
  assert.equal((await get(server, '/api/v1/incidents', { authorization: 'Bearer invalid' })).status, 403);
});

test('persistence uses parameterized SQL and message port maps failure and timeout', async () => {
  const calls = [];
  const persistence = createEventPersistence({ async query(sql, parameters) {
    calls.push({ sql, parameters });
    if (sql.includes('SELECT id FROM em_plan_version')) return { rows: [{ id: 'plan-v1' }] };
    if (sql.includes('FROM em_task_template')) return { rows: [{ name: 'Task', assigneeRef: 'u1', deadlineMinutes: 5 }] };
    return { rows: [] };
  } });
  const plan = await persistence.loadPublishedPlan('plan-v1');
  assert.equal(plan.templates.length, 1);
  await persistence.persistIncident({ id: 'i1', incidentTypeCode: 'FIRE', title: 'x', description: 'y', status: 'VERIFIED', occurredAt: new Date().toISOString(), version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  assert.equal(calls.every((call) => Array.isArray(call.parameters)), true);

  const guardRows = new Map();
  const guard = createIdempotencyGuard({ async query(sql, parameters) {
    if (sql.startsWith('SELECT')) return { rows: guardRows.has(parameters.join(':')) ? [guardRows.get(parameters.join(':'))] : [] };
    guardRows.set(`${parameters[0]}:${parameters[1]}`, { requestHash: parameters[2], responseBody: JSON.parse(parameters[3]) });
    return { rows: [] };
  } });
  assert.deepEqual(await guard.run('scope', 'key', { a: 1 }, async () => ({ value: 1 })), { value: 1 });
  assert.deepEqual(await guard.run('scope', 'key', { a: 1 }, async () => ({ value: 2 })), { value: 1 });
  await assert.rejects(() => guard.run('scope', 'key', { a: 2 }, async () => ({})), (error) => error.code === 'IDEMPOTENCY_CONFLICT');

  const failed = createMessagePort({ baseUrl: 'http://sim', fetcher: async () => new Response(JSON.stringify({ code: 'SIM-MESSAGE-FAILED' }), { status: 503, headers: { 'content-type': 'application/json' } }) });
  await assert.rejects(() => failed.sendTask({ id: 't1', assigneeRef: 'u1' }), (error) => error.code === 'SIM-MESSAGE-FAILED');
  const timed = createMessagePort({ baseUrl: 'http://sim', timeoutMs: 5, fetcher: async (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')))) });
  await assert.rejects(() => timed.sendTask({ id: 't1', assigneeRef: 'u1' }), (error) => error.code === 'MESSAGE_TIMEOUT');
});
