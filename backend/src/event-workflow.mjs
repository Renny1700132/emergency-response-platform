import { randomUUID } from 'node:crypto';

const transitions = {
  PENDING_VERIFICATION: new Set(['VERIFIED', 'REJECTED']),
  VERIFIED: new Set(['RESPONDING']),
  RESPONDING: new Set(['CLOSED']),
  CLOSED: new Set(['RESPONDING'])
};

function rule(condition, message) {
  if (!condition) throw Object.assign(new Error(message), { code: 'RULE_422' });
}

export function createEventWorkflow({
  now = () => new Date().toISOString(),
  emit = async () => {},
  persistIncident = async () => {},
  persistVerification = async () => {},
  persistTask = async () => {},
  persistFeedback = async () => {},
  persistClosure = async () => {},
  persistDelivery = async () => {},
  notifyTask = async () => ({ status: 'ACCEPTED' })
} = {}) {
  const incidents = new Map();
  const tasks = new Map();
  const idempotency = new Map();

  async function append(incident, type, actorId, details = {}) {
    incident.timeline.push({ id: randomUUID(), type, actorId, occurredAt: now(), receivedAt: now(), details });
    await emit({ aggregateType: 'INCIDENT', aggregateId: incident.id, eventType: type, payload: details });
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
      incidents.set(incident.id, incident);
      await append(incident, 'INCIDENT_CREATED', actorId, { sourceSystem: input.sourceSystem ?? 'MANUAL' });
      await persistIncident(incident);
      const value = structuredClone(incident);
      idempotency.set(key, { fingerprint, value });
      return value;
    },
    async verify(incidentId, decision, reason, actorId) {
      const incident = incidents.get(incidentId);
      rule(incident, 'incident not found');
      rule(transitions[incident.status]?.has(decision), 'incident status does not allow verification');
      rule(reason, 'verification reason is required');
      incident.status = decision; incident.version += 1; incident.updatedAt = now();
      await append(incident, `INCIDENT_${decision}`, actorId, { reason });
      await persistVerification(incidentId, { id: randomUUID(), decision, reason, actorId, occurredAt: now() });
      await persistIncident(incident);
      return structuredClone(incident);
    },
    async startResponse(incidentId, planVersion, templates, actorId) {
      const incident = incidents.get(incidentId);
      rule(incident, 'incident not found');
      rule(transitions[incident.status]?.has('RESPONDING'), 'incident is not verified');
      rule(planVersion?.id && Array.isArray(templates) && templates.length > 0, 'published plan version and task templates are required');
      incident.status = 'RESPONDING'; incident.planVersionId = planVersion.id; incident.version += 1; incident.updatedAt = now();
      const created = templates.map((template) => {
        const task = { id: randomUUID(), incidentId, name: template.name, assigneeRef: template.assigneeRef, deadlineAt: template.deadlineAt, status: 'PENDING', version: 1, feedback: [] };
        tasks.set(task.id, task); return task;
      });
      for (const task of created) {
        let receipt;
        try {
          receipt = await notifyTask(task);
          task.deliveryStatus = receipt.status ?? 'ACCEPTED';
        } catch (error) {
          task.deliveryStatus = 'MANUAL_REVIEW';
          task.deliveryError = error.code ?? 'MESSAGE_UNAVAILABLE';
          receipt = { status: 'MANUAL_REVIEW', errorCode: task.deliveryError };
        }
        await persistTask(task);
        await persistDelivery(task, receipt);
      }
      await append(incident, 'RESPONSE_STARTED', actorId, { planVersionId: planVersion.id, taskCount: created.length });
      await persistIncident(incident);
      return { incident: structuredClone(incident), tasks: structuredClone(created) };
    },
    async acknowledgeTask(taskId, actorId) {
      const task = tasks.get(taskId); rule(task, 'task not found');
      rule(task.assigneeRef === actorId, 'task belongs to another actor');
      rule(task.status === 'PENDING', 'task cannot be acknowledged');
      task.status = 'ACKNOWLEDGED'; task.version += 1; await persistTask(task); return structuredClone(task);
    },
    async feedback(taskId, input, actorId) {
      const task = tasks.get(taskId); rule(task, 'task not found');
      rule(task.assigneeRef === actorId, 'task belongs to another actor');
      rule(['ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status), 'task cannot receive feedback');
      const feedbackInput = typeof input === 'string' ? { content: input } : input;
      rule(feedbackInput?.content, 'feedback content is required');
      rule(feedbackInput.progressPercent == null || (feedbackInput.progressPercent >= 0 && feedbackInput.progressPercent <= 100), 'progress percent is invalid');
      task.status = 'IN_PROGRESS'; task.version += 1;
      const entry = { id: randomUUID(), content: feedbackInput.content, progressPercent: feedbackInput.progressPercent,
        attachmentFileIds: feedbackInput.attachmentFileIds ?? [], actorId, occurredAt: now() };
      task.feedback.push(entry);
      await persistFeedback(task, entry); await persistTask(task);
      return structuredClone(task);
    },
    async completeTask(taskId, actorId) {
      const task = tasks.get(taskId); rule(task, 'task not found');
      rule(task.assigneeRef === actorId, 'task belongs to another actor');
      rule(['ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status), 'task cannot be completed');
      task.status = 'COMPLETED'; task.version += 1; await persistTask(task); return structuredClone(task);
    },
    async close(incidentId, evaluation, actorId) {
      const incident = incidents.get(incidentId); rule(incident, 'incident not found');
      rule(incident.status === 'RESPONDING', 'incident is not responding');
      rule(evaluation?.conclusion && evaluation?.reportRef, 'closure conclusion and report reference are required');
      rule([...tasks.values()].filter((task) => task.incidentId === incidentId).every((task) => task.status === 'COMPLETED'), 'all response tasks must be completed');
      incident.status = 'CLOSED'; incident.closure = { id: randomUUID(), ...evaluation, actorId, closedAt: now() }; incident.version += 1;
      await append(incident, 'INCIDENT_CLOSED', actorId, { reportRef: evaluation.reportRef });
      await persistIncident(incident);
      await persistClosure(incidentId, incident.closure);
      return structuredClone(incident);
    }
  });
}
