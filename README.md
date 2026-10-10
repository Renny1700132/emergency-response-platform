# 博物馆智能运营中心——应急管理子系统

> G4 本地研发与质量门禁使用 Node.js `^24.14.0 || >=26.0.0`；当前最低声明版本 Node 24.14.0 已验证。

本仓库用于《AI 辅助软件项目全生命周期开发·综合实习》课程项目。第一关“立项竞标”已冻结，第二关“需求与规格”已通过 M2，第三关“设计与计划”已通过 M3 并冻结为 `BASELINE-G3-M3-R1.0`。第四关“研发冲刺”已完成并收口；第五关已于 2026-10-08 启动，沿用第三关冻结设计，只做验证、缺陷修复与质量收口。

第一关已完成需求与招标解析、编标输入基线、项目建议书、技术方案、澄清与合规检查、项目计划、风险登记册、技术投标书、述标、需求确认书及最终冻结。第二关已形成 SRS、spec、RTM、M2 评审证据及仅供设计参考的 Prototype。

## 当前执行：G5（OVR-032，2026-10-08）

G4-00—G4-11 已 DONE 并收口进入 master；第五关“质量门禁（测试与质量特性验证）”已启动。自 G5-00 起在最新 master 上完成长任务，自检/必要 Review 留痕、安全 commit、重新 fetch 后非 force 直接 push master；不要求功能分支、PR/Approve/Merge 或远程 CI。保留真实测试、缺陷、RTM、八大质量特性和验收门禁。当前专项规则为 `governance/g5_quality_workflow.md`，规划为 `docs/work/A_PM/g5_quality_gate_plan.md`。以下 G4 专项表述仅解释历史，不约束 G5。

## G5-03 当前复核候选

G5-01/G5-02 已按 OVR-035/034 课程条件 DONE；G5-03 四类正式 DOCX、RTM v5、八特性与三审完成，当前 **REVIEW，待 C 独立最终复核**。A 未填写 VERIFIED_BY_C 或第五关 DONE。

- 工作稿：`docs/work/A_PM/g5_final/`；正式候选：`docs/deliverables/G5/`；RTM v5：`docs/work/C_REQ/rtm_v5.md` 与 `evidence/g5/G5-03/rtm-v5.json`。
- 完整分母39FR/117AC/34★FR；真实11 PASS /59 NOT_RUN /47 BLOCKED，★FR1 PASS /33 BLOCKED；30AC未实现、76AC缺完整证据继续延期。
- 性能8组1160实际样本0失败，普通API P99 35.554ms、100并发P99 39.513ms，限本地内存HTTP与 SIMULATED_EVIDENCE；目标环境/规模继续延期。
- COURSE_ACCEPTED：A建议条件收口，待C最终确认；IMPLEMENTATION_AND_REAL_WORLD_DEFERRED：六甲方系统实测0/6、真实非乙方部署操作者0，兼容/用户/长期可靠性仍须补测。真实验收门禁仍BLOCKED。
- 证据与C请求：`evidence/g5/G5-03/README.md`、`review-request.md`；quality为本地实际门禁，不是远程CI。正式件保留Reference/fallback边界，Word全35页QA通过；其他renderer长表分页可能不同。

## 项目组

| 成员 | 角色 | 唯一主责范围 |
| --- | --- | --- |
| 何思源 | 项目经理 PM / 总编 / 述标负责人 | 项目建议书、项目计划、风险登记册、技术投标书整合、跨文档一致性、述标与冻结 |
| 严宇 | 技术负责人 / 架构师 | 技术分析、架构、功能方案、数据接口、非功能设计、技术验证与技术质询 |
| 任俊强 | 需求 / 质量 / 合规负责人 | 需求解析、事实与关键数字、合规矩阵、澄清、AI 留痕与最终符合性 |

## Workspace 导航

