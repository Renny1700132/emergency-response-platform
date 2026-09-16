# G2-R06 C 符合性复核

- 任务：G2-R06 M2返工复审与重新冻结
- 复核身份：C
- 复核日期：2026-09-16
- 候选提交：`9fc07e0`；A交付证据提交：`8c3008f`
- 结论：CONTENT PASS / OVERALL NOT ACCEPTED

## 通过项

1. G2-R05 已为 DONE，B/C 最终复核通过；G2-R06 的前置条件满足。
2. 独立复跑一致性审计：SRS/spec/RTM均覆盖连续39条G2-FR；spec为117条唯一AC；G2-RCLR-001—010在SRS、spec、RTM、澄清记录中均无缺失；29+10范围与34条★口径未漂移。
3. SRS引用的KN均可在`control/key_numbers.md`定位，未发现未知KN；甲方提供外部能力/环境/源数据、乙方负责适配与验证的责任边界未被改变。
4. `ISSUE-G2-R01-003`：SRS §3.6包含6个核心流程及异常/边界路径，§3.7包含6组状态模型，与spec/RTM同步状态一致。C符合性复核PASS。
5. `ISSUE-G2-R01-004`：SRS §5.2包含15个实体/实体组的五列需求级字段字典，明确不是数据库ER或物理表设计。C符合性复核PASS。
6. `ISSUE-G2-R01-005`：SRS第6章完整列示PE-01—12以及容量、可靠性/恢复、安全、兼容/易用、维护/可测性要求；现场指标保持待实测/待验证，没有误报为已通过。C符合性复核PASS。
7. 07—10题注审计证据仍为PASS；复看当前正式SRS最终17页渲染，未发现裁切、重叠、乱码、异常断表或题注分离。
8. `ISSUE-G3-01-001`仍保持OPEN；候选基线明确排除真实接口契约和现场指标通过结论，没有用Mock或追踪记录替代真实连通证据。

## 阻断项

`control/baselines/BASELINE-G2-M2-R1.0.md`的内容清单中，8个Git blob均可复现，但3个Markdown文件的SHA-256与当前文件实际值不一致：

| 文件 | 候选清单SHA-256 | 当前文件SHA-256 |
| --- | --- | --- |
| `docs/work/A_PM/software_requirements_specification_v0.1.md` | `8709d584b5208f7b47a8da6bd5ff195286914ed0a84e6c2ec3b96dba178bb080` | `b2a1e9f9f64b88d19c03c2ca589c08ff82318fd8e5466aa7f553f27caa033488` |
| `docs/work/B_TECH/spec.md` | `06a69ea2458b221cefecdd96971cc6974fefbe81ed92d5ac97a5bd0f51ef9d45` | `f08a73a3a4501d8e4060d8b9a57c711d4cc939a3d88b33c8fe577d44339f7362` |
| `docs/work/C_REQ/ai_reverse_clarifications.md` | `dd22559b48566376238c6ac3e96b8c83105ebe89ad1ab6bb6c40bfa484b5866f` | `f28d0245250c598ea6907e949f5fea3d818050824b318f4e1ddad2915e01d1ff` |

因此A自检中“8/8个工作稿/正式件的Git blob与SHA-256均和候选基线清单一致”的结论不能复现。Git blob正确说明业务内容没有漂移，但错误的第二套指纹会使冻结基线完整性验证产生假失败，属于重新冻结证据自身的重大错误。

## C结论

C对教师三项待复核整改给出PASS，但对G2-R06整体给出`NOT ACCEPTED`。A应明确SHA-256的计算对象和换行规范，修正3项指纹或移除不可稳定复现的冗余指纹，并重跑8/8完整性检查。修复前：

- `G2-R06`保持`REVIEW`；
- `BASELINE-G2-M2-R1.0`保持`REFREEZE_CANDIDATE`；
- `G3-01R`保持`BLOCKED`；
- 不关闭`ISSUE-G3-01-001`。
