# 项目任务看板

状态只允许：`TODO`、`DOING`、`REVIEW`、`DONE`、`BLOCKED`。

当前进展：第一关已冻结，第二关需求与规格已通过 M2，G2-P01—G2-P05 原型规划、实现与走查已完成。第三关“设计与计划”现由 G3-00 启动对账、资料整理与治理切换；其余 G3 正式设计和工程计划任务尚未启动。

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
| G2-P03 | MVP 核心流程原型 | B | A、C | G2-P02 | 原型页面骨架、Mock 规则、MVP FR | 事件处置、态势 Mock、H5 反馈及演练/打卡/盘点最小闭环 | DONE |
| G2-P04 | 原型走查与收口 | A | B、C | G2-P03 | 原型、SRS、spec、RTM | 核心流程走查、需求映射、少量截图、README 更新和第三关设计输入 | DONE |
| G2-P05 | 原型可用性与演示收口 | A | B、C | G2-P04 | 现有 Prototype、SRS、spec、RTM、G2-P04 走查结论 | 完成可用性整改的 Prototype、一键服务器管理脚本、展示说明及截图、最终走查记录 | DONE |
| G2-R01 | 教师核验问题登记与返工启动 | A | B、C | G2-07、G2-P05 | 教师反馈、G2 受控输入、正式文档 Skill | Issue、返工边界、Skill 图表题注门禁 | DONE |
| G2-R02 | AI 反向澄清重构 | C | B、A | G2-R01 | SRS、spec、用户故事、RTM、原型走查、G1 继承裁决 | 上游继承索引 + 至少 10 条真正 G2 澄清及裁决/待裁决记录 | DONE |
| G2-R03 | SRS 实施级深化 | A | C、B | G2-R01、G2-R02 | 受控 FR/AC/PE、澄清记录、SRS | 业务流程、状态模型、字段级数据字典、显式 NFR 的 SRS 与正式件 | DONE |
| G2-R04 | G2 正式交付物图表题注与格式整改 | A | C | G2-R01、G2-R03 | 工作稿、唯一 Reference、正式交付 Skill | G2 正式件图表题注/编号 QA、渲染证据 | DONE |
| G2-R05 | SRS/spec/RTM/澄清一致性复验 | A | B、C | G2-R02—G2-R04 | 全部返工候选稿与控制文件 | 39 FR/34 ★/AC/追踪/图表 QA 一致性报告 | DONE |
| G2-R06 | M2 返工复审与重新冻结 | A | B、C | G2-R05 | 一致性报告、Issue、正式候选件 | 更新 M2 评审包、复审结论与冻结/阻塞记录 | DONE |
| G3-01R | 修订后 G2 输入重新挂接与 G3-01 复验 | B | A、C | G2-R06 | 新 SRS、spec、RTM、澄清、数据与 NFR 输入 | 对 `G3-01_design_input_baseline.md` 的增量修订与复验 | DONE |

## 第三关任务看板

