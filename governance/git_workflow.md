# Git 与配置管理工作流

## 分支

- 每项正式任务必须产生 commit，并最终安全同步到远程 `master`。
- 开始与结束时必须确认当前分支。直接在 `master` 工作时按下述同步门禁执行；使用 `codex/<task-id>-<short-name>` 短生命周期分支时，任务结束前必须安全合并回本地 `master`，再推送 `origin/master`。
- 一项正式产物只有主责分支/版本；复核通过 Review/Issue 提交意见，不维护影子分支作为第二正式版本。
- 未经用户明确授权不得修改 remote、改写默认分支或把任务推送到其他远程。

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

1. 在任务 commit 后再次执行 `git fetch origin master`，获取执行期间产生的远程更新。
2. 比较本地 `master` 与 `origin/master`。远程仅领先时优先 fast-forward；双方分叉时使用普通 merge，禁止通过 force 或历史重写消除分叉。
3. Git 能自动无冲突合并时，保留自动合并结果并继续；提交/推送前仍须检查合并后的 diff、日志和任务文件。
4. 出现内容冲突时，仅当处理方式唯一明确且能完整保留双方意图时才允许自动处理。任何语义不确定的冲突必须停止，记录 `BLOCKED`，向用户列出冲突文件、双方内容、影响和可选方案，等待用户裁决。不得猜测哪一方应被覆盖。
5. 合并完成后执行非 force 的 `git push origin master`。严禁 `--force`、`--force-with-lease` 或等效操作。
6. 若 push 因远程在 fetch 后再次前进而被拒绝，重新 fetch、合并、检查后再尝试普通 push；不得覆盖其他成员提交。
7. 推送成功后验证本地 `master`、`origin/master` 与远程引用一致，并把 commit、远程、分支、时间和结果回填 Prompt 日志。
8. 网络、认证、权限或语义冲突导致无法安全推送时，记录真实失败并进入 `BLOCKED`，不得报告 `PUSHED`。

## 日志回填提交

内容 commit 与首次 push 完成后，将任务 commit hash 和 push 结果写回日志，创建独立的小型回填 commit，再重复 fetch/必要合并/普通 push。回填 commit 不记录自身 hash，避免无限自引用；禁止 amend、rebase 或重写既有提交。

## 禁止事项

- 禁止 force push、强制覆盖远端、删除或重写历史。
- 禁止用 rebase、amend 或 reset 隐藏已经共享的历史。
- 禁止 `git reset --hard origin/master`，不得以丢弃本地工作的方式处理分叉。
- 禁止用清理、还原或 stash 命令擅自处理未知变更。
- 禁止覆盖或修改原始《用户需求书》及其他原始材料。

## 文档版本与冻结

- 工作稿使用 0.x 版本；评审通过后形成 1.0 或任务定义的正式版本。
- `BASELINE-V0.1`：初始事实/需求基线；`BASELINE-V0.9`：交付候选；`BASELINE-V1.0`：第一关最终冻结。
- 冻结信息写入 `control/change_log.md`，至少包含范围、时间、主责、复核与 commit。
- 冻结后不得原位改旧版。发现错误时新建版本并登记变更原因、影响和批准，不美化或删除历史。
