const SENSITIVE_KEY = /authorization|cookie|password|secret|token|credential/i;

export function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(item)]));
  }
  return value;
}

export function createAuditRecord({ traceId, actorId, action, outcome, targetType = null, targetId = null, details = {} }) {
  return Object.freeze({
    traceId,
    actorId: actorId ?? 'anonymous',
    action,
    outcome,
    targetType,
    targetId,
    details: redact(details),
    occurredAt: new Date().toISOString()
  });
}

export function createAuditSink({ logger = console, database = null } = {}) {
  return {
    async record(record) {
      const safeRecord = redact(record);
      logger.info?.(JSON.stringify({ event: 'audit', ...safeRecord }));
      if (database) {
        await database.query(
          `INSERT INTO audit_records (trace_id, actor_id, action, outcome, target_type, target_id, details)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
          [safeRecord.traceId, safeRecord.actorId, safeRecord.action, safeRecord.outcome, safeRecord.targetType, safeRecord.targetId, JSON.stringify(safeRecord.details)]
        );
      }
      return safeRecord;
    }
  };
}