| Task ID | 任务 | 主责 | 复核 | 前置任务 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G3-00 | 第三关启动对账、资料整理与治理切换 | A | B、C | G2-07、G2-P05 | G2 M2 评审、SRS、spec、RTM、G2-P04/P05 走查、第三关任务书 | G3 启动/输入规划记录、资料索引、阶段说明与任务框架 | DONE |
| G3-01 | 设计输入基线、模块边界与架构决策候选 | B | A、C | G3-00 | 受控 SRS、spec、RTM、G2 M2 结果、责任边界 | 历史基线已由 G3-01R 复验准出 | DONE / SUPERSEDED_BY_G3-01R |
| G3-02 | 工程计划、WBS、分工与 constitution 规划 | A | B、C | G3-00、G3-01R | G3-01R 设计输入基线、架构候选、任务书 | `plan.md`/WBS/任务原子化规划、分工与 constitution 规划稿 | DONE |
| G3-03 | 概要设计 | A | C | G3-01、G3-02 | 设计输入基线、模块边界、ADR 候选 | 概要设计说明书（技术、数据、部署架构） | DONE |
| G3-04 | 数据库设计 | B | A、C | G3-01、G3-03 | SRS、概要设计、数据边界 | 数据库设计说明书（概念、逻辑、物理设计） | DONE |
| G3-05 | 详细设计 | B | A、C | G3-03、G3-04 | SRS、概要设计、数据库设计 | 详细设计说明书（模块职责、类设计、关键流程） | DONE |
| G3-06 | 接口设计与 OpenAPI | B | A、C | G3-03、G3-05 | 模块边界、外部责任边界、数据设计 | 接口设计说明书、OpenAPI 契约与版本策略 | DONE（B 完成 V0.2 整改；A 整改后复核 PASS；C 符合性复核 PASS，独立审计 0 问题、独立 Word 渲染 23 页与 B 一致且竖向碎片 0，并由 C 验证关闭 `ISSUE-G3-06-001`；C 登记 3 项不阻断观察项（A 记录列宽引用值更正、标识符连字符断行、§8.3 端口口径）。`ISSUE-G3-01-001` 仍阻断视频/消息真实外部契约冻结与 M3 最终冻结；冻结前若再次修改 14/15 号交付物须重新触发 A/C 复核） |
| G3-07 | ADR 与非功能设计 | B | A、C | G3-01、G3-03 | 架构候选、spec 非功能 AC、GB/T 25000.10 | 至少 2 份 ADR、非功能设计与工程规则 | DONE（2026-09-18 用户最终准出授权；`ISSUE-G3-07-001/002` 均 CLOSED；A/C Review PASS；ADR-001/002 已 Accepted，PE-01—12、ENG-001—020、39 FR/117 AC/34★、责任边界与未验证事项经最终机械自检无漂移。`ISSUE-G3-01-001` 对真实视频/消息外部证据与 M3 的既有阻断不变） |
| G3-08 | RTM 设计挂接 | C | A、B | G3-03—G3-07 | SRS、spec、设计文档集、OpenAPI、ADR | 更新后的 RTM（需求 → AC → 设计双向追踪） | REVIEW（39 FR/34★/117 AC 与 DLD/DBD/API-TR 39/39 已挂接；2026-09-18 完成 A、B 用户授权合并复核（`logs/reviews/2026-09-18_G3-08-AB-review.md`）：ISSUE-G3-08-001—004 已由 C 整改并机械复验 `pass=true`；ISSUE-G3-08-005（统一 DoD 正式件镜像与渲染 QA）与 007（`ISSUE-G3-01-001` 登记册状态待人工裁决）阻断 DONE；006 待 C 受控修订；G3-07 已 DONE，其引用确认项关闭） |
| G3-09 | 测试计划 | C | A、B | G3-03—G3-08 | spec AC、RTM、设计文档集、GB/T 15532 | 《测试计划》与测试左移准入/准出依据 | TODO |
| G3-10 | M3 一致性检查与工程基线冻结 | A | B、C | G3-02—G3-09 | 全部 G3 候选成果、控制文件、评审与过程证据 | M3 评审、一致性检查、工程基线冻结记录 | TODO |
| G3-11 | 项目管理计划 | A | C | G3-02 | plan/WBS、里程碑、资源与依赖 | 项目管理计划正式件；范围/资源/里程碑/偏差处置完整，抽查 AC-G2-FR-015-03 | TODO |
| G3-12 | 质量管理计划 | C | B | G3-02 | AC、PE、评审与测试门禁 | 质量管理计划正式件；评审/缺陷/度量/门禁及 PE-01—PE-12 证据口径完整 | TODO |
| G3-13 | 配置管理计划 | A | C | G3-02 | 基线、版本与变更纪律 | 配置管理计划正式件；配置项/版本/基线/CR/审计/回滚完整，抽查 AC-G2-FR-013-01 | TODO |
| G3-14 | 风险管理计划 | A | B | G3-02 | 开放Issue、外部依赖、NFR风险 | 风险管理计划正式件；风险四要素/触发器/应对/复核周期完整，抽查 AC-G2-FR-006-01 | TODO |

统一 DoD（G3-03—G3-14）：工作稿完成 → 正式件生成 → 编号/图表/引用检查 → 渲染 QA → Review。该 DoD 不改变既有范围、依赖、FR/AC、人工裁决或状态门禁。

### G3-02 原子任务登记（计划基线；每项 ≤0.5 人日）

本表细化既有 G3-02—G3-14，未重复建立正式任务。AC/锚点均回指 `docs/work/B_TECH/spec.md`；实际执行前不得将计划中的验证预填为 PASS。

