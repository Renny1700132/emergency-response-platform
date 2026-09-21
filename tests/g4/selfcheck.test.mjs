import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSelfcheck } from '../../scripts/g4/lib/selfcheck.mjs';

function validDocument() {
  const checks = {};
  for (const name of [
    'scope', 'contract', 'authorizationAndValidation', 'parameterizedAccess',
    'secrets', 'logRedaction', 'migrationRollback', 'tests', 'traceability'
  ]) checks[name] = { status: 'PASS', evidence: 'verified by automated test' };
  return {
    taskId: 'G4-01',
    owner: 'C',
    reviewer: 'B',
    traceability: {
      taskIds: ['G4-01'],
      requirementIds: ['KN-045'],
      acIds: ['G4-01-DoD'],
      designIds: ['NFR-MNT-01']
    },
    ai: { scope: 'quality gate implementation', disposition: 'reviewed and adopted' },
    checks
  };
}

test('selfcheck accepts complete evidence', () => {
  assert.deepEqual(validateSelfcheck(validDocument()), []);
});

test('selfcheck blocks a missing check and empty traceability', () => {
  const document = validDocument();
  document.traceability.acIds = [];
  delete document.checks.secrets;
  const errors = validateSelfcheck(document);
  assert.equal(errors.some((error) => error.includes('traceability.acIds')), true);
  assert.equal(errors.some((error) => error.includes('checks.secrets.status')), true);
});

test('selfcheck permits an evidenced not-applicable result', () => {
  const document = validDocument();
  document.checks.migrationRollback = {
    status: 'N/A',
    evidence: 'G4-01 changes no database schema or migration'
  };
  assert.deepEqual(validateSelfcheck(document), []);
});
