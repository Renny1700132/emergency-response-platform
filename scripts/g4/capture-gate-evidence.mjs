import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const mode = process.argv[2];
if (!['pass', 'block'].includes(mode)) {
  console.error('usage: node scripts/g4/capture-gate-evidence.mjs <pass|block>');
  process.exit(2);
}

const isWindows = process.platform === 'win32';
const npmCommand = 'npm';
const commands = mode === 'pass'
  ? [
      ['coverage', npmCommand, ['run', 'test:coverage']],
      ['contract', npmCommand, ['run', 'contract']],
      ['security', npmCommand, ['run', 'security']],
      ['selfcheck', npmCommand, ['run', 'selfcheck']]
    ]
  : [
      ['selfcheck', process.execPath, [
        'scripts/g4/validate-selfcheck.mjs',
        'tests/g4/fixtures/selfcheck-blocking.json'
      ]]
    ];

const results = commands.map(([gate, command, args]) => {
  const startedAt = new Date().toISOString();
  const executable = isWindows && command === npmCommand
    ? (process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe')
    : command;
  const executableArgs = isWindows && command === npmCommand
    ? ['/d', '/s', '/c', [command, ...args].join(' ')]
    : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  return {
    gate,
    command: [command, ...args].join(' '),
    startedAt,
    exitCode: result.status,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? result.error?.message ?? '').trim()
  };
});

const expected = mode === 'pass' ? 'PASS' : 'BLOCKED';
const observed = mode === 'pass'
  ? (results.every((item) => item.exitCode === 0) ? 'PASS' : 'BLOCKED')
  : (results.length === 1 && results[0].exitCode !== 0 ? 'BLOCKED' : 'UNEXPECTED_PASS');

const evidence = {
  schemaVersion: 1,
  taskId: 'G4-01',
  evidenceType: mode === 'pass' ? 'QUALITY_GATES_PASS' : 'INTENTIONAL_NEGATIVE_BLOCK',
  simulated: false,
  expected,
  observed,
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, arch: process.arch },
  results
};

const evidenceDirectory = path.join(process.cwd(), 'evidence', 'g4', 'G4-01');
await mkdir(evidenceDirectory, { recursive: true });
const output = path.join(evidenceDirectory, `${mode}-evidence.json`);
await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output, expected, observed }, null, 2));

if (observed !== expected) process.exitCode = 1;
