# Workspace 执行规则

## 1. 项目与当前关卡

本项目为“博物馆智能运营中心——应急管理子系统”。第一关“立项竞标”已冻结，第二关需求与规格（M2）及原型走查已完成，第三关“设计与计划”已通过 M3 并冻结为 `BASELINE-G3-M3-R1.0`。用户已于 2026-09-21 明确启动第四关“研发冲刺”；第四关必须以第三关冻结基线为唯一受控设计输入，不得静默改写冻结成果。

G1/G2/G3 的任务、基线、评审和过程证据均为历史受控记录，不得删除或篡改。`prototype/` 仅可作为页面组织、交互和演示状态的参考，不得将其 localStorage、Mock 数据或 `prototypeStore` 直接视为第四关的正式数据库、接口或技术实现。第四关仍须继承已冻结的需求、关键数字、★属性、责任边界与验收条件。

第四关统一执行 `governance/g4_development_workflow.md`：两个 Sprint，功能分支 + 单 PR，禁止直接推送受保护主干；功能、测试、RTM、日志和 `tasks.md = DONE` 必须进入同一功能 PR。PR 创建后只在同一分支补充 PR 编号、审核信息和必要证据；`tasks.md` 指定的唯一审核人 Review/Approve 后才可通过 PR Merge 进入 `master`。合并提交哈希不回写自身 PR，以 Gitee PR 合并记录为证据并由 G4-11 最终汇总。G4 不要求接入 Jenkins、Gitee Go 或其他远程 CI，也不得把本地质量门禁表述为远程 CI。G4-04 因实现 PR `!3` 已携带 `REVIEW` 合并，保留一次性既有收口 PR；此后 G4 任务不得再创建第二个收口 PR。G4-00 是从旧治理切换到新治理的启动提交；其后的 G4 研发任务不得以旧规则绕过 PR。

## 2. 每项 AI 任务的强制入口

当用户明确要求撰写每日工作日志、日报或总结时，必须先读取并遵循 `docs/daily_reports/SKILL.md`；该 Skill 不适用于未明确提出日报需求的普通任务。

当用户明确要求生成、撰写、修改或修订任何正式可交付文档时，必须先读取并遵循 `docs/deliverables/SKILL.md`，并先判定 `NEW DOCUMENT`、`CONTENT EDIT`、`FORMAT ONLY` 或 `CONTENT + FORMAT`。若有对应 Reference DOCX，必须物理复制该 Reference 作为正式件基础，禁止空白重建或仿制。面向甲方、教师、评委或验收的正式材料，以及最终进入 `docs/deliverables/` 的文档，原则上均触发；普通内部草稿、Prompt、Review、日志和 control 文件编辑不触发。

所有 AI 任务必须读取并遵守 `governance/ai_logging.md`。正式任务开始时，先按 `governance/git_workflow.md` 完成仓库启动同步，再写入用户 Prompt 原文；仓库同步不得夹带项目分析或产物修改。

### BEFORE_TASK

1. 先确定 Task ID；允许为此只读查看本文件和 `tasks.md`，但不得先做实质性分析或修改任务产物。
2. Before every formal task：确认工作树干净或已有修改归属明确，确认位于 `master`，执行 `git fetch origin master` 与 `git pull --ff-only origin master`；无法 fast-forward 时先诊断分叉，不得在明知 `master` 过期时开始工作，也不得覆盖其他成员工作。
3. 启动同步成功后，按 `tasks.md` 主责身份创建或追加 `logs/prompts/YYYY-MM-DD-A.md`、`-B.md` 或 `-C.md`，逐字写入本次用户 Prompt 的完整原文并记录 `CREATED → PROMPT_LOGGED`。A/B/C 不得共写新的无角色日期日志；旧日志原样保留。非成员系统维护任务才可使用 `-META.md`。摘要不能替代原文，详细规则见 `governance/ai_logging.md`。
4. 确认原文日志写入成功后，读取本文件和 `governance/ai_logging.md`，再进入 `RUNNING`。
5. 在 `tasks.md` 确认主责、复核、输入、输出和状态。
6. 检查 `control/facts.md`、`control/key_numbers.md`、`control/issues.md`。
7. 按 `governance/source_priority.md` 做 Preflight Conflict Check。
8. 如有冲突，修改前先输出冲突编号、双方规则、采用规则和评分/审计影响；普通方法冲突提示后继续。
9. 完整对话不能真实导出时写 `raw_dialogue_available: false`；仍必须保留用户 Prompt 原文和最终用户可见输出原文，严禁伪造其他内容。
10. 所有 G1 编标任务先读取 `control/baselines/` 当前冻结 Baseline，再读取本任务所需的最小控制文件；不得违反冻结范围、关键数字和澄清决策。新冲突必须进入 Issue/Change 流程，不得静默改变口径。

