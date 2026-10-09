import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const outputDirectory = path.join(root, 'evidence', 'g5', 'G5-01')
await mkdir(outputDirectory, { recursive: true })

const execute = (id, command, args, options = {}) => {
  const startedAt = new Date().toISOString()
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    maxBuffer: 20 * 1024 * 1024,
  })
  return {
    id,
    command: options.displayCommand ?? [command, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status,
    status: result.status === 0 ? 'PASS' : 'FAIL',
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? result.error?.message ?? '').trim(),
  }
}

const npm = (id, args, options = {}) => process.platform === 'win32'
  ? execute(id, process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe', ['/d', '/s', '/c', ['npm', ...args].join(' ')], { ...options, displayCommand: options.displayCommand ?? ['npm', ...args].join(' ') })
  : execute(id, 'npm', args, options)

const suites = [
  execute('unit-domain-and-guards', process.execPath, ['--test',
    'tests/backend/event-workflow.test.mjs',
    'tests/g4/selfcheck.test.mjs',
    'tests/g4/secret-scan.test.mjs',
    'tests/g4/integration-simulator.test.mjs',
  ]),
  execute('integration-backend', process.execPath, ['--test',
    'tests/backend/foundation.test.mjs',
    'tests/backend/g4-05-integration.test.mjs',
    'tests/backend/g4-05-recovery.test.mjs',
    'tests/backend/g4-08-sprint2.test.mjs',
  ]),
  npm('frontend-mixed-unit-component-contract-and-one-http-e2e', ['run', 'test', '--prefix', 'frontend', '--', '--reporter=verbose']),
  npm('coverage-frontend', ['run', 'test:frontend:coverage']),
  npm('coverage-backend', ['run', 'test:backend:coverage']),
  npm('frontend-typecheck', ['run', 'typecheck', '--prefix', 'frontend']),
]

const databaseUrl = process.env.G4_DATABASE_URL
let databaseSuite
if (!databaseUrl) {
  databaseSuite = {
    id: 'integration-postgresql',
    command: 'npm run test:g4-05:postgres (DATABASE_URL supplied from protected G4_DATABASE_URL)',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    exitCode: null,
    status: 'BLOCKED',
    stdout: '',
    stderr: 'Protected local PostgreSQL test connection is unavailable.',
  }
} else {
  const parsed = new URL(databaseUrl)
  const safeTarget = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
    && parsed.pathname.replace(/^\//, '') === 'emergency_g4_test'
  databaseSuite = safeTarget
    ? execute('integration-postgresql', process.platform === 'win32' ? (process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe') : 'npm',
      process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run test:g4-05:postgres'] : ['run', 'test:g4-05:postgres'],
      { env: { DATABASE_URL: databaseUrl }, displayCommand: 'npm run test:g4-05:postgres (protected local test database)' })
    : {
      id: 'integration-postgresql',
      command: 'npm run test:g4-05:postgres (protected local test database)',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      exitCode: null,
      status: 'BLOCKED',
      stdout: '',
      stderr: 'Protected database target is not the approved localhost/emergency_g4_test isolation target.',
    }
}
suites.push(databaseSuite)

const systemPostgresqlSuite = databaseSuite.status === 'PASS'
  ? npm('system-web-h5-http-postgresql', ['run', 'test', '--prefix', 'frontend', '--', '--run', 'tests/postgresql-system-e2e.test.ts', '--reporter=verbose'], {
    env: { G5_SYSTEM_POSTGRES: 'true', G4_DATABASE_URL: databaseUrl },
    displayCommand: 'npm run test --prefix frontend -- --run tests/postgresql-system-e2e.test.ts --reporter=verbose (protected local test database)',
  })
  : {
    id: 'system-web-h5-http-postgresql',
    command: 'npm run test --prefix frontend -- --run tests/postgresql-system-e2e.test.ts (protected local test database)',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    exitCode: null,
    status: 'BLOCKED',
    stdout: '',
    stderr: 'The isolated PostgreSQL integration suite must pass before the Web/H5 system package can run.',
  }
suites.push(systemPostgresqlSuite)

const browserCandidates = [
  { family: 'Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { family: 'Chrome', path: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' },
  { family: 'Edge', path: 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe' },
  { family: 'Edge', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
]
const browsers = []
for (const candidate of browserCandidates) {
  if (!existsSync(candidate.path) || browsers.some((item) => item.family === candidate.family)) continue
  const versionResult = process.platform === 'win32'
    ? spawnSync('powershell', ['-NoProfile', '-Command', `(Get-Item -LiteralPath '${candidate.path.replaceAll("'", "''")}').VersionInfo.ProductVersion`], { encoding: 'utf8' })
    : { status: 1, stdout: '' }
  browsers.push({ family: candidate.family, version: (versionResult.stdout ?? '').trim() || 'unknown', executable: candidate.path })
}

const commit = execute('git-head', 'git', ['rev-parse', 'HEAD'])
const gitStatus = execute('git-status', 'git', ['status', '--short'])
const localSuitesPass = suites.every((suite) => suite.status === 'PASS')
const suiteStatus = new Map(suites.map((suite) => [suite.id, suite.status]))
const spec = await readFile(path.join(root, 'docs', 'work', 'B_TECH', 'spec.md'), 'utf8')
const acEntries = [...spec.matchAll(/- (AC-G2-FR-(\d{3})-(0[1-3]))：(.+)/g)].map((match) => ({
  acId: match[1],
  frId: `G2-FR-${match[2]}`,
  frNumber: Number(match[2]),
  expected: match[4].trim(),
}))
if (acEntries.length !== 117) throw new Error(`Expected 117 AC entries, found ${acEntries.length}`)

// A passing suite never promotes unrelated ACs. PASS is an AC-level allow-list
// with a named test, a concrete assertion and an observed value.
const systemEvidence = ['frontend/tests/postgresql-system-e2e.test.ts', 'evidence/g5/G5-01/functional-gate-raw.json']
const verifiedAc = {
  'AC-G2-FR-013-01': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'mounted Web form creates a PostgreSQL incident with a traceable incident number', actualValue: 'status=PENDING_VERIFICATION; created_by=commander; incident_no matches INC-*', evidence: systemEvidence },
  'AC-G2-FR-013-02': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'combined time, status, type and keyword query returns only the matching PostgreSQL incident', actualValue: 'total=1; returned incident id equals created incident id', evidence: systemEvidence },
  'AC-G2-FR-013-03': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'invalid Bearer identity is rejected with reason, creates no incident and records denied audit', actualValue: 'HTTP 403 AUTH_FORBIDDEN; incident count unchanged; denied audit count=1', evidence: systemEvidence },
  'AC-G2-FR-014-01': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'verification stores decision, reason, actor, time and changes incident state', actualValue: 'decision=VERIFIED; reason and actor persisted; occurred_at present', evidence: systemEvidence },
  'AC-G2-FR-014-02': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL_WITH_SIMULATED_MESSAGE', testCase: 'core positive and negative system flow', assertion: 'verified incident enters responding state and links the published plan and generated task', actualValue: 'incident.status=RESPONDING; plan_version_id=plan-system-v1; task persisted', evidence: systemEvidence },
  'AC-G2-FR-015-01': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL_WITH_SIMULATED_MESSAGE', testCase: 'core positive and negative system flow', assertion: 'generated task persists event, assignee, deadline, status and delivery receipt', actualValue: 'incident_id, assignee_ref, deadline_at, PENDING and ACCEPTED persisted', evidence: systemEvidence },
  'AC-G2-FR-015-02': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'accepted task feedback persists content, attachment, time and processing status', actualValue: 'content, file-system-1, occurred_at and IN_PROGRESS persisted', evidence: systemEvidence },
  'AC-G2-FR-022-01': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'mounted H5 page acknowledges the task and PostgreSQL records state and audit trail', actualValue: 'task.status=ACKNOWLEDGED; TASK_ACKNOWLEDGED allowed audit persisted', evidence: systemEvidence },
  'AC-G2-FR-022-02': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL', testCase: 'core positive and negative system flow', assertion: 'formal H5 workflow feedback associates task, upload result and time in PostgreSQL', actualValue: 'task_id, attachment_file_ids=[file-system-1] and occurred_at persisted', evidence: systemEvidence },
  'AC-G2-FR-028-01': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_H5_HTTP_POSTGRESQL_WITH_IDENTITY_SEAM', testCase: 'core positive and negative system flow', assertion: 'platform context grants configured permissions while invalid identity is denied and audited', actualValue: 'authenticated context; invalid token HTTP 403; denied audit persisted', evidence: systemEvidence },
  'AC-G2-FR-029-02': { suite: 'system-web-h5-http-postgresql', layer: 'SYSTEM_WEB_HTTP_POSTGRESQL_WITH_SIMULATED_ACCESS_INTERLOCK', testCase: 'remaining MVP workbenches and confirmed access control', assertion: 'no command is sent before confirmation; confirmed UI action dispatches once and waits for interlock receipt before accepting', actualValue: 'pre-confirm calls=0; post-confirm calls=1; interlock=ALLOWED; command.status=ACCEPTED persisted', evidence: systemEvidence },
}

