# 八大质量特性证据自评

Task G5-03；A何思源；2026-10-11；C最终复核待执行。本记录为证据自评，不是甲方生产验收。课程采用OVR-034/035双结论。

| 特性 | 实际验证方法 | 可复核证据 | 结果 | 限制和延期 |
|---|---|---|---|---|
| 功能适合性 | 从原始117AC逐行计数；核对完整预期/断言及A最终Review；专用系统包真实HTTP/PostgreSQL | G5-01/functional-gate-raw.json；G5-03/rtm-v5.json；2026-10-11_G5-01-A-final-review.md | 11 PASS/59 NOT_RUN/47 BLOCKED；34★FR 1 PASS/33 BLOCKED | 030—039未实现30AC；其余76AC缺完整执行；真实功能门禁仍BLOCKED |
| 性能效率 | JSON/CSV逐行对照1160样本；nearest-rank独立复算8组P50/P95/P99 | G5-02/performance-raw.json、performance-samples.csv；G5-03/mechanical-summary.json | 本地1160样本0失败；PE-07 P99 35.554ms、100并发P99 39.513ms | 内存持久层/小数据；非目标规模/PostgreSQL；CPU/RSS连续资源数据缺失；REAL_WORLD/EVIDENCE_DEFERRED |
| 兼容性 | Edge154真实390×844布局/鉴权边界；适配器模拟正常/无权/超时/失败 | G5-01/compatibility-matrix.md及修复后图；G5-02/course-conditional-external-systems.json | 单Edge版本布局PASS；6类课程模拟覆盖 | SIMULATED_EVIDENCE；Chrome双版本/Edge第二版及Android/iOS宿主NOT_RUN/BLOCKED；REAL_WORLD_DEFERRED |
| 易用性 | 挂载组件错误语义、加载/空/403/网络失败/上传重试/traceId | G5-01/error-semantics-review.md；frontend/tests/page-interactions.test.ts及功能套件原始输出 | 已执行错误反馈路径PASS | KN-039真实新用户≤2h学习计时未执行；不能由AI走查代替；REAL_WORLD_DEFERRED |
| 可靠性 | 注入消息/门禁超时；隔离PG服务重启、备份销毁恢复及一致性断言 | G5-02/fault-drill-raw.json、postgres-recovery-drill.json | 403、MESSAGE_TIMEOUT、人工降级/禁止自动重放成立；37表/1哨兵前后一致 | 外部故障SIMULATED_EVIDENCE；短时本地演练不证明7×24/99.5%或长期MTTR |
| 安全性 | 依赖/秘密扫描；授权/拒绝、审计脱敏与参数化SQL测试 | G5-02/security及dependency原始文件；G5-03/final-quality.log；功能JSON | 根/前端漏洞0、高危0；secret scan PASS；相关拒绝路径PASS | 本地应用扫描，不是完整渗透、第三方等保或甲方环境安全复测；后续补测 |
| 可维护性 | typecheck/build/coverage/OpenAPI/selfcheck；入口回归 | G5-03/final-quality.log；G5-02/quality-summary.json | quality exit0；后端行87.75%、分支77.77%；前端行100%、分支77.73%；OpenAPI0 error/14 warning | coverage include范围有限；14描述warning保留；008部署脚本后续运行改进未闭环 |
| 可移植性 | 校对空卷/无缓存Docker构建、迁移、health/ready、重启和隔离PG迁移 | G5-02/docker-clean-deploy.json及log；postgres-recovery-drill.json | WSL2 Docker28.1.1/Compose2.35.1，B执行17秒；局部部署PASS | 非Windows原生Docker/甲方主机；真实非乙方操作者0；课程SIMULATED_COURSE_ROLE不等于独立真人；REAL_WORLD_DEFERRED |

COURSE_ACCEPTED：八特性均有可复核方法/证据与缺口说明，可提交C审核课程条件收口；尚未获G5-03独立最终接受。
IMPLEMENTATION / REAL_WORLD STATUS：局部PASS成立，全量和生产硬门禁尚未满足，保持IMPLEMENTATION_AND_REAL_WORLD_DEFERRED。
