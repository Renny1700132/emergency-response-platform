import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const outputFile = path.join(root, 'evidence', 'g5', 'G5-02', 'postgres-recovery-drill.json')
const pgBin = process.env.G5_PG_BIN || (process.platform === 'win32' ? 'E:\\PostgreSQL\\bin' : '')
if (!pgBin) throw new Error('Set G5_PG_BIN to the directory containing PostgreSQL client and server binaries')

const executable = (name) => path.join(pgBin, process.platform === 'win32' ? `${name}.exe` : name)
const events = []
function run(name, args, options = {}) {
  const startedAt = new Date().toISOString()
  const result = spawnSync(executable(name), args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
    ...(options.ignoreOutput ? { stdio: 'ignore' } : {}),
  })
  events.push({ step: name, startedAt, finishedAt: new Date().toISOString(), exitCode: result.status })
  if (result.status !== 0) throw new Error(`${name} failed: ${(result.stderr || result.stdout || result.error?.message || '').trim()}`)
  return (result.stdout || '').trim()
}
function runNode(args, env) {
  const startedAt = new Date().toISOString()
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  })
  events.push({ step: args.join(' '), startedAt, finishedAt: new Date().toISOString(), exitCode: result.status })
  if (result.status !== 0) throw new Error(`node ${args.join(' ')} failed: ${(result.stderr || result.stdout || result.error?.message || '').trim()}`)
  return (result.stdout || '').trim()
}
async function freePort() {
  const server = createServer()
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return port
}

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'g5-02-postgres-'))
const dataDirectory = path.join(temporaryRoot, 'data')
const serverLog = path.join(temporaryRoot, 'postgres.log')
const dumpFile = path.join(temporaryRoot, 'recovery.dump')
const port = await freePort()
const user = 'g5_admin'
const database = 'emergency_g5_test'
const hostArgs = ['-h', '127.0.0.1', '-p', String(port), '-U', user]
const databaseUrl = `postgresql://${user}@127.0.0.1:${port}/${database}`
let serverStarted = false

try {
  const version = run('initdb', ['--version'])
  run('initdb', ['-D', dataDirectory, '--username', user, '--auth', 'trust', '--encoding', 'UTF8', '--no-locale'])
  run('pg_ctl', ['-D', dataDirectory, '-l', serverLog, '-o', `-p ${port} -h 127.0.0.1`, '-w', 'start'], { ignoreOutput: true })
  serverStarted = true
  run('createdb', [...hostArgs, database])

  const migrationOutput = runNode(['backend/scripts/verify-migration.mjs'], { DATABASE_URL: databaseUrl })
  const migrationResult = JSON.parse(migrationOutput.split(/\r?\n/).filter(Boolean).at(-1))
  run('psql', [...hostArgs, '-d', database, '-v', 'ON_ERROR_STOP=1', '-c', `INSERT INTO em_audit_log(trace_id, actor_id, action, outcome, details) VALUES ('g5-recovery-sentinel', 'g5-b-verifier', 'RECOVERY_SENTINEL', 'allowed', '{"scope":"G5-02"}'::jsonb);`])

  const tableCountBefore = Number(run('psql', [...hostArgs, '-d', database, '-Atqc', `SELECT count(*) FROM pg_tables WHERE schemaname='public';`]))
  const sentinelBefore = Number(run('psql', [...hostArgs, '-d', database, '-Atqc', `SELECT count(*) FROM em_audit_log WHERE trace_id='g5-recovery-sentinel';`]))
  run('pg_dump', [...hostArgs, '-Fc', '-f', dumpFile, database])
  const dumpBytes = await readFile(dumpFile)
  const dumpSha256 = createHash('sha256').update(dumpBytes).digest('hex')

  run('pg_ctl', ['-D', dataDirectory, '-m', 'fast', '-w', 'stop'], { ignoreOutput: true })
  serverStarted = false
  run('pg_ctl', ['-D', dataDirectory, '-l', serverLog, '-o', `-p ${port} -h 127.0.0.1`, '-w', 'start'], { ignoreOutput: true })
  serverStarted = true
  const sentinelAfterRestart = Number(run('psql', [...hostArgs, '-d', database, '-Atqc', `SELECT count(*) FROM em_audit_log WHERE trace_id='g5-recovery-sentinel';`]))

  run('dropdb', [...hostArgs, database])
  run('createdb', [...hostArgs, database])
  run('pg_restore', [...hostArgs, '-d', database, '--exit-on-error', dumpFile])
  const tableCountAfter = Number(run('psql', [...hostArgs, '-d', database, '-Atqc', `SELECT count(*) FROM pg_tables WHERE schemaname='public';`]))
  const sentinelAfterRestore = Number(run('psql', [...hostArgs, '-d', database, '-Atqc', `SELECT count(*) FROM em_audit_log WHERE trace_id='g5-recovery-sentinel';`]))

  const assertions = {
    migrationUpDownUpPassed: migrationResult.status === 'PASS' && migrationResult.sequence === 'up-down-up',
    serviceRestartPreservedData: sentinelBefore === 1 && sentinelAfterRestart === 1,
    backupRestorePreservedSchema: tableCountBefore > 0 && tableCountAfter === tableCountBefore,
    backupRestorePreservedSentinel: sentinelAfterRestore === sentinelBefore,
  }
  const evidence = {
    schemaVersion: 1,
    taskId: 'G5-02',
    generatedAt: new Date().toISOString(),
    evidenceKind: 'LOCAL_ISOLATED_POSTGRESQL_RECOVERY_DRILL',
    authorizationBoundary: 'Disposable cluster created under the current task; no shared service credentials or data were used.',
    environment: { platform: process.platform, node: process.version, postgres: version },
    sequence: ['initdb', 'migration-up-down-up', 'seed-sentinel', 'pg-dump', 'service-stop-start', 'drop-create-database', 'pg-restore', 'consistency-check'],
    migration: { status: migrationResult.status, sequence: migrationResult.sequence, expectedTables: migrationResult.tables.length },
    serviceRestart: { sentinelBefore, sentinelAfterRestart },
    backupRestore: { format: 'custom', dumpBytes: dumpBytes.length, dumpSha256, tableCountBefore, tableCountAfter, sentinelBefore, sentinelAfterRestore },
    assertions,
    status: Object.values(assertions).every(Boolean) ? 'PASS' : 'FAIL',
    boundaries: [
      'This proves repeatable migration, restart and backup/restore on an isolated local PostgreSQL 15 cluster.',
      'It does not prove Docker/Compose clean deployment, owner production database recovery, or independent non-contractor deployment.',
    ],
    events,
  }
  await writeFile(outputFile, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
  console.info(JSON.stringify({ taskId: evidence.taskId, status: evidence.status, evidence: path.relative(root, outputFile), assertions }, null, 2))
  if (evidence.status !== 'PASS') process.exitCode = 1
} finally {
  if (serverStarted) {
    try { run('pg_ctl', ['-D', dataDirectory, '-m', 'fast', '-w', 'stop'], { ignoreOutput: true }) } catch (error) { console.error(error.message); process.exitCode = 1 }
  }
  await rm(temporaryRoot, { recursive: true, force: true })
}
