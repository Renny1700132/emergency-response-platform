# 详细设计说明书（工作稿）

- 任务：G3-05
- 文档编号：YJGL-G3-05
- 版本：V0.1（评审稿）
- 主责 / 复核：B / A、C
- 状态：SELF_CHECKED / REVIEW
- 项目：某自然博物馆智能运营中心建设项目——应急管理子系统
- 受控输入：`BASELINE-G2-M2-R1.0`、SRS、`spec.md`、RTM v1、G3-01R、G3-03、G3-04、`facts.md`、`key_numbers.md`、`issues.md`

## 1 引言

### 1.1 编写目的

本文把已准出的概要设计和数据库设计细化为可进入接口设计与编码的逻辑组件、职责、协作流程、状态迁移、事务边界、异常分支和验证入口。类名与方法名是技术无关的设计标识，用于统一实现语义；具体编程语言、物理包路径、框架注解和 OpenAPI 签名由 ADR 与 G3-06 固化。

### 1.2 范围和效力边界

设计覆盖 Web、大屏和嵌入既有智慧管理 APP 的 H5 渠道，以及预案、事件、任务、态势、资源、值班、演练、知识、集成和平台横切能力。统一中台继续提供身份、组织、权限、消息、工作流、文件、门户和数据汇聚；录像、定位、门禁、消防、信息发布、入侵与 IoT 均通过既有系统适配。本文不重复建设这些通用能力。

`ISSUE-G3-01-001` 保持 OPEN：视频与统一消息的真实字段、认证方式、回执语义和性能证据尚待甲方资料及现场联调。本文只定义内部端口、归一化对象与失败语义，不宣称接口已连通或指标已实测通过。

### 1.3 设计约定

领域对象拥有状态和业务不变量；应用服务编排用例；仓储负责本领域持久化；端口隔离外部系统；适配器实现协议转换。一次业务提交只跨越一个领域写事务。通知、外部调用与态势投影由 Outbox 事件派生；控制类指令只允许授权人员确认后单次下发，失败后进入人工处置，禁止自动重放。

## 2 程序系统结构

### 2.1 逻辑分层和依赖方向

[[FIGURE:component_structure]]

| 层 | 组件 | 允许依赖 | 禁止事项 |
| --- | --- | --- | --- |
| 渠道层 | Web、大屏、H5 | 应用门面、查询端口 | 直接访问数据库或外部系统 |
| 应用层 | 用例服务、命令/查询对象、事务协调器 | 领域层、端口接口 | 内嵌厂商协议和凭据 |
| 领域层 | 聚合、实体、值对象、策略、状态机 | 领域内部抽象 | 依赖 UI、数据库驱动或 HTTP 客户端 |
| 基础设施层 | 仓储、Outbox、缓存、适配器、审计 | 领域/应用定义的端口 | 绕过授权或修改他域事实 |
| 投影层 | 态势、统计、看板读模型 | 领域事件、只读查询 | 反向修改领域事实 |

### 2.2 模块责任和单一写入主责

| 模块 | 主责对象 | 关键应用服务 | 不承担的职责 |
| --- | --- | --- | --- |
| MOD-PLAN | 预案、版本、流程、核实配置、任务模板 | PlanApplicationService | 事件处置事实、人员主数据 |
| MOD-EVENT | 事件、核实、续报、关闭 | IncidentApplicationService | 消息实际发送、视频存储 |
| MOD-TASK | 处置任务、指派历史、反馈 | TaskApplicationService | 组织主数据维护 |
| MOD-SITUATION | 态势和统计投影 | SituationProjectionService | 领域事实写入 |
| MOD-RESOURCE | 人员业务引用、定位快照、物资和盘点 | ResourceApplicationService、InventoryApplicationService | 定位源数据生产 |
| MOD-DUTY | 值班、点位、规则、打卡、缺卡告警 | DutyApplicationService | 原生 APP 发布 |
| MOD-DRILL | 演练、评估、整改、补演 | DrillApplicationService | 通用工作流平台建设 |
| MOD-KNOWLEDGE | 知识条目和文件引用 | KnowledgeApplicationService | 文件二进制存储 |
| MOD-MOBILE | H5 用例组合和离线提示 | MobileFacade | 原生 Android/iOS 客户端 |
| MOD-INTEGRATION | 外部端口、协议适配、调用记录 | IntegrationCoordinator | 外部系统业务规则 |
| MOD-PLATFORM | 鉴权上下文、幂等、审计、Outbox、可观测 | RequestContext、OutboxDispatcher | 领域状态决定 |

