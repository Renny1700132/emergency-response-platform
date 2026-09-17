# G3-05 B 格式整改记录

- 日期：2026-09-17
- 模式：FORMAT ONLY
- 对应问题：`ISSUE-G3-05-001`
- 结论：REMEDIATED / PENDING UNIQUE REVIEW REREVIEW

## 1 内容冻结

整改前正式件保存为本地冻结快照，按正文段落、表格单元格、页眉、页脚和内嵌媒体建立有序载荷。整改后使用相同算法复取，前后可见内容哈希相等，`CONTENT_FREEZE_CHECK = PASS`。本轮未修改工作稿、FR、AC、★属性、RCLR、关键数字、责任边界、章节结构、图内信息、Caption 文本或修订记录文本。

## 2 直接格式整改

1. 封面各字段保留 Reference 的原 `pPr`，并复制对应首个 run 的 `rPr`，修复此前仅保留段落位置但丢失标题字号/字重的问题。
2. Heading 1、Heading 2、Normal、List Paragraph、图题和表题分别从 Reference 同角色样本复制直接段落与文字格式。
3. 业务表复制 Reference 实现要点表的 `tblPr`、表头/正文 `tcPr`、段落和文字格式；本项目不同列数、列宽和跨页表头作为结构偏差保留。
4. 4 张业务图统一映射 Reference 首张业务图的物理宽度、行内位置及周边段落格式，高度按各图宽高比自适应。
5. 将 Reference 的 styles、numbering、theme、settings、header/footer 包部件逐项恢复到正式件；逐项散列均为 MATCH。
6. 表题在 Reference 格式基础上增加 `keep-with-next`，避免表 12-2、表 12-3 的 Caption 孤立于前页。该项作为有理由的直接格式偏差记录，不改变文本。

## 3 Pair Manifest 与结构偏差

逐元素结果见 `logs/reviews/2026-09-17_G3-05-pair-manifest.json`。页面/section、包部件、封面、标题、正文、列表、图题、表格属性及映射单元格格式均已列明 MATCH/MISMATCH。保留的结构偏差为：

- 本项目冻结内容为 14 章、132 段、11 表、4 图，Reference 为 10 章、208 段、23 表、2 图；
- 多列表格列数、列宽、跨页重复表头与禁止拆行按冻结业务结构保留；
- 业务图数量和高度随内容变化，但宽度与段落/Caption 格式直接继承；
- 表题额外使用 keep-with-next 防止与对象分页分离。

未通过删减、合并或补写业务元素伪造结构数量一致。

## 4 同渲染器全页复验

Reference 与整改稿均使用 WPS `Kwps.Application` 渲染。Reference 为 14 页，整改稿为 20 页；页数增加来自恢复 Reference 正文和表格字号、行距及直接格式。已逐页检查整改稿 1—20 页，具体页面结论写入 Pair Manifest。

最终未发现封面错位、案例残留、截字、重叠、越界、字体替换、表题分离、重复/缺失表头、孤标题、异常留白或页眉页脚错误。追踪复验仍为 39/39 FR、34/34★、117/117 AC、39/39 DLD-ID，缺失与错标均为 0。

## 5 状态

`ISSUE-G3-05-001` 已由 B 完成最小整改，更新为 `RESOLVED_BY_B / PENDING_UNIQUE_REVIEW_REREVIEW`。G3-05 保持 REVIEW，等待唯一 Review 人复验后决定是否关闭 Issue 并置为 DONE。`ISSUE-G3-01-001` 保持 OPEN。
