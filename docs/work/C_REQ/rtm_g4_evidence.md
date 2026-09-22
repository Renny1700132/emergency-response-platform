# G4 研发增量追踪证据账

- 用途：在各 G4 PR 合并后增量记录 Task、受控输入、实现/测试证据、Review 与 Merge；供 G4-11 最终 RTM v4 收口使用。
- 边界：本文件不替代 `docs/work/C_REQ/rtm_v1.md` 的 G3 冻结设计追踪，也不把工程护栏测试冒充业务 FR/AC 实现或验收证据。
- 状态：WORKING / APPEND-ONLY

## 已合并任务

| Task | 需求/指标与设计挂接 | 实现与自检证据 | Review / Merge 证据 | 追踪结论 |
| --- | --- | --- | --- | --- |
| G4-01 | KN-043、KN-045；NFR-MNT-01；ENG-012、ENG-014、ENG-015、ENG-017；G4-01-DoD | `quality/selfcheck/G4-01.json`；`evidence/g4/G4-01/pass-evidence.json`；`evidence/g4/G4-01/block-evidence.json`；本地 `npm run quality` exit 0；覆盖率 statements/lines/functions 100%、branches 90%；OpenAPI 0 error/14 warning；npm vulnerabilities 0 | Gitee PR `!1`；唯一审核位 Review 1/1 完成；合并提交 `fc95b5201846e883b20d825f1fccfe88712be4c1`；源分支 `codex/g4-01-engineering-guards` → `master` | DONE / MERGED；工程门禁已可供后续 G4 任务复用。未声称任何 G2-FR 业务功能已实现；`ISSUE-G4-01-001` 保持 OPEN / NON_BLOCKING。 |

## 待审核任务

| Task | 需求/指标与设计挂接 | 实现与自检证据 | Review / Merge 证据 | 追踪结论 |
| --- | --- | --- | --- | --- |
| G4-04 | G2-FR-006/020/021/027/028/029；KN-064；NFR-COMP-01；MOD-INTEGRATION/MOBILE；ARCH-04；DLD-TR-006/020/021/027/028/029；ADR-002；ENG-017/018；G4-04-DoD | `simulated-integrations/`；`tests/g4/integration-simulator.test.mjs`；`quality/selfcheck/G4-04.json`；`evidence/g4/G4-04/simulated-fixture-evidence.json`；本地 `npm run quality` exit 0；11/11 tests；coverage 96.75/81.63/90/96.75%；OpenAPI 0 error/14 个既有 warning；秘密扫描 23 文件 PASS；npm vulnerabilities 0 | 功能分支 `codex/g4-04-simulated-integrations`；唯一审核人 B；PR/APPROVE/Merge 待完成 | PENDING_REVIEW；全部为 `SIMULATED_EVIDENCE`，不证明真实接口、账号、现场网络、生产连通或性能验收。 |

## 维护规则

1. 开发中任务只进入“待审核任务”；仅在对应 PR 已由 `tasks.md` 指定唯一审核人 Approve 并 Merge 后移入“已合并任务”。
2. 记录实际 commit、命令和结果；失败、warning、未测项不得省略或包装为通过。
3. 最终 RTM v4 由 G4-11 主责 A 汇总；本证据账只提供已核验增量输入。
