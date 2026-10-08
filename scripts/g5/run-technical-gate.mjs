import { mkdir, writeFile } from 'node:fs/promises'
import { performance } from 'node:perf_hooks'
import os from 'node:os'
import { createServer } from '../../backend/src/server.mjs'
import { loadConfig } from '../../backend/src/config.mjs'
import { createSprint2Service } from '../../backend/src/sprint2-service.mjs'

const outputDirectory = new URL('../../evidence/g5/G5-02/', import.meta.url)
await mkdir(outputDirectory, { recursive: true })

const actorHeaders = {
  'content-type': 'application/json',
  'x-actor-id': 'g5-b-verifier',
  'x-actor-roles': 'emergency.read,emergency.write',
}

const externalCalls = []
let injectedScenario = 'normal'
const adapters = {
  async invoke(adapter, action, payload, context = {}) {
    const record = { adapter, action, scenario: context.scenario ?? injectedScenario, traceId: context.traceId, at: new Date().toISOString() }
    externalCalls.push(record)
    if (record.scenario === 'timeout') throw Object.assign(new Error('injected timeout'), { code: 'EXTERNAL_TIMEOUT', attempts: adapter === 'EXT-MESSAGE' ? 2 : 1 })
    if (record.scenario === 'failure') throw Object.assign(new Error('injected failure'), { code: 'EXTERNAL_FAILURE', attempts: 1 })
    return { marker: 'SIMULATED_EVIDENCE', status: 'ACCEPTED', adapter, action, streamId: 'simulated-stream', interlock: 'ALLOWED' }
  },
}
const sprint2Service = createSprint2Service({ adapters })
const messageAttempts = []
const messagePort = {
  async sendTask(task) {
    messageAttempts.push({ taskId: task.id, at: new Date().toISOString(), scenario: injectedScenario })
    if (injectedScenario === 'timeout') throw Object.assign(new Error('injected message timeout'), { code: 'MESSAGE_TIMEOUT' })
    return { marker: 'SIMULATED_EVIDENCE', status: 'ACCEPTED' }
  },
}
const planProvider = {
  async loadPublishedPlan(id) {
    return id === 'g5-plan-v1' ? { id, status: 'PUBLISHED', templates: [{ id: 'g5-template-1', name: '现场处置', assigneeRef: 'g5-b-verifier', deadlineMinutes: 5 }] } : null
  },
}
const server = createServer({
  config: loadConfig({ NODE_ENV: 'development', ALLOW_DEVELOPMENT_IDENTITY_HEADERS: 'true' }),
  logger: { info() {} }, messagePort, planProvider, sprint2Service,
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const baseUrl = `http://127.0.0.1:${server.address().port}`

async function request(path, { method = 'GET', body, key, headers = {} } = {}) {
  const traceId = `g5-${crypto.randomUUID()}`
  const started = performance.now()
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...actorHeaders, ...headers, 'x-trace-id': traceId, ...(key ? { 'x-idempotency-key': key } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = await response.json()
  return { path, method, status: response.status, traceId, durationMs: Number((performance.now() - started).toFixed(3)), payload }
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))]
}
function stats(samples) {
  const durations = samples.map((item) => item.durationMs)
  const successes = samples.filter((item) => item.status >= 200 && item.status < 300).length
  return {
    samples: samples.length,
    successes,
    failures: samples.length - successes,
    successRate: Number((successes / samples.length).toFixed(4)),
    minMs: Math.min(...durations),
    p50Ms: Number(percentile(durations, 0.50).toFixed(3)),
    p95Ms: Number(percentile(durations, 0.95).toFixed(3)),
    p99Ms: Number(percentile(durations, 0.99).toFixed(3)),
    maxMs: Math.max(...durations),
    percentileMethod: 'nearest-rank over all requests; failed requests remain in the sample',
  }
}
async function measured(id, count, concurrency, action) {
  const samples = []
  for (let offset = 0; offset < count; offset += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, count - offset) }, (_, index) => action(offset + index))
    samples.push(...await Promise.all(batch))
  }
  return { id, concurrency, ...stats(samples), samples }
}

const startedAt = new Date().toISOString()
const warmup = []
for (let index = 0; index < 20; index += 1) warmup.push(await request('/api/v1/incidents?page=1&size=50'))

const ordinaryReads = await measured('PE-07-ordinary-api', 500, 50, () => request('/api/v1/incidents?page=1&size=50'))
const concurrentReads = await measured('PE-11-100-concurrent', 300, 100, () => request('/api/v1/incidents?page=1&size=50'))

