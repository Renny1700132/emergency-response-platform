# RTM G5-01 执行增量

- 受控输入：`BASELINE-G3-M3-R1.0`、`docs/work/C_REQ/test_plan.md`、`docs/work/C_REQ/rtm_v4.md`。
- 执行版本：`302502c8bbe19091b6860810e98bfc837838b8d8`。
- 完整逐 AC 结果：`evidence/g5/G5-01/ac-117-matrix.md`。
- 本文件只记录 G5 增量，不回改 G4 RTM 历史。

| FR | ★ | AC 结果 | 本轮实现/测试证据 | G5-01 状态 |
|---|---|---|---|---|
| G2-FR-001—003 | ★ | 9/9 PASS | `tests/backend/g4-08-sprint2.test.mjs` | PASS |
| G2-FR-004—007 | 004—006★；007非★ | 12/12 PASS | 后端 Sprint 2 + 正式资源/态势组件测试 | PASS |
| G2-FR-008—012 | ★ | 15/15 PASS | 后端 Sprint 2 盘点、演练、消息路径 | PASS |
| G2-FR-013—016 | ★ | 12/12 PASS | 真实前后端 HTTP E2E + PostgreSQL 2/2 | PASS |
| G2-FR-017—020 | ★ | 12/12 PASS | 后端 Sprint 2 签到、告警、幂等路径 | PASS |
| G2-FR-021—025 | ★ | 15/15 PASS | Web/H5 组件与后端 Sprint 2 路径 | PASS |
| G2-FR-026—029 | ★ | 12/12 PASS | 后端 + 外部适配器 `SIMULATED_EVIDENCE` | PASS_LOCAL_SIMULATED；非甲方联调 |
| G2-FR-030 | 非★ | 0/3 PASS；3 BLOCKED | 无实现；backlog 保全 | BLOCKED |
| G2-FR-031 | ★ | 0/3 PASS；3 BLOCKED | 无实现；backlog 保全 | BLOCKED |
| G2-FR-032—033 | 非★ | 0/6 PASS；6 BLOCKED | 无实现；backlog 保全 | BLOCKED |
| G2-FR-034—037 | ★ | 0/12 PASS；12 BLOCKED | 无实现；backlog 保全 | BLOCKED |
| G2-FR-038 | 非★ | 0/3 PASS；3 BLOCKED | 无实现；backlog 保全 | BLOCKED |
| G2-FR-039 | ★ | 0/3 PASS；3 BLOCKED | 无实现；backlog 保全 | BLOCKED |

## 反向索引

- 原始命令、输出、环境、浏览器发现与 117 AC JSON：`evidence/g5/G5-01/functional-gate-raw.json`。
- 单元/集成/系统与覆盖率汇总：`evidence/g5/G5-01/execution-summary.md`。
- 兼容性：`evidence/g5/G5-01/compatibility-matrix.md`。
- 错误语义/易用性：`evidence/g5/G5-01/error-semantics-review.md`。
- 缺陷与阻断：`evidence/g5/G5-01/defect-register.md`。

## 门禁结论

MVP 分母为 29 FR / 87 AC，结果 87 PASS；全量分母仍为 39 FR / 117 AC，结果 87 PASS / 30 BLOCKED。28 个已实现★FR通过，6 个 backlog ★FR阻断。RTM 不存在编号断链，但全量功能通过门禁未满足，`ISSUE-G5-00-001` 保持 OPEN。
