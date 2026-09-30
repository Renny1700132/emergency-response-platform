const CONTROL_PORTS = new Set(['EXT-ACCESS']);
const RETRYABLE_PORTS = new Set(['EXT-IOT', 'EXT-MESSAGE']);

function adapterError(code, message, details = {}) {
  return Object.assign(new Error(message), { code, details });
}

export function createExternalAdapters({
  baseUrl,
  fetcher = fetch,
  timeoutMs = 500,
  callLog = async () => {}
}) {
  if (!baseUrl) throw new Error('external adapter baseUrl is required');

  async function attempt(adapter, scenario, payload, context, attemptNo) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const requestedAt = new Date().toISOString();
    try {
      const response = await fetcher(
        `${baseUrl.replace(/\/$/, '')}/simulated/v1/${encodeURIComponent(adapter)}/${encodeURIComponent(scenario)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-trace-id': context.traceId },
          body: JSON.stringify(payload ?? {}),
          signal: controller.signal
        }
      );
      const body = await response.json();
      const record = {
        traceId: context.traceId, adapter, action: context.action, businessId: context.businessId,
        attemptNo, requestedAt, respondedAt: new Date().toISOString(), status: response.status,
        outcome: response.ok ? 'SUCCEEDED' : 'FAILED', marker: body.marker ?? null,
        errorCode: response.ok ? null : body.code ?? `HTTP_${response.status}`
      };
      await callLog(record);
      if (!response.ok) {
        const code = [408, 504].includes(response.status) ? 'EXTERNAL_TIMEOUT' : record.errorCode;
        throw adapterError(code, `external adapter ${adapter} failed`, { record, body, upstreamCode: record.errorCode });
      }
      return { ...body, adapter, attemptNo, traceId: context.traceId };
    } catch (error) {
      if (error.code) throw error;
      const code = error.name === 'AbortError' || error.message === 'aborted' ? 'EXTERNAL_TIMEOUT' : 'EXTERNAL_UNAVAILABLE';
      const record = {
        traceId: context.traceId, adapter, action: context.action, businessId: context.businessId,
        attemptNo, requestedAt, respondedAt: new Date().toISOString(), status: null,
        outcome: 'FAILED', marker: 'SIMULATED_EVIDENCE', errorCode: code
      };
      await callLog(record);
      throw adapterError(code, `external adapter ${adapter} ${code === 'EXTERNAL_TIMEOUT' ? 'timed out' : 'is unavailable'}`, { record });
    } finally {
      clearTimeout(timer);
    }
  }

  return Object.freeze({
    async invoke(adapter, action, payload, {
      scenario = 'normal', traceId, businessId = null, authorizedConfirmation = null
    } = {}) {
      if (!traceId) throw adapterError('TRACE_REQUIRED', 'traceId is required');
      if (CONTROL_PORTS.has(adapter) && !authorizedConfirmation) {
        throw adapterError('CONTROL_CONFIRMATION_REQUIRED', 'authorized confirmation is required for access control');
      }
      const context = { action, traceId, businessId };
      const maxAttempts = RETRYABLE_PORTS.has(adapter) ? 2 : 1;
      let lastError;
      for (let attemptNo = 1; attemptNo <= maxAttempts; attemptNo += 1) {
        try {
          return await attempt(adapter, scenario, payload, context, attemptNo);
        } catch (error) {
          lastError = error;
          if (CONTROL_PORTS.has(adapter)) break; // control commands are never replayed automatically
          if (!['EXTERNAL_TIMEOUT', 'EXTERNAL_UNAVAILABLE'].includes(error.code)) break;
        }
      }
      throw Object.assign(lastError, {
        manualDegradation: true,
        retryExhausted: maxAttempts > 1,
        attempts: maxAttempts
      });
    }
  });
}