### 2.3 公共调用规则

每个命令携带 `requestId`、`traceId`、操作者、组织和数据权限上下文。应用服务依次执行授权、输入校验、幂等检查、聚合加载、业务校验、状态迁移、事务提交和审计记录。查询必须按数据权限过滤。对外错误使用稳定错误码和可读提示，日志不得保存明文凭据、完整短信正文或未脱敏敏感字段。

## 3 公共组件详细设计

### 3.1 请求上下文与授权策略

| 设计元素 | 职责 | 输入 / 输出 | 失败处理 | 验证入口 |
| --- | --- | --- | --- | --- |
| RequestContextFactory | 从中台令牌建立用户、组织、角色、数据域和 traceId | 令牌、请求头 / RequestContext | 令牌无效返回 AUTH-401，不进入领域事务 | 伪造、过期、缺失令牌测试 |
| AuthorizationPolicy | 校验功能权限、数据范围和敏感操作二次确认 | Context、action、resource / Permit | 拒绝写审计并返回 AUTH-403 | 越权读写、跨组织测试 |
| InputValidator | 校验必填、枚举、长度、时间、坐标和附件引用 | Command / ValidationResult | 聚合所有字段错误，不产生部分写入 | 边界值、非法枚举测试 |

### 3.2 幂等、事务与 Outbox

`IdempotencyGuard.begin(scope,key,requestHash)` 创建处理中记录；同键同摘要返回既有结果，同键异摘要拒绝。应用事务同时写领域事实、状态历史、审计摘要和 `outbox_event`。`OutboxDispatcher` 按事件类型路由，采用租约避免并发重复消费；失败按受控次数退避并保留最后错误。控制指令使用独立一次性令牌，发送超时不得由通用重试器自动重发。

| 组件 | 核心方法 | 事务边界 | 异常与补偿 |
| --- | --- | --- | --- |
| UnitOfWork | begin、commit、rollback | 单领域一次命令 | 提交失败整体回滚；外部调用不置于长事务中 |
| IdempotencyGuard | begin、complete、fail | 与业务提交关联 | 处理中超时由运维核对，不直接重复执行业务 |
| OutboxPublisher | append | 与领域事实同事务 | 写入失败则业务事务回滚 |
| OutboxDispatcher | claim、dispatch、reschedule | 每条事件短事务 | 普通通知有限重试；控制事件转人工 |
| AuditRecorder | recordDecision、recordAccess | 与敏感业务同步或可靠异步 | 审计不可用时敏感写操作失败关闭 |

### 3.3 四类时间和迟到数据

所有跨系统事实区分业务发生时间、源系统产生时间、本系统接收时间和处理完成时间。排序首先使用业务语义规定的时间，再以接收时间和序列号稳定排序。迟到回执追加到原投递记录；已完成业务不得因迟到回执重复迁移。位置数据按源时间判断新鲜度，过期定位仅显示最后已知位置及明显过期标识，不参与自动调派。

## 4 预案与事件详细设计

### 4.1 预案聚合

`PlanAggregate` 管理预案基本信息和版本集合；`PlanVersion` 聚合流程节点、适用条件、核实配置和任务模板。草稿可编辑，发布时执行结构、依赖环、责任角色、时限和启停对象校验；已发布版本不可原位修改。`PlanRepository` 按预案标识与版本号加载，`PlanPublishPolicy` 形成不可变发布快照。

| 类 / 组件 | 责任 | 关键操作 | 不变量 |
| --- | --- | --- | --- |
| PlanAggregate | 管理类型、名称、有效状态和版本 | createDraft、revise、disable | 停用不破坏历史引用 |
| PlanVersion | 保存发布快照 | addNode、addTemplate、publish | 发布后不可原位修改 |
| FlowGraphValidator | 校验节点和依赖 | validate | 节点唯一、无环、入口/结束可达 |
| VerificationConfig | 定义核实环节和升级策略 | resolveAssignee、deadlineAt | 超时只能升级，不自动启动预案 |

