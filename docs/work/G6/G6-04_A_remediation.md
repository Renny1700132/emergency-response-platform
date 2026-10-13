# G6-04 A评审整改与复验移交

- 主责：A（何思源，Codex辅助执行）；当前任务仍REVIEW，待C定向复验/B最终技术确认，未冻结。
- 输入：master@7bfccad1267beba9569c5a9909d9479df01e083e；C Review为`logs/reviews/2026-10-13_G6-04-C-review.md`，内容复核commit56673cb、回填7bfccad。
- 范围：ISSUE-G6-04-002/003；C已通过的正式报告主体/视觉/冻结数字/12项债务结构沿用，本轮未修改正式DOCX/PDF或应用代码。

## 1 ISSUE-G6-04-002 受控计划同步

`g6_delivery_acceptance_plan.md`修订为当前V0.2：G6-00原仅规划事件显式标为历史；第2节五行任务表直接对应当前tasks完整行；G6-01—03 DONE及其真实接受Review入口齐备；G6-04为A整改待C复验/B确认。唯一交付索引指向已存在的`evidence/g6/G6-02/delivery-index.json/.md`，旧路径只作历史说明。

新增只读断言逐行核对G6-00—04任务/计划、唯一索引入口、实际Review路径，并排除“尚未生成/均TODO”等当前错误声明。未修改G6-01/02/03历史接受结论、39FR/34★/117AC、11/59/47或真实延期。

## 2 ISSUE-G6-04-003 归档生成与验证分离

原审计的先写索引再核对自身结果已移除；`build-g6-04-archive.py`只在A明确产生候选时生成schemaVersion2索引，不输出PASS；`audit-g6-04.py --verify`只读既有索引和Git/检出态，输出到标准输出，不创建或覆盖索引/审计文件。共享实现`g6_04_archive.py`没有写文件操作。

提交态验证必须完成：①加载索引与归档内容commit中索引一致；②该提交所需受控路径完整；③逐行内容匹配该提交Git blob与稳定hash；④输入Git指纹匹配原sourceMaster；⑤当前检出文件内容匹配，且当前可变状态文件如有回填，必须与HEAD已提交Git blob吻合；⑥受检索引验证前后hash相同。归档commit默认由Git中该索引的最后修改事件确定，可显式`--commit`选择，不猜测未来commit、不自引用。

`--working-tree`仅用于提交前草稿检查，结果标记READ_ONLY_WORKING_TREE_DRAFT；不把它当作提交态通过。内容提交后再次只读验证，实际结果写入独立回执/日志回填，待C复验。

## 3 跨检出态指纹规则

稳定`contentSha256`：明确文本扩展名包含JSONL/NDJSON/SHA256摘要，文本只允许CRLF→LF，不去空格/BOM、不改变Unicode或内容；二进制（Office/PDF/图片等）必须完全一致。`physicalSha256AtGeneration`只记录本机生成时物理字节，纯文本行尾差异在稳定hash通过后才允许，并逐项报告；其他差异必须失败。`inputGitBlobSha256`仍核对sourceMaster真实原始Git对象。

旧原索引、1380项生成态PASS、C的231条物理差异与462行诊断改写均保留在Git/原Review/原JSON，不改写成原先提交态已通过。当前索引是明确的新候选V0.2，事实/AI数仍锚3b47e8f快照，生成输入为7bfccad；不重算C唯一指标/验收账本。

索引和依赖它的验证回执不循环互hash，通过包围它们的Git commit验证；完整排除范围见JSON。其他受控文件仍必须逐项验真，不用“可变”标签忽略未提交篡改。当前流程不把路径存在或一致性通过迁移为项目验收PASS。

## 4 实际检查与可复现入口

- 首轮隔离Git夹具7项：提交态正常通过；只换LF/CRLF通过；文本内容、二进制字节、索引、未提交可变日志篡改均拒绝；已提交独立日志回填通过。提交态实际检查另发现JSONL/NDJSON/SHA256文本分类缺口9行，原失败保留；修订后增加3个扩展名场景共10项，最新`A-remediation/verification-behavior-tests-final.json`。每项验证均未改写索引；这是方法验证，不是业务AC实测。
- 旧schema1由新验证器明确拒绝，索引验证前后hash不变，原输出保留`legacy-schema-verification.log`与`legacy-schema-readonly-proof.json`。
- 修订草稿执行`python scripts/g6/audit-g6-04.py --verify --working-tree`；首轮结果见`working-tree-verification.json`，当前最终候选结果见`working-tree-final.json`。草稿通过后才提交候选；受检内容变更须明确再生成候选而非由验证器自修复。
- 提交后执行`python scripts/g6/audit-g6-04.py --verify`，实际提交态结果见后续`submitted-verification.json`，回填后再执行默认模式确认选择原归档内容commit且当前可变文件已提交。
- 本轮不重跑未受影响的业务全量测试，不声称远程CI；失败/弃用诊断进入A日志，关键Review/source不改。

## 5 提交C/B与风险

002/003仅为REMEDIATED_BY_A / PENDING_C_TARGETED_REREVIEW；A不自行关闭C的Issue。C核对计划状态与提交态只读方法后，在唯一索引日期化追加候选commit/hash及Review，再由B最终技术确认与债务接收；001仍为程序阻断。

真实甲方接口、KN-065独立部署、现场意见/签署、培训、试运行、基础数据与backlog/补测仍延期。新审计可复现性与历史指标不混计，真实0/6接口、0独立操作者与11/59/47均保持。最终准出/冻结须指定Review真实取得，不代签。
