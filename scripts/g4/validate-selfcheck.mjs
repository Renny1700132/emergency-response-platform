import { readFile } from 'node:fs/promises';
import { validateSelfcheck } from './lib/selfcheck.mjs';

const target = process.argv[2];
if (!target) {
  console.error('usage: node scripts/g4/validate-selfcheck.mjs <selfcheck.json>');
  process.exit(2);
}

const document = JSON.parse(await readFile(target, 'utf8'));
const errors = validateSelfcheck(document);
if (errors.length > 0) {
  console.error(JSON.stringify({ gate: 'selfcheck', status: 'BLOCKED', target, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ gate: 'selfcheck', status: 'PASS', target }, null, 2));
}
