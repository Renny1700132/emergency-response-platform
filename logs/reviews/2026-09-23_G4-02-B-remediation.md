# G4-02 B 整改响应

- 任务：G4-02｜正式后端、数据库及公共基础设施骨架
- 主责：B
- 复核输入：A 审核提交 `252c545`，结论 FAIL
- 本次范围：仅关闭 A 提出的两项 MAJOR 并落实迁移演练观察项；不修改冻结需求、OpenAPI、FR、AC 或业务闭环。

## ISSUE-G4-02-001｜冻结 DBD 表名不一致

已将迁移及审计持久化 SQL 统一改为冻结 DBD 的 `em_audit_log`、`em_idempotency_record`、`em_outbox_event`，并同步索引、回滚脚本、测试和运行说明。未新增 CR/CCB，因为本次是撤回未获批准的候选命名并回归冻结 DBD，而不是改变基线。

## ISSUE-G4-02-002｜后端覆盖率未纳入门禁

新增 `npm run test:backend:coverage`，以 `backend/src/*.mjs` 为采集范围，运行 `tests/backend/*.test.mjs`，并以 statements/functions/branches/lines 均不低于 70% 为阻断门槛；`npm run quality` 已串联该命令。本次实测全局覆盖率为 statements 94.77%、branches 93.93%、functions 93.75%、lines 94.77%，6/6 后端测试通过。

## 迁移演练观察项

新增 `npm run test:migration:integration`。该命令要求私有 `DATABASE_URL`，会对隔离 PostgreSQL 执行 `up → down → up`，每一步检查三个冻结 DBD 公共表的存在性。A 已在 PostgreSQL 17 隔离环境执行成功；其真实结果已受控记录于 `evidence/g4/G4-02/migration-integration-2026-09-23.json`，未提交连接凭据。

## 本次复验

- `npm run quality`（官方 npm registry）：PASS；G4 门禁 11/11，后端覆盖率门禁 6/6；OpenAPI 0 error、14 个既有 warning；秘密扫描 PASS；依赖漏洞 0；selfcheck PASS。
- `git diff --check`：PASS。
- 真实迁移复演：本机无 Docker/PostgreSQL，不伪造再次执行；采用 A 已完成的 PostgreSQL 17 受控证据，并已补齐可重复命令。

## 请求

请 A 在更新后的候选分支上重新核对两项 MAJOR 和迁移演练证据。未获 A APPROVE 前，G4-02 继续保持 DOING，不创建 DONE 结论。
