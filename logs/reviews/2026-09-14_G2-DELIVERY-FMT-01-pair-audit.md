# G2-DELIVERY-FMT-01 Pair 复刻与格式审计

- 日期：2026-09-14
- 执行角色：A（正式交付编排）
- 模式：CONTENT + FORMAT
- 正式件：`docs/deliverables/07-用户访谈记录与MoSCoW优先级.docx`
- 唯一 Pair：`docs/reference/07-用户访谈记录与MoSCoW优先级（教学样例）.docx`
- Pair SHA-256：`0AACE6D29B4A6810DC5525A437AFA30815759B0443931B9A89434885DFCF1105`
- 工作稿：`docs/work/C_REQ/user_interviews_and_moscow.md`
- 用户授权边界：用户明确要求“重新构成一个”，允许修正上一版错误的文档承载结构；项目事实、FR、优先级、验收边界不得改变。

## 内容阶段

上一版包含 43 个正文段落和 8 张自设表格，封面信息被改为表格，和 Pair 的 49 个正文段落、4 张表及两张信息图骨架不一致。重构从 Pair 原件副本开始，仅修改 `word/document.xml` 的受控内容槽位、图片关系和图片部件：

- 封面、修订记录、正文标题、Caption 和页码骨架沿用 Pair。
- 四张表分别映射修订记录、用户画像、29 条 MVP 用户故事和 MoSCoW 判定。
- 第五类用户角色和 29 条故事属于工作稿中的受控增量，使用同角色 Pair 元素克隆，不缩小字体。
- 正式姓名采用现有项目映射：任俊强（C）、严宇（B）、何思源（A）。
- 教学样例中的遥感文字和图片全部移除。

## Pair-specific Manifest

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 页面尺寸、方向、边距、页眉页脚距离、section break | MATCH | 单 section，A4 纵向，四边 72 pt，页眉/页脚距离 35.4 pt；`sectPr` 与 Pair 相同。 |
| 封面、日期、修订记录、目录、正文起始、签署布局 | MATCH | 日期保留在封面；Pair 无独立日期页、目录和签署页，正式件未擅自新增；修订记录独立第 2 页。 |
| `sectPr`、header/footer 引用、styles、basedOn、docDefaults、theme、numbering | MATCH | `styles.xml`、`numbering.xml`、theme、footer、settings、fontTable、webSettings 与 Pair 部件 SHA-256 分别相同。 |
| 段落 `pPr`、run `rPr` 与直接格式 | MATCH | 从 Pair 原段落槽位直接继承；新增第 5 类摘要复制第 4 类同角色段落属性。 |
| 表格 `tblPr`、`tblGrid`、`trPr`、`tcPr`、跨页设置 | MATCH | 四张表从 Pair 对应表直接继承；表格正文与表头实际字号均为 Pair 的 10.5 pt；列宽网格逐表一致。 |
| Caption、页眉页脚、页码字段 | MATCH | Caption 沿用 Pair 的 Normal 直接格式，9 pt、加粗、居中；页脚 PAGE 字段保留。 |
| 图片尺寸、inline 位置、对齐与留白 | MATCH | 复用 Pair 的两个 drawing 槽位，物理尺寸分别为 5,580,000×1,744,484 EMU 和 4,680,000×2,558,998 EMU；图片来自可编辑 PPTX 源导出的 EMF。 |
| 同渲染器页面级结果 | MATCH | Reference 与正式件均由 Microsoft Word 导出；Reference 7 页，正式件因 5 类角色和 29 条故事形成 8 页，页面角色与视觉体系一致。 |

## 结构差异

- `STRUCTURAL_DEVIATION-01`：项目有 5 类角色，Pair 有 4 类；按用户重构授权和工作稿内容新增 1 个同样式角色行及摘要。
- `STRUCTURAL_DEVIATION-02`：项目有 29 条 MVP 故事，Pair 有 21 条；故事表自然增加 8 行并多占 1 页，未通过缩小字号压页。
- 上述差异均来自受控业务内容，未用于机械追平页数。

## 图表闭环

- 图 1-1 源：`docs/deliverables/figures/07-图1-1-访谈到需求基线证据链.pptx`
- 图 5-1 源：`docs/deliverables/figures/07-图5-1-MoSCoW优先级分布.pptx`
- 两张图均由 PowerPoint 原生 Shape/Connector 构成，已导出 EMF 和 PNG；PNG 尺寸分别为 1920×600、1920×1050。
- 已检查图内文字、连接线、对齐、裁切和 Word 插入页。

## 内容冻结与受控范围

- FORMAT before：`600F8C9AC702C394A547A5D775C99261212DB142939C8744C7432C208110AEBD`
- FORMAT after：`600F8C9AC702C394A547A5D775C99261212DB142939C8744C7432C208110AEBD`
- `CONTENT_FREEZE_CHECK = PASS`
- US-001—US-029：29/29。
- 非 MVP 关键 FR：FR-01.4、FR-03.1、FR-03.2、FR-07.1—FR-07.5、FR-08.3、FR-09.1 均可定位。
- 教学案例污染检查：未检出“澜图”“遥感影像”“ArcGIS”“IoU”“LTPT”。

## 渲染与逐页检查

标准 `render_docx.py` 因本机缺少转换程序返回 `WinError 2`，未产生伪成功记录；随后对 Pair 和正式件统一使用 Microsoft Word 只读导出 PDF，并以同一参数生成逐页 PNG。

| 正式页 | 对应 Pair 页/页面角色 | 结果 |
| --- | --- | --- |
| 1 | 1 / 封面 | PASS |
| 2 | 2 / 修订记录 | PASS |
| 3 | 3 / 方法、流程图、画像表 | PASS |
| 4 | 4 / 画像续表与访谈摘要 | PASS |
| 5 | 5 / 用户故事表首页 | PASS |
| 6 | 6 / 用户故事续表 | PASS |
| 7 | 6—7 / 故事尾行、MoSCoW 图表 | PASS |
| 8 | 7 / 后续与追踪 | PASS |

逐页检查未发现截字、重叠、图片模糊、表格越界、孤标题、页眉页脚错误或异常空白。

## 过程异常

- 初始正式文件被 WPS 占用；未关闭用户窗口，改从 Git 索引提取只读副本完成构建。
- 两次 PowerPoint 形状组导出发生裁边；已弃用，改为一图一 PPTX、按 Pair 宽高比整页导出。
- 两次样式核对脚本分别因括号和不存在的 Caption 样式报错；均未修改产物，修正后按 Pair 实际 Normal Caption 完成核验。
- Microsoft Word 插图保存会重写受保护 OOXML 部件；该候选已弃用，最终采用直接 OOXML 图片关系替换。

## 结论

最终状态：PASS。正式件直接继承唯一 Pair 的格式部件，受控项目内容完整，格式阶段内容冻结通过，可提交复核。
