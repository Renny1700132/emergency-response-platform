# G6-01 A 整改复验

- 日期：2026-10-12；A 为用户授权 Codex 辅助复验，不代替自然人签署。
- 最新 master 输入：d17847d；发布代码：75f01c3bb33369d3785acf69a3a00eb983aa188b；包含 H5 修复 8dbfbab，至输入 HEAD 应用代码无新增差异。
- 任务依据：当前 tasks.md；B 主责、A 整体复核。当前 Prompt 授权无重大错误置 DONE、小错直接修改。
- 结论：PASS / ACCEPTED_BY_A；G6-01 = DONE（MANUALS_AND_LOCAL_DELIVERY_REVIEW_ACCEPTED / REAL_WORLD_DEFERRED）。原退回记录保留，本记录替代其 G6-01 当前结论。

## 原问题关闭

| Issue | 定向复验与证据 | 本次结论 |
| --- | --- | --- |
| ISSUE-G6-01-001 | IncidentFlowView 的关闭入口、权限、必填结论/报告引用、服务状态及全部任务完成校验、CLOSED字段；组件/本地实际HTTP测试；其他工作台只读边界、手册正常异常路径 | CLOSED / VERIFIED_BY_A |
| ISSUE-G6-01-002 | 26条命令 ledger 与 steps.jsonl 一致；逐条环境版本、时间、实际raw、exit0，静默命令允许空输出；配置、Dockerfile、备份指纹匹配；旧失败和旧V0.1证据保留 | CLOSED / VERIFIED_BY_A |
| ISSUE-G6-01-003 | 前端构建/宿主/同源代理、三服务healthcheck、配置透传及身份注入；目标回退 --steps/--to、停写/备份/恢复点与无参数down全量风险；B实跑3→2→3迁移、37→13→37表、恢复37表/哨兵1、清理0/0/0 | CLOSED / VERIFIED_BY_A（本地隔离） |
| ISSUE-G6-01-004 | V0.2统一锁75f01c3，8dbfbab为祖先；旧截图显著标课程演示及历史日期，未归属新代码；B整改记录提供技术确认，A版本一致性复验通过 | CLOSED_FOR_G6_01 / VERIFIED_BY_A；G6-03 C整体复核仍PENDING |

004原记录的C G6-03整体复核条件在G6-03继续执行，未删除或宣布完成。当前任务看板仅要求A审核G6-01；本次关闭其手册/版本映射问题，不改变G6-03任务边界，也不代替C接受G6-03。

## 五项审核

1. 用户手册：角色权限、真实页面入口、发现/确认/处置/反馈/关闭及401/403/409/422等处理均有说明；未实现工作台写操作如实列边界。组件+HTTP自动化证据足以关闭原入口缺口；不是新截图或现场真人证据。
2. 部署运维：环境/依赖、安装构建、配置、启停、监控日志、故障处理、备份恢复及目标回退覆盖。非作者可按交接顺序执行；本次没有真实非乙方人员执行证明，KN-065不通过。
3. 命令真实性：A独立校验26条记录与指纹（35项机械断言通过）；实际执行者B，WSL外部目录有动态HEAD/dirty/Compose/镜像对应，不以路径名称推定旧版本。后端Dockerfile为CRLF字节，初次仅LF比较失败；仅规范化行尾后吻合，不改变证据。可选宿主npm ci/approved checkout/生产pull未在26条部署证据中冒充实跑。
4. 真实边界：课程/模拟/本地隔离与真实履约分列；接口0/6、独立操作者0、KN-065延期、G5真实AC 11 PASS/59 NOT_RUN/47 BLOCKED保持。没有把条件接受变成全完成。
5. 文档规范：Reference原件哈希不变，用户手册从34号Reference物理复制后按既有B构建器同步；仅修正§4.3证据介质表述。Word COM同一引擎渲染Reference及用户手册，用户10页全部单页查看；运维10页整套拼图复核可读、无裁切/重叠，未修改其源件。正式封面待复核/批准是B送审快照字段，实际本次AI辅助接受依据本记录，不构成人工签字。

## 小错修正

ISSUE-G6-01-005 / MINOR / FIXED_VERIFIED_BY_A：real-stack-e2e.test.ts确实发本地HTTP，但createServer未注入数据库，使用内存存储及模拟外部提供方。删除“HTTP/PostgreSQL关闭验证”的错误合并表述，工作稿/DOCX/PDF同步，并更新Pair manifest新旧指纹。PostgreSQL部署/回退/恢复证据仍独立有效；未声称PostgreSQL业务关闭实测。

## 验证及限制

- A重跑本地 npm run quality exit0；日志 evidence/g6/G6-01/A-rereview/quality.log。数据库相关跳过项仍保留，不推导所有AC通过；A没有重跑Docker、生产或真实独立人员部署。
- evidence-validation.json 保存35项断言及输入HEAD；word-render.json记录用户10页/Reference12页。打包render_docx尝试失败，完整失败日志保留（临时profile权限失败）；沙箱Word COM首次拒绝访问，授权正常权限重试成功。Poppler字体warning存在但实际页面可读。
- 本轮渲染缓存检查后删除，不清理旧入口未知G4工作，不改变历史受控记录。

## 跨任务一致性与下一步

39 FR/117 AC/34★及11/59/47不变；手册、台账、交接、release-lock均指向75f01c3并区分旧图。G6-02当前索引仍缺V0.2增量，B已登记004/005，保持REVIEW；C须挂接本次更正后用户手册新hash、A接受记录，再由B复验。G6-03 C复核/现场资源、真实验收和最终冻结仍独立待办。本次仅允许G6-01下游按既定依赖使用已审核材料，不允许宣布G6全关或生产验收PASS。

## 修改清单

用户手册工作稿及DOCX/PDF、Pair manifest；本复验记录；tasks.md G6-01行；control/issues.md、整体Review汇总和docs/README.md追加当前结论；A原文日志；A-rereview质量/机械/渲染文本证据。应用源码、运维正式件、C索引/RTM、原始历史Review未修改。