- `AGENTS.md`：所有 AI 与成员进入任务前必须遵守的根规则。
- `tasks.md`：G1—G4 历史任务与 G5 长任务看板、主责、复核、依赖和状态。
- `docs/README.md`：原始资料的 G1/G3/公共分类索引与使用边界。
- `docs/inputs/`：按关卡归档的原始输入（`G1/`—`G5/`）及全阶段公共材料（`common/`）。
- `docs/work/`：当前工作稿；不作为冻结交付物。
- `docs/deliverables/`：评审通过并准备交付/冻结的正式产物。
- `docs/daily_reports/`：按何思源、严宇、任俊强归档的每日工作报告与编写 Skill。
- `control/`：唯一事实源、关键数字、合规矩阵、问题、变更与规则覆盖记录。
- `governance/`：AI 留痕、来源优先级、评审与 Git 工作流。
- `prompts/`：可复用 Prompt 与任务 Prompt 记录规则。
- `logs/`：Prompt、评审、会议、失败与可导出的原始记录。
- `scripts/`：后续必要的轻量检查和构建脚本。

## 唯一事实源

正式材料中的项目事实必须能追溯为“正式材料 → `control/facts.md` / `control/key_numbers.md` → 原始《用户需求书》”。任何未经可靠来源验证的内容标记为 `【待人工确认】`，不得猜测。

资料裁决优先级为：当前用户 Prompt > 真实项目《用户需求书》 > 《通关实验任务书》 > 学生指导书 > 教学案例 > AI 推理。Prompt 对工作方法有优先权，但不能被 AI 擅自解释为可改变真实项目需求、★条款、性能、边界、验收、SLA 或法规要求。

明确标注为课程课件的文件不读取、不解析、不索引为规则来源；教学案例只用于结构、表格、表达和粒度参考，禁止复制案例事实。

## 自动 Prompt 日志

所有有实际产出的 AI 任务必须读取并遵守 `governance/ai_logging.md`。任务实质执行前必须按主责成员把用户 Prompt 完整原文追加到 `logs/prompts/YYYY-MM-DD-A.md`、`-B.md` 或 `-C.md`；非成员系统维护任务使用 `-META.md`。旧的共享日期日志原样保留。任务完成后、正式回复前必须把最终用户可见回答完整原文写入同一条日志。Prompt 摘要继续保留，但不能替代原文证据。无法导出完整对话时记录 `raw_dialogue_available: false`，仍须保留这两段最低证据，且不得倒推或伪造隐藏内容。

## 日常工作流

以下安全直推 `master` 流程自 G5-00 起重新适用（OVR-032）；G4 历史采用 PR：

```text
Task
  ↓
仓库启动检查并以 --ff-only 同步远程 master
  ↓
确定 Task ID 并写入 USER_PROMPT_RAW
  ↓
读取 AGENTS 与治理规则，进入 RUNNING
  ↓
Preflight 与事实基线检查
  ↓
在任务边界内执行
  ↓
写入 AGENT_FINAL_OUTPUT_RAW
  ↓
必要 Review 留痕（G5-00 启动自检关闭；不冒充独立人工复核）
  ↓
Git commit
  ↓
安全同步并 push 远程 master
  ↓
日志回填 commit / push
```

当前任务状态见 `tasks.md`。第三关冻结范围包括设计文档集、OpenAPI 契约、ADR、工程计划与四类管理计划、测试计划、`constitution.md`、设计挂接 RTM、Review 证据及 M3 哈希清单；冻结后变更必须走 CR/CCB 并形成新基线版本。

第四关历史以两个 Sprint 实施：`G2-FR-001—029` 为 MVP Must 优先目标，`G2-FR-030—039` 继续保留为本期 backlog，不删除、不降级、不改需求。研发统一采用功能分支 + PR：主责执行自检和本地 `npm run quality` 后 push 功能分支，`tasks.md` 指定唯一审核人 Review/Approve，再通过 PR Merge 进入 `master`；主干不用于日常开发，不要求 Jenkins、Gitee Go 或其他远程 CI。详细门禁与 DoD 见 `governance/g4_development_workflow.md`。`prototype/` 只用于 UI/交互参考，其 localStorage、Mock 和 `prototypeStore` 不是正式数据或 API 实现。
