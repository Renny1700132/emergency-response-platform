# 项目任务看板

状态只允许：`TODO`、`DOING`、`REVIEW`、`DONE`、`BLOCKED`。

当前进展：第一关已冻结，第二关需求与规格已通过 M2，第三关“设计与计划”已通过 M3 并冻结为 `BASELINE-G3-M3-R1.0`；用户已于 2026-09-21 明确启动第四关“研发冲刺”，当前按冻结基线执行。

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
| G3-01 | 设计输入基线、模块边界与架构决策候选 | B | A、C | G3-00 | 受控 SRS、spec、RTM、G2 M2 结果、责任边界 | 历史基线已由 G3-01R 复验准出 | DONE |
| G3-02 | 工程计划、WBS、分工与 constitution 规划 | A | B、C | G3-00、G3-01R | G3-01R 设计输入基线、架构候选、任务书 | `plan.md`/WBS/任务原子化规划、分工与 constitution 规划稿 | DONE |
| G3-03 | 概要设计 | A | C | G3-01、G3-02 | 设计输入基线、模块边界、ADR 候选 | 概要设计说明书（技术、数据、部署架构） | DONE |
| G3-04 | 数据库设计 | B | A、C | G3-01、G3-03 | SRS、概要设计、数据边界 | 数据库设计说明书（概念、逻辑、物理设计） | DONE |
| G3-05 | 详细设计 | B | A、C | G3-03、G3-04 | SRS、概要设计、数据库设计 | 详细设计说明书（模块职责、类设计、关键流程） | DONE |
| G3-06 | 接口设计与 OpenAPI | B | A、C | G3-03、G3-05 | 模块边界、外部责任边界、数据设计 | 接口设计说明书、OpenAPI 契约与版本策略 | DONE |
| G3-07 | ADR 与非功能设计 | B | A、C | G3-01、G3-03 | 架构候选、spec 非功能 AC、GB/T 25000.10 | 至少 2 份 ADR、非功能设计与工程规则 | DONE |
| G3-08 | RTM 设计挂接 | C | A、B | G3-03—G3-07 | SRS、spec、设计文档集、OpenAPI、ADR | 更新后的 RTM（需求 → AC → 设计双向追踪） | DONE |
| G3-09 | 测试计划 | C | A（本轮按 OVR-025 单人复核） | G3-03—G3-08 | spec AC、RTM、设计文档集、GB/T 15532 | 《测试计划》与测试左移准入/准出依据 | DONE |
| G3-10 | M3 一致性检查与工程基线冻结 | A | B、C | G3-02—G3-14 | 全部 G3 候选成果、控制文件、评审与过程证据 | M3 评审、一致性检查、工程基线冻结记录 | DONE |
| G3-11 | 项目管理计划 | A | C | G3-02 | plan/WBS、里程碑、资源与依赖 | 项目管理计划正式件；范围/资源/里程碑/偏差处置完整，抽查 AC-G2-FR-015-03 | DONE |
| G3-12 | 质量管理计划 | C | B | G3-02 | AC、PE、评审与测试门禁 | 质量管理计划正式件；评审/缺陷/度量/门禁及 PE-01—PE-12 证据口径完整 | DONE |
| G3-13 | 配置管理计划 | A | C | G3-02 | 基线、版本与变更纪律 | 配置管理计划正式件；配置项/版本/基线/CR/审计/回滚完整，抽查 AC-G2-FR-013-01 | DONE |
| G3-14 | 风险管理计划 | A | B | G3-02 | 开放Issue、外部依赖、NFR风险 | 风险管理计划正式件；风险四要素/触发器/应对/复核周期完整，抽查 AC-G2-FR-006-01 | DONE |

统一 DoD（G3-03—G3-14）：工作稿完成 → 正式件生成 → 编号/图表/引用检查 → 渲染 QA → Review。该 DoD 不改变既有范围、依赖、FR/AC、人工裁决或状态门禁。

## 第四关任务看板

范围：优先完成 `G2-FR-001—029` MVP Must；`G2-FR-030—039` 保留为本期 backlog，不删除、不改需求。统一研发 DoD：任务/AC 明确 → Prompt 留痕 → 实现 + 测试 → 自查 → 指定队友 Review/Approve → CI 全绿 → PR 合并 → RTM/tasks 更新。自 `G4-01` 起均使用功能分支 + PR，禁止直接推送受保护主干；证据规则见 `governance/g4_development_workflow.md`。

