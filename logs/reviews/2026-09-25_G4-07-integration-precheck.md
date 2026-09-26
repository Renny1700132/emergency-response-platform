# G4-07 Sprint 1 集成准出预检

- 日期：2026-09-25
- 主责：C
- 唯一审核人：B
- 分支：`codex/g4-07-sprint1-quality`
- 结论：`CHANGES_REQUIRED / E2E BLOCKED`

## 已通过

- G4-05 PR `!13` 已合并，G4-05/G4-06 均为 DONE，原前置阻断解除。
- 完整 `npm run quality` exit 0。
- frontend 27/27；覆盖率 95.41% / 76.19% / 95.12% / 100%。
- G4 11/11；backend 14/14；后端覆盖率 87.38% / 85.76% / 80.95% / 87.38%。
- OpenAPI 0 error（14 个既有 warning）；秘密扫描 54 文件 PASS；依赖漏洞 0；selfcheck PASS。

## 阻断发现

1. `ISSUE-G4-07-002`：前端页面依赖事件/任务列表以及 Sprint 1 页面已暴露的命令，但正式后端缺少对应 GET 与部分 POST 路由；既有前端页面测试使用 mock client，既有后端测试只覆盖 POST 核心命令，未形成真实接线。
2. `ISSUE-G4-07-003`：前端发送 Bearer token，后端只识别显式 development 身份头，默认正式接线无法建立授权身份。
3. 本机 `DATABASE_URL` 未设置、Docker 不可用，仅发现停止状态的 PostgreSQL 18 服务；因此本轮未把 A 在隔离 PostgreSQL 15 的既有 2/2 证据伪装为 C 的独立复跑。

## 准出结论

当前可证明单体质量门禁和契约 lint 通过，但不能证明真实 Web/H5—后端—数据库核心事件闭环。G4-07 保持 DOING；待 B/A 修复两个跨端阻断并提供可用 PostgreSQL 测试环境后，由 C 补充非 mock E2E、性能/目标环境边界、最终 RTM/selfcheck 与 DONE 候选证据。
