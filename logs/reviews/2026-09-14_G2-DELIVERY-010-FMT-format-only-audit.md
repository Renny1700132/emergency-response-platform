# G2-DELIVERY-010 FORMAT ONLY 审计记录

- 日期：2026-09-14
- 主责：何思源（A）
- 模式：FORMAT ONLY
- 正式文件：`docs/deliverables/10-需求追踪矩阵RTMv1.docx`
- 唯一模板：`docs/reference/10-需求追踪矩阵RTM-v2（教学样例）.docx`
- 内容来源（只读核验）：`docs/work/C_REQ/rtm_v1.md`

## 1. 内容冻结门禁

本次没有修改任何业务文字、表格单元格文字、标题文字、修订记录文字、页眉或页脚文字，也没有增删表格行列、章节或图片。

| 检查对象 | 修改前 SHA-256 | 修改后 SHA-256 | 结果 |
|---|---|---|---|
| 正文段落与全部表格单元格（419 项，按 XML 出现顺序） | `a390137fb5a29f63faae294fd1ccf1fb2bc30972752703309e2085e922109b51` | `a390137fb5a29f63faae294fd1ccf1fb2bc30972752703309e2085e922109b51` | PASS |
| 页眉/页脚可见文字（1 项） | `cc1c2ffa003dc20ca40414b1d654f71a0cbb7a6f9ca8fc257a5f3e6743ea8faf` | `cc1c2ffa003dc20ca40414b1d654f71a0cbb7a6f9ca8fc257a5f3e6743ea8faf` | PASS |

`CONTENT_FREEZE_CHECK = PASS`。唯一写入对象为视觉属性：段落/Run 属性、表格/单元格属性及防止表格行跨页拆分的行属性。

## 2. Pair-specific 格式清单

| 项目 | 处理与核验 | 结果 |
|---|---|---|
| 页面、section、页边距、页眉页脚、页码 | 目标文件原有模板页直接继承唯一 reference；本轮未改动 section、页眉或页脚文本。 | MATCH |
| 封面与修订记录 | 已保留 reference 的封面/修订记录视觉骨架；字段文字冻结。 | MATCH |
| 一级标题 | 将正文五个章节的 `pPr` 与可见 Run 的 `rPr` 映射为 reference 章节标题实例，而非仅替换 Style ID。 | MATCH |
| 规则段落与列表 | 将四项读法及末尾两项使用说明映射为 reference 的列表段落属性和 Run 属性。 | MATCH |
| 正文直接格式 | 同时检查并保留 Style、`basedOn`、`docDefaults`、主题以及段落/Run direct formatting；本轮修正的段落/Run 使用 reference 实例属性。 | MATCH |
| 表格 1、2、3 | 逐表继承对应 reference 表的 `tblPr`，逐单元格映射 `tcPr`（底纹、垂直对齐、边距）及段落/Run 属性；表头采用 reference 浅蓝底纹、黑色粗体；首行重复。 | MATCH（视觉属性） |
| 表格分页 | 为数据行增加 `cantSplit`，使每条追踪记录整行跨页，消除续页残行与异常空白页。 | MATCH |
| 图题、图片 | 目标正式文件没有可修改的图题或图片对象；未新增、删除或调整任何图片。 | MATCH（冻结） |

## 3. STRUCTURAL_DEVIATION（FORMAT ONLY 不得修改）

1. 目标矩阵含 39 条项目需求，reference 的教学案例表格行数及业务列语义不同；目标最终渲染为 10 页，reference 为 8 页。该页数差异由冻结的业务记录数量和字段结构造成，未以删改内容、缩小字号或重构章节方式消除。
2. reference 在结论页包含其教学案例的信息图；目标当前未有等价项目图。按 FORMAT ONLY 边界，不得新增图或业务结论，故记录为结构性偏差而非本次修改项。
3. reference 的三张业务表列数为 9/7/5，目标为 9/8/3；未增删列或迁移字段，只向最近的 reference 表族继承视觉属性。

## 4. 同渲染器视觉复核

- 渲染器：LibreOffice headless → PDF → 144 dpi PNG。
- Reference：8 页；目标：10 页。
- 逐页检查目标第 1 至第 10 页，并与 reference 第 1、2、3、8 页对照封面、修订记录、标题、正文、表头底纹、单元格边框、分页和页码。
- 结果：无截字、无重叠、无表格行拆分残片、无异常空白续页；封面、修订记录、标题层级、正文和表格视觉体系均按 reference 实例属性呈现。

## 5. 最终结论

- `CONTENT_FREEZE_CHECK = PASS`
- `RENDER_REVIEW = PASS`
- `FINAL_STATUS = PASS`

本结论仅表示本次 FORMAT ONLY 允许的视觉格式项已完成；上列 `STRUCTURAL_DEVIATION` 均已留痕，未被误写为已完成的内容或结构整改。
