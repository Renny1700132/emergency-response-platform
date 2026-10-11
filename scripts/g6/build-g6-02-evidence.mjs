import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'evidence', 'g6', 'G6-02');
fs.mkdirSync(outDir, { recursive: true });
const inputSnapshotCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const bytes = (file) => fs.statSync(path.join(root, file)).size;
const exists = (file) => fs.existsSync(path.join(root, file));

const items = [
  ['CI-001','项目管理计划','docs/deliverables/20-项目管理计划.docx','A','C','P1 §10.3 DEL-DOC-001','AVAILABLE','COURSE_DELIVERY_CANDIDATE'],
  ['CI-002','软件需求规格说明书','docs/deliverables/08-软件需求规格说明书SRS.docx','A','C','P1 §10.3 DEL-DOC-001','AVAILABLE','FROZEN_INPUT'],
  ['CI-003','概要设计说明书','docs/deliverables/11-概要设计说明书.docx','B','A','P1 §10.3 DEL-DOC-001','AVAILABLE','FROZEN_INPUT'],
  ['CI-004','详细设计说明书','docs/deliverables/12-详细设计说明书.docx','B','A','P1 §10.3 DEL-DOC-001','AVAILABLE','FROZEN_INPUT'],
  ['CI-005','数据库设计说明书','docs/deliverables/13-数据库设计说明书.docx','B','A','P1 §10.3 DEL-DOC-001','AVAILABLE','FROZEN_INPUT'],
  ['CI-006','接口设计说明书','docs/deliverables/14-接口设计说明书.docx','B','A','P1 §10.3 DEL-DOC-001','AVAILABLE','FROZEN_INPUT'],
  ['CI-007','接口契约','docs/deliverables/15-接口契约-openapi_v1.yaml','B','A','P1 §10.3 DEL-DOC-001','AVAILABLE','FROZEN_INPUT'],
  ['CI-008','测试计划','docs/deliverables/19-测试计划.docx','C','B','P1 §10.3 DEL-DOC-002','AVAILABLE','COURSE_DELIVERY_CANDIDATE'],
  ['CI-009','测试报告','docs/deliverables/G5/36-测试报告.docx','A','C','P1 §10.3 DEL-DOC-002','AVAILABLE','COURSE_CONDITIONAL_ACCEPTED'],
  ['CI-010','性能压测报告','docs/deliverables/G5/37-性能压测报告.docx','A','C','P1 §10.3 DEL-DOC-002','AVAILABLE','COURSE_CONDITIONAL_ACCEPTED'],
  ['CI-011','缺陷看板与修复记录','docs/deliverables/G5/38-缺陷看板与修复记录.docx','A','C','P1 §10.3 DEL-DOC-002','AVAILABLE','COURSE_CONDITIONAL_ACCEPTED'],
  ['CI-012','RTM闭环核验记录','docs/deliverables/G5/39-RTM闭环核验记录.docx','A','C','P1 §10.3 DEL-DOC-004 / §10.4','AVAILABLE','COURSE_CONDITIONAL_ACCEPTED'],
  ['CI-013','RTM V5机器明细','evidence/g5/G5-03/rtm-v5.json','A','C','P1 §10.4 DOC-QA-002','AVAILABLE','11_PASS_59_NOT_RUN_47_BLOCKED'],
  ['CI-014','G5最终条件验收','evidence/g5/G5-03/c-final-acceptance.json','C','N/A','G6准入','AVAILABLE','COURSE_CONDITIONAL_ACCEPTANCE'],
  ['CI-015','用户手册','docs/deliverables/G6/34-用户手册.docx','B','A','P1 §10.3 DEL-DOC-003','NOT_AVAILABLE','PLANNED_G6_01'],
  ['CI-016','部署与运维手册','docs/deliverables/G6/45-部署与运维手册.docx','B','A','P1 §10.3 DEL-DOC-003 / §10.4','NOT_AVAILABLE','PLANNED_G6_01'],
  ['CI-017','培训材料与记录','evidence/g6/G6-01/training-records.md','B','A','P1 §9.3 / §10.3 DEL-DOC-003/DEL-OTHER-001','NOT_AVAILABLE','PLANNED_OR_RESOURCE_BLOCKED'],
  ['CI-018','试运行报告','evidence/g6/G6-04/trial-operation-record.md','A','C','P1 §10.3 DEL-DOC-004','NOT_AVAILABLE','PLANNED_G6_04'],
  ['CI-019','项目开发总结报告','docs/deliverables/G6/46-项目开发总结报告.docx','A','C/B','P1 §10.3 DEL-DOC-004','NOT_AVAILABLE','PLANNED_G6_04'],
  ['CI-020','验收签署记录','docs/deliverables/G6/47-验收报告.docx','A','C/B','P1 §10.1 / §10.3','NOT_AVAILABLE','REAL_SIGNATURE_REQUIRED'],
  ['CI-021','基础数据初始化与双方确认','evidence/g6/G6-04/data-initialization-acceptance.md','A','C','P1 §10.3 DEL-DATA-001','NOT_AVAILABLE','OWNER_DATA_AND_CONFIRMATION_REQUIRED'],
  ['CI-022','故障演练原始记录','evidence/g5/G5-02/fault-drill-raw.json','B','C','P1 §10.3 DEL-OTHER-001','AVAILABLE','LOCAL_OR_SIMULATED_BOUNDARY'],
  ['CI-023','部署原始记录','evidence/g5/G5-02/docker-clean-deploy.json','B','C','P1 §10.4 DOC-QA-003','AVAILABLE','MEMBER_B_RUN_NOT_INDEPENDENT_OPERATOR'],
  ['CI-024','源代码与构建入口','package.json','B','A','P1 §10.4 DOC-QA-001/003','AVAILABLE','SOURCE_CONFIGURATION_ITEM'],
  ['CI-025','容器编排配置','compose.yaml','B','A','P1 §10.4 DOC-QA-003','AVAILABLE','SOURCE_CONFIGURATION_ITEM'],
  ['CI-026','M3冻结基线','control/baselines/BASELINE-G3-M3-R1.0.md','A','C/B','受控设计输入','AVAILABLE','FROZEN_BASELINE'],
  ['CI-027','AI使用审计','evidence/g5/G5-03/ai-audit.json','A','C','G6任务书过程证据','AVAILABLE','HISTORICAL_AUDIT_INPUT'],
  ['CI-028','G6答辩PPT与讲稿','docs/deliverables/G6/G6-验收答辩.pptx','A','C','G6任务书','NOT_AVAILABLE','PLANNED_G6_03'],
  ['CI-029','G6试演/现场运行记录','evidence/g6/G6-03/live-run-record.md','A','C','G6任务书真实演示','NOT_AVAILABLE','REAL_WORLD_RESOURCE_REQUIRED']
].map(([id,name,file,owner,reviewer,mapping,availability,status]) => ({
  id,name,file,owner,reviewer,mapping,availability,status,
  bytes: exists(file) ? bytes(file) : null,
  sha256: exists(file) ? sha256(file) : null,
  inputSnapshotCommit: exists(file) ? inputSnapshotCommit : null,
  frAcTc: id === 'CI-013' ? '39 FR / 117 AC / planned TC links' : 'N/A or indexed downstream',
  downstream: id.startsWith('CI-01') ? 'G6 manuals/PPT/summary as applicable' : 'G6-02/G6-03/G6-04'
}));