### 4.2 事件聚合和状态机

[[FIGURE:incident_flow]]

`IncidentAggregate` 是事件事实唯一写入入口。状态允许 `REPORTED → PENDING_VERIFICATION → VERIFIED/REJECTED`；核实超时进入 `VERIFICATION_TIMEOUT` 并产生升级任务，人工核实后仍可进入 `VERIFIED`。只有 `VERIFIED` 事件可执行 `startResponse(planVersionId)`，随后进入 `RESPONSE_ACTIVE → CLOSING → CLOSED`。授权重开从 `CLOSED` 进入 `RESPONSE_ACTIVE` 并追加重开原因，历史关闭记录不删除。

外部告警先由 `ExternalAlertDeduplicator` 以可靠外部告警标识去重，再映射为事件候选。未知或不完整载荷进入隔离队列并告警，禁止生成内容错误的事件。相同可靠标识重复到达只返回已有事件关联。

### 4.3 秒级预案启动流程

1. `IncidentApplicationService.startResponse` 校验事件已核实、操作者权限和有效预案版本。
2. `PlanSnapshotLoader` 读取发布快照，`TaskFactory` 按模板生成任务并校验依赖关系。
3. 单事务写入事件状态、任务、指派历史、Outbox 和审计；任一步失败整体回滚。
4. 提交后异步派生消息和态势投影；外部消息失败不回滚已成立的事件与任务事实。
5. 记录从接收命令到事务提交的服务端耗时，目标环境验证启动响应不超过 3 秒；本稿不宣称已实测通过。

### 4.4 续报、关闭和附件

续报采用追加模型并保留四类时间。关闭前由 `ClosurePolicy` 检查必需任务、调查材料和未关闭风险；文件只保存统一中台的受控引用。逻辑删除附件引用后仍保留审计和历史版本关系，普通查询不返回已删除引用，具备审计权限的追溯查询可查看删除事实。

## 5 任务处置与态势投影详细设计

### 5.1 任务聚合和状态迁移

`ResponseTaskAggregate` 状态为 `CREATED → DISPATCH_PENDING → DISPATCHED → ACKNOWLEDGED → IN_PROGRESS → COMPLETED`，可从未完成状态进入 `CANCELLED`；消息失败标记投递状态，不直接把任务改为失败。完成操作必须提交结果、时间和操作者；要求附件的任务需通过附件引用完整性校验。

重指派调用 `reassign(newAssignee,reason,keepDeadline)`，追加 `task_assignment_history`，保留原责任人、原截止时间和原因。默认保持原期限；只有具有改期权限且显式给出新期限时才修改。催办只产生通知事件和审计，不改变任务业务状态。

### 5.2 可靠消息协作

[[FIGURE:task_message_flow]]

`MessageDispatchPolicy` 将业务通知解析为收件人、模板和通道请求；`MessagePort` 屏蔽既有统一消息平台。`message_delivery` 保存每次尝试、回执、状态和错误。普通通知可有限重试；重复或迟到回执通过平台消息标识与幂等键关联，已终态投递不得再次触发任务迁移。正常验收通道内验证并发不少于 20 路、到达率不低于 99%，证据由 G3-06 后续联调与测试阶段形成。

### 5.3 态势投影

`SituationProjectionService` 订阅事件、任务、位置、物资和外部告警事件，按投影版本幂等更新。投影可删除后由事实重建；地图和看板读取投影，不回写领域事实。汇总与钻取使用同一过滤条件和口径版本，避免统计与明细不一致。投影延迟、失败数和重建进度均进入可观测指标。

## 6 人员定位、物资与盘点详细设计

### 6.1 人员引用和定位新鲜度

`PersonRef` 只保存统一中台人员外部标识、必要业务快照和有效状态。`PositionIngestService` 保存坐标、楼层、坐标参考、源精度与四类时间，不降低源精度。`PositionFreshnessPolicy` 根据配置判断新鲜、临界和过期；刷新目标不超过 2 秒须在甲方提供的亚米级源环境实测。过期或楼层映射失败时停止自动建议调派并提示人工核对。

### 6.2 物资台账

`MaterialLedgerService` 负责站点、物资、数量、批次、有效期和版本控制。数量使用精确类型；更新携带版本号防止并发覆盖。站点空间标识、坐标参考和楼层映射必须同时有效，非法映射不得发布到地图投影。