const alertSamples = await measured('PE-02-alert-ingest', 60, 20, (index) => request('/integration/v1/alerts/iot', {
  method: 'POST', key: `g5-alert-${index}`,
  body: { externalAlertId: `g5-alert-${index}`, type: 'SMOKE', occurredAt: new Date().toISOString(), scenario: 'normal' },
}))

await request('/api/v1/check-points', { method: 'POST', key: 'g5-checkpoint', body: { id: 'g5-checkpoint', name: 'G5 test point', x: 0, y: 0, radiusMetres: 10, qrVersion: 'v1' } })
const validFrom = new Date(Date.now() - 60_000).toISOString()
const validTo = new Date(Date.now() + 600_000).toISOString()
const checkInSamples = await measured('PE-09-attendance-check-in', 40, 10, (index) => request('/api/v1/attendance/check-ins', {
  method: 'POST', key: `g5-checkin-http-${index}`,
  body: { pointId: 'g5-checkpoint', qrVersion: 'v1', validFrom, validTo, position: { x: 1, y: 1 }, idempotencyKey: `g5-checkin-${index}` },
}))

const positionSamples = []
for (let index = 0; index < 40; index += 1) {
  const sourceAt = new Date()
  const begin = performance.now()
  const record = await sprint2Service.recordPosition({ personId: `g5-person-${index}`, x: index, y: index, sourceAt: sourceAt.toISOString(), sourceAccuracyMetres: 0.5, freshnessThresholdMs: 2000 }, 'g5-b-verifier')
  positionSamples.push({ path: 'sprint2Service.recordPosition', method: 'DIRECT_SERVICE', status: 200, traceId: `g5-position-${index}`, durationMs: Number((performance.now() - begin).toFixed(3)), sourceAccuracyMetres: 0.5, processedAccuracyMetres: record.processedAccuracyMetres, freshness: record.freshness })
}
const positions = { id: 'PE-05-position-processing', concurrency: 1, ...stats(positionSamples), accuracyPreserved: positionSamples.every((item) => item.sourceAccuracyMetres === item.processedAccuracyMetres), samples: positionSamples }

const responseStarts = []
for (let index = 0; index < 20; index += 1) {
  const created = await request('/api/v1/incidents', { method: 'POST', key: `g5-create-${index}`, body: { incidentTypeCode: 'FIRE', title: `G5 incident ${index}`, description: 'performance run', occurredAt: new Date().toISOString() } })
  const verified = await request(`/api/v1/incidents/${created.payload.data.id}/verify`, { method: 'POST', key: `g5-verify-${index}`, body: { decision: 'CONFIRMED', reason: 'controlled run', resourceVersion: created.payload.data.version } })
  const start = await request(`/api/v1/incidents/${created.payload.data.id}/start-response`, { method: 'POST', key: `g5-start-${index}`, body: { planVersionId: 'g5-plan-v1', resourceVersion: verified.payload.data.version } })
  responseStarts.push({ ...start, confirmationToCompletionMs: verified.durationMs + start.durationMs })
}
const responseStart = { id: 'PE-01-PE-03-response-start', concurrency: 1, ...stats(responseStarts), confirmationToTaskMaxMs: Math.max(...responseStarts.map((item) => item.confirmationToCompletionMs)), samples: responseStarts }

const messageBatchStarted = performance.now()
const messageBatch = await Promise.all(Array.from({ length: 20 }, (_, index) => messagePort.sendTask({ id: `g5-message-${index}` })))
const messageBatchMs = Number((performance.now() - messageBatchStarted).toFixed(3))

const mapReads = await measured('PE-08-resource-map-api', 100, 20, () => request('/api/v1/situation/resource-map'))
const statisticsReads = await measured('PE-12-statistics-api', 100, 20, () => request('/api/v1/statistics/emergency'))

const unauthorized = await request('/api/v1/incidents?page=1&size=50', { headers: { 'x-actor-id': '', 'x-actor-roles': '' } })
injectedScenario = 'timeout'
let messageFailure
try { await messagePort.sendTask({ id: 'g5-message-fault' }) } catch (error) { messageFailure = { code: error.code, message: error.message } }
const accessFault = await request('/api/v1/incidents/g5-fault/access-control-commands', {
  method: 'POST', key: 'g5-access-fault',
  body: { doorRef: 'door-1', action: 'REQUEST_OPEN', reason: 'controlled fault drill', confirmationToken: 'one-time-confirmation', scenario: 'timeout' },
})
injectedScenario = 'normal'