### DURING_TASK

11. 不得超出 Task 范围，不得未经确认扩大项目承诺。
12. 不确定事实统一写 `【待人工确认】`，不得编造来源、人物、时间、数据、结论或执行结果。
13. 非主责成员不得静默修改或维护另一套正式产物；问题进入 `control/issues.md`。
14. 不得读取明确标注为课件的 PPT/PDF；发现时只在资料索引记录“检测到课程课件，根据 Workspace 规则未读取”。
15. 教学案例只允许参考结构、表格、表达方法、工作流和产物粒度，禁止复制案例项目事实、技术栈、算法、性能、预算、工期、人员、需求或 SLA。
16. 不记录隐藏思维链、内部推理、不可见系统消息、私有工具内部状态或无法真实取得的内容。

### AFTER_TASK

17. 运行与风险相称的检查；失败不得写成成功，弃用结果不得省略。
18. 在正式回复前，先把准备发送给用户的最终可见回答逐字写入同一日志的 `AGENT_FINAL_OUTPUT_RAW`，记录 `OUTPUT_LOGGED`，再进入 `PENDING_REVIEW`。
19. 按 `governance/git_workflow.md` 检查 staged diff 并 commit。G4 任务只 push 功能分支并创建/更新 PR；审核通过后仅通过 PR Merge 进入 `master`，不得本地合并后直推 `master`。
20. 回填任务 commit、分支 push、PR、审核与合并结果及时间。G4 的功能、测试、RTM、日志和 `tasks.md = DONE` 在同一功能 PR 内完成；PR 创建后在同一分支补充 PR 编号和审核信息。合并提交哈希不要求写进自身 PR，直接以 Gitee PR 合并记录为证据并由 G4-11 汇总，禁止另建常规收口 PR。G4-04 的既有收口 PR 为一次性例外。
21. 更新 `tasks.md` 状态并确认工作区干净、远程已同步。
22. 日志成功写入后，正式回复原则上只给出简短结果和该日志的本地超链接，不重复长篇内容；发送文本必须与日志中的最终输出原文完全一致。

## 3. 指令与信息源优先级

P0 当前用户直接 Prompt / 当前任务指令；P1 真实项目《用户需求书》；P2 《通关实验任务书》；P3 学生指导书；P4 教学案例；P5 AI 判断。

P0 可覆盖工作方式、文件组织、AI 使用策略、日志策略与当前任务范围，但 AI 不得据此自行改变真实项目事实。涉及功能需求、★实质性条款、性能指标、项目边界、验收条件、甲方职责、质保/SLA、法规标准时，以真实《用户需求书》为权威；如用户明确要求改动这些事实，必须先特别警告并等待确认。

## 4. 唯一事实源与合规纪律

- `control/facts.md`：正式项目事实索引，主责 C。
- `control/key_numbers.md`：所有易漂移数字，主责 C。
- `control/compliance_matrix.md`：条款响应与验收追踪，主责 C。
- `control/issues.md`：问题、裁决和关闭证据。
- `control/change_log.md`：基线冻结与变更历史。
- `control/baselines/`：第一关及后续阶段的冻结基线；G1 编标任务必须遵守当前冻结版本。
- `control/overrides.md`：Prompt 覆盖参考方法规则的透明记录。

正式文档中的事实与数字必须先进入上述控制文件并能回指原文。★条款不得负偏离；正偏离或优于要求的承诺也必须有依据和履约能力，禁止增加需求外承诺。

## 5. 三人主责与复核

- A：项目建议书、项目计划 v1、风险登记册 v1、技术投标书最终整合、跨文档一致性、述标、最终冻结。
- B：技术分析、总体架构、功能方案、关键技术、数据/接口、非功能设计、技术验证、技术风险输入、技术质询。
- C：需求解析、facts、key_numbers、compliance_matrix、★检查、澄清、偏离检查、AI 规范/日志/审计、最终符合性。

每份正式产物只能有一名主责。默认复核：A 的产物由 C 复核，B 的产物由 A 复核，C 的产物由 B 复核。问题闭环为：Issue/Review → 主责修改 → 复核人关闭。最终检查分别由 C 做符合性、B 做技术正确性、A 做跨文档一致性与冻结。

## 6. Git 规则

遵守 `governance/git_workflow.md`：正式任务必须 commit。G1—G3 历史任务沿用当时的安全同步与非 force push 记录；自 G4-01 起只能 push 功能分支，由指定唯一审核人 Approve 后通过 PR Merge 进入 `master`，主责不得日常直推 `master`。保留双方历史与意图，禁止 force push、禁止重写历史、禁止把过程证据加入忽略规则。出现语义不确定的内容冲突时必须停止并等待用户裁决。基线冻结后只能经变更记录产生新版本，不覆盖冻结版。
