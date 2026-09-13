# G2 需求控制基线（候选）

- Task：G2-02
- 主责 / 复核：C / B
- 状态：DONE（2026-09-13 B 复核通过；`ISSUE-G2-02-001` 已由 C 修订并经 B 复验关闭）
- 上游事实基线：`BASELINE-V1.0`（FROZEN）
- 范围输入：`docs/work/A_PM/requirements_confirmation.md`
- 访谈输入：`docs/work/C_REQ/user_interviews_and_moscow.md`（G2-01，DONE）

本目录为第二关 SRS、`spec.md` 和 RTM 共用的需求控制入口，不改写第一关冻结事实。事实、数字或责任变化必须先走 Issue/Change 流程；状态为“待验证”的条目不得写成已验收。

## 文件与唯一用途

| 文件 | 用途 |
| --- | --- |
| `facts.md` | G2 项目事实、范围、责任与验证边界索引 |
| `terminology.md` | 人机双镜像共用术语和强度词 |
| `requirements_catalog.md` | 29 条 MVP FR 的稳定编号及故事映射；10 条非 MVP FR 的期次索引 |
| `key_numbers.md` | G2 所需关键数字分层索引；数值真值仍由 `control/key_numbers.md` 管理 |

## 强制引用规则

1. G2-03、G2-04、G2-06 使用 `G2-FR-001`—`G2-FR-029` 作为双镜像主编号，并同时显示原始 FR 编号。
2. SRS 与 `spec.md` 不得自行改号；验收标准预留格式为 `AC-G2-FR-nnn-xx`。
3. `US-001`—`US-029` 是访谈故事编号，与 FR 为多对多关系，不得假设一一对应。
4. Must 仅对应本目录中的 29 条 MVP FR；10 条非 MVP FR 仍属本期交付，必须标注期次并保留追踪。
5. 所有数字引用原 `KN-*`，不得在下游创建第二套数值真值。
