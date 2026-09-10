# Prompt 目录规范

本目录存放可复用 Prompt 模式或经任务需要保存的 Prompt 文件。文件名建议为 `<Task-ID>_<purpose>.md`，正文至少写明适用任务、输入、约束、预期输出和版本。

每次任务的用户 Prompt 原文必须在实质执行前，按 `tasks.md` 主责身份逐字写入 `logs/prompts/YYYY-MM-DD-A.md`、`-B.md` 或 `-C.md` 的 `USER_PROMPT_RAW`；非成员系统维护任务使用 `-META.md`。旧共享日期日志原样保留。本目录可保存可复用模板或额外 Prompt 文件，但不能代替角色日志中的原文。摘要或人工重写不得标为“原始 Prompt”。无法导出完整用户可见对话时写 `raw_dialogue_available: false`；这不免除保存本次用户 Prompt 原文和最终用户可见输出原文的义务。

Prompt 文件是过程证据，必须进入 Git。修订采用新版本或可追踪提交，不为美化审计而覆盖历史。

## 当前提示词包

- `C_FIRST_GATE_PROMPT_PACK_v1.md`：成员 C 在第一关中的主责任务、A 类产物符合性复核和每日 AI 审计提示词。每次只复制并发送一个完整提示词块；发送该块仅授权其中明确写明的单一任务。
