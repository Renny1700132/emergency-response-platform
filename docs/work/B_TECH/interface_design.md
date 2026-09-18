# 接口设计说明书（工作稿）

- 任务：G3-06
- 文档编号：YJGL-G3-06
- 版本：V0.2（整改评审稿）
- 主责 / 复核：B / A、C
- 状态：SELF_CHECKED / REVIEW
- 项目：某自然博物馆智能运营中心建设项目——应急管理子系统
- 受控输入：BASELINE-G2-M2-R1.0、SRS、spec、RTM、G3-01R、G3-03—05、facts、key_numbers、issues

## 1 概述

### 1.1 目的和效力边界

本文把概要设计、数据库设计和详细设计中的调用边界落实为 REST 接口、外部适配端口、领域事件和版本治理规则。机器可读契约见 `15-接口契约-openapi_v1.yaml`；当说明书与契约的字段、必填、枚举或响应不一致时，以同版本 OpenAPI 为准，并通过契约评审修正说明书。

`ISSUE-G3-01-001` 保持 OPEN：甲方尚未提供视频与统一消息平台的真实字段、认证、回执语义和现场性能证据。本稿只冻结本系统内部归一化模型和适配端口，外部厂商 Schema 标记为 `PENDING_EXTERNAL_EVIDENCE`，不得据此宣称已连通、生产可用或性能达标。

### 1.2 接口清单

| 接口类别 | 访问方 | 主要协议 | 契约载体 | 当前状态 |
| --- | --- | --- | --- | --- |
| Web/大屏/H5 业务接口 | 既有门户、H5、大屏 | HTTPS + JSON | OpenAPI 3.0.3 | 评审候选 |
| 外部告警入站 | 信息发布、入侵、消防、IoT 适配器 | HTTPS + JSON 或适配后消息 | OpenAPI 入站资源 + 映射表 | 真实协议待联调 |
| 视频、消息、门禁等出站 | MOD-INTEGRATION 适配器 | 甲方接口协议 | 内部端口 + 映射表 | 视频/消息受 ISSUE-G3-01-001 阻断 |
| 内部领域事件 | 应用服务、投影、Outbox | 版本化事件信封 | 本文第 5 章 | 评审候选 |
| 文件、身份、权限 | 统一中台适配器 | 中台既有接口 | 内部归一化端口 | 真实字段待甲方资料确认 |

### 1.3 通用约定

1. 基础路径为 `/api/v1`，破坏性变更升级主版本；新增可选字段属于兼容变更。
2. 所有请求使用 UTF-8、ISO 8601 带时区时间和稳定业务标识；分页使用 `page`、`size`，服务端返回 `total`。
3. 统一中台令牌建立用户、组织、角色和数据域；服务端不得信任客户端自行声明的操作者或组织。
4. 写请求携带 `X-Request-ID`；启动、扫码、告警、回执和控制命令另携带 `X-Idempotency-Key`。同键异载荷返回 409。
5. 响应信封包含 `code`、`message`、`data`、`traceId`、`timestamp`；字段校验错误包含字段路径和可执行原因。
6. 业务发生时间、源时间、接收时间和处理时间分别保存。迟到数据追加历史，禁止覆盖既有事实。
7. 控制类命令必须包含授权确认和一次性确认令牌；超时不得自动重放，失败进入告警和人工降级。

## 2 REST 接口设计

### 2.1 端点总表

关键写请求的同步事务、异步副作用和外部适配边界如图 2-1 所示。应用服务只在同步事务中确认本系统事实；消息、态势投影和专业系统调用由持久化 Outbox 在提交后执行，外部失败不得回滚已确认事件。门禁控制超时必须标记结果未知并告警，禁止自动重放。

[[FIGURE:G3-06-INTERACTION]]

