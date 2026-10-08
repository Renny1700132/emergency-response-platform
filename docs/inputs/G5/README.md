# G5 输入索引

- 任务：G5-00；归档人：A / Codex 辅助；2026-10-08。
- 结论：必需任务书和公共指导书可读，G3/G4 受控输入已在 master；本环境未发现额外 G5 课件/指导材料。当前输入足以启动规划，目标环境/宿主/真实外部账号并未因此齐备。

| 输入 | 位置与状态 | 用途/边界 |
|---|---|---|
| G5 原始任务书 | 本目录 `通关实验任务书5-质量门禁.pdf`，5 页；SHA-256 `2EB41FDAA684D590069FCEF189CB87419EC0034AF6E5E5AB96150D1B13EAFE07` | 从主目录用户已提供的未跟踪原文件物理复制，内容未改；全文读取。§二—四要求三级测试、P99、八特性、四成果、集成100%、每需求PASS、三审无阻断；§六禁止编造 |
| G5 其他课件/指导材料 | 主目录及当前 master 的 G5 输入目录未发现 | 当前 P0 如存在则读取；实际未发现，不虚报读取 |
| 公共学生指导书 | `../common/AI 辅助软件项目全生命周期开发·综合实习指导书（学生用书）.pdf` | 读取 G5 第7章和审计相关第8章、通用纪律；教学案例事实不引入项目 |
| G3 测试计划 | `../../work/C_REQ/test_plan.md`；冻结正式件见 M3 manifest | 39FR/34★/117AC/117TC，PE/NFR、缺陷及准出；历史 REVIEW/OPEN 表述是冻结当时快照，不回改 |
| G3 基线 | `../../../control/baselines/BASELINE-G3-M3-R1.0.md`；`../../../logs/reviews/2026-09-21_G3-10-M3-final-audit.json` | FROZEN；唯一受控设计输入，不重写 |
| SRS/spec | `../../work/A_PM/software_requirements_specification_v0.1.md`；`../../work/B_TECH/spec.md` | 39 FR/117 AC、责任边界、PE、定位精度；影像算法 N/A 依据 |
| RTM v4 | `../../work/C_REQ/rtm_v4.md`；`rtm_g4_evidence.md` | G4 29FR/87AC 与10项 backlog 如实保留；不是 G5 结果 |
| G4 最终测试/性能/故障 | `../../../evidence/g4/G4-10/`；`../../../scripts/g4/run-final-verification.mjs` | JSON、87AC矩阵、8端口四场景；性能原始JSON只有P95，没有P99 |
| coverage/E2E/缺陷 | `../../../logs/reviews/2026-10-08_G4-09-11-C-rereview.md`；`../../../evidence/g4/G4-07/sprint1-gate-report.md`；`../../../control/issues.md`；`../../../frontend/tests/real-stack-e2e.test.ts` | 报告/脚本/复验记录存在；当前不把历史报告重标为G5实跑或完整机器原始数据；缺原始输出须重跑 |
| G4 收口 | `../../../evidence/g4/G4-11/closeout-audit.md`；`../../../control/g4_final_sprint_state.md` | C复验、PR !16 merge `5b31e0f`、G4 DONE；课程MVP不等于真实生产验收 |
| 当前治理 | 根 AGENTS/constitution/README/tasks，`../../../governance/` | G5 按 OVR-032 安全直接 push master；历史规则限定G4 |

## 三项课前审计来源判定

G5任务书第3页§四只写“三项课前审计无阻断项”，未列名称。测试计划未给“三项课前审计”定义。公共指导书PDF第315页（印刷309）§8.1/8.1.2具体明确文档审计、可移植性批量验证、AI使用审计，第317页§8.2称文档审计为课前三大审计第一项，因此采用这组三线。指导书PDF第13页§1.3.4概述还列“文档审计、AI使用审计、一致性核查”；作为文档审计的一致性维度补充覆盖，不能以该概述漏掉干净部署。此解释记录为 PFC-G5-00-003，并未改动教学原文。

## 适用性

N/A：本应急管理信息系统无适用的冻结影像集算法精度指标。SRS/spec和G3 NFR没有图像识别/分类/检测算法评测要求；视频调阅、地图、拍照附件不构成影像算法。PE-05 / KN-009 人员定位源精度不属于此N/A，仍须验证传递不降低源精度及KN-008刷新。
