# G4-07 Sprint 1 集成与质量准出报告

- 主责：C
- 唯一审核人：B
- 日期：2026-09-26
- PR：Gitee `!15`
- B 首轮审核 HEAD：`758db48`
- 状态：DONE CANDIDATE / B REREVIEW PASS / ACCEPTED FOR APPROVAL

## B 复审结论

B 于 2026-09-26 对 PR `!15` 当前 HEAD `d974bb609748d185643cfc5fde1668767575b8ff` 完成定向复验。整改增量仅涉及 RTM、本文和 C 日志，未修改业务实现；`git diff --check`、过期状态定向检索、秘密扫描（56 files）和 G4-01—07 selfcheck 均通过。`ISSUE-G4-07-004` 已关闭，结论为 `ACCEPTED_FOR_APPROVAL`；正式完成仍以平台 APPROVE 并 Merge 至 `master` 为准。

## 准出结果

`ISSUE-G4-07-001/002/003` 均已关闭。新增非 Mock E2E 实际挂载 Vue 事件与任务页面，经正式类型化 API Client、Bearer 身份解析和真实后端 HTTP Server 完成：事件列表与上报、人工核实、预案启动、任务列表、任务接收、反馈、完成、事件关闭及无效令牌 403。

外部中台身份、文件和消息端口使用课程模拟实现，继续标记 `SIMULATED_EVIDENCE`；本报告不声明甲方真实中台、现场网络或目标验收环境已连通。

## 本地质量门禁

- `npm run quality`：PASS / exit 0。
- frontend：6 files、28/28；coverage statements 95.41%、branches 77.55%、functions 95.12%、lines 100%。
- G4 工程护栏：11/11；coverage 96.75% / 81.63% / 90% / 96.75%。
- backend：16/16；coverage statements 85.88%、branches 78.24%、functions 80.48%、lines 85.88%。
- OpenAPI：0 error；14 个已登记非阻断 warning。
- secret scan：56 files PASS；根目录与 frontend 依赖漏洞 0。
- selfcheck：加入 `quality/selfcheck/G4-07.json` 后复验。

## PostgreSQL 与环境边界

C 在本机独立 PostgreSQL 18 测试库 `emergency_g4_test` 补跑。首次连接后因空库尚未迁移，专项测试 0/2（缺少 `em_incident`、`em_message_delivery`），失败未隐藏；确认目标为独立测试库后应用 `001_foundation` 与 `002_event_workflow` 迁移，随后 `npm run test:g4-05:postgres` 2/2 PASS，覆盖跨服务实例事实恢复、分页读模型、完整关闭、Outbox/审计原子提交及注入失败回滚。该结果是 PostgreSQL 18 兼容性补充；受控 PostgreSQL 15 证据仍回指 G4-05 的 2/2 和 A 独立审核。

## 未提前关闭的后续验收

KN-006/007/011/012 的甲方正常通道、目标环境并发/到达率与时延实测仍由 G4-10/最终验收执行。本任务完成 Sprint 1 工程准出，不把模拟端口结果扩大为生产性能结论。
