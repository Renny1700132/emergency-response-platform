import { createHash } from 'node:crypto';

function conflict(message) {
  return Object.assign(new Error(message), { code: 'IDEMPOTENCY_CONFLICT' });
}

export function createIdempotencyGuard(database = null) {
  const memory = new Map();

  return Object.freeze({
    async run(scope, key, payload, action) {
      if (!key) throw conflict('idempotency key is required');
      const requestHash = createHash('sha256').update(JSON.stringify(payload ?? {})).digest('hex');

      if (database) {
        const found = await database.query(
          `SELECT request_hash AS "requestHash", response_body AS "responseBody"
             FROM em_idempotency_record WHERE scope=$1 AND idempotency_key=$2`,
          [scope, key]
        );
        if (found.rows.length > 0) {
          if (found.rows[0].requestHash !== requestHash) throw conflict('idempotency key conflicts with another payload');
          return found.rows[0].responseBody;
        }
        const result = await action();
        await database.query(
          `INSERT INTO em_idempotency_record (scope, idempotency_key, request_hash, response_status, response_body, expires_at)
           VALUES ($1,$2,$3,200,$4::jsonb,now() + interval '24 hours')`,
          [scope, key, requestHash, JSON.stringify(result)]
        );
        return result;
      }

      const storageKey = `${scope}:${key}`;
      const prior = memory.get(storageKey);
      if (prior) {
        if (prior.requestHash !== requestHash) throw conflict('idempotency key conflicts with another payload');
        return structuredClone(prior.result);
      }
      const result = await action();
      memory.set(storageKey, { requestHash, result: structuredClone(result) });
      return result;
    }
  });
}