| ID | 前置 | 责任人 | 输出 | 具体 AC/锚点 | 可执行验证标准 |
|---|---|---|---|---|---|
| WBS-01 | G3-01R | A | 清单/责任矩阵 | AC-G2-FR-013-01 | 计数≥12，逐件唯一主责/复核 |
| WBS-02 | WBS-01 | A | 原子任务/依赖 | AC-G2-FR-014-01 | 每行有前置/人/输出/AC/验证；依赖无环 |
| WBS-03 | WBS-02 | A | 宪章初稿 | AC-G2-FR-013-03 | 核对 AI、范围、代码、文档、测试、接口、变更规则 |
| WBS-04 | WBS-02 | A | 评审/冻结门禁 | AC-G2-FR-014-01 | D0—D3/M3 均有输入、检查、复核、准出 |
| WBS-05 | WBS-02 | A | 项目管理计划包 | AC-G2-FR-015-03 | 范围、资源、里程碑、偏差处置章节检查 |
| WBS-06 | WBS-02 | C | 质量管理计划包 | AC-G2-FR-013-03、PE-01—PE-12 | 评审、缺陷、度量、门禁和 PE 口径检查 |
| WBS-07 | WBS-02 | A | 配置管理计划包 | AC-G2-FR-013-01 | 配置项、基线、CR、审计、回滚检查 |
| WBS-08 | WBS-02 | A | 风险管理计划包 | AC-G2-FR-006-01 | 风险四要素、触发器、应对、复核周期检查 |
| WBS-09 | WBS-04 | B | HLD 模块映射 | AC-G2-FR-003-01、014-01 | MOD-PLAN—MOD-PLATFORM 覆盖且有依赖 |
| WBS-10 | WBS-09 | B | HLD 数据/部署视图 | AC-G2-FR-014-01、PE-01、PE-04 | 外部边界/故障域齐全，待确认项未冻结 |
| WBS-11 | WBS-09 | B | DBD 概念模型 | AC-G2-FR-009-01、G2-RCLR-006 | 盘点快照/事件/任务/审计有模块与 AC 回指 |
| WBS-12 | WBS-11 | B | DBD 逻辑物理设计 | AC-G2-FR-013-01、G2-RCLR-004 | 标识、时间、索引、保存策略有依据 |
| WBS-13 | WBS-09 | B | ADR-001 | AC-G2-FR-020-02、PE-04、PE-10 | 候选≥2、否决理由/证据/后果完整；无证据 Proposed |
| WBS-14 | WBS-09 | B | ADR-002/NFR 映射 | AC-G2-FR-020-02、PE-01—12 | NFR 有质量特性、AC/KN、测量方法，非实测 |
| WBS-15 | WBS-12 | B | DLD 状态机 | AC-G2-FR-015-01、G2-RCLR-003 | 重指派、授权、审计、异常转移可走查 |
| WBS-16 | WBS-15 | B | DLD 补偿流程 | AC-G2-FR-020-02、G2-RCLR-008 | 超时/回执/降级有可复现路径 |
| WBS-17 | WBS-15 | B | 内部 API 清单 | AC-G2-FR-013-01、025-02 | 写接口有鉴权、幂等、错误、traceId；无跨域直写 |
| WBS-18 | WBS-17 | B | 外部端口语义 | AC-G2-FR-006-01、027-01、029-03 | 8 EXT 均有失败/降级；未知字段待确认 |
| WBS-19 | WBS-18 | B | OpenAPI 草稿 | AC-G2-FR-020-03 | OpenAPI 校验器零 schema error；端点含版本/错误/追踪/AC |
| WBS-20 | WBS-19 | B | 接口冻结阻断记录 | AC-G2-FR-006-01、ISSUE-G3-01-001 | Issue OPEN 时验证未冻结外部接口 |
| WBS-21 | WBS-10—WBS-20 | C | RTM 设计映射 | AC-G2-FR-001-01—039-03 | 统计 39 FR/34★/117 AC 有设计 ID，反向抽查 |
| WBS-22 | WBS-21 | C | KN-064 映射 | AC-G2-FR-006-01、027-01 | 同 traceId/eventId 的四系统三类场景齐全 |
| WBS-23 | WBS-21 | C | 测试范围/级别 | AC-G2-FR-013-03、PE-01—12 | GB/T 15532 章节齐全性检查 |
| WBS-24 | WBS-23 | C | 测试门禁/P0 场景 | AC-G2-FR-020-03、029-03 | 正常/无权/超时失败均有预期、证据、判定 |
| WBS-25 | WBS-05—08、21—24 | A | M3 检查包 | AC-G2-FR-001-01—039-03 | 清单、RTM、评审、Issue 一致；阻断未关不冻结 |
| WBS-26 | M3+用户启动 | B | G4 实施包 | AC-G2-FR-015-02 | PR 关联设计 ID/AC，单元测试可重复运行 |
| WBS-27 | WBS-26 | B、C | G4 契约/集成测试包 | AC-G2-FR-027-02、029-03 | OpenAPI 契约及失败降级测试留证 |
| WBS-28 | WBS-27 | C、A | G5/G6 质量交付包 | AC-G2-FR-015-02、PE-01—PE-12 | 质量、缺陷、干净环境、审计分别留证 |

