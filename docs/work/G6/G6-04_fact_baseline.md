# G6-04 事实基线

主责A；V0.1；输入master `3b47e8f97caac1fa6dc989fd1ff5279bd1eb5450`；发布应用版本 `75f01c3bb33369d3785acf69a3a00eb983aa188b`。G6-01/02/03既有结论只引用。

## 1 项目阶段基线

| 阶段 | 目标 | 主要产物 | 冻结/接受状态 | 来源 |
| --- | --- | --- | --- | --- |
| G1 | 立项竞标、范围与责任明确 | 建议书、投标、计划、风险、确认书 | BASELINE-V1.0事实冻结；V1.2呈现文件自身仍PENDING_C_REVIEW，tasks历史G1-15 DONE照录，不重新裁决 | control/baselines/BASELINE-V1.0.md |
| G2 | 需求规格与原型走查 | SRS、spec、RTM、澄清、原型走查及返工复审 | BASELINE-G2-M2-R1.0 FROZEN / VERIFIED_BY_B_AND_C；原型不充当正式实现 | control/baselines/BASELINE-G2-M2-R1.0.md |
| G3 | 设计与工程计划 | 四设计、OpenAPI、ADR/NFR、测试与管理计划 | BASELINE-G3-M3-R1.0 FROZEN；唯一受控研发设计输入 | control/baselines/BASELINE-G3-M3-R1.0.md |
| G4 | 两Sprint研发及工程护栏 | 前后端、数据库、模拟适配、测试、PR、RTM v4、Prompt模式与翻车记录 | G4-00—11在tasks均DONE；保留030—039 backlog与SIMULATED边界 | control/g4_final_sprint_state.md |
| G5 | 测试、质量特性与课前三审 | 原始执行包、RTM v5、正式测试/审计报告 | COURSE_CONDITIONAL_ACCEPTANCE；真实IMPLEMENTATION_AND_REAL_WORLD_DEFERRED | logs/reviews/2026-10-11_G5-03-C-final-review.md |
| G6 | 交付、手册、答辩、复盘与移交 | 两手册、唯一审计索引、答辩、总结及债务/归档 | G6-01/02/03 DONE；G6-04本轮执行，尚待C/B；不形成真实验收 | logs/reviews/2026-10-12_G6-03-C-rereview.md |

## 2 计划基线

项目计划v1 §2.3的WBS1.1—6.x使用合同相对周W1—W20，合同起算日未知；KN046—050的合同M1—M5与课程M2/M3/G1—G6不能互换。G3 plan.md原子任务≤0.5人日是计划上限，不是实际工时。G6计划D18是课程第18工作日，公历日期未知。以下完整任务表为启动Git快照引用，各任务计划时间继承所属计划；未明确时间写未知。

