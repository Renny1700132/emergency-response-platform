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
if (delivery.schemaVersion !== 3) fail(`delivery schema ${delivery.schemaVersion} != 3`);
const acceptedState = 'DONE_A_CONSISTENCY_ACCEPTED_REAL_WORLD_DEFERRED';
if (![acceptedState, 'REVIEW_G6_01_A_ACCEPTED_PENDING_B_REREVIEW'].includes(delivery.state)) fail(`unexpected delivery state: ${delivery.state}`);
if (delivery.state === acceptedState) {
  const acceptance = delivery.currentAcceptance;
  const bFinal = readJson('b-final-rereview.json');
  if (bFinal.accepted !== true || acceptance?.bReviewCommit !== '6fad770') fail('DONE without actual B final acceptance');
  if (acceptance?.aReviewRecord !== 'docs/work/G6/G6-02_A_rereview.md' || !fs.existsSync(path.join(root, acceptance.aReviewRecord))) fail('DONE without A review record');
  const aEvidence = readJson('A-rereview/independent-check.json');
  if (aEvidence.status !== 'PASS' || acceptance?.realWorldAccepted !== 0 || acceptance?.conclusion !== 'ACCEPTED_BY_A') fail('DONE review or real-world boundary drift');
}
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

const followups = delivery.subsequentIncrements;
if (!Array.isArray(followups) || followups.length !== 3) fail('expected three subsequent increments');
const v02 = followups[0];
if (v02.inputCommit !== 'd17847d10ab0009f2b7c1468cf5540d90a3c0694') fail('unexpected V0.2 increment input commit');
if (v02.formationChain?.applicationLock !== '75f01c3bb33369d3785acf69a3a00eb983aa188b' || v02.formationChain?.mergedDeliveryPoint !== 'a8f8134') fail('V0.2 formation chain drift');
if (v02.g6_01ReviewState !== 'B_REMEDIATED_PENDING_A_REREVIEW') fail('G6-01 V0.2 review state drift');
if (v02.items?.length !== 18 || new Set(v02.items.map((x) => x.id)).size !== 18) fail('V0.2 increment item count or IDs drift');
for (const item of v02.items) {
  if (item.availability !== 'AVAILABLE') fail(`V0.2 increment item not available: ${item.id}`);
  const bytes = gitBlob(v02.inputCommit, item.file);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== item.bytes || sha256 !== item.sha256) fail(`V0.2 canonical git blob mismatch: ${item.file}`);
}
for (let n = 22; n <= 39; n += 1) {
  const id = `GI-${String(n).padStart(3, '0')}`;
  if (!v02.items.some((x) => x.id === id)) fail(`missing V0.2 increment ID: ${id}`);
}
if (v02.counts?.deploymentSteps !== 26 || v02.counts?.deploymentStepFailures !== 0 || v02.counts?.realWorldAccepted !== 0) fail('V0.2 deployment or real-world boundary drift');
const aRereview = followups[1];
if (aRereview.inputCommit !== 'e223f6d40b90c2f910297afc380e270819e31132') fail('unexpected A rereview input commit');
if (aRereview.g6_01ReviewState !== 'DONE_MANUALS_AND_LOCAL_DELIVERY_REVIEW_ACCEPTED_REAL_WORLD_DEFERRED') fail('A rereview state drift');
if (aRereview.items?.length !== 11 || new Set(aRereview.items.map((x) => x.id)).size !== 11) fail('A rereview increment item count or IDs drift');
for (const item of aRereview.items) {
  const bytes = gitBlob(aRereview.inputCommit, item.file);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== item.bytes || sha256 !== item.sha256) fail(`A rereview canonical git blob mismatch: ${item.file}`);
}
for (let n = 40; n <= 50; n += 1) {
  const id = `GI-${String(n).padStart(3, '0')}`;
  if (!aRereview.items.some((x) => x.id === id)) fail(`missing A rereview increment ID: ${id}`);
}
if (aRereview.counts?.aMechanicalAssertions !== 35 || aRereview.counts?.g6_01AcceptedByA !== true || aRereview.counts?.realWorldAccepted !== 0) fail('A rereview evidence or real-world boundary drift');
const g604CReview = followups[2];
if (g604CReview.inputCommit !== '6da71f318586eaf8fcf90eb00de741ee6dc4496b') fail('unexpected G6-04 C rereview increment input commit');
if (g604CReview.g6_04ReviewState !== 'ISSUE_002_003_CLOSED_BY_C_REAL_WORLD_DEFERRED_NOT_FROZEN') fail('G6-04 C rereview state drift');
if (g604CReview.items?.length !== 15 || new Set(g604CReview.items.map((x) => x.id)).size !== 15) fail('G6-04 C rereview increment item count or IDs drift');
for (const item of g604CReview.items) {
  const bytes = gitBlob(g604CReview.inputCommit, item.file);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== item.bytes || sha256 !== item.sha256) fail(`G6-04 C rereview canonical git blob mismatch: ${item.file}`);
}
for (let n = 51; n <= 65; n += 1) {
  const id = `GI-${String(n).padStart(3, '0')}`;
  if (!g604CReview.items.some((x) => x.id === id)) fail(`missing G6-04 C rereview increment ID: ${id}`);
}
if (g604CReview.counts?.behaviorCases !== 16 || g604CReview.counts?.auditAssertions !== 6178 || g604CReview.counts?.archiveAssertions !== 5698 || g604CReview.counts?.realWorldAccepted !== 0) fail('G6-04 C rereview evidence or real-world boundary drift');

