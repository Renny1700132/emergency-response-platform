# G6唯一交付/证据索引（首版快照 + 当前增量）

> 状态：REVIEW_INITIAL_CANDIDATE_PENDING_B。无文件不写齐套；`NOT_AVAILABLE` 是真实缺项，不是 N/A 或 PASS。SHA-256 针对当前工作区字节，内容提交后以 Git 对象/最终清单复核。

> 2026-10-12 增量状态：`REVIEW_INCREMENT_PENDING_B_FINAL_REVIEW`。下方29行是 2026-10-11 冻结首版快照（56e9da9；日志回填e194cdb；B首版接受deaddc6），故不倒改CI-015/016等历史行。当前事实追加在本文末，canonical Git blob取自 `cfdb6f5f4f75bdcce04754f513668796da62326c`。

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

## 2026-10-12 当前增量

| ID | 交付/证据 | 路径 | 版本 | 状态与证据类型 | 真实边界 | canonical SHA-256 |
|---|---|---|---|---|---|---|
| GI-001 | 用户手册源文件候选 | `docs/deliverables/G6/34-用户手册.docx` | G6-01@f9eec53 | AVAILABLE / A NEED_FIX / DOCUMENT_SOURCE | 课程候选，非真实验收 | `755e94ef675751cd222803b93580fcd1a48ea5db7235cd789416e962d0a7bd65` |
| GI-002 | 用户手册PDF候选 | `docs/deliverables/G6/34-用户手册.pdf` | G6-01@f9eec53 | AVAILABLE / A NEED_FIX / DOCUMENT_PDF | 课程候选，非真实验收 | `ad13e62436ee2473192fc7a1a1b0982cc91c608a206399c3203bc983459cb77d` |
| GI-003 | 部署与运维手册源文件候选 | `docs/deliverables/G6/45-部署与运维手册.docx` | G6-01@f9eec53 | AVAILABLE / A NEED_FIX / DOCUMENT_SOURCE | 课程候选，非真实验收 | `c6a47f76462aa58514be83f49ec832775914a147ffff68105afde66f41e6b4cf` |
| GI-004 | 部署与运维手册PDF候选 | `docs/deliverables/G6/45-部署与运维手册.pdf` | G6-01@f9eec53 | AVAILABLE / A NEED_FIX / DOCUMENT_PDF | 课程候选，非真实验收 | `aa95c5ee60f4943495a32a545deaaeca942cee2bbf6aab971a7627993b93a65f` |
| GI-005 | 命令执行台账 | `evidence/g6/G6-01/command-execution-ledger.md` | G6-01@f9eec53 | AVAILABLE / A NEED_FIX / COMMAND_LEDGER | 作者侧本地证据 | `ffedae206ea4ca590219a735612bda387058cc84cbaf0f72b6e9deb0cd6edbf0` |
| GI-006 | 部署交接与已知限制 | `docs/work/B_TECH/g6_deployment_handoff_and_known_limits.md` | G6-01@f9eec53 | AVAILABLE / A NEED_FIX / HANDOFF | 真实独立部署仍延期 | `3522725e4fb32cf4c2edd780bcfb26f007c6f35106a1ce6e9cf9019158853247` |
| GI-007 | 截图登记 | `evidence/g6/G6-01/screenshot-register.md` | G6-01@f9eec53 | AVAILABLE / SCREENSHOT_REGISTER | 课程展示证据 | `76f777735242a0f98ba7c606dd434ebc87953626cc12b287cbbd10ec50a9a507` |
| GI-008—010 | 三张Web/H5截图 | `evidence/g6/G6-01/screenshots/`（JSON逐文件列示） | G6-01@f9eec53 | AVAILABLE / SCREENSHOT | 课程展示证据 | 见JSON逐文件canonical指纹 |
| GI-011 | 验收答辩候选PPTX | `docs/deliverables/G6/G6-03-验收答辩候选.pptx` | G6-03@8dbfbab | AVAILABLE / PENDING B+C REVIEW | 候选，不是正式交付 | `83eeff87ca1b761a995eb60dc44207d634d5f593a1bbea7d70ca5d4b9e5dad51` |
| GI-012 | 验收答辩候选PDF | `docs/deliverables/G6/G6-03-验收答辩候选.pdf` | G6-03@8dbfbab | AVAILABLE / PENDING B+C REVIEW | 候选，不是正式交付 | `5db7eb5dcf46b69126027dd1a92fa4421eb56b8d3c38e5e5bd4486bf2c2e79cd` |
| GI-013 | 模拟试演结果 | `evidence/g6/G6-03/rehearsal-result.json` | G6-03@8dbfbab | AVAILABLE / 23 SIMULATED CHECKS PASS | 不增加AC PASS | `cc72b302482d759eb70aa45fe5bff693dd3816db3bc81b1060072635db92ee34` |
| GI-014 | 模拟试演版本锁 | `evidence/g6/G6-03/rehearsal-release-lock.json` | G6-03@8dbfbab | AVAILABLE / ISSUE-G6-03-001 | 本地模拟版本证据 | `1760b1ddbbd7f7495ccaa86692e5f93c888dea38d1875862473d448d6f43878b` |
| GI-015 | 模拟试演交接 | `evidence/g6/G6-03/handoff.md` | G6-03@8dbfbab | AVAILABLE / PENDING B+C REVIEW | 真实现场仍延期 | `ca937f5f0fcd671a040e8ca0c2383122c0f9aa8f459362a9370a59222921fd9b` |
| GI-016—019 | A的G6-01/G6-02 Review、汇总及审核基线 | `docs/work/G6/`（JSON逐文件列示） | A-review@72aadc1 | AVAILABLE / NEED_FIX / REVIEW_RECORD | 审核证据，不是验收通过 | 见JSON逐文件canonical指纹 |
| GI-020—021 | A机械审核与22页视觉审核记录 | `evidence/g6/G6-A-review/`（JSON逐文件列示） | A-review@72aadc1 | AVAILABLE / REVIEW_EVIDENCE | 视觉/机械复核不等于内容接受 | 见JSON逐文件canonical指纹 |