| 任务 | 主责/复核 | 计划时间/依据 | 输入状态 |
| --- | --- | --- | --- |
| G1-01-A | A/C（技术边界由 B 提供意见） | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-01-A-BR | A/C（技术边界由 B 提供意见） | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-00 | C/B | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-01 | C/B | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-02 | A/B、C（A/B/C 三人确认冻结） | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-03 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-04 | B/A | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-05 | C/B | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-06 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-07 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-08 | A/C、B | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-09 | C/B | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-10 | A/B（技术确认/复核） | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-11 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-12 | A/B（技术口径）、C（合规/数字） | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-13 | A/B（技术与范围）、C（FR/★/PE、数字与边界） | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-14 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-15 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | DONE |
| G1-16-FMT-040506 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | REVIEW |
| G1-17-FMT-VISUAL-040506 | A/C | D1—D4建议，实际日历未知；项目计划v1为合同周 | REVIEW |
| G2-00 | C/B | 依tasks前置；具体日历计划未知 | DONE |
| G2-01 | C（用户授权）/B | 依tasks前置；具体日历计划未知 | DONE |
| G2-02 | C/B | 依tasks前置；具体日历计划未知 | DONE |
| G2-03 | A/C | 依tasks前置；具体日历计划未知 | DONE |
| G2-04 | B/A | 依tasks前置；具体日历计划未知 | DONE |
| G2-05 | C/B | 依tasks前置；具体日历计划未知 | DONE |
| G2-06 | C/B | 依tasks前置；具体日历计划未知 | DONE |
| G2-07 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-P01 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-P02 | B/A | 依tasks前置；具体日历计划未知 | DONE |
| G2-P03 | B/A、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-P04 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-P05 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-R01 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-R02 | C/B、A | 依tasks前置；具体日历计划未知 | DONE |
| G2-R03 | A/C、B | 依tasks前置；具体日历计划未知 | DONE |
| G2-R04 | A/C | 依tasks前置；具体日历计划未知 | DONE |
| G2-R05 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G2-R06 | A/B、C | 依tasks前置；具体日历计划未知 | DONE |
| G3-01R | B/A、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-00 | A/B、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-01 | B/A、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-02 | A/B、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-03 | A/C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-04 | B/A、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-05 | B/A、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-06 | B/A、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-07 | B/A、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-08 | C/A、B | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-09 | C/A（本轮按 OVR-025 单人复核） | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-10 | A/B、C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-11 | A/C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-12 | C/B | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-13 | A/C | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G3-14 | A/B | plan.md D0—D3/M3依赖；具体日历计划未知 | DONE |
| G4-00 | A/C | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-01 | C/B | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-02 | B/A | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-03 | A（@WhiteApricot）/C（@rjq010504） | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-04 | C/B | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-05 | B/A | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-06 | A/C | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-07 | C/B | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-08 | B/A | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-09 | A/C | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-10 | C/B | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-11 | A/C | tasks Sprint1/2及G4-00计划；日历未知 | DONE |
| G4-ACCEPTANCE-PPT-01 | A/C | tasks Sprint1/2及G4-00计划；日历未知 | DONE（OVR-030 直推历史保留；2026-10-08 C 独立复核 PASS） |
| G5-00 | A（何思源 / @WhiteApricot）/A启动自检关闭；C后续抽查不冒充已完成 | g5_quality_gate_plan.md阶段门禁；具体日历未知 | DONE |
| G5-01 | C/A | g5_quality_gate_plan.md阶段门禁；具体日历未知 | DONE（COURSE_CONDITIONAL_ACCEPTANCE / IMPLEMENTATION_AND_REAL_WORLD_DEFERRED；A Review 2026-10-11 ACCEPTED，OVR-035；真实AC 11/59/47、★FR 1/33保持不变） |
| G5-02 | B/C | g5_quality_gate_plan.md阶段门禁；具体日历未知 | DONE（COURSE_CONDITIONAL_ACCEPTANCE / REAL_WORLD_DEFERRED；C 于 2026-10-10 接受 OVR-034 课程条件验收；真实甲方系统 0/6、真实非乙方操作者 0，后续补测） |
| G5-03 | A/C最终复核 | g5_quality_gate_plan.md阶段门禁；具体日历未知 | DONE（COURSE_CONDITIONAL_ACCEPTANCE / IMPLEMENTATION_AND_REAL_WORLD_DEFERRED；C final review 2026-10-11 ACCEPTED；真实AC 11/59/47、★FR 1/33、甲方系统0/6、真实非乙方操作者0保持不变） |
| G6-00 | A/B提供技术边界；C复核 | g6_delivery_acceptance_plan.md D18门禁；公历未知 | DONE（2026-10-11 C 定向修正并复验 ACCEPTED） |
| G6-01 | B/A提供用户场景并整体复核；C提供需求/验收编号 | g6_delivery_acceptance_plan.md D18门禁；公历未知 | DONE（2026-10-12 A 整改复验 PASS；ISSUE-G6-01-001—004 在 G6-01 范围关闭，005 小错已同步工作稿/DOCX/PDF；V0.2 锁定 `75f01c3`，26条原始命令记录核验及本地 quality 通过；MANUALS_AND_LOCAL_DELIVERY_REVIEW_ACCEPTED；真实 KN-065/甲方六类接口保持 REAL_WORLD_DEFERRED；G6-03 C整体复核另行待办；见 docs/work/G6/G6-01_A_rereview.md） |
| G6-02 | C/A提供计划/交付目录；B整体复核并提供技术证据 | g6_delivery_acceptance_plan.md D18门禁；公历未知 | DONE（2026-10-12 B最终整体再复验 ACCEPTED，A目录/计划/一致性复验 ACCEPTED；ISSUE-G6-02-002—005闭环，006状态小错已修正；29项20/9及GI三段21/18/11指纹、117 AC/39 FR/34★、11/59/47无漂移；197项A独立断言与专用校验PASS；AUDIT_PACKAGE_ACCEPTED / REAL_WORLD_DEFERRED；见 docs/work/G6/G6-02_A_rereview.md） |
| G6-03 | A/B技术与环境支持；C整体复核证据/数字/边界 | g6_delivery_acceptance_plan.md D18门禁；公历未知 | DONE（2026-10-12 C定向复验ACCEPTED；ISSUE-G6-03-001/002均关闭，A整改专项148/148及14页PPTX/PDF逐页视觉检查PASS；COURSE_SIMULATED_REHEARSAL_ACCEPTED / REAL_WORLD_DEFERRED；真实甲方接口、真实现场、KN-065、签署与现场意见继续延期；见logs/reviews/2026-10-12_G6-03-C-rereview.md） |
| G6-04 | A/B提供技术债务/决策；C整体复核及符合性；B另做最终技术确认 | g6_delivery_acceptance_plan.md D18门禁；公历未知 | TODO |

