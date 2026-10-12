# G6-01 V0.2 命令执行台账

- 发布快照：`75f01c3bb33369d3785acf69a3a00eb983aa188b`
- 执行人：严宇（B；由用户授权 Codex 辅助执行）
- 执行区间：2026-10-12 16:23:39—16:25:30（UTC+8）
- 环境：WSL2 Linux 5.10.16.3 / Docker 28.1.1 / Compose 2.35.1
- 机器可读总账：`remediation-command-ledger.json`；每条均含 command、startedAt、finishedAt、exitCode、rawLog。

## 1 最终隔离运行

| 分组 | 步骤 | 结果 | 关键事实 |
| --- | --- | --- | --- |
| 环境与清理 | 01—02 | 2/2 PASS | Docker 可用，运行前隔离项目清理 |
| 构建与启动 | 03—06 | 4/4 PASS | backend/frontend 无缓存构建；database/backend/frontend healthy |
| 迁移与健康 | 07—10 | 4/4 PASS | 3 次迁移；health/ready/frontend 均 200 |
| 数据与备份 | 11—13 | 3/3 PASS | 审计哨兵写入；备份 SHA-256；复制到宿主 |
| 目标回退 | 14—18 | 5/5 PASS | 停止写入；`down --steps=1`；3→2→3、37→13→37、哨兵 1→1；ready=200 |
| 恢复与日志 | 19—23 | 5/5 PASS | 隔离恢复 37 表/哨兵 1；三服务日志分别采集 |
| 重启与清理 | 24—26 | 3/3 PASS | 后端重启 ready=200；容器/卷/网络 0/0/0 |

最终结果：26/26 步骤 exit 0，111 秒。应用快照、dirty 状态、Compose 展开配置、Dockerfile 指纹、镜像 ID 和备份哈希见 `remediation-deployment-check.json` 与 `release-lock.json`。

## 2 失败尝试保留

| 尝试 | 结果 | 原始记录 | 纠正 |
| --- | --- | --- | --- |
| 管理工作树 Git 路径 | FAIL | `raw/remediation/attempt-1-git-worktree-path-failed.log` | 记录器改用 Windows `git.exe -C` 回读真实 HEAD |
| 记录器自建证据影响 clean 检查 | FAIL | `raw/remediation/attempt-2-self-created-evidence-failed.log` | clean 检查移到创建证据之前 |
| Nginx 镜像元数据网络超时 | FAIL | `raw/remediation-attempt-3-nginx-timeout/` | 静态宿主改用项目已锁定 Node 镜像，保持 `/api/` 代理能力 |
| 错误测试过滤条件 | FAIL | Prompt 日志任务事件 | 改用存在的测试文件，随后目标测试和全量 `npm run quality` 通过 |

## 3 边界

本台账证明成员 B 在指定隔离环境对锁定代码完成全栈部署、目标回退、恢复、日志和清理。真实甲方六类系统、生产数据、真实移动宿主、生产容量以及真实非乙方独立部署均未执行，继续 `REAL_WORLD_DEFERRED`。
