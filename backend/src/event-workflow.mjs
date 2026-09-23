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

export function createEventWorkflow({ now = () => new Date().toISOString(), emit = async () => {} } = {}) {
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
      const incident = { id: randomUUID(), ...input, status: 'PENDING_VERIFICATION', version: 1, createdAt: now(), updatedAt: now(), timeline: [] };
      incidents.set(incident.id, incident);
      await append(incident, 'INCIDENT_CREATED', actorId, { sourceSystem: input.sourceSystem ?? 'MANUAL' });
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
      await append(incident, 'RESPONSE_STARTED', actorId, { planVersionId: planVersion.id, taskCount: created.length });
      return { incident: structuredClone(incident), tasks: structuredClone(created) };
    },
    async acknowledgeTask(taskId, actorId) {
      const task = tasks.get(taskId); rule(task, 'task not found');
      rule(task.assigneeRef === actorId, 'task belongs to another actor');
      rule(task.status === 'PENDING', 'task cannot be acknowledged');
      task.status = 'ACKNOWLEDGED'; task.version += 1; return structuredClone(task);
    },
    async feedback(taskId, content, actorId) {
      const task = tasks.get(taskId); rule(task, 'task not found');
      rule(task.assigneeRef === actorId, 'task belongs to another actor');
      rule(['ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status), 'task cannot receive feedback');
      task.status = 'IN_PROGRESS'; task.version += 1; task.feedback.push({ content, actorId, occurredAt: now() });
      return structuredClone(task);
    },
    async completeTask(taskId, actorId) {
      const task = tasks.get(taskId); rule(task, 'task not found');
      rule(task.assigneeRef === actorId, 'task belongs to another actor');
      rule(['ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status), 'task cannot be completed');
      task.status = 'COMPLETED'; task.version += 1; return structuredClone(task);
    },
    async close(incidentId, evaluation, actorId) {
      const incident = incidents.get(incidentId); rule(incident, 'incident not found');
      rule(incident.status === 'RESPONDING', 'incident is not responding');
      rule(evaluation?.conclusion && evaluation?.reportRef, 'closure conclusion and report reference are required');
      rule([...tasks.values()].filter((task) => task.incidentId === incidentId).every((task) => task.status === 'COMPLETED'), 'all response tasks must be completed');
      incident.status = 'CLOSED'; incident.closure = { ...evaluation, actorId, closedAt: now() }; incident.version += 1;
      await append(incident, 'INCIDENT_CLOSED', actorId, { reportRef: evaluation.reportRef });
      return structuredClone(incident);
    }
  });
}
