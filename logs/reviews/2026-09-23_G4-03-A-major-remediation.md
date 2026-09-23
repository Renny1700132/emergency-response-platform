# G4-03 A 对 C Review 的 MAJOR 整改响应

- 任务：G4-03｜正式 Vue 前端骨架与 API Client
- 主责：A（何思源 / `@WhiteApricot`）
- 唯一审核人：C（任俊强 / `@rjq010504`）
- 分支：`codex/g4-03-vue-api-client`
- 输入：`2026-09-23_G4-03-C-review.md`
- 状态：PENDING_C_REREVIEW

## 整改对应

| Issue | 整改 | 自动证据 |
| --- | --- | --- |
| ISSUE-G4-03-001 | 按冻结 §4 完整重建 11 个 MOD-*—G2-FR 集合；H5 同时标注 `MOD-MOBILE` 渠道和领域模块 | `module-traceability.test.ts` |
| ISSUE-G4-03-002 | API Client 从 `paths[P][method]` 推导方法、路径、query/path、requestBody 与 2xx JSON response | `api-client.types.ts` 正例及 4 个 `@ts-expect-error` 负例 |
| ISSUE-G4-03-003 | 根/frontend/lockfile/README 统一 Node `^24.14.0 || >=26.0.0` | Node 24.14.0 下安装、typecheck、完整质量门禁 |

冻结 OpenAPI、需求、★、责任边界及验收口径均未修改。本记录是主责整改响应，不冒充 C 的独立复验或 APPROVE；三个 Issue 在 C 复验前保持 OPEN。

## 验证

- `npm run typecheck`：PASS；操作级类型正例通过，4 类负例被预期阻断。
- `npm run test:frontend:coverage`：12/12 tests PASS；statements 92.3%、branches 79.74%、functions 82.6%、lines 94.28%。
- 完整 `npm run quality`：首次运行前半段全部通过，依赖审计因受限网络访问 npm registry 失败，未记为 PASS；授权联网后在 Node `v24.14.0` 完整重跑 PASS。前端 12/12 tests；coverage statements 92.3%、branches 79.74%、functions 82.6%、lines 94.28%；G4 护栏 11/11；OpenAPI 0 error/14 个既有 warning；根/frontend 漏洞均为 0；selfcheck PASS。
- push 前合入最新 `origin/master`（含 G4-02）。首次合并后验证因未安装新增 `pg` 依赖失败；执行 `npm ci` 后完整复跑 PASS：除上述结果外，backend 6/6 tests、coverage statements/lines 94.77%、branches 93.93%、functions 93.75%，秘密扫描扩展至 46 文件，四份 selfcheck PASS。

## ISSUE-G4-03-002 二次整改

- 根据 C 复验意见，进一步从 operation 参数推导必填 `path` 与 `X-Idempotency-Key`，不再把二者固定声明为可选。
- 类型负例新增缺少必填 path、缺少必填幂等键两类；正例覆盖带 path 调用，运行时测试覆盖 path 值的 URL 编码替换。
- 完整 `npm run quality` PASS：frontend 13/13 tests，coverage statements 93.4%、branches 79.74%、functions 86.95%、lines 95.71%；G4 护栏 11/11；backend 6/6；OpenAPI 0 error/14 个既有 warning；根/frontend 漏洞均为 0；四份 selfcheck PASS。本 Issue 仍等待 C 独立复验，不由 A 自行关闭。
