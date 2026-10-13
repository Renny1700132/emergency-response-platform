"""Explicit archive generation only. Never called by the read-only verifier."""
from pathlib import Path
from collections import Counter
import argparse
import json
from g6_04_archive import ROOT, INDEX_PATH, MUTABLE_PATHS, git, paths_at, blobs_at, category, sha, hash_kind, content_hash

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-master', required=True, help='Reviewed input commit, not an inferred future candidate commit')
parser.add_argument('--prompt-log', help='Explicit controlled role prompt log to include before its first commit')
args = parser.parse_args()
source = git('rev-parse', args.source_master + '^{commit}').decode().strip()
source_paths = paths_at(source)
paths = {p for p in source_paths if category(p)}
for directory in ['docs/work/G6', 'evidence/g6/G6-04', 'scripts/g6']:
    for p in (ROOT / directory).rglob('*'):
        if p.is_file() and '__pycache__' not in p.parts:
            rel = p.relative_to(ROOT).as_posix()
            if category(rel):
                paths.add(rel)
paths.add('docs/work/A_PM/g6_delivery_acceptance_plan.md')
if args.prompt_log:
    if args.prompt_log not in MUTABLE_PATHS or not args.prompt_log.startswith('logs/prompts/'):
        raise ValueError('Prompt log must be an explicitly controlled mutable role log')
    paths.add(args.prompt_log)
exclusions = [INDEX_PATH, 'evidence/g6/G6-04/INDEX.md', 'evidence/g6/G6-04/A-remediation/']
paths = sorted(p for p in paths if not any(p == x or (x.endswith('/') and p.startswith(x)) for x in exclusions))
input_blobs = blobs_at(source, [p for p in paths if p in source_paths])
c_index = json.loads((ROOT / 'evidence/g6/G6-02/delivery-index.json').read_text(encoding='utf-8-sig'))
links = {}
groups = [(c_index['items'], 'initialSnapshot'), (c_index['currentIncrement']['items'], 'currentIncrement')]
groups += [(g['items'], 'subsequentIncrement') for g in c_index['subsequentIncrements']]
for items, group in groups:
    for item in items:
        links.setdefault(item['file'], []).append({'id': item['id'], 'snapshotGroup': group, 'version': item.get('version'), 'historicalStatus': item['status'], 'recordedSha256': item['sha256']})
rows = []
for path in paths:
    target = ROOT / path
    if not target.is_file():
        raise FileNotFoundError(path)
    data = target.read_bytes()
    kind = hash_kind(path)
    original = input_blobs.get(path)
    changed = original is None or content_hash(original, kind) != content_hash(data, kind)
    rows.append({'file': target.name, 'path': path, 'category': category(path), 'version': f'G6-04 V0.4 C符合性接受及索引增量；上游Git {source[:7]}' if changed else f'Git input {source[:7]}；文内版号/C历史映射见源件', 'status': 'AVAILABLE_C_ACCEPTED_PENDING_B' if changed else 'AVAILABLE_RETAINED_HISTORY_NOT_UNCONDITIONAL_ACCEPTANCE', 'hashKind': kind, 'contentSha256': content_hash(data, kind), 'physicalSha256AtGeneration': sha(data), 'physicalBytesAtGeneration': len(data), 'inputGitBlobSha256': sha(original) if original is not None else None, 'mutableAfterSnapshot': path in MUTABLE_PATHS, 'cIndexLinks': links.get(path, [])})
