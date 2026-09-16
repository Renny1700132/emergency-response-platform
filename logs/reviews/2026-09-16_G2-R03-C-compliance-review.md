# G2-R03 C 符合性复核记录

- 日期：2026-09-16
- Task：G2-R03
- 被复核主责：A（何思源）
- 复核人：C（任俊强）
- 当前复核基点：`2286cf8`；SRS 修订内容基点：`c159709`
- 复核输入：`docs/work/A_PM/software_requirements_specification_v0.1.md`、`docs/deliverables/08-软件需求规格说明书SRS.docx`、`scripts/build_g2_r03_srs.py`、`control/g2/requirements_catalog.md`、`docs/work/B_TECH/spec.md`、`docs/work/C_REQ/rtm_v1.md`、`docs/work/C_REQ/ai_reverse_clarifications.md`、`control/facts.md`、`control/key_numbers.md`、`control/issues.md`
- 结论：ISSUE / NOT ACCEPTED

## 1 复核范围与边界

本轮按成员 C 的需求符合性职责复核 G2-R03，不修改 A 主责的 SRS 工作稿、正式 Word 或构建脚本。检查范围包括 39 条 FR、34 条★、G2-RCLR-001—010、PE/NFR、关键数字与责任边界、业务流程与状态模型、需求级字段字典、Markdown/Word/脚本结构一致性及正式件逐页视觉质量。B 的技术可实施性复核仍须独立完成。

用户明确说明当前项目已经拉取到合适版本且本次无需额外 pull。本轮启动时只读确认位于 `master`、工作树初始干净且本地跟踪状态与 `origin/master` 一致；该方法覆盖记录为 `OVR-023`，不改变需求事实。

## 2 检查结果

| 检查项 | 结果 | 证据与说明 |
| --- | --- | --- |
| 39 FR / 34★ | PASS | Markdown 与正式 Word 均检出 39 个唯一 `G2-FR-001—039`、34 个带★的唯一 FR；不存在编号缺口。 |
| AC 覆盖 | PASS / TEXT ISSUE | 机械核对 SRS 与 spec 均为 39/39 个 FR 至少挂接一个 `AC-G2-FR-nnn-xx`；但 SRS §8.3 误写“29 条 G2-FR 均有至少一个 AC”，与同节“全量 39 条”、实际内容及 spec 自检冲突，登记 `ISSUE-G2-R03-002`。 |
| G2-RCLR | PASS WITH FOLLOW-UP | `G2-RCLR-001—010` 共 10 条均可定位，且保持课程项目人工决策边界；受影响规则仍明确由 G2-R05 同步 spec/RTM，未冒充已完成。 |
| PE/NFR 与关键数字 | PASS / PENDING_B | `PE-01—PE-12` 连续完整；容量、可用性、恢复、安全、兼容、维护与测试要求均显式列示，未检出对冻结数字、责任或待验证状态的弱化。技术测量可行性仍待 B 复核。 |
| 流程、状态与字段字典 | CONTENT PASS | 6 个核心流程、6 组状态模型及 15 个实体/实体组字段字典可定位；字段表保留业务类型/必填、约束、来源和关联，且声明不是物理数据库设计。 |
| 教学案例污染与旧任务引用 | PASS | 正式 Word 未检出 `M-01 项目与会话管理`、`影像数据接入`、`模型注册`、`分割执行`，也未检出过时的 G2-04/G2-05/G2-06 叙述。 |
| Word 正文结构 | FAIL / BLOCKING | 当前正式 Word 的实际正文顺序仍为 `3.5 → 4章标题 → 3.6 → 表3-6 → 3.7 → 表3-7 → 表4-1 → 5`，与目录和 Markdown 的 `3.5 → 3.6 → 3.7 → 4 → 5` 不一致。`ISSUE-G2-R03-001` 关闭条件未满足。 |
| 正式件版式 | PASS WITH FOLLOW-UP | 对与当前 SRS 内容修订基点一同提交的 `render_G2-R03_SRS_review_fix/page-1.png`—`page-18.png` 逐页检查，未见裁切、重叠、乱码或表格溢出；A4 参数为 210×297 mm。第 4 张（正文图1-1）浅色框内白字对比度偏低，转交 G2-R04 格式整改。 |
| 最新渲染可复现性 | BLOCKED BY ENVIRONMENT | 按 documents Skill 调用标准 `render_docx.py` 重新渲染，因工作区依赖未提供 `soffice.exe` 而在转换前失败，未生成新的 PNG；本记录未将该次失败写成成功。既有 18 页证据与当前受控 DOCX 均来自 `c159709`，当前 DOCX Git blob 为 `b02b176b702be1936ef81a21643279f6953cc2ba`。 |

## 3 Issue 与处置建议

### 3.1 ISSUE-G2-R03-001 保持 OPEN / BLOCKING

A 需修正生成脚本的插入锚点，使正式 Word 的实际正文顺序与 Markdown、目录一致；重建后重新生成全页视觉证据。该 Issue 在 C 完成修订后复验且 B 完成技术复核前不得关闭。

### 3.2 新增 ISSUE-G2-R03-002

A 需把 SRS §8.3 的“29 条 G2-FR 均有至少一个 AC”修正为与实际机械结果一致的 39 条，并同步正式 Word。该修订不得改变 MVP 29 条、非 MVP 本期 10 条、34 条★或任何 AC 语义；由 C 复验计数和双镜像一致性。

## 4 准出结论

G2-R03 **NOT ACCEPTED**，继续保持 `REVIEW`。`ISSUE-G2-R03-001` 与 `ISSUE-G2-R03-002` 均阻断 G2-R03 DONE；B 的技术复核仍待独立完成。G2-R04、G2-R05、G2-R06 不因本次复核自动启动。