| 编号 | 方法与路径 | operationId | 用途 | FR |
| --- | --- | --- | --- | --- |
| API-001 | `GET /api/v1/plan-types` | `planTypesList` | 查询预案类型 | G2-FR-033 |
| API-002 | `POST /api/v1/plan-types` | `planTypesCreate` | 新增预案类型 | G2-FR-033 |
| API-003 | `GET /api/v1/plans` | `plansList` | 查询预案 | G2-FR-001, G2-FR-030 |
| API-004 | `POST /api/v1/plans` | `plansCreate` | 创建预案草稿 | G2-FR-001 |
| API-005 | `GET /api/v1/plans/{planId}` | `plansGet` | 读取预案详情与版本 | G2-FR-001, G2-FR-030 |
| API-006 | `POST /api/v1/plans/{planId}/versions` | `planVersionsCreate` | 创建预案版本 | G2-FR-001, G2-FR-002, G2-FR-030 |
| API-007 | `POST /api/v1/plan-versions/{versionId}/publish` | `planVersionsPublish` | 发布不可变预案版本 | G2-FR-001, G2-FR-002, G2-FR-030 |
| API-008 | `POST /api/v1/plan-versions/{versionId}/attachments` | `planAttachmentsBind` | 绑定中台文件引用 | G2-FR-030 |
| API-009 | `GET /api/v1/incident-types` | `incidentTypesList` | 查询事件类型 | G2-FR-034 |
| API-010 | `POST /api/v1/incident-types` | `incidentTypesCreate` | 维护事件类型 | G2-FR-034 |
| API-011 | `GET /api/v1/incidents` | `incidentsList` | 查询授权范围内事件 | G2-FR-004, G2-FR-013, G2-FR-021 |
| API-012 | `POST /api/v1/incidents` | `incidentsCreate` | 上报事件或接收归一化告警 | G2-FR-013, G2-FR-021, G2-FR-027 |
| API-013 | `GET /api/v1/incidents/{incidentId}` | `incidentsGet` | 读取事件详情 | G2-FR-004, G2-FR-013 |
| API-014 | `POST /api/v1/incidents/{incidentId}/updates` | `incidentUpdatesCreate` | 追加事件续报 | G2-FR-004 |
| API-015 | `POST /api/v1/incidents/{incidentId}/verify` | `incidentsVerify` | 人工核实事件 | G2-FR-014, G2-FR-037 |
| API-016 | `POST /api/v1/incidents/{incidentId}/start-response` | `incidentsStartResponse` | 启动响应并生成任务 | G2-FR-003, G2-FR-014 |
| API-017 | `POST /api/v1/incidents/{incidentId}/close` | `incidentsClose` | 校验材料后关闭事件 | G2-FR-016 |
| API-018 | `POST /api/v1/incidents/{incidentId}/reopen` | `incidentsReopen` | 授权重开事件 | G2-FR-016 |
| API-019 | `GET /api/v1/tasks` | `tasksList` | 查询任务 | G2-FR-015, G2-FR-022 |
| API-020 | `POST /api/v1/tasks` | `tasksCreateTemporary` | 创建临时任务 | G2-FR-015 |
| API-021 | `POST /api/v1/tasks/{taskId}/acknowledge` | `tasksAcknowledge` | 确认接收任务 | G2-FR-015, G2-FR-022 |
| API-022 | `POST /api/v1/tasks/{taskId}/feedback` | `taskFeedbackCreate` | 提交进展与附件引用 | G2-FR-015, G2-FR-022 |
| API-023 | `POST /api/v1/tasks/{taskId}/complete` | `tasksComplete` | 完成任务 | G2-FR-015, G2-FR-022 |
| API-024 | `POST /api/v1/tasks/{taskId}/reassign` | `tasksReassign` | 授权重指派 | G2-FR-015, G2-FR-022 |
| API-025 | `POST /api/v1/tasks/{taskId}/remind` | `tasksRemind` | 催办任务 | G2-FR-015 |
| API-026 | `GET /api/v1/situation/incidents/{incidentId}` | `situationIncidentGet` | 查询事件态势快照 | G2-FR-004, G2-FR-005, G2-FR-006, G2-FR-007 |
| API-027 | `GET /api/v1/situation/resource-map` | `situationResourceMap` | 查询人员与站点空间投影 | G2-FR-005, G2-FR-007, G2-FR-035 |
| API-028 | `GET /api/v1/statistics/emergency` | `statisticsEmergency` | 查询应急统计与钻取入口 | G2-FR-026, G2-FR-039 |
| API-029 | `GET /api/v1/persons` | `personsList` | 查询中台人员引用 | G2-FR-031 |
| API-030 | `GET /api/v1/groups` | `groupsList` | 查询应急小组 | G2-FR-031 |
| API-031 | `POST /api/v1/groups` | `groupsCreate` | 维护应急小组 | G2-FR-031 |
| API-032 | `GET /api/v1/positions/latest` | `positionsLatest` | 查询最新有效位置 | G2-FR-005 |
| API-033 | `GET /api/v1/material-sites` | `materialSitesList` | 查询物资站点 | G2-FR-007, G2-FR-035 |
| API-034 | `POST /api/v1/material-sites` | `materialSitesCreate` | 配置物资站点 | G2-FR-035 |
| API-035 | `GET /api/v1/material-ledgers` | `materialLedgersList` | 查询物资台账 | G2-FR-008 |
| API-036 | `POST /api/v1/material-ledgers` | `materialLedgersUpsert` | 维护物资台账 | G2-FR-008 |
| API-037 | `POST /api/v1/inventory-plans` | `inventoryPlansCreate` | 创建并冻结盘点快照 | G2-FR-009 |
| API-038 | `POST /api/v1/inventory-plans/{planId}/records` | `inventoryRecordsSubmit` | 提交移动实盘记录 | G2-FR-009, G2-FR-025 |
| API-039 | `POST /api/v1/inventory-plans/{planId}/review` | `inventoryPlansReview` | 授权复核差异 | G2-FR-009, G2-FR-025 |
| API-040 | `POST /api/v1/drill-plans` | `drillPlansCreate` | 创建演练计划 | G2-FR-010 |
| API-041 | `POST /api/v1/drill-plans/{planId}/issue` | `drillPlansIssue` | 下发演练任务 | G2-FR-010, G2-FR-011 |
| API-042 | `POST /api/v1/drill-executions/{executionId}/submit` | `drillExecutionsSubmit` | 提交演练执行记录 | G2-FR-011, G2-FR-023 |
| API-043 | `POST /api/v1/drill-executions/{executionId}/evaluate` | `drillExecutionsEvaluate` | 提交评估和整改 | G2-FR-012, G2-FR-036 |
| API-044 | `POST /api/v1/evaluation-templates` | `evaluationTemplatesCreate` | 维护评估模板 | G2-FR-036 |
| API-045 | `POST /api/v1/duty-schedules` | `dutySchedulesCreate` | 发布值班计划和规则 | G2-FR-017, G2-FR-032 |
| API-046 | `POST /api/v1/check-points` | `checkPointsCreate` | 配置点位和二维码版本 | G2-FR-018 |
| API-047 | `POST /api/v1/attendance/check-ins` | `attendanceCheckIn` | 扫码打卡 | G2-FR-018, G2-FR-024 |
| API-048 | `GET /api/v1/attendance/records` | `attendanceRecordsList` | 查询和导出考勤 | G2-FR-019 |
| API-049 | `GET /api/v1/attendance/alerts` | `attendanceAlertsList` | 查询缺卡告警 | G2-FR-020 |
| API-050 | `GET /api/v1/knowledge-items` | `knowledgeItemsList` | 检索已发布知识 | G2-FR-016, G2-FR-038 |
| API-051 | `POST /api/v1/verification-configs` | `verificationConfigsPublish` | 发布核实配置 | G2-FR-037 |
| API-052 | `GET /api/v1/platform/context` | `platformContextGet` | 读取统一身份组织权限上下文 | G2-FR-028 |
| API-053 | `POST /api/v1/platform/files/presign` | `platformFilesPresign` | 申请中台文件上传引用 | G2-FR-028, G2-FR-030 |
| API-054 | `POST /integration/v1/alerts/{source}` | `integrationAlertsReceive` | 接收归一化外部告警 | G2-FR-027 |
| API-055 | `POST /integration/v1/message-receipts` | `messageReceiptsReceive` | 接收统一消息回执 | G2-FR-020, G2-FR-022, G2-FR-028 |
| API-056 | `POST /api/v1/incidents/{incidentId}/videos/query` | `incidentVideosQuery` | 查询实时或回放视频引用 | G2-FR-006, G2-FR-029 |
| API-057 | `POST /api/v1/incidents/{incidentId}/access-control-commands` | `accessCommandsCreate` | 授权后单次下发门禁指令 | G2-FR-029 |

