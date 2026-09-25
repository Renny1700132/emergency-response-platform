# G4-02 正式后端基础设施骨架

本目录是正式后端的起点，不使用 `prototype/` 的 localStorage、Mock 或状态管理器作为数据库或业务实现。

## 受控边界

- 采用模块化单体、端口适配与持久化 Outbox；对应 ADR-001、ADR-002。
- 身份、组织和权限由统一中台提供。生产环境必须由 `MIDDLE_PLATFORM_BASE_URL` 对接中台，开发身份头仅在 `NODE_ENV=development` 且显式开启时可用。
- 外部视频、消息等真实接口和现场连通性仍按 `ISSUE-G3-01-001` 处理，本骨架不将其写成已验证。

## 本地运行

```powershell
npm ci
Copy-Item backend/.env.example backend/.env
$env:NODE_ENV='development'
$env:ALLOW_DEVELOPMENT_IDENTITY_HEADERS='true'
node backend/src/main.mjs
```

- `GET /healthz`：进程健康检查。
- `GET /readyz`：仅在已配置且可访问数据库时返回 200。
- `GET /api/v1/_internal/whoami`：开发环境需 `X-Actor-Id` 与包含 `emergency.read` 的 `X-Actor-Roles`；允许和拒绝均记录脱敏审计。

## 数据库迁移

`backend/migrations/` 中每个迁移都有成对的 `.up.sql` / `.down.sql`，以便审查和回滚：

```powershell
$env:DATABASE_URL='<仅从受控部署配置或密钥设施取得>'
node backend/scripts/migrate.mjs up
node backend/scripts/migrate.mjs down
```

迁移建立冻结 DBD 命名的 `em_audit_log`、`em_idempotency_record` 和 `em_outbox_event` 基础表；后续领域表必须继续遵循“成对迁移、事务提交后派发副作用、控制命令不自动重放”的设计规则。

使用隔离 PostgreSQL 环境时，可执行可重复的迁移演练：

```powershell
$env:DATABASE_URL='<仅从受控部署配置或密钥设施取得>'
npm run test:migration:integration
```

该命令验证 `up → down → up` 以及三个公共表的存在性；不写入或打印连接凭据。

## G4-05 核心事件处置闭环

G4-05 在同一后端进程内实现事件创建、人工核实、已发布预案启动、任务确认/反馈/完成和事件关闭。写接口沿用冻结 OpenAPI 的路径与请求结构，要求 `X-Idempotency-Key`；同一作用域内同键同请求返回首次结果，同键异请求返回 `409 IDEMPOTENCY_CONFLICT`。开发身份头仍只允许在显式启用的 development 模式使用。

核心接口：

- `POST /api/v1/incidents`
- `POST /api/v1/incidents/{incidentId}/verify`
- `POST /api/v1/incidents/{incidentId}/start-response`
- `POST /api/v1/tasks/{taskId}/acknowledge`
- `POST /api/v1/tasks/{taskId}/feedback`
- `POST /api/v1/tasks/{taskId}/complete`
- `POST /api/v1/incidents/{incidentId}/close`

迁移 `002_event_workflow` 使用冻结 DBD 的 `em_*` 命名，保存事件、核实动作、确定的预案版本、任务、反馈与附件引用、关闭材料、消息投递记录；公共 `em_idempotency_record`、`em_outbox_event` 和 `em_audit_log` 提供幂等、派生事件和审计证据。所有 SQL 值均通过参数传递。

设置 `SIMULATED_INTEGRATION_BASE_URL` 后，任务通知调用 G4-04 的 `EXT-MESSAGE` 课程模拟端口。失败或超时保留业务任务并标记 `MANUAL_REVIEW`，不自动重放控制指令。该结果仅为 `SIMULATED_EVIDENCE`，不代表真实消息平台、现场网络、并发或到达率验收已通过。

```powershell
npm run test:backend:coverage
npm run quality
```

自动化测试覆盖正常、无权、幂等冲突、模拟消息失败/超时、状态前置、参数化持久化和成对迁移。KN-011、KN-012、KN-006、KN-007 仍须在目标验收环境由后续集成任务形成实测证据。

## 私有化容器部署

在部署环境的受控密钥设施中提供 `POSTGRES_PASSWORD` 和甲方提供的 `MIDDLE_PLATFORM_BASE_URL` 后运行：

```powershell
docker compose up --build -d
docker compose exec backend node backend/scripts/migrate.mjs up
```

该 Compose 文件只提供应用和数据库基础设施。视频、信息发布、入侵、门禁、消防、IoT、统一中台、统一消息、地图及定位端口不由本容器替代，后续 G4-04 以独立课程模拟 Fixture 处理。
