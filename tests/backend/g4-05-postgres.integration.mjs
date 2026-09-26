import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../../backend/src/config.mjs';
import { createDatabase } from '../../backend/src/database.mjs';
import { createServer } from '../../backend/src/server.mjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for G4-05 PostgreSQL integration verification');

const auth = {
  'content-type': 'application/json',
  'x-actor-id': 'commander',
  'x-actor-roles': 'emergency.write,emergency.read'
};

async function post(server, path, body, key) {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST', headers: { ...auth, 'x-idempotency-key': key }, body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

async function get(server, path) {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { headers: auth });
  return { status: response.status, body: await response.json() };
}

async function withServer(database, action, messagePort = { async sendTask() { return { status: 'ACCEPTED', marker: 'SIMULATED_EVIDENCE' }; } }) {
  const config = loadConfig({ NODE_ENV: 'development', ALLOW_DEVELOPMENT_IDENTITY_HEADERS: 'true' });
  const server = createServer({ config, database, logger: { info() {} }, messagePort });
  await new Promise((resolve) => server.listen(0, resolve));
  try { return await action(server); } finally { await new Promise((resolve) => server.close(resolve)); }
}

test('PostgreSQL remains the fact source across service restarts and commits domain evidence atomically', async (t) => {
  const database = createDatabase({ databaseUrl });
  t.after(() => database.close());
  await database.query('TRUNCATE em_message_delivery, em_incident_closure, em_task_feedback, em_task_assignment_history, em_response_task, em_verification_action, em_incident, em_task_template, em_plan_version, em_outbox_event, em_audit_log, em_idempotency_record CASCADE');
  await database.query(`INSERT INTO em_plan_version (id,status,version_label,published_at) VALUES ('plan-v1','PUBLISHED','v1',now())`);
  await database.query(`INSERT INTO em_task_template (plan_version_id,sequence_no,name,assignee_ref,deadline_minutes) VALUES ('plan-v1',1,'Evacuate','commander',5)`);

  const created = await withServer(database, (server) => post(server, '/api/v1/incidents', {
    incidentTypeCode: 'FIRE', title: 'PostgreSQL restart proof', description: 'Observed', occurredAt: '2026-09-25T08:00:00Z'
  }, 'pg-create'));
  assert.equal(created.status, 200);
  const incidentId = created.body.data.id;

  const verified = await withServer(database, (server) => post(server, `/api/v1/incidents/${incidentId}/verify`, {
    decision: 'CONFIRMED', reason: 'confirmed', resourceVersion: 1
  }, 'pg-verify'));
  assert.equal(verified.status, 200);

  const started = await withServer(database, (server) => post(server, `/api/v1/incidents/${incidentId}/start-response`, {
    planVersionId: 'plan-v1', resourceVersion: 2
  }, 'pg-start'));
  assert.equal(started.status, 200);
  const taskId = started.body.data.tasks[0].id;
  const readModels = await withServer(database, async (server) => ({
    incidents: await get(server, '/api/v1/incidents?page=1&size=50'),
    incident: await get(server, `/api/v1/incidents/${incidentId}`),
    tasks: await get(server, '/api/v1/tasks?page=1&size=50')
  }));
  assert.equal(readModels.incidents.body.data.total, 1);
  assert.equal(readModels.incident.body.data.id, incidentId);
  assert.equal(readModels.tasks.body.data.total, 1);

  const temporary = await withServer(database, (server) => post(server, '/api/v1/tasks', {
    name: 'Temporary patrol', assigneeRef: 'commander', deadlineAt: '2026-09-25T12:00:00Z'
  }, 'pg-temporary'));
  assert.equal(temporary.status, 200);
  assert.equal(temporary.body.data.incidentId, incidentId);
  const temporaryTaskId = temporary.body.data.id;
  assert.equal((await withServer(database, (server) => post(server, `/api/v1/tasks/${temporaryTaskId}/remind`, {
    reason: 'Please report', resourceVersion: 1
  }, 'pg-remind'))).status, 200);
  assert.equal((await withServer(database, (server) => post(server, `/api/v1/tasks/${temporaryTaskId}/acknowledge`, {
    reason: 'received', resourceVersion: 1
  }, 'pg-temp-ack'))).status, 200);
  assert.equal((await withServer(database, (server) => post(server, `/api/v1/tasks/${temporaryTaskId}/complete`, {
    reason: 'done', resourceVersion: 2
  }, 'pg-temp-complete'))).status, 200);

  const acknowledged = await withServer(database, (server) => post(server, `/api/v1/tasks/${taskId}/acknowledge`, {
    reason: 'received', resourceVersion: 1
  }, 'pg-ack'));
  assert.equal(acknowledged.status, 200);
  const progressed = await withServer(database, (server) => post(server, `/api/v1/tasks/${taskId}/feedback`, {
    content: 'on site', progressPercent: 50, resourceVersion: 2
  }, 'pg-feedback'));
  assert.equal(progressed.status, 200);
  const completed = await withServer(database, (server) => post(server, `/api/v1/tasks/${taskId}/complete`, {
    reason: 'done', resourceVersion: 3
  }, 'pg-complete'));
  assert.equal(completed.status, 200);
  const closed = await withServer(database, (server) => post(server, `/api/v1/incidents/${incidentId}/close`, {
    reason: 'safe', resourceVersion: 3, attributes: { reportRef: 'report-pg-1' }
  }, 'pg-close'));
  assert.equal(closed.body.data.status, 'CLOSED');

  const facts = await database.query('SELECT status, version FROM em_incident WHERE id=$1', [incidentId]);
  const task = await database.query('SELECT status, delivery_status AS "deliveryStatus" FROM em_response_task WHERE id=$1', [taskId]);
  const evidence = await database.query('SELECT (SELECT count(*) FROM em_outbox_event) AS outbox, (SELECT count(*) FROM em_audit_log) AS audit');
  assert.deepEqual(facts.rows[0], { status: 'CLOSED', version: '4' });
  assert.deepEqual(task.rows[0], { status: 'COMPLETED', deliveryStatus: 'ACCEPTED' });
  assert.ok(Number(evidence.rows[0].outbox) >= 8);
  assert.ok(Number(evidence.rows[0].audit) >= 8);
});

test('PostgreSQL transaction rolls back business fact and outbox when audit persistence fails', async (t) => {
  const database = createDatabase({ databaseUrl });
  t.after(() => database.close());
  const failingDatabase = {
    ...database,
    async transaction(action) {
      return database.transaction((tx) => action({
        async query(text, parameters = []) {
          if (/INSERT INTO em_audit_log/.test(text)) throw new Error('injected audit persistence failure');
          return tx.query(text, parameters);
        }
      }));
    }
  };
  const result = await withServer(failingDatabase, (server) => post(server, '/api/v1/incidents', {
    incidentTypeCode: 'FIRE', title: 'Rollback proof', description: 'Observed', occurredAt: '2026-09-25T08:00:00Z'
  }, 'pg-rollback'));
  assert.equal(result.status, 422);
  const rows = await database.query(`SELECT
    (SELECT count(*) FROM em_incident WHERE title='Rollback proof') AS incidents,
    (SELECT count(*) FROM em_outbox_event WHERE payload->>'sourceSystem'='MANUAL' AND aggregate_id NOT IN (SELECT id::text FROM em_incident)) AS orphan_outbox`);
  assert.deepEqual(rows.rows[0], { incidents: '0', orphan_outbox: '0' });
});
