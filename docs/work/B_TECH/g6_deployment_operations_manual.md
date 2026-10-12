# 某自然博物馆智能运营中心建设项目——应急管理子系统 部署与运维手册

- 文档编号：YJGL-G6-45
- 版本：V0.2
- 状态：REVIEW（B 已整改，待 A 复验）
- 主责：严宇（B，技术负责人）
- 复核：何思源（A，项目负责人，待复验）
- 发布/代码快照：`75f01c3bb33369d3785acf69a3a00eb983aa188b`
- 编制日期：2026-10-12

## 1 引言

本手册规定 Web/H5 静态宿主、反向代理、后端、PostgreSQL 的构建部署、配置、迁移、健康检查、日志、备份恢复、目标迁移回退和交接要求。2026-10-12 的实际运行由成员 B 在隔离 WSL2 Docker 环境完成，26/26 个步骤均有起止时间、退出码和原始日志；真实非乙方独立部署和六类甲方系统仍为 `REAL_WORLD_DEFERRED`。

## 2 发布对象与环境要求

### 2.1 发布对象

表 2-1 发布对象与版本锁定

| 配置项 | 锁定值 |
| --- | --- |
| 仓库与应用快照 | `75f01c3bb33369d3785acf69a3a00eb983aa188b`，`master`，运行前 dirty=false |
| 后端 | Node.js 24；镜像 `sha256:d7bfc5a5…f81b`；端口 3000 |
| 前端 | Vue/Vite 构建；Node 静态宿主及 `/api/` 同源代理；镜像 `sha256:323a21f0…f00e`；默认端口 8080 |
| 数据库 | PostgreSQL 16 Alpine |
| 数据迁移 | `001_foundation`、`002_event_workflow`、`003_sprint2_mvp`；支持 `up`、`down --steps=N`、`down --to=ID` |
| 配置指纹 | Compose `06c156e5…0129`；后端 Dockerfile `3c4fb9d1…601b`；前端 Dockerfile `5830a4aa…dd4a` |

### 2.2 最低资源与依赖

表 2-2 最低资源与运行依赖

| 项目 | 最低要求/当前建议 | 说明 |
| --- | --- | --- |
| 操作系统 | 64 位 Linux，或 Windows 11 + WSL2 | 正式环境由甲方确认 |
| Docker | Engine 28.x；Compose 2.35.x 已实跑 | 低版本需另验 |
| 应用节点 | 2 台，每台 8 vCPU、16 GB、100 GB SSD（建议） | 不是采购事实 |
| 数据库节点 | 1 主 1 备，每台 8 vCPU、32 GB、500 GB SSD（建议） | 生产拓扑待确认 |
| 网络 | 可访问 PostgreSQL、中台和批准的外部系统 | 地址与窗口由甲方提供 |

## 3 配置与身份注入

密钥只放入私有环境或密钥设施，禁止写入 Git、截图和日志。`compose.yaml` 已实际透传下列变量。

表 3-1 受控环境变量

| 环境变量 | 必填/默认 | 用途 |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | 必填 | 数据库口令及后端连接串 |
| `MIDDLE_PLATFORM_BASE_URL` | 必填 | 统一中台地址，生产禁止模拟地址 |
| `MIDDLE_PLATFORM_IDENTITY_PATH` | `/api/v1/platform/context` | 身份路径 |
| `MIDDLE_PLATFORM_FILE_PRESIGN_PATH` | `/api/v1/platform/files/presign` | 文件预签名路径 |
| `REQUEST_TIMEOUT_MS` | 3000 | 后端请求超时 |
| `SIMULATED_INTEGRATION_BASE_URL` | 空；生产禁用 | 课程模拟端口 |
| `VITE_API_BASE_URL` | 空 | 空值采用 `/api/` 同源代理 |
| `VITE_REQUEST_TIMEOUT_MS` | 10000 | 前端超时 |
| `VITE_APP_TITLE` | 博物馆智能运营中心 | 页面标题 |
| `FRONTEND_PORT` | 8080 | 静态宿主对外端口 |

宿主 APP 通过 `window.MuseumHostBridge.getAccessToken()` 或 `window.__MUSEUM_AUTH__.getAccessToken()` 注入短期 Bearer；前端仅在请求时写入 `Authorization`，不得把令牌固化进镜像、URL、本地文件或日志。开发身份头在生产环境无效。

