# G1-02 BASELINE-G1-V0.1 冻结前机械检查

- 执行人：A
- 日期：2026-09-10
- 检查对象：`control/baselines/BASELINE-G1-V0.1.md`
- 结论：PASS；允许设置 `FROZEN_FOR_BID_DRAFTING`
- 人工复核状态：A/B/C 决策由当前用户 Prompt 确认；本文只记录 A 的机械检查，不虚构签名或发言

## 1. 冻结门禁

| 检查项 | 结果 | 证据/说明 |
| --- | --- | --- |
| Baseline 结构完成 | PASS | Metadata 至 Confirmation 共 16 个编号章节，采用短正文和控制文件引用 |
| facts 机械核对 | PASS_WITH_RECORDED_DIFFERENCE | 39 条 FR、11 个域、项目定位、范围、既有系统、责任与原需求一致；facts 中澄清前状态文字由 DEC-001～012 覆盖，未由 A 改写 |
| key_numbers 机械核对 | PASS | 指定 20 个真实 KN 编号全部存在；值、单位、方向和条件逐项一致 |
| compliance_matrix 机械核对 | PASS_WITH_G1-05_FOLLOWUP | 当前矩阵只有模板行；对原需求/条款目录完成指定门禁检查，未发现 ★负偏离。完整矩阵仍由 G1-05 填充 |
| 12 项 Issue 裁决 | PASS | `ISSUE-G1-01-001`～`012` 共 12 项，均已写入确认裁决并保留历史 |
| Blocking Issue | PASS | 精确检查无 `OPEN / BLOCKING` 或待裁决状态；`BLOCKING = 0` |
| 范围冲突 | PASS | 无本 Prompt 未覆盖的新 In/Out Scope 或甲乙责任冲突 |
| ★负偏离 | PASS | 视频回放与门禁均采用强制口径，H5 保留 F-08 六类业务，范围外既有系统仍保留接口响应 |
| A/B/C 确认证据 | PASS | 当前用户 Prompt 明确说明决策已由 A/B/C 讨论并由用户确认 |
| Review 决策记录 | PASS | `logs/meetings/2026-09-10_BASELINE-G1-V0.1.md` 已生成 |

## 2. 20 项关键数字核对

以下编号在 Baseline 与 `control/key_numbers.md` 中一一存在并一致：

`KN-003`、`KN-011`、`KN-012`、`KN-006`、`KN-007`、`KN-008`、`KN-009`、`KN-010`、`KN-034`、`KN-035`、`KN-036`、`KN-016`、`KN-017`、`KN-028`、`KN-037`、`KN-040`、`KN-041`、`KN-045`、`KN-030`、`KN-043`。

核对结论：20/20 通过，无重复 KN、无方向反转、无单位扩大。`KN-017` 保留原索引中的“默认不超过 60 秒”条件；`KN-040` 保留“计划内维护除外”条件。

## 3. 合规专项检查

- ★条款：Baseline 不复制或改写 39 条 FR，要求完整 FR 与 ★属性回指事实索引、条款目录和原需求。
- H5：只改变交付形态，不删除 FR-08.1～FR-08.6 六类移动业务能力。
- 视频：历史录像回放按强制要求冻结，录像存储/不低于 30 天保存由既有视频系统承担。
- 门禁：按“应支持”冻结，并保留授权确认、安全联锁、失败告警和人工降级。
- 范围：外部系统自身建设/硬件采购在范围外，但接口适配、联调、验证和交付仍在范围内。

## 4. A 工作稿检查

`project_positioning.md` 与本基线在项目定位、11 个域、H5、视频、定位、门禁、消息、中台、地图、部署、数据、等保和匿名称谓方面一致。本次只修订状态说明和正式第三方等保测评组织责任，没有无意义重写正文。

## 5. B 技术方案一致性 Review

A 未修改 B 的任何文件。G1-04 V0.2 的技术架构、边界和验证措施总体不违反冻结 Baseline，但存在以下澄清前旧口径，交 B 在 G1-04 中修订：

| Review ID | 文件/位置 | 发现 | 处理 |
| --- | --- | --- | --- |
| G1-02-TECH-REV-01 | `G1-04_technical_solution_v0.2.md` 状态、§1、§11 | 仍写待基线/待澄清、ISSUE-001～003 未决、G1-02 由 C 冻结 | NON_BLOCKING；B 更新为引用 `BASELINE-G1-V0.1` 与已裁决状态 |
| G1-02-TECH-REV-02 | 同文件 Mermaid 用户端节点 | 写“移动端或 H5” | NON_BLOCKING；B 收敛为 Web/H5/指挥大屏，不暗示另交原生 APP |
| G1-02-TECH-REV-03 | `G1-04_technical_questions.md` 状态与 Issue 映射 | 仍把 H5、等保等列为需求待澄清 | NON_BLOCKING；B 将已裁决需求改为实施/验证条件，不重新提问 |
| G1-02-TECH-REV-04 | 视频、定位、消息、中台、门禁等条件表 | 技术措施基本一致，但 Issue 状态未同步 | NON_BLOCKING；B 保留验证事项并移除需求 Blocking 表述 |

这些差异位于仍为 `DOING` 的 B 工作稿，不改变本次已确认的 Baseline，也不构成冻结阻塞。

## 6. 文件保护与日志检查

- 原始用户需求书 SHA-256：`045F1E4083AF5D7CB8C3A18451A6D4F173D1F5F5B85EE7187D989CA36037B28A`，与既有事实索引一致，未修改。
- `control/facts.md`、`control/key_numbers.md`、`control/compliance_matrix.md` 未由 A 改写。
- B 的技术方案、问题与风险文件未修改。
- 旧 `logs/prompts/2026-09-09.md` 未修改。
- 本次 Prompt 在 `logs/prompts/2026-09-10-A.md` 与对应 `prompts/` 文件中的原文块机械比对一致。

## 7. 结论

冻结条件全部满足。已识别差异均为本 Prompt 已裁决的旧状态或下游非阻塞修订项，不存在未经裁决的 ★、关键数字、范围或责任冲突。允许将 Baseline 状态设为 `FROZEN_FOR_BID_DRAFTING`，并将 G1-02 标记为 DONE。
