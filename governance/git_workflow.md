# Git 与配置管理工作流

## 分支

- 初始化任务按用户要求在当前本地分支提交。
- 后续并行工作优先使用 `codex/<task-id>-<short-name>` 形式的短生命周期分支；团队另有明确分支约定时，以经记录的约定为准。
- 一项正式产物只有主责分支/版本；复核通过 Review/Issue 提交意见，不维护影子分支作为第二正式版本。

## Commit

- 一个 commit 对应一个可说明的任务单元，消息包含类型、范围和结果，例如 `docs(G1-03): draft project proposal`。
- 提交前检查 `git status`、`git diff --check` 和 staged diff；确认没有原始资料改动、敏感信息或案例事实污染。
- Prompt、日志、评审、control、governance 与 docs 都是课程过程证据，不得加入 `.gitignore`。
- 本地提交后，将 hash 回填到对应 Prompt 日志；回填本身另做小提交，避免工作区残留。

## 禁止事项

- 禁止 force push、强制覆盖远端、修改 remote、删除或重写历史。
- 未经用户明确授权不执行 push。
- 禁止用 `git reset --hard`、清理未跟踪文件等方式处理未知变更。
- 禁止覆盖或修改原始《用户需求书》及其他原始材料。

## 文档版本与冻结

- 工作稿使用 0.x 版本；评审通过后形成 1.0 或任务定义的正式版本。
- `BASELINE-V0.1`：初始事实/需求基线；`BASELINE-V0.9`：交付候选；`BASELINE-V1.0`：第一关最终冻结。
- 冻结信息写入 `control/change_log.md`，至少包含范围、时间、主责、复核与 commit。
- 冻结后不得原位改旧版。发现错误时新建版本并登记变更原因、影响和批准，不美化或删除历史。
