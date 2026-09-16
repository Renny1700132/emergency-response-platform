# G2-R03 C 符合性复核记录

- 日期：2026-09-15
- Task：G2-R03
- 被复核主责：A（何思源）
- 复核人：C（任俊强）
- 被复核提交：`dfe667ee5c410c563856830919c46ba88941c25c`
- 复核输入：`docs/work/A_PM/software_requirements_specification_v0.1.md`、`docs/deliverables/08-软件需求规格说明书SRS.docx`、`control/g2/requirements_catalog.md`、`control/facts.md`、`control/key_numbers.md`、`docs/work/C_REQ/ai_reverse_clarifications.md`
- 结论：ISSUE / NOT ACCEPTED

## 1 复核范围与方法

本轮按 C 的需求符合性职责检查 39 条 FR、34 条★、关键数字、G2-RCLR-001—010、流程与状态、需求级字段字典、PE/NFR、责任边界、Markdown/Word 内容一致性及正式件逐页版式。未修改 A 主责的 SRS 工作稿、正式 Word 或构建脚本。

使用 A 提交的最终渲染 `logs/reviews/render_G2-R03_SRS/page-1.png`—`page-19.png` 逐页检查；并用 `python-docx` 对正式件文本、表格、G2-RCLR、占位符和案例词进行结构抽查。Preflight 未发现 P0 要求改变冻结事实，但正式件存在案例目录残留及多源不同步，须由 A 修订。

## 2 检查结果

| 检查项 | 结果 | 证据与说明 |
| --- | --- | --- |
| 39 FR / 34★ | PASS | 工作稿包含 G2-FR-001—039；MVP 28★+1 非★、非 MVP 6★+4 非★，合计 34★，与 `control/g2/requirements_catalog.md` 一致。 |
| 关键数字与责任 | PASS | PE-01—12 及容量、可靠性、安全、易用、维护指标可回指 `control/key_numbers.md`；视频≥30天、定位≤2秒/亚米级源能力、消息≥20路/≥99%、高危0等责任未弱化，均保留待验证属性。 |
| G2-RCLR-001—010 | PASS WITH FOLLOW-UP | 10 项规则均在工作稿和 Word 第10章可定位，课程项目人工决策身份边界明确；受影响 AC/RTM 仍按 G2-R05 待同步，未冒充已实现或已验收。 |
| 流程与状态模型 | PASS | 6 个核心流程与 6 组状态模型覆盖主路径和异常/受限路径，未越入服务拆分、物理库表或接口报文设计。 |
| PE/NFR 可直接查阅性 | PASS / PENDING_B | Word 第6章系统列出 PE-01—12 和容量、可靠性、安全、兼容、维护要求；C 未发现无来源数字，技术测量可行性仍待 B 复核。 |
| 正式件目录 | ISSUE / CRITICAL | 渲染第3—4张（目录 I—II）仍显示教学样例的“M-01 项目与会话管理”“影像数据接入”“模型注册”“分割执行”等章节，且页码到21，与本项目正文和19张渲染不一致。该内容属于教学案例残留，会直接误导评审。 |
| Word 章节顺序 | ISSUE / MAJOR | 渲染第15张（正文页11）出现 `5.1 核心数据对象 → 5.3 数据质量与来源 → 5.2 核心实体字段字典 → 5.4 数据安全与审计`，章节顺序错误，目录也未反映新增章节。 |
| Markdown / Word 一致性 | ISSUE / MAJOR | Markdown §5.2 声明“字段（业务类型/必填）”，Word 表5-1改为“核心字段（均含唯一标识）”并省略类型/必填；Markdown §3 引导、§8.2、§9仍引用历史 G2-04/G2-05/G2-06，Word只修正部分位置，正文页14仍称“G2-05 将提出不少于10条反向澄清”，与已完成 G2-R02 和后续 G2-R05 不符。 |
| 原始资料与任务边界 | PASS | C 本轮未修改原始资料、A/B 主责文件或原型；未启动 G2-R04/R05/R06。 |

## 3 正式 Issue

登记 `ISSUE-G2-R03-001`，严重度 CRITICAL / BLOCKING_TO_G2-R03_DONE。A 需更新正式 Word 目录字段并重新渲染，修正第5章顺序，统一 Markdown 与 Word 的字段字典口径及后续任务编号；之后由 C 复验内容/版式一致性，B 复核技术可实施性。

## 4 与教师返工 Issue 的关系

- `ISSUE-G2-R01-003`：流程、状态和异常内容本身达到 C 侧要求，但因正式件目录错误及源/正式件不同步，暂不关闭。
- `ISSUE-G2-R01-004`：已有15个实体/实体组字段字典，但正式 Word 丢失 Markdown 的类型/必填维度且章节顺序错误，暂不关闭。
- `ISSUE-G2-R01-005`：C 侧数字、来源和待验证边界检查通过；仍待 B 技术复核后决定关闭。

## 5 准出结论

G2-R03 **不准出**，保持 `REVIEW`。A 修订 `software_requirements_specification_v0.1.md`、正式 SRS Word 和生成脚本，重新生成目录并完成19页或最新页数逐页渲染后，由 C 复验 `ISSUE-G2-R03-001`；B 的技术复核仍须独立完成。G2-R04、G2-R05、G2-R06 不因本次复核自动启动。
