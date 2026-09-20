# G3-13 Deliverable ↔ Reference Pair Manifest

| 检查项 | 结果 | 说明 |
|---|---|---|
| 唯一 Reference | MATCH | 仅使用 `docs/reference/24-配置管理计划（教学样例）.docx` |
| 物理复制基础 | MATCH | 正式件由 Reference 文件物理复制后修改 |
| 页面尺寸、方向、边距 | MATCH | 四 section 的 Reference 属性保留 |
| 页眉页脚距离与 section break | MATCH | Reference 结构保留；项目页眉字段替换 |
| 封面布局与直接格式 | MATCH | 原段落、Tab、间距和分隔线保留，仅替换项目字段 |
| 修订记录页 | MATCH | Reference 表格结构与视觉属性保留；仅保留真实 V0.1 事件 |
| 目录 | MATCH | 保留 TOC 层级、点引线、罗马页码与正文逻辑页码；条目按项目章节更新 |
| 正文起始与页码 | MATCH | 正文逻辑页 1 开始；最终为逻辑页 1—5 |
| styles / basedOn / docDefaults / theme / numbering | MATCH | 直接继承 Reference 包内定义 |
| 正文段落与标题格式 | MATCH | 使用 Reference Heading/Normal/List 体系及有效直接格式 |
| 表格视觉与跨页控制 | MATCH | 使用 Reference 表格格式映射；业务列宽按内容调整 |
| 图片与题注 | STRUCTURAL_DEVIATION | 项目内容以表格完整表达，无业务插图；未复制教学案例流程图，避免案例污染 |
| 页级视觉结果 | MATCH | Word 16：Reference 6 页；正式件 8 页，8/8 全页 PASS |

`STRUCTURAL_DEVIATION` 仅表示业务内容不需要教学案例插图，不影响 Reference 的物理格式继承，也未引入自创视觉体系。
