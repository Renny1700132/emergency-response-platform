# G5-01 A 第三轮整改复验请求（仅 003）

- 主责：C（任俊强）。
- 指定 Review：A（何思源 / @WhiteApricot）。
- Review 状态：`PENDING_A_REREVIEW_3`。
- 候选结论：`BLOCKED`，不得置 `DONE`。

针对 2026-10-09 A 再复审指出的 `AC-G2-FR-013-02` 单事件缺口，C 已继续整改，请 A 核对：

1. PostgreSQL 中是否实际存在 5 条事件：1 条满足全部组合条件，4 条分别仅在状态、类型、关键字、时间上不匹配；
2. 组合检索是否返回 `total=1` 和唯一匹配 ID，并明确排除四个近似反例 ID；忽略任一过滤条件时测试是否会失败；
3. `functional-gate-raw.json`、117 AC 矩阵、RTM 与摘要是否同步保留 11 PASS / 59 NOT_RUN / 47 BLOCKED、1/34★FR PASS 的当前判定；
4. 其余缺测 AC、FR-030—039、兼容双版本、Android/iOS 宿主和 KN-039 是否继续阻止 G5-01 `DONE`。

`ISSUE-G5-01-004/005` 已由 A 关闭，本轮未修改其已关闭范围。

A 未留下新的独立复验结论前，本记录不冒充已审核；任务保持 `BLOCKED / PENDING_A_REREVIEW_3`。