### 2.2 请求、响应与错误

查询接口默认只返回当前用户数据范围内的数据；资源不存在或无权访问时按安全策略返回 404 或 403，并写审计。更新类命令携带资源版本，版本冲突返回 409。附件接口只传中台文件引用、校验摘要和业务元数据，不在本系统保存文件二进制。

| HTTP | 业务码 | 适用条件 | 客户端动作 |
| --- | --- | --- | --- |
| 400 | REQ-400 | JSON、枚举、时间或坐标格式错误 | 修正请求，不自动重试 |
| 401 | AUTH-401 | 令牌缺失、过期或无效 | 重新认证 |
| 403 | AUTH-403 | 功能或数据权限不足 | 停止操作并提示 |
| 404 | RES-404 | 资源不存在或按策略隐藏 | 刷新资源状态 |
| 409 | STATE-409 / IDEM-409 | 状态、版本或幂等摘要冲突 | 拉取最新状态后人工决定 |
| 422 | RULE-422 | 业务规则校验失败 | 展示具体规则原因 |
| 429 | RATE-429 | 超过受控限流 | 按 Retry-After 退避 |
| 500 | SYS-500 | 未预期服务错误 | 使用 traceId 报障，禁止盲目重复写 |
| 503 | DEP-503 | 外部依赖不可用 | 进入降级或人工处置 |

### 2.3 关键写接口语义

预案启动在单领域事务内锁定已发布版本、创建事件响应上下文和任务，并写入 Outbox；消息发送与态势投影在提交后执行，外部失败不回滚已确认事实。事件核实超时只升级待办，不自动启动预案。任务重指派追加原责任人、新责任人、原因和操作者，截止时间默认保持不变。扫码打卡以人员、任务、点位和二维码版本组成幂等范围，重复请求返回首次结果。

门禁开启命令要求授权人员二次确认，并服从既有安全联锁。接口超时只把命令标为结果未知并告警，禁止通用重试器再次下发。视频接口返回既有系统的实时/回放引用和调用状态，本系统不保存录像。

