# AI 任务自动留痕规范

## 1. 适用范围与课程规则偏离

每一个具有实际产出的 AI 任务都必须执行本规范。本 Workspace 采用“自动生成 + 自动写入 + 人工抽查”。该做法覆盖学生指导书 2.8.6 的“日志内容必须人写”方法规则，偏离详情见 `control/overrides.md` 的 `OVR-001`。

自动化不代表可以代造证据：日志必须在任务实际执行过程中实时产生，禁止事后根据 Git 历史猜测会话，禁止美化、伪造操作者/时间、把失败写成成功、遗漏弃用结果或修改历史让证据更漂亮。

## 2. 执行流程

### BEFORE_TASK

1. 读取 `AGENTS.md` 与本文件。
2. 在 `tasks.md` 确认 Task ID；没有 Task ID 时先建立或请求主责确认。
3. 检查 `control/facts.md`、`control/key_numbers.md`、`control/issues.md`。
4. 执行 Preflight Conflict Check；冲突写入 `control/overrides.md`。
5. 保存或关联原始 Prompt。能导出时放入 `logs/raw/<tool>/`；不能导出时写 `raw_log_unavailable: true`。

### DURING_TASK

6. 仅处理 Task 范围内事项。
7. 不确定事实写 `【待人工确认】`。
8. 不静默修改其他成员主责产物；发现问题登记 Issue。
9. 记录实际失败、弃用、异常和规则冲突。

### AFTER_TASK

10. 向 `logs/prompts/YYYY-MM-DD.md` 追加日志，禁止覆盖当天已有条目。
11. 写入实际修改文件与检查结果。
12. 初始产出处置和人工核验均设为 `PENDING_REVIEW`。
13. 完成必要检查后执行本地 commit；回填 commit hash，有 PR 后再回填 PR。

## 3. 日志字段

每条至少包含：时间戳、操作者、任务关联、工具与模型、Prompt 摘要、产出处置、关联 PR/commit。推荐同时包含原始 Prompt 路径/关联、AI 原始输出路径、修改文件、人工核验状态、核验人、异常/冲突、Override ID 和检查结果。

日志 ID 建议为 `LOG-<Task ID>-<当日序号>`，例如 `LOG-G1-04-003`。时间戳采用北京时间并精确到分钟。操作者身份未提供时必须写 `【待人工确认】`，不得按主责角色猜测。

## 4. 分阶段产出处置

AI 刚完成任务时统一写 `PENDING_REVIEW`。人工核验后只允许更新为：

- `ACCEPTED`：原产出经核验直接采纳。
- `MODIFIED_ACCEPTED`：修改后采纳，必须写修改理由和主要变更。
- `REJECTED`：弃用，必须写理由和后续处置。

状态回填是对原日志的审计字段更新，不是补造历史。保留原创建时间，并追加“状态更新时间、核验人、理由”；不得删除原处置记录。

## 5. Commit / PR 回填

任务提交后把完整 commit hash 写入对应条目，并记录回填时间。未来产生 PR 时追加 PR 编号/链接。由于 commit 不能包含自身最终 hash，hash 回填使用独立的小型本地 commit，禁止 amend 形成自引用循环。

## 6. 原始记录

- 工具能导出完整会话/运行记录：原样保存到 `logs/raw/<tool>/`，不编辑原文。
- 工具不能导出：记录 `raw_log_unavailable: true`，并保留 Prompt 摘要、修改文件和 Git 证据。
- 摘要不能冒充逐字原始 Prompt；不得从 commit 或最终文件反推生成“原始会话”。

## 7. 人工核验

C 为日志质量负责人，每日结束抽查：Prompt 日志 ↔ `tasks.md` ↔ Git commit ↔ 实际修改文件。人工无需重写日志，只追加：`CONFIRMED`、`NEEDS_CORRECTION` 或 `REJECTED`，并填写核验人、时间与理由。

正式产出的业务内容仍按 `governance/review_workflow.md` 由指定复核人核验；日志质量抽查不能替代业务复核。

## 8. 补录

日志机制失败导致漏记时，允许后续补录，但标题和字段必须醒目标记 `【补录】`，同时记录实际任务发生时间、补录时间、补录原因、依据和批准人。无法可靠确认的字段写 `【待人工确认】`。严禁把补录伪装为实时日志。