| Task ID | Sprint | 任务 | 主责 | 唯一 Review 人 | 前置依赖 | 输出 | 可验证完成条件 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G4-00 | 启动 | 第四关启动与任务规划 | A | C | G3-10 DONE；`BASELINE-G3-M3-R1.0` FROZEN；用户明确启动 | G4 输入索引、阶段状态切换、研发治理、12 项看板、启动自检 | G4 任务书已归档/索引；课程课件按规则仅登记；README/AGENTS/tasks/governance 状态一致；两个 Sprint、PR 门禁、DoD、范围与原型边界均可检索；自检无阻断 | DONE |
| G4-01 | Sprint 1 | CI / 测试 / coverage / contract / security / selfcheck 工程护栏 | C | B | G4-00 | CI 配置、测试与覆盖率基线、OpenAPI 契约校验、安全扫描、自查模板、PR 模板 | 在功能分支 PR 上可重复运行；核心模块单测覆盖率门禁 `≥70%`；契约/安全/selfcheck 任一失败阻断合并；保留一次通过和一次阻断证据 | DOING |
| G4-02 | Sprint 1 | 正式后端、数据库及公共基础设施骨架 | B | A | G4-00；G4-01 门禁接口可用 | 正式后端工程、数据库迁移、配置/日志/鉴权/审计/健康检查公共骨架 | 干净环境可启动；迁移可前进/回滚；健康检查和最小鉴权测试通过；不使用 Prototype 存储；PR 关联设计 ID/AC 且 CI 全绿 | TODO |
| G4-03 | Sprint 1 | 正式 Vue 前端骨架与 API Client | A | C | G4-00；G4-01 门禁接口可用 | 正式 Vue Web/H5 骨架、路由/权限壳、类型化 API Client、错误与 traceId 处理 | Web/H5 可构建运行；API Client 由冻结契约生成或核对；Mock 仅限显式开发适配层；无 localStorage/prototypeStore 充当正式数据；PR 门禁通过 | TODO |
| G4-04 | Sprint 1 | 八外部端口、GIS/H5 的课程模拟服务与测试 Fixture | C | B | G4-00；G4-01；冻结 OpenAPI 与模拟确认 | 8 个独立外部端口、GIS/H5 模拟服务，正常/无权/超时/失败 Fixture 与使用说明 | EXT-VIDEO/PUBLISH/INTRUSION/ACCESS/FIRE/IOT/MIDDLE/MESSAGE 逐一可辨识；GIS/H5 边界明确；Fixture 可重复、无秘密；所有证据标记 SIMULATED；契约测试通过 | TODO |
| G4-05 | Sprint 1 | Sprint 1 核心事件处置后端闭环 | B | A | G4-02；G4-04 可用；相关 AC/契约明确 | 预案启动、事件、任务、回执、关闭材料、审计核心后端增量及测试 | 选定的 G2-FR-001—029 核心闭环 AC 均有代码与测试映射；正常/无权/幂等/超时/失败路径通过；数据库状态与审计可核对；PR/CI/Review 证据完整 | TODO |
| G4-06 | Sprint 1 | Sprint 1 Web/H5 前端闭环 | A | C | G4-03；G4-04 可用；与 G4-05 契约先行 | 事件处置 Web/H5 页面、状态与权限交互、附件/反馈最小闭环及测试 | 可经正式 API Client 完成核心演示路径；加载/空/失败/无权状态可见；不直连数据库或原型 Store；组件/交互/E2E 测试通过；PR 门禁完整 | TODO |
| G4-07 | Sprint 1 | Sprint 1 契约、集成、E2E 与质量门禁 | C | B | G4-05、G4-06 | Sprint 1 契约/集成/E2E 报告、覆盖率与安全结果、缺陷/门禁结论 | 核心事件闭环在干净环境通过；OpenAPI 零 schema error；核心覆盖率 `≥70%`；高危安全问题 0；阻断缺陷 0；RTM/tasks 更新且可回指 PR/CI | TODO |
| G4-08 | Sprint 2 | Sprint 2 剩余 MVP 后端及外部适配 | B | A | G4-07 准出；剩余 MVP 清单冻结 | 剩余 G2-FR-001—029 后端实现、8 端口/GIS/H5 适配、迁移与测试 | 剩余 MVP 后端 AC 逐条有实现/测试/证据；外部正常/无权/超时/失败及人工降级可验证；控制指令不盲重放；PR/CI/Review 完整 | TODO |
| G4-09 | Sprint 2 | Sprint 2 剩余 MVP 前端/态势/安防接线 | A | C | G4-07；G4-03；与 G4-08 契约先行 | 剩余 MVP Web/H5、指挥态势、安防接线与测试 | 剩余 MVP 前端 AC 可通过正式 API 验证；地图/视频/安防状态和降级可见；控制操作有权限与二次确认；兼容/E2E 证据与 PR 门禁完整 | TODO |
| G4-10 | Sprint 2 | 最终集成、覆盖率、安全、关键性能、故障演练与 MVP 验证 | C | B | G4-08、G4-09 | 最终测试执行包、覆盖率/安全/性能原始结果、故障演练、缺陷与 MVP 验证矩阵 | `G2-FR-001—029` 逐条 AC 有执行结果；功能覆盖与验收用例通过率 100%；核心覆盖率 `≥70%`；高危 0；关键性能和故障演练按受控口径实测，失败/未测不伪装通过 | TODO |
| G4-11 | Sprint 2 | RTM v4、PR/迭代证据、Prompt 模式库、AI 翻车记录及第四关收口 | A | C | G4-10；全部 G4 PR 合并或有受控处置 | RTM v4、两个 Sprint/燃尽与 PR 证据索引、Prompt 模式库、AI 翻车记录、G4 收口审计 | 12 项任务、全部合并 PR、commit、Prompt、自查、Review、CI、测试与 RTM 可双向追踪；至少 1 项真实 AI 翻车完成根因/预防记录；backlog 030—039 仍完整；无开放阻断后给出收口结论 | TODO |

角色执行链：A `G4-00 → G4-03 → G4-06 → G4-09 → G4-11`；B `G4-02 → G4-05 → G4-08`；C `G4-01 → G4-04 → G4-07 → G4-10`。`G4-02/03/04`、`G4-05/06`、`G4-08/09` 在各自契约和前置满足后尽量并行。

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