## 3 外部系统适配

### 3.1 端口与责任边界

| 端口 | 甲方/既有系统责任 | 本项目责任 | 超时、重试与降级 | 证据状态 |
| --- | --- | --- | --- | --- |
| EXT-VIDEO | 提供视频平台、录像及≥30天保存、账号与接口资料 | 摄像头关联、实时/回放调阅、首帧测量、调用留痕 | 查询可有限重试；失败提示人工查看既有平台 | PENDING_EXTERNAL_EVIDENCE |
| EXT-MESSAGE | 提供统一通道、短信账号/签名/配额 | 并发、重试、回执、到达率与留痕 | 普通通知有限重试；重复/迟到回执幂等 | PENDING_EXTERNAL_EVIDENCE |
| EXT-ACCESS | 提供门禁与安全联锁 | 授权确认后单次下发、失败告警和人工降级 | 控制命令禁止自动重放 | 待现场联调 |
| EXT-PUBLISH / INTRUSION / FIRE / IOT | 提供告警源、终端和协议资料 | 适配、归一化、可靠 ID 去重、未知载荷隔离 | 断连补传；无可靠 ID 不自动合并 | 待现场联调 |
| EXT-MIDDLE | 提供身份、组织、权限、工作流、文件、门户和数据汇聚 | 业务适配与引用，不复制通用主数据 | 缓存只读上下文；敏感写失败关闭 | 待接口资料 |
| EXT-POSITION / GIS | 提供亚米级源数据与合法地图服务 | 关联、刷新、展示，不降低源精度 | 过期位置明显标识且禁止自动调派 | 待现场联调 |

### 3.2 字段映射与证据清单

所有厂商字段先进入适配器映射，再转换为 `ExternalAlert`、`PositionSnapshot`、`VideoReference`、`MessageReceipt` 或 `ControlCommandResult`。映射表必须记录源字段、内部字段、类型、必填、枚举、时间语义、脱敏、缺省值和未知值策略。未取得真实资料时不在契约中猜测厂商字段。

视频和消息关闭 ISSUE-G3-01-001 至少需要：接口文档版本、环境和账号、认证方式、真实请求/响应样例、错误码、回执终态、超时与限流、脱敏规则、连通记录，以及视频首帧≤3秒、消息正常验收通道≥20路且到达率≥99%的实测报告。

### 3.3 四系统联动验收挂接

KN-064 的四系统联动验收对象为视频、信息发布、物联网和统一中台。每个对象均建立“接口资料—映射评审—桩测试—目标环境连通—异常/恢复—验收记录”证据链；缺少任一目标环境证据时只能标记待验证，不得以模拟结果替代现场通过。消防、入侵、门禁和消息作为相关专业接口单独保留联调记录。

## 4 客户端接口

### 4.1 Web、大屏与 H5

Web、大屏与嵌入既有智慧管理 APP 的 H5 共用 `/api/v1` 契约，通过权限和响应裁剪形成不同视图。H5 包不包含原生 Android/iOS 功能；宿主 APP 负责登录容器、WebView、发布和生命周期。客户端不得直连数据库、地图底层服务或外部专业系统。

### 4.2 弱网与重复提交

客户端为每次写操作生成稳定请求 ID；网络超时后仅允许使用同一幂等键查询或重试。服务端返回首次已确认结果，避免重复事件、任务、打卡、告警或回执。H5 上传先取得中台文件引用，再提交业务命令；文件失败时业务页面保留可重试状态，不伪造成功。

## 5 内部端口与事件

### 5.1 内部端口

| 端口 | 输入 | 输出 | 失败语义 |
| --- | --- | --- | --- |
| IdentityPort | 中台令牌 | 用户、组织、角色、数据域 | 无法确认身份时拒绝敏感操作 |
| MessagePort | 模板、接收人、变量、消息键 | 平台消息 ID 与受理状态 | 普通通知有限重试，控制动作不走此端口 |
| VideoPort | 摄像头引用、模式、时间范围 | 播放引用、首帧时间、调用状态 | 不可用时返回明确降级，不保存录像 |
| PositionPort | 人员引用、查询范围 | 位置、源时间、精度、新鲜度 | 过期值只展示，不参与自动调派 |
| AccessControlPort | 一次性确认令牌、门标识、动作 | 联锁结果、回执状态 | 超时结果未知，禁止自动重放 |
| FilePort | 文件引用或上传申请 | 文件 ID、摘要、权限元数据 | 不在本系统保存文件二进制 |
| AlertSourcePort | 源系统、可靠外部 ID、归一化载荷 | 接收与去重结果 | 未知载荷隔离；无可靠 ID 不自动合并 |

### 5.2 领域事件信封

