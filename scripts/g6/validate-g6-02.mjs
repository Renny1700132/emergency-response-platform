import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const dir = path.join(root, 'evidence', 'g6', 'G6-02');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const gitBlob = (commit, file) => execFileSync(
  'git',
  ['show', `${commit}:${file}`],
  { cwd: root, encoding: null, maxBuffer: 64 * 1024 * 1024 }
);
const eolVariants = (bytes) => {
  if (bytes.includes(0)) return [bytes];
  const lf = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  const crlf = Buffer.from(lf.toString('utf8').replace(/\n/g, '\r\n'), 'utf8');
  return [bytes, lf, crlf];
};
const matchesRecordedFingerprint = (bytes, item) => eolVariants(bytes).some((candidate) => (
  candidate.length === item.bytes
  && crypto.createHash('sha256').update(candidate).digest('hex') === item.sha256
));
const fail = (message) => { throw new Error(message); };

const delivery = readJson('delivery-index.json');
const rtm = readJson('rtm-acceptance-increment.json');
const selfcheck = readJson('selfcheck.json');
const bReview = fs.existsSync(path.join(dir, 'b-review.json')) ? readJson('b-review.json') : null;

if (delivery.items.length !== 29) fail(`delivery items ${delivery.items.length} != 29`);
const available = delivery.items.filter((x) => x.availability === 'AVAILABLE');
const missing = delivery.items.filter((x) => x.availability === 'NOT_AVAILABLE');
if (available.length !== 20 || missing.length !== 9) fail(`availability ${available.length}/${missing.length} != 20/9`);
for (const item of available) {
  const full = path.join(root, item.file);
  if (!fs.existsSync(full)) fail(`claimed available but missing: ${item.file}`);
  const worktreeMatches = matchesRecordedFingerprint(fs.readFileSync(full), item);
  const snapshotMatches = item.inputSnapshotCommit
    ? matchesRecordedFingerprint(gitBlob(item.inputSnapshotCommit, item.file), item)
    : false;
  if (!worktreeMatches && !snapshotMatches) fail(`hash mismatch: ${item.file}`);
}
for (const item of missing) if (item.sha256 !== null) fail(`missing item has hash: ${item.file}`);

if (rtm.rows.length !== 117) fail(`RTM rows ${rtm.rows.length} != 117`);
if (new Set(rtm.rows.map((x) => x.acId)).size !== 117) fail('RTM AC IDs are not unique');
if (new Set(rtm.rows.map((x) => x.frId)).size !== 39) fail('RTM FR count is not 39');
if (new Set(rtm.rows.filter((x) => x.star).map((x) => x.frId)).size !== 34) fail('RTM star FR count is not 34');
const counts = rtm.rows.reduce((a,x)=>(a[x.actualResult]=(a[x.actualResult]??0)+1,a),{});
if (counts.PASS !== 11 || counts.NOT_RUN !== 59 || counts.BLOCKED !== 47) fail(`RTM results mismatch: ${JSON.stringify(counts)}`);
if (rtm.unconditionalRealWorldPass !== false) fail('unconditionalRealWorldPass must be false');
if (!selfcheck.invariants.fr39 || !selfcheck.invariants.ac117 || !selfcheck.invariants.starFr34) fail('selfcheck invariant false');

const required = ['README.md','delivery-index.md','standards-crosswalk.md','rtm-acceptance-increment.md','audit-records.md','metrics-ledger.md','gaps-deferrals.md','review-request.md','b-review.json'];
for (const name of required) if (!fs.existsSync(path.join(dir,name))) fail(`missing artifact: ${name}`);
if (bReview?.reviewConclusion !== 'ACCEPTED_FOR_INITIAL_G6_02_CANDIDATE') fail('B initial-candidate review is not accepted');
if (bReview?.finalTaskStatus !== 'REVIEW_PENDING_G6_01_AND_G6_03_INCREMENT') fail('B review final boundary drift');
const combined = required.map((name) => fs.readFileSync(path.join(dir,name),'utf8')).join('\n');
for (const forbidden of ['117/117 PASS','34/34 PASS','真实甲方系统6/6 PASS','真实非乙方独立部署已通过']) {
  if (combined.includes(forbidden)) fail(`forbidden claim: ${forbidden}`);
}

console.log(JSON.stringify({status:'PASS',deliveryItems:29,available:20,notAvailable:9,rtmRows:117,fr:39,starFr:34,results:counts,candidateState:delivery.state,reviewStatus:bReview.finalTaskStatus,hashValidation:'WORKTREE_OR_RECORDED_GIT_BLOB_WITH_EOL_NORMALIZATION'}));