#### B/C 复核整改：独立外部端口与 KN-064 包（均 ≤0.5 人日）

| ID | 前置 | 责任人 | 输出 | 对应模块 | 具体 AC | 可执行验证标准 |
|---|---|---|---|---|---|---|
| WBS-18A | WBS-17 | B | EXT-PUBLISH 接口设计包 | MOD-INTEGRATION | AC-G2-FR-015-02 | 授权内容、受理/发布回执、超时和人工降级独立走查 |
| WBS-18B | WBS-17 | B | EXT-INTRUSION 接口设计包 | MOD-INTEGRATION | AC-G2-FR-027-01、AC-G2-FR-027-03 | 有效/不可识别告警分别验证事件关联与审计异常 |
| WBS-18C | WBS-17 | B | EXT-FIRE 接口设计包 | MOD-INTEGRATION | AC-G2-FR-027-01、AC-G2-FR-027-03 | 火警/设备状态关联、失败记录、人工处置独立走查；不控制需求外设备 |
| WBS-22R | WBS-21、WBS-18A—WBS-18C | C | KN-064 四系统联合验收设计包 | MOD-INTEGRATION、MOD-PLATFORM | AC-G2-FR-006-01、AC-G2-FR-027-01 | 同一 traceId/eventId 覆盖视频、发布、IoT、中台的正常/无权/超时失败 |

18A—18C 后置为 WBS-19；22R 后置为 WBS-23。不得以原 WBS-18/WBS-22 聚合描述替代。

#### B/C 整改：逐项模块映射

| 原子包 | 对应模块 |
|---|---|
| WBS-01 | MOD-PLATFORM、MOD-EVENT |
| WBS-02 | MOD-PLATFORM |
| WBS-03 | MOD-PLATFORM |
| WBS-04 | MOD-PLATFORM |
| WBS-05 | MOD-PLATFORM、MOD-EVENT |
| WBS-06 | MOD-PLATFORM |
| WBS-07 | MOD-PLATFORM |
| WBS-08 | MOD-INTEGRATION |
| WBS-09 | MOD-PLAN、MOD-EVENT、MOD-PLATFORM |
| WBS-10 | MOD-PLAN、MOD-EVENT、MOD-PLATFORM |
| WBS-11 | MOD-RESOURCE、MOD-EVENT、MOD-PLATFORM |
| WBS-12 | MOD-RESOURCE、MOD-EVENT、MOD-PLATFORM |
| WBS-13 | MOD-PLATFORM、MOD-TASK |
| WBS-14 | MOD-PLATFORM、MOD-TASK |
| WBS-15 | MOD-TASK、MOD-EVENT |
| WBS-16 | MOD-TASK、MOD-EVENT |
| WBS-17 | MOD-PLATFORM |
| WBS-18 | MOD-INTEGRATION |
| WBS-18A | MOD-INTEGRATION（EXT-PUBLISH） |
| WBS-18B | MOD-INTEGRATION（EXT-INTRUSION） |
| WBS-18C | MOD-INTEGRATION（EXT-FIRE） |
| WBS-19 | MOD-PLATFORM、MOD-INTEGRATION |
| WBS-20 | MOD-INTEGRATION |
| WBS-21 | MOD-PLATFORM、MOD-INTEGRATION |
| WBS-22 | MOD-PLATFORM、MOD-INTEGRATION |
| WBS-22R | MOD-PLATFORM、MOD-INTEGRATION |
| WBS-23 | MOD-PLATFORM |
| WBS-24 | MOD-PLATFORM、MOD-INTEGRATION |
| WBS-25 | MOD-PLATFORM |
| WBS-26 | MOD-PLATFORM、MOD-TASK |
| WBS-27 | MOD-PLATFORM、MOD-INTEGRATION |
| WBS-28 | MOD-PLATFORM、MOD-TASK |