领域事件至少包含 `eventId`、`eventType`、`schemaVersion`、`aggregateType`、`aggregateId`、`occurredAt`、`recordedAt`、`traceId` 和 `payload`。消费者以 `eventId` 幂等；不认识的高版本字段忽略，不认识的事件类型进入隔离队列并告警。事件事实与 Outbox 同事务写入，投影和外部通知可重放但不得重复改变领域终态。

## 6 版本、安全与变更

### 6.1 版本策略

URL 主版本固定为 v1；新增可选字段、可选响应属性和新端点可在 v1 内兼容演进。删除字段、收窄枚举、改变必填、状态语义或幂等规则属于破坏性变更，必须形成变更单、影响分析、迁移窗口和 v2 契约。弃用通过 `Deprecation`、`Sunset` 和文档公告表达，至少保留双方确认的迁移期。

### 6.2 安全与审计

接口只记录脱敏摘要、结果、耗时和 traceId，不记录令牌、密码、短信完整正文或不必要的个人信息。敏感读写、导出、门禁指令、预案发布、事件关闭/重开和盘点调整写审计。OpenAPI 中的示例使用虚构标识，不包含真实人员、地址、密钥或厂商凭据。

### 6.3 契约变更流程

1. 先修改工作稿和 OpenAPI，并建立 Issue/Change。
2. 运行语法、引用、operationId、FR/AC 和破坏性变更检查。
3. A/C 复核业务边界、合规、★和关键数字。
4. 实现与契约测试同步修改，完成联调和回归。
5. 发布新契约快照并保留旧版本迁移证据。

## 7 需求与验收追踪

### 7.1 39 FR / 117 AC 接口挂接

下表是接口设计挂接，不替代 G3-08 最终设计 RTM，也不表示实现、联调、性能或验收已通过。每条 FR 保留三个完整 AC 锚点。

