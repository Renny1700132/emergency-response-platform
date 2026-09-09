# 成员 C 第一关提示词包 v1

## 1. 使用说明

- 适用项目：博物馆智能运营中心——应急管理子系统，第一关“立项竞标”。
- 生成依据：`AGENTS.md`、`tasks.md`、`governance/*.md`、`control/*.md` 和现有 A 工作稿。用户提供的 ChatGPT 共享页在生成时显示 `Unable to load site`，未把不可见页面内容伪装成已读取事实。
- 使用方法：严格按 `tasks.md` 的前置关系，每次只复制并发送下面一个完整代码块。不要一次发送多个任务；每个代码块都是该单项任务的明确授权和完整 `USER_PROMPT_RAW`。
- 当前暂停令仍有效。保存本提示词包不启动任何业务任务；只有用户实际发送某个代码块，才授权其中指定任务。
- 若仓库分工、用户需求书或任务书后续发生有效变更，应新建提示词包版本，不覆盖本版历史。

## 2. 建议执行顺序

1. G1-01：需求与招标事实解析。
2. G1-02：BASELINE-V0.1。
3. G1-01-A：C 对 A 的项目价值与范围稿做符合性复核和 Baseline Reconciliation。
4. 等待 B 完成 G1-04 后执行 G1-05。
5. 在 A 的 G1-03、G1-06、G1-07、G1-08、G1-11、G1-12、G1-13 分别进入 REVIEW 时，逐项执行相应 C 复核提示词。
6. G1-08 完成后执行 G1-09；其 Issue 闭环后才允许进入后续冻结流程。
7. 每日结束执行 C 的 AI 留痕审计提示词；若看板没有对应审计 Task，先增设独立 Task，不能复用已完成任务冒充本次审计。

---

## Prompt C-01：G1-01 需求与招标事实解析

```text
本次明确授权且仅授权执行 Task G1-01“需求与招标事实解析”。你现在是成员 C，主责为 C，复核人为 B；不得顺带启动 G1-02 或其他仍处于 TODO/暂停状态的业务任务。

严格执行 D:\project\emergency-response-platform\AGENTS.md、governance/ai_logging.md、governance/git_workflow.md、governance/source_priority.md 和 governance/review_workflow.md。正式分析前先完成仓库启动同步，再把本 Prompt 完整原文逐字写入当天日志并进入 RUNNING；不得只保存摘要。任务结束前必须先逐字记录最终用户可见输出，再检查、提交、安全同步并普通 push 到 origin/master，最后回填提交与推送证据。禁止 force、rebase、amend、reset --hard 或覆盖他人修改。

先在 tasks.md 确认 G1-01 的主责、复核、输入、输出、前置和状态；只有前置满足时才把 G1-01 改为 DOING。检查 control/facts.md、control/key_numbers.md、control/issues.md，并执行 Preflight Conflict Check。用 documents 技能完整读取真实需求文件 docs/用户需求书-03-应急管理子系统.docx；用 PDF 技能读取 docs/通关实验任务书1-立项竞标.pdf 中与第一关提交物、评分和验收有关的部分。不要读取明确标注为课程课件的 PPT/PDF。教学案例最多参考结构，不得把案例事实、技术栈、数字、性能、人员、预算、工期或 SLA 带入本项目。

逐条提取并建立可回溯证据：项目名称与边界、建设内容、功能模块与所有 FR、★实质性条款、接口与外部依赖、甲乙方责任、交付物、验收条件、非功能要求、质保/SLA、法规标准、明确排除项及所有定量要求。每条记录必须包含稳定编号、忠实摘要、原文定位（文件、章节/表格/页码或可复核锚点）、状态和备注。数字统一进入 control/key_numbers.md；项目事实统一进入 control/facts.md；另创建或更新一份条款清单与来源定位工作稿，默认路径为 docs/work/C_REQ/requirements_clause_catalog.md。不得把未验证推断写成 VERIFIED；不确定项统一写【待人工确认】并登记 control/issues.md。

重点核验现有 A 工作稿提出的疑点，但不得直接裁决：视频保存要求与既有视频系统不改造、亚米级定位与定位基站采购范围、出入口联动“明确实现/宜支持”的口径，以及消息、中台、地图、移动端、部署环境和甲方基础数据责任。发现真实需求冲突或无法判断哪个条款有效时进入 BLOCKED，列出双方原文、影响和需要谁确认。

完成后做双向抽查：原文条款是否全部进入目录；facts/key_numbers 中每条是否能回到原文；★条款是否零漏项；是否存在重复编号、无来源数字、案例污染或超需求承诺。把自检写入 logs/reviews/<日期>_G1-01-self-check.md。G1-01 完成自检后只进入 REVIEW，等待 B 复核，不得自行标记 DONE。最终回复只给简短状态、主要产物、未决项数量和当天 Prompt 日志的本地链接，且必须与日志中的 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## Prompt C-02：G1-02 BASELINE-V0.1

```text
本次明确授权且仅授权执行 Task G1-02“Baseline V0.1”。你现在是成员 C，主责为 C，复核人为 B。仅当 tasks.md 中 G1-01 已经完成 B 的复核并为 DONE 时才能开始；否则记录 BLOCKED 和缺失证据，不得绕过前置，不得启动其他任务。

