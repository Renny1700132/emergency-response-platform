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

## 私有化容器部署

在部署环境的受控密钥设施中提供 `POSTGRES_PASSWORD` 和甲方提供的 `MIDDLE_PLATFORM_BASE_URL` 后运行：

```powershell
docker compose up --build -d
docker compose exec backend node backend/scripts/migrate.mjs up
```

该 Compose 文件只提供应用和数据库基础设施。视频、信息发布、入侵、门禁、消防、IoT、统一中台、统一消息、地图及定位端口不由本容器替代，后续 G4-04 以独立课程模拟 Fixture 处理。
