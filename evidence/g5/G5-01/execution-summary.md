# G5-01 三级测试与功能正确性执行摘要（A 第二轮 Review 整改版）

- Task：G5-01；主责：C（任俊强）；指定 Review：A。
- 执行基线：`97153c1a5a8a22044fee642db80c6e106042b844` + 本次受控 G5-01 工作树修改。
- 原始数据：`functional-gate-raw.json`；逐 AC 明细：`ac-117-matrix.md`。
- 历史声明：提交 `9548466b10e0ddd48d0e3c87ea28e43321e8700d` 中的“87/117 AC PASS、28/34★FR PASS”已被 A Review 否决，不再作为当前事实；Git 历史原样保留。

## 本轮实际套件结果与层级

| 层级/门禁 | 结果 | 实际数据与边界 |
|---|---|---|
| 领域单元与工程护栏 | PASS | 13/13；不代表业务 AC 系统验收 |
| 后端模块/HTTP 集成 | PASS | 18/18；内存持久化和模拟外部端口边界逐项保留 |
| 前端函数/契约/组件 + 单条内存 HTTP E2E | PASS | 11 files / 45 passed，另有 PostgreSQL 系统包 1 file / 2 tests 因专用开关关闭而 skipped；本行不计系统包通过 |
| PostgreSQL 后端集成 | PASS | 2/2；不是同一条 Web/H5→API→PostgreSQL 系统流程 |
| Web/H5→HTTP→PostgreSQL 系统包 | PASS | 2/2；专用开关下独立执行。核心正/反流程覆盖 Web 上报、H5 接收、反馈附件、组合检索、无权拒绝、核实/启动/任务事实；剩余 MVP 正式工作台逐页读取 PostgreSQL；门禁确认后单次下发并等待模拟联锁回执。外部门禁/消息端口仍明确为模拟边界 |
| 前端覆盖率 | PASS | statements 95.57%、branches 77.73%、functions 97.36%、lines 100% |
| 后端覆盖率 | PASS | statements/lines 87.69%、branches 77.74%、functions 85.24% |
| 类型检查/OpenAPI 类型生成 | PASS | exit 0 |
| Edge 窄屏布局复测 | PASS（布局范围） | Edge 154；CSS 视口 390×844；`innerWidth=390`、`scrollWidth=390`；演示事件卡和正式未登录边界分别留图 |

前端常规 45 项不再统称“Web/H5 系统测试”。新增系统包与常规套件隔离，使用受保护的本机 `emergency_g4_test`，每次先清理隔离测试表；正式 Web/H5 页面/客户端、真实 HTTP 服务和 PostgreSQL 在同一执行链中。外部消息、身份和门禁联锁仍为适配器测试缝，不外推为甲方真实系统联调。

## 117 AC 与★重新判定

- 全量分母保持 39 FR / 117 AC / 34 个★FR。
- 当前逐 AC 结果：11 PASS / 0 FAIL / 59 NOT_RUN / 47 BLOCKED。
- 其中 FR-001—029：11 PASS / 59 NOT_RUN / 17 BLOCKED；FR-030—039：30 BLOCKED（未实现且 G5 禁止新增功能）。
- ★FR：仅 G2-FR-013 的 3 条 AC 均有逐项 PASS，故 1/34★FR PASS、33/34 BLOCKED；不再把局部 PASS 汇总成整个 FR 通过。
- 旧白名单中仅证明局部条件的 13 条 PASS 已全部降回 NOT_RUN/BLOCKED；例如 FR-015-03、FR-016-01 不再以 Mock 调用或单一 CLOSED 状态判定通过。
- G5-02 已提供的本地性能值仅作为部分证据挂接：例如扫码 API P99 3.697ms、定位处理 P99 0.181ms、模拟消息 20/20；真实扫码/H5 宿主、连续定位源、正常验收消息通道等仍缺，相关 AC 保持 BLOCKED。

## 异常、缺陷与复测

1. 历史首轮沙箱回环 `EACCES`、PostgreSQL 停止导致的 0/2，及后续 2/2 PASS 均保留在既有记录。
2. 本次新增 H5 布局回归测试首次因测试路径 URL 方案错误出现 1 FAIL / 44 PASS；修正测试读取路径后完整复跑 45/45 PASS，失败未隐去。
3. 第一轮 Edge 修复截图仍裁切。复核发现 Windows headless 命令行生成 390px 图片时 CSS 视口被强制为 500px；未裁图或缩放掩盖，改用 Edge DevTools 显式设定 390×844。最终 `scrollWidth=390`，事件卡、状态徽标、说明和手机壳均在视口内。
4. 视口采集脚本首次成功写图后因临时配置锁文件产生 `EBUSY`；增加浏览器关闭等待与受控临时目录重试后复跑成功退出。
5. 本轮首次直接运行新增系统包时发现隔离库尚未应用 `003_sprint2_mvp`，报 `em_plan_type` 不存在；按项目既有迁移脚本应用 003 后重跑 2/2 PASS。失败及修复均保留在 Prompt 日志。

## 结论

A 第二轮仅要求处理的 003/004 已完成主责整改并提交复验材料：所有不完整 PASS 已降级；新增的 Web/H5→HTTP→PostgreSQL 系统包 2/2 PASS，并对剩余 MVP 正式工作台形成同链路读取证明；门禁正向用例证明确认前不发送、确认后单次发送并等待联锁回执。005 保持 `CLOSED / VERIFIED_BY_A`，本轮未修改。G5-01 仍为 `BLOCKED / PENDING_A_REREVIEW_2`：多数 AC 尚无完整执行证据，FR-030—039 未实现，兼容版本/Android/iOS/KN-039 等资源门禁仍未满足。不得置 `DONE`，不得进入 G6。
