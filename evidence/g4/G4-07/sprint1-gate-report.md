# G4-07 Sprint 1 集成与质量准出报告

- 主责：C
- 唯一审核人：B
- 日期：2026-09-26
- 状态：DONE CANDIDATE / PENDING B REVIEW

## 准出结果

`ISSUE-G4-07-001/002/003` 均已关闭。新增非 Mock E2E 实际挂载 Vue 事件与任务页面，经正式类型化 API Client、Bearer 身份解析和真实后端 HTTP Server 完成：事件列表与上报、人工核实、预案启动、任务列表、任务接收、反馈、完成、事件关闭及无效令牌 403。

外部中台身份、文件和消息端口使用课程模拟实现，继续标记 `SIMULATED_EVIDENCE`；本报告不声明甲方真实中台、现场网络或目标验收环境已连通。

## 本地质量门禁

- `npm run quality`：PASS / exit 0。
- frontend：6 files、28/28；coverage statements 95.41%、branches 77.55%、functions 95.12%、lines 100%。
- G4 工程护栏：11/11；coverage 96.75% / 81.63% / 90% / 96.75%。
- backend：16/16；coverage statements 85.88%、branches 78.24%、functions 80.48%、lines 85.88%。
- OpenAPI：0 error；14 个已登记非阻断 warning。
- secret scan：55 files PASS；根目录与 frontend 依赖漏洞 0。
- selfcheck：加入 `quality/selfcheck/G4-07.json` 后复验。

## PostgreSQL 与环境边界

本机未配置 `DATABASE_URL`，Docker 不可用；`npm run test:g4-05:postgres` 因缺少连接配置 exit 1，该失败未隐藏。数据库准出证据回指 G4-05 在隔离 PostgreSQL 15 上的迁移、跨实例恢复、读模型、完整关闭与事务回滚 2/2，以及 A 在 PR `!14` 的独立审核。C 本轮不把该既有结果表述为本机复跑。

## 未提前关闭的后续验收

KN-006/007/011/012 的甲方正常通道、目标环境并发/到达率与时延实测仍由 G4-10/最终验收执行。本任务完成 Sprint 1 工程准出，不把模拟端口结果扩大为生产性能结论。
