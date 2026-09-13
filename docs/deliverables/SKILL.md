---
name: formal-deliverable-documents
description: Create, write, revise, or format formal project deliverables destined for docs/deliverables or for clients, teachers, reviewers, or acceptance. Use for formal DOCX/PDF, SRS, design, test, acceptance, and similar controlled documents; do not use for ordinary internal drafts, prompts, reviews, logs, or control ledgers unless the requested output will become a formal deliverable.
---

# 正式可交付文档生成与修改

## 1. 适用范围与入口判定

用户明确要求生成、撰写、修改或修订下列成果时，先读取并执行本 Skill：

- `docs/deliverables/` 下的正式 DOCX/PDF；
- 面向甲方、教师、评委、签署人或验收的正式材料；
- 后续关卡的正式 SRS、设计、数据库、接口、测试、部署、用户、验收和总结文档；
- 虽先在其他目录形成、但明确将进入 `docs/deliverables/` 的成果。

普通内部草稿、Prompt、Review、日志、会议记录、`control/` 台账和治理文件编辑不触发，除非用户明确要求把它们制作成正式交付物。

遵守 `AGENTS.md`、`governance/ai_logging.md`、`governance/git_workflow.md`、`governance/review_workflow.md` 与信息源优先级。本 Skill 不扩大用户授权，不替代主责与复核流程。

## 2. 四种模式

开始实质修改前声明一种模式及范围：

| 模式 | 触发条件 | 必做链路 |
|---|---|---|
| MODE-A / NEW DOCUMENT | 新建正式文档 | 工作稿检查与补强 → 唯一 Reference 对照 → 正式文档生成 → 必要插图 → 渲染与逐页检查 |
| MODE-B / CONTENT EDIT | 修改业务内容、章节、数字、结论、需求响应或承诺 | 受控来源核验 → 先改 `docs/work/` 工作稿 → Review/变更处置 → 同步正式文档 → 保持 Reference 格式 → 渲染 |
| MODE-C / FORMAT ONLY | 只改格式、字体、分页、表格、图片尺寸/位置等 | 修改前内容快照 → 仅改格式 → 修改后内容快照 → `CONTENT_FREEZE_CHECK = PASS` → 渲染 |
| MODE-D / CONTENT + FORMAT | 同时涉及内容与排版 | 先按 MODE-B 完成并确认内容；再以确认后的内容为新冻结点，独立执行 MODE-C |

不得把内容修改伪装成 FORMAT ONLY。MODE-C 中普通正文、标题、表格文字、Caption、页眉页脚文字和图内信息不得变化；Word 自动字段显示缓存可在审计中明确排除。

## 3. 两类源文件与证据边界

- `docs/work/` 是内容源。
- `docs/reference/` 中与目标文档唯一对应的教学样例是格式模板。
- Prompt、Review、控制台账、冻结 Baseline、会议记录和 Git 历史提供变更与版本证据。
- 教学案例只提供结构和格式，不得向正式稿引入案例项目的事实、技术栈、算法、性能、预算、工期、人员、需求或 SLA。

> Reference 是模板，Deliverable 是内容载体。禁止自行重新设计一套“类似”的格式。

每个正式文档必须先找到唯一对应 Reference。找不到、存在多个候选且无法唯一判定、或 Reference 损坏时，不得凭经验自创模板；记录具体缺口并请求确定模板。

## 4. 工作稿优先

生成或修改正式文档前，先搜索并完整读取相关：

- `docs/work/` Markdown 或其他工作稿；
- 技术方案与上游正式输入；
- 最新 Review、Issue、变更记录和冻结 Baseline；
- `control/facts.md`、`control/key_numbers.md`、需求/追踪台账；
- 与目标文件相关的 Prompt 和 Git 历史。

若工作稿明显过短、缺少 Reference 所需的重要业务章节/表格/依据、与最新 Review 不一致，或尚不存在：

1. 先在主责范围内补建或更新工作稿；
2. 完成必要的 Review/Issue/Change 处置；
3. 再从已受控工作稿生成正式文档。

禁止让正式 Word 比工作稿多出大量未经受控的业务内容。不能直接把教学案例正文替换几个名词后作为项目内容，也不能只凭记忆生成正式稿。

MODE-B 必须先改工作稿再同步正式稿。若正式稿是唯一合法内容源且没有工作稿，先建立可追溯工作稿；不得长期维护“Word 一套、工作稿一套”。

