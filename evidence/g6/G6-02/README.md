# G6-02 交付清单、RTM验收挂接与审计数据包

状态：`REVIEW（ACCEPTED_FOR_INITIAL_G6_02_CANDIDATE；PENDING_G6_01_AND_G6_03_INCREMENT）`。

本包是可与 G6-01 并行使用的首版证据账，不是第六关最终归档。G6-01 两本手册/命令台账、G6-03 试演/现场记录及 G6-04 总结/移交尚未形成，因此缺项均显式标为 `NOT_AVAILABLE / PLANNED / REAL_WORLD_DEFERRED`。

- `delivery-index.md/json`：唯一交付/证据索引，覆盖 P1 §10.3/§10.4 与课程提交项。
- `standards-crosswalk.md`：GB/T 8567教学类别与P1/CM-150—156逐项映射。
- `rtm-acceptance-increment.md/json`：39 FR / 117 AC / 34★FR 的 G6 验收增量；不改写 G5 原始结果。
- `audit-records.md`：文档、部署/可移植性、AI 三线审计增量。
- `metrics-ledger.md`：可复现指标与未知项口径。
- `gaps-deferrals.md`：缺项、延期、责任、触发器和验证条件。
- `selfcheck.json`：机械自检结果。
- `review-request.md`：B 整体复核请求及后续增量边界。
- `b-review.json`：B 对索引、RTM、性能分母和真实边界的独立机械复验结果。

B 已接受本包作为首版并行输入；正式记录见 `logs/reviews/2026-10-11_G6-02-B-review.md`。该接受不自动迁移为最终 DONE。

真实边界：11 PASS / 59 NOT_RUN / 47 BLOCKED；★FR 1 PASS / 33 BLOCKED；甲方系统真实0/6；真实非乙方独立部署操作者0。课程条件收口不等于真实生产验收。
