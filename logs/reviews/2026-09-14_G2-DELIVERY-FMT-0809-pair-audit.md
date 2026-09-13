# G2-DELIVERY-FMT-0809 Pair 复刻与格式审计

- 日期：2026-09-14
- 模式：MODE-D / CONTENT + FORMAT
- 执行：A（正式交付编排）
- 独立人工复核：PENDING_REVIEW
- 自动结论：PASS

## 1. 文件与内容源

| 正式件 | 唯一 Reference | 受控工作稿 | Reference SHA-256 | 正式件 SHA-256 |
|---|---|---|---|---|
| `docs/deliverables/08-软件需求规格说明书SRS.docx` | `docs/reference/08-软件需求规格说明书SRS-v3（教学样例）.docx` | `docs/work/A_PM/software_requirements_specification_v0.1.md` | `830965EF5FAADF0D14AFA5E0C8FC20D904E23FE3D111CF544BDA87AE85574C56` | `13B4F511460ECAEE35453524F4E571E5334567D6CC2EE4D3B13B70D984635EAA` |
| `docs/deliverables/09-AI反向澄清记录.docx` | `docs/reference/09-AI反向澄清记录（教学样例）.docx` | `docs/work/C_REQ/ai_reverse_clarifications.md` | `70D1118E1F5927CC425F580B0C180B047C489F1AC29DF7CDBEA43CB3B7AA44F3` | `72340D65FB6432921C9BB33887E2AC5E5A805A3C9B0FD43F33B12C5A7E65F901` |

业务内容来自已完成 G2-03、G2-05 复核的工作稿及 control 台账。教学样例只提供结构、样式、表格表现和页面骨架。

## 2. 08 SRS Pair-specific Manifest

| 检查项 | 结果 | 证据/说明 |
|---|---|---|
| A4、纵向、上下左右 72 pt、页眉页脚 35.4 pt | MATCH | 从 Pair 继承；实测一致。 |
| section 数与分节位置 | MATCH | Pair 与正式件均为 3 section；封面、修订页、目录/正文分隔保留。 |
| 封面与独立修订页 | MATCH | 直接保留 Pair 前置页 OOXML，仅替换项目、文档、人员和日期字段；批准人无依据，写 `【待人工确认】`。 |
| 目录与正文起始页 | MATCH | Pair 目录字段保留；Microsoft Word 渲染后正文从第 5 页开始。 |
| `styles.xml`、`numbering.xml`、theme、settings、fontTable、webSettings | MATCH | 六个受保护部件与 Pair 字节级一致。 |
| Heading/Normal/List/Caption 的 Style + basedOn + docDefaults + direct formatting | MATCH | 标题和正文使用 Pair 同角色样式；图题使用 Pair Caption。 |
| `pPr`、`rPr` | MATCH | 前置页直接继承；正文按 Pair 同角色样式映射。 |
| 表格 `tblPr`、`trPr`、`tcPr`、表头、边框、底纹、跨页设置 | MATCH | 按 Pair 同角色表逐表复制；业务列宽按 4 列需求表、4 列接口表和 3 列 NFR 表适配。 |
| `tblGrid` 与业务结构 | STRUCTURAL_DEVIATION / PASS | Pair 11 表，正式件 8 表；正式件依据项目 5 个需求域、接口和 NFR 组织，未复制案例业务。所有 8 表网格完整、无空行。 |
| 图片与图题 | STRUCTURAL_DEVIATION / PASS | Pair 4 图；本项目仅保留有依据的“需求双镜像与追踪关系”1 图，尺寸 5486400×1668780 EMU，PPTX/EMF/PNG 可追溯。 |
| 页眉、页脚、页码字段 | MATCH | 继承 Pair section 与字段表现。 |
| 页面级结果 | PASS | Pair 23 页，正式件 15 页；差异来自项目 39 条 FR 与案例业务结构不同。正式件第 1—15 页逐页检查，无截断、重叠、窄列、异常空白或孤标题。 |

内容检查：39/39 个 `G2-FR-001—039` 均可定位；5 组功能需求表、接口表和 NFR 表均有真实内容；全文未检出“澜图”“遥感影像”“segment-geospatial”“LTPT-2026”。

FORMAT 阶段 before/after 规范化可见内容哈希均为 `4534C330FB23B7D79C30830D1DEC688A0249FE0CA9B8F52C52E42F24B74849BF`，`CONTENT_FREEZE_CHECK = PASS`。