## 5. 内容来源与变更纪律

数字、FR/NFR、★条款、PE、范围、责任、里程碑、验收、人员和技术承诺必须能回指受控来源。未知内容写 `【待人工确认】`，不得猜测。

内容修改顺序：

1. 定位权威来源与当前版本；
2. 检查主责、复核和冻结状态；
3. 修改工作稿；
4. 必要时登记 Issue、Review 或 change log；
5. 将同一受控内容同步到正式稿；
6. 做 work ↔ deliverable 一致性检查；
7. 再做格式与渲染检查。

冻结版本不得原位覆盖；按项目版本规则产生新版本并保留历史。仅排版时不得顺便修正措辞、数字或结论，即使认为原文有误，也应另行登记问题。

## 6. Reference 逐文档复刻

打开对应 Reference 的 DOCX OOXML、`styles.xml`、`numbering.xml`、section、header/footer 和实际渲染页，逐项核对并复刻：

- 页面尺寸、方向、section 数与 section break 位置；
- 上下左右页边距、装订线、页眉/页脚距离、首页不同、奇偶页；
- 封面布局、独立日期页、修订记录页、目录有无与格式、正文起始页；
- 文档编号、版本、密级、编制单位、编制、审核、批准、编制日期；
- Heading 1—3、Normal、List Paragraph、Caption、TOC、编号体系；
- 中文/西文字体、字号、粗体、斜体、下划线、颜色和字符间距；
- 对齐、首行/左右缩进、行距、段前段后、keep-with-next、keep-lines、page-break-before、孤行控制；
- 表格宽度、列宽比例、行高、表头、边框、底纹、cell margin、对齐、跨页规则；
- 图题/表题编号与位置、插图尺寸/位置/留白/视觉体系；
- 页眉、分隔线、页脚、页码位置/格式/起始与连续性；
- 签署栏、附录和分页骨架。

Reference 有目录则保留同等级目录；无目录不得擅自添加。Reference 采用“封面 → 独立日期页 → 修订记录 → 正文”时不得为省页合并。业务章节随文档变化，不在本 Skill 中写死，必须以唯一 Pair 实测。

## 7. Reference-derived Style Baseline

以下为 2026-09-13 对 `docs/reference/` 34 份 DOCX、70 个 section 的 OOXML/实际段落统计。它用于发现偏离，不是跨文档统一模板；**唯一对应 Reference 的实际属性始终优先**。

### 7.1 页面基线

扫描到的 70 个 section 均为 A4 纵向（595.3 × 841.9 pt），页边距上/下/左/右均为 72 pt，页眉/页脚距离均为 35.4 pt。新文档可把它作为预检默认值，但只要对应 Reference 不同，就必须采用该 Reference 的 `sectPr`，禁止用统一边距覆盖。

### 7.2 字体与段落基线

| 类别 | 扫描主值（中文 / 西文） | 字号与字重 | 常见段落属性 | 执行规则 |
|---|---|---|---|---|
| Heading 1 | 黑体（少量 OOXML 写作 SimHei）/ Times New Roman | 16 pt，加粗 | 段前 12 pt、段后 8 pt | 复制 Pair 实际样式；标题保持与下文同页 |
| Heading 2 | 黑体 / Times New Roman | 主值 14 pt，加粗；个别 13/16 pt | 段前 10 或 12 pt、段后 6 或 8 pt | 不把主值强套到例外文档 |
| Heading 3 | 黑体 / Times New Roman | 12 pt 为主、部分 13 pt，加粗 | 段前 8 或 12 pt、段后 5 或 8 pt | 复制 Pair 实际值 |
| Normal 正文 | 宋体 / Times New Roman | 正文主值 12 pt、常规；封面/代码等存在受控例外 | 正文常见两字符首行缩进（约 23.8 pt）、1.5 倍行距、段后约 5 pt、两端对齐 | 只对正文样本使用主值；封面和特殊段落按 Pair |
| Caption | 黑体为主（少量宋体）/ Times New Roman | 9 pt、加粗 | 居中 | 编号、对齐和与图表间距按 Pair |
| Table text | 宋体 / Times New Roman | 12 pt 为主，亦有 11/10.5 pt；表头通常加粗 | 常见 1.25 倍行距；正文黑色 | 每张表匹配其对应样例表，不统一套色 |
| Header/Footer | 宋体或继承主题 / Times New Roman | 9 pt、常规 | 居中；段后按 Pair 为 0/3/5 pt | 逐 section 复制内容表现、分隔线与页码字段 |

