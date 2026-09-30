# feat(G4-08): 完成 Sprint 2 剩余 MVP 后端及外部适配

## 问题与结果

Sprint 1 只覆盖事件处置主链，剩余 MVP 的预案、资源、演练、值班打卡、态势和外部联动尚无正式后端。本 PR 补齐 G4-08 后端增量、成对迁移、8 EXT/GIS/H5 适配、失败降级、测试、RTM、自查和任务证据。

## 主要变更

- 增加预案编排/发布、事件组合检索与续报、定位新鲜度、物资盘点、演练评估、扫码打卡、知识检索、安防/IoT 告警、视频引用和门禁控制后端能力。
- 增加 `003_sprint2_mvp` 成对迁移和持久化恢复；SQL 值参数化。
- 覆盖 `EXT-VIDEO/PUBLISH/INTRUSION/ACCESS/FIRE/IOT/MIDDLE/MESSAGE`、GIS、H5 的 normal/unauthorized/timeout/failure。
- IoT/消息仅有限重试；门禁控制要求授权确认，失败人工降级且禁止自动重放。
- 更新 G4 RTM、自查、证据和 `tasks.md = DONE` 候选状态。

## 验证

- `npm run quality`：exit 0。
- frontend：28/28；覆盖率 95.41/77.55/95.12/100%。
- G4 护栏：11/11；覆盖率 96.75/81.63/90/96.75%。
- backend：20/20；覆盖率 88.00/77.74/85.24/88.00%。
- OpenAPI：0 error，14 个既有非阻断 warning。
- 秘密扫描：60 文件 PASS；根与前端依赖漏洞均为 0；selfcheck PASS。

## 边界与 Review 重点

- Fixture 证据均为 `SIMULATED_EVIDENCE`，不代表甲方真实接口、账号、现场网络或 KN 性能验收完成。
- 当前环境无私有 `DATABASE_URL` 且无 Docker；迁移成对静态验证和恢复测试已通过，PostgreSQL `up → down → up` 请 A 在隔离测试库独立复跑，或保留至 G4-10。
- 请唯一审核人 A 重点检查冻结 AC 映射、迁移、外部错误语义、门禁控制不重放和模拟/真实证据边界。

## 回滚

- 业务代码可通过回退本 PR 恢复。
- 数据库先执行 `003_sprint2_mvp.down.sql`；不得对含有效业务数据的环境直接回滚，须先按受控备份/迁移方案处理。
