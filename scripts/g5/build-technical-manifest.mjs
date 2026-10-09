import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'

const root = new URL('../../evidence/g5/G5-02/', import.meta.url)
const canonicalLf = (bytes) => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n'), 'utf8')
const names = (await readdir(root)).filter((name) => name !== 'manifest.json').sort()
const files = []
for (const file of names) {
  const bytes = canonicalLf(await readFile(new URL(file, root)))
  files.push({ file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
}
const manifest = {
  taskId: 'G5-02',
  generatedAt: new Date().toISOString(),
  baseline: 'e6e12b59fc5749cdf0475ed9631bac7d21d4bb1a',
  normalization: 'Manifest bytes and SHA-256 are calculated over canonical UTF-8 LF content. Git blobs must match exactly; Windows workspace CRLF is canonicalized to LF by the validator before comparison.',
  files,
}
await writeFile(new URL('manifest.json', root), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.info(JSON.stringify({ taskId: manifest.taskId, manifestFiles: files.length }, null, 2))
