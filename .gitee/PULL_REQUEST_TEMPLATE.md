## 任务与追踪

- Task ID：
- Gitee PR 编号（创建后在同一分支回填）：
- FR / NFR / KN：
- AC：
- 设计 ID：
- 唯一 Review 人：

## 变更与 AI 参与

- 变更范围：
- AI 生成/辅助范围：
- 采纳、修改、弃用说明：
- 风险与影响面：
- 回滚方式：

## 提交者自查

- [ ] 已附 `quality/selfcheck/<Task-ID>.json`，且 `npm run selfcheck -- ...` 或等效任务命令通过
- [ ] 未静默修改冻结 FR/AC/★、关键数字、责任边界、契约或设计
- [ ] 权限、输入校验、参数化访问、密钥、日志脱敏、迁移/回滚均已检查；不适用项有理由
- [ ] 测试与 RTM 可回指 Task、FR/AC、设计 ID

## 门禁证据

- 测试命令与结果：
- 覆盖率（核心模块必须 ≥70%）：
- OpenAPI / 契约结果：
- 安全扫描（高危必须为 0）：
- 本地 `npm run quality` 命令、结果与对应 commit：
- Prompt / Review / 证据路径：
- 审核信息（Review 意见、整改与 Approve；在同一分支持续补充）：

## 合并门禁

- [ ] 唯一 Review 人已 Approve（提交者不得自批）
- [ ] 本地 `npm run quality` 已通过并附真实结果（不表述为远程 CI）
- [ ] 阻断缺陷为 0
- [ ] 功能、测试、RTM、日志和 `tasks.md = DONE` 已包含在本 PR
- [ ] 本 PR 不要求回填自身合并提交哈希；合并后以 Gitee PR 记录为证据，由 G4-11 汇总
