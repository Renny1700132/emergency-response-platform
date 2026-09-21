const REQUIRED_CHECKS = [
  'scope',
  'contract',
  'authorizationAndValidation',
  'parameterizedAccess',
  'secrets',
  'logRedaction',
  'migrationRollback',
  'tests',
  'traceability'
];

const ACCEPTED_STATUSES = new Set(['PASS', 'N/A']);

function requireText(errors, value, field) {
  if (typeof value !== 'string' || value.trim() === '') errors.push(`${field} must be non-empty text`);
}

function requireIds(errors, value, field) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    errors.push(`${field} must contain at least one non-empty identifier`);
  }
}

export function validateSelfcheck(document) {
  const errors = [];
  requireText(errors, document?.taskId, 'taskId');
  requireText(errors, document?.owner, 'owner');
  requireText(errors, document?.reviewer, 'reviewer');
  requireIds(errors, document?.traceability?.taskIds, 'traceability.taskIds');
  requireIds(errors, document?.traceability?.requirementIds, 'traceability.requirementIds');
  requireIds(errors, document?.traceability?.acIds, 'traceability.acIds');
  requireIds(errors, document?.traceability?.designIds, 'traceability.designIds');
  requireText(errors, document?.ai?.scope, 'ai.scope');
  requireText(errors, document?.ai?.disposition, 'ai.disposition');

  for (const check of REQUIRED_CHECKS) {
    const value = document?.checks?.[check];
    if (!value || !ACCEPTED_STATUSES.has(value.status)) {
      errors.push(`checks.${check}.status must be PASS or N/A`);
      continue;
    }
    requireText(errors, value.evidence, `checks.${check}.evidence`);
  }
  return errors;
}
