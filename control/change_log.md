# 基线与变更记录

基线冻结后不覆盖旧版本。新增版本必须记录范围、依据、主责、复核与关联 commit；需要改变真实项目事实时，必须有有效的用户/甲方书面依据。

| 基线 | 目标 | 准出条件 | 状态 | 冻结时间 | 主责 | 复核 | Commit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BASELINE-V0.1 | 初始需求/招标事实基线（旧计划标识） | G1-01 完成且 B 复核 | SUPERSEDED_BEFORE_FREEZE | — | C | B | — |
| BASELINE-G1-V0.1 | 第一关立项竞标阶段编标输入工作基线 | 机械核对通过、12 项澄清已裁决、Blocking=0、A/B/C 决策确认 | FROZEN_FOR_BID_DRAFTING | 2026-09-10 13:09 +08:00 | A | B、C（用户确认讨论结果） | `3ad0e3723def9f45899b68fe89f99628f4b3ffd3` |
| BASELINE-V0.9 | 第一关交付候选基线 | G1-09 至 G1-11 问题闭环 | PLANNED | — | A | C | — |
| BASELINE-V1.0 | 第一关最终冻结基线 | G1-12 完成、最终三项检查通过 | PLANNED | — | A | C | — |

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