严格遵守 AGENTS.md、governance/ai_logging.md、governance/git_workflow.md、governance/source_priority.md 和 governance/review_workflow.md：先同步远程 master，再逐字记录本 Prompt，完成 Preflight 后进入 RUNNING；结束前逐字记录最终输出，检查、提交、安全同步、普通 push 并回填证据。全程禁止修改原始需求书、force push、历史重写和擅自处理来源不明的工作区改动。

以已经由 B 复核通过的 control/facts.md、control/key_numbers.md、G1-01 条款清单与来源定位为唯一基线输入。核对 control/issues.md，任何会改变真实需求事实、★条款、性能、项目边界、验收、甲方职责、质保/SLA 或法规口径的开放问题都不得被 AI 自行裁决。创建 docs/work/C_REQ/BASELINE-V0.1.md，并更新 control/change_log.md 中 BASELINE-V0.1 的范围、准出证据、状态、主责、复核和关联提交占位。

基线至少包含：适用范围与排除项、事实索引版本、关键数字版本、条款目录版本、★条款清单、外部系统和责任边界、验收与交付要求、未决项/假设清单、后续 G1-03/G1-04/G1-05 的强制引用规则、变更控制方法。每一项只能引用已验证控制条目，不复制一套失去同步关系的事实库。无法确认内容保留【待人工确认】并说明是否阻断下游；不得用“合理推测”填空，不得新增需求外承诺。

执行准出检查：G1-01 是否 DONE；所有 ★ 条款是否有来源；所有关键数字是否有单位、口径、来源和承诺属性；所有事实是否有定位；阻断性 Issue 是否为零；原始资料哈希是否未被修改；基线是否可供 A/B/C 唯一引用。将检查写入 logs/reviews/<日期>_G1-02-self-check.md。通过自动检查后 G1-02 只进入 REVIEW，等待 B 人工复核；B 复核通过后才能将基线状态和 Task 改为 DONE。最终回复必须先原样写入日志，只简要报告基线状态、阻断项和日志链接。
```

## Prompt C-03：G1-01-A 的 C 符合性复核与基线协调

```text
本次明确授权且仅授权成员 C 对 Task G1-01-A“项目价值与范围分析”执行符合性复核和 Baseline Reconciliation。不得启动其他业务任务。开始条件是 G1-02 的 BASELINE-V0.1 已由 B 复核通过；若未满足，记录 BLOCKED，不得继续使用临时 fallback 冒充正式基线。

严格执行仓库的 AI 留痕、Git、安全同步、信息源优先级和评审工作流。先同步 master，再逐字记录本 Prompt，完成 Preflight 后进入 RUNNING；最终输出先逐字落日志，再提交、安全同步、普通 push 和回填。不得直接替 A 静默改写 docs/work/A_PM/project_positioning.md，也不得维护第二套正式版本。

逐段核对 A 工作稿与 BASELINE-V0.1、control/facts.md、control/key_numbers.md、条款目录和真实需求来源。检查项目定位、价值表述、In/Out Scope、外部依赖、责任边界、业务闭环、约束、待确认问题和数字引用。重点复核现有 10 个待确认项及视频保存、人员定位、出入口联动三类条款张力。任何宣传性价值结论、范围表述或“优于要求”的承诺都必须有依据和履约能力；★条款不得负偏离。

