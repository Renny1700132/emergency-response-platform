# 第四关研发冲刺治理

- 生效日期：2026-09-21
- 启动任务：`G4-00`
- 受控输入：`BASELINE-G3-M3-R1.0`、真实《用户需求书》、G2 SRS/spec/RTM、G3 设计/OpenAPI/测试与管理计划
- 阶段方法依据：`docs/inputs/G4/通关实验任务书4-研发冲刺.pdf`

## 1 范围与两个 Sprint

1. 本关只按冻结设计实施，不原位修改 `BASELINE-G3-M3-R1.0`；设计、接口、FR/AC、★、关键数字或责任边界变化必须先进入 Issue/CR/CCB。
2. 两个 Sprint 均以可运行增量和可重复验证为准。Sprint 1 建立工程护栏、正式前后端/模拟服务骨架并打通核心事件处置闭环；Sprint 2 完成剩余 MVP、外部适配、态势/安防接线和最终质量验证。
3. `G2-FR-001—029` 是本轮 MVP Must 优先目标。`G2-FR-030—039` 保留为本期 backlog，不删除、不改需求、不标记 Won't；是否拉入当前 Sprint 由容量和前置依赖决定，但仍保留 RTM 追踪。
4. `prototype/` 仅供 UI、页面组织、交互和演示状态参考。禁止把 localStorage、Mock 数据、`prototypeStore` 或原型页面结构直接作为正式数据库、API、领域状态或验收证据。

## 2 分支、PR 与受保护主干

1. 自 `G4-01` 起，每项研发任务从最新 `master` 创建 `codex/<task-id>-<short-name>` 功能分支；受保护 `master` 禁止直接 push。
2. 每个 PR 必须只服务一个清晰任务单元，关联 Task ID、FR/AC、设计 ID、变更文件、风险、回滚方式和测试证据。
3. PR 固定执行：`主责在功能分支完成任务 → 提交者自查并执行本地 npm run quality → push 功能分支 → 创建 PR → 指定唯一审核人 Review → Review 通过后 APPROVE → 通过 PR Merge 进入 master → 更新 RTM/tasks/日志`。
4. `tasks.md` 指定的唯一 Review 人必须 Approve；可邀请其他队友评论，但不能用额外评论替代唯一 Review 人的批准。提交者不得自批。
5. 本地 `npm run quality` 失败、核心模块单元测试覆盖率低于 `KN-045 ≥70%`、安全红线违规、契约破坏、必要测试缺失或唯一 Review 人未批准时禁止合并。不得绕过门禁、force push 或改写共享历史。
6. `G4-00` 是建立上述规则的治理切换提交，按切换前已生效的安全同步/commit/push 规则完成；它不构成后续 G4 研发直推主干的先例。
7. `master` 不用于 G4 日常任务开发，只接收审核通过后的 PR Merge。G4 不要求接入 Jenkins、Gitee Go 或其他远程 CI；远程流水线如自愿存在，也不替代本地 `npm run quality`、唯一审核人 Approve 或 PR 证据。
8. 平台操作默认使用官方 Gitee CLI：Git 同步、提交和推送仍使用现有 Git 凭据；PR 创建、查询、Review、Approve、Merge、评论和状态检查优先使用 `gitee`。禁止临时 curl/API 脚本，禁止在仓库、Prompt、日志、remote URL 或命令输出中记录 PAT；写操作前必须确认 `gitee auth status` 的账号与当前任务角色一致，身份不一致时停止。认证与权限有效时后续任务直接沿用，不重复询问。

## 3 统一研发 DoD

每个 G4 研发任务统一满足：

`任务/AC 明确 → Prompt 留痕 → 功能分支实现 + 测试 → 提交者自查 + 本地 npm run quality → push 功能分支 → PR → 指定唯一审核人 Review/Approve → PR Merge → RTM/tasks/日志更新`

其中：

- 任务开始前明确输入、输出、依赖、唯一主责、唯一 Review 人和可验证完成条件。
- Prompt 日志须与 Task/commit/PR 可追溯，记录 AI 参与范围、采纳/修改/弃用情况；看不懂的 AI 代码不得提交。
- 核心逻辑测试先行或与实现同 PR；测试必须回指具体 AC，保留命令、版本、环境、原始结果和失败记录。
- 自查至少覆盖范围、契约、权限/输入校验、参数化访问、密钥不入库、日志脱敏、迁移/回滚、测试与追踪。
- Review 记录必须可定位到 PR、commit、意见、整改和 Approve；高危安全问题为零方可合并。
- `npm run quality` 是本地质量门禁，须记录执行环境、命令、原始结果与对应 commit，不得写成远程 CI 执行结果。
- 合并后由任务主责或约定责任人更新 RTM 代码/测试证据列与 `tasks.md` 状态，不得预填未执行结果。

## 4 证据与 AI 资产

每个 PR 至少保留：任务号、功能分支和对应 commit、PR 描述、Prompt 原文及 AI 参与范围、提交者自查结果、本地 `npm run quality` 及其测试/coverage/contract/security/selfcheck 输出、唯一 Review 人的审核结论与 Approve、PR Merge 记录、RTM/tasks/日志更新。证据不得以口头结论或模拟截图替代真实记录；远程 CI 不是必需证据。

可复用的有效 Prompt 进入《Prompt 模式库》，记录适用场景、输入约束、验证方法和复用次数。至少一项真实 AI 失败/误导/返工进入《AI 翻车记录》，保留现象、影响、五问根因、修复和预防规则；不得虚构翻车以满足数量。

## 5 Sprint 准入与准出

- Sprint 1 准入：G4-01—04 的护栏/正式骨架/模拟服务达到各任务完成条件；核心事件闭环的 FR/AC 与契约明确。
- Sprint 1 准出：G4-05/06 形成可运行闭环，G4-07 的契约、集成、E2E 与门禁证据通过；未通过项回到看板，不包装为完成。
- Sprint 2 准入：Sprint 1 阻断缺陷关闭或有获批处置，剩余 MVP 与外部适配范围明确。
- Sprint 2 准出：G4-08/09 合并，G4-10 对覆盖率、安全、关键性能、故障演练和 `G2-FR-001—029` MVP 逐条验证；G4-11 完成 RTM v4、PR/迭代证据与 AI 资产收口。
