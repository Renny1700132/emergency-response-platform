import { randomUUID } from 'node:crypto';
import http from 'node:http';
import { createAuditRecord, createAuditSink } from './audit.mjs';
import { resolveIdentity, requireRole } from './identity.mjs';
import { createEventWorkflow } from './event-workflow.mjs';
import { createEventPersistence } from './event-persistence.mjs';
import { createIdempotencyGuard } from './idempotency.mjs';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}
function success(data, traceId) {
  return { code: 'OK', message: 'success', data, traceId, timestamp: new Date().toISOString() };
}
function failure(error, traceId) {
  return { code: error.code ?? 'RULE_422', message: error.message, traceId, timestamp: new Date().toISOString(), retryable: false };
}
async function readJson(request) {
  let text = '';
  for await (const part of request) text += part;
  try { return JSON.parse(text || '{}'); } catch { throw Object.assign(new Error('invalid JSON'), { code: 'BAD_JSON' }); }
}

export function createServer({ config, database = null, logger = console, messagePort = null, planProvider = null }) {
  const audit = createAuditSink({ logger, database });
  const persistence = createEventPersistence(database);
  const idempotency = createIdempotencyGuard(database);
  const workflow = createEventWorkflow({
    repository: persistence,
    notifyTask: async (task) => {
      if (!messagePort) throw Object.assign(new Error('message port unavailable'), { code: 'MESSAGE_UNAVAILABLE' });
      return messagePort.sendTask(task);
    },
    emit: async (event, actorId, writer) => {
      const withTrace = { ...event, traceId: event.aggregateId };
      const record = createAuditRecord({ traceId: withTrace.traceId, actorId, action: event.eventType, outcome: 'allowed', targetType: event.aggregateType, targetId: event.aggregateId, details: event.payload });
      await writer.persistOutbox?.(withTrace);
      if (writer.persistAudit) {
        logger.info?.(JSON.stringify({ event: 'audit', ...record }));
        await writer.persistAudit(record);
      } else {
        await audit.record(record);
      }
    }
  });
  return http.createServer(async (request, response) => {
    const traceId = request.headers['x-trace-id'] ?? randomUUID();
    response.setHeader('x-trace-id', traceId);
    const path = new URL(request.url, 'http://localhost').pathname;
    const identity = resolveIdentity(request, config);
    const requireWrite = async () => {
      if (!identity || !requireRole(identity, 'emergency.write')) {
        await audit.record(createAuditRecord({ traceId, actorId: identity?.actorId, action: 'event.write', outcome: 'denied' }));
        sendJson(response, 403, failure(Object.assign(new Error('Authorization is required'), { code: 'AUTH_FORBIDDEN' }), traceId));
        return false;
      }
      return true;
    };
    const runCommand = async (scope, body, action) => idempotency.run(scope, request.headers['x-idempotency-key'], body, action);
    if (request.method === 'GET' && path === '/healthz') {
      return sendJson(response, 200, { status: 'ok', service: 'emergency-backend', traceId });
    }
    if (request.method === 'GET' && path === '/readyz') {
      if (!database) return sendJson(response, 503, { status: 'not-ready', reason: 'database-not-configured', traceId });
      try {
        await database.healthcheck();
        return sendJson(response, 200, { status: 'ready', traceId });
      } catch {
        return sendJson(response, 503, { status: 'not-ready', reason: 'database-unavailable', traceId });
      }
    }
    if (request.method === 'GET' && path === '/api/v1/_internal/whoami') {
      const identity = resolveIdentity(request, config);
      if (!identity || !requireRole(identity, 'emergency.read')) {
        await audit.record(createAuditRecord({ traceId, actorId: identity?.actorId, action: 'identity.read', outcome: 'denied' }));
        return sendJson(response, 403, failure(Object.assign(new Error('Authorization is required'), { code: 'AUTH_FORBIDDEN' }), traceId));
      }
      await audit.record(createAuditRecord({ traceId, actorId: identity.actorId, action: 'identity.read', outcome: 'allowed' }));
      return sendJson(response, 200, { actorId: identity.actorId, roles: identity.roles, traceId });
    }
    try {
      if (request.method === 'POST' && path === '/api/v1/incidents') {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const incident = await runCommand('incidents:create', body, () => workflow.createIncident(body, identity.actorId, request.headers['x-idempotency-key']));
        return sendJson(response, 200, success(incident, traceId));
      }
      const verify = /^\/api\/v1\/incidents\/([^/]+)\/verify$/.exec(path);
      if (request.method === 'POST' && verify) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand(`incidents:${verify[1]}:verify`, body, () => workflow.verify(verify[1], body.decision, body.reason, body.resourceVersion, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
      const start = /^\/api\/v1\/incidents\/([^/]+)\/start-response$/.exec(path);
      if (request.method === 'POST' && start) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const plan = planProvider
          ? await planProvider.loadPublishedPlan(body.planVersionId)
          : await persistence.loadPublishedPlan?.(body.planVersionId);
        if (!plan) throw Object.assign(new Error('published plan version not found'), { code: 'RULE_422' });
        const data = await runCommand(`incidents:${start[1]}:start-response`, body, () => workflow.startResponse(start[1], plan, plan.templates, body.resourceVersion, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
      const acknowledge = /^\/api\/v1\/tasks\/([^/]+)\/acknowledge$/.exec(path);
      if (request.method === 'POST' && acknowledge) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand(`tasks:${acknowledge[1]}:acknowledge`, body, () => workflow.acknowledgeTask(acknowledge[1], body.reason, body.resourceVersion, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
      const feedback = /^\/api\/v1\/tasks\/([^/]+)\/feedback$/.exec(path);
      if (request.method === 'POST' && feedback) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand(`tasks:${feedback[1]}:feedback`, body, () => workflow.feedback(feedback[1], body, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
      const complete = /^\/api\/v1\/tasks\/([^/]+)\/complete$/.exec(path);
      if (request.method === 'POST' && complete) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand(`tasks:${complete[1]}:complete`, body, () => workflow.completeTask(complete[1], body.reason, body.resourceVersion, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
      const close = /^\/api\/v1\/incidents\/([^/]+)\/close$/.exec(path);
      if (request.method === 'POST' && close) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand(`incidents:${close[1]}:close`, body, () => workflow.close(close[1], { conclusion: body.reason, reportRef: body.attributes?.reportRef }, body.resourceVersion, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
    } catch (error) {
      const status = error.code === 'BAD_JSON' ? 400 : ['IDEMPOTENCY_CONFLICT', 'VERSION_CONFLICT'].includes(error.code) ? 409 : 422;
      return sendJson(response, status, failure(error, traceId));
    }
    return sendJson(response, 404, failure(Object.assign(new Error('Route not found'), { code: 'NOT_FOUND' }), traceId));
  });
}
