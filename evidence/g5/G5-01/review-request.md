# G5-01 A 第二轮整改复验请求（仅 003、004）

- 主责：C（任俊强）。
- 指定 Review：A（何思源 / @WhiteApricot）。
- Review 状态：`PENDING_A_REREVIEW_2`。
- 候选结论：`BLOCKED`，不得置 `DONE`。

针对 2026-10-09 A 复审仍未关闭的 003、004，C 已继续整改，请 A 核对：

1. 当前 11 PASS / 59 NOT_RUN / 47 BLOCKED、1/34★FR PASS 是否与逐 AC 数据一致；所有仅证明局部条件的旧 PASS 是否均已降回 NOT_RUN/BLOCKED；
2. `AC-G2-FR-029-02` 是否已由系统测试完整证明“确认前不发送；确认后单次下发；等待并持久化安全联锁回执”，而非仅证明未确认拒绝；
3. 新增 `postgresql-system-e2e.test.ts` 是否形成可复跑的 Web/H5 页面/正式客户端→HTTP→PostgreSQL 系统包，并覆盖核心正/反流程及剩余 MVP 正式工作台读取；
4. 系统包中的身份、消息和门禁联锁适配器是否仍如实标为测试缝/`SIMULATED_EVIDENCE`，未外推为甲方真实外部系统联调；
5. 其余缺测 AC、FR-030—039、兼容双版本、Android/iOS 宿主和 KN-039 是否继续阻止 G5-01 `DONE`。

`ISSUE-G5-01-005` 已由 A 关闭，本轮未修改其代码、截图、兼容矩阵或缺陷记录。

A 未留下新的独立复验结论前，本记录不冒充已审核；任务保持 `BLOCKED / PENDING_A_REREVIEW_2`。