## 4 全栈容器部署

### 4.1 部署步骤

在仓库根目录执行：

```bash
export POSTGRES_PASSWORD='<从密钥设施注入>'
export MIDDLE_PLATFORM_BASE_URL='https://<甲方中台地址>'
export FRONTEND_PORT=8080
docker compose build --no-cache backend frontend
docker compose up -d --wait
docker compose exec -T backend node backend/scripts/migrate.mjs up
docker compose ps
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/readyz
curl -fsS http://127.0.0.1:8080/
```

`/healthz` 验证进程存活，`/readyz` 验证数据库可用，前端根路径验证静态宿主。`--wait` 依赖数据库、后端和前端三个 healthcheck；三者均通过后才进入业务冒烟。

### 4.2 本轮实际结果

表 4-1 2026-10-12 隔离运行结果

| 检查 | 实际结果 | 证据 |
| --- | --- | --- |
| 发布锁与配置 | commit `75f01c3`，dirty=false；Compose/Dockerfile/镜像指纹已记录 | `remediation-deployment-check.json` |
| 全栈构建/启动 | backend、frontend、database 均健康；页面/health/ready 均 200 | `raw/remediation/steps/03`—`10` 日志 |
| 迁移与表 | 3 次迁移，37 张表 | JSON 汇总 |
| 目标回退/重新应用 | 3→2→3；37→13→37；哨兵 1→1 | 步骤 14—18 |
| 备份/隔离恢复 | SHA-256 `6f0c6469…169e`；恢复库 37 表、哨兵 1 | 步骤 12—20 |
| 日志/重启 | 三服务日志采集；后端重启后 ready=200 | 步骤 21—25 |
| 总时长 | 111 秒，16:23:39—16:25:30 +08:00 | JSON 与逐命令台账 |
| 清理 | 容器/卷/网络残留 0/0/0 | 步骤 26 |

## 5 源码质量门禁

```powershell
npm ci
npm ci --prefix frontend
npm run quality
```

本轮 `npm run quality` exit 0：前端 47 项通过/2 项跳过，G4 11/11，后端 21/21；覆盖率均高于 70%；OpenAPI 0 error、14 个既有非阻断 warning；秘密扫描 PASS；依赖漏洞 0；selfcheck PASS。第一次错误测试过滤导致“无匹配测试”失败已保留，纠正后目标测试和全量门禁通过。

## 6 部署后冒烟

表 6-1 冒烟检查与通过判据

| 序号 | 命令/动作 | 通过判据 |
| --- | --- | --- |
| 1 | `docker compose ps` | database/backend/frontend 均 healthy |
| 2 | `GET /healthz`、`GET /readyz` | 200/200 |
| 3 | `GET http://host:8080/` | 200 且含应用根节点 |
| 4 | 带有效 Bearer 请求身份接口 | 返回授权身份；无效令牌受控拒绝 |
| 5 | Web/H5 页面 | 正式模式可加载，不显示“演示数据” |
| 6 | 日志 | 有 traceId，无口令、令牌或敏感正文 |

## 7 监控与日志

```bash
docker compose logs --no-color --since=30m backend
docker compose logs --no-color --since=30m frontend
docker compose logs --no-color --since=30m database
```

三条命令在步骤 21—23 分别运行并以 exit 0 保存。监控至少覆盖 health/ready、HTTP 5xx、数据库连接/容量、Outbox 失败与人工复核、磁盘、六类外部端口。门禁控制禁止自动重放。

## 8 备份与恢复

### 8.1 创建并复制备份

```bash
mkdir -p ./backup
docker compose exec -T database sh -lc 'pg_dump -U emergency -d emergency -Fc -f /tmp/emergency.dump && sha256sum /tmp/emergency.dump'
docker compose cp database:/tmp/emergency.dump ./backup/emergency.dump
sha256sum ./backup/emergency.dump
```

先创建宿主目录，再复制并对比容器/宿主 SHA-256。本轮等价受控文件名为 `g6-remediation.dump`；容器与宿主哈希一致。文件名差异不改变操作语义，台账保留实际命令。

### 8.2 隔离恢复

```bash
docker compose exec -T database createdb -U emergency emergency_restore
docker compose exec -T database pg_restore -U emergency -d emergency_restore --exit-on-error /tmp/emergency.dump
docker compose exec -T database psql -U emergency -d emergency_restore -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';"
```