const partialAc = {
  'AC-G2-FR-003-03': { testCase: 'G5-02 PE-01/03 local start-response measurement', assertion: 'target channel remains required even though the local path is fast', actualValue: 'local P99=2.331ms; simulated message port; target channel NOT_RUN', evidence: ['evidence/g5/G5-02/performance-raw.json', 'docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-005-02': { testCase: 'G5-02 PE-05 direct position-processing measurement', assertion: 'source precision is preserved, but continuous target-source refresh was not executed', actualValue: 'local P99=0.181ms; source accuracy 0.5m preserved; continuous ≤2s refresh NOT_RUN', evidence: ['evidence/g5/G5-02/performance-raw.json', 'docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-006-03': { testCase: 'G5-02 PE-06 target video check', assertion: 'first-frame and retention evidence require the existing video system', actualValue: 'NOT_RUN; target video system and ≥30-day retention evidence unavailable', evidence: ['docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-014-03': { testCase: 'G5-02 PE-02 and PE-01/03 local measurements', assertion: 'local routes were measured but target alert/task channels were simulated', actualValue: 'alert P99=14.443ms; start-response P99=2.331ms; target channels NOT_RUN', evidence: ['evidence/g5/G5-02/performance-raw.json', 'docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-020-03': { testCase: 'G5-02 PE-04 simulated message concurrency', assertion: '20-way simulated channel result cannot replace the normal acceptance channel', actualValue: '20/20 accepted; 100%; 0.037ms; acceptance channel NOT_RUN', evidence: ['evidence/g5/G5-02/performance-raw.json', 'docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-022-03': { testCase: 'G5-02 PE-04 simulated message concurrency', assertion: 'task completion passed locally, while delivery-rate acceptance remains external', actualValue: '20/20 accepted on simulated channel; acceptance channel NOT_RUN', evidence: ['evidence/g5/G5-02/performance-raw.json', 'docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-024-03': { testCase: 'G5-02 PE-09 local check-in API measurement', assertion: 'local API is below one second but real QR/location/H5 host was not executed', actualValue: 'local API P99=3.697ms; real scan/H5 host NOT_RUN', evidence: ['evidence/g5/G5-02/performance-raw.json', 'docs/work/B_TECH/g5_technical_validation.md'] },
  'AC-G2-FR-026-03': { testCase: 'G5-02 PE-10 target security refresh check', assertion: 'refresh timing requires the target security/information-publishing chain', actualValue: 'NOT_RUN; target security refresh chain unavailable', evidence: ['docs/work/B_TECH/g5_technical_validation.md'] },
}

const results = acEntries.map((entry) => {
  if (entry.frNumber >= 30) return { ...entry, result: 'BLOCKED', executionKind: 'NOT_RUN_NOT_IMPLEMENTED', testCase: 'N/A', assertion: 'N/A', actualValue: 'N/A', evidence: [], note: 'G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists.' }
  const verified = verifiedAc[entry.acId]
  if (verified) {
    const passed = suiteStatus.get(verified.suite) === 'PASS'
    return { ...entry, result: passed ? 'PASS' : 'BLOCKED', executionKind: verified.layer, testCase: verified.testCase, assertion: verified.assertion, actualValue: passed ? verified.actualValue : 'Required suite did not pass', evidence: verified.evidence, note: '判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。' }
  }
  const partial = partialAc[entry.acId]
  if (partial) return { ...entry, result: 'BLOCKED', executionKind: 'PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING', ...partial, note: '保留本地实测值但不提升为PASS；G5-02本身仍待C整体Review且目标环境/真实通道缺失。' }
  const requiresTargetEvidence = /KN-\d{3}|目标环境|验收通道|既有系统|接口/.test(entry.expected)
  return { ...entry, result: requiresTargetEvidence ? 'BLOCKED' : 'NOT_RUN', executionKind: requiresTargetEvidence ? 'BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE' : 'NOT_RUN_NO_AC_LEVEL_ASSERTION', testCase: 'N/A', assertion: 'N/A', actualValue: 'N/A', evidence: [], note: requiresTargetEvidence ? '现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。' : '现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。' }
})

const counts = results.reduce((summary, item) => {
  summary[item.result] = (summary[item.result] ?? 0) + 1
  return summary
}, {})
const starFr = new Set([1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,35,36,37,39])
const starSummary = [...starFr].reduce((summary, fr) => {
  const frResults = results.filter((item) => item.frNumber === fr)
  const status = frResults.every((item) => item.result === 'PASS') ? 'PASS' : 'BLOCKED'
  summary[status] = (summary[status] ?? 0) + 1
  return summary
}, {})

const evidence = {
  schemaVersion: 2,
  taskId: 'G5-01',
  generatedAt: new Date().toISOString(),
  commit: commit.stdout,
  testedSource: gitStatus.stdout ? `${commit.stdout} + controlled G5-01 worktree changes` : commit.stdout,
  workingTreeChanges: gitStatus.stdout.split(/\r?\n/).filter(Boolean),
  environment: { node: process.version, platform: process.platform, arch: process.arch, browsers },
  scope: { fr: 39, ac: 117, starFr: 34 },
  suites,
  resultSummary: counts,
  starSummary,
  compatibility: {
    status: 'BLOCKED',
    required: 'Chrome and Edge latest two stable versions plus confirmed Android/iOS H5 host matrix',
    observed: browsers,
    missing: ['Chrome latest two stable versions', 'Edge second stable version', 'Android H5 host/device matrix', 'iOS H5 host/device matrix'],
  },
  acResults: results,
  overall: counts.PASS === 117 && starSummary.PASS === 34 ? 'PASS' : 'BLOCKED',
}

await writeFile(path.join(outputDirectory, 'functional-gate-raw.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
const matrixRows = results.map((item) => `| ${item.frId} | ${item.acId} | ${item.result} | ${item.executionKind} | ${item.testCase.replaceAll('|', '\\|')} | ${item.assertion.replaceAll('|', '\\|')} | ${item.actualValue.replaceAll('|', '\\|')} | ${item.evidence.join('<br>') || 'N/A'} | ${item.note.replaceAll('|', '\\|')} |`)
const matrix = `# G5-01 117 AC 实际执行矩阵\n\n` +
  `- 执行版本：\`${commit.stdout}\` + 本次G5-01受控工作树修改（明细见原始JSON；提交后由A按新HEAD复验）\n` +
  `- 汇总：PASS ${counts.PASS ?? 0} / FAIL ${counts.FAIL ?? 0} / BLOCKED ${counts.BLOCKED ?? 0} / NOT_RUN ${counts.NOT_RUN ?? 0}\n` +
  `- ★需求汇总：PASS ${starSummary.PASS ?? 0} / BLOCKED ${starSummary.BLOCKED ?? 0}（分母 34 个★FR）\n` +
  `- 判定规则：仅白名单中的逐AC测试名称、断言和实际值允许产生PASS；套件总绿不得批量提升AC。\n` +
  `- 边界：内存持久化与模拟外部端口均在执行类型中明示，不外推为Web/H5→API→PostgreSQL或甲方真实接口验收；FR-030—039未实现且按G5范围禁止新增实现。\n\n` +
  `| FR | AC | 结果 | 执行类型 | 测试用例/执行ID | 具体断言 | 实际值 | 本次证据 | 说明 |\n|---|---|---|---|---|---|---|---|---|\n${matrixRows.join('\n')}\n`
await writeFile(path.join(outputDirectory, 'ac-117-matrix.md'), matrix, 'utf8')
console.info(JSON.stringify({
  output: path.relative(root, path.join(outputDirectory, 'functional-gate-raw.json')),
  overall: evidence.overall,
  resultSummary: evidence.resultSummary,
  starSummary: evidence.starSummary,
  suites: suites.map(({ id, status, exitCode }) => ({ id, status, exitCode })),
}, null, 2))

if (!localSuitesPass) process.exitCode = 1
