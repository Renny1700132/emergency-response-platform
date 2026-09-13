# G2-DELIVERY-FMT-09-R2 Pair 正文重构审计

- 日期：2026-09-14
- 模式：MODE-D / CONTENT + FORMAT（用户授权正文结构重映射，业务内容冻结）
- 正式件：`docs/deliverables/09-AI反向澄清记录.docx`
- 唯一 Pair：`docs/reference/09-AI反向澄清记录（教学样例）.docx`
- 受控工作稿：`docs/work/C_REQ/ai_reverse_clarifications.md`
- Reference SHA-256：`70D1118E1F5927CC425F580B0C180B047C489F1AC29DF7CDBEA43CB3B7AA44F3`
- 重构后 SHA-256：`D7D5C961CF01DF83D9EE59A15749A44876F9D331C3B3031F0AA316C07B53C024`
- 自动结论：PASS
- 独立人工复核：PENDING_REVIEW

## 1. 本轮定位的偏差

上一版正文把每条澄清的“AI 反向问题、影响、既有人工裁决、裁决来源、双镜像落点、验证与证据、结论”设为 `List Paragraph`，只挂样式名，未继承 Pair 澄清正文的实际直接格式。结果缺少 Pair Normal 正文的两字符首行缩进、1.5 倍行距、段后 5 pt 和宋体 12 pt 直接运行属性。Heading 1、Heading 2 也未复制 Pair 的直接 `pPr/rPr`。流程图位于第 2 节标题之后，阅读顺序与 Pair 的“方法说明 → 图 → 图题 → 澄清记录”不一致。

## 2. Pair-specific Manifest

| 检查项 | 结果 | 证据 |
|---|---|---|
| A4 纵向、上下左右 72 pt、页眉页脚 35.4 pt | MATCH | 保持 Pair section 页面参数。 |
| section 数与 section break | MATCH | Pair 与正式件均为 1 section。 |
| 封面与项目字段 | MATCH | Pair 封面 OOXML 保留；仅替换项目、文档、人员和日期字段。 |
| 封面后分页、修订页后分页 | MATCH | 第 12、15 段均保留 `w:br type="page"`；正文从第 3 页开始。 |
| 修订记录表 | MATCH | 表头、边框、底纹、列宽、字体和行格式沿用 Pair。 |
| TOC | N/A / MATCH | Pair 无目录，正式件未新增。 |
| `styles.xml`、`numbering.xml`、theme、settings、fontTable、webSettings | MATCH | 六个受保护部件与 Pair 字节级一致。 |
| Heading 1 `pPr/rPr` | MATCH | 正式件 4/4 个一级标题直接复制 Pair 第 16 段属性。 |
| Heading 2 `pPr/rPr` | MATCH | 正式件 12/12 个澄清标题直接复制 Pair 第 23 段属性。 |
| 澄清正文 `pPr/rPr` | MATCH | 84/84 个记录正文段均为 Normal，直接复制 Pair 第 24 段的首行缩进、1.5 倍行距、段后 5 pt 和宋体 12 pt 运行属性。 |
| 方法说明正文 | MATCH | 采用 Pair 第 17 段 Normal 正文属性。 |
| 后续任务/自检列表 | MATCH | 采用 Pair 第 20 段 List Paragraph 的 1.5 倍行距和段后 3 pt；保留原有重点字重。 |
| 图段、Caption | MATCH | 图段复制 Pair 第 18 段；图题复制第 19 段的居中、宋体 9 pt 加粗属性。 |
| 图物理尺寸 | MATCH | 正式件首图为 `5580000 × 1764036 EMU`，与 Pair 首图完全一致。 |
| 表格结构 | STRUCTURAL_DEVIATION / PASS | Pair 的第 3 节为 AI 误读驳回表；本项目 12 条均映射既有裁决，无可据实新增的误读记录，因此保留项目“后续任务输入/自检”内容，不复制案例业务。 |
| 页数与页面角色 | STRUCTURAL_DEVIATION / PASS | Pair 8 页，正式件 9 页；额外页来自每条项目记录保留 7 个追踪字段，而 Pair 每条为 4 个正文段。未删减内容或缩小字号追平页数。 |
| 页眉、页脚、页码 | MATCH | 直接继承 Pair 部件和字段表现。 |

## 3. 内容冻结与合规检查

- Git 修改前与重构后可见段落/表格单元格多重集合：`VISIBLE_MULTISET_EQUAL = True`，均为 151 项。
- 结构调整后 FORMAT 阶段 before/after 规范化可见内容哈希：`C2EED0624BDA01146FA6F7BB5ACFD761068CD9948268D7A22519F5CCCBF8D84D`。
- `CONTENT_FREEZE_CHECK = PASS`。
- 12/12 个 `G2-CLR-001—012` 均可定位；没有修改、重新解释或新增课程模拟甲方裁决。
- DOCX ZIP 完整性：PASS；全包未检出 `segment-geospatial` 或 `LTPT-2026`，未见教学案例项目事实污染。

## 4. 同渲染器逐页视觉复核

渲染器：Microsoft Word，只读打开并导出 PDF；Pair 与正式件使用同一渲染器。重构后正式件 9 页。

| 页 | 页面角色 | 结果 |
|---|---|---|
| 1 | 封面 | PASS：位置、字体、横线、字段块和留白与 Pair 体系一致。 |
| 2 | 修订记录 | PASS：独立页、表格宽度、底纹、边框和说明无越界。 |
| 3 | 方法、统计表、流程图、图题、第 2 节起始 | PASS：阅读顺序已改为 Pair 节奏；图尺寸、居中和 Caption 间距正常。 |
| 4 | G2-CLR-001—003 | PASS：标题层级、正文首行缩进、1.5 倍行距、段后间距清楚，无孤标题。 |
| 5 | G2-CLR-004—006 | PASS：分页自然，无截字、重叠或异常空白。 |
| 6 | G2-CLR-006—008 | PASS：段落密度与 Pair 接近，跨页续接可读。 |
| 7 | G2-CLR-008—010 | PASS：编号和各字段层次清楚。 |
| 8 | G2-CLR-010—012 | PASS：末条记录完整，无孤标题。 |
| 9 | 后续任务输入、自检 | PASS：列表缩进、行距、重点字重和页脚正常。 |

## 5. 工具异常

1. 首次修改前后对比脚本用硬编码中文 Git 路径，受命令管道编码影响生成的临时文件不是 DOCX；未修改正式件，随后改为从文件系统 glob 取得真实路径。
2. 第二次验证脚本含非 ASCII 临时变量名，被 PowerShell 管道编码替换后产生语法错误；未修改正式件，随后改用 ASCII 变量完成检查。
3. `pdftoppm` 报告 Symbol/ArialUnicode 显示字体提示；Microsoft Word PDF 和逐页图未出现乱码、字体替代或不可读字符。

## 6. 结论

09 正式件已按 Pair 的实际正文格式完成第二轮重构。页面、标题、正文段、列表、图题、图片尺寸、表格、页眉页脚与分页均完成直接继承或同角色映射；项目记录比案例多出的追踪字段作为受控结构差异保留。自动状态为 `PASS / PENDING_REVIEW`。

补充工具记录：两次高分辨率抽查副本生成脚本因页码命名和临时表达式笔误失败，均未修改正式件；修正后第 4 页和第 9 页抽查 PASS。