### 6.3 盘点快照与差异复核

[[FIGURE:inventory_attendance_flow]]

`InventoryApplicationService.publishPlan` 在同一事务中冻结计划范围并生成账面快照。实盘记录只追加，期间出入库独立记录。`InventoryDifferenceCalculator` 基于发布快照、期间变动和实盘数量生成差异；授权复核人确认后，`InventoryAdjustmentService` 才以新流水更新台账。取消计划不得删除已采集记录，需标记取消原因并保留审计。

## 7 值班、点位与移动打卡详细设计

### 7.1 排班和规则发布

`DutyScheduleAggregate` 管理小组、人员、时段、点位和代执行关系。发布前校验人员有效性、时间冲突、点位状态和规则完整性。调整以新版本保存前后值；已发生的打卡继续引用当时规则版本。

### 7.2 二维码打卡

`AttendanceApplicationService.checkIn` 依次校验身份、二维码签名与版本、有效时段、点位范围、定位新鲜度和幂等键。成功后写打卡事实与审计；相同用户、规则窗口和幂等键重复扫码返回首次结果。超时、越界、二维码过期或位置过期均明确拒绝并给出可操作提示。写入不超过 1 秒为目标环境待测指标。

### 7.3 缺卡告警

`AttendanceDeadlineScanner` 按规则版本扫描到期且无有效记录的对象，生成唯一缺卡告警和消息 Outbox。扫描任务可重复执行但不得生成重复告警。消息失败保留告警事实，并在界面提供人工通知与处理登记入口。

## 8 演练评估与知识详细设计

### 8.1 演练计划和执行

`DrillPlanAggregate` 管理频次、范围、责任人和计划状态；到期调度形成执行任务。取消需说明原因，补演通过 `sourceExecutionId` 或 `sourcePlanId` 关联原记录。统计仅把实际完成的执行计入完成率，取消与逾期分别呈现。

### 8.2 评估、整改和补演闭环

`EvaluationTemplateVersion` 发布后不可原位修改。评估保存确定模板版本、条目得分和结论；不合格项生成 `ImprovementAction`，保留责任人、期限、证据和关闭审核。关闭整改不删除逾期事实；要求补演时创建关联执行，原整改与原演练仍可追溯。

### 8.3 知识条目

`KnowledgeItemAggregate` 管理分类、关键字、可见范围、发布状态和文件引用。检索服务先应用数据权限，再按分类和关键字查询；未发布、已停用或无权限条目不得返回。知识沉淀只能引用已关闭事件或已完成演练的受控材料。

## 9 H5 渠道与集成适配详细设计

### 9.1 H5 用例组合

H5 嵌入既有智慧管理 APP，复用统一认证上下文，提供事件上报、拍照引用、我的任务、任务反馈、演练执行、扫码打卡和移动盘点。`MobileFacade` 仅组合应用用例，不复制领域规则。网络中断时保留未提交草稿和失败原因；涉及状态变更的离线请求恢复后仍须重新鉴权、校验幂等和业务前置条件。

### 9.2 外部端口与适配器

| 端口 | 适配器责任 | 归一化输入 / 输出 | 降级与审计 |
| --- | --- | --- | --- |
| EXT-VIDEO | 实时预览、历史回放和结果记录 | VideoQuery / VideoReference | 不保存录像；超时提示人工使用既有系统 |
| EXT-MESSAGE | 并发发送、重试、回执关联 | MessageRequest / DeliveryReceipt | 普通通知有限重试；完整留痕 |
| EXT-ACCESS | 授权确认后下发门禁开启 | ControlCommand / CommandResult | 服从联锁；失败告警并人工降级；禁止自动重放 |
| EXT-PUBLISH | 信息发布状态与业务跳转 | PublishCommand / PublishStatus | 失败保留草稿和人工发布入口 |
| EXT-INTRUSION | 入侵告警接入、去重、转事件 | ExternalAlert / IncidentCandidate | 未知载荷隔离，不生成错误事件 |
| EXT-FIRE | 消防告警接入和状态关联 | ExternalAlert / IncidentCandidate | 断连告警，补传按外部 ID 去重 |
| EXT-IOT | 设备状态、告警和时间归一化 | DeviceEvent / NormalizedEvent | 过期数据标识，不覆盖较新事实 |
| EXT-MIDDLE | 身份、组织、权限、文件、工作流 | PlatformRequest / PlatformResult | 不复制建设通用能力；不可用时按用例失败关闭 |

