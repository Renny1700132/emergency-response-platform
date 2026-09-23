# G4-03 A 整改与再审提交记录

- 任务：G4-03｜正式 Vue 前端骨架与 API Client
- 主责：A（何思源 / @WhiteApricot）
- 唯一审核人：C（任俊强 / @rjq010504）
- 分支：`codex/g4-03-vue-api-client`
- 状态：PENDING_C_REVIEW

## 审核意见来源与边界

仓库 Review、Issue、Prompt 日志及公开 Gitee PR 列表中未找到已创建的 G4-03 PR 或 C 的正式 Review 原文；原日志状态为 `PR_CREATE_BLOCKED`。本次不伪造审核意见，依据 G4-03 DoD 与现行统一质量门禁完成独立复检和整改，范围仅限 Vue Web/H5 骨架、鉴权上下文、类型化 API Client、错误/traceId 与测试门禁，未进入 G4-06/G4-09 业务闭环。

## 发现与整改

1. 前端核心基础设施未被 `≥70%` 覆盖率门禁采集。已新增 Vitest V8 覆盖率门禁，采集 `frontend/src/shared/**/*.ts`，statements/branches/functions/lines 四项均以 70% 阻断。
2. 前端测试工具链存在 2 个 moderate 安全告警。已升级 Vitest 与 coverage provider 至 5.0.1，重新审计为 0 vulnerabilities。
3. 新增鉴权上下文测试，并扩展 API Client 的 JSON body、幂等键、401、traceId、204 和取消路径测试。
4. 新增测试暴露“调用方 signal 在发起请求前已取消时未传播”的缺陷；已在 API Client 中对预取消信号立即 abort，并保留回归测试。
5. 将最新 `master` 的 G4-04、统一 selfcheck 与模拟服务门禁合入；冲突按双方唯一意图解决，G4-04 保持 DONE、G4-03 保持 DOING。

## 实际验证

- `npm ci` 与 `npm ci --prefix frontend`：PASS。
- `npm run quality`：PASS。
- 前端测试：10/10 PASS。
- 前端核心覆盖率：statements 93.02%、branches 78.94%、functions 85.71%、lines 95.45%，四项均高于 70%。
- 前端类型检查与生产构建：PASS；38 modules transformed。
- G4 护栏测试：11/11 PASS；coverage statements/lines 96.75%、branches 81.63%、functions 90%。
- OpenAPI：0 error / 14 个已登记既有 warning；冻结契约未修改。
- secret scan：PASS；根目录和 frontend 依赖漏洞均为 0。
- selfcheck：G4-01、G4-03、G4-04 全部 PASS。
- Vite 启动冒烟：`/` 200，`/src/main.ts` 200。
- `git diff --check`：PASS。

## 再审请求

请 C 以唯一审核人身份检查本次整改提交、前端覆盖率范围、预取消修复、依赖升级、原型隔离与 G4-03 范围边界；只有 C 明确 PASS/APPROVE 后才可通过 PR Merge 进入 `master`。
