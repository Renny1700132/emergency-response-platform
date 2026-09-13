# G2 需求编号目录

- 状态：DONE（2026-09-13 B 复核通过；四处故事映射仍受 `ISSUE-G2-02-001` 门禁约束）
- 编号范围：`G2-FR-001`—`G2-FR-029`
- 基线范围：29 条唯一 MVP FR，全部为 Must
- 规则：一个 `G2-FR` 只映射一个原始 FR；用户故事允许多对多；★属性继承原始事实，不在 G2 中重判。

## 1 MVP 功能需求编号

| G2 稳定编号 | 原始 FR | ★ | 忠实摘要 | MVP | G2-01 声明故事映射 | 权威事实 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G2-FR-001 | FR-01.1 | 是 | 分层编制并按场景细化应急预案。 | MVP-1 | US-001 | F-100 | MUST / INHERITED_FROZEN |
| G2-FR-002 | FR-01.2 | 是 | 配置预案流程、任务、会议群组、通知及调派人员。 | MVP-1 | US-002 | F-101 | MUST / INHERITED_FROZEN |
| G2-FR-003 | FR-01.3 | 是 | 自定义任务并在启动预案时自动下发移动终端。 | MVP-1 | US-003 | F-102；KN-003 | MUST / INHERITED_FROZEN |
| G2-FR-004 | FR-02.1 | 是 | 实时展示事件动态、续报、时间线、任务状态和处理人。 | MVP-2 | US-008 | F-104 | MUST / INHERITED_FROZEN |
| G2-FR-005 | FR-02.2 | 是 | 展示人员位置、职责和就位状态，满足刷新并不降低源精度。 | MVP-2 | US-009 | F-105；KN-008、009 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-006 | FR-02.3 | 是 | 一键实时调阅视频并通过既有接口支持历史回放。 | MVP-2 | US-010 | F-106；KN-010、060 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-007 | FR-02.4 | 否 | 地图展示物资站点并钻取清单、数量和配置。 | MVP-2 | US-011 | F-107 | MUST / INHERITED_FROZEN |
| G2-FR-008 | FR-03.3 | 是 | 维护物资台账、数量、有效期和临期提醒。 | MVP-3 | US-021 | F-110 | MUST / INHERITED_FROZEN |
| G2-FR-009 | FR-03.4 | 是 | 制定盘点计划，移动盘点并自动比对、标识差异。 | MVP-3 | US-022【映射语义待复核】 | F-111 | MUST / INHERITED_FROZEN |
| G2-FR-010 | FR-04.1 | 是 | 制定月/季/年演练计划并落实监管频次。 | MVP-3 | US-014 | F-112；KN-013 | MUST / INHERITED_FROZEN |
| G2-FR-011 | FR-04.2 | 是 | 周期到达时自动下发演练任务并留痕。 | MVP-3 | US-015 | F-113 | MUST / INHERITED_FROZEN |
| G2-FR-012 | FR-04.3 | 是 | 记录演练执行、模板评估、报告和持续改进。 | MVP-3 | US-016 | F-114 | MUST / INHERITED_FROZEN |
| G2-FR-013 | FR-05.1 | 是 | Web/H5 发起事件并支持多条件检索。 | MVP-1 | US-004 | F-115 | MUST / INHERITED_FROZEN |
| G2-FR-014 | FR-05.2 | 是 | 完成核实审批、预案启动、生命周期跟踪和留痕。 | MVP-1 | US-005 | F-116；KN-011、012 | MUST / INHERITED_FROZEN |
| G2-FR-015 | FR-05.3 | 是 | 自动下发处置任务，支持反馈、催办和临时任务。 | MVP-1 | US-006 | F-117 | MUST / INHERITED_FROZEN |
| G2-FR-016 | FR-05.4 | 是 | 关闭评估、事故调查、报告和知识沉淀。 | MVP-1 | US-007 | F-118 | MUST / INHERITED_FROZEN |
| G2-FR-017 | FR-06.1 | 是 | 配置值班打卡小组、时段、点位及代执行留痕。 | MVP-3 | US-024【映射语义待复核】 | F-119 | MUST / INHERITED_FROZEN |
| G2-FR-018 | FR-06.2 | 是 | 维护打卡点位、地图拾取、二维码和有效半径。 | MVP-3 | US-025 | F-120 | MUST / INHERITED_FROZEN |
| G2-FR-019 | FR-06.3 | 是 | 按点位、小组和人员统计打卡并导出明细。 | MVP-3 | US-025 | F-121；KN-014 | MUST / INHERITED_FROZEN |
| G2-FR-020 | FR-06.4 | 是 | 缺卡/超时告警并通过统一消息通道推送。 | MVP-3 | US-025 | F-122；KN-006、007 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-021 | FR-08.1 | 是 | H5 移动发起事件、拍照并查看个人事件。 | MVP-3 | US-017【故事含“接收”，范围待复核】 | F-128 | MUST / INHERITED_FROZEN |
| G2-FR-022 | FR-08.2 | 是 | 移动接收、确认、反馈、上传并完成任务。 | MVP-3 | US-018、US-028 | F-129；KN-006、007 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-023 | FR-08.4 | 是 | 移动查看、执行演练并提交结果。 | MVP-3 | US-019【映射语义待复核】 | F-131 | MUST / INHERITED_FROZEN |
| G2-FR-024 | FR-08.5 | 是 | 移动扫码打卡并校验身份、时段和范围。 | MVP-3 | US-020 | F-132；KN-036 | MUST / INHERITED_FROZEN |
| G2-FR-025 | FR-08.6 | 是 | 移动盘点物资并更新现有数量。 | MVP-3 | US-023 | F-133 | MUST / INHERITED_FROZEN |
| G2-FR-026 | FR-10.1 | 是 | 展示安防终端在线、告警统计、定位和跳转。 | MVP-2 | US-012 | F-135；KN-016 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-027 | FR-11.1 | 是 | 接入物联网告警/客流，实现告警转事件、重试和补传。 | MVP-4 | US-026、US-029 | F-136 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-028 | FR-11.2 | 是 | 适配甲方统一中台通用能力，不重复建设。 | MVP-4 | US-027、US-029 | F-137 | MUST / DEPENDENCY_PENDING_VALIDATION |
| G2-FR-029 | FR-11.3 | 是 | 实现视频调阅/回放及受权、安全联锁的门禁联动。 | MVP-2、MVP-4 | US-013、US-029 | F-138 | MUST / DEPENDENCY_PENDING_VALIDATION |

