# Git 与配置管理工作流

## 分支

- 每项正式任务必须产生 commit。G1—G3 历史任务按当时规则安全同步远程 `master`；自 `G4-01` 起只 push 功能分支，并由 PR Merge 进入 `master`。
- 开始与结束时必须确认当前分支。G4 任务从最新 `master` 创建 `codex/<task-id>-<short-name>` 短生命周期分支，禁止在本地合并回 `master` 后直推远程主干。
- 一项正式产物只有主责分支/版本；复核通过 Review/Issue 提交意见，不维护影子分支作为第二正式版本。
- 未经用户明确授权不得修改 remote、改写默认分支或把任务推送到其他远程。

### 第四关覆盖规则

`G4-00` 是旧工作流切换到第四关治理的启动提交。自 `G4-01` 起，G4 研发任务必须使用 `codex/<task-id>-<short-name>` 功能分支并通过单个功能 PR 合并到受保护 `master`，禁止直接推送主干。功能、测试、RTM、日志和 `tasks.md = DONE` 必须进入同一 PR；PR 创建后在同一分支补充 PR 编号和审核信息。每个 PR 必须记录任务号、对应 commit、AI 参与范围、自检与本地 `npm run quality` 结果，以及指定唯一 Review 人的审核结论和 Approve；本地门禁失败或 Review 未批准不得合并。合并提交哈希不回写自身 PR，以 Gitee PR 合并记录为证据并由 G4-11 汇总。G4 不要求 Jenkins、Gitee Go 或其他远程 CI，本地门禁不得写成远程 CI。G4-03/04 各保留一个规则生效前遗留的历史收口 PR；自 G4-05 起不得再为常规 G4 任务创建第二个收口 PR。其余安全同步、禁止 force、语义冲突停止和日志回填规则继续适用；详见 `governance/g4_development_workflow.md`。

# Task Start Repository Sync

每项正式任务开始时，在产生本 Task 的项目文件修改之前，必须：

1. 执行 `git status --short --branch` 与 `git remote -v`，确认工作树状态、当前位于 `master` 且 `origin` 可用。
2. 执行 `git fetch origin master`。
3. 执行 `git pull --ff-only origin master`。
4. 确认本地 `master` 已包含最新远程提交。
5. 然后才进入 Prompt 原文留痕和任务执行。

固定顺序：

```text
REPOSITORY_BOOTSTRAP
  ↓
REMOTE_SYNC
  ↓
PROMPT_LOGGED
  ↓
TASK_EXECUTION
  ↓
VALIDATION
  ↓
OUTPUT_LOGGED
  ↓
COMMIT
  ↓
FINAL_REMOTE_CHECK
  ↓
PUSH
```

默认使用 `--ff-only`，因为任务开始同步的目标是尽可能在工作前吸收其他成员修改，而不是在基于旧版本完成工作后再例行制造 merge。若无法 fast-forward，说明历史已经分叉：停止正式任务，列明 local/remote HEAD 与双方独有提交并识别原因；只有能明确确认既有本地提交应推送且不存在语义冲突时，才按安全流程处理，否则进入 `BLOCKED` 等待用户裁决。

发现已有未提交修改时，禁止使用 `git reset --hard`、`git clean -fd`、`git checkout .`、`git restore .` 或 `git stash` 擅自处理。只有在修改内容、来源和保留方式都明确时才能原样保留并继续；来源或归属不确定时将任务记为 `BLOCKED`，列出文件和差异并等待用户决定。

## Commit

- 一个 commit 对应一个可说明的任务单元，消息包含类型、范围和结果，例如 `docs(G1-03): draft project proposal`。
- 提交前检查 `git status`、`git diff --check` 和 staged diff；确认没有原始资料改动、敏感信息或案例事实污染。
- 只暂存当前任务文件和已经明确判定需要保留的既有修改；不得顺手提交来源不明或无关变更。
- Prompt、日志、评审、control、governance 与 docs 都是课程过程证据，不得加入 `.gitignore`。
- 正式任务结束不得只留下未提交修改。内容 commit 完成后按“安全同步与 Push”执行。

## 安全同步与 Push

