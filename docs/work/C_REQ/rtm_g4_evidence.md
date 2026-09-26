# G4 研发增量追踪证据账

- 用途：在各 G4 单一功能 PR 中同步记录 Task、受控输入、实现/测试证据与 Review；合并记录以 Gitee PR 为证据，供 G4-11 最终补充合并提交哈希并完成 RTM v4 收口。
- 边界：本文件不替代 `docs/work/C_REQ/rtm_v1.md` 的 G3 冻结设计追踪，也不把工程护栏测试冒充业务 FR/AC 实现或验收证据。
- 状态：WORKING / APPEND-ONLY
- 单 PR 规则：功能、测试、本账、日志和 `tasks.md = DONE` 同 PR 提交；PR 创建后在同一分支补充 PR 编号和审核信息。除 G4-04 既有收口 PR 外，不再为 DONE 或合并提交哈希建立第二个 PR。

## 已合并任务

| Task | 需求/指标与设计挂接 | 实现与自检证据 | Review / Merge 证据 | 追踪结论 |
| --- | --- | --- | --- | --- |
| G4-01 | KN-043、KN-045；NFR-MNT-01；ENG-012、ENG-014、ENG-015、ENG-017；G4-01-DoD | `quality/selfcheck/G4-01.json`；`evidence/g4/G4-01/pass-evidence.json`；`evidence/g4/G4-01/block-evidence.json`；本地 `npm run quality` exit 0；覆盖率 statements/lines/functions 100%、branches 90%；OpenAPI 0 error/14 warning；npm vulnerabilities 0 | Gitee PR `!1`；唯一审核位 Review 1/1 完成；合并提交 `fc95b5201846e883b20d825f1fccfe88712be4c1`；源分支 `codex/g4-01-engineering-guards` → `master` | DONE / MERGED；工程门禁已可供后续 G4 任务复用。未声称任何 G2-FR 业务功能已实现；`ISSUE-G4-01-001` 保持 OPEN / NON_BLOCKING。 |
| G4-02 | KN-043、KN-045；ARCH-01/02/03；DBD §4.8；ENG-012/014/015/017；G4-02-DoD | `backend/`、`backend/migrations/`、`tests/backend/`、`quality/selfcheck/G4-02.json`；实现提交 `d116ba5`；A 独立复跑 `npm run quality`：G4 tests 11/11、backend tests 6/6，后端覆盖率 statements/lines 94.77%、branches 93.93%、functions 93.75%，OpenAPI 0 error/14 个既有 warning，npm vulnerabilities 0 | Gitee PR `!5`；唯一审核人 A（`WhiteApricot`）Review/Approve；普通 merge 提交 `8bb19ee4572a48442e559ccbe2cb6b9c186c53f8`；源分支 `codex/g4-02-backend-foundation` → `master`；审核证据归档于 `logs/reviews/2026-09-23_G4-02-A-review.md` | DONE / MERGED；`ISSUE-G4-02-001/002` 均由 B 修复并经 A 验证关闭；未将 Prototype 存储视为正式实现。 |
| G4-04 | G2-FR-006/020/021/027/028/029；KN-064；NFR-COMP-01；MOD-INTEGRATION/MOBILE；ARCH-04；DLD-TR-006/020/021/027/028/029；ADR-002；ENG-017/018；G4-04-DoD | `simulated-integrations/`；`tests/g4/integration-simulator.test.mjs`；`quality/selfcheck/G4-04.json`；`evidence/g4/G4-04/simulated-fixture-evidence.json`；本地 `npm run quality` exit 0；11/11 tests；coverage 96.75/81.63/90/96.75%；OpenAPI 0 error/14 个既有 warning；秘密扫描 23 文件 PASS；npm vulnerabilities 0 | Gitee PR `!3`；唯一审核人 B 独立复核 PASS，复核提交 `1fc48464f3a004973bcfcd42388f999f1867351e`；合并提交 `3233849`；源分支 `codex/g4-04-simulated-integrations` → `master` | DONE / MERGED；全部为 `SIMULATED_EVIDENCE`，不证明真实接口、账号、现场网络、生产连通或性能验收。 |
| G4-05 | G2-FR-013（AC-01、03）；G2-FR-014（AC-01、02）；G2-FR-015（AC-01、02）；G2-FR-016（AC-01）；G2-FR-022（AC-01、02）；G2-FR-028（AC-01）；MOD-EVENT/TASK/PLATFORM；ARCH-02；DLD/DBD/API-TR-013/014/015/016/022/028；ENG-015/017 | `backend/src/database.mjs`、`event-workflow.mjs`、`server.mjs`、`event-persistence.mjs`、`idempotency.mjs`、`identity.mjs`、`middle-platform-port.mjs`、`message-port.mjs`；`backend/migrations/002_event_workflow.*.sql`；后端与 PostgreSQL 集成测试；`quality/selfcheck/G4-05.json` | Gitee PR `!13` 经 A Review/Approve 后合并为 `70b5a9f`；集成修复 PR `!14` 经 A Review/Approve 后合并为 `f3a83c8`；复核证据 `logs/reviews/2026-09-25_G4-05-A-rereview.md`、`logs/reviews/2026-09-26_G4-05-A-pr14-review.md`；G4-07 非 Mock E2E 与 PostgreSQL 复验通过 | DONE / MERGED；冻结契约、数据库恢复、事务原子性、页面必需路由、Bearer 授权及失败降级已有证据；外部消息和中台仍为 `SIMULATED_EVIDENCE`。 |
| G4-06 | PARTIAL：G2-FR-013/014/015/021/022；MOD-EVENT/TASK/MOBILE；DLD-TR-013/014/015/021/022。已实现上报/核实/启动、任务接收/反馈/完成/催办/临时任务及 H5 上传重试；组合检索等后续范围继续受控追踪 | `IncidentFlowView.vue`、`TaskFlowView.vue`、`PlatformAttachmentField.vue`、`workflow.ts`；组件/交互测试及 `quality/selfcheck/G4-06.json`；C 最终复验通过 | Gitee PR `!10`；唯一审核人 C Review/Approve；合并提交 `9c73112`；审核记录 `logs/reviews/2026-09-24_G4-06-C-final-review.md`；真实前后端闭环由 G4-07 非 Mock E2E 补充验证 | DONE / MERGED；组件/交互门禁与 Sprint 1 真实接线均已有证据；不扩大为全部 FR、真实外部中台或目标环境性能完成。 |

