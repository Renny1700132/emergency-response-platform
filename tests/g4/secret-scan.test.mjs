import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { collectScanFiles, scanFiles } from '../../scripts/g4/lib/secret-scan.mjs';

test('scan target collection includes implementation files and skips tests', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'g4-targets-'));
  const implementationDirectory = path.join(directory, 'scripts', 'g4');
  const testDirectory = path.join(implementationDirectory, 'tests');
  await mkdir(testDirectory, { recursive: true });
  await writeFile(path.join(implementationDirectory, 'gate.mjs'), 'export const gate = true;\n', 'utf8');
  await writeFile(path.join(testDirectory, 'fixture.mjs'), 'const password = "fixture-only";\n', 'utf8');
  await writeFile(path.join(directory, 'package.json'), '{}\n', 'utf8');

  const files = (await collectScanFiles(directory))
    .map((file) => path.relative(directory, file).replaceAll('\\', '/'));
  assert.deepEqual(files, ['package.json', 'scripts/g4/gate.mjs']);
});

test('secret scan accepts ordinary configuration', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'g4-secret-pass-'));
  const file = path.join(directory, 'config.mjs');
  await writeFile(file, 'export const timeoutMs = 3000;\n', 'utf8');
  assert.deepEqual(await scanFiles([file], directory), []);
});

test('secret scan blocks assigned credentials without disclosing the value', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'g4-secret-block-'));
  const file = path.join(directory, 'config.mjs');
  await writeFile(file, 'const password = "not-a-real-secret-value";\n', 'utf8');
  const findings = await scanFiles([file], directory);
  assert.deepEqual(findings, [{ rule: 'ASSIGNED_SECRET', file: 'config.mjs', line: 1 }]);
  assert.equal(JSON.stringify(findings).includes('not-a-real-secret-value'), false);
});