将逐项结论写入 logs/reviews/<日期>_G1-01-A-C-review.md，至少包含检查项、基线证据、原稿位置、结果 PASS/ISSUE/BLOCKED、修订建议和责任人。发现问题时在 control/issues.md 编号登记，由 A 修改原稿；涉及技术边界时要求 B 给出书面意见；涉及真实需求口径时保留【待人工确认】或等待甲方澄清。只有 A 完成修改、C 复验通过且 B 的必要技术意见已到位，才能关闭 Issue 并建议将 G1-01-A 置为 DONE。

最终回复只报告复核结论、Issue 数量、是否准出和日志链接；先保证该文本与 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## Prompt C-04：G1-05 合规矩阵与澄清

```text
本次明确授权且仅授权执行 Task G1-05“合规矩阵与澄清”。你现在是成员 C，主责为 C，复核人为 B。仅当 G1-02 与 G1-04 都已满足 tasks.md 的前置要求并有可复核输入时开始；否则记录 BLOCKED，不得猜测技术方案响应，不得启动后续任务。

严格遵守 AGENTS.md 和全部 governance 工作流：启动同步 → Prompt 原文日志 → Preflight → RUNNING → 验证 → 最终输出原文日志 → commit → 最终远程检查 → 普通 push → 回填。不得 force、重写历史、改动原始需求书或把自动检查冒充 B 的人工复核。

以 BASELINE-V0.1、G1-01 条款目录、control/facts.md、control/key_numbers.md 和 B 主责的 G1-04 技术方案为输入，逐条更新 control/compliance_matrix.md。每行至少包含：条款编号、忠实摘要、★标识、来源定位、验收方式、技术响应位置、响应状态（满足/正偏离/负偏离/待澄清）、主责、核验人和证据。不得把“计划支持”“可扩展”自动等同于满足；没有实现路径、验证方法或责任边界时标为待澄清。★条款必须 100% 覆盖、零负偏离；任何正偏离也必须有履约依据，禁止为了投标效果增加无来源承诺。

创建 docs/work/C_REQ/clarification_and_query_record.md，按“问题编号—需求原文—冲突/歧义—影响—建议向甲方提出的问题—A/B/C 责任—状态—答复证据”记录澄清与质询。优先处理视频保存、人员定位基站、出入口联动、中台能力、统一消息通道、地图数据、移动端形态、既有系统接口、甲方部署环境和基础数据责任。AI 不得替甲方作答；未取得书面答复时保留【待人工确认】。

执行 ★ 覆盖率、全条款覆盖率、响应位置有效性、数字一致性、验收可执行性、负偏离和需求外承诺检查。把自检写入 logs/reviews/<日期>_G1-05-self-check.md；发现问题登记 control/issues.md。完成后 G1-05 进入 REVIEW，由 B 复核技术理解和可验证性，不能自行 DONE。最终回复只简报矩阵行数、★条款状态、澄清项/Issue 数量和日志链接，并先逐字写入日志。
```

## Prompt C-05：G1-03 项目建议书的 C 复核

```text
本次只授权成员 C 复核 Task G1-03 的 A 主责项目建议书工作稿，不授权修改 A 的正式稿或启动其他任务。只有 tasks.md 中 G1-03 为 REVIEW 且 BASELINE-V0.1 有效时开始，否则如实记录 BLOCKED。

按 AGENTS.md、AI 日志和 Git 工作流先同步、逐字记录本 Prompt、Preflight，再执行复核；最终回复先逐字落日志，再提交、普通 push 和回填。以 BASELINE-V0.1、facts、key_numbers、合规矩阵当前有效部分及任务书提交要求为准，检查建议书的项目背景、目标、范围、价值、建设内容、交付物、约束、验收、实施口径和所有数字。重点发现：需求遗漏、★条款弱化、无来源 KPI/ROI、案例事实污染、范围外承诺、甲乙方责任倒置和待澄清事项被写成确定结论。

把复核结果写入 logs/reviews/<日期>_G1-03-C-review.md；每个问题同步登记 control/issues.md，给出原稿位置、基线证据、风险、期望修订和主责 A。不得直接静默改稿。A 修改后由 C 复验并关闭 Issue；全部阻断项关闭后才建议 G1-03 DONE。最终回复只报告 PASS/ISSUE/BLOCKED、Issue 数量、准出结论和日志链接，且与 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## Prompt C-06：G1-06 项目计划 v1 的 C 复核

```text
本次只授权成员 C 对 Task G1-06 的 A 主责“项目计划 v1”执行符合性复核，不授权直接维护 A 的计划稿或启动其他任务。确认 G1-03、G1-04 已满足前置且 G1-06 为 REVIEW；不满足则记录 BLOCKED。

