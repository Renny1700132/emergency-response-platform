import assert from 'node:assert/strict';
import test from 'node:test';
import { createEventWorkflow } from '../../backend/src/event-workflow.mjs';

test('event workflow enforces verify, idempotent start, task feedback and closure rules', async () => {
  const published = [];
  const workflow = createEventWorkflow({ now: () => '2026-09-23T10:00:00.000Z', emit: async (event) => published.push(event) });
  const input = { incidentTypeCode: 'FIRE', title: 'Smoke', description: 'Observed', occurredAt: '2026-09-23T09:59:00.000Z' };
  const incident = await workflow.createIncident(input, 'reporter', 'key-0001');
  assert.equal((await workflow.createIncident(input, 'reporter', 'key-0001')).id, incident.id);
  await assert.rejects(() => workflow.startResponse(incident.id, { id: 'plan-v1' }, [{ name: 'Evacuate', assigneeRef: 'u1' }], incident.version, 'commander'), /not verified/);
  const verified = await workflow.verify(incident.id, 'CONFIRMED', 'confirmed', incident.version, 'verifier');
  const started = await workflow.startResponse(incident.id, { id: 'plan-v1' }, [{ name: 'Evacuate', assigneeRef: 'u1', deadlineAt: '2026-09-23T10:05:00.000Z' }], verified.version, 'commander');
  const task = started.tasks[0];
  await assert.rejects(() => workflow.acknowledgeTask(task.id, 'received', task.version, 'other'), /another actor/);
  const acknowledged = await workflow.acknowledgeTask(task.id, 'received', task.version, 'u1');
  const progressed = await workflow.feedback(task.id, { content: 'on site', resourceVersion: acknowledged.version }, 'u1');
  await assert.rejects(() => workflow.close(incident.id, { conclusion: 'safe', reportRef: 'report-1' }, started.incident.version, 'commander'), /all response tasks/);
  await workflow.completeTask(task.id, 'done', progressed.version, 'u1');
  assert.equal((await workflow.close(incident.id, { conclusion: 'safe', reportRef: 'report-1' }, started.incident.version, 'commander')).status, 'CLOSED');
  assert.equal(published.filter((event) => event.eventType === 'RESPONSE_STARTED').length, 1);
});

test('message failure keeps business tasks and marks manual review', async () => {
  const workflow = createEventWorkflow({ notifyTask: async () => { throw Object.assign(new Error('timeout'), { code: 'MESSAGE_TIMEOUT' }); } });
  const incident = await workflow.createIncident(
    { incidentTypeCode: 'FIRE', title: 'Smoke', description: 'Observed', occurredAt: new Date().toISOString() },
    'reporter',
    'key-0002'
  );
  const verified = await workflow.verify(incident.id, 'CONFIRMED', 'confirmed', incident.version, 'verifier');
  const started = await workflow.startResponse(
    incident.id,
    { id: 'plan-v1' },
    [{ name: 'Evacuate', assigneeRef: 'u1', deadlineAt: new Date().toISOString() }],
    verified.version,
    'commander'
  );
  assert.equal(started.tasks[0].deliveryStatus, 'MANUAL_REVIEW');
  assert.equal(started.tasks[0].deliveryError, 'MESSAGE_TIMEOUT');
});
