# G2 需求追踪矩阵（RTM v1）

- 任务：G2-06
- 版本：v1.0 候选
- 主责 / 复核：C / B
- 状态：DONE（2026-09-13 ISSUE-G2-06-001 已闭环；C 符合性复验与 B 技术复验通过）
- 输入基线：`control/g2/requirements_catalog.md`、G2-03 SRS v0.1、G2-04 spec.md v0.1、G2-05 澄清记录。

## 1 追踪规则与读法

1. 项目全部 39 条 FR 均在本矩阵保留；29 条 MVP 使用稳定编号 `G2-FR-001`—`G2-FR-029`，10 条非 MVP 仍属本期范围但尚无 G2 稳定编号。
2. `SRS` 与 `spec/AC` 为当前双镜像证据；`设计挂接`与`测试挂接`仅是将来产物预留编号，`待设计/待测试`不表示已实现或已通过。
3. `G2-CLR` 是 G2-05 已裁决的范围/责任边界证据；它不替代接口联调、性能测试、安全测试、部署验证或最终验收。
4. 任何 `GAP` 均表示链路未闭合，禁止在 G2-07 或 M2 报告中统计为覆盖通过。

## 2 MVP 正向追踪（29 条）

| G2-FR | 原始 FR / 事实 | MVP / ★ | SRS 落点 | spec / 可执行 AC | 裁决边界 | 设计挂接 | 测试挂接 | 追踪状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G2-FR-001 | FR-01.1 / F-100 | MVP-1 / ★ | SRS §3 G2-FR-001 | AC-G2-FR-001-01—03 | — | DES-G2-FR-001（待设计） | TC-G2-FR-001-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-002 | FR-01.2 / F-101 | MVP-1 / ★ | SRS §3 G2-FR-002 | AC-G2-FR-002-01—03 | — | DES-G2-FR-002（待设计） | TC-G2-FR-002-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-003 | FR-01.3 / F-102 / KN-003 | MVP-1 / ★ | SRS §3 G2-FR-003 | AC-G2-FR-003-01—03 | — | DES-G2-FR-003（待设计） | TC-G2-FR-003-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-004 | FR-02.1 / F-104 | MVP-2 / ★ | SRS §3 G2-FR-004 | AC-G2-FR-004-01—03 | — | DES-G2-FR-004（待设计） | TC-G2-FR-004-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-005 | FR-02.2 / F-105 / KN-008、009 | MVP-2 / ★ | SRS §3 G2-FR-005 | AC-G2-FR-005-01—03 | G2-CLR-002、006 | DES-G2-FR-005（待设计） | TC-G2-FR-005-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-006 | FR-02.3 / F-106 / KN-010、060 | MVP-2 / ★ | SRS §3 G2-FR-006 | AC-G2-FR-006-01—03 | G2-CLR-001、010 | DES-G2-FR-006（待设计） | TC-G2-FR-006-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-007 | FR-02.4 / F-107 | MVP-2 / 非★ | SRS §3 G2-FR-007 | AC-G2-FR-007-01—03 | G2-CLR-006、009 | DES-G2-FR-007（待设计） | TC-G2-FR-007-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-008 | FR-03.3 / F-110 / KN-024 | MVP-3 / ★ | SRS §3 G2-FR-008 | AC-G2-FR-008-01—03 | G2-CLR-009 | DES-G2-FR-008（待设计） | TC-G2-FR-008-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-009 | FR-03.4 / F-111 | MVP-3 / ★ | SRS §3 G2-FR-009 | AC-G2-FR-009-01—03 | G2-CLR-009 | DES-G2-FR-009（待设计） | TC-G2-FR-009-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-010 | FR-04.1 / F-112 / KN-013 | MVP-3 / ★ | SRS §3 G2-FR-010 | AC-G2-FR-010-01—03 | — | DES-G2-FR-010（待设计） | TC-G2-FR-010-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-011 | FR-04.2 / F-113 | MVP-3 / ★ | SRS §3 G2-FR-011 | AC-G2-FR-011-01—03 | — | DES-G2-FR-011（待设计） | TC-G2-FR-011-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-012 | FR-04.3 / F-114 | MVP-3 / ★ | SRS §3 G2-FR-012 | AC-G2-FR-012-01—03 | — | DES-G2-FR-012（待设计） | TC-G2-FR-012-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-013 | FR-05.1 / F-115 | MVP-1 / ★ | SRS §3 G2-FR-013 | AC-G2-FR-013-01—03 | — | DES-G2-FR-013（待设计） | TC-G2-FR-013-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-014 | FR-05.2 / F-116 / KN-011、012 | MVP-1 / ★ | SRS §3 G2-FR-014 | AC-G2-FR-014-01—03 | — | DES-G2-FR-014（待设计） | TC-G2-FR-014-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-015 | FR-05.3 / F-117 | MVP-1 / ★ | SRS §3 G2-FR-015 | AC-G2-FR-015-01—03 | — | DES-G2-FR-015（待设计） | TC-G2-FR-015-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-016 | FR-05.4 / F-118 | MVP-1 / ★ | SRS §3 G2-FR-016 | AC-G2-FR-016-01—03 | — | DES-G2-FR-016（待设计） | TC-G2-FR-016-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-017 | FR-06.1 / F-119 | MVP-3 / ★ | SRS §3 G2-FR-017 | AC-G2-FR-017-01—03 | — | DES-G2-FR-017（待设计） | TC-G2-FR-017-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-018 | FR-06.2 / F-120 | MVP-3 / ★ | SRS §3 G2-FR-018 | AC-G2-FR-018-01—03 | G2-CLR-006 | DES-G2-FR-018（待设计） | TC-G2-FR-018-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-019 | FR-06.3 / F-121 / KN-014 | MVP-3 / ★ | SRS §3 G2-FR-019 | AC-G2-FR-019-01—03 | — | DES-G2-FR-019（待设计） | TC-G2-FR-019-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-020 | FR-06.4 / F-122 / KN-006、007 | MVP-3 / ★ | SRS §3 G2-FR-020 | AC-G2-FR-020-01—03 | G2-CLR-004、010 | DES-G2-FR-020（待设计） | TC-G2-FR-020-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-021 | FR-08.1 / F-128 | MVP-3 / ★ | SRS §3 G2-FR-021 | AC-G2-FR-021-01—03 | G2-CLR-007 | DES-G2-FR-021（待设计） | TC-G2-FR-021-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-022 | FR-08.2 / F-129 / KN-006、007 | MVP-3 / ★ | SRS §3 G2-FR-022 | AC-G2-FR-022-01—03 | G2-CLR-004、007、010 | DES-G2-FR-022（待设计） | TC-G2-FR-022-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-023 | FR-08.4 / F-131 | MVP-3 / ★ | SRS §3 G2-FR-023 | AC-G2-FR-023-01—03 | G2-CLR-007 | DES-G2-FR-023（待设计） | TC-G2-FR-023-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-024 | FR-08.5 / F-132 / KN-036 | MVP-3 / ★ | SRS §3 G2-FR-024 | AC-G2-FR-024-01—03 | G2-CLR-007 | DES-G2-FR-024（待设计） | TC-G2-FR-024-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-025 | FR-08.6 / F-133 | MVP-3 / ★ | SRS §3 G2-FR-025 | AC-G2-FR-025-01—03 | G2-CLR-007、009 | DES-G2-FR-025（待设计） | TC-G2-FR-025-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-026 | FR-10.1 / F-135 / KN-016 | MVP-2 / ★ | SRS §3 G2-FR-026 | AC-G2-FR-026-01—03 | G2-CLR-006 | DES-G2-FR-026（待设计） | TC-G2-FR-026-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-027 | FR-11.1 / F-136 | MVP-4 / ★ | SRS §3 G2-FR-027 | AC-G2-FR-027-01—03 | G2-CLR-010 | DES-G2-FR-027（待设计） | TC-G2-FR-027-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-028 | FR-11.2 / F-137 | MVP-4 / ★ | SRS §3 G2-FR-028 | AC-G2-FR-028-01—03 | G2-CLR-005、010 | DES-G2-FR-028（待设计） | TC-G2-FR-028-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-029 | FR-11.3 / F-138 | MVP-2、4 / ★ | SRS §3 G2-FR-029 | AC-G2-FR-029-01—03 | G2-CLR-001、003、010 | DES-G2-FR-029（待设计） | TC-G2-FR-029-01—03（待测试） | COVERED_PENDING_EVIDENCE |

