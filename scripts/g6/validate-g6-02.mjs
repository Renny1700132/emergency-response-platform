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
if (delivery.schemaVersion !== 2) fail(`delivery schema ${delivery.schemaVersion} != 2`);
if (delivery.state !== 'REVIEW_INCREMENT_PENDING_B_FINAL_REVIEW') fail(`unexpected delivery state: ${delivery.state}`);
if (delivery.initialSnapshot?.locked !== true) fail('initial snapshot is not locked');
if (delivery.initialSnapshot?.counts?.items !== 29 || delivery.initialSnapshot?.counts?.available !== 20 || delivery.initialSnapshot?.counts?.notAvailable !== 9) fail('initial snapshot counts drift');
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

const increment = delivery.currentIncrement;
if (increment?.inputCommit !== 'cfdb6f5f4f75bdcce04754f513668796da62326c') fail('unexpected increment input commit');
if (increment?.items?.length !== 21) fail(`increment items ${increment?.items?.length} != 21`);
if (new Set(increment.items.map((x) => x.id)).size !== 21) fail('increment IDs are not unique');
if (increment.counts?.available !== 21 || increment.counts?.realWorldAccepted !== 0) fail('increment count or real-world boundary drift');
for (const item of increment.items) {
  if (item.availability !== 'AVAILABLE') fail(`increment item not available: ${item.id}`);
  const bytes = gitBlob(increment.inputCommit, item.file);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== item.bytes || sha256 !== item.sha256) fail(`canonical git blob mismatch: ${item.file}`);
}
const transitionIds = new Set(increment.historicalTransitions.flatMap((x) => x.incrementIds));
for (const id of ['GI-001','GI-002','GI-003','GI-004','GI-011','GI-012','GI-013','GI-014','GI-015']) {
  if (!transitionIds.has(id)) fail(`missing historical transition for ${id}`);
}
if (!increment.historicalTransitions.some((x) => x.initialId === 'CI-028' && x.plannedPath !== x.actualCandidatePath)) fail('planned/candidate defense paths are not separated');

if (rtm.rows.length !== 117) fail(`RTM rows ${rtm.rows.length} != 117`);
if (new Set(rtm.rows.map((x) => x.acId)).size !== 117) fail('RTM AC IDs are not unique');
if (new Set(rtm.rows.map((x) => x.frId)).size !== 39) fail('RTM FR count is not 39');
if (new Set(rtm.rows.filter((x) => x.star).map((x) => x.frId)).size !== 34) fail('RTM star FR count is not 34');
const counts = rtm.rows.reduce((a,x)=>(a[x.actualResult]=(a[x.actualResult]??0)+1,a),{});
if (counts.PASS !== 11 || counts.NOT_RUN !== 59 || counts.BLOCKED !== 47) fail(`RTM results mismatch: ${JSON.stringify(counts)}`);
if (rtm.unconditionalRealWorldPass !== false) fail('unconditionalRealWorldPass must be false');
if (!selfcheck.invariants.fr39 || !selfcheck.invariants.ac117 || !selfcheck.invariants.starFr34) fail('selfcheck invariant false');
if (!selfcheck.historicalSnapshotLocked || !selfcheck.invariants.incrementCanonicalHashesMatch || selfcheck.currentIncrement?.acPassAddedFromRehearsal !== 0) fail('increment selfcheck boundary false');

const required = ['README.md','delivery-index.md','standards-crosswalk.md','rtm-acceptance-increment.md','audit-records.md','metrics-ledger.md','gaps-deferrals.md','review-request.md','b-review.json'];
for (const name of required) if (!fs.existsSync(path.join(dir,name))) fail(`missing artifact: ${name}`);
if (bReview?.reviewConclusion !== 'ACCEPTED_FOR_INITIAL_G6_02_CANDIDATE') fail('B initial-candidate review is not accepted');
if (bReview?.finalTaskStatus !== 'REVIEW_PENDING_G6_01_AND_G6_03_INCREMENT') fail('B review final boundary drift');
const combined = required.map((name) => fs.readFileSync(path.join(dir,name),'utf8')).join('\n');
for (const forbidden of ['117/117 PASS','34/34 PASS','真实甲方系统6/6 PASS','真实非乙方独立部署已通过']) {
  if (combined.includes(forbidden)) fail(`forbidden claim: ${forbidden}`);
}

for (const requiredTrace of ['56e9da9','e194cdb','deaddc6','f9eec53','ad4febe','8dbfbab','40f2002','72aadc1','cfdb6f5','PENDING_B_FINAL_REVIEW']) {
  if (!combined.includes(requiredTrace)) fail(`missing current audit trace: ${requiredTrace}`);
}

const initialPathsNowExisting = delivery.items.filter((x) => fs.existsSync(path.join(root, x.file))).length;
if (initialPathsNowExisting !== 22 || selfcheck.currentIncrement?.initialPathsNowExisting !== 22) fail(`current initial-path existence ${initialPathsNowExisting} != 22`);

console.log(JSON.stringify({status:'PASS',initialSnapshot:{deliveryItems:29,available:20,notAvailable:9},currentIncrement:{items:21,available:21,canonicalGitBlobVerified:21,initialPathsNowExisting,realWorldAccepted:0},rtmRows:117,fr:39,starFr:34,results:counts,candidateState:delivery.state,historicalBReviewStatus:bReview.finalTaskStatus,currentReviewStatus:selfcheck.reviewStatus,hashValidation:'INITIAL_WORKTREE_OR_RECORDED_GIT_BLOB_WITH_EOL_NORMALIZATION_PLUS_EXACT_INCREMENT_CANONICAL_GIT_BLOB'}));