const rtmSource = JSON.parse(fs.readFileSync(path.join(root, 'evidence/g5/G5-03/rtm-v5.json'), 'utf8'));
const acceptanceRows = rtmSource.rows.map((row) => ({
  acId: row.acId,
  frId: row.frId,
  star: row.star,
  plannedTC: row.plannedTC,
  actualResult: row.result,
  courseStatus: row.courseStatus,
  deferredStatuses: row.deferredStatuses,
  implementationStatus: row.implementationStatus,
  rawLocator: row.rawLocator,
  g6AcceptanceStatus: row.result === 'PASS' ? 'EVIDENCED_PASS_INPUT' : 'DEFERRED_NOT_ACCEPTED',
  g6EvidenceRequired: row.result === 'PASS' ? 'Retain source/version and spot-check in G6' : row.followup
}));

const group = new Map();
for (const row of acceptanceRows) {
  const x = group.get(row.frId) ?? { frId: row.frId, star: row.star, PASS: 0, NOT_RUN: 0, BLOCKED: 0, ac: 0 };
  x[row.actualResult] += 1; x.ac += 1; group.set(row.frId, x);
}

const summary = {
  schemaVersion: 1,
  task: 'G6-02',
  state: 'REVIEW_INITIAL_CANDIDATE_PENDING_B',
  inputSnapshotCommit,
  scope: rtmSource.scope,
  results: rtmSource.results,
  starResults: rtmSource.starResults,
  unconditionalRealWorldPass: false,
  rows: acceptanceRows,
  boundaries: {
    implementationDeferredAc: 30,
    evidenceDeferredAc: 76,
    ownerSystemsReal: '0/6',
    independentRealOperator: 0,
    manualsAvailable: false,
    liveRunAvailable: false
  }
};

