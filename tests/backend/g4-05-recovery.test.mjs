import assert from 'node:assert/strict';
import test from 'node:test';
import { createEventWorkflow } from '../../backend/src/event-workflow.mjs';

function createTransactionalRepository() {
  let state = {
    incidents: new Map(), tasks: new Map(), verifications: [], feedback: [], closures: [], deliveries: [], outbox: [], audit: []
  };
  let failAt = null;

  function store(draft) {
    return {
      async loadIncident(id) { return structuredClone(draft.incidents.get(id) ?? null); },
      async loadTask(id) { return structuredClone(draft.tasks.get(id) ?? null); },
      async loadTasksByIncident(id) {
        return structuredClone([...draft.tasks.values()].filter((task) => task.incidentId === id));
      },
      async persistIncident(incident, expectedVersion) {
        const current = draft.incidents.get(incident.id);
        if (expectedVersion === 0 && current) throw Object.assign(new Error('duplicate incident'), { code: 'VERSION_CONFLICT' });
        if (expectedVersion > 0 && current?.version !== expectedVersion) throw Object.assign(new Error('incident version conflict'), { code: 'VERSION_CONFLICT' });
        draft.incidents.set(incident.id, structuredClone(incident));
      },
      async persistVerification(_incidentId, value) { draft.verifications.push(structuredClone(value)); },
      async persistTask(task, expectedVersion) {
        const current = draft.tasks.get(task.id);
        if (expectedVersion === 0 && current) throw Object.assign(new Error('duplicate task'), { code: 'VERSION_CONFLICT' });
        if (expectedVersion > 0 && current?.version !== expectedVersion) throw Object.assign(new Error('task version conflict'), { code: 'VERSION_CONFLICT' });
        draft.tasks.set(task.id, structuredClone(task));
      },
      async persistFeedback(_task, value) { draft.feedback.push(structuredClone(value)); },
      async persistClosure(_incidentId, value) { draft.closures.push(structuredClone(value)); },
      async persistDelivery(_task, value) { draft.deliveries.push(structuredClone(value)); },
      async persistOutbox(value) {
        draft.outbox.push(structuredClone(value));
        if (failAt === 'outbox') throw new Error('injected outbox failure');
      },
      async persistAudit(value) {
        draft.audit.push(structuredClone(value));
        if (failAt === 'audit') throw new Error('injected audit failure');
      }
    };
  }

  return {
    async transaction(action) {
      const draft = structuredClone(state);
      const result = await action(store(draft));
      state = draft;
      return result;
    },
    failAt(value) { failAt = value; },
    snapshot() { return structuredClone(state); }
  };
}

function workflow(repository, notifyTask = async () => ({ status: 'ACCEPTED', marker: 'SIMULATED_EVIDENCE' })) {
  return createEventWorkflow({
    repository,
    notifyTask,
    emit: async (event, actorId, writer) => {
      await writer.persistOutbox({ ...event, traceId: event.aggregateId });
      await writer.persistAudit({ traceId: event.aggregateId, actorId, action: event.eventType, outcome: 'allowed', targetType: event.aggregateType, targetId: event.aggregateId, details: event.payload });
    }
  });
}

test('database-backed aggregate survives service recreation through the full closure path', async () => {
  const repository = createTransactionalRepository();
  const created = await workflow(repository).createIncident(
    { incidentTypeCode: 'FIRE', title: 'Smoke', description: 'Observed', occurredAt: '2026-09-25T08:00:00Z' },
    'commander', 'restart-key'
  );
  const verified = await workflow(repository).verify(created.id, 'CONFIRMED', 'confirmed', 1, 'commander');
  const started = await workflow(repository).startResponse(
    created.id, { id: 'plan-v1' }, [{ name: 'Evacuate', assigneeRef: 'commander', deadlineAt: '2026-09-25T08:05:00Z' }],
    verified.version, 'commander'
  );
  const taskId = started.tasks[0].id;
  const acknowledged = await workflow(repository).acknowledgeTask(taskId, 'received', 1, 'commander');
  const progressed = await workflow(repository).feedback(taskId, { content: 'on site', resourceVersion: acknowledged.version }, 'commander');
  await workflow(repository).completeTask(taskId, 'done', progressed.version, 'commander');
  const closed = await workflow(repository).close(created.id, { conclusion: 'safe', reportRef: 'report-1' }, started.incident.version, 'commander');
  assert.equal(closed.status, 'CLOSED');
  assert.equal(repository.snapshot().tasks.get(taskId).status, 'COMPLETED');
});

test('business fact, outbox and audit roll back together on injected failure', async () => {
  for (const failure of ['outbox', 'audit']) {
    const repository = createTransactionalRepository();
    repository.failAt(failure);
    await assert.rejects(() => workflow(repository).createIncident(
      { incidentTypeCode: 'FIRE', title: 'Smoke', description: 'Observed', occurredAt: '2026-09-25T08:00:00Z' },
      'commander', `rollback-${failure}`
    ), new RegExp(`injected ${failure} failure`));
    const snapshot = repository.snapshot();
    assert.equal(snapshot.incidents.size, 0);
    assert.equal(snapshot.outbox.length, 0);
    assert.equal(snapshot.audit.length, 0);
  }
});

test('message dispatch occurs after commit and failure remains recoverable', async () => {
  const repository = createTransactionalRepository();
  const created = await workflow(repository).createIncident(
    { incidentTypeCode: 'FIRE', title: 'Smoke', description: 'Observed', occurredAt: '2026-09-25T08:00:00Z' },
    'commander', 'delivery-key'
  );
  const verified = await workflow(repository).verify(created.id, 'CONFIRMED', 'confirmed', 1, 'commander');
  let committedBeforeDispatch = false;
  const failing = workflow(repository, async (task) => {
    const snapshot = repository.snapshot();
    committedBeforeDispatch = snapshot.incidents.get(created.id)?.status === 'RESPONDING' && snapshot.tasks.has(task.id)
      && snapshot.outbox.some((event) => event.eventType === 'TASK_DISPATCH_REQUESTED');
    throw Object.assign(new Error('timeout'), { code: 'MESSAGE_TIMEOUT' });
  });
  const started = await failing.startResponse(
    created.id, { id: 'plan-v1' }, [{ name: 'Evacuate', assigneeRef: 'commander', deadlineAt: '2026-09-25T08:05:00Z' }],
    verified.version, 'commander'
  );
  assert.equal(committedBeforeDispatch, true);
  assert.equal(started.tasks[0].deliveryStatus, 'MANUAL_REVIEW');
  assert.equal(repository.snapshot().deliveries[0].errorCode, 'MESSAGE_TIMEOUT');
});