完整执行仓库启动同步、Prompt 原文留痕、Preflight、复核、验证、最终输出原文留痕、commit、安全同步、普通 push 和回填。以任务书提交物、BASELINE-V0.1、合规矩阵、G1-03/G1-04 及真实三人资源约束为准，检查 WBS 是否覆盖全部第一关提交物、里程碑与依赖是否完整、A/B/C 主责和复核是否一致、2 天压缩窗口是否仅作为课程内部计划而未替代真实项目工期、人工复核和 Issue 闭环是否留有时间、关键数字是否引用唯一事实源。

将结果写入 logs/reviews/<日期>_G1-06-C-review.md。任何遗漏、错误依赖、角色冲突、无依据工期或把未完成前置写成已完成的问题都登记 control/issues.md，由 A 修改，C 复验关闭。全部符合后才建议 G1-06 DONE。最终回复只简报结论、Issue 数量、计划是否准出和日志链接，并与日志原文一致。
```

## Prompt C-07：G1-07 风险登记册 v1 的 C 复核

```text
本次只授权成员 C 复核 Task G1-07 的 A 主责风险登记册 v1，不授权直接维护 A 的正式风险登记册或启动其他任务。仅当 G1-04、G1-06 输入齐备且 G1-07 为 REVIEW 时执行，否则记录 BLOCKED。

按仓库治理要求完成启动同步、Prompt 全文留痕、Preflight、复核、最终输出全文留痕、提交、安全同步、普通 push 和回填。以 BASELINE-V0.1、facts、key_numbers、compliance_matrix、clarification 记录、G1-04 技术风险输入和 G1-06 计划依赖为准，核验是否覆盖需求、★条款、接口、第三方系统、数据、部署、验收、合规、进度、人员和澄清风险。检查每项风险是否有来源、触发条件、概率/影响口径、责任人、缓解措施、应急措施、截止时间和关联 Issue；不得伪造概率数字或声称风险已关闭。

结果写入 logs/reviews/<日期>_G1-07-C-review.md，问题进入 control/issues.md，由 A 修改、C 复验。存在未处理的高影响合规风险、★负偏离风险或无来源关键数字时不得准出。最终回复只报告结论、Issue 数量、阻断风险和日志链接，并与 AGENT_FINAL_OUTPUT_RAW 一致。
```

## Prompt C-08：G1-08 技术投标书整合稿的 C 复核

```text
本次只授权成员 C 对 Task G1-08 的 A 主责技术投标书整合稿做需求符合性复核，不授权静默改写整合稿、执行 B 的技术检查或启动 G1-09。仅当 G1-03 至 G1-07 的前置状态满足且 G1-08 为 REVIEW 时开始，否则记录 BLOCKED。

按 AGENTS.md 和 governance 全流程先同步、逐字记录 Prompt、Preflight，再复核；最终输出先逐字落日志，再提交、普通 push 和回填。以真实需求书的已验证控制条目、BASELINE-V0.1、facts、key_numbers、compliance_matrix、澄清记录和任务书为准，逐章检查所有功能、★条款、接口、责任边界、非功能、验收、交付、质保/SLA、法规和数字是否完整且一致。检查每个“满足/支持/达到/保证”是否有明确响应位置、验证方式和履约依据；禁止负偏离、无来源优越性承诺、案例污染、把待澄清内容写成确定结论或把内部 2 天计划写成合同工期。

