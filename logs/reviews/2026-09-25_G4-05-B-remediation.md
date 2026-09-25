# G4-05 B 整改记录

- 任务：G4-05 Sprint 1 核心事件处置后端闭环
- 主责：B
- 唯一复核人：A
- PR：!13（`codex/g4-05-core-event-backend` → `master`）
- 针对审核：`logs/reviews/2026-09-24_G4-05-A-review.md`
- 结论：`ISSUE-G4-05-001—003` 已完成 B 整改，提交 A 独立复验；B 不自行关闭 Issue、Approve 或 Merge。

## 整改结果

1. `ISSUE-G4-05-001`：运行时接受冻结值 `CONFIRMED` 并映射内部 `VERIFIED`；所有核心写命令校验 `resourceVersion`，冲突返回 409；创建接口使用 200；成功/失败响应补齐 `message`、`timestamp` 和 `traceId`。
2. `ISSUE-G4-05-002`：正式仓储新增事件、任务与事件任务集合读取；命令在事务内从 PostgreSQL 恢复聚合与版本，服务重启后可继续核实、启动、确认、反馈、完成和关闭。
3. `ISSUE-G4-05-003`：数据库适配器提供 `BEGIN/COMMIT/ROLLBACK`；业务事实、Outbox、审计同事务提交；消息调用在业务提交后执行，失败写入 `MANUAL_REVIEW` 和可恢复投递证据。

## 验证

- `npm run test:backend:coverage`：14/14 PASS；statements/lines 87.38%、branches 85.76%、functions 80.95%。
- `npm run test:g4-05:postgres`：PostgreSQL 15 隔离实例完成 001/002 迁移后 2/2 PASS；覆盖跨服务重启完整闭环，以及审计故障时业务事实/Outbox 回滚。
- 合入最新 `origin/master`（含 G4-06）后完整 `npm run quality`：exit 0。
- 前端：27/27 PASS；覆盖率 statements 95.41%、branches 76.19%、functions 95.12%、lines 100%。
- 工程门禁：11/11 PASS；后端：14/14 PASS；OpenAPI：0 error、14 个既有非阻断 warning；秘密扫描 PASS（54 files）；根/前端依赖漏洞 0；selfcheck PASS。

## 失败与修正留痕

- 首次完整门禁在 `npmmirror` 的 npm audit 未实现端点失败；临时切换官方 npm registry 后完整通过。
- 合入 G4-06 后首次类型检查因工作树未安装新增 `@vue/test-utils` 失败；按锁文件执行 `npm ci --prefix frontend` 后通过。
- PostgreSQL 集成首次第二条断言因测试查询混用 `text/uuid` 失败；改为 `id::text` 后 2/2 通过，产品代码未因该测试错误改变。

## 待 A 操作

A 在 PR !13 独立复跑并核对上述三项 Issue。通过后将 `ISSUE-G4-05-001—003` 置为 CLOSED，执行 Review/Approve，再通过同一 PR Merge 进入 `master`。