## 3 实际执行

Git日期为提交事件时间，作者不自动等于真实操作者，主责按tasks。完整Git历史见evidence/g6/G6-04/git-history.txt；任务启动快照见task-snapshot.md。下列commit均属于启动master历史。

- G1：实际产物 建议书、投标、计划、风险、确认书；责任按任务快照；来源 `control/baselines/BASELINE-V1.0.md`；该来源最近提交事件 `f8be033bb0a11124f825fb3dbcbb62933640fad5 2026-09-12T21:05:52+08:00 yylinb review(G1-14): freeze final baseline`；结论 BASELINE-V1.0事实冻结；V1.2呈现文件自身仍PENDING_C_REVIEW，tasks历史G1-15 DONE照录，不重新裁决。
- G2：实际产物 SRS、spec、RTM、澄清、原型走查及返工复审；责任按任务快照；来源 `control/baselines/BASELINE-G2-M2-R1.0.md`；该来源最近提交事件 `52887e5cf2ac177de22f63b8906bfb7913506b13 2026-09-16T22:42:50+08:00 RenJQ review(G2-R06): approve M2 refreeze`；结论 BASELINE-G2-M2-R1.0 FROZEN / VERIFIED_BY_B_AND_C；原型不充当正式实现。
- G3：实际产物 四设计、OpenAPI、ADR/NFR、测试与管理计划；责任按任务快照；来源 `control/baselines/BASELINE-G3-M3-R1.0.md`；该来源最近提交事件 `013f3e5d933314dc78f35f2012deaa2eedb0aa2e 2026-09-21T15:28:10+08:00 WhiteApricot docs(g3): close m3 review and freeze engineering baseline`；结论 BASELINE-G3-M3-R1.0 FROZEN；唯一受控研发设计输入。
- G4：实际产物 前后端、数据库、模拟适配、测试、PR、RTM v4、Prompt模式与翻车记录；责任按任务快照；来源 `control/g4_final_sprint_state.md`；该来源最近提交事件 `aa97fe2c6d4fa9b37a85312c6c6c2a3a7f4ddca0 2026-10-08T18:44:45+08:00 WhiteApricot docs(G4): close merged sprint state`；结论 G4-00—11在tasks均DONE；保留030—039 backlog与SIMULATED边界。
- G5：实际产物 原始执行包、RTM v5、正式测试/审计报告；责任按任务快照；来源 `logs/reviews/2026-10-11_G5-03-C-final-review.md`；该来源最近提交事件 `474c91f396cc4c618cb747fa662074656483fae2 2026-10-11T12:32:31+08:00 RenJQ review(G5-03): accept course conditional closeout`；结论 COURSE_CONDITIONAL_ACCEPTANCE；真实IMPLEMENTATION_AND_REAL_WORLD_DEFERRED。
- G6：实际产物 两手册、唯一审计索引、答辩、总结及债务/归档；责任按任务快照；来源 `logs/reviews/2026-10-12_G6-03-C-rereview.md`；该来源最近提交事件 `5ac78366ddb2ded9f839ffdae57077ee6d7c5a48 2026-10-12T23:26:33+08:00 yylinb review(G6-03): accept A remediation and close task`；结论 G6-01/02/03 DONE；G6-04本轮执行，尚待C/B；不形成真实验收。

G6-01主责B，A复验2026-10-12/e223f6d；G6-02主责C，B整体6fad770及A一致性cbc5dfb；G6-03主责A，C最终2026-10-12/5ac7836，回填3b47e8f。实际Review内容分别见G6-01_A_rereview、G6-02_A_rereview及G6-03-C-rereview。Prompt逐文件/行号见ai-log-census.json，真实人时未知。

## 4 偏差列表

### DEV-01

- 计划：项目计划v1 WBS3.7/3.8：W5/W6真实视频、消息连通并纳入M2；P1全部接口责任不删
- 实际：六类甲方系统真实联调0/6；已接受课程模拟链路
- 依据：docs/work/A_PM/project_plan_v1.md §2.3；G6-02 metrics-ledger、gaps-deferrals GAP007；OVR-039
- 原因：真实账号、合法数据、网络及窗口没有就绪记录；G6-03另有模拟授权，模拟不能提供真实回执
- 影响：KN-006/007/008/009/010/060/064真实验收证据缺失，课程接受不能关闭
- 改进措施：A在下一次联调前取得甲方资源清单，B按八端口与六类资源逐项实跑，C检查同traceId证据后关闭

