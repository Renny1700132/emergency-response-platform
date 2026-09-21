# G4-00｜第四关研发冲刺启动与任务规划

- 状态：DONE（A 自检；按用户明确授权关闭）
- 主责：A（何思源）
- 唯一 Review 人：C（任俊强）
- 前置：`G3-10 = DONE`；`BASELINE-G3-M3-R1.0 = FROZEN`；用户已明确启动第四关

## 输入状态

| 输入 | 状态 | 使用边界 |
| --- | --- | --- |
| `control/baselines/BASELINE-G3-M3-R1.0.md` | FROZEN / VERIFIED | 第四关唯一受控设计输入；不得原位修改 |
| `docs/inputs/G4/通关实验任务书4-研发冲刺.pdf` | ARCHIVED / READ | P2 阶段方法、提交物与过关条件 |
| `docs/inputs/G4/第 6 章 第四关：研发冲刺.pdf` | ARCHIVED / COURSEWARE_NOT_USED | 检测为 PowerPoint 生成的课程课件；按规则不作为裁决来源 |
| G2 SRS/spec/RTM、G3 设计/OpenAPI/测试计划 | FROZEN INPUT | 需求、AC、设计、契约和验证追踪 |
| `prototype/` | REFERENCE_ONLY | 仅 UI/交互参考；localStorage、Mock、prototypeStore 禁止转正 |

## Preflight Conflict Check

- 未发现 P0 与真实《用户需求书》、G4 任务书或冻结基线之间的事实冲突。
- 方法覆盖：旧 Git 工作流允许直接在 `master` 工作；P0 要求第四关功能分支 + PR 与受保护主干。采用 P0，并以 `governance/g4_development_workflow.md` 自 G4-01 起生效。G4-00 仅作为治理切换启动提交按旧安全推送规则收口。
- 覆盖率沿用 P1/冻结设计的 `KN-045：核心模块单元测试覆盖率 ≥70%`；未采用课程课件中任何额外阈值。

## Sprint 编排

- Sprint 1：G4-01—07。G4-01 建门禁；G4-02/03/04 尽量并行；G4-05/06 尽量并行；G4-07 做闭环质量准出。
- Sprint 2：G4-08—11。G4-08/09 尽量并行；G4-10 完成最终质量验证；G4-11 汇总 RTM v4、PR/迭代证据与 AI 资产并收口。
- 优先目标：`G2-FR-001—029` MVP Must。`G2-FR-030—039` 保留本期 backlog，不删除、不改需求。

## 执行链与统一 DoD

- A：G4-00 → G4-03 → G4-06 → G4-09 → G4-11
- B：G4-02 → G4-05 → G4-08
- C：G4-01 → G4-04 → G4-07 → G4-10
- DoD：任务/AC 明确 → Prompt 留痕 → 实现 + 测试 → 自查 → 队友 Review → CI 全绿 → PR 合并 → RTM/tasks 更新。

## G4-00 自检

- [x] G3-10 DONE、M3 基线 FROZEN、用户启动三项前置均已核对。
- [x] G4 输入已归档并建立索引；课程课件不参与规则裁决。
- [x] README、AGENTS、tasks/docs/governance 的阶段状态已切换；未修改 G3 冻结成果。
- [x] 两个 Sprint、功能分支/PR、受保护主干、五环门禁、留痕和统一 DoD 已落盘。
- [x] 12 项 G4 原子任务具有唯一主责、唯一 Review 人、依赖、输出和可验证完成条件。
- [x] MVP Must 与 backlog 边界、三人执行链、并行组和 Prototype 边界已明确。
