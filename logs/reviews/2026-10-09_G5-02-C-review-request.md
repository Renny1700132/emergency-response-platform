# G5-02 C Review 请求

- 主责：B；指定整体复核：C。
- 审核对象：`scripts/g5/run-technical-gate.mjs`、`docs/work/B_TECH/g5_technical_validation.md`、`evidence/g5/G5-02/`、G5-02 Issue/任务状态。
- 执行基线：`e6e12b59fc5749cdf0475ed9631bac7d21d4bb1a`。
- B 自检结论：本地技术门禁 PASS；G5-02 总体 BLOCKED。

请 C 重点检查：

1. 原始 CSV/JSON 是否保留全部请求，P50/P95/P99 是否按 nearest-rank 正确计算；
2. 模拟外部端口、内存持久层和本地 HTTP 是否没有被写成甲方环境结论；
3. 故障注入是否证明无权拒绝、消息失败和门禁禁止盲重放；
4. coverage≥70%、OpenAPI 0 schema error、高危依赖 0、secret scan PASS 是否可复核；
5. Docker、数据库恢复、非乙方独立部署和真实外部环境是否正确保持 BLOCKED；
6. 在阻断解除前，G5-02 不得改为 DONE。

## B 针对首轮 C Review 的整改交接（2026-10-09）

- ISSUE-G5-02-003：证据目录固定 `text eol=lf`，13 个对象从最终 LF 字节重建 manifest；校验器已实际验证文件集合、13/13 bytes/SHA-256、JSON↔CSV 1160 行及原始分位数复算。
- ISSUE-G5-02-004：PE-04 记录统一为归档原始值 `0.065ms`，校验器增加报告回指断言。
- B 自检：`node scripts/g5/validate-technical-gate.mjs` 输出 `PASS_WITH_EXTERNAL_BLOCKERS`、`rawSamples=1160`、`csvRows=1160`、`manifestFiles=13`。
- 请求 C 仅复验 003/004 并决定是否关闭；001/002 保持 OPEN，G5-02 继续 BLOCKED，不请求 DONE。

## B 针对第二轮 C Review 的整改交接（2026-10-09）

- ISSUE-G5-02-003：校验器改为按规范化 UTF-8 LF 内容核验当前工作区，不要求 reset/重签出；13 个对象全部转换为 CRLF 的模拟 Windows checkout 仍 13/13 PASS，并报告原始换行差异。另提供 `--git-ref=HEAD` 精确校验提交 blob。
- ISSUE-G5-02-005：B 日志已追加审计更正。正确提交为 `279976c54bd9b77fc2ee78fb5997d09100608628`；原错误完整哈希保留作为历史。
- ISSUE-G5-02-004 保持 `CLOSED / VERIFIED_BY_C`；001/002 继续 OPEN，G5-02 不请求 DONE。

## C 第三轮复验收口（2026-10-09）

- 本轮整改结论：`ACCEPTED`；ISSUE-G5-02-003/004/005 均为 `CLOSED / VERIFIED_BY_C`。
- 默认 Windows 工作区校验通过：canonical manifest 13/13、JSON/CSV 1160/1160、8 组分位数一致；`--git-ref=HEAD` 的 Git blob 13/13 通过。
- ISSUE-G5-02-001/002 经 C 确认为真实环境与参与方资源阻断，保持 `OPEN / VERIFIED_BLOCKING_BY_C`。
- 本 Review 请求已完成；G5-02 总体状态保持 `BLOCKED（C_REREVIEW_ACCEPTED / ENVIRONMENT_REQUIRED）`，不能置 DONE，也不能进入 G5-03 正式收口。

## B 第五轮整改复验请求（2026-10-09）

- ISSUE-G5-02-002 数据库恢复部分：一次性隔离 PostgreSQL 15.14 已完成迁移 up/down/up、服务重启、备份、销毁重建、恢复及 37 表/哨兵一致性，状态 PASS。
- ISSUE-G5-02-002 Docker 部分：WSL2 Docker Engine 28.1.1 / Compose 2.35.1 已从空卷、无缓存应用镜像完成迁移、health/ready、重启恢复和清理，总耗时 17s，状态 PASS。
- 新发现 ISSUE-G5-02-006/007：容器入口路径判断错误、Docker Node 20 低于 engines；均已修复，单元测试和干净部署复测通过。
- 首次 Docker Hub 超时与第二次容器退出/`EBADENGINE` 均保留原始失败日志，不覆盖或美化。
- 请求 C 复验上述新证据并决定 006/007 是否关闭、002 是否缩减为仅 KN-065 非乙方独立部署阻断。ISSUE-G5-02-001 继续 OPEN；B 不请求 G5-02 DONE。

