# AI 任务自动留痕规范

## 1. 适用范围与课程规则偏离

每一个具有实际产出的 AI 任务都必须执行本规范。本 Workspace 采用“自动生成 + 自动写入 + 人工抽查”。该做法覆盖学生指导书 2.8.6 的“日志内容必须人写”方法规则，偏离详情见 `control/overrides.md` 的 `OVR-001`。

自动化不代表可以代造证据：日志必须在任务实际执行过程中实时产生，禁止事后根据 Git 历史猜测会话，禁止美化、伪造操作者/时间、把失败写成成功、遗漏弃用结果或修改历史让证据更漂亮。

正式任务先按 `governance/git_workflow.md` 执行只涉及仓库状态的启动同步；随后本规范的强制链路为：`PRE-TASK RAW LOG → TASK EXECUTION → POST-TASK RAW LOG → REVIEW → COMMIT BACKFILL`。Prompt 摘要继续作为原七字段之一保留，但完整原文证据是强制项，摘要不能替代原文。

## 2. 日志生命周期状态机

每一个产生实际工作成果的 AI Task 必须按顺序记录：

```text
CREATED
  ↓
PROMPT_LOGGED
  ↓
RUNNING
  ↓
OUTPUT_LOGGED
  ↓
PENDING_REVIEW
  ↓
ACCEPTED / MODIFIED_ACCEPTED / REJECTED
  ↓
COMMITTED
  ↓
PUSHED
```

任何阶段无法继续时进入 `BLOCKED`，记录发生阶段、真实原因、已完成动作和解除条件。不得跳过 `PROMPT_LOGGED` 直接进入 `RUNNING`；不得在未写入最终用户可见输出原文时进入 `OUTPUT_LOGGED`。

## 3. 执行流程

### BEFORE_TASK

1. 收到正式任务后先确定 Task ID，并按 `governance/git_workflow.md` 完成 `REPOSITORY_BOOTSTRAP → REMOTE_SYNC`。此阶段只允许检查/同步仓库，不得读取业务材料、开展实质性分析或修改 Task 产物。
2. 同步成功后，依据 `tasks.md` 的实际执行成员创建或追加角色隔离日志 `logs/prompts/YYYY-MM-DD-<ROLE>.md`，建立 `LOG-<TASK-ID>-<SEQ>`，记录 `CREATED`。正式项目任务的 `<ROLE>` 只能为 `A`、`B` 或 `C`；确实不属于三名成员的系统维护任务可使用 `META`，不得把普通课程任务随意归入 `META`。
3. 把用户本次输入的 Prompt 完整原文逐字写入 `USER_PROMPT_RAW`。不能只留摘要，不能改写、润色、压缩或补全用户没有提供的内容。
4. 确认日志落盘成功并记录 `PROMPT_LOGGED` 后，才可读取完整任务材料、进行 Preflight、分析或修改文件，并记录 `RUNNING`。
5. 在 `tasks.md` 确认主责、复核、输入、输出和状态；检查 `control/facts.md`、`control/key_numbers.md`、`control/issues.md`。
6. 执行 Preflight Conflict Check；冲突写入 `control/overrides.md`。

### DURING_TASK

7. 仅处理 Task 范围内事项；不确定事实写 `【待人工确认】`。
8. 不静默修改其他成员主责产物；发现问题登记 Issue。
9. 记录实际失败、弃用、异常、已有修改的处置和规则冲突。
10. 不把隐藏思维链、内部推理、不可见系统消息、私有工具内部状态或无法真实取得的内容写入日志。

### AFTER_TASK

11. 完成实际工作与必要检查，写入实际修改文件、失败/弃用记录和检查结果。
12. 在正式聊天回复前，先拟定将要发送的最终用户可见回答，并逐字写入同一日志条目的 `AGENT_FINAL_OUTPUT_RAW`。
13. 确认最终输出原文落盘后记录 `OUTPUT_LOGGED`，再进入 `PENDING_REVIEW`。
14. 按复核结果进入 `ACCEPTED`、`MODIFIED_ACCEPTED` 或 `REJECTED`；复核主体和依据必须明确，人工核验状态单独保留，不得伪装成人工结论。
15. 按 `governance/git_workflow.md` 完成 staged diff 检查、commit、安全同步远程 `master` 和非 force push，依次记录 `COMMITTED`、`PUSHED`。
16. 回填 commit hash、push 目标、远程结果和时间。回填使用独立小提交并再次安全推送；该回填提交不要求记录自身 hash，避免无限自引用。G4 的回填只更新原功能分支和同一 PR；合并提交哈希不回写自身 PR，以 Gitee PR 合并记录为证据并由 G4-11 汇总。
17. 只有工作区干净、远程 `master` 已包含任务提交与回填提交后，才发送与 `AGENT_FINAL_OUTPUT_RAW` 完全一致的正式回复。

## 4. 日志字段与原文证据

原七字段必须继续保留：时间戳、操作者、任务关联、工具与模型、Prompt 摘要、产出处置、关联 PR/commit。

### 4.1 按角色隔离的日志文件

自 2026-09-10 的 G1-02 起，A/B/C 不再共写共享日期日志，分别使用：

- `logs/prompts/YYYY-MM-DD-A.md`
- `logs/prompts/YYYY-MM-DD-B.md`
- `logs/prompts/YYYY-MM-DD-C.md`

正式项目任务按 `tasks.md` 中的主责身份选择文件；同一天同一成员的多项任务追加到同一角色文件，不得覆盖。确实不属于 A/B/C 的系统维护任务使用 `logs/prompts/YYYY-MM-DD-META.md`。

