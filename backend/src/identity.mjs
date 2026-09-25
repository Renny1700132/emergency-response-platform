function bearerToken(request) {
  const authorization = request.headers.authorization;
  if (typeof authorization !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}

export async function resolveIdentity(request, config, identityProvider = null, context = {}) {
  const token = bearerToken(request);
  if (token) {
    if (!identityProvider?.resolveBearer) return null;
    const identity = await identityProvider.resolveBearer(token, context);
    if (!identity?.actorId || (!Array.isArray(identity.roles) && !Array.isArray(identity.permissions))) return null;
    return Object.freeze({
      actorId: String(identity.actorId),
      roles: Array.isArray(identity.roles) ? identity.roles.map(String) : [],
      permissions: Array.isArray(identity.permissions) ? identity.permissions.map(String) : [],
      displayName: identity.displayName ? String(identity.displayName) : String(identity.actorId),
      organizationId: identity.organizationId ? String(identity.organizationId) : null,
      dataScopes: Array.isArray(identity.dataScopes) ? identity.dataScopes.map(String) : [],
      source: 'middle-platform-bearer'
    });
  }
  if (!config.allowDevelopmentIdentityHeaders) return null;
  const actorId = request.headers['x-actor-id'];
  if (typeof actorId !== 'string' || actorId.trim() === '') return null;
  const roles = String(request.headers['x-actor-roles'] ?? '')
    .split(',').map((role) => role.trim()).filter(Boolean);
  return Object.freeze({ actorId, roles, permissions: roles, displayName: actorId, source: 'development-header' });
}

export function requireRole(identity, role) {
  return Boolean(identity?.roles?.includes(role) || identity?.permissions?.includes(role));
}