创建 logs/reviews/<日期>_G1-08-C-review.md，形成按严重度分级的符合性 Issue；同步登记 control/issues.md，由 A 修改整合稿，涉及技术正确性时转交 B 出具意见。C 复验后才关闭 Issue。任何 ★ 漏项/负偏离、来源不明关键数字或高影响 Issue 存在时，不得建议 G1-08 DONE。最终回复只报告复核结论、各级 Issue 数量、是否准出和日志链接，并与日志中的最终原文完全一致。
```

## Prompt C-09：G1-09 最终符合性检查

```text
本次明确授权且仅授权执行 Task G1-09“合规检查”。你现在是成员 C，主责为 C，复核人为 B。只有 G1-08 已形成可检查的整合候选稿并满足 tasks.md 前置时才能开始；本 Prompt 不授权修改 A 的投标书正文或启动 G1-10/G1-11。

严格执行启动同步、Prompt 原文日志、Preflight、RUNNING、验证、最终输出原文日志、commit、最终远程检查、普通 push 和回填。以投标书候选稿、control/compliance_matrix.md、facts.md、key_numbers.md、clarification 记录、BASELINE-V0.1 和任务书为输入，执行完整双向追踪：每个需求/★条款是否在投标书有响应和验收证据；投标书的每个功能、数字、性能、范围、责任、SLA 和法规承诺是否能回到有效来源。

检查清单至少包括：★条款 100% 覆盖且零负偏离；所有关键数字完全一致；响应位置真实存在；验收方式可执行；未决澄清未被隐藏；无需求外承诺；无教学案例事实；交付物完整；甲乙方责任未倒置；A/B/C 各项复核证据存在；原始资料未修改。将结果写入 logs/reviews/<日期>_G1-09-compliance-check.md，逐项记录 PASS/FAIL/BLOCKED、证据和责任人。所有 FAIL 必须进入 control/issues.md，由正式产物主责修改，C 复验，B 复核 G1-09 的技术理解与可验证性。

只在零 ★ 负偏离、零来源不明关键数字、零未关闭高影响符合性 Issue，且 B 完成复核后，才把 G1-09 标为 DONE。否则保持 REVIEW 或 BLOCKED。最终回复只报告总体结论、覆盖统计、Issue 数量、准出判断和日志链接，且必须与 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## Prompt C-10：G1-11 跨文档一致性工作的 C 复核

```text
本次只授权成员 C 复核 Task G1-11 中 A 主责的跨文档一致性检查结果；C 的范围是需求符合性、数字来源、★条款和提交物完整性，不替代 A 的跨文档主责或 B 的技术检查。仅当 G1-09、G1-10 已完成且 G1-11 为 REVIEW 时开始，否则记录 BLOCKED。

按治理规则完成同步、Prompt 全文日志、Preflight、复核、最终输出全文日志、commit、安全同步、普通 push 和回填。复核 A 的一致性记录是否覆盖全部正式候选产物与 control 文件，重点核对需求编号、项目范围、模块名称、接口责任、验收口径、关键数字、里程碑、角色、风险、澄清答复和版本号。任何冲突必须指出双方文件位置、权威来源、采用口径和影响；不允许为了“一致”而修改真实需求事实或删除历史。

将 C 的复核证据写入 logs/reviews/<日期>_G1-11-C-review.md，问题进入 control/issues.md，由 A 组织主责人修改并由 C 复验。★不一致、数字漂移或未关闭高影响 Issue 存在时不得准出。最终回复只报告结论、冲突/Issue 数量、是否准出和日志链接，且与日志原文一致。
```

## Prompt C-11：G1-12 述标与模拟质询材料的 C 复核

```text
本次只授权成员 C 对 Task G1-12 的 A 主责述标稿、问答清单和模拟质询记录执行符合性复核，不授权直接维护 A 的正式材料。仅当 G1-11 已完成、候选稿有效且 G1-12 为 REVIEW 时执行，否则记录 BLOCKED。

严格执行仓库同步、Prompt 全文留痕、Preflight、复核、最终输出全文留痕、commit、安全同步、普通 push 和回填。以冻结候选稿、BASELINE、facts、key_numbers、compliance_matrix、澄清记录、风险登记册和任务书为准，核验述标中的每项功能、数字、价值、工期、验收、SLA、法规和优越性陈述。问答必须覆盖 ★ 条款、范围边界、外部系统责任、视频/定位/门禁/消息/部署等澄清点及主要风险；答案不得虚构甲方答复、实施结果、演示证据或需求外承诺。

结果写入 logs/reviews/<日期>_G1-12-C-review.md；问题登记 control/issues.md，由 A 修改、C 复验。存在无法回溯的关键数字、★条款弱化、待澄清内容被确定化或与候选投标书不一致时不得准出。最终回复只报告结论、Issue 数量、重点质询缺口和日志链接，并与 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## Prompt C-12：G1-13 最终冻结前的 C 合规门禁

```text
本次只授权成员 C 对 Task G1-13 执行最终合规门禁复核。A 仍是最终冻结与归档主责；C 不得自行冻结 BASELINE-V1.0、覆盖旧基线或替 A 修改正式产物。仅当 G1-12 已完成且所有候选产物进入最终复核状态时开始，否则记录 BLOCKED。