## 2 非 MVP、仍属本期范围

| 原始 FR | MVP 优先级 | 期次标记 | 权威事实 |
| --- | --- | --- | --- |
| FR-01.4 | Should | 非 MVP / 本期 | F-103 |
| FR-03.1 | Should | 非 MVP / 本期 | F-108 |
| FR-03.2 | Should | 非 MVP / 本期 | F-109 |
| FR-07.1 | Should | 非 MVP / 本期 | F-123 |
| FR-07.2 | Should | 非 MVP / 本期 | F-124 |
| FR-07.3 | Should | 非 MVP / 本期 | F-125 |
| FR-07.4 | Should | 非 MVP / 本期 | F-126 |
| FR-07.5 | Should | 非 MVP / 本期 | F-127 |
| FR-08.3 | Should | 非 MVP / 本期 | F-130 |
| FR-09.1 | Could | 非 MVP / 本期 | F-134；KN-017 |

## 3 编号完整性结论

- `G2-FR`：29 个、连续、无重复。
- 原始 MVP FR：29 个唯一值、无遗漏、无额外项。
- ★：28 条；非★：1 条（FR-02.4）。该计数只针对 29 条 MVP FR，不替代全项目 34 条★/39 条 FR 的总计。
- 非 MVP：10 条，仍属本期范围；当前无 Won't。
- G2-01 的故事语义与声明 FR 映射存在四处需复核项，见 `ISSUE-G2-02-001`；本目录以 P1 冻结 FR 含义为准，不用故事文本改写需求事实。
