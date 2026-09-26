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
function bearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(String(request.headers.authorization ?? '').trim());
  return match?.[1]?.trim() || null;
}
function pagination(request) {
  const url = new URL(request.url, 'http://localhost');
  const page = Number(url.searchParams.get('page') ?? 1);
  const size = Number(url.searchParams.get('size') ?? 50);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1 || size > 200) {
    throw Object.assign(new Error('page and size are invalid'), { code: 'BAD_REQUEST' });
  }
  return { page, size };
}
async function readJson(request) {
  let text = '';
  for await (const part of request) text += part;
  try { return JSON.parse(text || '{}'); } catch { throw Object.assign(new Error('invalid JSON'), { code: 'BAD_JSON' }); }
}

export function createServer({
  config, database = null, logger = console, messagePort = null, planProvider = null,
  identityProvider = null, filePort = null
}) {
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
    try {
      const identity = await resolveIdentity(request, config, identityProvider, { traceId });
      const requireAccess = async (role, action) => {
        if (!identity || !requireRole(identity, role)) {
          await audit.record(createAuditRecord({ traceId, actorId: identity?.actorId, action, outcome: 'denied' }));
          sendJson(response, 403, failure(Object.assign(new Error('Authorization is required'), { code: 'AUTH_FORBIDDEN' }), traceId));
          return false;
        }
        return true;
      };
      const requireRead = () => requireAccess('emergency.read', 'event.read');
      const requireWrite = () => requireAccess('emergency.write', 'event.write');
      const runCommand = async (scope, body, action) => idempotency.run(scope, request.headers['x-idempotency-key'], body, action);
      if (request.method === 'GET' && path === '/api/v1/_internal/whoami') {
        if (!await requireAccess('emergency.read', 'identity.read')) return;
        await audit.record(createAuditRecord({ traceId, actorId: identity.actorId, action: 'identity.read', outcome: 'allowed' }));
        return sendJson(response, 200, { actorId: identity.actorId, roles: identity.roles, traceId });
      }
      if (request.method === 'GET' && path === '/api/v1/platform/context') {
        if (!await requireAccess('emergency.read', 'identity.read')) return;
        await audit.record(createAuditRecord({ traceId, actorId: identity.actorId, action: 'identity.read', outcome: 'allowed' }));
        return sendJson(response, 200, success({
          userId: identity.actorId,
          displayName: identity.displayName,
          roles: identity.roles,
          permissions: identity.permissions,
          organizationId: identity.organizationId,
          dataScopes: identity.dataScopes
        }, traceId));
      }
      if (request.method === 'GET' && path === '/api/v1/incidents') {
        if (!await requireRead()) return;
        return sendJson(response, 200, success(await workflow.listIncidents(pagination(request)), traceId));
      }
      const incidentDetail = /^\/api\/v1\/incidents\/([^/]+)$/.exec(path);
      if (request.method === 'GET' && incidentDetail) {
        if (!await requireRead()) return;
        return sendJson(response, 200, success(await workflow.getIncident(incidentDetail[1]), traceId));
      }
      if (request.method === 'GET' && path === '/api/v1/tasks') {
        if (!await requireRead()) return;
        return sendJson(response, 200, success(await workflow.listTasks(pagination(request)), traceId));
      }
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
      if (request.method === 'POST' && path === '/api/v1/tasks') {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand('tasks:create-temporary', body, () => workflow.createTemporaryTask(body, identity.actorId));
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
      const remind = /^\/api\/v1\/tasks\/([^/]+)\/remind$/.exec(path);
      if (request.method === 'POST' && remind) {
        if (!await requireWrite()) return;
        const body = await readJson(request);
        const data = await runCommand(`tasks:${remind[1]}:remind`, body, () => workflow.remindTask(remind[1], body.reason, body.resourceVersion, identity.actorId));
        return sendJson(response, 200, success(data, traceId));
      }
      if (request.method === 'POST' && path === '/api/v1/platform/files/presign') {
        if (!await requireWrite()) return;
        if (!filePort?.presignFile) throw Object.assign(new Error('middle platform file service unavailable'), { code: 'MIDDLE_PLATFORM_UNAVAILABLE' });
        const token = bearerToken(request);
        if (!token) throw Object.assign(new Error('Bearer token is required'), { code: 'AUTH_FORBIDDEN' });
        const body = await readJson(request);
        const data = await runCommand('platform:files:presign', body, () => filePort.presignFile(token, body, { traceId }));
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
      const status = ['BAD_JSON', 'BAD_REQUEST'].includes(error.code) ? 400
        : error.code === 'AUTH_FORBIDDEN' ? 403
          : error.code === 'NOT_FOUND' ? 404
            : error.code === 'MIDDLE_PLATFORM_UNAVAILABLE' ? 503
              : ['IDEMPOTENCY_CONFLICT', 'VERSION_CONFLICT'].includes(error.code) ? 409 : 422;
      return sendJson(response, status, failure(error, traceId));
    }
    return sendJson(response, 404, failure(Object.assign(new Error('Route not found'), { code: 'NOT_FOUND' }), traceId));
  });
}