## 3 非 MVP、仍属本期范围的逐条追踪（10 条）

| G2-FR | 原始 FR / 事实 | 优先级 / ★ | SRS 落点 | spec / 可执行 AC | 设计挂接 | 测试挂接 | 追踪状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G2-FR-030 | FR-01.4 / F-103 | Should / 非★ | SRS §3.5 G2-FR-030 | AC-G2-FR-030-01—03 | DES-G2-FR-030（待设计） | TC-G2-FR-030-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-031 | FR-03.1 / F-108 | Should / ★ | SRS §3.5 G2-FR-031 | AC-G2-FR-031-01—03 | DES-G2-FR-031（待设计） | TC-G2-FR-031-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-032 | FR-03.2 / F-109 | Should / 非★ | SRS §3.5 G2-FR-032 | AC-G2-FR-032-01—03 | DES-G2-FR-032（待设计） | TC-G2-FR-032-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-033 | FR-07.1 / F-123 | Should / 非★ | SRS §3.5 G2-FR-033 | AC-G2-FR-033-01—03 | DES-G2-FR-033（待设计） | TC-G2-FR-033-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-034 | FR-07.2 / F-124 | Should / ★ | SRS §3.5 G2-FR-034 | AC-G2-FR-034-01—03 | DES-G2-FR-034（待设计） | TC-G2-FR-034-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-035 | FR-07.3 / F-125 | Should / ★ | SRS §3.5 G2-FR-035 | AC-G2-FR-035-01—03 | DES-G2-FR-035（待设计） | TC-G2-FR-035-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-036 | FR-07.4 / F-126 | Should / ★ | SRS §3.5 G2-FR-036 | AC-G2-FR-036-01—03 | DES-G2-FR-036（待设计） | TC-G2-FR-036-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-037 | FR-07.5 / F-127 | Should / ★ | SRS §3.5 G2-FR-037 | AC-G2-FR-037-01—03 | DES-G2-FR-037（待设计） | TC-G2-FR-037-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-038 | FR-08.3 / F-130 | Should / 非★ | SRS §3.5 G2-FR-038 | AC-G2-FR-038-01—03 | DES-G2-FR-038（待设计） | TC-G2-FR-038-01—03（待测试） | COVERED_PENDING_EVIDENCE |
| G2-FR-039 | FR-09.1 / F-134 / KN-017 | Could / ★ | SRS §3.5 G2-FR-039 | AC-G2-FR-039-01—03 | DES-G2-FR-039（待设计） | TC-G2-FR-039-01—03（待测试） | COVERED_PENDING_EVIDENCE |

