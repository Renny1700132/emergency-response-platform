# G6-01 A 整体复核请求

- 主责：B（严宇）
- 复核：A（何思源）
- 候选日期：2026-10-11
- 状态：REVIEW
- 锁定发布快照：`beb605f83e738a39dfe388ed4bc25b5b724eddcf`
- 最近代码快照：`5fc359aea5e08118d17f2e076e6f669b04adf9b4`

## 请复核的正式候选

1. `docs/deliverables/G6/34-用户手册.docx` 与同名 PDF；
2. `docs/deliverables/G6/45-部署与运维手册.docx` 与同名 PDF；
3. `docs/work/B_TECH/g6_user_manual.md`、`g6_deployment_operations_manual.md`；
4. `evidence/g6/G6-01/` 下的命令台账、质量/部署 JSON、原始日志、截图登记、渲染 QA；
5. `docs/work/B_TECH/g6_deployment_handoff_and_known_limits.md`。

## B 自查结论

- `npm run quality`：exit 0；前端 45 PASS/2 SKIP，G4 11/11，后端 21/21；三组覆盖率均超过 70%；OpenAPI 0 error/14 个既有非阻断 warning；秘密扫描 PASS；依赖漏洞 0；selfcheck PASS。
- 隔离 Docker：19 秒完成无缓存构建、启动、三组迁移、health/ready 200、37 表备份恢复、哨兵 1→1、重启 ready 200、清理残留 0/0/0。
- 文档：两份 DOCX/PDF 各 11 页，22 页全量渲染检查 PASS；目录、分页、图表编号和 Pair 格式继承可定位。
- 安全：日志未保留一次性数据库口令、Bearer 或真实账号；公开手册没有秘密值。

## 必须保持的审查边界

- 本轮 Docker 执行人为成员 B，只是 `MEMBER_B_LOCAL_ISOLATED_RUN`；真实 KN-065 非乙方独立部署仍未执行。
- 视频、消息、定位、GIS、安防、信息发布六类甲方系统仍为 0/6 实测。
- G5 真实结果仍为 11 PASS、59 NOT_RUN、47 BLOCKED；课程条件接受不改变真实分母。
- 用户手册截图为显著标注的课程演示数据，不是甲方真实数据或生产联动证据。

请求 A 对场景完整性、文档可操作性、命令与锁定候选一致性、Reference 格式、真实/模拟边界和交接充分性进行整体复核。A 接受后方可将 G6-01 置 DONE；若发现问题，请按 BLOCKER/MAJOR/MINOR/OBSERVATION 分级并给出文件定位。