以下步骤中的 `master` 直推仅适用于 G1—G3 历史/遗留任务。G4 必须执行后述“G4 功能分支与 PR”流程，不得套用第 5 步直推主干。

1. 在任务 commit 后再次执行 `git fetch origin master`，获取执行期间产生的远程更新。
2. 比较本地 `master` 与 `origin/master`。远程仅领先时优先 fast-forward；双方分叉时使用普通 merge，禁止通过 force 或历史重写消除分叉。
3. Git 能自动无冲突合并时，保留自动合并结果并继续；提交/推送前仍须检查合并后的 diff、日志和任务文件。
4. 出现内容冲突时，仅当处理方式唯一明确且能完整保留双方意图时才允许自动处理。任何语义不确定的冲突必须停止，记录 `BLOCKED`，向用户列出冲突文件、双方内容、影响和可选方案，等待用户裁决。不得猜测哪一方应被覆盖。
5. 合并完成后执行非 force 的 `git push origin master`。严禁 `--force`、`--force-with-lease` 或等效操作。
6. 若 push 因远程在 fetch 后再次前进而被拒绝，重新 fetch、合并、检查后再尝试普通 push；不得覆盖其他成员提交。
7. 推送成功后验证本地 `master`、`origin/master` 与远程引用一致，并把 commit、远程、分支、时间和结果回填 Prompt 日志。
8. 网络、认证、权限或语义冲突导致无法安全推送时，记录真实失败并进入 `BLOCKED`，不得报告 `PUSHED`。

### G4 功能分支与 PR

1. 功能分支完成任务的功能、测试、RTM、日志和 `tasks.md = DONE`，提交者自查并通过本地 `npm run quality` 后，检查 diff 并 commit。
2. 再次 fetch `origin/master` 并检查分叉；语义冲突按本文件规则停止，不以 rebase/force 覆盖历史。
3. 非 force push 当前功能分支，创建或更新单任务 PR；PR 创建后在同一分支补充 PR 编号、审核信息和必要证据并继续更新该 PR；不得执行 `git push origin master`。
4. `tasks.md` 指定的唯一审核人完成 Review；只有其结论通过并在 PR 中 Approve 后，才通过 PR Merge 进入 `master`。
5. PR 记录任务号、AI 参与范围、自检与本地质量门禁结果、审核结论、对应 commit，以及同一 PR 中的 RTM、日志和 `tasks.md = DONE`。远程 CI 不是 G4 合并前提。
6. 合并提交哈希不要求写进自身 PR；以 Gitee PR 合并记录为证据，由 G4-11 最终汇总。除 G4-03/04 的一次性历史收口外，不得为回填 DONE、审核或合并提交另建第二个 PR。

## 日志回填提交

内容 commit 与首次 push 完成后，将任务 commit hash 和 push 结果写回日志，创建独立的小型回填 commit。G1—G3 按历史规则再次安全同步并普通 push。G4 的回填 commit 只 push 到原功能分支并更新同一 PR；PR 编号和审核信息也在该分支补充。G4 不回填自身 PR 的合并提交哈希，不另建常规收口 PR；该哈希以 Gitee 合并记录为证据并由 G4-11 汇总。回填 commit 不记录自身 hash，避免无限自引用；禁止 amend、rebase 或重写既有提交。

## 禁止事项

- 禁止 force push、强制覆盖远端、删除或重写历史。
- 禁止用 rebase、amend 或 reset 隐藏已经共享的历史。
- 禁止 `git reset --hard origin/master`，不得以丢弃本地工作的方式处理分叉。
- 禁止用清理、还原或 stash 命令擅自处理未知变更。
- 禁止覆盖或修改原始《用户需求书》及其他原始材料。

## 文档版本与冻结

- 工作稿使用 0.x 版本；评审通过后形成 1.0 或任务定义的正式版本。
- `BASELINE-G1-V0.1`：第一关编标输入工作基线；`BASELINE-V0.9`：交付候选；`BASELINE-V1.0`：第一关最终冻结。
- 冻结信息写入 `control/change_log.md`，至少包含范围、时间、主责、复核与 commit。
- 冻结后不得原位改旧版。发现错误时新建版本并登记变更原因、影响和批准，不美化或删除历史。