按 AGENTS.md 和 governance 完成启动同步、Prompt 原文留痕、Preflight、门禁检查、最终输出原文留痕、commit、安全同步、普通 push 和回填。检查全部候选产物、BASELINE-V0.9/V1.0 候选、facts、key_numbers、compliance_matrix、issues、change_log、澄清记录、评审证据、Prompt 日志和 Git 证据。最终准出条件：★条款 100% 覆盖且零负偏离；关键数字全部有来源且跨文档一致；所有高影响 Issue 已由主责修改并经复核关闭；澄清结论有真实证据；原始资料未修改；无案例污染和需求外承诺；G1-09/G1-10/G1-11 三项最终检查均有有效结论；版本、commit 和归档清单可追溯。

将结果写入 logs/reviews/<日期>_G1-13-C-final-compliance-gate.md，逐项给出 PASS/FAIL/BLOCKED 和证据。任一硬门禁失败时明确写“不允许冻结”，登记 Issue 并交 A 处理；不得用自动检查冒充用户、甲方、B 或其他人工签字。全部通过后只向 A 出具“C 符合性门禁通过”的复核意见，由 A 执行冻结与归档。

最终回复只报告门禁结论、未关闭 Issue 数量、是否允许 A 冻结和日志链接，并与 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## Prompt C-13：成员 C 每日 AI 留痕与审计抽查

```text
本次只授权执行成员 C 的当日 AI 留痕与审计抽查，不授权启动或修改任何业务任务。先在 tasks.md 确认存在本次独立审计 Task ID、主责 C、复核 B、输入、输出和状态；若不存在，先新增一个不复用历史任务的 GOV-C-AUDIT-<YYYY-MM-DD> 条目并完成同一套 Prompt 留痕。不得把已完成的 GOV-001 改写成今天的审计。

严格执行 governance/ai_logging.md 和 governance/git_workflow.md：启动同步后逐字记录本 Prompt，Preflight 后进入 RUNNING；最终输出先逐字落日志，再提交、安全同步、普通 push 和回填。只做证据一致性核对，不补造不存在的对话、人工签字、时间、工具结果或执行成功记录。

抽查当天所有正式 AI Task 的 Prompt 日志 ↔ tasks.md ↔ 实际修改文件 ↔ review/issue 记录 ↔ Git commit ↔ origin/master。逐项检查 USER_PROMPT_RAW 是否在实质执行前完整落盘、AGENT_FINAL_OUTPUT_RAW 是否在正式回复前落盘、状态机顺序是否完整、失败/弃用是否如实记录、raw_dialogue_available 是否真实、主责与复核是否匹配、Prompt/日志/控制文件是否被提交、push 是否普通且远程已包含任务提交和回填提交。自动检查不得写成人工确认；缺少人工核验时保留 PENDING_REVIEW。

将结果写入 logs/reviews/<YYYY-MM-DD>_C-ai-audit.md，按 Task ID 给出 PASS/NEEDS_CORRECTION/BLOCKED、证据和修正责任人；问题进入 control/issues.md，不得删除或美化历史。审计任务完成自动自检后进入 REVIEW，由 B 复核。最终回复只简报抽查数量、异常数量、阻断项和当天 Prompt 日志链接，并与 AGENT_FINAL_OUTPUT_RAW 完全一致。
```

## 3. 复核使用注意

- C 复核 A 的产物时，只写 Review/Issue；A 修改正式产物后，C 再验证关闭。
- B 复核 C 主责产物，C 不得把自己的自动自检写成 B 已通过。
- 任意提示词执行中发现任务前置未满足、真实需求冲突、语义不明确 Git 冲突或关键事实修改请求，必须进入 BLOCKED 并等待相应责任人/用户裁决。
