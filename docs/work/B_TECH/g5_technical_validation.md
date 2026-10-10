# G5-02 技术专项验证记录

- Task：G5-02；主责：B；状态：`REVIEW（COURSE_CONDITIONAL_ACCEPTANCE_PENDING_C）`；此前 C 已接受本地整改与 OVR-033 条件推进，本轮依据 OVR-034 提交课程条件验收最终复核。
- 执行基线：`e6e12b59fc5749cdf0475ed9631bac7d21d4bb1a`。
- 本轮性质：性能、可靠性、维护性、可移植性和故障演练的内部工作记录；不是正式《性能压测报告》。
- 原始数据：`evidence/g5/G5-02/performance-raw.json`、`performance-samples.csv`、`fault-drill-raw.json`、`postgres-recovery-drill.json`、`docker-clean-deploy.json`、`quality-gate.log`、`environment-readiness.json`、`external-resource-readiness.json`、`kn065-independent-deployer-readiness.json`。
- 总结论：本地可执行技术门禁、隔离 PostgreSQL 恢复演练和 WSL2 Docker/Compose 干净部署已通过；六类系统与 KN-065 按 OVR-034 形成 `COURSE_ACCEPTED_PENDING_C_FINAL_REVIEW` 候选，真实甲方接口与真实非乙方独立部署继续为 `REAL_WORLD_NOT_RUN / REAL_WORLD_DEFERRED`。B 不自行写成 DONE。

## 1 环境与方法

Windows、Node v24.14.0、npm 11.9.0；本地真实 Node HTTP 监听器、内存持久层和明确标记的模拟外部适配器。性能测试先预热 20 次；逐请求保留耗时、HTTP 状态和 traceId；分位数采用 nearest-rank，失败请求不从样本剔除。所有 P50/P95/P99 单位为 ms。

首次探测时，本机共享 PostgreSQL 15 虽监听于 127.0.0.1:5432，但没有授权连接串；Windows PATH 也没有 Docker。失败日志均已保留。后续未猜测共享凭据或修改认证配置，而是创建一次性隔离 PostgreSQL 15 集群完成恢复演练；同时启用已有 WSL2 Docker Engine 28.1.1 / Compose 2.35.1，从空卷和无缓存应用镜像完成干净部署。Docker Hub 首次超时、Node 20 镜像不符合项目 engines，以及容器入口未启动服务的失败均保留并完成修复复测。

## 2 性能结果

| 指标/链路 | 样本/并发 | 成功率 | P50 | P95 | P99 | 判定与边界 |
|---|---:|---:|---:|---:|---:|---|
| PE-07 普通事件查询 API | 500 / 50 | 100% | 13.913 | 34.733 | 35.554 | 本地 API 达阈值；未覆盖浏览器整页和目标数据规模，PARTIAL |
| PE-11 100 并发查询 | 300 / 100 | 100% | 27.791 | 39.286 | 39.513 | 本地 100 并发 HTTP PASS；非目标环境容量结论 |
| PE-02 告警接入 | 60 / 20 | 100% | 11.525 | 14.002 | 14.443 | 本地正式路由+模拟 EXT-IOT；甲方接口仍 BLOCKED |
| PE-09 扫码打卡 API | 40 / 10 | 100% | 3.386 | 3.627 | 3.697 | 本地写入路径 PASS；真实扫码/定位/H5 宿主仍 BLOCKED |
| PE-05 定位处理 | 40 / 1 | 100% | 0.012 | 0.030 | 0.181 | 源精度 0.5m 原样保留；为直接服务测量，甲方源与 2s 连续刷新仍 BLOCKED |
| PE-01/03 启动响应 | 20 / 1 | 100% | 0.520 | 1.044 | 2.331 | 本地事件→任务链路 PASS；确认至完成最大 3.005ms；消息端口为模拟 |
| PE-08 态势资源 API | 100 / 20 | 100% | 7.274 | 8.074 | 8.167 | 仅 API；甲方地图服务和浏览器地图操作仍 BLOCKED |
| PE-12 统计 API | 100 / 20 | 100% | 9.317 | 12.038 | 12.054 | 仅空/小数据技术路径；一年期目标规模未执行，BLOCKED |

PE-04 在本次归档轮次的模拟正常通道并行 20 路，20/20 接受、100% 成功，耗时 0.065ms（与 `performance-raw.json.messageBatch.durationMs` 一致）；不冒充甲方正常验收通道的 ≥99% 到达率。PE-06 需要既有视频系统首帧和 ≥30 天保存证据，本轮未执行。PE-10 缺真实安防/信息发布刷新链路，未形成 30s/60s 目标环境结论。

## 3 故障与恢复

受控故障注入 PASS：无权请求返回 403；消息端口产生 `MESSAGE_TIMEOUT`；门禁控制超时进入 `MANUAL_DEGRADATION` 且 `automaticReplay=false`，证明未知结果不盲目重放。该演练使用模拟外部故障，不代表甲方接口故障演练。

数据库服务恢复和迁移演练 `PASS`：一次性隔离 PostgreSQL 15.14 集群完成迁移 up→down→up、哨兵数据写入、服务 stop/start、custom-format 备份、数据库销毁重建、恢复和一致性校验；恢复前后 public 表均为 37，哨兵记录均为 1。该证据不接触共享数据库，也不外推为甲方生产数据库恢复。短时故障演练不能证明 7×24、试运行可用率 ≥99.5% 或长期 MTTR 统计；KN-040 保持待长期观测。