| 设计 ID / FR / ★ | 完整 AC 锚点 | 接口或端口落点 | 后续验证入口 |
| --- | --- | --- | --- |
| API-TR-001<br>G2-FR-001<br>★ | AC-G2-FR-001-01；AC-G2-FR-001-02；AC-G2-FR-001-03 | 应急预案分层维护：GET /api/v1/plans；POST /api/v1/plans；GET /api/v1/plans/{planId}；POST /api/v1/plans/{planId}/versions；POST /api/v1/plan-versions/{versionId}/publish | 契约测试 CT-001；集成/验收用例 TC-G2-FR-001-01—03 |
| API-TR-002<br>G2-FR-002<br>★ | AC-G2-FR-002-01；AC-G2-FR-002-02；AC-G2-FR-002-03 | 流程、资源与任务模板：POST /api/v1/plans/{planId}/versions；POST /api/v1/plan-versions/{versionId}/publish | 契约测试 CT-002；集成/验收用例 TC-G2-FR-002-01—03 |
| API-TR-003<br>G2-FR-003<br>★ | AC-G2-FR-003-01；AC-G2-FR-003-02；AC-G2-FR-003-03 | 秒级预案启动：POST /api/v1/incidents/{incidentId}/start-response | 契约测试 CT-003；集成/验收用例 TC-G2-FR-003-01—03 |
| API-TR-004<br>G2-FR-004<br>★ | AC-G2-FR-004-01；AC-G2-FR-004-02；AC-G2-FR-004-03 | 事件态势与处置动态：GET /api/v1/incidents；GET /api/v1/incidents/{incidentId}；POST /api/v1/incidents/{incidentId}/updates；GET /api/v1/situation/incidents/{incidentId} | 契约测试 CT-004；集成/验收用例 TC-G2-FR-004-01—03 |
| API-TR-005<br>G2-FR-005<br>★ | AC-G2-FR-005-01；AC-G2-FR-005-02；AC-G2-FR-005-03 | 人员定位与状态：GET /api/v1/situation/incidents/{incidentId}；GET /api/v1/situation/resource-map；GET /api/v1/positions/latest | 契约测试 CT-005；集成/验收用例 TC-G2-FR-005-01—03 |
| API-TR-006<br>G2-FR-006<br>★ | AC-G2-FR-006-01；AC-G2-FR-006-02；AC-G2-FR-006-03 | 实时视频与历史回放：GET /api/v1/situation/incidents/{incidentId}；POST /api/v1/incidents/{incidentId}/videos/query | 契约测试 CT-006；集成/验收用例 TC-G2-FR-006-01—03 |
| API-TR-007<br>G2-FR-007<br>非★ | AC-G2-FR-007-01；AC-G2-FR-007-02；AC-G2-FR-007-03 | 重点区域与物资站点一张图：GET /api/v1/situation/incidents/{incidentId}；GET /api/v1/situation/resource-map；GET /api/v1/material-sites | 契约测试 CT-007；集成/验收用例 TC-G2-FR-007-01—03 |
| API-TR-008<br>G2-FR-008<br>★ | AC-G2-FR-008-01；AC-G2-FR-008-02；AC-G2-FR-008-03 | 物资台账：GET /api/v1/material-ledgers；POST /api/v1/material-ledgers | 契约测试 CT-008；集成/验收用例 TC-G2-FR-008-01—03 |
| API-TR-009<br>G2-FR-009<br>★ | AC-G2-FR-009-01；AC-G2-FR-009-02；AC-G2-FR-009-03 | 盘点计划与差异复核：POST /api/v1/inventory-plans；POST /api/v1/inventory-plans/{planId}/records；POST /api/v1/inventory-plans/{planId}/review | 契约测试 CT-009；集成/验收用例 TC-G2-FR-009-01—03 |
| API-TR-010<br>G2-FR-010<br>★ | AC-G2-FR-010-01；AC-G2-FR-010-02；AC-G2-FR-010-03 | 演练计划与频次：POST /api/v1/drill-plans；POST /api/v1/drill-plans/{planId}/issue | 契约测试 CT-010；集成/验收用例 TC-G2-FR-010-01—03 |
| API-TR-011<br>G2-FR-011<br>★ | AC-G2-FR-011-01；AC-G2-FR-011-02；AC-G2-FR-011-03 | 演练任务下发：POST /api/v1/drill-plans/{planId}/issue；POST /api/v1/drill-executions/{executionId}/submit | 契约测试 CT-011；集成/验收用例 TC-G2-FR-011-01—03 |
| API-TR-012<br>G2-FR-012<br>★ | AC-G2-FR-012-01；AC-G2-FR-012-02；AC-G2-FR-012-03 | 演练评估与整改：POST /api/v1/drill-executions/{executionId}/evaluate | 契约测试 CT-012；集成/验收用例 TC-G2-FR-012-01—03 |
| API-TR-013<br>G2-FR-013<br>★ | AC-G2-FR-013-01；AC-G2-FR-013-02；AC-G2-FR-013-03 | Web/H5 事件上报与查询：GET /api/v1/incidents；POST /api/v1/incidents；GET /api/v1/incidents/{incidentId} | 契约测试 CT-013；集成/验收用例 TC-G2-FR-013-01—03 |
| API-TR-014<br>G2-FR-014<br>★ | AC-G2-FR-014-01；AC-G2-FR-014-02；AC-G2-FR-014-03 | 事件核实与响应启动：POST /api/v1/incidents/{incidentId}/verify；POST /api/v1/incidents/{incidentId}/start-response | 契约测试 CT-014；集成/验收用例 TC-G2-FR-014-01—03 |
| API-TR-015<br>G2-FR-015<br>★ | AC-G2-FR-015-01；AC-G2-FR-015-02；AC-G2-FR-015-03 | 任务处置与催办：GET /api/v1/tasks；POST /api/v1/tasks；POST /api/v1/tasks/{taskId}/acknowledge；POST /api/v1/tasks/{taskId}/feedback；POST /api/v1/tasks/{taskId}/complete；POST /api/v1/tasks/{taskId}/reassign；POST /api/v1/tasks/{taskId}/remind | 契约测试 CT-015；集成/验收用例 TC-G2-FR-015-01—03 |
| API-TR-016<br>G2-FR-016<br>★ | AC-G2-FR-016-01；AC-G2-FR-016-02；AC-G2-FR-016-03 | 事件关闭、调查与知识沉淀：POST /api/v1/incidents/{incidentId}/close；POST /api/v1/incidents/{incidentId}/reopen；GET /api/v1/knowledge-items | 契约测试 CT-016；集成/验收用例 TC-G2-FR-016-01—03 |
| API-TR-017<br>G2-FR-017<br>★ | AC-G2-FR-017-01；AC-G2-FR-017-02；AC-G2-FR-017-03 | 值班与打卡规则：POST /api/v1/duty-schedules | 契约测试 CT-017；集成/验收用例 TC-G2-FR-017-01—03 |
| API-TR-018<br>G2-FR-018<br>★ | AC-G2-FR-018-01；AC-G2-FR-018-02；AC-G2-FR-018-03 | 打卡点位与二维码：POST /api/v1/check-points；POST /api/v1/attendance/check-ins | 契约测试 CT-018；集成/验收用例 TC-G2-FR-018-01—03 |
| API-TR-019<br>G2-FR-019<br>★ | AC-G2-FR-019-01；AC-G2-FR-019-02；AC-G2-FR-019-03 | 考勤统计与导出：GET /api/v1/attendance/records | 契约测试 CT-019；集成/验收用例 TC-G2-FR-019-01—03 |
| API-TR-020<br>G2-FR-020<br>★ | AC-G2-FR-020-01；AC-G2-FR-020-02；AC-G2-FR-020-03 | 缺卡告警与消息通知：GET /api/v1/attendance/alerts；POST /integration/v1/message-receipts | 契约测试 CT-020；集成/验收用例 TC-G2-FR-020-01—03 |
| API-TR-021<br>G2-FR-021<br>★ | AC-G2-FR-021-01；AC-G2-FR-021-02；AC-G2-FR-021-03 | H5 事件上报与个人记录：GET /api/v1/incidents；POST /api/v1/incidents | 契约测试 CT-021；集成/验收用例 TC-G2-FR-021-01—03 |
| API-TR-022<br>G2-FR-022<br>★ | AC-G2-FR-022-01；AC-G2-FR-022-02；AC-G2-FR-022-03 | H5 任务接收与反馈：GET /api/v1/tasks；POST /api/v1/tasks/{taskId}/acknowledge；POST /api/v1/tasks/{taskId}/feedback；POST /api/v1/tasks/{taskId}/complete；POST /api/v1/tasks/{taskId}/reassign；POST /integration/v1/message-receipts | 契约测试 CT-022；集成/验收用例 TC-G2-FR-022-01—03 |
| API-TR-023<br>G2-FR-023<br>★ | AC-G2-FR-023-01；AC-G2-FR-023-02；AC-G2-FR-023-03 | H5 演练执行：POST /api/v1/drill-executions/{executionId}/submit | 契约测试 CT-023；集成/验收用例 TC-G2-FR-023-01—03 |
| API-TR-024<br>G2-FR-024<br>★ | AC-G2-FR-024-01；AC-G2-FR-024-02；AC-G2-FR-024-03 | H5 扫码打卡：POST /api/v1/attendance/check-ins | 契约测试 CT-024；集成/验收用例 TC-G2-FR-024-01—03 |
| API-TR-025<br>G2-FR-025<br>★ | AC-G2-FR-025-01；AC-G2-FR-025-02；AC-G2-FR-025-03 | H5 物资盘点：POST /api/v1/inventory-plans/{planId}/records；POST /api/v1/inventory-plans/{planId}/review | 契约测试 CT-025；集成/验收用例 TC-G2-FR-025-01—03 |
| API-TR-026<br>G2-FR-026<br>★ | AC-G2-FR-026-01；AC-G2-FR-026-02；AC-G2-FR-026-03 | 综合安防态势：GET /api/v1/statistics/emergency | 契约测试 CT-026；集成/验收用例 TC-G2-FR-026-01—03 |
| API-TR-027<br>G2-FR-027<br>★ | AC-G2-FR-027-01；AC-G2-FR-027-02；AC-G2-FR-027-03 | 外部告警接入：POST /api/v1/incidents；POST /integration/v1/alerts/{source} | 契约测试 CT-027；集成/验收用例 TC-G2-FR-027-01—03 |
| API-TR-028<br>G2-FR-028<br>★ | AC-G2-FR-028-01；AC-G2-FR-028-02；AC-G2-FR-028-03 | 统一中台能力适配：GET /api/v1/platform/context；POST /api/v1/platform/files/presign；POST /integration/v1/message-receipts | 契约测试 CT-028；集成/验收用例 TC-G2-FR-028-01—03 |
| API-TR-029<br>G2-FR-029<br>★ | AC-G2-FR-029-01；AC-G2-FR-029-02；AC-G2-FR-029-03 | 视频回放与授权门禁联动：POST /api/v1/incidents/{incidentId}/videos/query；POST /api/v1/incidents/{incidentId}/access-control-commands | 契约测试 CT-029；集成/验收用例 TC-G2-FR-029-01—03 |
| API-TR-030<br>G2-FR-030<br>非★ | AC-G2-FR-030-01；AC-G2-FR-030-02；AC-G2-FR-030-03 | 预案附件与版本：GET /api/v1/plans；GET /api/v1/plans/{planId}；POST /api/v1/plans/{planId}/versions；POST /api/v1/plan-versions/{versionId}/publish；POST /api/v1/plan-versions/{versionId}/attachments；POST /api/v1/platform/files/presign | 契约测试 CT-030；集成/验收用例 TC-G2-FR-030-01—03 |
| API-TR-031<br>G2-FR-031<br>★ | AC-G2-FR-031-01；AC-G2-FR-031-02；AC-G2-FR-031-03 | 应急人员与小组：GET /api/v1/persons；GET /api/v1/groups；POST /api/v1/groups | 契约测试 CT-031；集成/验收用例 TC-G2-FR-031-01—03 |
| API-TR-032<br>G2-FR-032<br>非★ | AC-G2-FR-032-01；AC-G2-FR-032-02；AC-G2-FR-032-03 | 值班计划维护：POST /api/v1/duty-schedules | 契约测试 CT-032；集成/验收用例 TC-G2-FR-032-01—03 |
| API-TR-033<br>G2-FR-033<br>非★ | AC-G2-FR-033-01；AC-G2-FR-033-02；AC-G2-FR-033-03 | 预案类型维护：GET /api/v1/plan-types；POST /api/v1/plan-types | 契约测试 CT-033；集成/验收用例 TC-G2-FR-033-01—03 |
| API-TR-034<br>G2-FR-034<br>★ | AC-G2-FR-034-01；AC-G2-FR-034-02；AC-G2-FR-034-03 | 事件类型维护：GET /api/v1/incident-types；POST /api/v1/incident-types | 契约测试 CT-034；集成/验收用例 TC-G2-FR-034-01—03 |
| API-TR-035<br>G2-FR-035<br>★ | AC-G2-FR-035-01；AC-G2-FR-035-02；AC-G2-FR-035-03 | 物资站点空间配置：GET /api/v1/situation/resource-map；GET /api/v1/material-sites；POST /api/v1/material-sites | 契约测试 CT-035；集成/验收用例 TC-G2-FR-035-01—03 |
| API-TR-036<br>G2-FR-036<br>★ | AC-G2-FR-036-01；AC-G2-FR-036-02；AC-G2-FR-036-03 | 评估模板维护：POST /api/v1/drill-executions/{executionId}/evaluate；POST /api/v1/evaluation-templates | 契约测试 CT-036；集成/验收用例 TC-G2-FR-036-01—03 |
| API-TR-037<br>G2-FR-037<br>★ | AC-G2-FR-037-01；AC-G2-FR-037-02；AC-G2-FR-037-03 | 核实流程配置：POST /api/v1/incidents/{incidentId}/verify；POST /api/v1/verification-configs | 契约测试 CT-037；集成/验收用例 TC-G2-FR-037-01—03 |
| API-TR-038<br>G2-FR-038<br>非★ | AC-G2-FR-038-01；AC-G2-FR-038-02；AC-G2-FR-038-03 | H5 知识库：GET /api/v1/knowledge-items | 契约测试 CT-038；集成/验收用例 TC-G2-FR-038-01—03 |
| API-TR-039<br>G2-FR-039<br>★ | AC-G2-FR-039-01；AC-G2-FR-039-02；AC-G2-FR-039-03 | 应急信息统计：GET /api/v1/statistics/emergency | 契约测试 CT-039；集成/验收用例 TC-G2-FR-039-01—03 |

