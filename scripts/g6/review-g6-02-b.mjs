import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message) => { throw new Error(message); };
const countBy = (rows, key) => rows.reduce((out, row) => {
  const value = row[key];
  out[value] = (out[value] ?? 0) + 1;
  return out;
}, {});
const gitBytes = (commit, file) => execFileSync(
  'git',
  ['show', `${commit}:${file}`],
  { cwd: root, encoding: null, maxBuffer: 64 * 1024 * 1024 }
);
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const variants = (bytes) => {
  if (bytes.includes(0)) return [bytes];
  const lf = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  const crlf = Buffer.from(lf.toString('utf8').replace(/\n/g, '\r\n'), 'utf8');
  return [bytes, lf, crlf];
};
const fingerprintMatches = (bytes, item) => variants(bytes).some((candidate) => (
  candidate.length === item.bytes && digest(candidate) === item.sha256
));

const delivery = read('evidence/g6/G6-02/delivery-index.json');
const increment = read('evidence/g6/G6-02/rtm-acceptance-increment.json');
const source = read('evidence/g5/G5-03/rtm-v5.json');
const performance = read('evidence/g5/G5-02/performance-raw.json');

if (delivery.items.length !== 29) fail('delivery index must contain 29 items');
if (new Set(delivery.items.map((item) => item.id)).size !== 29) fail('delivery IDs must be unique');
const availability = countBy(delivery.items, 'availability');
if (availability.AVAILABLE !== 20 || availability.NOT_AVAILABLE !== 9) fail('initial availability must remain 20/9');
for (const item of delivery.items.filter((entry) => entry.availability === 'AVAILABLE')) {
  if (!item.inputSnapshotCommit) fail(`available item lacks input snapshot: ${item.id}`);
  const snapshot = gitBytes(item.inputSnapshotCommit, item.file);
  const worktree = fs.readFileSync(path.join(root, item.file));
  if (!fingerprintMatches(snapshot, item) && !fingerprintMatches(worktree, item)) {
    fail(`snapshot/worktree fingerprint mismatch: ${item.id}`);
  }
}

if (increment.rows.length !== 117 || source.rows.length !== 117) fail('RTM row count must be 117');
const sourceByAc = new Map(source.rows.map((row) => [row.acId, row]));
const compareFields = [
  ['frId', 'frId'],
  ['star', 'star'],
  ['plannedTC', 'plannedTC'],
  ['actualResult', 'result'],
  ['courseStatus', 'courseStatus'],
  ['implementationStatus', 'implementationStatus'],
  ['rawLocator', 'rawLocator']
];
for (const row of increment.rows) {
  const original = sourceByAc.get(row.acId);
  if (!original) fail(`unknown AC: ${row.acId}`);
  for (const [incrementField, sourceField] of compareFields) {
    if (row[incrementField] !== original[sourceField]) {
      fail(`${row.acId} field drift: ${incrementField}`);
    }
  }
  if (JSON.stringify(row.deferredStatuses) !== JSON.stringify(original.deferredStatuses)) {
    fail(`${row.acId} deferred status drift`);
  }
  const expectedG6 = original.result === 'PASS' ? 'EVIDENCED_PASS_INPUT' : 'DEFERRED_NOT_ACCEPTED';
  if (row.g6AcceptanceStatus !== expectedG6) fail(`${row.acId} G6 acceptance status drift`);
}

const results = countBy(increment.rows, 'actualResult');
const frIds = new Set(increment.rows.map((row) => row.frId));
const starFrIds = new Set(increment.rows.filter((row) => row.star).map((row) => row.frId));
const byFr = Object.groupBy(increment.rows, (row) => row.frId);
const fullPassFr = Object.values(byFr).filter((rows) => rows.every((row) => row.actualResult === 'PASS')).length;
const starFullPass = Object.values(byFr).filter((rows) => rows[0].star && rows.every((row) => row.actualResult === 'PASS')).length;
const implementationDeferred = increment.rows.filter((row) => row.deferredStatuses.includes('IMPLEMENTATION_DEFERRED')).length;
const evidenceDeferred = increment.rows.filter((row) => row.deferredStatuses.includes('EVIDENCE_DEFERRED')).length;

if (frIds.size !== 39 || starFrIds.size !== 34) fail('FR or star-FR denominator drift');
if (results.PASS !== 11 || results.NOT_RUN !== 59 || results.BLOCKED !== 47) fail('AC result denominator drift');
if (fullPassFr !== 1 || starFullPass !== 1) fail('full-pass FR aggregation drift');
if (implementationDeferred !== 30 || evidenceDeferred !== 76) fail('deferred AC denominator drift');
if (increment.boundaries.ownerSystemsReal !== '0/6' || increment.boundaries.independentRealOperator !== 0) {
  fail('real-world boundary drift');
}

const performanceSamples = performance.measurements.reduce((total, metric) => total + metric.samples.length, 0);
const performanceFailures = performance.measurements.reduce((total, metric) => total + metric.failures, 0);
const performanceCsv = fs.readFileSync(
  path.join(root, 'evidence/g5/G5-02/performance-samples.csv'),
  'utf8'
).trim().split(/\r?\n/);
const performanceCsvRows = performanceCsv.length - 1;
const performanceCsvFailures = performanceCsv.slice(1).filter((line) => {
  const fields = line.replace(/^"|"$/g, '').split('","');
  return fields[4] !== '200';
}).length;
if (performance.measurements.length !== 8 || performanceSamples !== 1160 || performanceFailures !== 0) {
  fail('performance raw denominator or failure count drift');
}
if (performanceCsvRows !== 1160 || performanceCsvFailures !== 0) {
  fail('performance CSV denominator or status drift');
}

console.log(JSON.stringify({
  status: 'PASS',
  task: 'G6-02_B_REVIEW',
  reviewConclusion: 'ACCEPTED_FOR_INITIAL_G6_02_CANDIDATE',
  finalTaskStatus: 'REVIEW_PENDING_G6_01_AND_G6_03_INCREMENT',
  issueSummary: { blocker: 0, major: 0, minorClosed: 1, observation: 1 },
  deliveryItems: delivery.items.length,
  availability,
  rtmRows: increment.rows.length,
  fr: frIds.size,
  starFr: starFrIds.size,
  results,
  fullPassFr,
  starFullPass,
  deferred: { implementation: implementationDeferred, evidence: evidenceDeferred },
  snapshotHashes: 'PASS_WITH_CANDIDATE_EOL_NORMALIZATION',
  rowByRowMapping: 'PASS',
  performance: {
    metrics: performance.measurements.length,
    rawSamples: performanceSamples,
    csvSamples: performanceCsvRows,
    failures: performanceFailures
  },
  realWorld: { ownerSystems: '0/6', independentOperator: 0 }
}, null, 2));
