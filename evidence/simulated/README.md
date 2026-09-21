# 课程模拟证据登记

本目录仅保存 `SIMULATED_EVIDENCE`，不代表真实甲方环境、生产系统或现场验收。确认来源为 2026-09-21 用户课程模拟裁决，受控口径见 `control/G3_simulated_confirmation.md`。

| 证据编号 | 模拟结论 |
|---|---|
| SIM-EV-INT-001 | 八端口版本、账号责任、认证和窗口已模拟确认 |
| SIM-EV-INT-002 | 八端口8/8正常、无权、超时/失败场景PASS |
| SIM-EV-KN064-001 | VIDEO/PUBLISH/IOT/MIDDLE三类场景PASS |
| SIM-EV-GIS-001 | EPSG:4490及地图服务组合已模拟确认 |
| SIM-EV-PERF-001 | 用户给定的全部P95、并发和到达率模拟结果 |
| SIM-EV-COMP-001 | H5六组合PASS |
| SIM-EV-BACKUP-001 | 备份、保留、DR/WORM/离线策略已模拟确认 |
| SIM-EV-SEC-001 | 高危0、中危0、低危观察2项 |
| SIM-EV-DEPLOY-001 | 干净环境部署68分钟 |
| SIM-EV-ROLLBACK-001 | 回滚11分40秒且业务事实一致 |
| SIM-EV-DR-001 | RPO12分钟、恢复54分钟 |
| SIM-EV-CM-001 | CCB、权限和设施已模拟确认 |
| SIM-EV-REL-001 | 发布、维护窗口和回滚授权已模拟确认 |

原始测试日志、请求响应、截图或工具输出并不存在；这些数值是课程项目模拟输入，引用时必须同时显示 `SIMULATED_EVIDENCE`。
