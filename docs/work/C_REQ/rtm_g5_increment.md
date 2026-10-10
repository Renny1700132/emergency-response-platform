# RTM G5-01 执行增量

- 受控输入：`BASELINE-G3-M3-R1.0`、`docs/work/C_REQ/test_plan.md`、`docs/work/C_REQ/rtm_v4.md`。
- 执行版本：`92085e963a4fc130c2293cb8439f289d562782c4` + 本次受控 G5-01 工作树修改。
- 完整逐 AC 结果：`evidence/g5/G5-01/ac-117-matrix.md`。
- 本文件只记录 G5 增量，不回改 G4 RTM 历史。

| FR | ★ | AC 结果 | 本轮实现/测试证据 | G5-01 状态 |
|---|---|---|---|---|
| G2-FR-001—003 | ★ | 0 PASS / 8 NOT_RUN / 1 BLOCKED | 原局部模块断言不再判完整 AC；FR-003-03 仅保留 G5-02 局部测量 | BLOCKED |
| G2-FR-004—007 | 004—006★；007非★ | 0 PASS / 8 NOT_RUN / 4 BLOCKED | 位置/视频等局部断言不外推；目标环境证据缺失 | BLOCKED |
| G2-FR-008—012 | ★ | 0 PASS / 13 NOT_RUN / 2 BLOCKED | 盘点局部差异断言不再判完整 AC；规模、周期等缺项保留 | BLOCKED |
| G2-FR-013—016 | ★ | 7 PASS / 4 NOT_RUN / 1 BLOCKED | Web/H5→HTTP→PostgreSQL 系统包覆盖上报/组合查询/拒绝、核实/启动、任务生成与反馈；组合查询以 1 条全匹配 + 状态/类型/关键字/时间各 1 条单条件反例验证保留与排除；FR-015-03、FR-016-01 等不完整条件不再 PASS | BLOCKED；仅 FR-013 整个 FR PASS，待 A 复验 013-02 新证据 |
| G2-FR-017—020 | ★ | 0 PASS / 10 NOT_RUN / 2 BLOCKED | 值班/打卡正式工作台已形成系统读取证据，但未覆盖完整 AC 条件 | BLOCKED |
| G2-FR-021—025 | ★ | 2 PASS / 11 NOT_RUN / 2 BLOCKED | H5 任务确认和反馈通过 HTTP 写入 PostgreSQL；真实宿主、消息到达率及其他完整条件仍缺失 | BLOCKED |
| G2-FR-026—029 | ★ | 2 PASS / 5 NOT_RUN / 5 BLOCKED | 身份访问控制和门禁确认/联锁流程有系统级证据；外部端口仍为 `SIMULATED_EVIDENCE`，甲方真实联调缺失 | BLOCKED |
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

全量分母保持 39 FR / 117 AC / 34 个★FR；当前为 11 PASS / 59 NOT_RUN / 47 BLOCKED，只有 G2-FR-013 的三条 AC 全部 PASS，因此★FR 为 1 PASS / 33 BLOCKED。RTM 编号无断链，但大量 AC 缺完整执行证据；旧版 87 PASS / 28★PASS 与上一轮 24 PASS 均不再作为当前事实。`ISSUE-G5-00-001` 及兼容/资源阻断继续 OPEN。

依据 OVR-035，课程阶段新增条件验收候选，但不改变上述真实结果：G2-FR-030—039 为 `COURSE_DEFERRED / IMPLEMENTATION_DEFERRED`，其余 NOT_RUN/BLOCKED 为 `COURSE_DEFERRED / EVIDENCE_DEFERRED`，兼容/宿主/真实用户及目标环境依赖为 `REAL_WORLD_DEFERRED`。当前为 `PENDING_A_FINAL_REVIEW`，不得写成 117/117、34/34 或无条件真实 PASS。
