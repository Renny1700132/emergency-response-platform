import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'

const root = new URL('../../evidence/g5/G5-02/', import.meta.url)
const text = async (name) => readFile(new URL(name, root), 'utf8')
const readJson = async (name) => JSON.parse(await text(name))
const performance = await readJson('performance-raw.json')
const fault = await readJson('fault-drill-raw.json')
const quality = await readJson('quality-summary.json')
const environment = await readJson('environment-readiness.json')
const manifest = await readJson('manifest.json')

const manifestResults = []
const evidenceFiles = (await readdir(root)).filter((name) => name !== 'manifest.json').sort()
assert.deepEqual(manifest.files.map((entry) => entry.file).sort(), evidenceFiles)
for (const entry of manifest.files) {
  const bytes = await readFile(new URL(entry.file, root))
  const actual = {
    file: entry.file,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }
  assert.equal(actual.bytes, entry.bytes, `manifest byte count mismatch: ${entry.file}`)
  assert.equal(actual.sha256, entry.sha256, `manifest SHA-256 mismatch: ${entry.file}`)
  manifestResults.push(actual)
}
assert.equal(manifestResults.length, 13)

function parseCsvLine(line) {
  const fields = []
  const pattern = /"((?:""|[^"])*)"(?:,|$)/g
  let match
  while ((match = pattern.exec(line)) !== null) fields.push(match[1].replaceAll('""', '"'))
  return fields
}
const csvLines = (await text('performance-samples.csv')).trim().split(/\r?\n/)
assert.equal(csvLines.shift(), 'metric,index,method,path,status,duration_ms,trace_id')
const csvRows = csvLines.map((line) => {
  const [metricId, index, method, path, status, durationMs, traceId] = parseCsvLine(line)
  return { metricId, index: Number(index), method, path, status: Number(status), durationMs: Number(durationMs), traceId }
})

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))]
}
let rawSampleCount = 0
for (const measurement of performance.measurements) {
  rawSampleCount += measurement.samples.length
  const rows = csvRows.filter((item) => item.metricId === measurement.id)
  assert.equal(rows.length, measurement.samples.length, `CSV sample count mismatch: ${measurement.id}`)
  for (let index = 0; index < rows.length; index += 1) {
    const raw = measurement.samples[index]
    const csv = rows[index]
    assert.equal(csv.index, index + 1)
    assert.equal(csv.method, raw.method)
    assert.equal(csv.path, raw.path)
    assert.equal(csv.status, raw.status)
    assert.equal(csv.durationMs, raw.durationMs)
    assert.equal(csv.traceId, raw.traceId)
  }
  const durations = measurement.samples.map((item) => item.durationMs)
  const successes = measurement.samples.filter((item) => item.status >= 200 && item.status < 300).length
  assert.equal(measurement.successes, successes)
  assert.equal(measurement.failures, measurement.samples.length - successes)
  assert.equal(measurement.successRate, Number((successes / measurement.samples.length).toFixed(4)))
  assert.equal(measurement.minMs, Math.min(...durations))
  assert.equal(measurement.p50Ms, Number(percentile(durations, 0.50).toFixed(3)))
  assert.equal(measurement.p95Ms, Number(percentile(durations, 0.95).toFixed(3)))
  assert.equal(measurement.p99Ms, Number(percentile(durations, 0.99).toFixed(3)))
  assert.equal(measurement.maxMs, Math.max(...durations))
}
assert.equal(csvRows.length, rawSampleCount)
assert.equal(rawSampleCount, 1160)

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
const report = await readFile(new URL('../../docs/work/B_TECH/g5_technical_validation.md', import.meta.url), 'utf8')
assert.match(report, new RegExp(`耗时 ${performance.messageBatch.durationMs.toFixed(3)}ms`))

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
  rawSamples: rawSampleCount,
  csvRows: csvRows.length,
  manifestFiles: manifestResults.length,
  blockers: ['docker-clean-deploy', 'postgresql-recovery', 'independent-deployer', 'owner-external-systems'],
}, null, 2))
