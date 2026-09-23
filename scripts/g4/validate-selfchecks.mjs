import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { validateSelfcheck } from './lib/selfcheck.mjs';

const directory = process.argv[2];
if (!directory) {
  console.error('usage: node scripts/g4/validate-selfchecks.mjs <selfcheck-directory>');
  process.exit(2);
}

const files = (await readdir(directory))
  .filter((name) => /^G4-\d+\.json$/.test(name))
  .sort();
if (files.length === 0) {
  console.error(JSON.stringify({ gate: 'selfcheck', status: 'BLOCKED', error: 'no task selfchecks found' }, null, 2));
  process.exit(1);
}

const results = [];
for (const file of files) {
  const document = JSON.parse(await readFile(join(directory, file), 'utf8'));
  results.push({ target: join(directory, file).replaceAll('\\', '/'), errors: validateSelfcheck(document) });
}

const failed = results.filter((result) => result.errors.length > 0);
console.log(JSON.stringify({
  gate: 'selfcheck',
  status: failed.length === 0 ? 'PASS' : 'BLOCKED',
  targets: results.map((result) => result.target),
  failures: failed
}, null, 2));
if (failed.length > 0) process.exitCode = 1;
