# G4-09 汇报级前端候选验证记录

- 日期：2026-09-26
- 分支：`codex/g4-09-sprint2-frontend`
- 状态：PRESENTATION UI CANDIDATE / G4-09 DOING
- 实现提交：`1c121c4`
- PR：Gitee `!16`（`codex/g4-09-sprint2-frontend` → `master`，OPEN）
- 边界：依据 `OVR-030`，本记录只证明汇报级前端与显式演示适配层可运行；不证明 G4-08 后端、真实外部系统、甲方环境、性能或最终 E2E 已完成。

## 1 可见范围

- Web：态势总览、预案、事件、任务、指挥态势、人员与物资、演练、值班、知识、八外部端口。
- H5：事件、任务、演练、扫码打卡、物资盘点、应急知识六个入口。
- 安防：地图/视频/门禁/发布状态可见；门禁操作具有二次确认，并明确安全联锁、失败回执与人工降级。
- 演示适配：只在 `npm run demo --prefix frontend` 的 Vite `presentation` mode 启用，使用进程内数据，不读写 `prototypeStore` 或 localStorage；所有页面显示“演示数据 · 非验收证据”。

## 2 自动检查

- 首次 `npm run quality`：功能、覆盖率、构建、G4/后端测试、OpenAPI 与秘密扫描通过；npm 官方漏洞审计端点因受限网络返回 EACCES，真实失败已保留。
- 允许访问官方审计端点后从头重跑 `npm run quality`：exit 0。
- 前端：7 个文件、30 个测试全部通过；覆盖率 statements 96.57%、branches 81.67%、functions 96%、lines 100%。
- G4 护栏：11/11；覆盖率 statements/lines 96.75%、branches 81.63%、functions 90%。
- 后端：16/16；覆盖率 statements/lines 85.88%、branches 78.24%、functions 80.48%。
- OpenAPI：0 error、冻结基线既有 14 warning；未修改契约。
- 安全：秘密扫描 57 files PASS；根与前端依赖漏洞均为 0；selfcheck PASS。

## 3 浏览器视觉与交互走查

- 总览：指标、GIS 一张图、事件时间线、任务进度和系统健康均正常渲染。
- 指挥态势：综合安防地图、模拟视频、视频调阅、信息发布和门禁控制均可见；门禁二次确认对话框正常显示。
- H5：手机框架、事件卡片、状态、反馈入口及底部六个核心导航均正常渲染。
- 响应式：当前 Codex 内嵌浏览器窄视口下自动折叠侧栏与指标栅格，未发现溢出阻断；桌面布局由构建及 CSS 断点覆盖。
- 启动回归：首次交付后发现自定义演示标志被配置为布尔值、页面却按字符串比较，导致 `npm run demo --prefix frontend` 仍进入正式认证页；现已统一改用 Vite 内建 `import.meta.env.MODE === 'presentation'`，并为 5174 增加 `--strictPort`，防止端口冲突时静默漂移。修复后在 `http://127.0.0.1:5174/web/overview` 实际复验，页面直接进入“应急态势总览”。
- 修复后专项检查：`npm run typecheck --prefix frontend`、前端 30/30 测试及 `npm run build --prefix frontend -- --mode presentation` 均 exit 0。
- 启动回归：首次交付后发现自定义演示标志被配置为布尔值、页面却按字符串比较，导致 `npm run demo --prefix frontend` 仍进入正式认证页；现已统一改用 Vite 内建 `import.meta.env.MODE === 'presentation'`，并为 5174 增加 `--strictPort`，防止端口冲突时静默漂移。修复后在 `http://127.0.0.1:5174/web/overview` 实际复验，页面直接进入“应急态势总览”。
- 修复后专项检查：`npm run typecheck --prefix frontend`、前端 30/30 测试及 `npm run build --prefix frontend -- --mode presentation` 均 exit 0。

## 4 待完成项

- 等待 G4-08 正式后端与外部适配合并后，将剩余页面由演示适配切换至冻结 OpenAPI 对应端点。
- 补充正式 Web/H5 与真实后端的集成/E2E、兼容矩阵及 C 独立 Review/Approve。
- 上述条件完成前保持 G4-09 为 `DOING`，不得把本记录作为真实甲方环境验收证据。