const performanceEvidence = {
  schemaVersion: 1, taskId: 'G5-02', generatedAt: new Date().toISOString(), startedAt,
  environment: {
    node: process.version, platform: process.platform, release: os.release(), arch: process.arch,
    cpu: os.cpus()[0]?.model, logicalCpu: os.cpus().length, totalMemoryBytes: os.totalmem(),
    server: 'real local Node HTTP listener; in-memory persistence; simulated external adapters',
  },
  warmupRequests: warmup.length,
  measurements: [ordinaryReads, concurrentReads, alertSamples, checkInSamples, positions, responseStart, mapReads, statisticsReads],
  messageBatch: { evidenceKind: 'SIMULATED_EVIDENCE', channels: 20, accepted: messageBatch.filter((item) => item.status === 'ACCEPTED').length, successRate: messageBatch.filter((item) => item.status === 'ACCEPTED').length / 20, durationMs: messageBatchMs },
  boundaries: [
    'PE-07 and PE-11 are controlled local API measurements without production network or target-volume PostgreSQL.',
    'PE-02, PE-04, PE-05, PE-08, PE-09 and PE-12 are local technical-path measurements; owner sources, browser rendering and target data scale remain separate acceptance evidence.',
    'PE-06 video first-frame and 30-day retention require the owner video system and were not executed.',
  ],
}

const faultEvidence = {
  schemaVersion: 1, taskId: 'G5-02', generatedAt: new Date().toISOString(),
  drill: 'controlled external timeout and message failure injection',
  evidenceKind: 'LOCAL_CONTROLLED_WITH_SIMULATED_EXTERNAL_FAILURE',
  unauthorized: { expectedStatus: 403, actualStatus: unauthorized.status, traceId: unauthorized.traceId },
  messageFailure,
  accessControl: { httpStatus: accessFault.status, state: accessFault.payload?.data?.status, automaticReplay: accessFault.payload?.data?.automaticReplay, traceId: accessFault.traceId },
  externalCalls: externalCalls.filter((item) => item.scenario !== 'normal'),
  assertions: {
    unauthorizedRejected: unauthorized.status === 403,
    messageFailureObserved: messageFailure?.code === 'MESSAGE_TIMEOUT',
    accessUnknownResultDegraded: accessFault.payload?.data?.status === 'MANUAL_DEGRADATION',
    controlWasNotAutomaticallyReplayed: accessFault.payload?.data?.automaticReplay === false,
  },
  databaseRecovery: { status: 'BLOCKED', reason: 'A PostgreSQL service is listening locally, but no authorized test credential/DATABASE_URL is available for this execution.' },
  longAvailability: { status: 'NOT_RUN', reason: 'A short controlled drill cannot prove 7x24 or >=99.5% trial-operation availability.' },
}
faultEvidence.status = Object.values(faultEvidence.assertions).every(Boolean) ? 'PASS' : 'FAIL'

const csvHeader = 'metric,index,method,path,status,duration_ms,trace_id\n'
const csvRows = performanceEvidence.measurements.flatMap((metric) => metric.samples.map((sample, index) => [metric.id, index + 1, sample.method, sample.path, sample.status, sample.durationMs, sample.traceId].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')))
await writeFile(new URL('performance-raw.json', outputDirectory), `${JSON.stringify(performanceEvidence, null, 2)}\n`)
await writeFile(new URL('performance-samples.csv', outputDirectory), csvHeader + csvRows.join('\n') + '\n')
await writeFile(new URL('fault-drill-raw.json', outputDirectory), `${JSON.stringify(faultEvidence, null, 2)}\n`)

await new Promise((resolve) => server.close(resolve))

const localGatesPass = ordinaryReads.p95Ms <= 3000 && concurrentReads.successRate === 1 && concurrentReads.p99Ms <= 3000 &&
  alertSamples.p99Ms <= 2000 && checkInSamples.p99Ms <= 1000 && positions.p99Ms <= 2000 && positions.accuracyPreserved &&
  responseStart.p99Ms <= 3000 && responseStart.confirmationToTaskMaxMs <= 180000 && messageBatch.length === 20 && faultEvidence.status === 'PASS'
console.info(JSON.stringify({ taskId: 'G5-02', localTechnicalGate: localGatesPass ? 'PASS' : 'FAIL', outputDirectory: 'evidence/g5/G5-02', metrics: performanceEvidence.measurements.map(({ id, samples, ...summary }) => ({ id, ...summary })), faultDrill: faultEvidence.status }, null, 2))
if (!localGatesPass) process.exitCode = 1
