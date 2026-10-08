import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../../evidence/g5/G5-02/', import.meta.url)
const readJson = async (name) => JSON.parse(await readFile(new URL(name, root), 'utf8'))
const performance = await readJson('performance-raw.json')
const fault = await readJson('fault-drill-raw.json')
const quality = await readJson('quality-summary.json')
const environment = await readJson('environment-readiness.json')

const metric = (id) => performance.measurements.find((item) => item.id === id)
assert.equal(metric('PE-07-ordinary-api').successRate, 1)
assert.ok(metric('PE-07-ordinary-api').p95Ms <= 3000)
assert.equal(metric('PE-11-100-concurrent').concurrency, 100)
assert.equal(metric('PE-11-100-concurrent').successRate, 1)
assert.ok(metric('PE-11-100-concurrent').p99Ms <= 3000)
assert.ok(metric('PE-02-alert-ingest').p99Ms <= 2000)
assert.ok(metric('PE-09-attendance-check-in').p99Ms <= 1000)
assert.ok(metric('PE-05-position-processing').p99Ms <= 2000)
assert.equal(metric('PE-05-position-processing').accuracyPreserved, true)
assert.ok(metric('PE-01-PE-03-response-start').p99Ms <= 3000)
assert.ok(metric('PE-01-PE-03-response-start').confirmationToTaskMaxMs <= 180000)
assert.equal(performance.messageBatch.channels, 20)
assert.equal(performance.messageBatch.accepted, 20)

assert.equal(fault.status, 'PASS')
assert.equal(fault.assertions.unauthorizedRejected, true)
assert.equal(fault.assertions.messageFailureObserved, true)
assert.equal(fault.assertions.accessUnknownResultDegraded, true)
assert.equal(fault.assertions.controlWasNotAutomaticallyReplayed, true)

assert.equal(quality.status, 'PASS')
for (const component of [quality.frontend, quality.engineeringGuards, quality.backend]) {
  for (const value of Object.values(component.coverage)) assert.ok(value >= 70)
}
assert.equal(quality.openapi.errors, 0)
assert.equal(quality.dependencyAudit.highOrCritical, 0)
assert.equal(quality.secretScan.status, 'PASS')

assert.equal(environment.docker.status, 'BLOCKED')
assert.equal(environment.postgresql.recoveryDrill, 'BLOCKED')
assert.equal(environment.independentDeployer.status, 'BLOCKED')
assert.equal(environment.ownerExternalSystems.status, 'BLOCKED')

console.info(JSON.stringify({
  taskId: 'G5-02',
  status: 'PASS_WITH_EXTERNAL_BLOCKERS',
  checkedMetrics: performance.measurements.length,
  blockers: ['docker-clean-deploy', 'postgresql-recovery', 'independent-deployer', 'owner-external-systems'],
}, null, 2))