missing = [{'file': x['name'], 'path': x['file'], 'version': x.get('version', 'C历史快照'), 'hash': None, 'status': 'NOT_AVAILABLE / DEFERRED', 'cIndexId': x['id']} for x in c_index['items'] if not (ROOT / x['file']).is_file()]
index = {'schemaVersion': 2, 'task': 'G6-04', 'state': 'C_COMPLIANCE_ACCEPTED_AND_INDEXED_PENDING_B_NOT_FROZEN', 'sourceMaster': source, 'factsAndAiCensusBaselineMaster': '3b47e8f97caac1fa6dc989fd1ff5279bd1eb5450', 'cIndexSource': 'evidence/g6/G6-02/delivery-index.json', 'countsAreArchiveEntriesNotDeliveryAcceptance': True, 'verificationPolicy': 'Submitted index and all row contents checked against the enclosing archive commit. Checkout text allows only CRLF-to-LF equivalence; binary exact. Mutable subsequent states must match HEAD Git blobs and are reported separately. The controlled G6 plan permits only last-column status changes in the five existing G6 rows; all other bytes remain protected, and HEAD plan rows must match HEAD tasks. Generator is never invoked by verifier.', 'exclusions': exclusions, 'exclusionReason': 'Index/front index and A verification receipts depend on the index; validate these process files through their enclosing Git commit, avoiding cyclic self hashes. No historical result is discarded.', 'rows': rows, 'missingPlannedPaths': missing}
output = ROOT / INDEX_PATH
output.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
md = f'''# G6-04 最终归档INDEX（V0.4 C符合性接受及索引增量，待B，未冻结）

当前输入master：`{source}`。事实/AI统计仍锁原`3b47e8f`快照；本视图引用C唯一`evidence/g6/G6-02/delivery-index.json`，不替代它或重算29项/三段增量/验收结果。

## 分离生成与验证

生成只在A明确修订候选时执行：`python scripts/g6/build-g6-04-archive.py --source-master {source}`。生成不是验证，不输出PASS。

第三方执行：`python scripts/g6/audit-g6-04.py --verify`。此命令只读现有索引、Git对象与检出文件，输出JSON到标准输出，写文件数为0，绝不调用生成器或重写受检索引。默认验证最近一次修改本INDEX JSON的Git commit（不是日志回填后的HEAD）；可显式`--commit <归档内容commit>`选择原时点。必须验证加载的索引与该提交的索引一致，随后验证每行的该提交内容。

未提交的候选可用`--verify --working-tree`做草稿检查，明确标记DRAFT，不能据此宣称提交态归档已通过。正式候选内容提交后必须再运行提交态只读验证。

## 字节与Git指纹

每行`contentSha256`是稳定验真值。`BINARY_EXACT_BYTES`文件（DOCX/PDF/PPTX/图片等）要求字节完全一致。明确列出的文本扩展名使用`TEXT_CRLF_TO_LF_ONLY`：仅把CRLF转换为LF，不删空白/BOM，不改字符/内容。提交态Git blob与检出文本按此规则核验，所以Git自动行尾转换不会导致假失败；任意其他文本改动必须失败。

`physicalSha256AtGeneration`与`physicalBytesAtGeneration`仅说明生成机器当时的物理字节，是诊断值，不能要求所有平台字节相同。只在文本稳定指纹已吻合时允许诊断物理SHA不同，并逐项报告`permittedTextEolConversions`；二进制不允许豁免。`inputGitBlobSha256`独立验证输入`sourceMaster`原Git blob，保留来源锚点。

日志/tasks/control/A自检的后续回填不回写原快照hash：每行原内容仍由归档内容commit校验；当前可变文件必须与HEAD已提交Git blob一致，任何未提交篡改都失败，并报告实际后续迁移路径。受控计划仅豁免G6-00—04五行的最后一列状态单元格：行数、其余单元格和正文逐字保护，且HEAD计划任务行必须与HEAD tasks一致。计划正文、范围、输入输出、任意业务文字变化仍失败；未提交状态更新也失败。显式允许受控A/C同日Prompt日志按已提交HEAD迁移，不扩大到任意日志。C符合性复验和唯一索引GI-051—065已完成；B技术确认与A最终冻结仍不自动接受。

索引及依赖它的验证回执排除自hash，通过包围它们的Git commit校验；完整排除范围见JSON的`exclusions`。旧1380项生成态PASS及C发现的231条物理差异是历史诊断，原记录/Git保留，不能改写成原先提交态通过。

## 配置库清单

完整逐文件名称/路径/版本/状态/稳定hash/物理诊断hash/输入Git指纹/C配置项映射见`final-archive-index.json`。Git事件全集与任务明细保留在`git-history.txt`和`actual-task-git-events.json`。

| 类别 | 归档记录数 | 状态边界 |
| --- | --- | --- |
'''
for cat, count in Counter(r['category'] for r in rows).items():
    md += f'| {cat} | {count} | 存在性/历史归档，不派生验收PASS |\n'
md += '\n## 缺项与复核\n\n'
for item in missing:
    md += f"- {item['cIndexId']}：{item['file']}，`{item['path']}`；NOT_AVAILABLE / DEFERRED，hash未知。\n"
md += '\n002/003已由C关闭，唯一索引已追加GI-051—065；当前待B最终技术确认及A最终一致性/冻结。真实接口、KN-065、现场/培训/试运行/数据/签署等债务继续移交；G6-04保持REVIEW，未冻结。\n'
(ROOT / 'evidence/g6/G6-04/INDEX.md').write_text(md, encoding='utf-8')
print(json.dumps({'operation': 'GENERATED_DRAFT_INDEX_NOT_VERIFIED', 'schemaVersion': 2, 'sourceMaster': source, 'archiveRows': len(rows)}, ensure_ascii=False))