“黑体”与 “SimHei”、“宋体”与 “SimSun”是样例 OOXML 中的本地化写法，不授权用微软雅黑或其他“看起来接近”的字体替代。英文/数字字体、主题字体与缺省继承必须从对应 Reference 解析。

样式表中的空值可能表示继承自 basedOn、docDefaults、主题或直接格式，不等于“没有要求”。检查时必须沿样式继承链和实际段落/run 解析，不能只读取顶层 Style 对象。

### 7.3 段落门禁

- 正文按 Pair 设置两端/左/居中对齐、首行缩进、行距和段前段后。
- Heading 必须启用或实现 keep-with-next；不得孤立在页尾。
- 检查 widow/orphan、keep-together 与 page-break-before；跨页后不得出现页首半行、页尾孤标题。
- 不用空行堆叠模拟段前段后，不用重复回车模拟分页。

### 7.4 表格门禁

每张表单独对照 Reference 同语义/同层级表格，复制或映射：

- 表头底纹、黑色正文、字体字号与加粗；
- 外框/内框颜色、线型和粗细；
- 总宽、列宽比例、autofit、行高与 cell margin；
- 单元格水平/垂直对齐；
- repeat header row；
- allow row to break across pages；
- 表前表后间距和 Caption 位置。

业务列数不同时可调整列数/列宽以容纳受控内容，但必须保留 Reference 的表头、边框、字体、padding、行高和跨页逻辑。禁止用一套自创蓝色/灰色表格覆盖全部文件。

### 7.5 Caption 门禁

图题、表题的编号体系、字体、字号、加粗、对齐、段前段后、与对象距离均按 Pair。图内不重复 Word Caption。正文引用、Caption 编号与对象必须一致。

## 8. 修订记录

每次处理正式文档都检查修订记录：

- 新文档只依据真实 Prompt、Review、Git 和版本规则建立记录。
- 已有文档只有真实版本事件才新增；纯格式变更是否记版本按现有版本规则和可核验证据判断。
- 日期、版本、修改章节、说明、修订人必须有证据。
- 正式交付物使用成员实名；内部历史日志继续使用 A/B/C。
- 不为匹配 Reference 行数虚构版本，也不删改已有真实历史。

## 9. 正式插图：PowerPoint 可编辑源

Reference 中承担信息表达的图，或正文需要架构图、流程图、时间轴、WBS、风险矩阵、MVP 边界图、闭环图、状态流、部署拓扑、责任关系图时，使用 PowerPoint 绘制并保存可编辑 `.pptx` 源。

禁止用 Mermaid 截图、matplotlib、Word SmartArt、AI 图片生成或不可编辑截图替代正式工程图。位图只能作为从可编辑源导出的兼容版本，不能成为唯一源。

### 9.1 PowerPoint 图形规范

- 节点用 Shape；文字为文本框或 Shape 内文本；连线用 PowerPoint Connector 并吸附锚点。
- 画布按 Reference 图的最终宽高比和 Word 物理尺寸设置，不强制 16:9；四周保留稳定安全边距。
- 使用 Guides、Grid、Align、Distribute；同层节点等高、尽量等宽、间距和基线一致。
- 一个图保持单一主阅读方向：左→右或上→下；主路径优先，支线弱化，避免交叉线。
- Connector 不悬空、不穿字、不穿节点；同级线宽和箭头样式一致，优先水平/垂直折线。
- 字体与 Word 体系协调；同级字号一致，标题 > 主节点 > 注释；插入 Word 后仍清晰。文字过多时重构图，不持续缩小字号。
- 配色严格参考 Pair：白底、少量低饱和度、同语义同颜色、边框统一；禁用彩虹色、渐变、3D 和强阴影；黑白打印仍可区分。
- 同层 Shape 形状、圆角和边框粗细一致，不滥用几何形状。
- 图内使用短语，正文解释留在 Word；文本内边距一致。
- 保存 `.pptx`；优先导出 SVG/EMF，必要时另存高分辨率 PNG。图源放入与正式文档可追溯对应的目录。

### 9.2 图像强制闭环

每张图必须经过：

