# 第一关任务看板

状态只允许：`TODO`、`DOING`、`REVIEW`、`DONE`、`BLOCKED`。

业务恢复范围：用户已明确授权 `G1-01-A`、G1-01 的 C 侧澄清归档，并于 2026-09-09 授权 B 继续 G1-04。2026-09-10，C 已将 12 项课程模拟书面裁决映射为需求侧 `RESOLVED`，G1-01 进入 `REVIEW`；这不代表技术验证完成或 B 已复核通过。G1-02 未启动，G1-04 保持工作稿；其余业务任务在用户或其主责成员明确恢复前保持暂停。

| Task ID | 任务 | 主责 | 复核 | 前置任务 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GOV-001 | AI 留痕与 Git 工作流修订 | C | B | G1-00 | 当前 Prompt、现有治理规范、Git 状态 | 原文日志状态机、安全同步与 push 规范 | DONE |
| META-C-NEXT-PROMPT | C 解除 G1-01 阻断的下一步提示词 | C 提示词生成者 | 用户 | 甲方模拟书面澄清已进入仓库 | 最新控制文件、12 项模拟裁决、A 对账记录 | 聊天中的下一步 Prompt | BLOCKED |
| META-C-CLARIFY-PROMPT | C 澄清与基线冻结提示词文本 | C 提示词生成者 | 用户 | G1-01 技术复核意见 | 本次 Prompt、三项阻断 Issue、B 技术意见 | 聊天中的两段可执行 Prompt | BLOCKED |
| META-C-PROMPT-2026-09-09 | 成员 C 第一关提示词包 | C 提示词生成者 | 用户 | G1-00 | 用户分享链接、仓库分工与治理规则 | `prompts/C_FIRST_GATE_PROMPT_PACK_v1.md` | BLOCKED |
| G1-01-A | 项目价值与范围分析 | A | C（技术边界由 B 提供意见） | G1-00 | 真实用户需求书；临时 fallback | `docs/work/A_PM/project_positioning.md` | REVIEW |
| G1-01-A-BR | 项目价值与范围 Baseline Reconciliation | A | C（技术边界由 B 提供意见） | G1-01-A、甲方模拟书面澄清 | C 当前控制文件、原始用户需求书、甲方澄清 | 修订后的 `project_positioning.md`、reconciliation 记录 | REVIEW |
| G1-00 | Workspace 初始化 | C | B | 无 | 当前 Prompt、允许资料、现有仓库 | Workspace 目录、治理规则、初始化日志、Git 证据 | DONE |
| G1-01 | 需求与招标事实解析 | C | B | G1-00 | 用户需求书、任务书 | facts、key_numbers、条款清单、来源定位 | REVIEW |
| G1-02 | Baseline V0.1 | C | B | G1-01 | facts、key_numbers、条款清单 | BASELINE-V0.1、变更记录 | BLOCKED |
| G1-03 | 项目建议书 | A | C | G1-02 | 需求基线、任务书、建议书案例结构 | 项目建议书工作稿 | TODO |
| G1-04 | 技术方案 | B | A | G1-02 | 需求基线、接口与非功能条款 | 架构、功能、数据接口、非功能与验证方案 | DOING |
| G1-05 | 合规矩阵与澄清 | C | B | G1-02、G1-04 | 条款清单、技术方案 | 合规矩阵、★检查、澄清与质询记录 | TODO |
| G1-06 | 项目计划 v1 | A | C | G1-03、G1-04 | 提交物、里程碑、三人资源约束 | WBS、甘特图、项目计划 v1 | TODO |
| G1-07 | 风险登记册 v1 | A | C | G1-04、G1-06 | 技术风险、计划与接口依赖 | 风险登记册 v1 | TODO |
| G1-08 | 技术投标书整合 | A | C | G1-03、G1-04、G1-05、G1-06、G1-07 | 全部第一关工作稿 | 技术投标书整合稿 | TODO |
| G1-09 | 合规检查 | C | B | G1-08 | 投标书、合规矩阵、facts、key_numbers | 符合性检查记录与 Issue | TODO |
| G1-10 | 技术检查 | B | A | G1-08 | 技术方案、需求条款、验证安排 | 技术检查记录与 Issue | TODO |
| G1-11 | 跨文档一致性检查 | A | C | G1-09、G1-10 | 全部正式候选产物、控制文件 | 一致性检查记录与修订清单 | TODO |
| G1-12 | 述标与模拟质询 | A | C | G1-11 | 冻结候选稿、澄清记录、风险与证据 | 述标稿、问答清单、模拟质询记录 | TODO |
| G1-13 | 最终冻结与归档 | A | C | G1-12 | 全部通过复核的产物与日志 | BASELINE-V1.0、归档清单、冻结记录 | TODO |
