# 第一关任务看板

状态只允许：`TODO`、`DOING`、`REVIEW`、`DONE`、`BLOCKED`。

当前进展：第一关 G1-00 至 G1-14 已完成并冻结为 BASELINE-V1.0。第二关继续应急管理项目；G2-00 已完成范围裁决并等待 B 复核 MVP 继承与技术边界。

| Task ID | 任务 | 主责 | 复核 | 前置任务 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GOV-001 | AI 留痕与 Git 工作流修订 | C | B | G1-00 | 当前 Prompt、现有治理规范、Git 状态 | 原文日志状态机、安全同步与 push 规范 | DONE |
| GOV-002 | 正式可交付文档生成/修改 Skill 与入口注册 | A | C | GOV-001 | 当前 Prompt、Reference OOXML/样式、现有文档与 Git 治理 | `docs/deliverables/SKILL.md`、`AGENTS.md` 强制触发规则 | REVIEW |
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
| G1-14 | 最终冻结与归档 | A | C | G1-13 | 全部通过复核的产物与日志 | BASELINE-V1.0、归档清单、冻结记录 | DONE |
| G1-15 | 第一关最终返工：日报重建与正式文档逐项模板复刻 | A | C | G1-14 | 冻结交付物、参考样例、Prompt/Review/Git、治理规则 | BASELINE-V1.2、21 份日报、7 份 PASS 文档、8 份 PPTX 图源、最终审计 | DONE |
| G1-16-FMT-040506 | 04/05/06 正式文档 FORMAT ONLY 复检 | A | C | G1-15 | 已冻结正式稿、对应 Reference、正式交付文档 Skill | 格式复检审计、内容冻结与渲染证据 | REVIEW |
| G1-17-FMT-VISUAL-040506 | 正式文档 Skill 加固与 04/05/06 纯视觉格式修复 | A | C | G1-16 | 唯一 Reference、冻结正式稿、formal deliverable Skill | 加固 Skill、三份 DOCX、逐 Pair 审计与渲染证据 | REVIEW |

## 第二关任务看板

| Task ID | 任务 | 主责 | 复核 | 前置任务 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G2-00 | 输入归档与范围决策 | C | B | 无 | 第二关三份输入资料、BASELINE-V1.0、用户范围裁决 | 输入索引、范围决策记录、基线启动条件 | DONE |
| G2-01 | 用户访谈与 MoSCoW | C（用户授权） | B | G2-00 | 确认的项目范围、MVP 输入 | 访谈记录、用户故事与 MoSCoW | DONE |
| G2-02 | 需求解析与编号基线 | C | B | G2-00 | 确认的项目输入、访谈结论 | facts、术语、编号目录、关键数字 | DONE |
| G2-03 | SRS v0.1 | A | C | G2-01、G2-02 | 用户故事、需求基线 | SRS 工作稿 | DONE |
| G2-04 | spec.md v0.1 | B | A | G2-02 | 需求编号、验收约束 | spec.md | DONE |
| G2-05 | AI 反向澄清与裁决 | C | B | G2-03、G2-04 | SRS、spec.md | 澄清记录（不少于 10 条） | DONE |
| G2-06 | RTM v1 | C | B | G2-03、G2-04 | 需求编号、验收标准 | 需求追踪矩阵 RTM v1 | DONE |
| G2-07 | 双镜像一致性与 M2 评审 | A | B、C | G2-05、G2-06 | 全部 G2 候选产物 | 一致性报告、M2 评审包 | DONE |
| G2-P01 | 最小可验证原型规划与边界冻结 | A | B、C | G2-07 | SRS、spec、RTM、需求确认书、G2 评审记录 | `prototype/README.md`：原型边界、闭环、Mock、完成定义与开发顺序 | DONE |
| G2-P02 | 原型基础框架与页面骨架 | B | A | G2-P01 | 原型规划、SRS、spec | Vue/Vite 基础框架、Router、Web 菜单、H5 布局与 Mock 基础设施 | DONE |
| G2-P03 | MVP 核心流程原型 | B | A、C | G2-P02 | 原型页面骨架、Mock 规则、MVP FR | 事件处置、态势 Mock、H5 反馈及演练/打卡/盘点最小闭环 | TODO |
| G2-P04 | 原型走查与收口 | A | B、C | G2-P03 | 原型、SRS、spec、RTM | 核心流程走查、需求映射、少量截图、README 更新和第三关设计输入 | TODO |
