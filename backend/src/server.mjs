import { randomUUID } from 'node:crypto';
import http from 'node:http';
import { createAuditRecord, createAuditSink } from './audit.mjs';
import { resolveIdentity, requireRole } from './identity.mjs';

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

export function createServer({ config, database = null, logger = console }) {
  const audit = createAuditSink({ logger, database });
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
    if (request.method === 'GET' && path === '/api/v1/_internal/whoami') {
      const identity = resolveIdentity(request, config);
      if (!identity || !requireRole(identity, 'emergency.read')) {
        await audit.record(createAuditRecord({ traceId, actorId: identity?.actorId, action: 'identity.read', outcome: 'denied' }));
        return sendJson(response, 403, { code: 'AUTH_FORBIDDEN', message: 'Authorization is required', traceId, retryable: false });
      }
      await audit.record(createAuditRecord({ traceId, actorId: identity.actorId, action: 'identity.read', outcome: 'allowed' }));
      return sendJson(response, 200, { actorId: identity.actorId, roles: identity.roles, traceId });
    }
    return sendJson(response, 404, { code: 'NOT_FOUND', message: 'Route not found', traceId, retryable: false });
  });
}