### 9.3 控制指令状态机

`ControlCommand` 状态为 `CREATED → AUTHORIZED → SENT → ACKNOWLEDGED`，可进入 `REJECTED`、`TIMEOUT` 或 `MANUAL_HANDOFF`。授权记录、指令摘要、联锁结果和操作者必须留痕。超时只允许查询状态或人工确认后创建新命令，旧命令不得由重试器自动发送。

## 10 关键协作流程与异常设计

### 10.1 事务与最终一致性

领域事实与 Outbox 同事务提交，外部发送在事务外执行。若投影或消息处理失败，事实状态保持，消费者从 Outbox 续处理。跨领域动作通过事件协作，不建立跨模块数据库事务。所有消费者以事件标识和处理器名称建立幂等记录。

### 10.2 异常分类

| 类别 | 示例 | 系统行为 | 人工动作 |
| --- | --- | --- | --- |
| 业务拒绝 | 未核实启动、非法状态、任务缺材料 | 不写事实，返回明确错误码 | 修正输入或完成前置步骤 |
| 授权拒绝 | 越权关闭、无权下发门禁 | 失败关闭并写安全审计 | 由授权人员执行 |
| 可重试外部失败 | 普通消息超时、投影处理失败 | 有限退避重试，保留尝试 | 超过阈值人工处理 |
| 不可自动重试 | 门禁控制超时、结果不确定 | 转 MANUAL_HANDOFF | 核对现场后新建命令 |
| 数据质量 | 未知告警、非法楼层、过期位置 | 隔离或降级显示 | 补映射、校对来源 |
| 并发冲突 | 版本号变化、重复提交 | 返回冲突并提供最新版本 | 刷新后重新确认 |

### 10.3 可观测性和恢复

日志按 traceId、业务对象标识和外部调用标识关联；指标覆盖命令时延、Outbox 积压、消息到达、适配器错误、投影延迟、幂等冲突和人工降级数量。恢复后先恢复领域事实与 Outbox，再重建投影，最后恢复外部派生处理。RPO、RTO 和 MTTR 指标须由后续部署与恢复演练验证。

## 11 安全、性能与可测试性设计

### 11.1 安全控制

统一认证、最小权限、数据范围过滤、敏感操作二次确认、参数白名单、上传引用校验、输出编码、凭据外置、日志脱敏和审计防抵赖贯穿各用例。SCA、漏洞扫描和渗透测试由应用侧执行，高危漏洞清零后方可准出；正式第三方等保测评不默认属于乙方范围。

### 11.2 性能机制

预案发布快照和基础字典可短时缓存，但权限、事件状态和控制前置条件必须实时校验。列表采用分页与覆盖索引，地图采用视窗查询和分层加载，态势使用可重建投影。秒级指标通过服务端埋点、并发脚本和目标环境端到端测试证明，不以设计推断替代实测。

### 11.3 测试接缝

时间、标识生成、消息、视频、定位、中台和各外部端口均以接口注入，支持使用桩和故障模拟器验证超时、重复、乱序、迟到和断连。状态机使用表驱动用例覆盖合法与非法迁移；仓储使用事务集成测试验证并发、约束与回滚；端到端测试覆盖 Web/H5/大屏的相同业务口径。

## 12 需求与验收追踪

### 12.1 39 FR / 117 AC 详细设计追踪矩阵

下表每行覆盖一个 FR、其 3 条 AC、详细设计落点和异常/验证入口。★属性以受控 RTM 为准，34 条★和 5 条非★均明确标识。