## 3. 09 AI 反向澄清记录 Pair-specific Manifest

| 检查项 | 结果 | 证据/说明 |
|---|---|---|
| A4、纵向、上下左右 72 pt、页眉页脚 35.4 pt | MATCH | 从 Pair 继承；实测一致。 |
| section 数与位置 | MATCH | Pair 与正式件均为 1 section。 |
| 封面与独立修订页 | MATCH | 直接保留 Pair 前置页与分页符，仅替换项目字段；正文从第 3 页开始。 |
| TOC | N/A / MATCH | Pair 无目录，正式件未新增目录。 |
| `styles.xml`、`numbering.xml`、theme、settings、fontTable、webSettings | MATCH | 六个受保护部件与 Pair 字节级一致。 |
| Heading/Normal/List/Caption 与 direct formatting | MATCH | 采用 Pair 同角色样式；12 条记录保持统一层级。 |
| 表格 `tblPr`、`trPr`、`tcPr`、边框和底纹 | MATCH | 修订表直接继承；统计表映射 Pair 双列表，列宽按业务内容适配。 |
| 图片与图题 | STRUCTURAL_DEVIATION / PASS | Pair 2 图；正式件使用“AI 反向澄清裁决闭环”1 图，尺寸 5486400×1668780 EMU，PPTX/EMF/PNG 可追溯。 |
| 页眉、页脚与页码 | MATCH | 继承 Pair 表现。 |
| 页面级结果 | PASS | Pair 8 页，正式件 6 页；12 条课程模拟裁决全部保留。第 1—6 页逐页检查，无截断、重叠、异常空白或孤标题。 |

内容检查：12/12 个 `G2-CLR-001—012` 均可定位；每条保留 AI 问题、影响、既有人工裁决、来源、双镜像落点、验证证据和结论；未新增或改写甲方裁决。全文未检出教学案例项目事实。

FORMAT 阶段 before/after 规范化可见内容哈希均为 `7733574C7A747C28FF2DC617D892AECA2A5D5C97E275DBF7487E76B0672CB5EB`，`CONTENT_FREEZE_CHECK = PASS`。

## 4. 图形闭环

| 图 | 可编辑源 | 导出 | Word 渲染 |
|---|---|---|---|
| 08 图 1-1 需求双镜像与追踪关系 | `docs/deliverables/figures/08-图1-1-需求双镜像与追踪关系.pptx` | EMF、1920×584 PNG | PASS |
| 09 图 1-1 AI 反向澄清裁决闭环 | `docs/deliverables/figures/09-图1-1-AI反向澄清裁决闭环.pptx` | EMF、1920×584 PNG | PASS |

图均由 PowerPoint 原生 Shape、文本框和 Connector 构成。PPTX 实际导出后插入 Word，并在最终页面检查可读性、对齐、箭头和留白。

## 5. 失败、修正与工具证据

1. 首次 Python 运行缺少 `python-pptx`，未修改正式件；改用本机 PowerPoint COM 生成可编辑图源与导出文件。
2. 首次 Word COM 批量导出未产生 PDF；第二次调用因错误使用 Open 重载失败，均未改变正式件。改用 ASCII 临时副本和简化只读 Open 参数后，四份 PDF 成功导出。
3. 首轮前置页替换误清除空白段中的分页符，导致修订表进入封面；恢复 Pair 原分页段后重新生成，封面与修订页分离。
4. 首轮表格格式映射错误移除了 `tblGrid`，导致内容覆盖到首行并出现空行、窄列；该候选被弃用。重建后 8 张 SRS 表均有完整列网格、零空行，39 条需求重新核对通过。
5. `pdftoppm` 报告 Symbol/ArialUnicode 显示字体提示；Microsoft Word 导出的 PDF 与逐页 PNG 中未见字体替代、乱码或不可读字符，因此记录提示但不误报失败。

## 6. 结论

两份正式件均通过受控内容核对、Pair 直接继承、内容冻结、机械覆盖检查和同渲染器逐页视觉检查，自动状态为 `PASS / PENDING_REVIEW`。旧错误命名文件已由任务书命名的 08、09 正式件替代；未修改冻结需求、模拟甲方裁决、`spec.md` 或 RTM。
