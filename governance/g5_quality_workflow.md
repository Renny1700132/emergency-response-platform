# 第五关质量门禁工作流

- 生效：2026-10-08，自 G5-00 起；P0 授权 / OVR-032。
- 当前阶段：质量门禁（测试与质量特性验证）。G4-00—11 DONE；G5-00 只启动，不执行 G5-01/02。
- 唯一受控设计输入：BASELINE-G3-M3-R1.0；继承 SRS/spec/RTM v4、FR/AC/★、PE/KN、责任及验收条件。
- 范围：验证、已有能力缺陷修复、质量收口；不新增功能，不实现 G2-FR-030—039 backlog。

## 长任务与 Review

只设 G5-00—03 四项正式 Task，子检查不独立建 Task/分支/Review。A 执行 G5-00→G5-03；C 执行 G5-01（A Review）；B 执行 G5-02（C Review）；C 最终复核 G5-03。G5-01/02 可并行，G5-03 等两项完成。

G5-00 依据本次 P0 在输入归档、治理切换、规划和自动自检完成后置 DONE；这是启动自检关闭，不冒充 C 独立 Review。G5-01/02 每个长任务整体完成后一次 Review；发现阻断必须整改、复测、复核，不因“一次 Review”限制免除必要复验。依 OVR-033，G5-01/02 的本地候选和 Review 已形成但仍有外部资源阻断时，G5-03 可先开展报告草拟和演示准备。依 OVR-034，G5-02 可用显著标记的 `SIMULATED_EVIDENCE` 形成 `COURSE_CONDITIONAL_ACCEPTANCE` 候选，但必须把甲方真实环境和真实非乙方部署保留为 `REAL_WORLD_DEFERRED`；B 只置 REVIEW，C 接受后方可课程 DONE。依 OVR-035，G5-01 保留 11 PASS / 59 NOT_RUN / 47 BLOCKED 和★FR 1 PASS / 33 BLOCKED 的真实结果，将未实现、未执行、兼容/宿主/真实用户缺口分别标为 `IMPLEMENTATION_DEFERRED`、`EVIDENCE_DEFERRED`、`REAL_WORLD_DEFERRED` 后形成课程条件验收候选；C 只置 REVIEW，A 接受后方可课程 DONE。G5-03 经 C 最终复核时必须分列课程准出与实现/真实世界后续补测，不得把条件验收写成无条件生产 PASS。

## 当前 Git 流程

START → 确认 master / status / remote → fetch origin master → pull --ff-only origin master → USER_PROMPT_RAW → 长任务实施 → 自动测试/人工检查 → 必要 Review 留痕 → tasks/RTM/evidence/日志 → diff --check 与 staged diff 检查 → commit → 再 fetch origin master → 安全处理远程变化 → 非 force push origin master → 日志回填 → END。

- 不要求功能分支、Gitee PR、Approve、PR Merge、Jenkins/Gitee Go/远程 CI。Review 在 logs/reviews/、Issue 或 quality evidence 留存任务、版本、意见、整改与结论；本地门禁不得表述为远程 CI。
- 开始时未提交修改来源不明：原样保留，使用同仓库干净 master 工作树；不能隔离时才暂停。不得 stash/reset --hard/清理覆盖他人工作。
- 远程仅领先则安全 fast-forward；双方分叉则普通 merge，唯一可判定的冲突可保留双方意图后处理；语义不确定才暂停。重新执行受影响检查，再 push。
- 禁止 force、rebase/amend 已共享历史、reset --hard 丢弃工作。push 被拒绝则重新 fetch/安全合并/检查；保留真实失败。
- 每个长任务有 commit、真实执行或启动自检证据、原文日志和必要 Review。首次 push 后独立回填小提交，不记录回填自身 hash，不形成无限自引用。
- 并行是角色活动并行，不允许在同一脏工作树同时写入。共享 master 提交/push 串行；各角色准备独立证据，提交前重新同步。并行修改同一文件须协调归属，不能覆盖对方。

## 硬门禁与证据

三级测试完整；集成最终 100% PASS；★全部核验；每条需求至少一条真实 PASS；RTM 无断链；P99 真实原始数据；缺陷登记/分级/整改/复测/关闭；严重缺陷不带入 G6；八大质量特性有可复核证据；故障/异常恢复；Docker 干净部署；核心 coverage≥70%；OpenAPI 零 schema error；静态无阻断、高危清零；三项课前审计无 BLOCKER；四类正式交付齐套。任何缺证据、未执行、环境不满足均如实 NOT_RUN/BLOCKED，不编造 PASS。

三项课前审计采用公共指导书 §8.1—8.4、§8.6 的具体三线：文档审计、可移植性批量验证、AI 使用审计。项目执行检查和依据见 g5_quality_gate_plan.md，不以自定义三审冒充教学原文。

完整 checklist、可简化项、适用性、风险、四类报告和原始数据规范见 `docs/work/A_PM/g5_quality_gate_plan.md`。OVR-034/035 仅改变课程阶段准出口径，不修改真实项目事实、★条款、PE/KN或后续履约责任。历史 G4 PR、Review、日志、evidence 与冻结文件原样保留；G4 专项治理仅用于解释历史。
