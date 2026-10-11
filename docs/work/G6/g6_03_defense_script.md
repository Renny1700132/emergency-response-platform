# G6-03 验收答辩讲稿与逐页来源

- V0.1，A主责，C整体复核待执行。
- 讲稿与PPT来自同一JSON内容源。模拟数据与真实执行边界在正文显著保留。
- 本轮不填课程D18日期/指定时长；实际自动化运行计时仅描述机器执行。

## 第1页 应急管理子系统

本次汇报对应tasks中的G6-03验收答辩、现场演示与质询。最新用户纠偏要求以远端master的任务边界执行，并授权生成合理模拟数据。开发总结属于G6-04，本轮不提交总结。请始终把模拟业务输入、本地实际执行和甲方真实验收区分清楚。本轮采用模拟数据和本地实际执行。C整体复核待完成，真实项目验收继续延期。

来源：

- [tasks.md](../../../tasks.md)
- [docs/work/G6/g6_03_execution_baseline.md](../../../docs/work/G6/g6_03_execution_baseline.md)
- [control/overrides.md#OVR-039](../../../control/overrides.md#OVR-039)

## 第2页 课程状态与真实验收

项目先后形成投标、需求、设计与研发成果。G3工程基线冻结为BASELINE-G3-M3-R1.0；G4任务在master收口。G5-03由C独立最终复核接受的是课程条件结论，真实实现、证据和环境延期仍在。G6-01手册当前为REVIEW，G6-02由B接受首版但最终仍REVIEW，本轮G6-03候选也需要C整体复核。不能把课程任务DONE当作117条验收条件全部通过。

来源：

- [tasks.md](../../../tasks.md)
- [control/baselines/BASELINE-G3-M3-R1.0.md](../../../control/baselines/BASELINE-G3-M3-R1.0.md)
- [evidence/g5/G5-03/c-final-acceptance.json](../../../evidence/g5/G5-03/c-final-acceptance.json)
- [evidence/g6/G6-02/b-review.json](../../../evidence/g6/G6-02/b-review.json)

## 第3页 冻结范围与责任边界

39 FR、34项★FR和117 AC取自G6-02唯一指标账和B机械复验，不能将页面数、工作台数或套件通过数当作需求通过数。H5交付与宿主责任来源F-008，地图责任来源F-009，外部接口责任来源F-005。原型与演示数据可以解释页面，但不能充当正式数据库或甲方联调证据。

来源：

- [control/facts.md#F-005](../../../control/facts.md#F-005)
- [control/facts.md#F-008](../../../control/facts.md#F-008)
- [control/facts.md#F-009](../../../control/facts.md#F-009)
- [control/key_numbers.md#KN-063](../../../control/key_numbers.md#KN-063)
- [evidence/g6/G6-02/metrics-ledger.md](../../../evidence/g6/G6-02/metrics-ledger.md)

## 第4页 实现与发布基线

本轮从deaddc6快照开始。启动时应用代码与G6-01发布快照beb605f的Git差异为零，证据在input-manifest。实际试演发现H5进度显示问题后透明登记Issue，仅修正进度映射并新增回归断言，quality与完整试演复跑。新候选使用rehearsal-release-lock的文件哈希，不把新结果挂回旧commit。生产设计使用PostgreSQL与持久Outbox；本轮采用现有后端内存路径，注入模拟身份、消息和预案端口，不证明持久化或崩溃恢复。ADR接受不等于全部机制已被本轮验证。

来源：

- [evidence/g6/G6-01/release-lock.json](../../../evidence/g6/G6-01/release-lock.json)
- [evidence/g6/G6-03/input-manifest.json](../../../evidence/g6/G6-03/input-manifest.json)
- [evidence/g6/G6-03/rehearsal-release-lock.json](../../../evidence/g6/G6-03/rehearsal-release-lock.json)
- [backend/src/server.mjs](../../../backend/src/server.mjs)
- [frontend/src/main.ts](../../../frontend/src/main.ts)
- [docs/work/B_TECH/adr/ADR-001-应用拆分与部署单元.md](../../../docs/work/B_TECH/adr/ADR-001-应用拆分与部署单元.md)
- [docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md](../../../docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md)

## 第5页 G5质量结果

G6-02账本与G5最终Review一致：39 FR、34项★FR、117 AC。PASS 11、NOT_RUN 59、BLOCKED 47。完整通过的★FR只有1项，33项仍BLOCKED。性能1160样本来自8组本地内存HTTP和模拟适配，0失败也不能推断生产SLA或目标规模已通过。本轮试演增加的是具体路径证据，不改写这份历史分母或结果。

来源：

- [evidence/g6/G6-02/metrics-ledger.md](../../../evidence/g6/G6-02/metrics-ledger.md)
- [evidence/g6/G6-02/b-review.json](../../../evidence/g6/G6-02/b-review.json)
- [evidence/g5/G5-03/c-final-acceptance.json](../../../evidence/g5/G5-03/c-final-acceptance.json)

## 第6页 交付与证据导航

唯一交付索引由C维护，首版为29项，其中20可用、9缺项，这是首版存在性快照，不是当前齐套或验收通过率。本轮不修改C的索引和RTM，提供一份行级增量交接请求。G6-01文档和B本地命令记录可以用于操作依据，但尚无A整体接受记录，不能擅自宣称前置已DONE。G6-02 B结论明确只接受首版。本轮的运行、截图、问题和讲稿将作为其最终审计输入。

来源：

- [evidence/g6/G6-02/delivery-index.json](../../../evidence/g6/G6-02/delivery-index.json)
- [evidence/g6/G6-02/b-review.json](../../../evidence/g6/G6-02/b-review.json)
- [tasks.md](../../../tasks.md)
- [evidence/g6/G6-01/command-execution-ledger.md](../../../evidence/g6/G6-01/command-execution-ledger.md)

## 第7页 模拟试演输入

上述场景、标题、任务、角色都是本轮按用户授权生成的模拟输入，不是仓库事实源中的真实事故或真实人员。实际时间来自机器运行，数据发生时间也是生成输入的一部分。操作使用生产构建的前端、当前后端HTTP和真实浏览器，保留原始请求响应和审计。health为200；没有数据库的ready明确503，不能称数据库就绪或生产部署通过。

来源：

- [evidence/g6/G6-03/simulated-dataset.json](../../../evidence/g6/G6-03/simulated-dataset.json)
- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)
- [control/overrides.md#OVR-039](../../../control/overrides.md#OVR-039)

## 第8页 事件核实与预案启动

切换到Web事件页面，先展示底部模拟标识。本轮事件由实际页面表单提交，核实和启动通过实际HTTP执行。服务端生成任务并返回RESPONDING，当前页面重新加载显示相同状态。这里核实的人物和灾情都是模拟输入，自动任务消息回执也是明确模拟端口返回，不代表短信或甲方APP已送达。截图来自本轮成功闭环的同一runId。

来源：

- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)
- [evidence/g6/G6-03/simulated-dataset.json](../../../evidence/g6/G6-03/simulated-dataset.json)
- [scripts/g6/run-g6-03-rehearsal.mjs](../../../scripts/g6/run-g6-03-rehearsal.mjs)

## 第9页 H5接收与反馈

H5接收和反馈按钮在实际浏览器中执行。旧候选后端反馈保存60，页面显示0，原因是映射漏读反馈数组。本轮登记Issue后仅修正映射，并用回归断言保护显式零值；完整quality及Web/H5正常异常路径重跑。最新截图和原始响应均显示60，任务为IN_PROGRESS。旧FAIL与带问题试演保留，问题状态为整改复验完成、待B技术确认和C整体复核，不能由整改者代签关闭。

来源：

- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)
- [evidence/g6/G6-03/quality-gate.log](../../../evidence/g6/G6-03/quality-gate.log)
- [frontend/src/features/response/workflow.ts](../../../frontend/src/features/response/workflow.ts)
- [backend/src/event-workflow.mjs](../../../backend/src/event-workflow.mjs)
- [control/issues.md#ISSUE-G6-03-001](../../../control/issues.md#ISSUE-G6-03-001)

## 第10页 并发版本冲突

异常分支通过真实状态变化制造：页面仍持有旧版本，另一终端已经接收同一任务。随后点击旧页面接收按钮，服务器实际返回409，页面显示冲突信息与traceId。另有事件启动旧版本请求同样返回409。这是模拟业务输入下的真实异常运行，不是手工画出的错误截图。故障处置为刷新核对版本，不重复盲提交；门禁等物理控制不纳入这次异常验证。

来源：

- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)
- [scripts/g6/run-g6-03-rehearsal.mjs](../../../scripts/g6/run-g6-03-rehearsal.mjs)
- [docs/work/B_TECH/g6_user_manual.md#7](../../../docs/work/B_TECH/g6_user_manual.md#7)

## 第11页 角色权限拒绝

权限验证分两层：只读模拟角色对事件写入API发起实际请求，后端返回403，拒绝前后的事件数量没有增加；只读角色打开缺少plan:read权限的页面，路由守卫转到无访问权限页面。原始审计含denied。注入模拟Bearer只为本地试演，未使用开发身份头绕过生产约束，不构成甲方真实统一身份平台验收。A负责叙事、B负责技术边界、C负责数字与证据复核。

来源：

- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)
- [backend/src/identity.mjs](../../../backend/src/identity.mjs)
- [frontend/src/router/index.ts](../../../frontend/src/router/index.ts)
- [docs/work/B_TECH/g6_user_manual.md#3](../../../docs/work/B_TECH/g6_user_manual.md#3)

## 第12页 处置闭环与运行结果

当前后端实际完成两条任务，关闭事件并在Web页面显示CLOSED。本轮自动化运行耗时3.983秒，来自机器计时，不是人的现场讲述时长，也不能说明性能SLA。整改后本轮结果为PASS，H5显示和其他路径实际断言见原始记录。此前记录器404和进度问题失败均保留，没有隐藏或把整个过程写成一次成功。PASS仅描述本轮模拟试演自检，不能替代C整体复核或真实项目验收。

来源：

- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)
- [evidence/g6/G6-03/raw/](../../../evidence/g6/G6-03/raw/)
- [control/issues.md#ISSUE-G6-03-001](../../../control/issues.md#ISSUE-G6-03-001)

## 第13页 遗留问题与验收边界

H5进度显示问题属于本轮新增技术输入。G5的30条AC实现延期、其余76条AC证据延期继续保留，六类甲方系统真实联调0/6、真实非乙方部署操作者0也未改变。AI代码占比、首审打回率、Prompt复用次数和返工工时尚无可靠归因样本，账本为UNKNOWN，不写零或虚构比例。现场意见和实际签署尚未发生，材料只能作为候选。

来源：

- [control/issues.md](../../../control/issues.md)
- [evidence/g6/G6-02/gaps-deferrals.md](../../../evidence/g6/G6-02/gaps-deferrals.md)
- [evidence/g6/G6-02/metrics-ledger.md](../../../evidence/g6/G6-02/metrics-ledger.md)
- [evidence/g6/G6-03/rehearsal-result.json](../../../evidence/g6/G6-03/rehearsal-result.json)

## 第14页 质询分工与故障预案

现场执行前核对版本、前端构建、模拟标识和权限。服务不可用时停止写操作，记录真实失败，不临场升级或改代码；改用本轮已归档截图和原始记录，明确是备用证据而非现场成功。若出现409，刷新并核对版本；403检查权限，不能借用他人账号。消息失败转人工确认，物理门禁控制禁止自动重放。C整体Review、G6-01 A复核和G6-02最终增量审计仍待闭环。真实现场的质询、计时和意见仅在实际发生后追加记录。

来源：

- [docs/work/G6/g6_03_demo_and_qna.md](../../../docs/work/G6/g6_03_demo_and_qna.md)
- [docs/work/B_TECH/g6_user_manual.md](../../../docs/work/B_TECH/g6_user_manual.md)
- [docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md](../../../docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md)
- [tasks.md](../../../tasks.md)

