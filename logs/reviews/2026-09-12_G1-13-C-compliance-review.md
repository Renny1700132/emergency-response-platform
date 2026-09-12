# G1-13 C FR、★、PE、数字与边界复核记录

- Task：G1-13《需求确认书》
- 主责：A
- 复核人：C（FR/★/PE、数字与边界）
- 被复核文件：`docs/work/A_PM/requirements_confirmation.md`、`docs/deliverables/05-需求确认书.docx`
- A 候选稿提交：`e45d62da272680725f4d74a96feae3e23f2a08a2`
- 冻结基线：`control/baselines/BASELINE-G1-V0.1.md`
- 结论：`CHANGES_REQUIRED`

## 1. 检查范围与 Preflight

依据 facts、key_numbers、compliance_matrix、DEC-001—012、冻结基线及已通过的 G1-09—G1-12 结论执行双向抽查。未发现需改变 P1 事实的冲突，未读取课程课件。

## 2. 检查结果

| 检查项 | 结果 | 证据与结论 |
| --- | --- | --- |
| 项目与身份边界 | PASS | 项目名称、某自然博物馆匿名口径、课程模拟性质和待人工确认签署信息均正确；未虚构主体或法律效力。 |
| 39 条 FR 范围 | ISSUE | 全部 39 条 FR 虽均能在 MVP 或非 MVP 列表定位，但 FR-02.4、FR-03.3、FR-03.4 的分区与 MVP-2/MVP-3 功能描述互相冲突，见 ISSUE-G1-13-001。 |
| ★条款 | PASS | MVP 表内 FR 星级标记与 facts/compliance_matrix 抽查一致；FR-02.3 整体★、内部“宜支持”子句及其他强制回放依据层级正确，未发现★弱化。 |
| PE 与数字 | PASS | PE-01—PE-12 在正式 Word 均可定位；≤3秒、≤2秒、≤3分钟、≥20路、≥99%、亚米级、≤30秒、≤60秒、≥100、≤5秒、≥70%、≥99.5%、≤2小时、≥30天等抽查均与 key_numbers 一致。 |
| 验收底线 | PASS | 全 FR 用例、通过率 100%、四系统端到端联动、至少一次联合演练、高危清零和非乙方人员干净环境一次部署成功均保留。 |
| 责任与排除项 | PASS | DEC-001—012 的甲乙责任、范围外系统本体与范围内接口责任区分清楚；课程模拟澄清未覆盖 P1 强制要求。 |
| 内部语言与案例污染 | PASS | 正式 Word 未检出 BASELINE、G1-09—G1-12、control、compliance_matrix、key_numbers、REVIEW/DONE 或教学案例项目事实。 |
| Markdown/Word 一致性 | PASS | 核心内容、表格、数字、边界和占位信息一致；Word 5 页逐页视觉检查通过。 |

## 3. 准出结论

C 结论为 `CHANGES_REQUIRED`：1 项 MAJOR / BLOCKING_G1-13_EXIT。A 应先消除 MVP 功能描述、FR 分区、直接依赖和验收对象之间的冲突；B、C 复验前，G1-13 保持 `REVIEW`，不得更新为 DONE，也不得启动 G1-14。
