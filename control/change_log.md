# 基线与变更记录

基线冻结后不覆盖旧版本。新增版本必须记录范围、依据、主责、复核与关联 commit；需要改变真实项目事实时，必须有有效的用户/甲方书面依据。

| 基线 | 目标 | 准出条件 | 状态 | 冻结时间 | 主责 | 复核 | Commit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BASELINE-V0.1 | 初始需求/招标事实基线（旧计划标识） | G1-01 完成且 B 复核 | SUPERSEDED_BEFORE_FREEZE | — | C | B | — |
| BASELINE-G1-V0.1 | 第一关立项竞标阶段编标输入工作基线 | 机械核对通过、12 项澄清已裁决、Blocking=0、A/B/C 决策确认 | FROZEN_FOR_BID_DRAFTING | 2026-09-10 13:09 +08:00 | A | B、C（用户确认讨论结果） | `3ad0e3723def9f45899b68fe89f99628f4b3ffd3` |
| BASELINE-V0.9 | 第一关交付候选基线 | G1-09 至 G1-11 问题闭环 | PLANNED | — | A | C | — |
| BASELINE-V1.0 | 第一关最终冻结基线 | G1-14 C 最终符合性复核 ACCEPTED | FROZEN | 2026-09-12 20:42 +08:00 | A | C | 527acee（内容）；f8be033（C 最终复核） |
| BASELINE-V1.1 | 第一关收口呈现修订基线 | G1-15 格式审计、实名化、README 与日报体系完成；不改变需求事实、数字、范围、责任或验收 | PENDING_COMMIT | 2026-09-13 | A | C（待复核） | 待回填 |
| BASELINE-V1.2 | 第一关最终返工呈现基线 | 21 份日报重建；7 份 DOCX 逐项模板、版本、插图与渲染审计 7/7 PASS；不改变业务事实 | PENDING_COMMIT | 2026-09-13 | A | C（待复核） | 待回填 |
| BASELINE-G2-M2-R1.0 | 第二关M2返工复审重新冻结候选 | G2-R05 DONE；五类教师问题均有整改证据；39 FR/34★/117 AC/10 RCLR无漂移；开放接口边界显式保留 | REFREEZE_CANDIDATE / PENDING_B_C_REVIEW | 2026-09-16 | A | B、C（待独立复核） | 待回填 |

## BASELINE-G1-V0.1 冻结记录

- 创建日期：2026-09-10
- 目的：统一 G1-03～G1-08、述标与第一关检查使用的编标输入事实、范围、澄清口径、关键数字与甲乙责任。
- 冻结状态：`FROZEN_FOR_BID_DRAFTING`。
- 权威输入：当前 G1-02 用户确认 Prompt、原始用户需求书、facts、key_numbers、compliance_matrix、issues、12 项模拟甲方澄清、A 项目定位与对账记录、B 技术复核和技术边界工作稿。
- 主要决策：冻结项目定位、六项建设原则、11 个功能域、Web+H5 交付范围、原需求和新增范围外边界、20 项关键数字摘要、外部依赖责任矩阵、需求级技术约束及变更机制。
- 澄清纳入：ISSUE-G1-01-001～012 的裁决已全部进入 Baseline，Issue 历史保留并解除 Blocking。
- 下游约束：G1-03、G1-04 及后续第一关编标任务必须先读取并遵守 `control/baselines/BASELINE-G1-V0.1.md`。
- 变更规则：改变范围、★解释、关键数字、责任、移动形态、外部依赖、正式里程碑或澄清口径时必须发布新版本，不得静默改写 V0.1。
- 冻结证据：`logs/meetings/2026-09-10_BASELINE-G1-V0.1.md`、`logs/reviews/2026-09-10_G1-02-baseline-freeze-self-check.md`、`logs/prompts/2026-09-10-A.md`。
- Commit：`3ad0e3723def9f45899b68fe89f99628f4b3ffd3`；日志隔离治理提交：`9ba85daf92bb596d80fca039cee0e96210074446`。

## 变更记录模板

- 变更编号：CHG-xxx
- 影响基线：
- 变更内容：
- 变更原因与来源：
- 影响分析：
- 主责：
- 复核/批准：
- 新版本：
- Commit / PR：

| BASELINE-V1.0 | 第一关最终交付归档冻结 | G1-01—G1-13 已完成并复核；G1-14 A 自检通过 | 不改变 P1 事实、范围、★、数字或责任；归档清单记录 SHA-256 | A | C 最终符合性复核待执行 | FROZEN_PENDING_C_FINAL_REVIEW | G1-14 内容提交待回填 |
- BASELINE-V1.0 内容提交与推送证据：527aceea5162cd4bf4a47e34a985c8c4f581cdd4，2026-09-12 20:26 +08:00；当前状态保持 FROZEN_PENDING_C_FINAL_REVIEW。
- BASELINE-V1.0 C 最终符合性复核：2026-09-12 20:42 +08:00；结论 ACCEPTED，复核记录 logs/reviews/2026-09-12_G1-14-C-final-compliance-review.md；基线状态更新为 FROZEN，G1-14 更新为 DONE。
- BASELINE-V1.2 为用户对 G1-15 首轮结果不合格后的完整返工版本；版本事件、插图与格式差异依据 `logs/reviews/final_format_alignment_audit.md`。主提交 `c54fecc593a3201389619f40ae5fbe9ccb706e2d` 已非强制推送至 `origin/master`；状态为 PUSHED_PENDING_C_REVIEW。

## CHG-G2-R06-001｜M2返工复审重新冻结候选

- 影响基线：第二关原M2需求与规格评审结论；新建`BASELINE-G2-M2-R1.0`候选，不覆盖G1冻结基线。
- 变更内容：以最新SRS、spec、RTM、G2-RCLR-001—010、R04图表QA和R05一致性PASS重建M2评审包；把五类教师问题的整改与证据纳入候选冻结。
- 变更原因与来源：G2-R01教师核验反馈专项返工及用户授权的G2-R06任务。
- 影响分析：不改变39 FR、34★、117 AC、关键数字、责任或验收强度；补充评审、Issue状态和冻结边界。`ISSUE-G3-01-001`保持OPEN，真实接口/现场证据不进入通过结论。
- 主责：A。
- 复核/批准：B、C独立复核待执行；在两者PASS前不生效为正式FROZEN。
- 新版本：`BASELINE-G2-M2-R1.0`（REFREEZE_CANDIDATE）。
- Commit / PR：`9fc07e0a2c013ce5733f59c3ed527cb5e8568fe4`（A侧REVIEW候选；已推送）。
