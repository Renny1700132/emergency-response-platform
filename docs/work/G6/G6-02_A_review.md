# G6-02 A计划/交付目录与一致性Review

- 日期：2026-10-12；master@40f2002；C候选56e9da9，回填e194cdb，B首版接受deaddc6。
- 任务主责C、最终整体复核B；本轮A按用户授权审查目录/计划/验收/一致性，结论 **NEED_FIX**，不替代B最终Review。tasks保持REVIEW。
- B已有结论仅ACCEPTED_FOR_INITIAL_G6_02_CANDIDATE；历史不改。

## 1 交付索引

29项首版索引ID唯一、主责/复核/路径/状态/哈希及inputSnapshotCommit可追踪；首版20 AVAILABLE/9 NOT_AVAILABLE是历史快照，不是当前完整目录。本轮点验当前同路径22项存在：CI-015/016两手册已存在，但仍NOT_AVAILABLE且无hash。新增PDF/台账/截图/交接/Pair manifest和模拟试演未入唯一索引。CI-028预期G6-验收答辩.pptx不存在，实际G6-03-验收答辩候选.pptx/.pdf存在，需区分候选与正式且登记正确位置；CI-029真实现场记录仍不存在，不能用模拟试演替换真实项。

ISSUE-G6-02-002：MAJOR OPEN；C须保留首版快照，并对当前锁定commit追加增量、canonical Git blob哈希、版本、状态、证据类型、Review状态及缺项对应。A提供目录输入：两手册DOCX/PDF、B工作稿和交接、命令台账/raw/截图、A四份Review及机械证据、G6-03候选PPT/PDF/讲稿/Q&A/试演结果/raw/版本锁、最终B/C复核待办。不得维护第二正式索引。

## 2 RTM审核

独立逐行复核117行：
- 唯一AC117、FR39、★FR34；每FR3AC，分母不变。
- 与G5 RTM v5逐行比较frId/star/plannedTC/result/rawLocator/deferredStatuses：0漂移。
- rawLocator逐条解析functional-gate-raw.json#acResults/n：117行ID/结果一致。
- 11 PASS/59 NOT_RUN/47 BLOCKED；11个PASS行在G5源有实际TC及证据，G6 plannedTC只是计划编号。
- 30 AC实现延期、76 AC证据延期；全部AC PASS的FR1（★FR1），至少一项PASS的FR6。
- 需求—FR—AC—计划TC—原始定位—结果标识链完整；执行链仅11项具备有证据PASS，106项仍不接受。
- G6增量没有直接携带全部设计/实现/实际TC字段，须回指RTM v5查全链，不得声称单文件已含全部执行证据。
- G6-03模拟试演23项检查不能推导23个AC新增PASS，也不能覆写11/59/47。

RTM首版保持真实通过；最终文档/试演/Review挂接仍待002增量，未宣称验收117/117。

## 3 数据口径审核

指标账列值、分母、区间/排除、来源、状态；8组性能JSON与CSV均1160条，失败0；范围为本地内存HTTP/模拟适配，非生产SLA。29、20/9为首版快照；当前22个原索引路径存在，只表示文件存在不代表验收可用。新候选PPT路径和模拟记录应增量计数，不能擅自把分母29改为新值或在新旧时间范围混算。

AI代码占比、打回率、Prompt复用次数、返工成本保留UNKNOWN/待人工确认，缺可靠人工样本或工时不能写0。Prompt数量不从日志文件数推导。数据本身无发现虚构；来源标题“真实AC结果”应附本地/模拟执行级别，不声称甲方现场验证。

## 4 真实状态审核

G5 c-final-acceptance实际为COURSE_CONDITIONAL_ACCEPTANCE、realWorldStatus延期、unconditionalRealWorldPass=false；G6仍候选。六类甲方系统0/6，独立操作者0，真实现场/培训/基础数据/试运行/签署缺失均保留。GAP001/002手册“未形成”需更新成“候选已提交/本轮NEED_FIX”；GAP004真实现场继续延期，模拟试演单列。资源延期与可整改审计问题分开，不因课程接受取消真实义务。

## 5 AI审计审核

| 对象 | 原文Prompt | 内容commit/回填 | Review/PR | 结论 |
|---|---|---|---|---|
| G6-01 | 2026-10-11-B LOG-G6-01-001 | f9eec53/ad4febe | A本轮退回；PR N/A OVR-038 | 链可定位，未接受 |
| G6-02 | 2026-10-11-C LOG-G6-02-001 | 56e9da9/e194cdb | deaddc6 B首版接受；最终未复核；PR N/A | 首版链可定位 |
| G6-03增量输入 | 2026-10-11-A LOG-G6-03-001及steering | 8dbfbab/40f2002 | B技术/C整体仍待；PR N/A | 仅模拟候选 |
| 本轮A | 2026-10-12-A完整原文 | 本轮提交后独立回填 | A审核记录，C日志人工抽查待；PR N/A | 不冒充B/C已复核 |

audit-records.md仍写G6-02待内容commit/B待执行、手册/试演尚未形成；JSON顶层REVIEW_INITIAL_CANDIDATE_PENDING_B与现有B首版接受不一致。ISSUE-G6-02-003：MAJOR OPEN，C须追加日期化审计链，保留历史候选原文和首版B结论；最终B复核必须真实发生。现有日志链存在不等于当前唯一审计账已经闭环。

## 跨任务接口与整改门禁

手册系统边界、G5数字、真实接口与KN-065延期保持一致；目录/审计与当前产物存在性冲突、代码版本漂移已记录。A不能静默修改C唯一证据包。002/003由C整改；B进行最终整体复核；A对目录/计划/一致性增量复验。当前拒绝G6-02最终收口及全部验收PASS。
