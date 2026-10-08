# RTM v4（第四关最终追踪矩阵）

- 基线：`BASELINE-G3-M3-R1.0`（只读设计输入）。
- MVP：G2-FR-001—029；执行明细见 `evidence/g4/G4-10/mvp-87-ac-matrix.md`。
- 外部八端口、GIS、H5：课程模拟证据标记 `SIMULATED_EVIDENCE`，不等同生产联调。
- 状态：G4-09—G4-11 候选证据已完成，待 C 在 PR !16 独立复核。

## MVP 双向追踪

| 需求 | AC | 实现/测试证据 | 结果 |
|---|---|---|---|
| G2-FR-001 | AC-G2-FR-001-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） | PASS（3/3） |
| G2-FR-002 | AC-G2-FR-002-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） | PASS（3/3） |
| G2-FR-003 | AC-G2-FR-003-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（预案分层、版本、发布） | PASS（3/3） |
| G2-FR-004 | AC-G2-FR-004-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 | PASS（3/3） |
| G2-FR-005 | AC-G2-FR-005-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 | PASS（3/3） |
| G2-FR-006 | AC-G2-FR-006-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 | PASS（3/3） |
| G2-FR-007 | AC-G2-FR-007-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + 正式资源/态势工作台 | PASS（3/3） |
| G2-FR-008 | AC-G2-FR-008-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） | PASS（3/3） |
| G2-FR-009 | AC-G2-FR-009-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（盘点快照、提交、复核） | PASS（3/3） |
| G2-FR-010 | AC-G2-FR-010-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） | PASS（3/3） |
| G2-FR-011 | AC-G2-FR-011-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） | PASS（3/3） |
| G2-FR-012 | AC-G2-FR-012-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（演练下发、提交、评估） | PASS（3/3） |
| G2-FR-013 | AC-G2-FR-013-01—03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 | PASS（3/3） |
| G2-FR-014 | AC-G2-FR-014-01—03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 | PASS（3/3） |
| G2-FR-015 | AC-G2-FR-015-01—03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 | PASS（3/3） |
| G2-FR-016 | AC-G2-FR-016-01—03 | `frontend/tests/real-stack-e2e.test.ts` + PostgreSQL 集成测试 | PASS（3/3） |
| G2-FR-017 | AC-G2-FR-017-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） | PASS（3/3） |
| G2-FR-018 | AC-G2-FR-018-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） | PASS（3/3） |
| G2-FR-019 | AC-G2-FR-019-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） | PASS（3/3） |
| G2-FR-020 | AC-G2-FR-020-01—03 | `tests/backend/g4-08-sprint2.test.mjs`（值班/签到/告警/幂等） | PASS（3/3） |
| G2-FR-021 | AC-G2-FR-021-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 | PASS（3/3） |
| G2-FR-022 | AC-G2-FR-022-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 | PASS（3/3） |
| G2-FR-023 | AC-G2-FR-023-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 | PASS（3/3） |
| G2-FR-024 | AC-G2-FR-024-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 | PASS（3/3） |
| G2-FR-025 | AC-G2-FR-025-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + Web/H5 正式入口 | PASS（3/3） |
| G2-FR-026 | AC-G2-FR-026-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） | PASS（3/3） |
| G2-FR-027 | AC-G2-FR-027-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） | PASS（3/3） |
| G2-FR-028 | AC-G2-FR-028-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） | PASS（3/3） |
| G2-FR-029 | AC-G2-FR-029-01—03 | `tests/backend/g4-08-sprint2.test.mjs` + `tests/g4/integration-simulator.test.mjs`（SIMULATED_EVIDENCE） | PASS（3/3） |

## 非 MVP 保全

| 需求 | 状态 | 处置 |
|---|---|---|
| G2-FR-030 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-031 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-032 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-033 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-034 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-035 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-036 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-037 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-038 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |
| G2-FR-039 | BACKLOG_PRESERVED | 未纳入第四关 MVP 准出；需求原文与 G3 冻结设计保持不变 |

## 反向索引

- 正式前端：`frontend/src/views`、`frontend/src/features/formal/module-workbench.ts` → G2-FR-001—029。
- 正式后端：`backend/src/event-workflow.mjs`、`backend/src/sprint2-service.mjs` → G2-FR-001—029。
- 数据库：迁移 001—003、PostgreSQL up/down/re-up 与恢复测试 → 事件、任务、预案、物资、演练、签到、外部调用。
- 最终门禁：`npm run quality`、`npm run verify:g4-final`、PostgreSQL 专项 → 87 AC、覆盖率、安全、契约、E2E、性能、故障演练。
