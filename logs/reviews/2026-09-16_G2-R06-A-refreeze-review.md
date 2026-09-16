# G2-R06 A｜M2返工复审与重新冻结自检

- 日期：2026-09-16
- 主责：A
- 前置：G2-R05 DONE；B/C最终再复核PASS
- 结论：CONDITIONAL PASS / PENDING B_C INDEPENDENT REVIEW

## 1 复审范围

复审输入为最新SRS、`spec.md`、RTM、G2-RCLR-001—010、G2-R04图表QA、G2-R05一致性PASS、受控facts/key_numbers/issues。未修改B主责spec、C主责RTM/澄清或07—10正式交付件的业务内容。

## 2 教师五类问题

| Issue | A复审结论 | 证据摘要 |
| --- | --- | --- |
| G2-R01-001 | PASS / CLOSED | 旧12条为G1继承索引；G2-RCLR-001—010已形成并完成四份材料10/10映射 |
| G2-R01-002 | PASS / CLOSED | R04题注审计、内容冻结、44页渲染及B/C最终复核均PASS |
| G2-R01-003 | RESOLVED / PENDING B/C | 6个流程、6组状态，覆盖异常/边界并与AC追踪一致 |
| G2-R01-004 | RESOLVED / PENDING B/C | 15个实体/实体组、五列需求级字段字典，非物理库表 |
| G2-R01-005 | RESOLVED / PENDING B/C | PE-01—12及容量、可靠性、安全、兼容、维护/测试要求可定位，保持待验证属性 |

## 3 机械复验

执行`scripts/audit_g2_r05_consistency.py`与`scripts/audit_g2_r04_captions.py`。结果如下：

- SRS/spec/RTM均为连续39条G2-FR；
- spec为117条唯一AC；
- SRS/spec/RTM/澄清记录的G2-RCLR-001—010均无缺失；
- SRS需求表计数为34条★；
- SRS/spec/RTM引用的KN全部可在`control/key_numbers.md`定位，未知KN为0；
- 07—10题注审计均PASS；
- 受控口径仍为29条MVP Must加10条非MVP、本期，责任和验收强度未改变。

首次附加★计数检查因PowerShell向Python标准输入传递星号时发生字符替换，产生40条的错误统计并触发断言；该失败没有修改业务产物。改用ASCII Unicode转义后，唯一★FR为34条，非★为G2-FR-007、030、032、033、038，与B/C既有复核一致。

首次候选基线指纹复验因PowerShell标准输入替换中文DOCX路径而在第5个文件读取前失败；该失败未修改文件。改用`07-`—`10-`前缀发现实际文件后，8/8个工作稿/正式件的Git blob与SHA-256均和候选基线清单一致。

## 4 ISSUE-G3-01-001

该Issue保持OPEN。仓库仍没有视频与统一消息真实环境/账号、接口版本或字段、认证、脱敏请求响应/回执、失败场景和连通结论。候选基线明确排除真实外部契约和现场指标通过结论；该Issue继续阻断G3-06外部接口冻结和G3-10/M3最终冻结。

## 5 冻结与任务状态

- 已形成`BASELINE-G2-M2-R1.0`重新冻结候选，状态为`REFREEZE_CANDIDATE / PENDING_B_C_REVIEW`；
- `G2-R06`更新为REVIEW；
- `G3-01R`更新为BLOCKED（等待G2-R06 DONE）；
- 未将R06、候选基线或G3-01R提前标记为DONE/FROZEN/解锁。

## 6 A侧结论

A未发现FR、★、AC、关键数字、责任、RCLR或追踪链漂移。五类教师问题均已有整改输入，其中后三类提交B/C在R06中独立复核。候选包可进入REVIEW，但只有B/C均PASS后才能正式重新冻结并解除G3-01R前置阻塞。
