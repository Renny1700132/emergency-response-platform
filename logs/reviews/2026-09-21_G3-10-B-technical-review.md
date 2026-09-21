# G3-10 B 技术复核记录

- Task：G3-10
- 复核人：B（技术口径）
- 被复核提交：`778ff16666ae303aba406401fed704e460d7a7f6`
- 被复核对象：`docs/work/A_PM/g3_m3_review_pack.md`、`scripts/audit_g3_10_m3.py`、`logs/reviews/2026-09-21_G3-10-M3-reaudit.json`
- 结论：**CHANGES_REQUIRED / NOT_READY_TO_FREEZE**

## 1 通过项

1. 独立复跑 A 的脚本得到 39 FR、34★、117 AC/TC、10 RCLR、DBD/DLD/API-TR 各 39、57 个且唯一的 OpenAPI operationId，ADR-001/002 为 Accepted；脚本自身覆盖范围内结果可复现。
2. `SIMULATED_OWNER_CONFIRMATION` 明确使用 `.example` 保留域并声明课程模拟性质，可作为 `ISSUE-G3-01-001` 关闭条件中的“明确替代验收裁决”输入；其结论不得解释为真实接口、真实账号、真实现场或生产环境已经验证。
3. G3-11—14 在 `tasks.md` 中均为 DONE，管理计划正式件 20—23 均存在，相应复核记录也存在。

## 2 阻断问题

### B-FINDING-G3-10-001（BLOCKER）

- 位置：`scripts/audit_g3_10_m3.py` 的 `candidate_files`、`review_patterns`、blocker 计算；`docs/work/A_PM/g3_m3_review_pack.md` §2、§3、§7。
- 事实：审计清单只包含 G3-02—09 的工作稿、10—19 号正式件及 G3-02—09 Review；没有纳入 G3-11—14 工作稿、20—23 号正式件和 G3-11—14 Review。脚本也没有检查 `ISSUE-G3-10-001` 是否仍为 `OPEN / BLOCKING`，因此能在本 Issue 尚未关闭时输出 `freeze_ready=true`。
- 文档矛盾：评审包 §1/§5 已写 G3-11—14 DONE、模拟裁决已取得，§2/§3/§7 却仍写四项 TODO/未生成、等待裁决及补齐 ISSUE-G3-01-001，无法作为一致的冻结决定依据。
- 技术影响：当前审计只能证明其既有子集一致，不能证明 M3 全量配置项与复核证据齐套，也不能支持工程基线冻结。
- 修复责任：A。
- 关闭条件：A 扩展审计覆盖 G3-11—14 工作稿、20—23 正式件及 Review，纳入 `ISSUE-G3-10-001` 门禁，修正评审包过期段落并重新产生审计；B/C 复核通过后才可关闭 Issue 和冻结。

## 3 技术结论

`ISSUE-G3-01-001` 可按 **VERIFIED_BY_B_AND_C / SIMULATED_ONLY** 关闭其课程模拟替代裁决分支，但真实外部接口与现场能力仍未被证明。由于全量审计范围和冻结门禁存在 BLOCKER，G3-10 必须保持 REVIEW，不得建立 FROZEN 基线或置 DONE。

## 4 验证记录

- 首次用系统默认 `python` 复跑失败：环境缺少 `python-docx`；该结果未被写成通过。
- 改用工作区依赖清单提供的 Python 后，A 脚本退出码为 0，并再次输出 `freeze_ready=true`；该复现同时证明脚本缺失全量门禁，而不是解除本 Review 的阻断。
- 一次 `rg` 通配符调用因 PowerShell 未展开而失败，随后改用 `Get-ChildItem` 枚举复核文件完成检查。