| 设计 ID / FR / 属性 | 验收标准 | 详细设计落点 | 异常与验证入口 |
| --- | --- | --- | --- |
| DLD-TR-001<br>G2-FR-001<br>★ | AC-G2-FR-001-01；AC-G2-FR-001-02；AC-G2-FR-001-03 | PlanAggregate、PlanVersion、PlanPublishPolicy | 层级/版本/授权测试 |
| DLD-TR-002<br>G2-FR-002<br>★ | AC-G2-FR-002-01；AC-G2-FR-002-02；AC-G2-FR-002-03 | FlowGraphValidator、TaskTemplate、VerificationConfig | 依赖环、失效责任人测试 |
| DLD-TR-003<br>G2-FR-003<br>★ | AC-G2-FR-003-01；AC-G2-FR-003-02；AC-G2-FR-003-03 | startResponse、TaskFactory、OutboxPublisher | 原子回滚、≤3秒待测 |
| DLD-TR-004<br>G2-FR-004<br>★ | AC-G2-FR-004-01；AC-G2-FR-004-02；AC-G2-FR-004-03 | IncidentUpdate、SituationProjectionService | 四类时间、投影重建、越权测试 |
| DLD-TR-005<br>G2-FR-005<br>★ | AC-G2-FR-005-01；AC-G2-FR-005-02；AC-G2-FR-005-03 | PositionIngestService、PositionFreshnessPolicy | 精度、≤2秒、过期降级测试 |
| DLD-TR-006<br>G2-FR-006<br>★ | AC-G2-FR-006-01；AC-G2-FR-006-02；AC-G2-FR-006-03 | VideoPort、VideoAdapter、AuditRecorder | 实时/回放、≤3秒首帧待测 |
| DLD-TR-007<br>G2-FR-007<br>非★ | AC-G2-FR-007-01；AC-G2-FR-007-02；AC-G2-FR-007-03 | MaterialQueryService、SituationProjection | 地图加载、无数据、越权测试 |
| DLD-TR-008<br>G2-FR-008<br>★ | AC-G2-FR-008-01；AC-G2-FR-008-02；AC-G2-FR-008-03 | MaterialLedgerService、OptimisticVersion | 临期边界、并发更新测试 |
| DLD-TR-009<br>G2-FR-009<br>★ | AC-G2-FR-009-01；AC-G2-FR-009-02；AC-G2-FR-009-03 | InventorySnapshot、DifferenceCalculator、AdjustmentService | 快照、差异、复核事务测试 |
| DLD-TR-010<br>G2-FR-010<br>★ | AC-G2-FR-010-01；AC-G2-FR-010-02；AC-G2-FR-010-03 | DrillPlanAggregate、DrillDeadlineScheduler | 频次、取消补演、到期测试 |
| DLD-TR-011<br>G2-FR-011<br>★ | AC-G2-FR-011-01；AC-G2-FR-011-02；AC-G2-FR-011-03 | DrillExecutionFactory、OutboxPublisher | 周期触发、下发失败恢复测试 |
| DLD-TR-012<br>G2-FR-012<br>★ | AC-G2-FR-012-01；AC-G2-FR-012-02；AC-G2-FR-012-03 | EvaluationTemplateVersion、ImprovementAction | 版本回溯、整改闭环测试 |
| DLD-TR-013<br>G2-FR-013<br>★ | AC-G2-FR-013-01；AC-G2-FR-013-02；AC-G2-FR-013-03 | IncidentApplicationService、AttachmentRef | Web/H5 创建、检索、越权测试 |

