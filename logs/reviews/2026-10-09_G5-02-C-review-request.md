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
