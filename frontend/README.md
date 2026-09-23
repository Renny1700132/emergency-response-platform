# 正式 Vue Web/H5 前端

本目录是 G4-03 建立的正式 Vue 3 工程。`prototype/` 仅作为导航、布局和交互参考；本工程不导入 `prototypeStore`、localStorage 或原型 Mock 数据。

## 命令

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm test
npm run test:coverage
```

根目录 `npm run quality` 会依次执行前端类型检查、前端核心基础设施覆盖率门禁、构建及既有契约、安全、G4 护栏覆盖率和 selfcheck 门禁。前端 statements、branches、functions、lines 四项阈值均为 `≥70%`。

## 边界

- `src/api/generated/`：由 `docs/work/B_TECH/openapi_v1.yaml` 生成的只读 TypeScript 类型。
- `src/shared/http/`：统一 API Client，请求 ID、Bearer、幂等键、超时、错误与 traceId 归一化。
- `src/shared/auth/`：内存用户上下文；从 Web 中台注入或 H5 宿主桥接读取短期令牌，不持久化令牌。
- `src/router/`：Web/H5 路由、权限壳及 MOD-* 映射。
- 后续业务按 `features/<module>/` 增量接入；G4-03 不实现事件或安防业务闭环。
