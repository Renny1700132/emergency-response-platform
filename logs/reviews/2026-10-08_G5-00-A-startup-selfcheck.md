# G5-00 A 启动自检与治理Review留痕

- 日期：2026-10-08；主体：A / Codex辅助自检；独立C人工Review：PENDING_REVIEW，未执行，未代签。
- 授权：本次P0要求G5-00完成自检后DONE、直接push；OVR-032记录工程方法覆盖。
- 范围：输入归档、当前治理、四长任务/DoD、范围适用性与硬门禁；未运行G5-01/02业务测试或压测、未生成正式测试报告。
- 实际自动检查：`python evidence/g5/G5-00/check-governance.py`，25项均PASS；`git diff --check` exit 0；JSON见同目录evidence。
- 全仓关键词：当前基线tracked文本扫描121个命中文件/980行（含历史日志）；明细 `evidence/g5/G5-00/keyword-inventory.json`。当前治理AGENTS/README/constitution/tasks/governance/quality均有G5直接master与G4历史边界；.gitee模板备用；其他命中为日志/Review/evidence、冻结Reference/工作稿、旧生成脚本、APPROVE_ADJUSTMENT业务审批枚举等，保留。
- G4专项仅新增顶部历史说明；G4 tasks表各行与证据/Review/RTM/设计/基线未改。当天A日志及issues/overrides/change_log仅追加。constitution当前流程补充有CHG-G5-00-001与P0授权，不重写G3冻结manifest。
- 三审采用指导书§8.1具体三线，§1.3.4一致性核查纳入文档审计；影像算法N/A不免除KN-009定位源精度。
- 风险：ISSUE-G5-00-001保持OPEN，仅阻断最终G5全量准出；目标环境/真实外部/H5宿主/独立部署人仍待测试就绪确认。
- 异常：默认执行通道启动失败，获准执行通道成功；原文日志写入前提前读取部分治理文件，已在LOG-G5-00-001披露。PDF Skill版本路径失效后定位到26.1007.11041；PyMuPDF未安装，改用现有pdftotext读取，未安装依赖。一次Issue补丁未匹配，随后追加成功。
- 结论：G5-00启动范围自检通过，可按本次P0置DONE并安全commit/push；不代表G5最终门禁通过或C独立审核完成。
