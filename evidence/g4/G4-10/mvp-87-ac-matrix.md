# G4-10 MVP 验证矩阵（29 FR / 87 AC）

- 执行时间：2026-10-08
- 范围：仅 G2-FR-001—029；G2-FR-030—039 保持 backlog。
- 汇总：PASS 87 / FAIL 0 / BLOCKED 0。
- 外部端口、GIS、H5 相关证据均明确为 `SIMULATED_EVIDENCE`，不代表生产联调。

| AC | 结果 | 可观察验收条件 | 执行证据 |
|---|---|---|---|
| AC-G2-FR-001-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-001-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-001-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-002-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-002-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-002-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-003-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-003-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-003-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） |
| AC-G2-FR-004-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-004-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-004-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-005-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-005-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-005-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-006-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-006-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-006-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-007-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-007-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-007-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 |
| AC-G2-FR-008-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） |
| AC-G2-FR-008-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） |
| AC-G2-FR-008-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） |
| AC-G2-FR-009-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） |
| AC-G2-FR-009-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） |
| AC-G2-FR-009-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） |
| AC-G2-FR-010-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-010-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-010-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-011-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-011-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-011-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-012-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-012-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-012-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） |
| AC-G2-FR-013-01 | PASS | 01 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-013-02 | PASS | 02 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-013-03 | PASS | 03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-014-01 | PASS | 01 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-014-02 | PASS | 02 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-014-03 | PASS | 03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-015-01 | PASS | 01 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-015-02 | PASS | 02 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-015-03 | PASS | 03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-016-01 | PASS | 01 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-016-02 | PASS | 02 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-016-03 | PASS | 03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 |
| AC-G2-FR-017-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-017-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-017-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-018-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-018-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-018-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-019-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-019-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-019-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-020-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-020-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-020-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） |
| AC-G2-FR-021-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-021-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-021-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-022-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-022-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-022-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-023-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-023-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-023-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-024-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-024-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-024-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-025-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-025-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-025-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 |
| AC-G2-FR-026-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-026-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-026-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-027-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-027-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-027-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-028-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-028-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-028-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-029-01 | PASS | 01 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-029-02 | PASS | 02 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
| AC-G2-FR-029-03 | PASS | 03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） |
