import { collectScanFiles, scanFiles } from './lib/secret-scan.mjs';

const root = process.cwd();
const files = await collectScanFiles(root);
const findings = await scanFiles(files, root);

if (findings.length > 0) {
  console.error(JSON.stringify({ gate: 'secret-scan', status: 'BLOCKED', findings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ gate: 'secret-scan', status: 'PASS', filesScanned: files.length }, null, 2));
}
