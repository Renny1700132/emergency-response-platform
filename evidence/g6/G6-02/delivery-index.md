# G6唯一交付/证据索引（首版候选）

> 状态：REVIEW_INITIAL_CANDIDATE_PENDING_B。无文件不写齐套；`NOT_AVAILABLE` 是真实缺项，不是 N/A 或 PASS。SHA-256 针对当前工作区字节，内容提交后以 Git 对象/最终清单复核。

| ID | 文种/配置项 | 路径 | 主责/复核 | P1/任务书映射 | 可用性 | 当前状态 | SHA-256 | FR/AC/TC | 下游使用 |
|---|---|---|---|---|---|---|---|---|---|
| CI-001 | 项目管理计划 | `docs/deliverables/20-项目管理计划.docx` | A/C | P1 §10.3 DEL-DOC-001 | AVAILABLE | COURSE_DELIVERY_CANDIDATE | `4e639e41ba6eacc749702451e651f06411ae979a3c2b43dcf7b2bbbb4f78cee3` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-002 | 软件需求规格说明书 | `docs/deliverables/08-软件需求规格说明书SRS.docx` | A/C | P1 §10.3 DEL-DOC-001 | AVAILABLE | FROZEN_INPUT | `867d1d4cc22ffd8822a40f6e8726392ff2c73df135208c05d07f2c711488139e` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-003 | 概要设计说明书 | `docs/deliverables/11-概要设计说明书.docx` | B/A | P1 §10.3 DEL-DOC-001 | AVAILABLE | FROZEN_INPUT | `c655d499c64fe04d896fcbda4d76e226bc018154a2d154c8b8c9688cada12973` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-004 | 详细设计说明书 | `docs/deliverables/12-详细设计说明书.docx` | B/A | P1 §10.3 DEL-DOC-001 | AVAILABLE | FROZEN_INPUT | `ca5a560570c8d0177bcde381fa438485ff3986d0dbc0da9476651b4d61abd330` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-005 | 数据库设计说明书 | `docs/deliverables/13-数据库设计说明书.docx` | B/A | P1 §10.3 DEL-DOC-001 | AVAILABLE | FROZEN_INPUT | `2768ec3f9b93fe5e63ad90d297e35d9751345f76f4223509466e15dff556e646` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-006 | 接口设计说明书 | `docs/deliverables/14-接口设计说明书.docx` | B/A | P1 §10.3 DEL-DOC-001 | AVAILABLE | FROZEN_INPUT | `ea4353470a3ecaaaf94de04a0a30147d8100021fe3972f336553de667197d497` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-007 | 接口契约 | `docs/deliverables/15-接口契约-openapi_v1.yaml` | B/A | P1 §10.3 DEL-DOC-001 | AVAILABLE | FROZEN_INPUT | `d5db4953ad64153077b1a00c903f23a2e5f3ab716e2b236819a2874a5d95a9f6` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-008 | 测试计划 | `docs/deliverables/19-测试计划.docx` | C/B | P1 §10.3 DEL-DOC-002 | AVAILABLE | COURSE_DELIVERY_CANDIDATE | `f449cc45f99db600a251e0d1b0d4a1098a67f3ae22ac4fc39905cf74ff0115a1` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-009 | 测试报告 | `docs/deliverables/G5/36-测试报告.docx` | A/C | P1 §10.3 DEL-DOC-002 | AVAILABLE | COURSE_CONDITIONAL_ACCEPTED | `428a6cdb2019aa318d24fd07f820536cc59021e7ec9674d796c80c89f4ce8a42` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-010 | 性能压测报告 | `docs/deliverables/G5/37-性能压测报告.docx` | A/C | P1 §10.3 DEL-DOC-002 | AVAILABLE | COURSE_CONDITIONAL_ACCEPTED | `380474831e5ff458fd82b06331e73d4a020fe2b3751518edcd8ec27ddb6f6bd5` | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-011 | 缺陷看板与修复记录 | `docs/deliverables/G5/38-缺陷看板与修复记录.docx` | A/C | P1 §10.3 DEL-DOC-002 | AVAILABLE | COURSE_CONDITIONAL_ACCEPTED | `c74874b4bdee13ec472e57c1b56e4db665f52d8205a0aa23cd70d3b82ef7e0f0` | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-012 | RTM闭环核验记录 | `docs/deliverables/G5/39-RTM闭环核验记录.docx` | A/C | P1 §10.3 DEL-DOC-004 / §10.4 | AVAILABLE | COURSE_CONDITIONAL_ACCEPTED | `ab6241f2001865785c0f4084a802e737c0fc6e5830c960d33c820f2341e9273c` | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-013 | RTM V5机器明细 | `evidence/g5/G5-03/rtm-v5.json` | A/C | P1 §10.4 DOC-QA-002 | AVAILABLE | 11_PASS_59_NOT_RUN_47_BLOCKED | `ca80031edf5d19b0a8c90f784719f723c0f91b76cf15eb0be02334c538857ce7` | 39 FR / 117 AC / planned TC links | G6 manuals/PPT/summary as applicable |
| CI-014 | G5最终条件验收 | `evidence/g5/G5-03/c-final-acceptance.json` | C/N/A | G6准入 | AVAILABLE | COURSE_CONDITIONAL_ACCEPTANCE | `d8cd97b1ab0f397e9b69707a4fbb56dc718352bf0b9d1214d87476d5984bb361` | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-015 | 用户手册 | `docs/deliverables/G6/34-用户手册.docx` | B/A | P1 §10.3 DEL-DOC-003 | NOT_AVAILABLE | PLANNED_G6_01 | — | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-016 | 部署与运维手册 | `docs/deliverables/G6/45-部署与运维手册.docx` | B/A | P1 §10.3 DEL-DOC-003 / §10.4 | NOT_AVAILABLE | PLANNED_G6_01 | — | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-017 | 培训材料与记录 | `evidence/g6/G6-01/training-records.md` | B/A | P1 §9.3 / §10.3 DEL-DOC-003/DEL-OTHER-001 | NOT_AVAILABLE | PLANNED_OR_RESOURCE_BLOCKED | — | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-018 | 试运行报告 | `evidence/g6/G6-04/trial-operation-record.md` | A/C | P1 §10.3 DEL-DOC-004 | NOT_AVAILABLE | PLANNED_G6_04 | — | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-019 | 项目开发总结报告 | `docs/deliverables/G6/46-项目开发总结报告.docx` | A/C/B | P1 §10.3 DEL-DOC-004 | NOT_AVAILABLE | PLANNED_G6_04 | — | N/A or indexed downstream | G6 manuals/PPT/summary as applicable |
| CI-020 | 验收签署记录 | `docs/deliverables/G6/47-验收报告.docx` | A/C/B | P1 §10.1 / §10.3 | NOT_AVAILABLE | REAL_SIGNATURE_REQUIRED | — | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-021 | 基础数据初始化与双方确认 | `evidence/g6/G6-04/data-initialization-acceptance.md` | A/C | P1 §10.3 DEL-DATA-001 | NOT_AVAILABLE | OWNER_DATA_AND_CONFIRMATION_REQUIRED | — | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-022 | 故障演练原始记录 | `evidence/g5/G5-02/fault-drill-raw.json` | B/C | P1 §10.3 DEL-OTHER-001 | AVAILABLE | LOCAL_OR_SIMULATED_BOUNDARY | `bb0a67a1bca24bae4e00e08d650c4ed68e41a2f3e8090c3527d4967f2ae9808e` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-023 | 部署原始记录 | `evidence/g5/G5-02/docker-clean-deploy.json` | B/C | P1 §10.4 DOC-QA-003 | AVAILABLE | MEMBER_B_RUN_NOT_INDEPENDENT_OPERATOR | `84855c0c76374e5c80e2cf9e4930f98cf3c5f3a1d4db428e989c01bf577443aa` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-024 | 源代码与构建入口 | `package.json` | B/A | P1 §10.4 DOC-QA-001/003 | AVAILABLE | SOURCE_CONFIGURATION_ITEM | `f46240c70256e9b08347310e3fad2c43bb3a4a9d6f26a156f88ddd424d860627` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-025 | 容器编排配置 | `compose.yaml` | B/A | P1 §10.4 DOC-QA-003 | AVAILABLE | SOURCE_CONFIGURATION_ITEM | `8061be5ef4de31afa1006c37ba6a22c88fe2b966bdddc2b5c321a75ceaaaa5ff` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-026 | M3冻结基线 | `control/baselines/BASELINE-G3-M3-R1.0.md` | A/C/B | 受控设计输入 | AVAILABLE | FROZEN_BASELINE | `05536ca5547ee8ec39ebbc5dcfefc84c447fae938c1b8e806da42b96ec1c6c3d` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-027 | AI使用审计 | `evidence/g5/G5-03/ai-audit.json` | A/C | G6任务书过程证据 | AVAILABLE | HISTORICAL_AUDIT_INPUT | `98b6929c0ea336b451ca843c7f73e5d3c8e04fb5f37ea91d11f12425cfd53521` | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-028 | G6答辩PPT与讲稿 | `docs/deliverables/G6/G6-验收答辩.pptx` | A/C | G6任务书 | NOT_AVAILABLE | PLANNED_G6_03 | — | N/A or indexed downstream | G6-02/G6-03/G6-04 |
| CI-029 | G6试演/现场运行记录 | `evidence/g6/G6-03/live-run-record.md` | A/C | G6任务书真实演示 | NOT_AVAILABLE | REAL_WORLD_RESOURCE_REQUIRED | — | N/A or indexed downstream | G6-02/G6-03/G6-04 |