### 历史路径与实际候选路径

- CI-028规划路径 `docs/deliverables/G6/G6-验收答辩.pptx` 仍不存在，不将其伪记为可用。
- 实际候选路径为 GI-011/012；候选待B技术确认与C整体复核，不替代正式路径。
- CI-029要求的真实现场记录仍不存在；GI-013—015仅为本地内存、模拟数据的实际试演证据。
- 本次增量21项均可定位，但真实世界验收接受数仍为0；30项实现延期、76项证据延期、六类甲方系统0/6、真实独立操作者0保持不变。

## 2026-10-12 G6-01 V0.2 后续增量

> 本节为ISSUE-G6-02-004追加，保留GI-001—021及其`cfdb6f5`历史指纹不变。V0.2形成链为应用锁`75f01c3`、文档/证据`6255f94`、合并交付点`a8f8134`；以下canonical Git blob统一取自B复核回填后的输入基线`d17847d10ab0009f2b7c1468cf5540d90a3c0694`。当前状态仅为`B_REMEDIATED_PENDING_A_REREVIEW`，未预写A通过。

| ID | V0.2交付/证据 | 路径 | 状态/边界 | canonical SHA-256 |
|---|---|---|---|---|
| GI-022 | 用户手册V0.2源文件 | `docs/deliverables/G6/34-用户手册.docx` | B已整改，待A复验；课程候选 | `ebc7de0b2183474e5689ea1236696f20c0c14a1a2b851cedbac83985c5e69e50` |
| GI-023 | 用户手册V0.2 PDF | `docs/deliverables/G6/34-用户手册.pdf` | B已整改，待A复验；课程候选 | `057e2ea7eb4761a4b3cbb3160214f1248802c8e0410fa045ce99e39dca6a7e4a` |
| GI-024 | 部署与运维手册V0.2源文件 | `docs/deliverables/G6/45-部署与运维手册.docx` | B已整改，待A复验；课程候选 | `bafa269526b1ae936a9fcba6b913eef07b202afdab77f51329b40ffe84f2c0c3` |
| GI-025 | 部署与运维手册V0.2 PDF | `docs/deliverables/G6/45-部署与运维手册.pdf` | B已整改，待A复验；课程候选 | `abbfac95db9897f9d9ab55cafac675005bec044b1f756a930a53e63133c15ece` |
| GI-026 | 命令台账摘要 | `evidence/g6/G6-01/command-execution-ledger.md` | 26步摘要；B本地隔离执行 | `42182043c5fdbaddab0c6f93b80f1e8232414d4a54ac419034b6989aab681d27` |
| GI-027 | 逐命令机器台账 | `evidence/g6/G6-01/remediation-command-ledger.json` | 26/26 exit 0；非KN-065 | `e58eb05340493002c7c11a125296ce859eec1e68f065b2865d3098c2866c6d83` |
| GI-028 | 部署交接与已知限制 | `docs/work/B_TECH/g6_deployment_handoff_and_known_limits.md` | B已整改，真实独立部署仍延期 | `9e194fd079e965f0dd96f7fddd75c01e348f88e4770082783912e24c5f5af05b` |
| GI-029 | V0.2发布锁 | `evidence/g6/G6-01/release-lock.json` | 应用锁`75f01c3` | `277fee2ee4adef32bdf42767891a8d246d7cb681ce7112254e3e8fdbe87a9b47` |
| GI-030 | 部署/目标回退检查 | `evidence/g6/G6-01/remediation-deployment-check.json` | 26/26 PASS；B本地隔离执行 | `7b76e977cd61505996489d231f5c77346963c3e591c57e1af199a28c112813ce` |
| GI-031 | V0.2渲染QA | `evidence/g6/G6-01/document-render-qa.md` | 版式检查完成，待A内容复验 | `842767fa8ff0d942dbdb69f4e473b96dcafcff59bf1f850cac5ab3c656b24a82` |
| GI-032 | B整改记录 | `docs/work/G6/G6-01_B_remediation.md` | REMEDIATED_BY_B / PENDING_A_REREVIEW | `b19c1510fae632c2b8f228638611b9cb663650572f119f98e65ec96e47c43c78` |
| GI-033—035 | 文档对清单、整改自检、26步raw索引 | `evidence/g6/G6-01/`（JSON逐文件列示） | 配置/自检/原始定位；不替代A复验 | 见JSON逐文件canonical指纹 |
| GI-036—037 | 当前任务与Issue输入状态 | `tasks.md`、`control/issues.md` | 输入时G6-01待A、G6-02两项OPEN | 见JSON逐文件canonical指纹 |
| GI-038—039 | B最终整体复核第一轮 | `evidence/g6/G6-02/b-final-review.json`、`logs/reviews/2026-10-12_G6-02-B-final-review.md` | CHANGES_REQUIRED；不是接受 | 见JSON逐文件canonical指纹 |

