import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SKIP_DIRECTORIES = new Set([
  '.git',
  'coverage',
  'docs',
  'evidence',
  'logs',
  'node_modules',
  'prototype',
  'tests'
]);

const TEXT_EXTENSIONS = new Set([
  '.cjs', '.conf', '.env', '.java', '.js', '.json', '.jsx', '.kt', '.mjs',
  '.properties', '.py', '.sh', '.ts', '.tsx', '.yaml', '.yml'
]);

const SECRET_PATTERNS = [
  { id: 'PRIVATE_KEY', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { id: 'AWS_ACCESS_KEY', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  {
    id: 'ASSIGNED_SECRET',
    regex: /(?:api[_-]?key|client[_-]?secret|password|passwd|secret|token)\s*[:=]\s*["'][^"'\s]{8,}["']/i
  }
];

async function walk(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry.name)) files.push(...await walk(root, absolute));
      continue;
    }
    if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolute);
    }
  }
  return files;
}

export async function collectScanFiles(root) {
  const candidates = [
    '.workflow', '.gitee', 'backend', 'frontend', 'quality', 'services', 'src',
    'scripts/g4', 'package.json'
  ];
  const files = [];
  for (const candidate of candidates) {
    const absolute = path.join(root, candidate);
    try {
      const metadata = await stat(absolute);
      if (metadata.isDirectory()) files.push(...await walk(root, absolute));
      if (metadata.isFile()) files.push(absolute);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return [...new Set(files)].sort();
}

export async function scanFiles(files, root = process.cwd()) {
  const findings = [];
  for (const file of files) {
    const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            rule: pattern.id,
            file: path.relative(root, file).replaceAll('\\', '/'),
            line: index + 1
          });
        }
      }
    });
  }
  return findings;
}
