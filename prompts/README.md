# Prompt 目录规范

本目录存放可复用 Prompt 模式或经任务需要保存的 Prompt 文件。文件名建议为 `<Task-ID>_<purpose>.md`，正文至少写明适用任务、输入、约束、预期输出和版本。

平台原始用户消息只有在工具可真实导出时才保存为原始记录；摘要或人工重写不得标为“原始 Prompt”。无法导出时，在 `logs/prompts/YYYY-MM-DD.md` 中写 `raw_log_unavailable: true`，并关联当前任务。

Prompt 文件是过程证据，必须进入 Git。修订采用新版本或可追踪提交，不为美化审计而覆盖历史。