`PPT 绘制 → PPT 实际渲染检查 → 导出 SVG/EMF → 插入 Word → Word 渲染 → 查看最终页面`

逐项检查无截字、无重叠、连接线不悬空/穿字、对齐正确、字号可读、留白均衡、图宽接近 Reference、Caption 正确、正文引用正确、Word 中不模糊。失败必须回到 PPT 源修改并重新导出，不能只在 Word 中拉伸补救。

MODE-C 不允许重绘成不同信息；只能在不改变图内信息的前提下 resize、reposition、裁空白边缘、调整环绕/锚点、居中及 Caption 距离。若重新导出，源内容必须完全一致。

## 10. 生成与修改流程

### MODE-A / NEW DOCUMENT

1. 建立目标文件、唯一 Reference、工作稿和受控来源清单。
2. 检查/补强工作稿并完成必要 Review。
3. 从 Reference 继承模板骨架与实际样式。
4. 将受控内容映射到骨架；保留正式前置页、目录/附录/签署结构。
5. 按信息图差距生成 PowerPoint 可编辑源并插入。
6. 建立有证据的修订记录。
7. 渲染、逐页比较、修正、重渲染直至 PASS。

### MODE-B / CONTENT EDIT

1. 标出要变更的内容及权威来源。
2. 先修改工作稿并走必要 Issue/Review/Change。
3. 同步正式稿相同内容，不破坏模板样式。
4. 核对修订记录与版本。
5. 验证 work ↔ deliverable 内容一致并渲染。

### MODE-C / FORMAT ONLY

1. 修改前按顺序抽取 paragraphs、table cells、headers、footers、captions 和图内可核验文本，保存 normalization snapshot/hash。
2. 只修改 section、页面、样式、段落属性、表格几何/样式、既有图尺寸/位置、Caption 样式、页眉页脚格式和页码格式。
3. 修改后用同一规则重新抽取；除已声明的自动字段缓存外必须逐项相等。
4. 不相等则立即定位并恢复内容差异，`CONTENT_FREEZE_CHECK` 未 PASS 不得交付。
5. 渲染并逐页比较。

### MODE-D / CONTENT + FORMAT

1. 完整执行 MODE-B。
2. 将经确认的工作稿/正式稿内容作为 FORMAT 阶段 before snapshot。
3. 完整执行 MODE-C；格式阶段不得继续改内容。
4. 分别记录内容变更证据与格式冻结证据。

## 11. 强制渲染与质量门禁

DOCX 完成后必须实际渲染为 PDF/逐页图片，并把目标与 Reference 逐页查看。不能只检查 XML 或只生成文件。

结束前逐项确认：

- [ ] 唯一 Reference 已找到并完整检查
- [ ] 工作稿和受控来源已检查
- [ ] 封面、日期页、修订记录、目录、正文起始页符合 Pair
- [ ] section、页面、字体、字号、间距和分页符合 Pair
- [ ] 每张表已检查
- [ ] 每张图及其可编辑 PowerPoint 源已检查
- [ ] Caption、正文引用、页眉页脚、页码已检查
- [ ] 所有页面已查看，无截断、重叠、越界、模糊、孤标题或异常断表
- [ ] 正式成员姓名正确；不得误替换普通 A/B/C、AB 角、A/B Test 或技术缩写
- [ ] 无教学案例业务内容污染
- [ ] MODE-B/D 的 work ↔ deliverable 一致
- [ ] MODE-C/D 的 FORMAT 阶段 `CONTENT_FREEZE_CHECK = PASS`
- [ ] 修订记录只包含可核验事件
- [ ] Prompt、检查结果、失败和 Git 证据已记录

不得以“基本一致”“整体接近”“差异不影响阅读”作为 PASS 理由。任何失败项必须返回源文件修复并重渲染；真实工具/权限阻塞应记录具体错误和已尝试方案，不得写成成功。

PDF 是发布结果，不替代可编辑源。除非用户明确把 PDF 指定为唯一权威源，否则先维护 DOCX/PPTX，再重新导出 PDF。

## 12. 交付与 Git

仅暂存当前任务相关的工作稿、正式文档、图源、审计和 Prompt 日志。提交前检查差异、格式、敏感信息与案例污染；提交后重新 fetch，普通合并其他成员提交，非 force push 到 `origin/master`，再回填内容 commit 与 push 状态。不得覆盖他人工作或改写共享历史。
