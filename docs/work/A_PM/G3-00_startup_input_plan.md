# G3-00 第三关启动与设计输入规划记录

- Task ID：G3-00
- 主责：何思源（A）
- 复核：严宇（B）、任俊强（C）
- 日期：2026-09-15
- 状态：DONE（仅完成启动整理与规划；不代表任何正式设计已完成）

## 1. 启动结论与范围

第二关需求与规格已通过 M2，G2-P01—G2-P05 的最小验证原型及走查均已完成。第三关现进入“设计与计划”启动阶段；本记录只建立资料、治理、受控输入和任务依赖，不起草概要设计、详细设计、数据库设计、接口设计、OpenAPI、ADR、测试计划或正式业务代码。

G3 的设计输入以受控需求为准。Prototype 只可用于核对页面组织、业务交互和演示状态，不能把 `localStorage`、Mock 数据、`prototypeStore` 或 Vue 页面结构直接当成正式数据库、接口或技术架构。

## 2. 受控输入核对

| 输入 | 当前位置 | G3 使用方式 | 核对结论 |
| --- | --- | --- | --- |
| 原始《用户需求书》 | `docs/inputs/G1/用户需求书-03-应急管理子系统.docx` | 项目事实、范围、★条款、性能、责任边界和验收的权威来源 | 受控，未修改 |
| G2 SRS | `docs/work/A_PM/software_requirements_specification_v0.1.md` | 需求正文和业务语义输入 | 受控，未修改 |
| G2 spec | `docs/work/B_TECH/spec.md` | 可验证 AC 的权威规格输入 | 受控，未修改 |
| G2 RTM | `docs/work/C_REQ/rtm_v1.md` | 需求—AC—后续设计/测试挂接起点 | 受控，未修改 |
| M2 评审包 | `docs/work/A_PM/g2_m2_review_pack.md` | M2 准入和一致性结论 | `M2_REQUIREMENTS_SPEC_PASS` |
| G2 控制目录 | `control/g2/` | 39 条 FR、★属性、MVP 范围、术语和编号校验 | 39/39 FR、34/34 ★FR、117 条 AC 已形成受控链 |
| G3 任务书 | `docs/inputs/G3/通关实验任务书3-设计与计划.pdf` | G3 成果、计划粒度、测试左移和工程基线要求 | 已读取，作为 P2 任务输入 |

后续必须保持“需求 → AC → 设计 → 测试”的双向追踪链，不得以页面截图、Mock 行为或实现便利替代需求和 AC。

## 3. 责任边界与开放问题检查

`control/issues.md` 当前记录的 G2 下游输入阻断 Issue 为 0，未发现阻塞 G3-00 的开放问题。历史已裁决边界继续继承：视频录像存储、定位基础设施、门禁硬件、消息通道、统一中台和 IoT 等由既有平台/甲方或后续接口条件承担；本项目在冻结范围内完成接入、关联、展示、业务编排和约定的验证责任。G3 不得静默新增平台建设、外部系统改造或超出既有责任的性能承诺。

若后续设计需要对接口能力、数据字段、部署条件或验收环境作出无法由受控输入支持的判断，必须先按 Issue/澄清/变更流程记录，不能自行假定。

## 4. G3 正式成果、主责与建议位置

| 成果 | 主责 | 协作/复核 | 建议工作稿位置 | 后续正式交付位置 |
| --- | --- | --- | --- | --- |
| 设计输入基线、模块边界、架构候选 | B | A、C | `docs/work/B_TECH/` | 作为设计与 ADR 输入，不单独冒充正式设计 |
| `plan.md`、WBS、分工、Project 计划 | A | B、C | `docs/work/A_PM/plan.md` | `docs/deliverables/` 中对应正式计划文档；Project 文件按后续规则归档 |
| 概要设计说明书 | B | A、C | `docs/work/B_TECH/` | `docs/deliverables/` |
| 数据库设计说明书 | B | A、C | `docs/work/B_TECH/` | `docs/deliverables/` |
| 详细设计说明书 | B | A、C | `docs/work/B_TECH/` | `docs/deliverables/` |
| 接口设计说明书与 OpenAPI 契约 | B | A、C | `docs/work/B_TECH/` | `docs/deliverables/`；OpenAPI 采用受控 `.yaml`/`.json` 文件 |
| ADR（不少于 2 份）、非功能设计、工程规则/constitution | B | A、C | `docs/work/B_TECH/` | `docs/deliverables/` 或治理指定目录；`constitution.md` 进入根治理入口后冻结 |
| 设计挂接 RTM、AC 覆盖、测试计划、符合性检查 | C | A、B | `docs/work/C_REQ/` | `docs/deliverables/` 中对应正式材料 |
| M3 组织、跨文档一致性、工程基线 | A | B、C | `docs/work/A_PM/`、`logs/reviews/` | `control/baselines/`、`logs/reviews/` 和必要正式材料 |

正式文档生成或修改时，仍须触发 `docs/deliverables/SKILL.md`；工作稿是内容源，reference 是格式模板，二者不得脱节。

## 5. 任务依赖骨架

1. G3-01 先建立设计输入基线、模块边界和可比较的架构决策候选；未形成候选与证据前，不拍板最终技术架构。
2. G3-02 由 A 在 G3-01 输入基础上细化 WBS、资源/依赖、`plan.md` 与 `constitution.md` 规划；Microsoft Project 仅在原子任务和依赖明确后录入、建立资源和甘特计划基线。
3. G3-03—G3-07 形成设计文档集、OpenAPI、ADR 与非功能设计；G3-08 由 C 将设计挂接到受控 RTM；G3-09 以具体 AC 形成测试计划；最后由 G3-10 组织 M3 一致性检查与工程基线冻结。

## 6. 后续计划原子任务规则

后续细化 `plan.md` 与 `tasks.md` 时，每个工程原子任务必须同时满足：

- 原则上不超过 0.5 人日；
- 明确前置依赖、责任人和输出；
- 可独立验证；
- 验证标准直接引用 `docs/work/B_TECH/spec.md` 中具体 AC 编号；
- 禁止以“功能正常”“开发完成”等不可验证表述替代验收标准。

本轮没有录入完整 Project 计划、资源表或甘特图，也没有提前把 G3-01—G3-10 的后续成果标记为完成。

## 7. 教学材料处理说明

`docs/inputs/G3/ch1.3 Project使用.pdf` 和 `docs/inputs/G3/第 5 章 5.2 项目组织与管理1.pptx` 已按实际用途归类为 G3 教学/规划输入。二者属于课程课件或教学输入，依据 Workspace 规则仅登记、未读取，也不作为项目事实或规则裁决来源。