## C 第五轮复验结论（2026-10-10）

- 结论：`CHANGES_REQUIRED / BLOCKED`；记录：`logs/reviews/2026-10-10_G5-02-C-rereview-4.md`。
- ISSUE-G5-02-006/007 已关闭；隔离 PostgreSQL 恢复证据接受，完整质量门禁与 manifest 18/18 复验通过。
- 新增 ISSUE-G5-02-008：Docker 脚本写死 `withinTwoHours=true`，并在退出清理执行前声明清理完成；trap 忽略清理失败且没有残留资源核验，不能支持“退出清理全部 PASS”或可靠准出。
- ISSUE-G5-02-001/002 继续 OPEN。002 除 KN-065 独立部署外还受 008 阻断；G5-02 不得置 DONE。

## C 复核标准校准（2026-10-10）

- 用户授权适当放宽标准后，第五轮结论调整为 `ACCEPTED_WITH_NOTE / BLOCKED_BY_EXTERNAL_RESOURCES`。
- 本次 17 秒 Docker build/up/迁移/health/ready/重启及 EXIT trap 清理结果接受；008 降为 `MINOR / NON_BLOCKING_IMPROVEMENT`，只保留门禁健壮性建议。
- 002 现仅剩 KN-065 非乙方独立部署；001 甲方真实外部系统仍缺。两项外部阻断未被放宽，G5-02 仍不得置 DONE。
- 记录：`logs/reviews/2026-10-10_G5-02-C-standard-calibration.md`。

## B 两项外部硬门禁推进（2026-10-10）

- 甲方环境：按视频、消息、定位、GIS、安防、信息发布六类核查，本轮 `0/6 available`、`0/6 tested`；每类 endpoint、受控凭据、合法数据/对象和测试窗口缺口已写入 `external-resource-readiness.json`，未把模拟证据升级为 PASS。
- KN-065：本轮没有真实非乙方操作者，身份、关系、时间、退出码和日志均保持空值；新增 `run-kn065-independent-deploy.sh`，只有提供身份边界声明且 `G5_B_ASSISTED=false` 才允许进入统一干净部署脚本。准备入口不等于独立部署已执行。
- 008：仅顺手完成非阻断脚本强化候选，改为真实计算≤2h，并在 PASS 前校验清理及残留；没有重跑或覆盖 C 已接受的历史 Docker 证据。
- 请求 C 后续只在真实外部资源到位后复验 001/002；008 可一并核对，不应反向阻断当前资源取得主线。G5-02 继续 `BLOCKED / EXTERNAL_RESOURCES_REQUIRED`，不请求 DONE。

## OVR-033 条件推进说明（2026-10-10）

- 用户要求继续推进，但本轮不生成假身份、假原始日志或假甲方接口结果；两项外部 blocker 保持不变。
- G5-03 可先使用现有真实本地结果和明确分栏的 `SIMULATED_EVIDENCE` 编写草稿及准备演示；不得据此完成最终收口或进入 G6。
- C 后续审核应分别给出“本地技术整改是否接受”和“外部硬门禁是否解除”，不得因允许草拟而把 001/002 误判为关闭。

## C 第六轮正式复验结论（2026-10-10）

- 结论：`ACCEPTED_WITH_BOUNDARY / CONDITIONAL_PROGRESSION_APPROVED`；记录：`logs/reviews/2026-10-10_G5-02-C-rereview-5.md`。
- 外部资源核查真实：甲方六类系统 0/6、KN-065 执行字段为空；未伪造身份、日志、接口结果或 PASS，001/002 继续 OPEN。
- OVR-033 接受：G5-03 可立即开始草稿和演示准备，但不能最终收口、不能据此将 G5-02 置 DONE 或进入 G6。
- manifest 两种模式 21/21、JSON/CSV 1160/1160、8 组指标通过；008 代码静态复验满足整改方向，保持非阻断并在下次真实部署时随验。