V0.2后续增量共18项，18项均可定位；26步部署/回退为成员B本地隔离运行，不能迁移成甲方现场或真实非乙方独立部署。G6-02仍待B再复验，之后才可交A做目录、计划和一致性复验。

## 2026-10-12 A复验并发增量

> C内容提交后、首次push前，远端新增`e223f6d`（G6-01 A复验）。本轮以普通merge保留双方工作，并追加该受控输入；不覆盖GI-022—039。A已接受G6-01手册与本地交付证据，但真实KN-065、甲方六类接口及G6整体验收仍延期。

| ID | A复验输入 | 路径 | 当前结论 | canonical SHA-256 |
|---|---|---|---|---|
| GI-040 | 更正后的用户手册V0.2源文件 | `docs/deliverables/G6/34-用户手册.docx` | ACCEPTED_BY_A_FOR_G6_01 | `d9b6555a834126f341bc759e07ae70528c966b22eb4f820a0c4e4a5580b4046d` |
| GI-041 | 更正后的用户手册V0.2 PDF | `docs/deliverables/G6/34-用户手册.pdf` | ACCEPTED_BY_A_FOR_G6_01 | `b0bffb8cac011ba39f9d71e1a98f1061c34167db8eb35bda874735e41c0bb332` |
| GI-042—043 | 用户手册工作稿与更新后Pair清单 | `docs/work/B_TECH/g6_user_manual.md`、`evidence/g6/G6-01/document-pair-manifest.json` | 小错已同步 | 见JSON逐文件canonical指纹 |
| GI-044 | G6-01 A复验记录 | `docs/work/G6/G6-01_A_rereview.md` | PASS / ACCEPTED_BY_A | `ff6b8800a73b5d3185fec37184c96fe9b74a84624ce38788bcb9731e69728d21` |
| GI-045—047 | A机械、渲染与质量门禁证据 | `evidence/g6/G6-01/A-rereview/`（JSON逐文件列示） | 35项断言PASS；本地quality exit 0 | 见JSON逐文件canonical指纹 |
| GI-048—050 | A审核汇总及输入时tasks/issues状态 | `docs/work/G6/G6_A_review_summary.md`、`tasks.md`、`control/issues.md` | G6-01 DONE；G6-02仍待C/B | 见JSON逐文件canonical指纹 |

A复验增量共11项，11/11 canonical Git blob取自`e223f6d`并可核验。此增量将G6-01当前状态更新为`DONE（MANUALS_AND_LOCAL_DELIVERY_REVIEW_ACCEPTED / REAL_WORLD_DEFERRED）`，不改变G6-02待B再复验状态。

## 2026-10-12当前接受状态

B最终整体再复验`6fad770`已接受；A目录/计划/一致性复验接受，任务DONE（真实履约延期）。机器索引顶层state及currentAcceptance为当前状态；首版29项20/9、cfdb6f5的21项、d17847d的18项、e223f6d的11项保持锁定，不倒改各时点Review状态。当前手册新指纹GI-040—043优先于V0.1/V0.2早期条目；G6-03候选与真实现场分列。