### 7.2 关键数字验证挂接

| 指标 | 接口挂接 | 验证方法 | 当前结论 |
| --- | --- | --- | --- |
| 预案启动≤3秒 | `incidentsStartResponse` | 目标环境从请求受理到任务和 Outbox 提交计时 | 待实现/待测 |
| 告警、定位刷新≤2秒 | 告警入站、`positionsLatest` | 注入带源时间数据，测接收与可见时间 | 待联调/待测 |
| 视频首帧≤3秒 | `incidentVideosQuery` / VideoPort | 目标网络与账号下从调阅到首帧计时 | ISSUE-G3-01-001 阻断 |
| 消息≥20路、到达率≥99% | MessagePort、回执入站 | 正常验收通道并发发送并按终态回执统计 | ISSUE-G3-01-001 阻断 |
| 打卡≤1秒 | `attendanceCheckIn` | 身份、二维码、时空校验到事务提交计时 | 待实现/待测 |
| 设备态势≤30秒、统计≤60秒 | 态势与统计查询 | 对照源时间和投影可见时间 | 待联调/待测 |

## 8 验证、未决事项与准出

### 8.1 契约验证

OpenAPI 必须通过 YAML 解析、OpenAPI 版本、路径、operationId 唯一、局部 `$ref` 可解析、写接口幂等头、统一错误响应、安全方案和 39 FR/117 AC 引用检查。实现阶段采用契约优先：先更新契约和失败测试，再修改实现直至通过。外部适配器使用桩验证映射、超时、重复、乱序、迟到、断连补传和未知载荷。

### 8.2 未决事项

| 项目 | 当前处理 | 阻断关系 |
| --- | --- | --- |
| ISSUE-G3-01-001 视频/消息真实资料与证据缺失 | 内部 Schema 已定义；外部 Schema、认证、回执和性能标记待确认 | 阻断视频/消息外部契约冻结、G3-06 最终冻结和 M3 最终冻结 |
| 地图坐标系、楼层编码 | 接口保留 `coordinateReference`、`floorCode`、源精度 | 阻断空间字段最终枚举与现场联调 |
| 宿主 APP 版本矩阵 | H5 使用 Web 契约并保留宿主上下文边界 | 阻断兼容性最终验收，不阻断接口评审 |
| 真实部署域名、证书、限流和密钥托管 | OpenAPI 使用相对/示例服务器，不写生产凭据 | 待 G3-07 ADR 与甲方环境确认 |

### 8.3 自检结论

本稿已形成业务 REST 契约、八类外部端口边界、版本/安全/幂等/错误约定、39 FR 与 117 AC 的接口挂接和关键数字验证入口。接口稿可进入 A/C REVIEW；`ISSUE-G3-01-001` 未关闭前不得把视频和消息的外部契约、性能或连通性标为冻结/通过。
