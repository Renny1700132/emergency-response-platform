# G6-04 最终归档INDEX（送审快照，未冻结）

源master：3b47e8f97caac1fa6dc989fd1ff5279bd1eb5450。本INDEX为A最终归档视图，上游唯一交付/验收索引仍是C的G6-02 delivery-index.json。路径存在、受控历史状态与验收接受分开；不重算C的29项与三段增量。

机器完整索引：final-archive-index.json，逐项包含文件/路径/版本/hash/状态/字节/C配置项映射。第三方先校验physical SHA256，再按sourceMaster与inputGitBlobSha256核对canonical Git blob；行尾转换可能改变物理hash，不改变内容。Git事件全集见git-history.txt，commit可在仓库历史定位。

| 类别 | 归档记录数 | 状态边界 |
| --- | --- | --- |
| 控制/治理/计划 | 32 | 存在性与历史归档；不推导验收PASS |
| 正式文档 | 116 | 存在性与历史归档；不推导验收PASS |
| RTM | 9 | 存在性与历史归档；不推导验收PASS |
| G6移交源 | 15 | 存在性与历史归档；不推导验收PASS |
| 测试/质量/Git过程证据 | 337 | 存在性与历史归档；不推导验收PASS |
| G6-04制作/启动留痕 | 15 | 存在性与历史归档；不推导验收PASS |
| Prompt日志 | 70 | 存在性与历史归档；不推导验收PASS |
| Review记录 | 321 | 存在性与历史归档；不推导验收PASS |

## 未到位的计划路径

- CI-017：培训材料与记录，`evidence/g6/G6-01/training-records.md`；NOT_AVAILABLE / DEFERRED；hash未知/无文件。
- CI-018：试运行报告，`evidence/g6/G6-04/trial-operation-record.md`；NOT_AVAILABLE / DEFERRED；hash未知/无文件。
- CI-020：验收签署记录，`docs/deliverables/G6/47-验收报告.docx`；NOT_AVAILABLE / DEFERRED；hash未知/无文件。
- CI-021：基础数据初始化与双方确认，`evidence/g6/G6-04/data-initialization-acceptance.md`；NOT_AVAILABLE / DEFERRED；hash未知/无文件。
- CI-028：G6答辩PPT与讲稿，`docs/deliverables/G6/G6-验收答辩.pptx`；NOT_AVAILABLE / DEFERRED；hash未知/无文件。
- CI-029：G6试演/现场运行记录，`evidence/g6/G6-03/live-run-record.md`；NOT_AVAILABLE / DEFERRED；hash未知/无文件。

## G6-04送审包

事实基线、总结工作稿、46号DOCX/PDF、technical_debt_transfer、AI留档计数、偏差/债务JSON、A自检与一致性审计、C/B复核请求均在机器INDEX定位。真实现场、签署、培训、试运行及补测仍按移交债务处理。当前可变日志/任务/控制状态由后续Git对象验真；INDEX不包含自身hash，避免无限回填。
