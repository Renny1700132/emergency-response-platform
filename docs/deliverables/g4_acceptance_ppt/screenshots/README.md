# 验收汇报截图来源清单

- commit SHA：`78f4129ae517c7296cf238b1e9509ec0e25b2ffb`
- 截图日期：2026-09-26（Asia/Shanghai）
- FORMAL_FRONTEND 运行入口：`http://127.0.0.1:43001/`，正式 `frontend/` 构建；宿主令牌与页面数据由本次受控截图环境提供，因此以下正式页面截图统一归类为 `SIMULATED_DATA`，不作为真实外部系统或现场验收证据。
- PROTOTYPE_TARGET 运行入口：`http://127.0.0.1:5173/`，实际运行 `prototype/`；原型使用 `prototypeStore`、localStorage 与 Mock 数据，仅表达已完成的目标界面和交互。
- 所有 PNG 均由本机 Chrome Headless 对实际运行页面截图；未使用 AI 生成系统界面。

| 文件 | 页面名称 | URL / route | 来源类型 | 截图时间 | viewport |
| --- | --- | --- | --- | --- | --- |
| `formal-web-incidents.png` | 正式 Web 事件管理 | `/web/incidents` | SIMULATED_DATA（正式 frontend UI） | 2026-09-26 14:43 +08:00 | 1440×900 |
| `formal-web-tasks.png` | 正式 Web 应急任务 | `/web/tasks` | SIMULATED_DATA（正式 frontend UI） | 2026-09-26 14:43 +08:00 | 1440×900 |
| `formal-h5-events.png` | 正式 H5 移动事件 | `/h5/events` | SIMULATED_DATA（正式 frontend UI） | 2026-09-26 14:43 +08:00 | 430×860 |
| `formal-h5-tasks.png` | 正式 H5 我的任务 | `/h5/tasks` | SIMULATED_DATA（正式 frontend UI） | 2026-09-26 14:43 +08:00 | 430×860 |
| `prototype-plans.png` | 应急预案 | `/#/web/plans` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-incidents.png` | 事件管理 | `/#/web/incidents` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-situation.png` | 指挥态势 | `/#/web/situation` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-tasks.png` | 应急任务 | `/#/web/tasks` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-staff.png` | 人员与值班 | `/#/web/staff` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-materials.png` | 物资管理 | `/#/web/materials` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-attendance.png` | 打卡管理 | `/#/web/attendance` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-drills.png` | 演练管理 | `/#/web/drills` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-security.png` | 综合安防 | `/#/web/security` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-integrations.png` | 系统对接 | `/#/web/integrations` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-statistics.png` | 数据统计 | `/#/web/statistics` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-config.png` | 基础配置 | `/#/web/config` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 1440×900 |
| `prototype-h5-home.png` | H5 首页 | `/#/h5/home` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-report.png` | H5 事件上报 | `/#/h5/report` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-events.png` | H5 我的事件 | `/#/h5/events` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-tasks.png` | H5 我的任务 | `/#/h5/tasks` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-drills.png` | H5 演练 | `/#/h5/drills` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-checkin.png` | H5 扫码打卡 | `/#/h5/checkin` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-inventory.png` | H5 物资盘点 | `/#/h5/inventory` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
| `prototype-h5-knowledge.png` | H5 应急知识 | `/#/h5/knowledge` | PROTOTYPE_TARGET | 2026-09-26 14:44 +08:00 | 430×860 |
