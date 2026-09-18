# G3-06 `ISSUE-G3-06-001` B 整改记录

- 日期：2026-09-18
- 主责：B
- 模式：MODE-D / CONTENT + FORMAT
- 整改对象：`docs/deliverables/14-接口设计说明书.docx` V0.2
- 唯一格式 Reference：`docs/reference/14-接口设计说明书（教学样例）.docx`
- 结论：**RESOLVED_BY_B / PENDING_A_C_REREVIEW**

## 1 审核意见与实际修复

| 审核意见 | 修复动作 | 验证结果 |
| --- | --- | --- |
| 缺少与 Reference 同粒度的 REST 接口交互图 | 在工作稿 §2.1 补充同步事务、Outbox 异步副作用、外部适配和门禁超时边界；按 PowerPoint 规则生成图 2-1 | 正式件含 1 张图、唯一题注和正文引用；PPTX 为 14 个原生 Shape、13 个原生 Connector，可编辑源、EMF、PNG 齐全 |
| 表 2-1 窄列逐字断行 | 禁止 AutoFit，重建固定 `tblGrid`；按编号、路径、operationId、用途、FR 重新分配列宽 | WPS 与 Word 中词组连续，无逐字竖排、越界或断表 |
| 表 7-1 窄列逐字断行 | 固定四列比例，扩大“接口或端口落点”和“后续验证入口”列 | WPS 与 Word 中 39 行追踪均可读，未丢失 FR/AC/★ |
| 缺少跨渲染稳定性证据 | 以 WPS、Microsoft Word 分别渲染 Reference 和整改稿并逐页查看 | 两种渲染器均为 Reference 9 页、整改稿 23 页；整改稿 23/23 页 PASS |

## 2 PowerPoint 图件规则检查

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| 画布匹配 Reference 最终比例 | PASS | 720×362 pt，Word 中 6.10×3.07 in |
| 节点为 Shape、交互线为 Connector | PASS | 14 个原生 Shape、13 个原生 Connector |
| 单一阅读方向 | PASS | 自上而下时序；请求深蓝、回执橙色虚线 |
| 同层等高、对齐、统一边框 | PASS | 五个参与者节点同高等宽，中心线等距 |
| 配色与字体 | PASS | 白底、低饱和蓝/沙/绿/灰；宋体；无渐变、3D、强阴影 |
| 可编辑源与兼容导出 | PASS | `14-图2-1-REST接口与外部适配交互时序.pptx/.emf/.png` |
| PPT 实际渲染与 Word 插入 | PASS | PowerPoint 导出 2400×1207 PNG 后检查；Word 嵌入、题注、正文引用与替代文本完整 |

## 3 Pair-specific Manifest

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 页面、方向、边距、section | MATCH | 继续物理继承唯一 Reference 的 3 个 A4 section 和页面属性 |
| 封面、修订记录、目录、正文起始 | MATCH | 保留 Reference 骨架；新增有证据的 V0.2 修订记录；目录字段刷新 |
| styles、numbering、theme、header/footer | MATCH | 生成后恢复 Reference 对应 OOXML 部件 |
| Heading、Normal、Caption | MATCH | 沿用 Reference 段落与 run 属性；图题取 Reference 图题样式 |
| 表格视觉体系 | MATCH_WITH_CONTENT_GEOMETRY | 继承表头、边框、字体、cell 属性；按项目列数和内容固定列宽 |
| 插图尺寸、位置、留白 | MATCH | 与 Reference 图 2-1 同为 6.10×3.07 in、居中、题注紧邻 |
| 教学案例隔离 | MATCH | 未检出“澜图、遥感影像、QGIS、SegmentEngine、samgeo、segment-geospatial” |
| 结构差异 | STRUCTURAL_DEVIATION_ACCEPTED | 项目有 8 章、8 张编号表，内容量高于 Reference；属于项目受控需求展开，不为对齐页数删减 |

## 4 内容与追踪冻结检查

- 内容阶段仅新增图 2-1 的项目化交互语义和正文引用；未修改 OpenAPI 路径、字段、错误码、FR、AC、★、关键数字或责任边界。
- 格式阶段只调整表格固定布局、列宽和目录字段缓存；工作稿与正式件均保留 39/39 FR、117/117 AC、39/39 API-TR、34★和 5 条非★。
- `CONTENT_FREEZE_CHECK = PASS`：格式阶段前后受控接口、FR、AC、★、关键数字和未决状态集合一致；仅 Word 自动目录字段缓存按规范刷新。
- `ISSUE-G3-01-001` 继续 OPEN；视频与统一消息真实外部字段、认证、回执和现场性能仍为 `PENDING_EXTERNAL_EVIDENCE`，没有被本次版式整改误写成已通过。
- 合同审计：`logs/reviews/2026-09-18_G3-06-contract-audit.json` = PASS。
- 整改审计：`logs/reviews/2026-09-18_G3-06-remediation-audit.json` = PASS。

## 5 双渲染逐页检查

| 渲染器 | Reference | 整改稿 | 全页结论 |
| --- | ---: | ---: | --- |
| WPS | 9 页 | 23 页 | 23/23 PASS |
| Microsoft Word | 9 页 | 23 页 | 23/23 PASS |

逐页检查覆盖封面、修订记录、目录、图 2-1、全部表 2-1、表 7-1 续页、其余正文与页脚。未发现截字、重叠、越界、模糊、孤标题、图题分离、中文逐字竖排或异常断表。PDF、逐页 PNG 与 contact sheet 仅作为临时 QA 缓存，不纳入提交。

## 6 准出判断

`ISSUE-G3-06-001` 已达到主责整改完成条件，状态更新为 `RESOLVED_BY_B / PENDING_A_C_REREVIEW`。G3-06 继续保持 REVIEW；A、C 均复核通过后才能关闭该 Issue 并决定是否置为 DONE。`ISSUE-G3-01-001` 的外部证据阻断关系不变。