不得直接覆盖生产库。恢复后核对迁移、表数、关键哨兵和业务抽样，再由有权人员批准切换。

## 9 升级与目标回退

### 9.1 升级前与升级

冻结写入窗口，记录当前 commit、镜像 ID、Compose 配置指纹和迁移集合；完成备份并验证可读取；确认回退目标和数据影响。当前仓库以本地构建为准，本轮未执行 `docker compose pull`，不得把未执行命令写成实跑。

```bash
git checkout <已批准发布commit>
docker compose build --no-cache backend frontend
docker compose up -d --wait
docker compose exec -T backend node backend/scripts/migrate.mjs up
```

### 9.2 目标迁移回退

1. 停止 Web/H5 和后端写入：`docker compose stop frontend backend`。
2. 再次备份并记录恢复点、当前迁移集合和哈希。
3. 仅回退本次批准的迁移：`migrate.mjs down --steps=1`，或回退到指定边界：`migrate.mjs down --to=002_event_workflow`。
4. 检查迁移数、表数和保留数据；不符合预期时停止回退并从备份恢复。
5. 重新应用迁移、启动服务，检查 ready 和业务哨兵。

```bash
docker compose stop frontend backend
docker compose run --rm backend node backend/scripts/migrate.mjs down --steps=1
docker compose run --rm backend node backend/scripts/migrate.mjs up
docker compose up -d --wait backend frontend
curl -fsS http://127.0.0.1:3000/readyz
```

无参数 `migrate.mjs down` 会逆序回退全部已应用迁移，可能删表，仅可在明确批准全量回退且已验证恢复点时执行。本轮只回退 `003_sprint2_mvp`，迁移 3→2、表 37→13；重新应用后迁移 3、表 37，基础审计哨兵保持 1。此结果不授权生产直接回退。

## 10 故障处理

表 10-1 故障与处置

| 故障 | 检查 | 处置 |
| --- | --- | --- |
| 前端 502/空白 | frontend 日志、backend ready、代理目标 | 恢复后端或配置；禁止切演示数据冒充恢复 |
| backend unhealthy | ready、数据库和环境变量 | 修复依赖后重启并保留日志 |
| 数据库迁移失败 | 当前迁移、失败 SQL、备份哈希 | 停止写入，按批准目标回退或恢复 |
| 身份 403 | 中台地址、Bearer、时间和权限 | 返回宿主重新登录，不启用生产开发头 |
| 外部系统超时 | 端口、traceId、超时与授权 | 按降级策略，真实状态保持延期 |

## 11 停止、重启与清理

```bash
docker compose restart backend
docker compose stop frontend backend database
docker compose down
```

`docker compose down -v --remove-orphans` 会删除项目数据卷，只用于已批准的临时环境清理。本轮执行后容器/卷/网络残留均为 0。

## 12 命令证据与版本映射

`evidence/g6/G6-01/remediation-command-ledger.json` 保存 26 条命令的 command、startedAt、finishedAt、exitCode 和 rawLog。运行器还保存实际 Git HEAD/dirty、Compose 展开配置、Dockerfile SHA-256、镜像 ID 和备份哈希，消除了 V0.1 手工 releaseCommit 与运行目录无法对应的问题。

表 12-1 版本适用范围

| 对象 | 当前结论 |
| --- | --- |
| 应用与部署证据 | 均锁定 `75f01c3`；不得归属旧 `beb605f` |
| H5 修复 `8dbfbab` | 已被当前快照包含，B 技术测试通过；待 C G6-03 整体复核和 A 一致性复验 |
| V0.1 的 2026-10-11 运行 | 历史候选，仅保留审计，不作为 V0.2 锁定证据 |
| KN-065 | 执行者为成员 B，不是真实非乙方人员，继续 `REAL_WORLD_DEFERRED` |
| 六类甲方系统 | 0/6 真实实测，继续 `REAL_WORLD_DEFERRED` |

## 13 交接清单

接收方依次核对 commit/哈希、私有配置、构建、启动、迁移、三项健康检查、业务冒烟、日志、备份恢复和目标回退。每条命令必须保存环境、版本、起止时间、退出码和原始输出；失败不得删除。若按 KN-065 验收，必须由真实非乙方人员在干净主机独立执行，本轮 B 证据不能替代。
