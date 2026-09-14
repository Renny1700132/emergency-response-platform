# G2-DELIVERY-010 需求追踪矩阵正式件重构审计

- Task ID：G2-DELIVERY-010
- 主责：何思源（A，正式交付编排）；内容来源主责：任俊强（C）
- 模式：MODE-A / NEW DOCUMENT
- 正式件：`docs/deliverables/10-需求追踪矩阵RTMv1.docx`
- 唯一 Reference：`docs/reference/10-需求追踪矩阵RTM-v2（教学样例）.docx`
- 受控内容源：`docs/work/C_REQ/rtm_v1.md`
- 复核证据：`logs/reviews/2026-09-14_G2-06-RTM-B-review.md`、`logs/reviews/2026-09-14_G2-07-B-review.md`、`logs/reviews/2026-09-14_G2-07-C-review.md`

## 1. Pair-specific manifest

| 项目 | 结果 | 核验结论 |
|---|---|---|
| 页面、页面方向、页边距、section、页眉页脚、页码 | MATCH | 直接保留 Reference 包的 section 属性、header/footer 关系和页码体系。 |
| 封面与独立修订记录页 | MATCH | 直接保留 Reference 前两页 OOXML；仅替换文号、版本、项目名、文档名、实名签署字段及有证据的 V1.0 修订信息。 |
| 标题层级、正文样式与分页骨架 | MATCH | 继承 Reference `styles.xml`、`numbering.xml`、theme 和正文页骨架；长矩阵章节在完整表头前分页。 |
| 修订记录 | MATCH | 仅写入可由 G2-06/G2-07 复核佐证的 V1.0 正式迁移；未虚构历史版本。 |
| RTM 表格业务字段与列网格 | STRUCTURAL_DEVIATION | 项目 RTM 为 9/8/3 列、39 条 FR 的经复核矩阵，Reference 教学矩阵字段数不同。为冻结业务信息和可读性，保留工作稿的列网格和表内直接格式，不强套不匹配的 Reference 网格。 |
| Reference 信息图 | STRUCTURAL_DEVIATION | 当前受控 RTM 工作稿未提供需要新增的项目图及其事实来源；未为凑样例新增无依据插图。 |

## 2. 内容与版本核验

- 已核验正式件保留 39/39 条 G2-FR、34/34 条 ★属性、29 条 MVP Must 与 10 条非 MVP 本期范围条目。
- 已保留 117 条 AC 的范围引用以及 `COVERED_PENDING_EVIDENCE` 的未实现/未验收语义；没有改写为实现或验收结论。
- 已检索并确认正式件不含 Reference 的教学案例项目名称、人员、组名或业务事实。
- 历史临时正式件 `G2-05-需求追踪矩阵RTMv1.docx` 已由任务书命名正式件替代，避免平行正式版本。

## 3. Render review

- 同一 LibreOffice 渲染器已分别渲染 Reference（8 页）和正式件（6 页）。页数差异来自项目 39 条矩阵的业务字段、表格密度和 Reference 教学正文不同，不以压缩字号或删减数据追平。
- 逐页检查正式件封面、修订记录、三张长表、章节分页、页眉页脚和页码：无裁字、重叠、空白表头、越界或教学案例污染。
- 长表的第 3 节与第 4 节采用显式分页，使标题与完整表头同页；该操作未改变可见业务文字、表格单元格文字或条目顺序。

## 4. Final status

`PASS` — 正式件可进入独立人工复核。
