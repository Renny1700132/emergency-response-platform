# G5-01 错误语义与易用性走查

| 检查项 | 本次证据 | 结果 | 说明 |
|---|---|---|---|
| 加载态与空态 | `frontend/tests/page-interactions.test.ts` | PASS | 真实组件先显示加载，再显示空态 |
| 403 无权 | `frontend/tests/page-interactions.test.ts`、`tests/backend/g4-05-integration.test.mjs` | PASS | 无权操作可见但禁用；后端返回受控拒绝 |
| 普通失败与 traceId | `frontend/tests/api-client.test.ts`、`frontend/tests/page-interactions.test.ts` | PASS | 错误规范化并保留 traceId 与重试入口 |
| 网络失败 | `frontend/tests/api-client.test.ts` | PASS | 显示受控失败，不泄露请求细节 |
| H5 附件失败/重试 | `frontend/tests/page-interactions.test.ts` | PASS | 失败后保留所选文件并可重试，不误报上传成功 |
| 超时与人工处置 | `tests/g4/integration-simulator.test.mjs`、`tests/backend/g4-08-sprint2.test.mjs` | PASS（SIMULATED_EVIDENCE） | 未知/超时结果 fail-closed，不自动盲重放，进入人工处置 |
| 幂等与版本冲突 | `tests/backend/g4-05-integration.test.mjs`、`tests/backend/g4-08-sprint2.test.mjs` | PASS | 写操作幂等、资源版本和受控冲突路径均有断言 |
| KN-038 浏览器版本 | `compatibility-matrix.md` | BLOCKED | 缺 Chrome/Edge 各两个稳定版本实际执行 |
| KN-039 新用户≤2小时学习目标 | 无真实新用户培训计时 | BLOCKED | 自动化测试或 AI 走查不能替代真实人员学习计时 |

结论：已实现功能的错误语义和可恢复反馈未发现阻断缺陷；KN-038、KN-039 因实际环境/人员证据不足保持 `BLOCKED`。