生效前已有的 `logs/prompts/YYYY-MM-DD.md` 属于真实历史证据，必须原样保留，禁止重命名、拆分、按成员重组、回写或删除。新制度只约束生效后的任务。

在七字段基础上，每条日志还必须包含：

- `created_at`、`operator`、`task_id`、`tool`、`model`、`status`。
- `USER_PROMPT_RAW`：本次用户 Prompt 完整原文。
- `AGENT_FINAL_OUTPUT_RAW`：最终实际发送给用户的可见回答完整原文。
- `TASK_EVENTS`：状态变化、时间、失败、同步与推送事实。
- 实际修改文件、检查结果、人工核验状态、核验人、异常/冲突、Override ID。
- `raw_dialogue_available`：是否能真实取得完整用户可见对话。

日志 ID 使用 `LOG-<TASK-ID>-<SEQ>`，例如 `LOG-G1-04-003`。时间戳采用北京时间并精确到分钟。操作者身份未提供时必须写 `【待人工确认】`，不得按主责角色猜测。

原文可能含 Markdown 围栏时，使用更长的外层围栏，确保原文不被截断；不得为了排版修正原文中的转义、空格、错别字或未闭合代码块。

## 5. 分阶段产出处置与复核

进入 `OUTPUT_LOGGED` 后，任务状态先设为 `PENDING_REVIEW`。复核后只允许进入：

- `ACCEPTED`：原产出经核验直接采纳。
- `MODIFIED_ACCEPTED`：修改后采纳，必须写修改理由和主要变更。
- `REJECTED`：弃用，必须写理由和后续处置。

复核主体必须如实记录。自动一致性检查不得冒充人工核验；若任务按用户明确授权先完成自动验收，须写明“自动检查”，并把独立的人工核验字段保留为 `PENDING_REVIEW`。

状态回填是对原日志的审计字段更新，不是补造历史。保留原创建时间，并追加状态更新时间、核验主体和依据；不得删除原处置记录。

## 6. 用户 Prompt 原文

`USER_PROMPT_RAW` 是任务启动门禁。最低格式：

````markdown
## LOG-<TASK-ID>-<SEQ>

- created_at:
- operator:
- task_id:
- tool:
- model:
- status: PROMPT_LOGGED

### USER_PROMPT_RAW

```text
<用户本次 Prompt 完整原文>
```
````

工具能取得本次用户输入时，不得以“无法导出完整对话”为由省略该 Prompt。Prompt 摘要只用于检索和统计。

## 7. 最终用户可见输出原文

任务执行和检查完成后，Agent 必须先拟定最终回复，将其逐字写入 `AGENT_FINAL_OUTPUT_RAW`，再提交和推送。最终实际发送的文本必须与日志一致。

如果 commit/push 在最终文本落盘后失败，不得悄悄改写原块：追加 `AGENT_FINAL_OUTPUT_RAW_SUPERSEDED` 和新的最终原文，记录替换原因及 `BLOCKED` 事件，再发送新的已记录文本。

日志写入成功后，正式回复原则上只包含简短结果和本次日志文件的本地超链接，不重复已在日志中保存的长篇结果。当前用户或平台要求额外摘要时，可以附最少必要状态，但仍须逐字预先落盘。

## 8. 完整对话与禁止记录内容

- 工具能真实取得当前任务完整的用户可见对话时，可以额外原样保存到 `logs/raw/<tool>/`。
- 工具无法导出完整用户可见对话时，记录 `raw_dialogue_available: false`；最低证据仍是 `USER_PROMPT_RAW` 与 `AGENT_FINAL_OUTPUT_RAW`。
- 不记录隐藏思维链、内部推理、不可见系统消息、私有工具内部状态或无法真实取得的内容。
- 不得从 commit、摘要或最终文件反推并伪造完整对话。

## 9. Commit / PR / Push 回填

任务内容提交后回填完整 commit hash、提交时间和分支；有 PR 时追加 PR 编号/链接。按 `governance/git_workflow.md` 推送后，追加远程、目标分支、push 时间和结果，并进入 `PUSHED`。

由于内容 commit 不能包含自身最终 hash，hash 与 push 结果使用独立的小型回填提交，并再次安全同步/推送。回填提交不记录自身 hash，避免无限自引用；禁止 amend 或重写历史解决自引用问题。G4 的功能、测试、RTM、日志和 `tasks.md = DONE` 均须在同一功能 PR；PR 创建后只在原分支补充 PR 编号和审核信息。合并提交哈希不回写自身 PR，不为此创建第二个收口 PR；以 Gitee PR 合并记录为证据，由 G4-11 汇总。仅 G4-03/04 可按规则生效前遗留的一次性历史例外补齐旧流程证据，自 G4-05 起不得复制。

## 10. 人工核验

C 为日志质量负责人，每日结束抽查：Prompt 日志 ↔ `tasks.md` ↔ Git commit ↔ 实际修改文件 ↔ 远程 `master`。人工无需重写日志，只追加：`CONFIRMED`、`NEEDS_CORRECTION` 或 `REJECTED`，并填写核验人、时间与理由。

正式产出的业务内容仍按 `governance/review_workflow.md` 由指定复核人核验；日志质量抽查不能替代业务复核。

## 11. 补录

日志机制失败导致漏记时，允许后续补录，但标题和字段必须醒目标记 `【补录】`，同时记录实际任务发生时间、补录时间、补录原因、依据和批准人。无法可靠确认的字段写 `【待人工确认】`。严禁把补录伪装为实时日志。
