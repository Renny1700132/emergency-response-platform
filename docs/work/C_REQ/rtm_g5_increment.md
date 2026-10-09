# RTM G5-01 执行增量

- 受控输入：`BASELINE-G3-M3-R1.0`、`docs/work/C_REQ/test_plan.md`、`docs/work/C_REQ/rtm_v4.md`。
- 执行版本：`b9c35ac80f9fa55ec9209d24d8e6fc9ddd76fc2f` + 本次受控 G5-01 工作树修改。
- 完整逐 AC 结果：`evidence/g5/G5-01/ac-117-matrix.md`。
- 本文件只记录 G5 增量，不回改 G4 RTM 历史。

| FR | ★ | AC 结果 | 本轮实现/测试证据 | G5-01 状态 |
|---|---|---|---|---|
| G2-FR-001—003 | ★ | 2 PASS / 6 NOT_RUN / 1 BLOCKED | 预案依赖、事件启动逐项断言；FR-003-03 挂接 G5-02 局部测量但真实通道缺失 | BLOCKED |
| G2-FR-004—007 | 004—006★；007非★ | 1 PASS / 7 NOT_RUN / 4 BLOCKED | 仅位置过期/禁调派有完整断言；视频与目标环境证据缺失 | BLOCKED |
| G2-FR-008—012 | ★ | 1 PASS / 12 NOT_RUN / 2 BLOCKED | 仅盘点差异有完整断言；规模、半年周期等缺项不外推 | BLOCKED |
| G2-FR-013—016 | ★ | 7 PASS / 4 NOT_RUN / 1 BLOCKED | 单条正式客户端→HTTP E2E（内存持久化）+ HTTP 模块测试；非完整 Web/H5→API→PostgreSQL 包 | BLOCKED；仅 FR-013 整个 FR PASS |
| G2-FR-017—020 | ★ | 2 PASS / 8 NOT_RUN / 2 BLOCKED | 点位保存、缺卡告警有断言；统计/导出/真实消息通道缺项 | BLOCKED |
| G2-FR-021—025 | ★ | 6 PASS / 7 NOT_RUN / 2 BLOCKED | H5 组件、单条 HTTP E2E、签到/盘点模块断言；真实宿主与到达率缺失 | BLOCKED |
| G2-FR-026—029 | ★ | 5 PASS / 3 NOT_RUN / 4 BLOCKED | 本地适配器 `SIMULATED_EVIDENCE`；甲方安防/IoT/视频/门禁真实联调缺失 | BLOCKED |
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

全量分母保持 39 FR / 117 AC / 34 个★FR；当前为 24 PASS / 47 NOT_RUN / 46 BLOCKED，只有 G2-FR-013 的三条 AC 全部 PASS，因此★FR 为 1 PASS / 33 BLOCKED。RTM 编号无断链，但大量 AC 缺完整执行证据；旧版 87 PASS / 28★PASS 已被 A Review 否决并由 Git 历史留存。`ISSUE-G5-00-001` 及兼容/资源阻断继续 OPEN。