## 待审核任务

| Task | 需求/指标与设计挂接 | 实现与自检证据 | Review / Merge 证据 | 追踪结论 |
| --- | --- | --- | --- | --- |
| G4-07 | G4-05/G4-06 Sprint 1 集成准出；G2-FR-013/014/015/016/021/022；KN-045；ENG-015/017。KN-006/007/011/012 目标环境实测不在本任务冒充完成，保留至 G4-10/验收 | `frontend/tests/real-stack-e2e.test.ts`：真实 Vue 页面 + 正式 API Client + Bearer + 实际后端 HTTP Server，完成事件上报/核实/启动、任务接收/反馈/完成、事件关闭及 403；最终 `npm run quality`：frontend 28/28，覆盖率 95.41/77.55/95.12/100%，G4 11/11，backend 16/16，后端覆盖率 85.88/78.24/80.48/85.88%，OpenAPI 0 error/14 warning，秘密扫描 56 files PASS，漏洞 0；PostgreSQL 18 专项 2/2 PASS | Gitee PR `!15`；B 首轮审核 HEAD `758db48` 为 `CHANGES_REQUIRED`；C 整改/回填 `d381ba4`、`d974bb6`；B 在 HEAD `d974bb6` 复验通过并关闭 `ISSUE-G4-07-004`，记录 `logs/reviews/2026-09-26_G4-07-B-rereview.md` | DONE CANDIDATE / B REREVIEW PASS / ACCEPTED_FOR_APPROVAL；待 B 在平台 APPROVE 并由 PR Merge 进入 `master`；外部身份、文件、消息仍为 SIMULATED_EVIDENCE，不声明甲方真实环境或性能验收完成。 |

## 维护规则

1. 开发中任务只进入“待审核任务”；仅在对应 PR 已由 `tasks.md` 指定唯一审核人 Approve 并 Merge 后移入“已合并任务”。
2. 记录实际 commit、命令和结果；失败、warning、未测项不得省略或包装为通过。
3. 最终 RTM v4 由 G4-11 主责 A 汇总；本证据账只提供已核验增量输入。
