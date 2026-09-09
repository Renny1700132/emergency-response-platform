# Codex 原始记录

仅保存 Codex 能够真实导出的完整用户可见对话或运行日志，不保存根据 commit、摘要或最终文件反推的伪记录，也不记录隐藏思维链、内部推理、不可见系统消息或私有工具状态。

G1-00 执行时当前工具未提供完整会话文件导出能力，已在当日日志记录 `raw_log_unavailable: true`。从 GOV-001 起，完整对话不可导出时使用 `raw_dialogue_available: false`；当日日志仍必须逐字保留本次 `USER_PROMPT_RAW` 与 `AGENT_FINAL_OUTPUT_RAW`。如后续由操作者从平台真实导出完整用户可见对话，应原样放入此目录并追加来源、导出时间与关联日志，不覆盖历史。
