# G6-01 命令执行台账

- 发布快照：`beb605f83e738a39dfe388ed4bc25b5b724eddcf`
- 执行人：严宇（B；由用户授权 Codex 辅助执行）
- 日期：2026-10-11（UTC+8）
- 环境：Windows 11 / Node v24.14.0 / npm 11.9.0；WSL2 Linux 5.10.16.3 / Docker 28.1.1 / Compose 2.35.1

| 序号 | 命令/步骤 | 起止时间 | 退出码 | 结果 | 原始记录与边界 |
| --- | --- | --- | --- | --- | --- |
| 1 | `npm run quality` | 21:17:50.309—21:18:20.989 | 0 | PASS | `quality-check.json`、`raw/npm-quality.log`；0 schema error/14 既有 warning；首轮 PowerShell 流重定向噪声另存但不作为最终结果 |
| 2 | G6 Docker 受控部署脚本 | 21:04:06—21:04:25 | 0 | PASS | `deployment-check.json`、`raw/docker-deployment-check.log`；B 隔离运行，非 KN-065 独立人员证据 |
| 2.1 | `docker compose build --no-cache backend` | 见步骤 2 日志 | 0 | PASS | Node 24 Alpine，npm audit 0 |
| 2.2 | `docker compose up -d --wait` | 见步骤 2 日志 | 0 | PASS | database/backend healthy |
| 2.3 | `node backend/scripts/migrate.mjs up` | 见步骤 2 日志 | 0 | PASS | 001/002/003 applied |
| 2.4 | `/healthz`、`/readyz` | 见步骤 2 日志 | 0 | 200/200 | `raw/healthz.json`、`raw/readyz.json` |
| 2.5 | `pg_dump` + SHA-256 | 见步骤 2 日志 | 0 | PASS | `raw/backup-sha256.txt` |
| 2.6 | 创建隔离恢复库 + `pg_restore` | 见步骤 2 日志 | 0 | PASS | 37 表→37 表，哨兵 1→1 |
| 2.7 | 后端重启 + `/readyz` | 见步骤 2 日志 | 0 | 200 | `raw/readyz-after-restart.json` |
| 2.8 | `docker compose down -v --remove-orphans` | 见步骤 2 日志 | 0 | PASS | 容器/卷/网络残留 0/0/0 |
| 3 | 首轮 Docker 记录器尝试 | 21:03 左右 | 127 | FAIL（保留） | `raw/docker-deployment-check-attempt-1-failed.log`；部署/恢复已完成，写 JSON 时 WSL 无 node；改为 Python 后重跑成功 |
| 4 | Vite 演示模式截图 | 21:04—21:05 | 0 | PASS | 三张截图；显著标记“演示数据”，不作为甲方真实系统证据 |

台账只证明上述环境和命令。真实甲方接口、生产数据、目标容量、真实移动宿主和非乙方独立部署仍需后续执行。
