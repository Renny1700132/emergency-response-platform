# G6-04 最终归档INDEX（V0.3状态迁移整改送审，未冻结）

当前输入master：`d17c1a088a23759f9c844f0446085cdc2a6329c2`。事实/AI统计仍锁原`3b47e8f`快照；本视图引用C唯一`evidence/g6/G6-02/delivery-index.json`，不替代它或重算29项/三段增量/验收结果。

## 分离生成与验证

生成只在A明确修订候选时执行：`python scripts/g6/build-g6-04-archive.py --source-master d17c1a088a23759f9c844f0446085cdc2a6329c2`。生成不是验证，不输出PASS。

第三方执行：`python scripts/g6/audit-g6-04.py --verify`。此命令只读现有索引、Git对象与检出文件，输出JSON到标准输出，写文件数为0，绝不调用生成器或重写受检索引。默认验证最近一次修改本INDEX JSON的Git commit（不是日志回填后的HEAD）；可显式`--commit <归档内容commit>`选择原时点。必须验证加载的索引与该提交的索引一致，随后验证每行的该提交内容。

未提交的候选可用`--verify --working-tree`做草稿检查，明确标记DRAFT，不能据此宣称提交态归档已通过。正式候选内容提交后必须再运行提交态只读验证。

## 字节与Git指纹

每行`contentSha256`是稳定验真值。`BINARY_EXACT_BYTES`文件（DOCX/PDF/PPTX/图片等）要求字节完全一致。明确列出的文本扩展名使用`TEXT_CRLF_TO_LF_ONLY`：仅把CRLF转换为LF，不删空白/BOM，不改字符/内容。提交态Git blob与检出文本按此规则核验，所以Git自动行尾转换不会导致假失败；任意其他文本改动必须失败。

`physicalSha256AtGeneration`与`physicalBytesAtGeneration`仅说明生成机器当时的物理字节，是诊断值，不能要求所有平台字节相同。只在文本稳定指纹已吻合时允许诊断物理SHA不同，并逐项报告`permittedTextEolConversions`；二进制不允许豁免。`inputGitBlobSha256`独立验证输入`sourceMaster`原Git blob，保留来源锚点。

日志/tasks/control/A自检的后续回填不回写原快照hash：每行原内容仍由归档内容commit校验；当前可变文件必须与HEAD已提交Git blob一致，任何未提交篡改都失败，并报告实际后续迁移路径。受控计划仅豁免G6-00—04五行的最后一列状态单元格：行数、其余单元格和正文逐字保护，且HEAD计划任务行必须与HEAD tasks一致。计划正文、范围、输入输出、任意业务文字变化仍失败；未提交状态更新也失败。显式允许本次A日志2026-10-14-A独立回填，不扩大到任意日志。C/B实际复核后另作日期化候选/索引增量，不自动接受。

索引及依赖它的验证回执排除自hash，通过包围它们的Git commit校验；完整排除范围见JSON的`exclusions`。旧1380项生成态PASS及C发现的231条物理差异是历史诊断，原记录/Git保留，不能改写成原先提交态通过。

## 配置库清单

完整逐文件名称/路径/版本/状态/稳定hash/物理诊断hash/输入Git指纹/C配置项映射见`final-archive-index.json`。Git事件全集与任务明细保留在`git-history.txt`和`actual-task-git-events.json`。

| 类别 | 归档记录数 | 状态边界 |
| --- | --- | --- |
| 控制/治理/计划 | 33 | 存在性/历史归档，不派生验收PASS |
| 正式文档 | 116 | 存在性/历史归档，不派生验收PASS |
| RTM | 9 | 存在性/历史归档，不派生验收PASS |
| G6移交源 | 17 | 存在性/历史归档，不派生验收PASS |
| 测试/质量/Git过程证据 | 341 | 存在性/历史归档，不派生验收PASS |
| G6-04制作/启动留痕 | 35 | 存在性/历史归档，不派生验收PASS |
| Prompt日志 | 73 | 存在性/历史归档，不派生验收PASS |
| Review记录 | 324 | 存在性/历史归档，不派生验收PASS |

## 缺项与复核

- CI-017：培训材料与记录，`evidence/g6/G6-01/training-records.md`；NOT_AVAILABLE / DEFERRED，hash未知。
- CI-018：试运行报告，`evidence/g6/G6-04/trial-operation-record.md`；NOT_AVAILABLE / DEFERRED，hash未知。
- CI-020：验收签署记录，`docs/deliverables/G6/47-验收报告.docx`；NOT_AVAILABLE / DEFERRED，hash未知。
- CI-021：基础数据初始化与双方确认，`evidence/g6/G6-04/data-initialization-acceptance.md`；NOT_AVAILABLE / DEFERRED，hash未知。
- CI-028：G6答辩PPT与讲稿，`docs/deliverables/G6/G6-验收答辩.pptx`；NOT_AVAILABLE / DEFERRED，hash未知。
- CI-029：G6试演/现场运行记录，`evidence/g6/G6-03/live-run-record.md`；NOT_AVAILABLE / DEFERRED，hash未知。

002已由C关闭；003本轮由A整改，待C定向复验并纳入唯一索引，随后B最终技术确认。真实接口、KN-065、现场/培训/试运行/数据/签署等债务继续移交；G6-04保持REVIEW，未冻结。
