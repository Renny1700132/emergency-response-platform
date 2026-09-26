function controlledError(message, code) {
  return Object.assign(new Error(message), { code });
}

async function platformRequest({ baseUrl, path, token, traceId, timeoutMs, fetcher, method = 'GET', body }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(new URL(path, `${baseUrl.replace(/\/$/, '')}/`), {
      method,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'x-request-id': traceId
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw controlledError(`middle platform returned HTTP ${response.status}`, 'MIDDLE_PLATFORM_UNAVAILABLE');
    return response.json();
  } catch (error) {
    if (error?.code) throw error;
    throw controlledError(error?.name === 'AbortError' ? 'middle platform request timed out' : 'middle platform request failed', 'MIDDLE_PLATFORM_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
  }
}

function dataOf(payload) {
  return payload?.data ?? payload;
}

export function createMiddlePlatformPort({
  baseUrl,
  identityPath = '/api/v1/platform/context',
  filePresignPath = '/api/v1/platform/files/presign',
  timeoutMs = 3000,
  fetcher = fetch
}) {
  if (!baseUrl) throw new Error('middle platform base URL is required');
  return Object.freeze({
    async resolveBearer(token, { traceId }) {
      const payload = await platformRequest({ baseUrl, path: identityPath, token, traceId, timeoutMs, fetcher });
      if (!payload) return null;
      const data = dataOf(payload);
      const actorId = data?.actorId ?? data?.userId ?? data?.id;
      const roles = Array.isArray(data?.roles) ? data.roles : [];
      const permissions = Array.isArray(data?.permissions) ? data.permissions : [];
      if (!actorId || (roles.length === 0 && permissions.length === 0)) return null;
      return {
        actorId,
        roles,
        permissions,
        displayName: data.displayName ?? data.name ?? actorId,
        organizationId: data.organizationId ?? data.orgId ?? null,
        dataScopes: Array.isArray(data.dataScopes) ? data.dataScopes : []
      };
    },
    async presignFile(token, request, { traceId }) {
      const payload = await platformRequest({
        baseUrl, path: filePresignPath, token, traceId, timeoutMs, fetcher, method: 'POST', body: request
      });
      if (!payload) throw controlledError('middle platform authorization failed', 'AUTH_FORBIDDEN');
      return dataOf(payload);
    }
  });
}
