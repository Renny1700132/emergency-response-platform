import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'

const root = new URL('../../evidence/g5/G5-02/', import.meta.url)
const text = async (name) => readFile(new URL(name, root), 'utf8')
const readJson = async (name) => JSON.parse(await text(name))
const performance = await readJson('performance-raw.json')
const fault = await readJson('fault-drill-raw.json')
const quality = await readJson('quality-summary.json')
const environment = await readJson('environment-readiness.json')
const externalReadiness = await readJson('external-resource-readiness.json')
const independentReadiness = await readJson('kn065-independent-deployer-readiness.json')
const courseProgression = await readJson('course-simulation-progression.json')
const courseExternalSystems = await readJson('course-conditional-external-systems.json')
const courseKn065Witness = await readJson('course-conditional-kn065-witness.json')
const dockerCleanDeploy = await readJson('docker-clean-deploy.json')
const postgresRecovery = await readJson('postgres-recovery-drill.json')
const manifest = await readJson('manifest.json')
const gitRefArgument = process.argv.find((argument) => argument.startsWith('--git-ref='))
const gitRef = gitRefArgument?.slice('--git-ref='.length) || null
const canonicalLf = (bytes) => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n'), 'utf8')

const manifestResults = []
let workspaceRawLineEndingDifferences = 0
let gitBlobMatches = 0
const evidenceFiles = (await readdir(root)).filter((name) => name !== 'manifest.json').sort()
assert.deepEqual(manifest.files.map((entry) => entry.file).sort(), evidenceFiles)
for (const entry of manifest.files) {
  const workspaceBytes = await readFile(new URL(entry.file, root))
  const bytes = canonicalLf(workspaceBytes)
  const actual = {
    file: entry.file,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }
  if (workspaceBytes.length !== bytes.length || !workspaceBytes.equals(bytes)) workspaceRawLineEndingDifferences += 1
  assert.equal(actual.bytes, entry.bytes, `canonical-LF workspace byte count mismatch: ${entry.file}`)
  assert.equal(actual.sha256, entry.sha256, `canonical-LF workspace SHA-256 mismatch: ${entry.file}`)
  manifestResults.push(actual)
  if (gitRef) {
    const blob = execFileSync('git', ['show', `${gitRef}:evidence/g5/G5-02/${entry.file}`], {
      encoding: null,
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    })
    assert.equal(blob.length, entry.bytes, `Git blob byte count mismatch: ${entry.file}`)
    assert.equal(createHash('sha256').update(blob).digest('hex'), entry.sha256, `Git blob SHA-256 mismatch: ${entry.file}`)
    gitBlobMatches += 1
  }
}
assert.equal(manifestResults.length, manifest.files.length)
assert.ok(manifestResults.length >= 23)

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

