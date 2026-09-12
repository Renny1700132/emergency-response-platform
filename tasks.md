# 第一关任务看板

状态只允许：`TODO`、`DOING`、`REVIEW`、`DONE`、`BLOCKED`。

当前进展：G1-01、G1-01-A、G1-01-A-BR、G1-02、G1-03、G1-04、G1-05、G1-06、G1-07、G1-09 与 G1-10 已完成。G1-10 经 B 技术确认识别 0 项 BLOCKING、2 项 MAJOR、1 项 MINOR；三项开放 Issue 不阻断检查任务完成，转入 G1-08 统一修订。G1-08 保持 REVIEW，其余后续任务保持既定状态。

| Task ID | 任务 | 主责 | 复核 | 前置任务 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GOV-001 | AI 留痕与 Git 工作流修订 | C | B | G1-00 | 当前 Prompt、现有治理规范、Git 状态 | 原文日志状态机、安全同步与 push 规范 | DONE |
| G1-01-A | 项目价值与范围分析 | A | C（技术边界由 B 提供意见） | G1-00 | 真实用户需求书；临时 fallback | `docs/work/A_PM/project_positioning.md` | DONE |
| G1-01-A-BR | 项目价值与范围 Baseline Reconciliation | A | C（技术边界由 B 提供意见） | G1-01-A、甲方模拟书面澄清 | C 当前控制文件、原始用户需求书、甲方澄清 | 修订后的 `project_positioning.md`、reconciliation 记录 | DONE |
| G1-00 | Workspace 初始化 | C | B | 无 | 当前 Prompt、允许资料、现有仓库 | Workspace 目录、治理规则、初始化日志、Git 证据 | DONE |
| G1-01 | 需求与招标事实解析 | C | B | G1-00 | 用户需求书、任务书 | facts、key_numbers、条款清单、来源定位 | DONE |
| G1-02 | 第一关编标输入基线 BASELINE-G1-V0.1 | A | B、C（A/B/C 三人确认冻结） | G1-01、G1-01-A-BR | 用户确认决策、用户需求书、控制文件、12 项澄清、A/B 工作稿与复核意见 | `control/baselines/BASELINE-G1-V0.1.md`、会议记录、变更记录 | DONE |
| G1-03 | 项目建议书 | A | C | G1-02 | 需求基线、任务书、建议书案例结构 | `docs/work/A_PM/project_proposal.md` | DONE |
| G1-04 | 技术方案 | B | A | G1-02 | 需求基线、接口与非功能条款 | `docs/work/technical_solution_v0.6.md`、G1-04 完成审查记录 | DONE |
| G1-05 | 合规矩阵与澄清 | C | B | G1-02、G1-04 | 条款清单、技术方案 | 合规矩阵、★检查、澄清与质询记录 | DONE |
| G1-06 | 项目计划 v1 | A | C | G1-03、G1-04 | 提交物、里程碑、三人资源约束 | WBS、甘特图、项目计划 v1 | DONE |
| G1-07 | 风险登记册 v1 | A | C | G1-04、G1-06 | 技术风险、计划与接口依赖 | 风险登记册 v1 | DONE |
| G1-08 | 技术投标书整合 | A | C、B | G1-03、G1-04、G1-05、G1-06、G1-07 | 全部第一关工作稿 | 技术投标书整合稿 | DONE |
| G1-09 | 合规检查 | C | B | G1-08 | 投标书、合规矩阵、facts、key_numbers | 符合性检查记录与 Issue | DONE |
| G1-10 | 技术检查 | A | B（技术确认/复核） | G1-08 | 技术方案、需求条款、验证安排 | 技术检查记录与 Issue | DONE |
| G1-11 | 跨文档一致性检查 | A | C | G1-09、G1-10 | 全部正式候选产物、控制文件 | 一致性检查记录与修订清单 | DONE |
| G1-12 | 述标与模拟质询 | A | B（技术口径）、C（合规/数字） | G1-11 | 冻结候选稿、澄清记录、风险与证据 | 述标稿、问答清单、模拟质询记录 | DONE |
| G1-13 | 需求确认书 | A | B（技术与范围）、C（FR/★/PE、数字与边界） | G1-12 | 冻结候选稿、述标与模拟质询结论、澄清记录 | 需求确认书候选稿与确认项清单 | DONE |
| G1-14 | 最终冻结与归档 | A | C | G1-13 | 全部通过复核的产物与日志 | BASELINE-V1.0、归档清单、冻结记录 | REVIEW |
