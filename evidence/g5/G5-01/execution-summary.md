# G5-01 三级测试与功能正确性执行摘要

- Task：G5-01；主责：C（任俊强）；Review：A（待执行）。
- 执行基线：`302502c8bbe19091b6860810e98bfc837838b8d8`。
- 环境：Windows / Node `v24.21.0` / npm `11.19.0` / PostgreSQL 18 本机隔离库 `emergency_g4_test`。
- 原始数据：`functional-gate-raw.json`；逐 AC 明细：`ac-117-matrix.md`。

## 最终执行结果

| 层级/门禁 | 结果 | 实际数据 |
|---|---|---|
| 单元与工程护栏 | PASS | 13/13 |
| 后端模块/适配器集成 | PASS | 18/18 |
| Web/H5 系统与真实前后端 HTTP E2E | PASS | 10 files / 44 tests |
| PostgreSQL 集成 | PASS | 2/2；跨服务恢复、事务原子回滚 |
| 前端覆盖率 | PASS | statements 95.57%、branches 77.73%、functions 97.36%、lines 100% |
| 后端覆盖率 | PASS | statements/lines 87.69%、branches 77.74%、functions 85.24% |
| 类型检查/OpenAPI 类型生成 | PASS | exit 0 |
| 本地浏览器兼容走查 | PASS（受限） | Chromium 会话完成 Web/H5 上报及 H5→Web 状态同步；Edge 154 完成桌面/H5 实际渲染；不替代缺失版本与移动宿主矩阵 |

## 117 AC 与★结果

- 全量分母：39 FR / 117 AC / 34 个★FR。
- 已实现范围：G2-FR-001—029，共 87 AC，本轮 87 PASS / 0 FAIL / 0 BLOCKED。
- 非 MVP backlog：G2-FR-030—039，共 30 AC，0 PASS / 0 FAIL / 30 BLOCKED；本任务不得新增实现。
- ★FR：28 PASS / 6 BLOCKED；阻断项为 G2-FR-031、034、035、036、037、039。
- G2-FR-026—029 的适配器结果为本地 `SIMULATED_EVIDENCE`，不冒充甲方真实接口或目标环境联调。

## 执行异常与复测

1. 首轮在沙箱内执行时，本地回环 HTTP 被 `EACCES` 拒绝；这是执行环境限制。改在获准的本机环境原样重跑后，相关单元/集成/系统测试全部通过。
2. PostgreSQL 首轮 0/2，原因为 `127.0.0.1:5432 ECONNREFUSED`，本机 PostgreSQL 18 手动服务处于停止状态。Windows 服务启动权限不足，随后使用既有 `pg_ctl` 和原数据目录启动，不新建数据库；完整重跑后 2/2 PASS。
3. 上述失败均保留于本记录；最终数字只采用同一基线上的完整复跑结果。

## 结论

已完成可执行范围的三级测试、覆盖率、数据库集成、错误语义走查和缺陷分级。已执行范围未发现产品 FAIL 或致命/严重产品缺陷，但全量门禁仍为 `BLOCKED`：10 个 backlog FR/30 AC 无实现，且 Chrome/Edge 双版本、Android/iOS H5 宿主矩阵缺少实际资源。因此 G5-01 不得置 `DONE`，也不允许用 87/87 代替 117/117；等待 A Review，并将阻断项带入 G5-03 准出判断。