### DEV-02

- 计划：P1全39FR功能覆盖/验收用例全部通过；G4执行范围优先001—029，030—039保留backlog
- 实际：117AC为11 PASS/59 NOT_RUN/47 BLOCKED；30AC实现延期、76AC缺完整证据
- 依据：tasks G4范围；G6-02 metrics-ledger/gaps005—006；G5-01 functional-gate-raw.json
- 原因：已登记backlog未获后续实现授权；其余AC未取得完整逐AC断言或所需环境，套件通过未覆盖全部AC
- 影响：KN-031/032不满足真实全量验收；不得把RTM链路存在视作PASS
- 改进措施：B/A按原FR实施获授权backlog，C冻结逐AC证据清单，先解决59未测与17非backlog阻断后重评

### DEV-03

- 计划：G6-01 DoD每命令有实际输出、部署回退完整、发布版本一致
- 实际：首轮A NEED_FIX，B整改V0.2后A接受；26条本地隔离步骤可核验
- 依据：docs/work/G6/G6-01_A_review.md、G6-01_B_remediation.md、G6-01_A_rereview.md；commit6255f94/e223f6d
- 原因：首版关闭入口、命令证据、完整交付部署回退、版本映射分别命中ISSUE-G6-01-001—004；HTTP测试介质另有005小错
- 影响：增加整改与复验次数；返工工时未知；真实KN-065仍未满足
- 改进措施：正式手册前锁release commit，实跑命令台账与环境指纹先验收，区分内存HTTP和PostgreSQL证据

### DEV-04

- 计划：G6-02最终审计挂接已接受手册、试演、版本hash和Review
- 实际：首版/后续增量经过B/A复验接受，保留29与21/18/11各快照
- 依据：G6-02_A_review.md、G6-02_A_rereview.md；commit6fad770/cbc5dfb；G6-02 delivery-index.json
- 原因：后续手册与接受记录未完整进入首版，旧状态表达滞后；ISSUE-G6-02-002—006记录修复
- 影响：首版可用20/9不能充当最终齐套指标；重复相加会引入分母漂移
- 改进措施：C以同一索引日期化增量，A只引用账本；发布材料逐项挂当前接受记录而非候选快照

### DEV-05

- 计划：G6-03引用当前手册/审计接受和实际发布版本；C整体复核
- 实际：C要求状态/来源整改后定向接受课程试演，真实现场与意见仍延期
- 依据：logs/reviews/2026-10-12_G6-03-C-review.md、2026-10-12_G6-03-C-rereview.md；commitb03de12/5ac7836
- 原因：G6-01/02已完成时，答辩页脚、讲稿和移交仍保留旧候选状态；ISSUE-G6-03-002
- 影响：下游材料不能直接从旧摘要继承当前结论；未取得真实现场意见不得填验收通过
- 改进措施：A发布前核对tasks+最新Review+页脚来源三处，版本变更只复验受影响链，现场记录独立增量

### DEV-06

- 计划：G6-04使用AI代码占比、打回率、复用次数、返工成本驱动复盘
- 实际：G6-02四项均UNKNOWN；可统计留档Prompt块与Review文件，不能折算工时或代码比例
- 依据：G6-02 metrics-ledger AI四行；本轮ai-log-census.json
- 原因：尚无可靠代码归因样本、冻结唯一首审事件集合、模式ID真实调用明细和实际返工工时账
- 影响：无法证明AI节省时间或净收益；日志文件数不等于Review事件次数
- 改进措施：下一轮由C锁统计范围，A记录任务工时，B提供行级归因，Prompt调用明确模式ID后才核算

### DEV-07

- 计划：投标W1—W20及M1—M5合同里程碑；课程D18与G1—G6执行节点分轨
- 实际：Git/Review有2026-09至10月实际提交记录；合同起算日及D18公历未确认
- 依据：project_plan_v1.md §1.3/§2.3；G6计划§4；key_numbers KN046—050；gaps014；git-history.txt
- 原因：合同生效和教师日程无可定位确认记录；不得用Git时间猜测合同周数或实际工时
- 影响：不能量化延期天数、SPI或人时偏差，日期差未知
- 改进措施：A获得正式起算/窗口记录后建立日历映射，提交时间只作证据时间，不当作持续工作时长

## 5 数据与结论锁定

G6-02指标账是总结唯一验收数字来源。39FR/34★/117AC、11/59/47、★1/33、1160本地样本失败0、首版29项20/9及三段21/18/11分别引用，不相加。真实甲方联调0/6与独立操作者0均为有证据的零；AI四项未知不写零。G6-04新增日志数量仅为启动快照留档计数附件，不改变C指标账。
