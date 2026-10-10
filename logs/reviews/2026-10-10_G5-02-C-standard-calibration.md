# G5-02 C 复核标准校准

- 校准人：C（任俊强；当前用户授权 Codex 辅助复核）。
- 校准时间：2026-10-10 11:19 +08:00。
- 依据：用户直接指令“可以将标准适当放宽一点”。
- 校准对象：第五轮复验中的 ISSUE-G5-02-008 严重度与当前 Docker 证据接受结论。
- 结论：第五轮对 008 的问题识别保留，但 `MAJOR / BLOCKING` 定级偏严；现降为 `MINOR / NON_BLOCKING_IMPROVEMENT`，接受本轮 Docker 核心部署与退出清理结果。G5-02 仍因 ISSUE-G5-02-001/002 外部资源阻断保持 `BLOCKED`。

## 1 校准理由

- 本轮原始日志和 JSON 直接证明实际用时 17 秒，远低于 2 小时；build、up、迁移、health/ready、重启恢复均成功。
- 脚本注册了 EXIT trap 执行 `docker compose down -v --remove-orphans`，没有证据表明本轮实际清理失败。
- `withinTwoHours=true` 写死及清理结果未单独留痕，确实降低了脚本对未来异常运行的拒绝能力和审计强度，但不能反向证明当前这次运行失败。
- 因此应区分“本次运行事实”与“门禁脚本长期健壮性”：前者接受，后者作为非阻断改进保留。

## 2 调整后的结论

- ISSUE-G5-02-006/007 继续 `CLOSED / VERIFIED_BY_C`。
- ISSUE-G5-02-008 调整为 `OPEN / NON_BLOCKING_IMPROVEMENT`，不再阻断本次 Docker 证据接受，也不再作为 ISSUE-G5-02-002 的关闭前置。
- ISSUE-G5-02-002 已接受隔离 PostgreSQL 恢复和本轮 Docker/Compose 干净部署证据，剩余阻断仅为 KN-065 非乙方人员独立部署。
- ISSUE-G5-02-001 的甲方真实外部系统证据继续缺失。G5-02 仍不得置 `DONE`，不得进入 G5-03。
