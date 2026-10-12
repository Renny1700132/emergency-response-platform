# G6-01 B 整改与 A 复验申请

- 日期：2026-10-12
- 整改候选：`75f01c3bb33369d3785acf69a3a00eb983aa188b` 及其后的文档/证据提交
- 责任：B 整改；A 独立复验；ISSUE-G6-01-004 另待 C 对 G6-03 整体复核
- 结论：`REMEDIATED_BY_B / PENDING_A_REREVIEW`

## 1 问题逐项响应

| Issue | B 整改 | 验证 | 当前状态 |
| --- | --- | --- | --- |
| ISSUE-G6-01-001 | 增加正式事件关闭页面入口、权限、前置条件、结论/报告引用/关闭时间映射；正式其他工作台隐藏无后端写入口的按钮并标为查询能力；手册给出正常、409/422/403 路径 | `page-interactions.test.ts`、`real-stack-e2e.test.ts`；全量质量门禁 PASS | `REMEDIATED_BY_B / PENDING_A_REREVIEW` |
| ISSUE-G6-01-002 | 新建逐命令记录器；最终隔离运行 26/26 exit 0，逐条保存起止时间、命令、退出码、raw；三次真实失败和错误过滤失败保留 | `remediation-command-ledger.json`、`raw/remediation/steps/*` | `REMEDIATED_BY_B / PENDING_A_REREVIEW` |
| ISSUE-G6-01-003 | 完成前端构建/静态托管/同源代理、三服务 healthcheck、Compose 变量透传和宿主令牌注入说明；迁移支持 `--steps`/`--to`；实际执行停止写入、单步回退、重新应用、备份恢复及数据保持 | 26/26 PASS；3→2→3、37→13→37、哨兵 1→1、恢复 37/1、残留 0/0/0 | `REMEDIATED_BY_B / PENDING_A_REREVIEW` |
| ISSUE-G6-01-004 | V0.2 锁定 `75f01c3`；证明其包含 `8dbfbab`；明确旧截图与 V0.1 证据只属历史；B 对 H5 进度映射完成目标与全量测试 | `git merge-base --is-ancestor 8dbfbab 75f01c3` exit 0；workflow 测试及 quality PASS | `B_TECH_CONFIRMED / PENDING_C_G6_03_REVIEW_AND_A_REREVIEW` |

## 2 正式件同步

工作稿、DOCX 与 PDF 统一为 V0.2；继续继承 34/45 号 Pair 格式。当前用户手册补足关闭闭环和页面真实性，部署手册补足全栈、配置、身份、目标回退和逐命令证据。完成渲染 QA 后再交 A 复验。

## 3 不变边界

甲方六类真实系统仍为 0/6，KN-065 真实非乙方执行仍为 0；本次 B 本地隔离 PASS 不迁移为真实履约 PASS。B 不关闭 A 提出的问题，也不把 G6-01 标为 DONE。
