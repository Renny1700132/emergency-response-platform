export function createMessagePort({ baseUrl, fetcher = fetch, timeoutMs = 1000, scenario = 'normal' }) {
  return Object.freeze({
    async sendTask(task) {
      if (!baseUrl) throw Object.assign(new Error('message simulator is not configured'), { code: 'MESSAGE_UNAVAILABLE' });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/simulated/v1/EXT-MESSAGE/${scenario}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, assigneeRef: task.assigneeRef }),
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) throw Object.assign(new Error(payload.code ?? 'message rejected'), { code: payload.code ?? 'MESSAGE_FAILED' });
        return { status: 'ACCEPTED', platformMessageId: payload.platformMessageId ?? null, marker: payload.marker };
      } catch (error) {
        if (controller.signal.aborted) throw Object.assign(new Error('message timeout'), { code: 'MESSAGE_TIMEOUT' });
        throw error;
      } finally {
        clearTimeout(timer);
      }
    }
  });
}
