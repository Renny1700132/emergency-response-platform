# G5-01 117 AC 实际执行矩阵

- 执行版本：`92085e963a4fc130c2293cb8439f289d562782c4` + 本次G5-01受控工作树修改（明细见原始JSON；提交后由A按新HEAD复验）
- 汇总：PASS 11 / FAIL 0 / BLOCKED 47 / NOT_RUN 59
- ★需求汇总：PASS 1 / BLOCKED 33（分母 34 个★FR）
- 判定规则：仅白名单中的逐AC测试名称、断言和实际值允许产生PASS；套件总绿不得批量提升AC。
- 边界：内存持久化与模拟外部端口均在执行类型中明示，不外推为Web/H5→API→PostgreSQL或甲方真实接口验收；FR-030—039未实现且按G5范围禁止新增实现。

| FR | AC | 结果 | 执行类型 | 测试用例/执行ID | 具体断言 | 实际值 | 本次证据 | 说明 |
|---|---|---|---|---|---|---|---|---|
| G2-FR-001 | AC-G2-FR-001-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-001 | AC-G2-FR-001-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-001 | AC-G2-FR-001-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-002 | AC-G2-FR-002-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-002 | AC-G2-FR-002-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-002 | AC-G2-FR-002-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-003 | AC-G2-FR-003-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-003 | AC-G2-FR-003-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-003 | AC-G2-FR-003-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-01/03 local start-response measurement | target channel remains required even though the local path is fast | local P99=2.331ms; simulated message port; target channel NOT_RUN | evidence/g5/G5-02/performance-raw.json<br>docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-004 | AC-G2-FR-004-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-004 | AC-G2-FR-004-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-004 | AC-G2-FR-004-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-005 | AC-G2-FR-005-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-005 | AC-G2-FR-005-02 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-05 direct position-processing measurement | source precision is preserved, but continuous target-source refresh was not executed | local P99=0.181ms; source accuracy 0.5m preserved; continuous ≤2s refresh NOT_RUN | evidence/g5/G5-02/performance-raw.json<br>docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-005 | AC-G2-FR-005-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-006 | AC-G2-FR-006-01 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-006 | AC-G2-FR-006-02 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-006 | AC-G2-FR-006-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-06 target video check | first-frame and retention evidence require the existing video system | NOT_RUN; target video system and ≥30-day retention evidence unavailable | docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-007 | AC-G2-FR-007-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-007 | AC-G2-FR-007-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-007 | AC-G2-FR-007-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-008 | AC-G2-FR-008-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-008 | AC-G2-FR-008-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-008 | AC-G2-FR-008-03 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-009 | AC-G2-FR-009-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-009 | AC-G2-FR-009-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-009 | AC-G2-FR-009-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-010 | AC-G2-FR-010-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-010 | AC-G2-FR-010-02 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-010 | AC-G2-FR-010-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-011 | AC-G2-FR-011-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-011 | AC-G2-FR-011-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-011 | AC-G2-FR-011-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-012 | AC-G2-FR-012-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-012 | AC-G2-FR-012-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-012 | AC-G2-FR-012-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-013 | AC-G2-FR-013-01 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | mounted Web form creates a PostgreSQL incident with a traceable incident number | status=PENDING_VERIFICATION; created_by=commander; incident_no matches INC-* | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-013 | AC-G2-FR-013-02 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | among five PostgreSQL incidents, combined time, status, type and keyword filters retain the one full match and exclude four single-condition near misses | database total=5; filtered total=1; matching id returned; status/type/keyword/time near-miss ids all excluded | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-013 | AC-G2-FR-013-03 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | invalid Bearer identity is rejected with reason, creates no incident and records denied audit | HTTP 403 AUTH_FORBIDDEN; incident count unchanged; denied audit count=1 | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-014 | AC-G2-FR-014-01 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | verification stores decision, reason, actor, time and changes incident state | decision=VERIFIED; reason and actor persisted; occurred_at present | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-014 | AC-G2-FR-014-02 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL_WITH_SIMULATED_MESSAGE | core positive and negative system flow | verified incident enters responding state and links the published plan and generated task | incident.status=RESPONDING; plan_version_id=plan-system-v1; task persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-014 | AC-G2-FR-014-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-02 and PE-01/03 local measurements | local routes were measured but target alert/task channels were simulated | alert P99=14.443ms; start-response P99=2.331ms; target channels NOT_RUN | evidence/g5/G5-02/performance-raw.json<br>docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-015 | AC-G2-FR-015-01 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL_WITH_SIMULATED_MESSAGE | core positive and negative system flow | generated task persists event, assignee, deadline, status and delivery receipt | incident_id, assignee_ref, deadline_at, PENDING and ACCEPTED persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-015 | AC-G2-FR-015-02 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | accepted task feedback persists content, attachment, time and processing status | content, file-system-1, occurred_at and IN_PROGRESS persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-015 | AC-G2-FR-015-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-016 | AC-G2-FR-016-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-016 | AC-G2-FR-016-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-016 | AC-G2-FR-016-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-017 | AC-G2-FR-017-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-017 | AC-G2-FR-017-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-017 | AC-G2-FR-017-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-018 | AC-G2-FR-018-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-018 | AC-G2-FR-018-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-018 | AC-G2-FR-018-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-019 | AC-G2-FR-019-01 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-019 | AC-G2-FR-019-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-019 | AC-G2-FR-019-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-020 | AC-G2-FR-020-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-020 | AC-G2-FR-020-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-020 | AC-G2-FR-020-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-04 simulated message concurrency | 20-way simulated channel result cannot replace the normal acceptance channel | 20/20 accepted; 100%; 0.065ms; acceptance channel NOT_RUN | evidence/g5/G5-02/performance-raw.json<br>docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-021 | AC-G2-FR-021-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-021 | AC-G2-FR-021-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-021 | AC-G2-FR-021-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-022 | AC-G2-FR-022-01 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | mounted H5 page acknowledges the task and PostgreSQL records state and audit trail | task.status=ACKNOWLEDGED; TASK_ACKNOWLEDGED allowed audit persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-022 | AC-G2-FR-022-02 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL | core positive and negative system flow | formal H5 workflow feedback associates task, upload result and time in PostgreSQL | task_id, attachment_file_ids=[file-system-1] and occurred_at persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-022 | AC-G2-FR-022-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-04 simulated message concurrency | task completion passed locally, while delivery-rate acceptance remains external | 20/20 accepted on simulated channel; acceptance channel NOT_RUN | evidence/g5/G5-02/performance-raw.json<br>docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-023 | AC-G2-FR-023-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-023 | AC-G2-FR-023-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-023 | AC-G2-FR-023-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-024 | AC-G2-FR-024-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-024 | AC-G2-FR-024-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-024 | AC-G2-FR-024-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-09 local check-in API measurement | local API is below one second but real QR/location/H5 host was not executed | local API P99=3.697ms; real scan/H5 host NOT_RUN | evidence/g5/G5-02/performance-raw.json<br>docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-025 | AC-G2-FR-025-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-025 | AC-G2-FR-025-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-025 | AC-G2-FR-025-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-026 | AC-G2-FR-026-01 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-026 | AC-G2-FR-026-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-026 | AC-G2-FR-026-03 | BLOCKED | PARTIAL_LOCAL_MEASUREMENT_TARGET_EVIDENCE_MISSING | G5-02 PE-10 target security refresh check | refresh timing requires the target security/information-publishing chain | NOT_RUN; target security refresh chain unavailable | docs/work/B_TECH/g5_technical_validation.md | 保留本地实测值但不提升为PASS；G5-02本地证据整改已由C复验接受，但目标环境/真实通道仍缺失。 |
| G2-FR-027 | AC-G2-FR-027-01 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-027 | AC-G2-FR-027-02 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-027 | AC-G2-FR-027-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-028 | AC-G2-FR-028-01 | PASS | SYSTEM_WEB_H5_HTTP_POSTGRESQL_WITH_IDENTITY_SEAM | core positive and negative system flow | platform context grants configured permissions while invalid identity is denied and audited | authenticated context; invalid token HTTP 403; denied audit persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-028 | AC-G2-FR-028-02 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-028 | AC-G2-FR-028-03 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-029 | AC-G2-FR-029-01 | BLOCKED | BLOCKED_TARGET_OR_SPECIALTY_EVIDENCE | N/A | N/A | N/A | N/A | 现有套件没有满足该AC所需的目标环境、真实外部通道或专项测量证据；等待G5-02或外部资源。 |
| G2-FR-029 | AC-G2-FR-029-02 | PASS | SYSTEM_WEB_HTTP_POSTGRESQL_WITH_SIMULATED_ACCESS_INTERLOCK | remaining MVP workbenches and confirmed access control | no command is sent before confirmation; confirmed UI action dispatches once and waits for interlock receipt before accepting | pre-confirm calls=0; post-confirm calls=1; interlock=ALLOWED; command.status=ACCEPTED persisted | frontend/tests/postgresql-system-e2e.test.ts<br>evidence/g5/G5-01/functional-gate-raw.json | 判定仅覆盖所列断言；模拟端口或内存持久化边界不外推为真实甲方环境/数据库验收。 |
| G2-FR-029 | AC-G2-FR-029-03 | NOT_RUN | NOT_RUN_NO_AC_LEVEL_ASSERTION | N/A | N/A | N/A | N/A | 现有套件存在相关代码覆盖或局部路径，但没有足以判定本AC完整通过的逐项断言；不得由套件总绿推导PASS。 |
| G2-FR-030 | AC-G2-FR-030-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-030 | AC-G2-FR-030-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-030 | AC-G2-FR-030-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-031 | AC-G2-FR-031-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-031 | AC-G2-FR-031-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-031 | AC-G2-FR-031-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-032 | AC-G2-FR-032-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-032 | AC-G2-FR-032-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-032 | AC-G2-FR-032-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-033 | AC-G2-FR-033-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-033 | AC-G2-FR-033-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-033 | AC-G2-FR-033-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-034 | AC-G2-FR-034-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-034 | AC-G2-FR-034-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-034 | AC-G2-FR-034-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-035 | AC-G2-FR-035-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-035 | AC-G2-FR-035-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-035 | AC-G2-FR-035-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-036 | AC-G2-FR-036-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-036 | AC-G2-FR-036-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-036 | AC-G2-FR-036-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-037 | AC-G2-FR-037-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-037 | AC-G2-FR-037-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-037 | AC-G2-FR-037-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-038 | AC-G2-FR-038-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-038 | AC-G2-FR-038-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-038 | AC-G2-FR-038-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-039 | AC-G2-FR-039-01 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-039 | AC-G2-FR-039-02 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
| G2-FR-039 | AC-G2-FR-039-03 | BLOCKED | NOT_RUN_NOT_IMPLEMENTED | N/A | N/A | N/A | N/A | G5 scope preserves G2-FR-030—039 as backlog and forbids adding implementation; no executable path exists. |