assert.equal(environment.docker.status, 'PASS')
assert.equal(environment.docker.cleanDeploy, 'PASS')
assert.equal(environment.postgresql.recoveryDrill, 'PASS')
assert.equal(environment.independentDeployer.status, 'REAL_WORLD_DEFERRED')
assert.equal(environment.ownerExternalSystems.status, 'REAL_WORLD_DEFERRED')
assert.equal(environment.independentDeployer.evidence, 'kn065-independent-deployer-readiness.json')
assert.equal(environment.ownerExternalSystems.evidence, 'external-resource-readiness.json')
assert.equal(environment.courseProgression.status, 'COURSE_CONDITIONAL_ACCEPTED_BY_C')
assert.equal(environment.courseProgression.evidenceClassification, 'SIMULATED_EVIDENCE')
assert.deepEqual(environment.courseProgression.realWorldDeferred, ['owner-external-systems', 'independent-deployer'])
assert.equal(courseProgression.decisionId, 'OVR-034')
assert.equal(courseProgression.status, 'COURSE_CONDITIONAL_ACCEPTED_BY_C')
assert.equal(courseProgression.evidenceClassification, 'SIMULATED_EVIDENCE')
assert.deepEqual(courseProgression.carriedBlockers, ['owner-external-systems', 'independent-deployer'])
assert.ok(courseProgression.notAcceptedFor.includes('claiming G5-02 has unconditional real-world acceptance'))
const authorization = '用户已明确授权：对无法取得的甲方六类系统和 KN-065 非乙方独立部署，采用 `SIMULATED_EVIDENCE / COURSE_CONDITIONAL_ACCEPTANCE` 完成本课程阶段验收；真实项目能力继续登记为 `REAL_WORLD_DEFERRED / 后续补测`。不得生成假姓名、假账号、假接口响应、假执行时间、假退出码或冒充真实甲方/第三方人员。'
assert.equal(courseProgression.userAuthorization, authorization)
assert.equal(independentReadiness.controlId, 'KN-065')
assert.equal(independentReadiness.status, 'REAL_WORLD_DEFERRED')
assert.equal(independentReadiness.courseStageStatus, 'COURSE_ACCEPTED_BY_C')
assert.equal(independentReadiness.operator.auditableIdentity, null)
assert.equal(independentReadiness.execution.exitCode, null)
assert.equal(externalReadiness.status, 'REAL_WORLD_DEFERRED')
assert.equal(externalReadiness.courseStageStatus, 'COURSE_ACCEPTED_BY_C')
assert.equal(externalReadiness.summary.expectedSystems, 6)
assert.equal(externalReadiness.summary.availableSystems, 0)
assert.equal(externalReadiness.summary.testedSystems, 0)
assert.deepEqual(externalReadiness.systems.map((item) => item.id), ['VIDEO', 'MESSAGE', 'LOCATION', 'GIS', 'SECURITY', 'PUBLISH'])
for (const system of externalReadiness.systems) {
  assert.equal(system.status, 'BLOCKED')
  assert.equal(system.verification, 'NOT_RUN')
  assert.ok(system.missingInputs.length > 0)
}
assert.equal(courseExternalSystems.decisionId, 'OVR-034')
assert.equal(courseExternalSystems.classification, 'SIMULATED_EVIDENCE')
assert.equal(courseExternalSystems.environment, 'NOT_OWNER_ENVIRONMENT')
assert.equal(courseExternalSystems.userAuthorization, authorization)
assert.deepEqual(courseExternalSystems.systems.map((item) => item.id), ['VIDEO', 'MESSAGE', 'LOCATION', 'GIS', 'SECURITY', 'PUBLISH'])
for (const system of courseExternalSystems.systems) {
  assert.equal(system.classification, 'SIMULATED_EVIDENCE / NOT_OWNER_ENVIRONMENT')
  assert.equal(system.courseResult, 'COURSE_ACCEPTED_BY_C')
  assert.equal(system.realWorldResult, 'REAL_WORLD_NOT_RUN')
  assert.ok(system.simulatedScenario)
  assert.ok(system.input)
  assert.ok(system.expected)
  assert.ok(system.actualResult)
  assert.ok(system.fixtureEvidence.length > 0)
  assert.ok(system.testEvidence.length > 0)
}
assert.equal(courseExternalSystems.summary.systemsCovered, 6)
assert.equal(courseExternalSystems.summary.ownerSystemsTested, 0)
assert.equal(courseExternalSystems.summary.ownerSystemsPassed, 0)
assert.equal(courseKn065Witness.decisionId, 'OVR-034')
assert.equal(courseKn065Witness.classification, 'SIMULATED_EVIDENCE')
assert.equal(courseKn065Witness.courseWitnessRole, 'SIMULATED_COURSE_ROLE')
assert.equal(courseKn065Witness.notARealIndependentHuman, true)
assert.equal(courseKn065Witness.personalIdentity, null)
assert.equal(courseKn065Witness.signature, null)
assert.equal(courseKn065Witness.fabricatedExecutionFields, false)
assert.equal(courseKn065Witness.sourceExecution.evidence, 'docker-clean-deploy.json')
assert.equal(courseKn065Witness.sourceExecution.durationSeconds, dockerCleanDeploy.durationSeconds)
assert.equal(courseKn065Witness.sourceExecution.healthStatus, dockerCleanDeploy.healthStatus)
assert.equal(courseKn065Witness.sourceExecution.readyStatus, dockerCleanDeploy.readyStatus)
assert.equal(courseKn065Witness.sourceExecution.readyAfterRestartStatus, dockerCleanDeploy.readyAfterRestartStatus)
assert.equal(courseKn065Witness.courseStageResult, 'COURSE_ACCEPTED_BY_C')
assert.equal(courseKn065Witness.realWorldResult, 'REAL_WORLD_NOT_RUN')
assert.equal(dockerCleanDeploy.status, 'PASS')
assert.equal(dockerCleanDeploy.withinTwoHours, true)
assert.ok(dockerCleanDeploy.durationSeconds <= 7200)
assert.equal(dockerCleanDeploy.healthStatus, 200)
assert.equal(dockerCleanDeploy.readyStatus, 200)
assert.equal(dockerCleanDeploy.readyAfterRestartStatus, 200)
assert.equal(postgresRecovery.status, 'PASS')
for (const value of Object.values(postgresRecovery.assertions)) assert.equal(value, true)

console.info(JSON.stringify({
  taskId: 'G5-02',
  status: 'PASS_WITH_COURSE_WAIVERS',
  checkedMetrics: performance.measurements.length,
  rawSamples: rawSampleCount,
  csvRows: csvRows.length,
  manifestFiles: manifestResults.length,
  workspaceCanonicalManifest: manifestResults.length,
  workspaceRawLineEndingDifferences,
  gitRef,
  gitBlobManifest: gitRef ? gitBlobMatches : null,
  courseAcceptedByC: ['owner-external-systems', 'independent-deployer'],
  realWorldDeferred: ['owner-external-systems', 'independent-deployer'],
  unconditionalRealWorldPass: false,
}, null, 2))
