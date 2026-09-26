# G4-05 对 G4-07 集成阻断的受控修复

- 日期：2026-09-25
- 执行身份：B（G4-05 主责）
- 分支：`codex/g4-05-integration-remediation`
- Gitee PR：`!14`（OPEN，等待 A/Admin Review）
- 触发：`ISSUE-G4-07-002`、`ISSUE-G4-07-003`
- 状态：`IMPLEMENTED / PENDING_A_REVIEW_AND_C_RETEST`

## ISSUE-G4-07-002 修复

1. 增加 `GET /api/v1/incidents`、`GET /api/v1/incidents/{incidentId}` 与 `GET /api/v1/tasks`，通过正式仓储分页查询，不使用前端 Mock 或原型 Store。
2. 增加 `POST /api/v1/tasks` 临时任务、`POST /api/v1/tasks/{taskId}/remind` 催办和 `POST /api/v1/platform/files/presign` 文件预签名路由。
3. 临时任务必须关联处置中事件。冻结 `TaskRequest` 未携带事件标识时，仅在授权范围内恰有一个处置中事件时自动关联；零个或多个候选时返回 422，防止静默错绑。
4. 文件服务未配置或中台不可用时返回 503，保留真实集成边界，不生成虚假文件引用。

## ISSUE-G4-07-003 修复

1. 后端接收前端现有 `Authorization: Bearer <token>`，交由中台身份端口校验并映射用户、角色、权限、组织和数据范围。
2. 新增 `GET /api/v1/platform/context`，供前端现有 AuthContext 完成启动握手。
3. 不直接解码或信任未经验证的令牌；无适配器、无效令牌和无权限均 fail-closed。
4. 开发身份头仅在 development 且显式开启时可用；请求已携带 Bearer 时不会回退到开发身份头。

## 自动验证

- 后端覆盖率门禁：16/16 PASS；总覆盖率 statements 85.88%、branches 78.24%、functions 80.48%、lines 85.88%。
- Bearer 真实 HTTP 接线测试覆盖：平台上下文、事件/任务列表、事件详情、事件创建/核实/启动、临时任务、催办、文件预签名、无效令牌拒绝。
- 中台端口测试验证 Authorization 转发、身份归一化和文件请求转发。
- 完整 `npm run quality`：PASS。frontend 27/27，G4 11/11，backend 16/16；后端覆盖率 statements 85.88%、branches 78.24%、functions 80.48%、lines 85.88%；OpenAPI 0 error、14 个既有 warning；秘密扫描 PASS（55 files）；根目录与前端依赖漏洞均为 0；selfcheck PASS。
- 隔离 PostgreSQL 实例完成迁移后 `npm run test:g4-05:postgres` 2/2 PASS；覆盖正式分页查询、事件详情、临时任务持久化、催办、跨实例恢复和事务回滚。临时实例已停止并清理。
- 首次全量门禁在安全审计阶段因 `npmmirror` 不实现 npm audit 接口失败；临时切换官方 registry 后完整重跑 exit 0，失败未隐瞒。

## 复核边界

- 本修复不宣称甲方真实中台或文件服务已连通；真实地址、账号和令牌格式仍依赖甲方接口资料与环境。
- A 需复核后端与现有前端调用的一致性；C 需在 G4-07 分支补做非 Mock E2E、PostgreSQL 集成与最终准出复验。
