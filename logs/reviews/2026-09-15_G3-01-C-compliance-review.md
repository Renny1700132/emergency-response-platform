# G3-01 设计输入基线：C 需求符合性复核

- 任务：G3-01
- 主责 / 复核：B / A、C
- 被复核文件：`docs/work/B_TECH/G3-01_design_input_baseline.md`
- 被复核基点：`ffa28f44f8f29fc32de40c799266e9fa3a1c5a3c`
- 复核日期：2026-09-15
- 结论：`CHANGES_REQUIRED / NOT_ACCEPTED`

## 1. 复核依据与范围

- `tasks.md`：G3-01 主责 B、复核 A/C，前置 G3-00=`DONE`，当前状态 `REVIEW`。
- `control/baselines/BASELINE-V1.0.md`、`control/facts.md`、`control/key_numbers.md`、`control/issues.md`：冻结事实、数字、责任边界与开放问题。
- `control/g2/requirements_catalog.md`、SRS、spec、RTM：39 条 FR、34 条★FR、29 条 MVP Must、117 条唯一 AC 及设计/测试待挂接状态。
- `docs/inputs/G3/通关实验任务书3-设计与计划.pdf`：设计四件套、OpenAPI、ADR≥2、原子任务、测试左移和 M3 门禁。
- G3-00 启动规划及 G3-01 B 自检。

Preflight Conflict Check：用户要求不再 pull；开始时工作区干净，`master`、本地 `origin/master` 均为 `ffa28f44`，未发现基于过期版本开展复核的迹象。未读取明确标注为课程课件的 PDF/PPT。未发现 P0 与真实需求事实冲突。

## 2. 检查结果

| 检查项 | 结果 | 证据与判断 |
| --- | --- | --- |
| 任务前置与边界 | PASS | G3-00 已 DONE；G3-01 仅形成设计输入、模块边界和候选，没有提前生成概要/详细/数据库/接口正式稿或 Accepted ADR。 |
| 第三关提交物口径 | PASS | 第三关任务书第2—4页要求的设计四件套、OpenAPI、ADR≥2、RTM、≤0.5人日原子任务、测试计划与 constitution 门禁均得到继承或被分派至后续 G3 任务。 |
| FR、★与 AC 计数 | PASS | 39 条 FR、34 条★FR、29 条 MVP Must、10 条非 MVP 本期范围准确；spec 中 AC 唯一计数为 117，RTM 设计/测试列仍明确待挂接。 |
| FR 模块覆盖 | PASS | MOD-PLAN—MOD-PLATFORM 的编号并集覆盖 G2-FR-001—039；重复映射属于合理跨模块协作，没有删除非 MVP 范围。 |
| 关键数字与承诺属性 | PASS | 事件、定位、视频、页面、容量、可用率、安全、审计、覆盖率和部署数字可回指 key_numbers；KN-070—078 被正确标识为待验证方案建议。 |
| 视频、定位、消息、门禁、地图、H5、部署和数据责任 | PASS | 甲乙边界与课程模拟澄清一致；未将录像存储、定位设施、地图建模、原生 APP、服务器采购或源数据业务正确性转移给乙方。 |
| 信息发布、入侵与消防集成边界 | ISSUE / MAJOR | 原稿第57—70行的外部能力表没有“信息发布”项，也没有明确消防接口；第66行仅合并写“门禁/安防”，无法确认是否覆盖入侵和消防；第87行 MOD-INTEGRATION 清单同样遗漏信息发布、消防，并未把四系统联动验收 KN-064 显式挂入后续设计。与 F-005、F-208 不完整一致。对应 ISSUE-G3-01-002。 |
| M2 连通证据边界 | PASS_WITH_OPEN_ISSUE | ISSUE-G3-01-001 对视频/消息真实连通证据缺失的分级、责任和关闭条件合理；可保留抽象端口，不得冻结外部契约或在 M3 误报验证完成。 |
| 架构候选与人工拍板 | PASS | ARC-A/B/C 的权重合计 100，计算结果 89/77/60 正确；ADC-001—006 均保持 HUMAN_DECISION_REQUIRED，B 建议未冒充 Accepted 决策。 |
| 原型边界 | PASS | Vue、localStorage、Mock、截图仅作参考，没有变成正式架构、接口、数据模型或验收证据。 |
| 原始资料 | PASS | 原始需求书和第三关任务书仅只读核对，未修改。 |

## 3. Issue 与关闭条件

| Issue | 严重度 | 状态 | 主责 | C 关闭条件 |
| --- | --- | --- | --- | --- |
| ISSUE-G3-01-002 | MAJOR / BLOCKING_TO_G3-01_DONE | OPEN | B | 在集成责任表和 MOD-INTEGRATION 中显式纳入信息发布与消防接口；明确入侵系统由哪个适配边界覆盖；回指 F-005、F-208、KN-064，并将视频、信息发布、物联网、中台四系统端到端联动保留为后续设计/测试/验收输入，不把接口能力写成已验证。 |

## 4. 准出结论

G3-01 的 FR、★、AC、数字、主要责任边界和架构候选总体可靠，但外部集成边界遗漏一项明确接口并对两类既有系统覆盖含混，会造成后续概要设计、接口设计和 M3 追踪断链。C 结论为不接受准出；G3-01 保持 `REVIEW`，由 B 修订后提交 C 复验。A 的可交付性与计划接口复核尚未检索到独立记录。G3-02 依赖 G3-01，不应在本 Issue 关闭前直接进入正式执行。
