# G5-01 兼容性最小矩阵（A Review 整改版）

| 对象 | 目标范围 | 本轮环境/版本 | 场景 | 结果 | 边界 |
|---|---|---|---|---|---|
| Microsoft Edge | 最新 2 个稳定版本 | `154.0.4258.62`，仅 1 个版本 | presentation 事件卡，390×844 CSS 视口 | PASS（单版本布局复测） | `innerWidth=390`、`scrollWidth=390`；不替代第二稳定版本和完整交互 |
| Microsoft Edge | 正式模式边界 | `154.0.4258.62` | 未注入宿主令牌访问 `/h5/events`，390×844 | PASS（访问边界渲染） | 正确进入 AUTH REQUIRED；不是正式业务页流程，因为无合法宿主令牌 |
| Chromium 浏览器会话 | 辅助走查 | Codex in-app Chromium，版本未暴露 | 历史 Web/H5 上报与会话同步 | PASS（参考） | 演示内存状态，不是正式数据库或指定 Chrome 版本证据 |
| Google Chrome | 最新 2 个稳定版本 | 未检测到安装 | Web/H5 | BLOCKED | 缺两个实际稳定版本 |
| Android H5 宿主 | 甲方确认机型、Android/WebView | 无设备、宿主 APP、版本矩阵 | 核心流程、上传、扫码、定位、返回键/生命周期 | BLOCKED | jsdom 与桌面响应式页面不能替代真实宿主 |
| iOS H5 宿主 | 甲方确认终端、iOS/WKWebView | 无设备、宿主 APP、版本矩阵 | 核心流程、上传、扫码、定位、返回键/生命周期 | BLOCKED | Windows 本机不能代造 iOS 证据 |

## ISSUE-G5-01-005 复现与修复

1. A 指出的旧图 `edge-154-h5-events.png` 确实存在手机壳、状态徽标及文本右侧裁切；旧结论“未见明显裁切”作废，但旧图和 Git 历史保留。
2. 根因是 `.record-grid` 的 `minmax(300px,1fr)` 与窄内容区叠加，以及手机壳在网格中的固有宽度没有可靠随视口收缩。
3. 修复为：手机壳显式按 `100vw - 48px` 收缩并限制最大 430px；主内容 `min-width:0` 且禁横向溢出；记录网格使用 `minmax(0,1fr)`；卡片头允许换行；长文本和状态标识允许断行。
4. 自动回归：`frontend/tests/h5-responsive-layout.test.ts` PASS。
5. 实际复测：`edge-154-h5-events-fixed-390x844.png`；Edge DevTools 返回 `innerWidth=390`、`innerHeight=844`、`scrollWidth=390`，人工查看未见旧缺陷中的右侧裁切。
6. 正式边界复测：`edge-154-formal-auth-required-390x844.png`；未登录时正确展示统一门户/APP 进入提示，未将演示数据注入正式模式。

## 结论

当前 Edge 154 的 390×844 布局缺陷已修复并复测；兼容性总体仍为 `BLOCKED`，因为 Chrome/Edge 双版本和 Android/iOS 真实宿主矩阵未完成。
