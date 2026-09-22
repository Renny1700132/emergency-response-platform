export function resolveIdentity(request, config) {
  if (!config.allowDevelopmentIdentityHeaders) return null;
  const actorId = request.headers['x-actor-id'];
  if (typeof actorId !== 'string' || actorId.trim() === '') return null;
  const roles = String(request.headers['x-actor-roles'] ?? '')
    .split(',').map((role) => role.trim()).filter(Boolean);
  return Object.freeze({ actorId, roles, source: 'development-header' });
}

export function requireRole(identity, role) {
  return Boolean(identity?.roles?.includes(role));
}
