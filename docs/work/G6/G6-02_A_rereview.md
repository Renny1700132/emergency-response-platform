# G6-02 A 整改复验

- 日期：2026-10-12；角色A，用户授权Codex辅助，不冒充自然人签署。
- 输入master：b8f729dbb48aaafa9ed5cdf93f0f8afbf6a0e5ba；启动干净，fetch/pull成功。无临时污染；同期C日报等其他受控成果未删除、未用作本审核证据。
- 任务依据：最新tasks.md；C主责，B指定整体复核，A目录/计划/一致性审核。本轮B已在6fad770实际接受，41b8180回填可定位；A没有代替B执行或虚构其结论。
- 结论：PASS / ACCEPTED_BY_A；G6-02 = DONE（AUDIT_PACKAGE_ACCEPTED / REAL_WORLD_DEFERRED）。未发现未关闭BLOCKER/MAJOR；1项状态表达MINOR已依当前Prompt授权修正。首轮退回历史保留。

## 1 交付索引

首版29项（20 AVAILABLE/9 NOT_AVAILABLE）锁定未倒改；GI-001—021、GI-022—039、GI-040—050分别按cfdb6f5、d17847d、e223f6d复算21/18/11个canonical Git blob，文件/字节数/hash/版本/位置/状态均吻合。首版路径当前存在22/29仅表示路径存在，不重算为验收接受。

本次独立比较首版items和21项currentIncrement与0de6884原快照完全一致；锁定历史结构不改。两本当前DOCX/PDF字节与各自最新GI条目吻合，尤其更正后用户手册GI-040/041已覆盖旧版本。规划答辩路径与实际候选路径、历史图与发布75f01c3分别可定位。索引不是宣称P1全套交付。

## 2 RTM与证据

A独立逐行核对117个AC：FR、★、plannedTC、原始rawLocator、G5 RTM v5及原始执行结果一致；上游designIds可定位，PASS项有真实已归档evidence引用。39 FR/117 AC/34★保持，11 PASS/59 NOT_RUN/47 BLOCKED不变；★FR 1 PASS/33 BLOCKED。未运行TC保持计划/N/A边界，不把链路存在视作实际执行。

既有B校验再次核对30实现延期/76证据延期，以及8组1160样本CSV/raw、失败0。性能限本地内存HTTP/模拟适配，不转为生产SLA；23项模拟试演和26条B隔离部署步骤未派生新AC PASS。

## 3 数字和真实状态

指标账提供来源、定义分母、截止范围/排除项。29、20/9、21、18、11、22/29属于不同统计对象，不相加美化。V0.1渲染22页是历史值，V0.2当前两本共20页分开记载。真实系统0/6、真实非乙方独立操作者0、真实接受0仍保留。

课程审计包接受、成员本地隔离/模拟证据、真实延期分别表达。G6-03 C整体复核、现场正常异常、培训、试运行、基础数据双方确认和验收签署继续挂账；未改变甲方责任/KN-065/冻结需求或真实门禁。

## 4 AI审计

Prompt→产物→commit→PR N/A→Review及日志回填完整可定位。独立检查14个相关commit均为当前master祖先，C第二轮6f5d86e/普通merge858f1f0与81fc5a4/ca5b916/56dbeff、B再复验6fad770/41b8180及G6-01 A接受e223f6d/d322c64形成链存在。AI四项未知继续UNKNOWN/待人工确认，不推断AI比例、复用次数或工时。

C日志顶层PUSHED / PENDING_B为其提交时点记录，实际后来B接受以新增Review为准，不改写其历史Prompt/最终输出；本次A自身commit在同一日志独立回填避免自引用。

## 5 Issue闭环及小错

| Issue | 当前判定 | 依据 |
|---|---|---|
| ISSUE-G6-02-002 | CLOSED / VERIFIED_BY_A_WITH_B_FINAL_ACCEPTANCE | 最终三段增量已纳入手册/试演/Review，50条hash通过 |
| ISSUE-G6-02-003 | CLOSED / VERIFIED_BY_A_WITH_B_FINAL_ACCEPTANCE | 日期化审计链及真实回填可定位，指标未知如实 |
| ISSUE-G6-02-004/005 | CLOSED / VERIFIED_BY_B_AND_A | B实际再复验接受原样保留，A增量/日志/状态独立复验 |
| ISSUE-G6-02-006 | MINOR / FIXED_VERIFIED_BY_A | README、索引顶层、缺项016和审计当前结论仍待B；现在补真实B/A接受、首版时间标签及当前20页口径 |

006小修限内部索引/状态元数据与专用校验：顶层DONE及currentAcceptance补充实际Review依据，selfcheck保留原generatedAt/status/blockers并注明历史快照；standards/RTM说明首版与当前迁移，不修改117行结果。validator增加DONE时必须检查实际B接受、A记录/独立PASS及真实接受0，保留原历史候选校验。没有重写受控成果、没有生成另一套C索引或改正式DOCX/PDF。

## 6 跨文档结论与检查

G6-01最新手册hash、接受状态、发布版本、B部署26条及G5真实分母均吻合。旧A汇总G6-02 NEED_FIX为历史，本次追加当前PASS；G6-03 B技术确认已定位，C整体仍待，不代签、不允许G6最终冻结/真实验收PASS。

独立脚本scripts/g6/review-g6-02-a.py共197项断言PASS；专用validator和B首版脚本在小修前后均exit0。详细原始输出保存在evidence/g6/G6-02/A-rereview。本轮仅索引/Review状态小修，没有应用源码变化，不重复跑已通过的整库质量门禁。git diff/staged检查后按OVR-038安全提交、非force推送。

下一步：G6-03由C整体复核并落实真实现场资源；G6-04按既定任务承接指标/债务/延期，最终移交等待其依赖满足。G6-02后续新增现场证据由C在同一唯一索引日期化追加，不倒改历史。

## 修改文件

本复验记录；tasks.md G6-02状态；control/issues.md、G6_A_review_summary.md、docs/README.md追加接受；G6-02同一README/索引MD与JSON/审计/指标/延期/请求/教学映射/RTM汇总说明/selfcheck当前标记；validate-g6-02.mjs状态校验；独立A脚本及A-rereview输出；A原文日志。B Review、C原文日志、117行RTM JSON、应用代码、原始输入/正式DOCX/PDF保持。