| 设计 ID / FR / 属性 | 验收标准 | 详细设计落点 | 异常与验证入口 |
| --- | --- | --- | --- |
| DLD-TR-014<br>G2-FR-014<br>★ | AC-G2-FR-014-01；AC-G2-FR-014-02；AC-G2-FR-014-03 | ExternalAlertDeduplicator、VerificationConfig、IncidentStateMachine | 重复告警、超时升级、核实启动测试 |
| DLD-TR-015<br>G2-FR-015<br>★ | AC-G2-FR-015-01；AC-G2-FR-015-02；AC-G2-FR-015-03 | ResponseTaskAggregate、reassign、TaskFeedback | 下发、催办、重指派/改期测试 |
| DLD-TR-016<br>G2-FR-016<br>★ | AC-G2-FR-016-01；AC-G2-FR-016-02；AC-G2-FR-016-03 | ClosurePolicy、IncidentClosure、KnowledgeApplicationService | 关闭前置、报告、知识沉淀测试 |
| DLD-TR-017<br>G2-FR-017<br>★ | AC-G2-FR-017-01；AC-G2-FR-017-02；AC-G2-FR-017-03 | DutyScheduleAggregate、ScheduleConflictPolicy | 发布冲突、代执行审计测试 |
| DLD-TR-018<br>G2-FR-018<br>★ | AC-G2-FR-018-01；AC-G2-FR-018-02；AC-G2-FR-018-03 | CheckPoint、AttendanceRuleVersion | 地图拾取、二维码版本、半径测试 |
| DLD-TR-019<br>G2-FR-019<br>★ | AC-G2-FR-019-01；AC-G2-FR-019-02；AC-G2-FR-019-03 | AttendanceQueryService、ExportPolicy | 三维统计、筛选导出、越权测试 |
| DLD-TR-020<br>G2-FR-020<br>★ | AC-G2-FR-020-01；AC-G2-FR-020-02；AC-G2-FR-020-03 | AttendanceDeadlineScanner、MessageDispatchPolicy | 缺卡、重试回执、20路/99%待测 |
| DLD-TR-021<br>G2-FR-021<br>★ | AC-G2-FR-021-01；AC-G2-FR-021-02；AC-G2-FR-021-03 | MobileFacade、IncidentApplicationService、AttachmentPort | H5 上报、个人列表、断网上传测试 |
| DLD-TR-022<br>G2-FR-022<br>★ | AC-G2-FR-022-01；AC-G2-FR-022-02；AC-G2-FR-022-03 | MobileFacade、ResponseTaskAggregate、TaskFeedback | 确认、附件反馈、迟到回执测试 |
| DLD-TR-023<br>G2-FR-023<br>★ | AC-G2-FR-023-01；AC-G2-FR-023-02；AC-G2-FR-023-03 | MobileFacade、DrillExecution、ImprovementAction | 列表、提交、无权/关闭测试 |
| DLD-TR-024<br>G2-FR-024<br>★ | AC-G2-FR-024-01；AC-G2-FR-024-02；AC-G2-FR-024-03 | AttendanceApplicationService、QrTokenValidator、IdempotencyGuard | 有效/过期/越界、≤1秒待测 |
| DLD-TR-025<br>G2-FR-025<br>★ | AC-G2-FR-025-01；AC-G2-FR-025-02；AC-G2-FR-025-03 | MobileInventoryFacade、DifferenceCalculator、AdjustmentService | 移动盘点、差异、调整事务测试 |
| DLD-TR-026<br>G2-FR-026<br>★ | AC-G2-FR-026-01；AC-G2-FR-026-02；AC-G2-FR-026-03 | SituationProjectionService、ExternalStatusAdapter | 状态统计、跳转、≤30秒待测 |