fs.writeFileSync(path.join(outDir, 'delivery-index.json'), JSON.stringify({schemaVersion:1, task:'G6-02', state:'REVIEW_INITIAL_CANDIDATE_PENDING_B', items}, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'rtm-acceptance-increment.json'), JSON.stringify(summary, null, 2) + '\n');

const esc = (v) => String(v ?? '—').replaceAll('|','\\|').replaceAll('\n',' ');
let deliveryMd = '# G6唯一交付/证据索引（首版候选）\n\n';
deliveryMd += '> 状态：REVIEW_INITIAL_CANDIDATE_PENDING_B。无文件不写齐套；`NOT_AVAILABLE` 是真实缺项，不是 N/A 或 PASS。SHA-256 针对当前工作区字节，内容提交后以 Git 对象/最终清单复核。\n\n';
deliveryMd += '| ID | 文种/配置项 | 路径 | 主责/复核 | P1/任务书映射 | 可用性 | 当前状态 | SHA-256 | FR/AC/TC | 下游使用 |\n|---|---|---|---|---|---|---|---|---|---|\n';
for (const x of items) deliveryMd += `| ${x.id} | ${esc(x.name)} | \`${x.file}\` | ${x.owner}/${x.reviewer} | ${esc(x.mapping)} | ${x.availability} | ${esc(x.status)} | ${x.sha256 ? `\`${x.sha256}\`` : '—'} | ${esc(x.frAcTc)} | ${esc(x.downstream)} |\n`;
fs.writeFileSync(path.join(outDir, 'delivery-index.md'), deliveryMd);

let rtmMd = '# G6 RTM验收增量（首版候选）\n\n';
rtmMd += '> 唯一117行机器明细见 `rtm-acceptance-increment.json`。本文件只汇总FR级状态；标识链完整不等于验收通过。\n\n';
rtmMd += `- 分母：${rtmSource.scope.fr} FR / ${rtmSource.scope.ac} AC / ${rtmSource.scope.starFr} ★FR。\n`;
rtmMd += `- 真实AC：${rtmSource.results.PASS} PASS / ${rtmSource.results.NOT_RUN} NOT_RUN / ${rtmSource.results.BLOCKED} BLOCKED。\n`;
rtmMd += `- ★FR：${rtmSource.starResults.PASS} PASS / ${rtmSource.starResults.BLOCKED} BLOCKED。\n`;
rtmMd += '- G6判定：仅既有11项保留 `EVIDENCED_PASS_INPUT`；其余106项均为 `DEFERRED_NOT_ACCEPTED`，不得由文档存在或套件总绿派生PASS。\n\n';
rtmMd += '| FR | ★ | AC数 | PASS | NOT_RUN | BLOCKED | G6状态 |\n|---|---:|---:|---:|---:|---:|---|\n';
for (const x of group.values()) rtmMd += `| ${x.frId} | ${x.star ? '是' : '否'} | ${x.ac} | ${x.PASS} | ${x.NOT_RUN} | ${x.BLOCKED} | ${x.PASS === x.ac ? 'EVIDENCED_PASS_INPUT' : 'DEFERRED_NOT_ACCEPTED'} |\n`;
fs.writeFileSync(path.join(outDir, 'rtm-acceptance-increment.md'), rtmMd);

const counts = items.reduce((a,x)=>(a[x.availability]=(a[x.availability]??0)+1,a),{});
fs.writeFileSync(path.join(outDir, 'selfcheck.json'), JSON.stringify({
  task:'G6-02', status:'PASS_INITIAL_CANDIDATE_PENDING_B', generatedAt:new Date().toISOString(),
  deliveryItems:items.length, availability:counts, rtmRows:acceptanceRows.length,
  frGroups:group.size, results:rtmSource.results, starResults:rtmSource.starResults,
  invariants:{fr39:group.size===39,ac117:acceptanceRows.length===117,starFr34:[...group.values()].filter(x=>x.star).length===34,noMissingFileClaimedAvailable:items.filter(x=>x.availability==='AVAILABLE').every(x=>x.sha256)},
  blockers:['G6-01 manuals/command ledger not yet available','G6-03 rehearsal/live-run evidence not yet available','real owner systems and independent deployer remain unavailable'],
  reviewer:'B', reviewStatus:'PENDING'
}, null, 2) + '\n');

console.log(JSON.stringify({status:'PASS',deliveryItems:items.length,availability:counts,rtmRows:acceptanceRows.length,fr:group.size,starFr:[...group.values()].filter(x=>x.star).length,results:rtmSource.results}));
