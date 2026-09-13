# G2 需求追踪矩阵（RTM v1）

- 任务：G2-06
- 版本：v1.0 候选
- 主责 / 复核：C / B
- 状态：REVIEW（29 条 MVP 正向链完整；10 条非 MVP 本期 FR 的逐条 SRS/spec/AC 链缺失，见 ISSUE-G2-06-001）
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

## 3 非 MVP、仍属本期范围的追踪（10 条）

| 原始 FR / 事实 | 优先级 / ★ | 当前 SRS 证据 | 当前 spec / AC 证据 | 设计/测试挂接 | 追踪状态与处置 |
| --- | --- | --- | --- | --- | --- |
| FR-01.4 / F-103 | Should / 非★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-03.1 / F-108 | Should / ★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-03.2 / F-109 | Should / 非★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-07.1 / F-123 | Should / 非★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-07.2 / F-124 | Should / ★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-07.3 / F-125 | Should / ★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-07.4 / F-126 | Should / ★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-07.5 / F-127 | Should / ★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-08.3 / F-130 | Should / 非★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |
| FR-09.1 / F-134 / KN-017 | Could / ★ | 仅有全量范围声明 | 无逐条 spec/AC | DES/TC 待建立 | GAP-G2-06-001 |

## 4 覆盖统计与准出

| 检查项 | 结果 | 结论 |
| --- | --- | --- |
| 全项目 FR 纳入 RTM | 39 / 39 | 已纳入；无静默裁剪。 |
| MVP 稳定编号及原始 FR 双向映射 | 29 / 29 | 完整。 |
| MVP SRS + spec/AC 正向链 | 29 / 29 | 完整；各条仍待设计、测试和现场证据。 |
| 非 MVP 本期 FR 逐条 SRS/spec/AC 链 | 0 / 10 | 缺失，受 ISSUE-G2-06-001 管理。 |
| ★ FR 追踪 | MVP 28 / 28；全项目额外 6 条仍有链缺口 | 不得以 MVP 统计替代全项目 34 条★口径。 |
| G2-CLR 裁决边界 | 12 / 12 已归档 | 已映射至受影响 MVP 链或全局约束。 |

**准出结论**：本 RTM 已完成 29 条 MVP 的正向需求—AC 追踪，并如实登记 10 条非 MVP、本期 FR 的缺口。G2-06 候选稿可供 B 复核；G2-07/M2 不得以“39/39 已纳入”替代“39/39 已有可执行验收链”。在 ISSUE-G2-06-001 关闭前，M2 对全量 FR 的双镜像准出为 BLOCKED。

## 5 后续使用

- A：为 10 条非 MVP FR 补充逐条 SRS 需求和与本矩阵一致的验收编号。
- B：为相同 10 条 FR 补充 spec Given/When/Then，确认技术边界和可观察结果。
- C：在主责修改后复验 39 条 FR 的 SRS/spec/AC 双向映射，并更新 RTM 状态。
- G2-07：使用本矩阵检查编号、裁决、AC、设计和测试证据；不得将 `待设计`、`待测试`或`待验证`误报为完成。