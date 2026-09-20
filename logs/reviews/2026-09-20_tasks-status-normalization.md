# tasks.md 状态列规范化迁移记录

- 日期：2026-09-20
- 执行任务：G3-13
- 规则：状态列仅保留 `TODO / DOING / REVIEW / DONE / BLOCKED`；原状态单元格的事实说明逐项原文保存在本记录，Git 历史继续保留。
- 边界：本次仅规范显示，不改变任何任务的实际阶段，不改变 Issue 状态、Review 结论、冻结 FR/AC/★或关键数字。

| Task ID | 规范化后状态 | 原状态单元格原文 |
|---|---|---|
| G3-01 | DONE | DONE / SUPERSEDED_BY_G3-01R |
| G3-06 | DONE | DONE（B 完成 V0.2 整改；A 整改后复核 PASS；C 符合性复核 PASS，独立审计 0 问题、独立 Word 渲染 23 页与 B 一致且竖向碎片 0，并由 C 验证关闭 `ISSUE-G3-06-001`；C 登记 3 项不阻断观察项（A 记录列宽引用值更正、标识符连字符断行、§8.3 端口口径）。`ISSUE-G3-01-001` 仍阻断视频/消息真实外部契约冻结与 M3 最终冻结；冻结前若再次修改 14/15 号交付物须重新触发 A/C 复核） |
| G3-07 | DONE | DONE（2026-09-18 用户最终准出授权；`ISSUE-G3-07-001/002` 均 CLOSED；A/C Review PASS；ADR-001/002 已 Accepted，PE-01—12、ENG-001—020、39 FR/117 AC/34★、责任边界与未验证事项经最终机械自检无漂移。`ISSUE-G3-01-001` 对真实视频/消息外部证据与 M3 的既有阻断不变） |
| G3-08 | DONE | DONE（2026-09-19 C 主责整改与符合性复验 PASS、B 独立技术复核 PASS；39 FR/34★/117 AC 与 DBD/DLD/API-TR 39/39 双向追踪、57 项 OpenAPI 操作及 G2-RCLR-001—010 均通过机械复验；正式件 10 已按 Reference 26 物理模板同步并完成 12 页逐页视觉 QA；`ISSUE-G3-08-001—007` 均关闭。`ISSUE-G3-01-001` 保持 OPEN，继续阻断真实视频/消息外部契约冻结与 G3-10/M3 最终冻结） |
| G3-09 | DONE | DONE（2026-09-19 A 对远程第二次整改最终单人复验 PASS：`ISSUE-G3-09-001/002` 均 CLOSED；39 FR/34★/117 AC/TC、PE-01—12、P0-01—08、复核主体、目录 7/8/8、表 8-1 可读性、图替代文本、证据边界和 11/11 页渲染均通过，无新增问题。仅表示测试计划与设计准出，尚未执行测试；`ISSUE-G3-01-001` 保持 OPEN，继续阻断真实视频/消息联调结论及 G3-10/M3 最终冻结） |
| G3-10 | BLOCKED | BLOCKED（2026-09-19 A 已完成当前 G3-02—09 候选成果的一致性机械审计，39 FR/34★/117 AC/TC、10 RCLR、DBD/DLD/API-TR 39/39、57 项 OpenAPI、PE-01—12、ENG-001—020及 ADR Accepted 均通过；但 `ISSUE-G3-01-001` 仍 OPEN，且 `plan.md` 的 M3 门禁要求 G3-11—14 至少 REVIEW；当前 G3-11 已进入 REVIEW，G3-12—14 仍为 TODO。未创建 FROZEN 基线，见 `ISSUE-G3-10-001` 与 `M3-G3-10-FREEZE-BLOCKED.md`） |
| G3-11 | DONE | DONE（2026-09-20 C 最终复验 ACCEPTED：A 已删除重复目录标题，Microsoft Word 16 最终分页为 8 页，第 10 章目录标注与正文均为逻辑第 5 页；用户确认第 5 页为正式口径。修订仅删除重复目录标题及候选状态提示，39 FR/34★/117 AC、29+10 范围、责任边界与 AC-G2-FR-015-03 未改变，无障碍审计 0 项。`ISSUE-G3-11-001` 已 CLOSED / VERIFIED_BY_C；LibreOffice 分页差异仅作非阻断观察。`ISSUE-G3-01-001`、`ISSUE-G3-10-001` 仍 OPEN，M3 尚未冻结） |
| G3-12 | DONE | DONE（2026-09-20 B 独立复核 PASS / ACCEPTED：评审、缺陷、度量、阶段门禁和 PE-01—12 证据口径与 G3-07/G3-09 及受控数字一致；39 FR、34★、117 AC、102 个★AC及关键 NFR 口径无漂移。B 对当前正式件 SHA-256 `0b278b3a4f232bc6a8215e05e312faf8a3aa539d4efbedf0efcb944bdabd9c01` 独立渲染并逐页检查 8/8 页，无障碍审计 high/medium/low 均为 0，无 BLOCKER/MAJOR/MINOR/OBSERVATION。`ISSUE-G3-01-001`、`ISSUE-G3-10-001` 保持 OPEN，M3 仍不得冻结） |

- 迁移条目数：8。
- 校验：全部任务状态单元格均属于允许集合。