| 设计 ID / FR / 属性 | 验收标准 | 详细设计落点 | 异常与验证入口 |
| --- | --- | --- | --- |
| DLD-TR-027<br>G2-FR-027<br>★ | AC-G2-FR-027-01；AC-G2-FR-027-02；AC-G2-FR-027-03 | AlertAdapter、ExternalAlertDeduplicator、QuarantineStore | 转事件、断连补传、未知载荷测试 |
| DLD-TR-028<br>G2-FR-028<br>★ | AC-G2-FR-028-01；AC-G2-FR-028-02；AC-G2-FR-028-03 | IdentityPort、OrganizationPort、FilePort、WorkflowPort | 授权、通用能力、中台降级测试 |
| DLD-TR-029<br>G2-FR-029<br>★ | AC-G2-FR-029-01；AC-G2-FR-029-02；AC-G2-FR-029-03 | VideoAdapter、ControlCommand、AccessControlAdapter | 回放、授权下发、联锁失败测试 |
| DLD-TR-030<br>G2-FR-030<br>非★ | AC-G2-FR-030-01；AC-G2-FR-030-02；AC-G2-FR-030-03 | PlanVersion、AttachmentRef、AuthorizationPolicy | 上传关联、版本、无权测试 |
| DLD-TR-031<br>G2-FR-031<br>★ | AC-G2-FR-031-01；AC-G2-FR-031-02；AC-G2-FR-031-03 | PersonRef、EmergencyGroup、GroupMemberPolicy | 档案、小组、失效阻断测试 |
| DLD-TR-032<br>G2-FR-032<br>非★ | AC-G2-FR-032-01；AC-G2-FR-032-02；AC-G2-FR-032-03 | DutyScheduleAggregate、AttendanceRuleVersion | 发布、调整留痕、冲突测试 |
| DLD-TR-033<br>G2-FR-033<br>非★ | AC-G2-FR-033-01；AC-G2-FR-033-02；AC-G2-FR-033-03 | PlanType、PlanAggregate、AuditRecorder | 增改、停用回溯、无权测试 |
| DLD-TR-034<br>G2-FR-034<br>★ | AC-G2-FR-034-01；AC-G2-FR-034-02；AC-G2-FR-034-03 | IncidentType、IncidentAggregate、AuditRecorder | 类型维护、预置调整、停用测试 |
| DLD-TR-035<br>G2-FR-035<br>★ | AC-G2-FR-035-01；AC-G2-FR-035-02；AC-G2-FR-035-03 | MaterialSite、SpatialMappingValidator | 空间配置、钻取、非法映射测试 |
| DLD-TR-036<br>G2-FR-036<br>★ | AC-G2-FR-036-01；AC-G2-FR-036-02；AC-G2-FR-036-03 | EvaluationTemplateVersion、DrillEvaluation | 编辑、版本引用、停用回溯测试 |
| DLD-TR-037<br>G2-FR-037<br>★ | AC-G2-FR-037-01；AC-G2-FR-037-02；AC-G2-FR-037-03 | VerificationConfig、VerificationRouter | 发布、实例路由、缺人/时限测试 |
| DLD-TR-038<br>G2-FR-038<br>非★ | AC-G2-FR-038-01；AC-G2-FR-038-02；AC-G2-FR-038-03 | KnowledgeItemAggregate、KnowledgeSearchService | 分类、关键字、受限内容测试 |
| DLD-TR-039<br>G2-FR-039<br>★ | AC-G2-FR-039-01；AC-G2-FR-039-02；AC-G2-FR-039-03 | SituationProjectionService、MetricDefinition | 统计、钻取、≤60秒待测 |

### 12.2 关键数字和责任边界检查

本设计保留预案启动≤3秒、告警/定位刷新≤2秒、视频首帧≤3秒、95%页面≤3秒、打卡≤1秒、设备态势≤30秒、统计≤60秒、峰值并发≥100人、消息并发≥20路且到达率≥99%、试运行可用性≥99.5%、MTTR≤2小时等受控要求。上述均为待实现和待验证目标，不是本阶段实测结论。

## 13 实现约束、未决事项与 G3-06 交接

### 13.1 实现约束

实现不得绕过模块主责直接写表，不得把投影视为事实源，不得把外部回执当作重复业务命令，不得在日志或配置库保存明文凭据。任何状态新增、端口合并、自动重试策略或责任边界变化均须通过 ADR/Change 更新本文及 RTM。

### 13.2 未决事项

1. `ISSUE-G3-01-001`：视频与统一消息真实字段、认证、回执和性能证据待甲方资料及现场联调；状态保持 OPEN。
2. 数据库产品、技术框架、物理包路径、消息中间件和缓存产品尚未完成 ADR，本文不作供应商绑定。
3. 地图坐标参考、楼层编码和宿主 APP 版本矩阵须由后续接口/部署设计确认。
4. 课程项目模拟确认：编制单位020202项目组，A何思源、B严宇、C任俊强，批准人李晓雷，签章日期2026.09.26；不得表述为现实组织签署。

### 13.3 G3-06 必须固化的接口内容

G3-06 应基于本文端口补齐 OpenAPI：资源路径、请求/响应 Schema、错误码、权限、幂等键、分页、版本策略和示例；同时为八类外部端口形成字段映射、认证、超时、重试、回执、脱敏和联调证据清单。`ISSUE-G3-01-001` 未关闭前，视频和消息只能以待确认 Schema 发布评审候选，不能标记生产可用。

## 14 设计自检结论

结构、模块职责、逻辑类设计、关键流程、状态迁移、事务/幂等、异常/补偿、安全、性能和测试接缝已完成；39 条 FR、34 条★及 117 条 AC 已逐行挂接。与 G3-03 模块边界和 G3-04 数据主责未发现冲突。本稿由 B 自检后进入 REVIEW，仍需 A 技术/总体一致性复核与 C 合规/追踪复核，通过前不得标记 DONE。