## 4 维护性、安全与契约门禁

`npm run quality` exit 0：

- 前端 11 files / 45 tests PASS（另 2 skipped）；coverage 95.57% / 77.73% / 97.36% / 100%。
- 工程护栏 11/11 PASS；coverage 96.75% / 81.63% / 90% / 96.75%。
- 后端 21/21 PASS；coverage 87.75% / 77.77% / 85.36% / 87.75%。
- OpenAPI 0 error、14 warning；warning 为既有描述性债务，不是 schema error，已完整保留。
- secret scan PASS（67 files）；根与前端依赖漏洞均为 0；selfcheck PASS。
- 这些是本地门禁，不是远程 CI、渗透测试、正式等保测评或甲方验收。

本轮未发现需要修改产品代码的新增技术缺陷；新增的是测试脚本和证据，不改冻结 FR/AC/★/PE/KN。

## 5 可移植性和未决阻断

| 项目 | 本轮状态 | 解除条件 |
|---|---|---|
| Docker/Compose 干净部署≤2h | PASS；WSL2 Docker 28.1.1 / Compose 2.35.1，从空卷、无缓存应用镜像执行，迁移与健康检查通过，重启后 ready=200，总耗时 17s，结束后卷/容器/网络已清理 | C 复验 `docker-clean-deploy.json`、最终日志及两次失败日志 |
| KN-065 非乙方人员一次部署成功 | COURSE_ACCEPTED_PENDING_C_FINAL_REVIEW；复用真实 B 侧 17 秒部署，由 `SIMULATED_COURSE_ROLE` 见证；REAL_WORLD_NOT_RUN | 真实项目后续安排非乙方操作者，保留身份边界、命令、时间和结果 |
| PostgreSQL 故障/恢复 | PASS；任务专用隔离 PostgreSQL 15.14，迁移 up/down/up、服务重启、备份/销毁/恢复及 37 表+哨兵一致性通过 | C 复验 `postgres-recovery-drill.json` |
| 甲方视频/消息/定位/GIS/安防/信息发布接口 | COURSE_ACCEPTED_PENDING_C_FINAL_REVIEW；6/6 模拟覆盖；REAL_WORLD_NOT_RUN | 真实项目后续提供目标环境、账号、合法测试数据和窗口；按 PE-02/04/05/06/08/10 补测 |
| 7×24、≥99.5% | NOT_RUN | 取得约定试运行观测窗口和维护排除记录 |

### 5.1 2026-10-10 外部资源取得核查

本轮只核查可用于真实执行的输入，不读取或保存任何秘密值。仓库配置和本机环境变量存在性检查均未发现可用的甲方连接资料；视频、消息、定位、GIS、安防和信息发布六类系统为 `0/6 available`、`0/6 tested`。每类仍缺 endpoint、受控账号/令牌、合法测试数据或对象及确认的测试窗口，逐项记录见 `external-resource-readiness.json`。因此 PE-02/04/05/06/08/10 的甲方环境验证均为 `NOT_RUN / BLOCKED`，本地模拟适配器结果不升级为真实验收 PASS。

KN-065 本轮也未取得真实非乙方执行人和独立干净主机。操作者身份、与乙方关系、开始/结束时间、退出码和原始日志均保持空值，见 `kn065-independent-deployer-readiness.json`。为避免后续代签或漏字段，新增 `scripts/g5/run-kn065-independent-deploy.sh`：它强制要求可审计身份、关系说明、声明及 `G5_B_ASSISTED=false`，再调用统一干净部署脚本生成独立文件；实际执行和 C 身份边界复核前，KN-065 继续 `BLOCKED`。

`ISSUE-G5-02-008` 不影响当前主线结论。本轮仅顺手强化未来执行脚本：≤2 小时由真实时长计算，PASS 前显式执行清理并检查项目容器、卷和网络残留；没有重跑或覆盖已经被 C 接受的历史 Docker 证据，也没有把脚本改进写成 KN-065 已执行。

依 OVR-034，现有真实本地结果与明确标记的 `SIMULATED_EVIDENCE / NOT_OWNER_ENVIRONMENT` 可形成课程条件验收候选。六类系统记录见 `course-conditional-external-systems.json`；KN-065 课程见证见 `course-conditional-kn065-witness.json`。当前只允许进入 C 最终复核；C 接受前不把 G5-02 改为 DONE，任何材料均须同时展示 `COURSE_ACCEPTED` 与 `REAL_WORLD_NOT_RUN`。

## 6 任务结论与 C Review 结果

本地可执行范围无 FAIL，质量门禁、受控故障演练、隔离 PostgreSQL 恢复和 Docker/Compose 干净部署均通过。ISSUE-G5-02-003—007 继续为 `CLOSED / VERIFIED_BY_C`；ISSUE-G5-02-008 为非阻断随验项。依据 OVR-034，ISSUE-G5-02-001/002 的课程阶段状态为 `CLOSED_FOR_COURSE_STAGE / REAL_WORLD_DEFERRED / PENDING_C_FINAL_REVIEW`，G5-02 置为 `REVIEW（COURSE_CONDITIONAL_ACCEPTANCE_PENDING_C）`。六类甲方真实系统仍为 0/6、真实非乙方操作者仍为 0；这两项属于后续真实项目补测，不能表述为真实环境 PASS。只有 C 接受后，任务才可置 `DONE（COURSE_CONDITIONAL_ACCEPTANCE / REAL_WORLD_DEFERRED）`。