## 4 覆盖统计与准出

| 检查项 | 结果 | 结论 |
| --- | --- | --- |
| 全项目 FR 纳入 RTM | 39 / 39 | 已纳入；无静默裁剪。 |
| 稳定编号及原始 FR 双向映射 | 39 / 39 | 完整；001—029 是 MVP Must，030—039 是非 MVP、本期范围。 |
| SRS + spec/AC 正向链 | 39 / 39 | 完整；每条均至少 3 条可观察 AC，仍待设计、测试和现场证据。 |
| 非 MVP、本期 FR 逐条 SRS/spec/AC 链 | 10 / 10 | ISSUE-G2-06-001 已补齐并关闭。 |
| ★ FR 追踪 | 34 / 34（MVP 28 / 28；非 MVP 6 / 6） | 完整；★属性未变更。 |
| G2-CLR 裁决边界 | 12 / 12 已归档 | 已映射至受影响 MVP 链或全局约束。 |

**准出结论**：39 条 FR 均已形成“原始 FR/事实—稳定编号—SRS—spec/AC—设计/测试预留”的正向链。ISSUE-G2-06-001 不再阻断 G2-07/M2 的全量需求双镜像检查。COVERED_PENDING_EVIDENCE 只表示规格已覆盖，不能表示实现、接口联调、性能、安全、部署或现场验收已通过；这些证据仍须在后续设计、测试与评审中如实补充。

## 5 后续使用

- G2-07：使用本矩阵逐条核对编号、优先级、★属性、裁决、SRS、AC、设计和测试证据；不得将“待设计/待测试/待验证”误报为完成。
- A/B/C：后续变更须先更新受控目录、SRS、spec 与本 RTM；若改变范围、★属性、数字、责任或优先级，必须按控制流程另行裁决。
