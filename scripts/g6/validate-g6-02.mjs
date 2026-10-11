import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dir = path.join(root, 'evidence', 'g6', 'G6-02');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const fail = (message) => { throw new Error(message); };

const delivery = readJson('delivery-index.json');
const rtm = readJson('rtm-acceptance-increment.json');
const selfcheck = readJson('selfcheck.json');

if (delivery.items.length !== 29) fail(`delivery items ${delivery.items.length} != 29`);
const available = delivery.items.filter((x) => x.availability === 'AVAILABLE');
const missing = delivery.items.filter((x) => x.availability === 'NOT_AVAILABLE');
if (available.length !== 20 || missing.length !== 9) fail(`availability ${available.length}/${missing.length} != 20/9`);
for (const item of available) {
  const full = path.join(root, item.file);
  if (!fs.existsSync(full)) fail(`claimed available but missing: ${item.file}`);
  if (sha256(item.file) !== item.sha256) fail(`hash mismatch: ${item.file}`);
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

const required = ['README.md','delivery-index.md','standards-crosswalk.md','rtm-acceptance-increment.md','audit-records.md','metrics-ledger.md','gaps-deferrals.md','review-request.md'];
for (const name of required) if (!fs.existsSync(path.join(dir,name))) fail(`missing artifact: ${name}`);
const combined = required.map((name) => fs.readFileSync(path.join(dir,name),'utf8')).join('\n');
for (const forbidden of ['117/117 PASS','34/34 PASS','真实甲方系统6/6 PASS','真实非乙方独立部署已通过']) {
  if (combined.includes(forbidden)) fail(`forbidden claim: ${forbidden}`);
}

console.log(JSON.stringify({status:'PASS',deliveryItems:29,available:20,notAvailable:9,rtmRows:117,fr:39,starFr:34,results:counts,reviewStatus:delivery.state}));
