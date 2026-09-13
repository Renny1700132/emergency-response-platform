# G2-01 故事语义修订：C 自检

- 任务：G2-01（修订）
- 主责 / 复核：C / B
- 触发：ISSUE-G2-02-001
- 状态：REVIEW
- 结论：CANDIDATE_READY_FOR_B_REVIEW

## 修订核验

| 故事 | 修订后语义 | FR | 冻结依据 | 结果 |
| --- | --- | --- | --- | --- |
| US-017 | H5 发起事件、拍照、查看本人事件 | FR-08.1★ | F-128 / G2-FR-021 | PASS |
| US-019 | H5 查看、执行演练并提交结果 | FR-08.4★ | F-131 / G2-FR-023 | PASS |
| US-022 | 盘点计划、移动结果比对和差异标识 | FR-03.4★ | F-111 / G2-FR-009 | PASS |
| US-024 | 打卡小组、时段、点位和代执行留痕 | FR-06.1★ | F-119 / G2-FR-017 | PASS |

## 全量检查

- 用户故事 ID：US-001—US-029，共 29 条、连续、无重复。
- MoSCoW：Must 29 条；关联的唯一 MVP FR 为 29 条，无缺项、无额外项。
- 非 MVP：10 条仍按 Should/Could 保留本期范围；无 Won't。
- 四条修订未改变 FR 编号、★属性、数字、责任、范围或验收强度。
- `control/g2/requirements_catalog.md` 已与修订稿一致。
- `software_requirements_specification_v0.1.md` 与 `spec.md` 中 G2-FR-009、017、021、023 均使用正确 canonical FR 语义，没有继承旧错误；未修改 A/B 主责文件。
- 原始需求和课程输入未修改；课程课件未读取；无教学案例事实污染。
- 非 Prompt 日志文件 `git diff --check`：PASS。完整检查仅报告 `USER_PROMPT_RAW` 末尾两个空格；该空格来自当前用户 Prompt 原文，按逐字留痕规则原样保留，不属于业务产物格式错误。

## 准出意见

ISSUE-G2-02-001 的 C 侧修订与下游影响检查已完成，状态保持 `OPEN / C_FIX_READY / PENDING_B_REVIEW`。G2-01 进入 REVIEW；仅在 B 明确复核通过后才能恢复 DONE 并关闭 Issue。
