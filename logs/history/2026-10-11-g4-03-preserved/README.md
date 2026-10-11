# 旧G4-03收口资料保留与对账

- 用户于2026-10-11明确授权保留旧资料并安全纳入master；原分支codex/g4-03-closeout，原HEAD bfcd882。
- `old-closeout.patch`保存原tasks/RTM未提交差异；schema.d.ts仅显示行尾差异，git实际内容diff为空，不作为代码修改引入。
- `2026-09-24-A-original.md`为旧目录未跟踪日志可读副本；ZIP同时保留原始字节（避免Git行尾转换），原始SHA-256 CC9A3DFD3CCB8728F1E4F527DD7AF6B55ADCC34862080E6C709B641A15B2957E。master同日期日志属于其他真实任务，不能覆盖或混同；两份都保留。
- 最新master已有G4-03 DONE与后续成果；不把旧tasks全文覆盖新看板。不静默改C维护的RTM，将原追加行完整保留于patch供审计定位；最新正式RTM仍作为后续事实源。
- G5原PDF与master文件哈希相同（2EB41FDAA684D590069FCEF189CB87419EC0034AF6E5E5AB96150D1B13EAFE07），无需重复覆盖；G6原PDF另归档并索引。
- 原目录.worktrees为登记在git worktree list中的工作树，不是无用临时目录；全部保留，不将嵌套仓库提交到master、不删除或加入忽略。
- 只在归档与本轮提交确认后定向撤销原目录已保留的三项tracked旧修改；未跟踪原始资料/历史日志保持原样。不得用全目录clean/reset处理。