if (rtm.rows.length !== 117) fail(`RTM rows ${rtm.rows.length} != 117`);
if (new Set(rtm.rows.map((x) => x.acId)).size !== 117) fail('RTM AC IDs are not unique');
if (new Set(rtm.rows.map((x) => x.frId)).size !== 39) fail('RTM FR count is not 39');
if (new Set(rtm.rows.filter((x) => x.star).map((x) => x.frId)).size !== 34) fail('RTM star FR count is not 34');
const counts = rtm.rows.reduce((a,x)=>(a[x.actualResult]=(a[x.actualResult]??0)+1,a),{});
if (counts.PASS !== 11 || counts.NOT_RUN !== 59 || counts.BLOCKED !== 47) fail(`RTM results mismatch: ${JSON.stringify(counts)}`);
if (rtm.unconditionalRealWorldPass !== false) fail('unconditionalRealWorldPass must be false');
if (!selfcheck.invariants.fr39 || !selfcheck.invariants.ac117 || !selfcheck.invariants.starFr34) fail('selfcheck invariant false');
if (!selfcheck.historicalSnapshotLocked || !selfcheck.invariants.incrementCanonicalHashesMatch || selfcheck.currentIncrement?.acPassAddedFromRehearsal !== 0) fail('increment selfcheck boundary false');
if (!selfcheck.subsequentIncrement?.historicalGi001To021Preserved || !selfcheck.invariants.v0_2CanonicalHashesMatch || selfcheck.subsequentIncrement?.deploymentSteps !== 26 || selfcheck.subsequentIncrement?.realWorldAccepted !== 0) fail('V0.2 selfcheck boundary false');
if (!selfcheck.aRereviewIncrement?.g6_01AcceptedByA || selfcheck.aRereviewIncrement?.items !== 11 || selfcheck.aRereviewIncrement?.realWorldAccepted !== 0) fail('A rereview selfcheck boundary false');

const required = ['README.md','delivery-index.md','standards-crosswalk.md','rtm-acceptance-increment.md','audit-records.md','metrics-ledger.md','gaps-deferrals.md','review-request.md','b-review.json'];
for (const name of required) if (!fs.existsSync(path.join(dir,name))) fail(`missing artifact: ${name}`);
if (bReview?.reviewConclusion !== 'ACCEPTED_FOR_INITIAL_G6_02_CANDIDATE') fail('B initial-candidate review is not accepted');
if (bReview?.finalTaskStatus !== 'REVIEW_PENDING_G6_01_AND_G6_03_INCREMENT') fail('B review final boundary drift');
const combined = required.map((name) => fs.readFileSync(path.join(dir,name),'utf8')).join('\n');
for (const forbidden of ['117/117 PASS','34/34 PASS','真实甲方系统6/6 PASS','真实非乙方独立部署已通过']) {
  if (combined.includes(forbidden)) fail(`forbidden claim: ${forbidden}`);
}

for (const requiredTrace of ['56e9da9','e194cdb','deaddc6','f9eec53','ad4febe','8dbfbab','40f2002','72aadc1','cfdb6f5','0de6884','6f56ab6','75f01c3','6255f94','a8f8134','f9dfc20','d17847d','e223f6d','PENDING_B_REREVIEW']) {
  if (!combined.includes(requiredTrace)) fail(`missing current audit trace: ${requiredTrace}`);
}

const cLog = fs.readFileSync(path.join(root, 'logs', 'prompts', '2026-10-12-C.md'), 'utf8');
if (!cLog.includes('status: PUSHED / PENDING_B_FINAL_REVIEW')) fail('C first remediation log top-level status is stale');
if (combined.includes('G6-01 两本手册/命令台账、G6-03 试演/现场记录及 G6-04 总结/移交尚未形成')) fail('README current overview retains stale G6-01 not-formed statement');

const initialPathsNowExisting = delivery.items.filter((x) => fs.existsSync(path.join(root, x.file))).length;
if (initialPathsNowExisting !== 23 || selfcheck.currentIncrement?.initialPathsNowExisting !== 22) fail(`initial-path existence current/historical ${initialPathsNowExisting}/${selfcheck.currentIncrement?.initialPathsNowExisting} != 23/22`);

console.log(JSON.stringify({status:'PASS',initialSnapshot:{deliveryItems:29,available:20,notAvailable:9},currentIncrement:{items:21,available:21,canonicalGitBlobVerified:21,initialPathsNowExisting,realWorldAccepted:0},v02SubsequentIncrement:{items:18,available:18,canonicalGitBlobVerified:18,deploymentSteps:26,deploymentStepFailures:0,realWorldAccepted:0,g6_01ReviewState:v02.g6_01ReviewState},aRereviewIncrement:{items:11,available:11,canonicalGitBlobVerified:11,aMechanicalAssertions:35,g6_01AcceptedByA:true,realWorldAccepted:0},g604CReviewIncrement:{items:15,available:15,canonicalGitBlobVerified:15,behaviorCases:16,auditAssertions:6178,archiveAssertions:5698,realWorldAccepted:0,g6_04ReviewState:g604CReview.g6_04ReviewState},rtmRows:117,fr:39,starFr:34,results:counts,candidateState:delivery.state,historicalBReviewStatus:bReview.finalTaskStatus,currentReviewStatus:selfcheck.reviewStatus,hashValidation:'INITIAL_WORKTREE_OR_RECORDED_GIT_BLOB_WITH_EOL_NORMALIZATION_PLUS_EXACT_INCREMENT_CANONICAL_GIT_BLOB'}));
