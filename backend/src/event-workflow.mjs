import { randomUUID } from 'node:crypto';

const transitions = {
  PENDING_VERIFICATION: new Set(['VERIFIED', 'REJECTED']),
  VERIFIED: new Set(['RESPONDING']),
  RESPONDING: new Set(['CLOSED']),
  CLOSED: new Set(['RESPONDING'])
};

function rule(condition, message, code = 'RULE_422') {
  if (!condition) throw Object.assign(new Error(message), { code });
}

function requireVersion(expected, actual, resource) {
  rule(Number.isInteger(expected) && expected >= 0, 'resourceVersion is required');
  rule(expected === actual, `${resource} resource version conflict`, 'VERSION_CONFLICT');
}

export function createEventWorkflow({
  now = () => new Date().toISOString(), repository = {}, emit = async () => {},
  notifyTask = async () => ({ status: 'ACCEPTED' })
} = {}) {
  const incidents = new Map();
  const tasks = new Map();
  const idempotency = new Map();
  const transaction = (action) => repository.transaction ? repository.transaction(action) : action(repository);

  async function loadIncident(incidentId, store = repository) {
    if (store.loadIncident) {
      const loaded = await store.loadIncident(incidentId);
      if (loaded) incidents.set(incidentId, loaded);
      return loaded;
    }
    return incidents.get(incidentId);
  }

  async function loadTask(taskId, store = repository) {
    if (store.loadTask) {
      const loaded = await store.loadTask(taskId);
      if (loaded) tasks.set(taskId, loaded);
      return loaded;
    }
    return tasks.get(taskId);
  }

  async function incidentTasks(incidentId, store = repository) {
    const loaded = await store.loadTasksByIncident?.(incidentId);
    if (loaded) {
      for (const task of loaded) tasks.set(task.id, task);
      return loaded;
    }
    return [...tasks.values()].filter((task) => task.incidentId === incidentId);
  }

  async function append(store, incident, type, actorId, details = {}) {
    const event = { id: randomUUID(), type, actorId, occurredAt: now(), receivedAt: now(), details };
    incident.timeline ??= [];
    incident.timeline.push(event);
    await emit({ aggregateType: 'INCIDENT', aggregateId: incident.id, eventType: type, payload: details }, actorId, store);
  }

  async function dispatchTask(task, actorId) {
    let receipt;
    try {
      receipt = await notifyTask(task);
      task.deliveryStatus = receipt.status ?? 'ACCEPTED';
      task.deliveryError = null;
    } catch (error) {
      task.deliveryStatus = 'MANUAL_REVIEW';
      task.deliveryError = error.code ?? 'MESSAGE_UNAVAILABLE';
      receipt = { status: 'MANUAL_REVIEW', errorCode: task.deliveryError };
    }
    if (repository.transaction) {
      await transaction(async (store) => {
        await store.persistTask(task, task.version);
        await store.persistDelivery(task, receipt);
        await emit({ aggregateType: 'TASK', aggregateId: task.id, eventType: 'TASK_DELIVERY_RECORDED', payload: receipt }, actorId, store);
      });
    } else {
      await repository.persistTask?.(task, task.version);
      await repository.persistDelivery?.(task, receipt);
    }
    return task;
  }

  return Object.freeze({
    async createIncident(input, actorId, key) {
      rule(input?.title && input?.incidentTypeCode && input?.occurredAt && input?.description, 'incident fields are required');
      rule(key, 'idempotency key is required');
      const fingerprint = JSON.stringify(input);
      const prior = idempotency.get(key);
      if (prior) {
        rule(prior.fingerprint === fingerprint, 'idempotency key conflicts with another payload');
        return prior.value;
      }
      const createdAt = now();
      const incident = {
        id: randomUUID(), incidentNo: `INC-${createdAt.replace(/\D/g, '').slice(0, 14)}-${randomUUID().slice(0, 8)}`,
        ...input, sourceSystem: input.sourceSystem ?? 'MANUAL', receivedAt: input.receivedAt ?? createdAt,
        recordedAt: createdAt, createdBy: actorId, status: 'PENDING_VERIFICATION', version: 1,
        createdAt, updatedAt: createdAt, timeline: []
      };
      await transaction(async (store) => {
        await store.persistIncident?.(incident, 0);
        await append(store, incident, 'INCIDENT_CREATED', actorId, { sourceSystem: input.sourceSystem ?? 'MANUAL' });
      });
      incidents.set(incident.id, incident);
      const value = structuredClone(incident);
      idempotency.set(key, { fingerprint, value });
      return value;
    },

    async verify(incidentId, decision, reason, resourceVersion, actorId) {
      const normalizedDecision = decision === 'CONFIRMED' ? 'VERIFIED' : decision;
      return transaction(async (store) => {
        const incident = await loadIncident(incidentId, store);
        rule(incident, 'incident not found');
        requireVersion(resourceVersion, incident.version, 'incident');
        rule(transitions[incident.status]?.has(normalizedDecision), 'incident status does not allow verification');
        rule(reason, 'verification reason is required');
        const expectedVersion = incident.version;
        incident.status = normalizedDecision;
        incident.version += 1;
        incident.updatedAt = now();
        await store.persistVerification?.(incidentId, { id: randomUUID(), decision: normalizedDecision, reason, actorId, occurredAt: now() });
        await store.persistIncident?.(incident, expectedVersion);
        await append(store, incident, `INCIDENT_${normalizedDecision}`, actorId, { reason });
        incidents.set(incident.id, incident);
        return structuredClone(incident);
      });
    },

    async startResponse(incidentId, planVersion, templates, resourceVersion, actorId) {
      const result = await transaction(async (store) => {
        const incident = await loadIncident(incidentId, store);
        rule(incident, 'incident not found');
        requireVersion(resourceVersion, incident.version, 'incident');
        rule(transitions[incident.status]?.has('RESPONDING'), 'incident is not verified');
        rule(planVersion?.id && Array.isArray(templates) && templates.length > 0, 'published plan version and task templates are required');
        const expectedVersion = incident.version;
        incident.status = 'RESPONDING';
        incident.planVersionId = planVersion.id;
        incident.version += 1;
        incident.updatedAt = now();
        const created = templates.map((template) => ({
          id: randomUUID(), incidentId, name: template.name, assigneeRef: template.assigneeRef,
          deadlineAt: template.deadlineAt, status: 'PENDING', deliveryStatus: 'PENDING_DISPATCH', version: 1, feedback: []
        }));
        await store.persistIncident?.(incident, expectedVersion);
        for (const task of created) {
          await store.persistTask?.(task, 0);
          await emit({ aggregateType: 'TASK', aggregateId: task.id, eventType: 'TASK_DISPATCH_REQUESTED', payload: { incidentId } }, actorId, store);
        }
        await append(store, incident, 'RESPONSE_STARTED', actorId, { planVersionId: planVersion.id, taskCount: created.length });
        incidents.set(incident.id, incident);
        for (const task of created) tasks.set(task.id, task);
        return { incident, tasks: created };
      });
      for (const task of result.tasks) await dispatchTask(task, actorId);
      return structuredClone(result);
    },

    async acknowledgeTask(taskId, reason, resourceVersion, actorId) {
      return transaction(async (store) => {
        const task = await loadTask(taskId, store);
        rule(task, 'task not found');
        requireVersion(resourceVersion, task.version, 'task');
        rule(reason, 'acknowledgement reason is required');
        rule(task.assigneeRef === actorId, 'task belongs to another actor');
        rule(task.status === 'PENDING', 'task cannot be acknowledged');
        const expectedVersion = task.version;
        task.status = 'ACKNOWLEDGED';
        task.version += 1;
        await store.persistTask?.(task, expectedVersion);
        await emit({ aggregateType: 'TASK', aggregateId: task.id, eventType: 'TASK_ACKNOWLEDGED', payload: { reason } }, actorId, store);
        tasks.set(task.id, task);
        return structuredClone(task);
      });
    },

    async feedback(taskId, input, actorId) {
      return transaction(async (store) => {
        const task = await loadTask(taskId, store);
        rule(task, 'task not found');
        requireVersion(input?.resourceVersion, task.version, 'task');
        rule(task.assigneeRef === actorId, 'task belongs to another actor');
        rule(['ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status), 'task cannot receive feedback');
        rule(input?.content, 'feedback content is required');
        rule(input.progressPercent == null || (input.progressPercent >= 0 && input.progressPercent <= 100), 'progress percent is invalid');
        const expectedVersion = task.version;
        task.status = 'IN_PROGRESS';
        task.version += 1;
        const entry = {
          id: randomUUID(), content: input.content, progressPercent: input.progressPercent,
          attachmentFileIds: input.attachmentFileIds ?? [], actorId, occurredAt: now()
        };
        task.feedback ??= [];
        task.feedback.push(entry);
        await store.persistFeedback?.(task, entry);
        await store.persistTask?.(task, expectedVersion);
        await emit({ aggregateType: 'TASK', aggregateId: task.id, eventType: 'TASK_FEEDBACK_RECORDED', payload: { progressPercent: entry.progressPercent } }, actorId, store);
        tasks.set(task.id, task);
        return structuredClone(task);
      });
    },

    async completeTask(taskId, reason, resourceVersion, actorId) {
      return transaction(async (store) => {
        const task = await loadTask(taskId, store);
        rule(task, 'task not found');
        requireVersion(resourceVersion, task.version, 'task');
        rule(reason, 'completion reason is required');
        rule(task.assigneeRef === actorId, 'task belongs to another actor');
        rule(['ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status), 'task cannot be completed');
        const expectedVersion = task.version;
        task.status = 'COMPLETED';
        task.version += 1;
        await store.persistTask?.(task, expectedVersion);
        await emit({ aggregateType: 'TASK', aggregateId: task.id, eventType: 'TASK_COMPLETED', payload: { reason } }, actorId, store);
        tasks.set(task.id, task);
        return structuredClone(task);
      });
    },

    async close(incidentId, evaluation, resourceVersion, actorId) {
      return transaction(async (store) => {
        const incident = await loadIncident(incidentId, store);
        rule(incident, 'incident not found');
        requireVersion(resourceVersion, incident.version, 'incident');
        rule(incident.status === 'RESPONDING', 'incident is not responding');
        rule(evaluation?.conclusion && evaluation?.reportRef, 'closure conclusion and report reference are required');
        const responseTasks = await incidentTasks(incidentId, store);
        rule(responseTasks.every((task) => task.status === 'COMPLETED'), 'all response tasks must be completed');
        const expectedVersion = incident.version;
        incident.status = 'CLOSED';
        incident.closure = { id: randomUUID(), ...evaluation, actorId, closedAt: now() };
        incident.version += 1;
        incident.updatedAt = now();
        await store.persistIncident?.(incident, expectedVersion);
        await store.persistClosure?.(incidentId, incident.closure);
        await append(store, incident, 'INCIDENT_CLOSED', actorId, { reportRef: evaluation.reportRef });
        incidents.set(incident.id, incident);
        return structuredClone(incident);
      });
    }
  });
}
