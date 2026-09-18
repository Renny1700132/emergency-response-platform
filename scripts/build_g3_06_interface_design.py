from __future__ import annotations

import argparse
import copy
import os
import re
import shutil
import zipfile
from pathlib import Path

import yaml
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = next((ROOT / "docs/reference").glob("14-*.docx"))
WORK_MD = ROOT / "docs/work/B_TECH/interface_design.md"
WORK_YAML = ROOT / "docs/work/B_TECH/openapi_v1.yaml"
OUTPUT_DOCX = ROOT / "docs/deliverables/14-接口设计说明书.docx"
OUTPUT_YAML = ROOT / "docs/deliverables/15-接口契约-openapi_v1.yaml"

PROJECT = "某自然博物馆智能运营中心建设项目——应急管理子系统"
NON_STAR = {7, 30, 32, 33, 38}
FR_NAMES = {
    1: "应急预案分层维护", 2: "流程、资源与任务模板", 3: "秒级预案启动",
    4: "事件态势与处置动态", 5: "人员定位与状态", 6: "实时视频与历史回放",
    7: "重点区域与物资站点一张图", 8: "物资台账", 9: "盘点计划与差异复核",
    10: "演练计划与频次", 11: "演练任务下发", 12: "演练评估与整改",
    13: "Web/H5 事件上报与查询", 14: "事件核实与响应启动", 15: "任务处置与催办",
    16: "事件关闭、调查与知识沉淀", 17: "值班与打卡规则", 18: "打卡点位与二维码",
    19: "考勤统计与导出", 20: "缺卡告警与消息通知", 21: "H5 事件上报与个人记录",
    22: "H5 任务接收与反馈", 23: "H5 演练执行", 24: "H5 扫码打卡",
    25: "H5 物资盘点", 26: "综合安防态势", 27: "外部告警接入",
    28: "统一中台能力适配", 29: "视频回放与授权门禁联动", 30: "预案附件与版本",
    31: "应急人员与小组", 32: "值班计划维护", 33: "预案类型维护",
    34: "事件类型维护", 35: "物资站点空间配置", 36: "评估模板维护",
    37: "核实流程配置", 38: "H5 知识库", 39: "应急信息统计",
}

ENDPOINTS = [
    ("GET", "/api/v1/plan-types", "planTypesList", "预案", [33], "查询预案类型"),
    ("POST", "/api/v1/plan-types", "planTypesCreate", "预案", [33], "新增预案类型"),
    ("GET", "/api/v1/plans", "plansList", "预案", [1, 30], "查询预案"),
    ("POST", "/api/v1/plans", "plansCreate", "预案", [1], "创建预案草稿"),
    ("GET", "/api/v1/plans/{planId}", "plansGet", "预案", [1, 30], "读取预案详情与版本"),
    ("POST", "/api/v1/plans/{planId}/versions", "planVersionsCreate", "预案", [1, 2, 30], "创建预案版本"),
    ("POST", "/api/v1/plan-versions/{versionId}/publish", "planVersionsPublish", "预案", [1, 2, 30], "发布不可变预案版本"),
    ("POST", "/api/v1/plan-versions/{versionId}/attachments", "planAttachmentsBind", "预案", [30], "绑定中台文件引用"),
    ("GET", "/api/v1/incident-types", "incidentTypesList", "事件", [34], "查询事件类型"),
    ("POST", "/api/v1/incident-types", "incidentTypesCreate", "事件", [34], "维护事件类型"),
    ("GET", "/api/v1/incidents", "incidentsList", "事件", [4, 13, 21], "查询授权范围内事件"),
    ("POST", "/api/v1/incidents", "incidentsCreate", "事件", [13, 21, 27], "上报事件或接收归一化告警"),
    ("GET", "/api/v1/incidents/{incidentId}", "incidentsGet", "事件", [4, 13], "读取事件详情"),
    ("POST", "/api/v1/incidents/{incidentId}/updates", "incidentUpdatesCreate", "事件", [4], "追加事件续报"),
    ("POST", "/api/v1/incidents/{incidentId}/verify", "incidentsVerify", "事件", [14, 37], "人工核实事件"),
    ("POST", "/api/v1/incidents/{incidentId}/start-response", "incidentsStartResponse", "事件", [3, 14], "启动响应并生成任务"),
    ("POST", "/api/v1/incidents/{incidentId}/close", "incidentsClose", "事件", [16], "校验材料后关闭事件"),
    ("POST", "/api/v1/incidents/{incidentId}/reopen", "incidentsReopen", "事件", [16], "授权重开事件"),
    ("GET", "/api/v1/tasks", "tasksList", "任务", [15, 22], "查询任务"),
    ("POST", "/api/v1/tasks", "tasksCreateTemporary", "任务", [15], "创建临时任务"),
    ("POST", "/api/v1/tasks/{taskId}/acknowledge", "tasksAcknowledge", "任务", [15, 22], "确认接收任务"),
    ("POST", "/api/v1/tasks/{taskId}/feedback", "taskFeedbackCreate", "任务", [15, 22], "提交进展与附件引用"),
    ("POST", "/api/v1/tasks/{taskId}/complete", "tasksComplete", "任务", [15, 22], "完成任务"),
    ("POST", "/api/v1/tasks/{taskId}/reassign", "tasksReassign", "任务", [15, 22], "授权重指派"),
    ("POST", "/api/v1/tasks/{taskId}/remind", "tasksRemind", "任务", [15], "催办任务"),
    ("GET", "/api/v1/situation/incidents/{incidentId}", "situationIncidentGet", "态势", [4, 5, 6, 7], "查询事件态势快照"),
    ("GET", "/api/v1/situation/resource-map", "situationResourceMap", "态势", [5, 7, 35], "查询人员与站点空间投影"),
    ("GET", "/api/v1/statistics/emergency", "statisticsEmergency", "态势", [26, 39], "查询应急统计与钻取入口"),
    ("GET", "/api/v1/persons", "personsList", "资源", [31], "查询中台人员引用"),
    ("GET", "/api/v1/groups", "groupsList", "资源", [31], "查询应急小组"),
    ("POST", "/api/v1/groups", "groupsCreate", "资源", [31], "维护应急小组"),
    ("GET", "/api/v1/positions/latest", "positionsLatest", "资源", [5], "查询最新有效位置"),
    ("GET", "/api/v1/material-sites", "materialSitesList", "物资", [7, 35], "查询物资站点"),
    ("POST", "/api/v1/material-sites", "materialSitesCreate", "物资", [35], "配置物资站点"),
    ("GET", "/api/v1/material-ledgers", "materialLedgersList", "物资", [8], "查询物资台账"),
    ("POST", "/api/v1/material-ledgers", "materialLedgersUpsert", "物资", [8], "维护物资台账"),
    ("POST", "/api/v1/inventory-plans", "inventoryPlansCreate", "物资", [9], "创建并冻结盘点快照"),
    ("POST", "/api/v1/inventory-plans/{planId}/records", "inventoryRecordsSubmit", "物资", [9, 25], "提交移动实盘记录"),
    ("POST", "/api/v1/inventory-plans/{planId}/review", "inventoryPlansReview", "物资", [9, 25], "授权复核差异"),
    ("POST", "/api/v1/drill-plans", "drillPlansCreate", "演练", [10], "创建演练计划"),
    ("POST", "/api/v1/drill-plans/{planId}/issue", "drillPlansIssue", "演练", [10, 11], "下发演练任务"),
    ("POST", "/api/v1/drill-executions/{executionId}/submit", "drillExecutionsSubmit", "演练", [11, 23], "提交演练执行记录"),
    ("POST", "/api/v1/drill-executions/{executionId}/evaluate", "drillExecutionsEvaluate", "演练", [12, 36], "提交评估和整改"),
    ("POST", "/api/v1/evaluation-templates", "evaluationTemplatesCreate", "演练", [36], "维护评估模板"),
    ("POST", "/api/v1/duty-schedules", "dutySchedulesCreate", "值班", [17, 32], "发布值班计划和规则"),
    ("POST", "/api/v1/check-points", "checkPointsCreate", "值班", [18], "配置点位和二维码版本"),
    ("POST", "/api/v1/attendance/check-ins", "attendanceCheckIn", "值班", [18, 24], "扫码打卡"),
    ("GET", "/api/v1/attendance/records", "attendanceRecordsList", "值班", [19], "查询和导出考勤"),
    ("GET", "/api/v1/attendance/alerts", "attendanceAlertsList", "值班", [20], "查询缺卡告警"),
    ("GET", "/api/v1/knowledge-items", "knowledgeItemsList", "知识", [16, 38], "检索已发布知识"),
    ("POST", "/api/v1/verification-configs", "verificationConfigsPublish", "配置", [37], "发布核实配置"),
    ("GET", "/api/v1/platform/context", "platformContextGet", "中台", [28], "读取统一身份组织权限上下文"),
    ("POST", "/api/v1/platform/files/presign", "platformFilesPresign", "中台", [28, 30], "申请中台文件上传引用"),
    ("POST", "/integration/v1/alerts/{source}", "integrationAlertsReceive", "集成", [27], "接收归一化外部告警"),
    ("POST", "/integration/v1/message-receipts", "messageReceiptsReceive", "集成", [20, 22, 28], "接收统一消息回执"),
    ("POST", "/api/v1/incidents/{incidentId}/videos/query", "incidentVideosQuery", "集成", [6, 29], "查询实时或回放视频引用"),
    ("POST", "/api/v1/incidents/{incidentId}/access-control-commands", "accessCommandsCreate", "集成", [29], "授权后单次下发门禁指令"),
]


def fr(n: int) -> str:
    return f"G2-FR-{n:03d}"


def acs(n: int) -> list[str]:
    return [f"AC-G2-FR-{n:03d}-{i:02d}" for i in range(1, 4)]


def build_markdown() -> str:
    lines = [
        "# 接口设计说明书（工作稿）", "",
        "- 任务：G3-06", "- 文档编号：YJGL-G3-06", "- 版本：V0.1（评审稿）",
        "- 主责 / 复核：B / A、C", "- 状态：SELF_CHECKED / REVIEW",
        f"- 项目：{PROJECT}",
        "- 受控输入：BASELINE-G2-M2-R1.0、SRS、spec、RTM、G3-01R、G3-03—05、facts、key_numbers、issues", "",
        "## 1 概述", "", "### 1.1 目的和效力边界", "",
        "本文把概要设计、数据库设计和详细设计中的调用边界落实为 REST 接口、外部适配端口、领域事件和版本治理规则。机器可读契约见 `15-接口契约-openapi_v1.yaml`；当说明书与契约的字段、必填、枚举或响应不一致时，以同版本 OpenAPI 为准，并通过契约评审修正说明书。", "",
        "`ISSUE-G3-01-001` 保持 OPEN：甲方尚未提供视频与统一消息平台的真实字段、认证、回执语义和现场性能证据。本稿只冻结本系统内部归一化模型和适配端口，外部厂商 Schema 标记为 `PENDING_EXTERNAL_EVIDENCE`，不得据此宣称已连通、生产可用或性能达标。", "",
        "### 1.2 接口清单", "",
        "| 接口类别 | 访问方 | 主要协议 | 契约载体 | 当前状态 |", "| --- | --- | --- | --- | --- |",
        "| Web/大屏/H5 业务接口 | 既有门户、H5、大屏 | HTTPS + JSON | OpenAPI 3.0.3 | 评审候选 |",
        "| 外部告警入站 | 信息发布、入侵、消防、IoT 适配器 | HTTPS + JSON 或适配后消息 | OpenAPI 入站资源 + 映射表 | 真实协议待联调 |",
        "| 视频、消息、门禁等出站 | MOD-INTEGRATION 适配器 | 甲方接口协议 | 内部端口 + 映射表 | 视频/消息受 ISSUE-G3-01-001 阻断 |",
        "| 内部领域事件 | 应用服务、投影、Outbox | 版本化事件信封 | 本文第 5 章 | 评审候选 |",
        "| 文件、身份、权限 | 统一中台适配器 | 中台既有接口 | 内部归一化端口 | 真实字段待甲方资料确认 |", "",
        "### 1.3 通用约定", "",
        "1. 基础路径为 `/api/v1`，破坏性变更升级主版本；新增可选字段属于兼容变更。",
        "2. 所有请求使用 UTF-8、ISO 8601 带时区时间和稳定业务标识；分页使用 `page`、`size`，服务端返回 `total`。",
        "3. 统一中台令牌建立用户、组织、角色和数据域；服务端不得信任客户端自行声明的操作者或组织。",
        "4. 写请求携带 `X-Request-ID`；启动、扫码、告警、回执和控制命令另携带 `X-Idempotency-Key`。同键异载荷返回 409。",
        "5. 响应信封包含 `code`、`message`、`data`、`traceId`、`timestamp`；字段校验错误包含字段路径和可执行原因。",
        "6. 业务发生时间、源时间、接收时间和处理时间分别保存。迟到数据追加历史，禁止覆盖既有事实。",
        "7. 控制类命令必须包含授权确认和一次性确认令牌；超时不得自动重放，失败进入告警和人工降级。", "",
        "## 2 REST 接口设计", "", "### 2.1 端点总表", "",
        "| 编号 | 方法与路径 | operationId | 用途 | FR |", "| --- | --- | --- | --- | --- |",
    ]
    for i, (method, path, op, _tag, reqs, summary) in enumerate(ENDPOINTS, 1):
        lines.append(f"| API-{i:03d} | `{method} {path}` | `{op}` | {summary} | {', '.join(fr(n) for n in reqs)} |")
    lines += ["", "### 2.2 请求、响应与错误", "",
        "查询接口默认只返回当前用户数据范围内的数据；资源不存在或无权访问时按安全策略返回 404 或 403，并写审计。更新类命令携带资源版本，版本冲突返回 409。附件接口只传中台文件引用、校验摘要和业务元数据，不在本系统保存文件二进制。", "",
        "| HTTP | 业务码 | 适用条件 | 客户端动作 |", "| --- | --- | --- | --- |",
        "| 400 | REQ-400 | JSON、枚举、时间或坐标格式错误 | 修正请求，不自动重试 |",
        "| 401 | AUTH-401 | 令牌缺失、过期或无效 | 重新认证 |",
        "| 403 | AUTH-403 | 功能或数据权限不足 | 停止操作并提示 |",
        "| 404 | RES-404 | 资源不存在或按策略隐藏 | 刷新资源状态 |",
        "| 409 | STATE-409 / IDEM-409 | 状态、版本或幂等摘要冲突 | 拉取最新状态后人工决定 |",
        "| 422 | RULE-422 | 业务规则校验失败 | 展示具体规则原因 |",
        "| 429 | RATE-429 | 超过受控限流 | 按 Retry-After 退避 |",
        "| 500 | SYS-500 | 未预期服务错误 | 使用 traceId 报障，禁止盲目重复写 |",
        "| 503 | DEP-503 | 外部依赖不可用 | 进入降级或人工处置 |", "",
        "### 2.3 关键写接口语义", "",
        "预案启动在单领域事务内锁定已发布版本、创建事件响应上下文和任务，并写入 Outbox；消息发送与态势投影在提交后执行，外部失败不回滚已确认事实。事件核实超时只升级待办，不自动启动预案。任务重指派追加原责任人、新责任人、原因和操作者，截止时间默认保持不变。扫码打卡以人员、任务、点位和二维码版本组成幂等范围，重复请求返回首次结果。", "",
        "门禁开启命令要求授权人员二次确认，并服从既有安全联锁。接口超时只把命令标为结果未知并告警，禁止通用重试器再次下发。视频接口返回既有系统的实时/回放引用和调用状态，本系统不保存录像。", "",
        "## 3 外部系统适配", "", "### 3.1 端口与责任边界", "",
        "| 端口 | 甲方/既有系统责任 | 本项目责任 | 超时、重试与降级 | 证据状态 |", "| --- | --- | --- | --- | --- |",
        "| EXT-VIDEO | 提供视频平台、录像及≥30天保存、账号与接口资料 | 摄像头关联、实时/回放调阅、首帧测量、调用留痕 | 查询可有限重试；失败提示人工查看既有平台 | PENDING_EXTERNAL_EVIDENCE |",
        "| EXT-MESSAGE | 提供统一通道、短信账号/签名/配额 | 并发、重试、回执、到达率与留痕 | 普通通知有限重试；重复/迟到回执幂等 | PENDING_EXTERNAL_EVIDENCE |",
        "| EXT-ACCESS | 提供门禁与安全联锁 | 授权确认后单次下发、失败告警和人工降级 | 控制命令禁止自动重放 | 待现场联调 |",
        "| EXT-PUBLISH / INTRUSION / FIRE / IOT | 提供告警源、终端和协议资料 | 适配、归一化、可靠 ID 去重、未知载荷隔离 | 断连补传；无可靠 ID 不自动合并 | 待现场联调 |",
        "| EXT-MIDDLE | 提供身份、组织、权限、工作流、文件、门户和数据汇聚 | 业务适配与引用，不复制通用主数据 | 缓存只读上下文；敏感写失败关闭 | 待接口资料 |",
        "| EXT-POSITION / GIS | 提供亚米级源数据与合法地图服务 | 关联、刷新、展示，不降低源精度 | 过期位置明显标识且禁止自动调派 | 待现场联调 |", "",
        "### 3.2 字段映射与证据清单", "",
        "所有厂商字段先进入适配器映射，再转换为 `ExternalAlert`、`PositionSnapshot`、`VideoReference`、`MessageReceipt` 或 `ControlCommandResult`。映射表必须记录源字段、内部字段、类型、必填、枚举、时间语义、脱敏、缺省值和未知值策略。未取得真实资料时不在契约中猜测厂商字段。", "",
        "视频和消息关闭 ISSUE-G3-01-001 至少需要：接口文档版本、环境和账号、认证方式、真实请求/响应样例、错误码、回执终态、超时与限流、脱敏规则、连通记录，以及视频首帧≤3秒、消息正常验收通道≥20路且到达率≥99%的实测报告。", "",
        "### 3.3 四系统联动验收挂接", "",
        "KN-064 的四系统联动验收对象为视频、信息发布、物联网和统一中台。每个对象均建立“接口资料—映射评审—桩测试—目标环境连通—异常/恢复—验收记录”证据链；缺少任一目标环境证据时只能标记待验证，不得以模拟结果替代现场通过。消防、入侵、门禁和消息作为相关专业接口单独保留联调记录。", "",
        "## 4 客户端接口", "", "### 4.1 Web、大屏与 H5", "",
        "Web、大屏与嵌入既有智慧管理 APP 的 H5 共用 `/api/v1` 契约，通过权限和响应裁剪形成不同视图。H5 包不包含原生 Android/iOS 功能；宿主 APP 负责登录容器、WebView、发布和生命周期。客户端不得直连数据库、地图底层服务或外部专业系统。", "",
        "### 4.2 弱网与重复提交", "",
        "客户端为每次写操作生成稳定请求 ID；网络超时后仅允许使用同一幂等键查询或重试。服务端返回首次已确认结果，避免重复事件、任务、打卡、告警或回执。H5 上传先取得中台文件引用，再提交业务命令；文件失败时业务页面保留可重试状态，不伪造成功。", "",
        "## 5 内部端口与事件", "", "### 5.1 内部端口", "",
        "| 端口 | 输入 | 输出 | 失败语义 |", "| --- | --- | --- | --- |",
        "| IdentityPort | 中台令牌 | 用户、组织、角色、数据域 | 无法确认身份时拒绝敏感操作 |",
        "| MessagePort | 模板、接收人、变量、消息键 | 平台消息 ID 与受理状态 | 普通通知有限重试，控制动作不走此端口 |",
        "| VideoPort | 摄像头引用、模式、时间范围 | 播放引用、首帧时间、调用状态 | 不可用时返回明确降级，不保存录像 |",
        "| PositionPort | 人员引用、查询范围 | 位置、源时间、精度、新鲜度 | 过期值只展示，不参与自动调派 |",
        "| AccessControlPort | 一次性确认令牌、门标识、动作 | 联锁结果、回执状态 | 超时结果未知，禁止自动重放 |",
        "| FilePort | 文件引用或上传申请 | 文件 ID、摘要、权限元数据 | 不在本系统保存文件二进制 |",
        "| AlertSourcePort | 源系统、可靠外部 ID、归一化载荷 | 接收与去重结果 | 未知载荷隔离；无可靠 ID 不自动合并 |", "",
        "### 5.2 领域事件信封", "",
        "领域事件至少包含 `eventId`、`eventType`、`schemaVersion`、`aggregateType`、`aggregateId`、`occurredAt`、`recordedAt`、`traceId` 和 `payload`。消费者以 `eventId` 幂等；不认识的高版本字段忽略，不认识的事件类型进入隔离队列并告警。事件事实与 Outbox 同事务写入，投影和外部通知可重放但不得重复改变领域终态。", "",
        "## 6 版本、安全与变更", "", "### 6.1 版本策略", "",
        "URL 主版本固定为 v1；新增可选字段、可选响应属性和新端点可在 v1 内兼容演进。删除字段、收窄枚举、改变必填、状态语义或幂等规则属于破坏性变更，必须形成变更单、影响分析、迁移窗口和 v2 契约。弃用通过 `Deprecation`、`Sunset` 和文档公告表达，至少保留双方确认的迁移期。", "",
        "### 6.2 安全与审计", "",
        "接口只记录脱敏摘要、结果、耗时和 traceId，不记录令牌、密码、短信完整正文或不必要的个人信息。敏感读写、导出、门禁指令、预案发布、事件关闭/重开和盘点调整写审计。OpenAPI 中的示例使用虚构标识，不包含真实人员、地址、密钥或厂商凭据。", "",
        "### 6.3 契约变更流程", "",
        "1. 先修改工作稿和 OpenAPI，并建立 Issue/Change。", "2. 运行语法、引用、operationId、FR/AC 和破坏性变更检查。", "3. A/C 复核业务边界、合规、★和关键数字。", "4. 实现与契约测试同步修改，完成联调和回归。", "5. 发布新契约快照并保留旧版本迁移证据。", "",
        "## 7 需求与验收追踪", "", "### 7.1 39 FR / 117 AC 接口挂接", "",
        "下表是接口设计挂接，不替代 G3-08 最终设计 RTM，也不表示实现、联调、性能或验收已通过。每条 FR 保留三个完整 AC 锚点。", "",
        "| 设计 ID / FR / ★ | 完整 AC 锚点 | 接口或端口落点 | 后续验证入口 |", "| --- | --- | --- | --- |",
    ]
    for n in range(1, 40):
        matches = [f"{m} {p}" for m, p, _o, _t, reqs, _s in ENDPOINTS if n in reqs]
        lines.append(f"| API-TR-{n:03d}<br>{fr(n)}<br>{'非★' if n in NON_STAR else '★'} | {'；'.join(acs(n))} | {FR_NAMES[n]}：{'；'.join(matches)} | 契约测试 CT-{n:03d}；集成/验收用例 TC-{fr(n)}-01—03 |")
    lines += ["", "### 7.2 关键数字验证挂接", "",
        "| 指标 | 接口挂接 | 验证方法 | 当前结论 |", "| --- | --- | --- | --- |",
        "| 预案启动≤3秒 | `incidentsStartResponse` | 目标环境从请求受理到任务和 Outbox 提交计时 | 待实现/待测 |",
        "| 告警、定位刷新≤2秒 | 告警入站、`positionsLatest` | 注入带源时间数据，测接收与可见时间 | 待联调/待测 |",
        "| 视频首帧≤3秒 | `incidentVideosQuery` / VideoPort | 目标网络与账号下从调阅到首帧计时 | ISSUE-G3-01-001 阻断 |",
        "| 消息≥20路、到达率≥99% | MessagePort、回执入站 | 正常验收通道并发发送并按终态回执统计 | ISSUE-G3-01-001 阻断 |",
        "| 打卡≤1秒 | `attendanceCheckIn` | 身份、二维码、时空校验到事务提交计时 | 待实现/待测 |",
        "| 设备态势≤30秒、统计≤60秒 | 态势与统计查询 | 对照源时间和投影可见时间 | 待联调/待测 |", "",
        "## 8 验证、未决事项与准出", "", "### 8.1 契约验证", "",
        "OpenAPI 必须通过 YAML 解析、OpenAPI 版本、路径、operationId 唯一、局部 `$ref` 可解析、写接口幂等头、统一错误响应、安全方案和 39 FR/117 AC 引用检查。实现阶段采用契约优先：先更新契约和失败测试，再修改实现直至通过。外部适配器使用桩验证映射、超时、重复、乱序、迟到、断连补传和未知载荷。", "",
        "### 8.2 未决事项", "",
        "| 项目 | 当前处理 | 阻断关系 |", "| --- | --- | --- |",
        "| ISSUE-G3-01-001 视频/消息真实资料与证据缺失 | 内部 Schema 已定义；外部 Schema、认证、回执和性能标记待确认 | 阻断视频/消息外部契约冻结、G3-06 最终冻结和 M3 最终冻结 |",
        "| 地图坐标系、楼层编码 | 接口保留 `coordinateReference`、`floorCode`、源精度 | 阻断空间字段最终枚举与现场联调 |",
        "| 宿主 APP 版本矩阵 | H5 使用 Web 契约并保留宿主上下文边界 | 阻断兼容性最终验收，不阻断接口评审 |",
        "| 真实部署域名、证书、限流和密钥托管 | OpenAPI 使用相对/示例服务器，不写生产凭据 | 待 G3-07 ADR 与甲方环境确认 |", "",
        "### 8.3 自检结论", "",
        "本稿已形成业务 REST 契约、八类外部端口边界、版本/安全/幂等/错误约定、39 FR 与 117 AC 的接口挂接和关键数字验证入口。接口稿可进入 A/C REVIEW；`ISSUE-G3-01-001` 未关闭前不得把视频和消息的外部契约、性能或连通性标为冻结/通过。", "",
    ]
    return "\n".join(lines)


def schema_ref(name: str) -> dict:
    return {"$ref": f"#/components/schemas/{name}"}


def build_openapi() -> dict:
    doc = {
        "openapi": "3.0.3",
        "info": {
            "title": f"{PROJECT} API",
            "version": "1.0.0-review",
            "description": "G3-06 评审候选契约。内部归一化模型可评审；视频与统一消息真实外部 Schema 受 ISSUE-G3-01-001 阻断，不代表现场连通或验收通过。",
        },
        "servers": [{"url": "/", "description": "由目标环境网关提供；真实域名【待人工确认】"}],
        "security": [{"middlePlatformBearer": []}],
        "tags": [{"name": x} for x in ["预案", "事件", "任务", "态势", "资源", "物资", "演练", "值班", "知识", "配置", "中台", "集成"]],
        "paths": {},
        "components": {"securitySchemes": {"middlePlatformBearer": {"type": "http", "scheme": "bearer", "bearerFormat": "由统一中台签发；格式待接口资料确认"}}, "parameters": {}, "schemas": {}, "responses": {}},
        "x-contract-status": "REVIEW_CANDIDATE",
        "x-open-issues": ["ISSUE-G3-01-001"],
        "x-change-policy": "contract-first",
    }
    c = doc["components"]
    c["parameters"] = {
        "RequestId": {"name": "X-Request-ID", "in": "header", "required": True, "schema": {"type": "string", "minLength": 8, "maxLength": 128}, "description": "调用链请求标识"},
        "IdempotencyKey": {"name": "X-Idempotency-Key", "in": "header", "required": True, "schema": {"type": "string", "minLength": 8, "maxLength": 128}, "description": "写操作幂等键；同键异载荷返回 409"},
        "Page": {"name": "page", "in": "query", "schema": {"type": "integer", "minimum": 1, "default": 1}},
        "Size": {"name": "size", "in": "query", "schema": {"type": "integer", "minimum": 1, "maximum": 200, "default": 20}},
    }
    c["schemas"] = {
        "ApiResponse": {"type": "object", "required": ["code", "message", "traceId", "timestamp"], "properties": {"code": {"type": "string", "example": "OK"}, "message": {"type": "string", "example": "success"}, "data": {"nullable": True}, "traceId": {"type": "string", "example": "trace-demo-001"}, "timestamp": {"type": "string", "format": "date-time"}}},
        "ErrorResponse": {"type": "object", "required": ["code", "message", "traceId", "timestamp"], "properties": {"code": {"type": "string", "example": "RULE-422"}, "message": {"type": "string", "example": "状态不允许执行该操作"}, "fieldErrors": {"type": "array", "items": {"$ref": "#/components/schemas/FieldError"}}, "traceId": {"type": "string"}, "timestamp": {"type": "string", "format": "date-time"}}},
        "FieldError": {"type": "object", "properties": {"path": {"type": "string"}, "reason": {"type": "string"}}},
        "PageResponse": {
            "allOf": [
                schema_ref("ApiResponse"),
                {
                    "type": "object",
                    "properties": {
                        "data": {
                            "type": "object",
                            "required": ["items", "page", "size", "total"],
                            "properties": {
                                "items": {"type": "array", "items": {"type": "object", "additionalProperties": True}},
                                "page": {"type": "integer"},
                                "size": {"type": "integer"},
                                "total": {"type": "integer", "format": "int64"},
                            },
                        }
                    },
                },
            ]
        },
        "CommandRequest": {"type": "object", "required": ["reason"], "properties": {"reason": {"type": "string", "minLength": 1, "maxLength": 1000}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}, "occurredAt": {"type": "string", "format": "date-time"}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}, "attributes": {"type": "object", "additionalProperties": True}}},
        "CreateRequest": {"type": "object", "required": ["name"], "properties": {"name": {"type": "string", "minLength": 1, "maxLength": 200}, "typeCode": {"type": "string", "maxLength": 64}, "occurredAt": {"type": "string", "format": "date-time"}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}, "coordinateReference": {"type": "string", "description": "真实坐标系待甲方地图资料确认"}, "floorCode": {"type": "string"}, "attachmentFileIds": {"type": "array", "items": {"type": "string"}}, "attributes": {"type": "object", "additionalProperties": True}}},
        "ExternalAlert": {"type": "object", "required": ["sourceSystem", "externalAlertId", "alertType", "occurredAt", "payloadVersion"], "properties": {"sourceSystem": {"type": "string", "enum": ["INFORMATION_PUBLISH", "INTRUSION", "FIRE", "IOT", "OTHER"]}, "externalAlertId": {"type": "string", "description": "源系统可靠唯一 ID；缺失时不得自动合并"}, "alertType": {"type": "string"}, "occurredAt": {"type": "string", "format": "date-time"}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}, "payloadVersion": {"type": "string"}, "normalizedPayload": {"type": "object", "additionalProperties": True}}},
        "MessageReceipt": {"type": "object", "required": ["platformMessageId", "status", "sourceGeneratedAt"], "properties": {"platformMessageId": {"type": "string"}, "attemptNo": {"type": "integer", "minimum": 1}, "status": {"type": "string", "enum": ["ACCEPTED", "DELIVERED", "FAILED", "UNKNOWN"]}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}, "errorCode": {"type": "string"}, "errorSummary": {"type": "string"}}, "x-external-schema-status": "PENDING_EXTERNAL_EVIDENCE"},
        "VideoQuery": {"type": "object", "required": ["cameraRef", "mode"], "properties": {"cameraRef": {"type": "string"}, "mode": {"type": "string", "enum": ["LIVE", "PLAYBACK"]}, "startAt": {"type": "string", "format": "date-time"}, "endAt": {"type": "string", "format": "date-time"}}, "x-external-schema-status": "PENDING_EXTERNAL_EVIDENCE"},
        "AccessControlCommand": {"type": "object", "required": ["doorRef", "action", "confirmationToken", "reason"], "properties": {"doorRef": {"type": "string"}, "action": {"type": "string", "enum": ["REQUEST_OPEN"]}, "confirmationToken": {"type": "string", "minLength": 16}, "reason": {"type": "string", "minLength": 1}, "expiresAt": {"type": "string", "format": "date-time"}}},
    }
    c["schemas"].update({
        "PlanRequest": {"type": "object", "required": ["name", "planTypeCode"], "properties": {"name": {"type": "string", "minLength": 1, "maxLength": 200}, "planTypeCode": {"type": "string", "maxLength": 64}, "applicableConditions": {"type": "array", "items": {"type": "string"}}, "description": {"type": "string", "maxLength": 2000}}},
        "PlanVersionRequest": {
            "type": "object", "required": ["versionLabel", "nodes", "taskTemplates"],
            "properties": {
                "versionLabel": {"type": "string", "maxLength": 40},
                "nodes": {
                    "type": "array", "minItems": 1,
                    "items": {"type": "object", "required": ["nodeKey", "name"], "properties": {"nodeKey": {"type": "string"}, "name": {"type": "string"}, "dependsOn": {"type": "array", "items": {"type": "string"}}}},
                },
                "taskTemplates": {
                    "type": "array", "minItems": 1,
                    "items": {"type": "object", "required": ["templateKey", "name", "responsibleRole"], "properties": {"templateKey": {"type": "string"}, "name": {"type": "string"}, "responsibleRole": {"type": "string"}, "deadlineMinutes": {"type": "integer", "minimum": 1}}},
                },
                "verificationConfigId": {"type": "string"},
            },
        },
        "IncidentCreateRequest": {"type": "object", "required": ["incidentTypeCode", "title", "occurredAt", "description"], "properties": {"incidentTypeCode": {"type": "string"}, "title": {"type": "string", "minLength": 1, "maxLength": 200}, "description": {"type": "string", "minLength": 1, "maxLength": 5000}, "occurredAt": {"type": "string", "format": "date-time"}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}, "sourceSystem": {"type": "string"}, "externalAlertId": {"type": "string"}, "location": {"$ref": "#/components/schemas/SpatialReference"}, "attachmentFileIds": {"type": "array", "items": {"type": "string"}}}},
        "IncidentUpdateRequest": {"type": "object", "required": ["content", "occurredAt"], "properties": {"content": {"type": "string", "minLength": 1, "maxLength": 5000}, "occurredAt": {"type": "string", "format": "date-time"}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}, "attachmentFileIds": {"type": "array", "items": {"type": "string"}}}},
        "VerifyIncidentRequest": {"type": "object", "required": ["decision", "reason", "resourceVersion"], "properties": {"decision": {"type": "string", "enum": ["CONFIRMED", "REJECTED"]}, "reason": {"type": "string", "minLength": 1, "maxLength": 1000}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}}},
        "StartResponseRequest": {"type": "object", "required": ["planVersionId", "resourceVersion"], "properties": {"planVersionId": {"type": "string"}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}, "reason": {"type": "string", "maxLength": 1000}}},
        "TaskRequest": {"type": "object", "required": ["name", "assigneeRef", "deadlineAt"], "properties": {"name": {"type": "string", "minLength": 1, "maxLength": 200}, "assigneeRef": {"type": "string"}, "deadlineAt": {"type": "string", "format": "date-time"}, "description": {"type": "string", "maxLength": 3000}}},
        "TaskFeedbackRequest": {"type": "object", "required": ["content", "resourceVersion"], "properties": {"content": {"type": "string", "minLength": 1, "maxLength": 3000}, "progressPercent": {"type": "integer", "minimum": 0, "maximum": 100}, "attachmentFileIds": {"type": "array", "items": {"type": "string"}}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}}},
        "TaskReassignRequest": {"type": "object", "required": ["newAssigneeRef", "reason", "resourceVersion"], "properties": {"newAssigneeRef": {"type": "string"}, "reason": {"type": "string", "minLength": 1, "maxLength": 1000}, "newDeadlineAt": {"type": "string", "format": "date-time", "description": "缺省时保持原截止时间；变更须具备授权并审计"}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}}},
        "SpatialReference": {"type": "object", "properties": {"coordinateReference": {"type": "string", "description": "真实坐标系待甲方资料确认"}, "floorCode": {"type": "string"}, "longitude": {"type": "number", "format": "double"}, "latitude": {"type": "number", "format": "double"}, "x": {"type": "number", "format": "double"}, "y": {"type": "number", "format": "double"}, "sourceAccuracyMeters": {"type": "number", "format": "double", "minimum": 0}, "sourceGeneratedAt": {"type": "string", "format": "date-time"}}},
        "MaterialLedgerRequest": {"type": "object", "required": ["siteId", "materialCode", "quantity", "unit", "resourceVersion"], "properties": {"siteId": {"type": "string"}, "materialCode": {"type": "string"}, "quantity": {"type": "number", "format": "double", "minimum": 0}, "unit": {"type": "string"}, "expiresAt": {"type": "string", "format": "date-time"}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}}},
        "InventoryPlanRequest": {"type": "object", "required": ["name", "siteIds"], "properties": {"name": {"type": "string", "minLength": 1}, "siteIds": {"type": "array", "minItems": 1, "items": {"type": "string"}}, "startsAt": {"type": "string", "format": "date-time"}, "endsAt": {"type": "string", "format": "date-time"}}},
        "InventoryRecordRequest": {"type": "object", "required": ["snapshotItemId", "actualQuantity"], "properties": {"snapshotItemId": {"type": "string"}, "actualQuantity": {"type": "number", "format": "double", "minimum": 0}, "attachmentFileIds": {"type": "array", "items": {"type": "string"}}, "remark": {"type": "string", "maxLength": 1000}}},
        "InventoryReviewRequest": {"type": "object", "required": ["decision", "reason", "resourceVersion"], "properties": {"decision": {"type": "string", "enum": ["APPROVE_ADJUSTMENT", "REJECT"]}, "reason": {"type": "string", "minLength": 1}, "resourceVersion": {"type": "integer", "format": "int64", "minimum": 0}}},
        "DrillPlanRequest": {"type": "object", "required": ["name", "plannedAt", "frequencyRule"], "properties": {"name": {"type": "string", "minLength": 1}, "plannedAt": {"type": "string", "format": "date-time"}, "frequencyRule": {"type": "string"}, "responsibleGroupId": {"type": "string"}, "relatedOriginalPlanId": {"type": "string", "description": "补演时关联原计划"}}},
        "DrillExecutionRequest": {"type": "object", "required": ["actualStartAt", "actualEndAt", "result"], "properties": {"actualStartAt": {"type": "string", "format": "date-time"}, "actualEndAt": {"type": "string", "format": "date-time"}, "result": {"type": "string", "enum": ["COMPLETED", "CANCELLED", "INCOMPLETE"]}, "attachmentFileIds": {"type": "array", "items": {"type": "string"}}, "reason": {"type": "string"}}},
        "AttendanceCheckInRequest": {"type": "object", "required": ["taskId", "checkPointId", "qrToken", "position"], "properties": {"taskId": {"type": "string"}, "checkPointId": {"type": "string"}, "qrToken": {"type": "string", "minLength": 16}, "position": {"$ref": "#/components/schemas/SpatialReference"}, "clientRecordedAt": {"type": "string", "format": "date-time"}}},
        "FilePresignRequest": {"type": "object", "required": ["fileName", "contentType", "size"], "properties": {"fileName": {"type": "string", "minLength": 1}, "contentType": {"type": "string"}, "size": {"type": "integer", "format": "int64", "minimum": 1}, "sha256": {"type": "string", "pattern": "^[0-9a-fA-F]{64}$"}}},
        "VerificationConfigRequest": {
            "type": "object", "required": ["name", "steps"],
            "properties": {
                "name": {"type": "string", "minLength": 1},
                "steps": {
                    "type": "array", "minItems": 1,
                    "items": {
                        "type": "object", "required": ["stepKey", "handlerRole", "timeoutMinutes"],
                        "properties": {
                            "stepKey": {"type": "string"}, "handlerRole": {"type": "string"},
                            "fallbackRole": {"type": "string"},
                            "timeoutMinutes": {"type": "integer", "minimum": 1},
                        },
                    },
                },
            },
        },
        "Entity": {"type": "object", "required": ["id", "status", "version", "createdAt", "updatedAt"], "properties": {"id": {"type": "string"}, "status": {"type": "string"}, "version": {"type": "integer", "format": "int64"}, "createdAt": {"type": "string", "format": "date-time"}, "updatedAt": {"type": "string", "format": "date-time"}, "attributes": {"type": "object", "additionalProperties": True}}},
        "EntityResponse": {"allOf": [schema_ref("ApiResponse"), {"type": "object", "properties": {"data": schema_ref("Entity")}}]},
    })
    for status, desc in [("400", "请求格式错误"), ("401", "未认证"), ("403", "无权限"), ("404", "资源不存在"), ("409", "状态、版本或幂等冲突"), ("422", "业务规则校验失败"), ("429", "超过限流"), ("500", "服务内部错误"), ("503", "外部依赖不可用")]:
        c["responses"][f"Error{status}"] = {"description": desc, "content": {"application/json": {"schema": schema_ref("ErrorResponse")}}}

    read_methods = {"GET"}
    special_bodies = {
        "integrationAlertsReceive": "ExternalAlert", "messageReceiptsReceive": "MessageReceipt",
        "incidentVideosQuery": "VideoQuery", "accessCommandsCreate": "AccessControlCommand",
        "plansCreate": "PlanRequest", "planVersionsCreate": "PlanVersionRequest",
        "incidentsCreate": "IncidentCreateRequest", "incidentUpdatesCreate": "IncidentUpdateRequest",
        "incidentsVerify": "VerifyIncidentRequest", "incidentsStartResponse": "StartResponseRequest",
        "tasksCreateTemporary": "TaskRequest", "taskFeedbackCreate": "TaskFeedbackRequest",
        "tasksReassign": "TaskReassignRequest", "materialLedgersUpsert": "MaterialLedgerRequest",
        "inventoryPlansCreate": "InventoryPlanRequest", "inventoryRecordsSubmit": "InventoryRecordRequest",
        "inventoryPlansReview": "InventoryReviewRequest", "drillPlansCreate": "DrillPlanRequest",
        "drillExecutionsSubmit": "DrillExecutionRequest", "attendanceCheckIn": "AttendanceCheckInRequest",
        "platformFilesPresign": "FilePresignRequest", "verificationConfigsPublish": "VerificationConfigRequest",
    }
    for method, path, op, tag, reqs, summary in ENDPOINTS:
        item = doc["paths"].setdefault(path, {})
        operation = {
            "tags": [tag], "summary": summary, "operationId": op,
            "parameters": [{"$ref": "#/components/parameters/RequestId"}],
            "responses": {"200": {"description": "成功", "content": {"application/json": {"schema": schema_ref("PageResponse" if method == "GET" and path.endswith(("plans", "incidents", "tasks", "persons", "groups", "material-sites", "material-ledgers", "records", "alerts", "knowledge-items")) else "EntityResponse")}}}},
            "x-requirements": [fr(n) for n in reqs],
            "x-acceptance": [ac for n in reqs for ac in acs(n)],
            "x-contract-status": "REVIEW_CANDIDATE",
        }
        if "{source}" in path:
            operation["parameters"].append({"name": "source", "in": "path", "required": True, "schema": {"type": "string", "enum": ["information-publish", "intrusion", "fire", "iot", "other"]}})
        for pname in re.findall(r"\{([^}]+)\}", path):
            if pname == "source":
                continue
            operation["parameters"].append({"name": pname, "in": "path", "required": True, "schema": {"type": "string", "minLength": 1}})
        if method == "GET":
            operation["parameters"].extend([{"$ref": "#/components/parameters/Page"}, {"$ref": "#/components/parameters/Size"}])
        else:
            operation["parameters"].append({"$ref": "#/components/parameters/IdempotencyKey"})
            command_words = ["publish", "verify", "start", "close", "reopen", "acknowledge", "complete", "reassign", "remind", "review", "issue", "submit", "evaluate", "checkin"]
            default_body = "CommandRequest" if any(x in op.lower() for x in command_words) else "CreateRequest"
            body_schema = special_bodies.get(op, default_body)
            operation["requestBody"] = {
                "required": True,
                "content": {"application/json": {"schema": schema_ref(body_schema)}},
            }
        for status in ["400", "401", "403", "404", "409", "422", "429", "500", "503"]:
            operation["responses"][status] = {"$ref": f"#/components/responses/Error{status}"}
        if op in {"messageReceiptsReceive", "incidentVideosQuery"}:
            operation["x-external-schema-status"] = "PENDING_EXTERNAL_EVIDENCE"
            operation["x-blocked-by"] = "ISSUE-G3-01-001"
        if op == "accessCommandsCreate":
            operation["x-retry-policy"] = "NO_AUTOMATIC_REPLAY"
        item[method.lower()] = operation
    return doc


def parse_blocks(text: str):
    lines = text.splitlines(); i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line or line.startswith(("- 任务：", "- 文档编号：", "- 版本：", "- 主责", "- 状态：", "- 项目：", "- 受控输入：")):
            i += 1; continue
        if line.startswith("# "):
            i += 1; continue
        if line.startswith("## "):
            yield "h1", line[3:]; i += 1; continue
        if line.startswith("### "):
            yield "h2", line[4:]; i += 1; continue
        if line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|\s*[-:]+", lines[i + 1]):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([re.sub(r"<br\s*/?>", "\n", re.sub(r"[`*]", "", c.strip()), flags=re.I) for c in lines[i].strip().strip("|").split("|")]); i += 1
            yield "table", [rows[0]] + rows[2:]; continue
        m = re.match(r"^(\d+)\.\s+(.*)", line)
        if m:
            yield "list", m.group(2); i += 1; continue
        para = [line]; i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", "|")) and not re.match(r"^\d+\.\s+", lines[i]):
            para.append(lines[i].strip()); i += 1
        yield "p", " ".join(para)


def copy_para_format(dst, src):
    if src._p.pPr is not None:
        if dst._p.pPr is not None:
            dst._p.remove(dst._p.pPr)
        dst._p.insert(0, copy.deepcopy(src._p.pPr))


def copy_run_format(dst, src):
    if src is not None and src._r.rPr is not None:
        if dst._r.rPr is not None:
            dst._r.remove(dst._r.rPr)
        dst._r.insert(0, copy.deepcopy(src._r.rPr))


def add_inline(p, text, sample):
    for part in re.split(r"(`[^`]+`|\*\*[^*]+\*\*)", text):
        if not part:
            continue
        shown = part[1:-1] if part.startswith("`") else part[2:-2] if part.startswith("**") else part
        r = p.add_run(shown); copy_run_format(r, sample)
        if part.startswith("`"):
            r.font.name = "Consolas"; r.font.size = Pt(9)
        if part.startswith("**"):
            r.bold = True


def replace_text(paragraph, text, sample):
    paragraph.clear(); add_inline(paragraph, text, sample.runs[0] if sample.runs else None)


def copy_cell_format(dst, src):
    dst_pr = dst._tc.get_or_add_tcPr(); src_pr = src._tc.tcPr
    for child in list(dst_pr):
        if child.tag != qn("w:tcW"):
            dst_pr.remove(child)
    if src_pr is not None:
        for child in src_pr:
            if child.tag != qn("w:tcW"):
                dst_pr.append(copy.deepcopy(child))


def restore_reference_parts(output: Path):
    parts = {"word/styles.xml", "word/stylesWithEffects.xml", "word/numbering.xml", "word/settings.xml", "word/fontTable.xml", "word/webSettings.xml", "word/theme/theme1.xml", "word/header1.xml", "word/footer1.xml"}
    temp = output.with_suffix(".pair-tmp.docx")
    with zipfile.ZipFile(output) as out_zip, zipfile.ZipFile(REFERENCE) as ref_zip, zipfile.ZipFile(temp, "w", zipfile.ZIP_DEFLATED) as new_zip:
        ref_names = set(ref_zip.namelist())
        for name in out_zip.namelist():
            new_zip.writestr(name, ref_zip.read(name) if name in parts and name in ref_names else out_zip.read(name))
    os.replace(temp, output)


def build_docx():
    shutil.copy2(REFERENCE, OUTPUT_DOCX)
    d = Document(OUTPUT_DOCX); refdoc = Document(REFERENCE)
    body = d._element.body; sectpr = body.sectPr
    start = d.paragraphs[20]._p
    removing = False
    for child in list(body):
        if child is start:
            removing = True
        if removing and child is not sectpr:
            body.remove(child)
    cover = {
        0: "文档编号：YJGL-G3-06　　版本号：V0.1（评审稿）", 1: "密　　级：内部 · 评审用",
        3: PROJECT, 4: "接口设计说明书", 5: "（G3-06 评审稿）",
        7: "编制单位：020202项目组【待人工确认】", 8: "编　　制：B（技术主责）【待人工确认】",
        9: "审　　核：A、C【待复核】", 10: "批　　准：【待人工确认】", 11: "编制日期：2026 年 9 月 18 日",
        14: "注：本表记录接口设计受控版本沿革；视频与统一消息真实外部 Schema 受 ISSUE-G3-01-001 阻断。",
    }
    for idx, value in cover.items():
        replace_text(d.paragraphs[idx], value, refdoc.paragraphs[idx])
    rev = d.tables[0]
    while len(rev.rows) > 2:
        rev._tbl.remove(rev.rows[-1]._tr)
    vals = ["V0.1", "2026-09-18", "全部", "形成接口说明书与 OpenAPI v1 评审候选", "B【待人工确认】"]
    for i, value in enumerate(vals):
        replace_text(rev.rows[1].cells[i].paragraphs[0], value, refdoc.tables[0].rows[1].cells[i].paragraphs[0])
    h1s, h2s, bodys, lists = refdoc.paragraphs[20], refdoc.paragraphs[22], refdoc.paragraphs[21], refdoc.paragraphs[26]
    caps = refdoc.paragraphs[23]
    sample_table = refdoc.tables[1]
    chapter = 0; table_no = 0; current = ""
    for kind, payload in parse_blocks(WORK_MD.read_text(encoding="utf-8")):
        if kind == "h1":
            chapter += 1; table_no = 0; current = payload
            p = d.add_paragraph(style="Heading 1"); copy_para_format(p, h1s); add_inline(p, payload, h1s.runs[0] if h1s.runs else None)
        elif kind == "h2":
            current = payload
            p = d.add_paragraph(style="Heading 2"); copy_para_format(p, h2s); add_inline(p, payload, h2s.runs[0] if h2s.runs else None)
        elif kind == "p":
            p = d.add_paragraph(); copy_para_format(p, bodys); add_inline(p, payload, bodys.runs[0] if bodys.runs else None)
        elif kind == "list":
            p = d.add_paragraph(style="List Paragraph"); copy_para_format(p, lists); add_inline(p, "• " + payload, lists.runs[0] if lists.runs else None)
        elif kind == "table":
            table_no += 1
            cap = d.add_paragraph(); copy_para_format(cap, caps); cap.paragraph_format.keep_with_next = True
            title = re.sub(r"^\d+(?:\.\d+)?\s*", "", current)
            add_inline(cap, f"表 {chapter}-{table_no} {title}", caps.runs[0] if caps.runs else None)
            rows = payload; t = d.add_table(rows=1, cols=len(rows[0]))
            if sample_table._tbl.tblPr is not None:
                t._tbl.remove(t._tbl.tblPr); t._tbl.insert(0, copy.deepcopy(sample_table._tbl.tblPr))
            for ri, values in enumerate(rows):
                cells = t.rows[0].cells if ri == 0 else t.add_row().cells
                for ci, value in enumerate(values):
                    cells[ci].text = value
                    source_cell = sample_table.rows[0 if ri == 0 else min(1, len(sample_table.rows)-1)].cells[min(ci, len(sample_table.columns)-1)]
                    copy_cell_format(cells[ci], source_cell)
                    for p in cells[ci].paragraphs:
                        copy_para_format(p, source_cell.paragraphs[0])
                        for run in p.runs:
                            copy_run_format(run, source_cell.paragraphs[0].runs[0] if source_cell.paragraphs[0].runs else None)
                            if ri == 0: run.bold = True
                trpr = cells[0]._tc.getparent().get_or_add_trPr(); trpr.append(OxmlElement("w:cantSplit"))
                if ri == 0: trpr.append(OxmlElement("w:tblHeader"))
            widths = {4: [2.7, 4.0, 4.1, 4.4], 5: [1.2, 4.4, 3.1, 3.5, 3.0]}.get(len(rows[0]), [15.2 / len(rows[0])] * len(rows[0]))
            for row in t.rows:
                for ci, cell in enumerate(row.cells):
                    cell.width = Cm(widths[ci])
    d.core_properties.title = "接口设计说明书"
    d.core_properties.subject = f"{PROJECT} G3-06"
    d.core_properties.author = "020202项目组"
    d.save(OUTPUT_DOCX)
    restore_reference_parts(OUTPUT_DOCX)


def build_sources():
    WORK_MD.write_text(build_markdown(), encoding="utf-8")
    api = build_openapi()
    text = "# G3-06 接口契约评审候选；外部视频/消息真实 Schema 受 ISSUE-G3-01-001 阻断。\n" + yaml.safe_dump(api, allow_unicode=True, sort_keys=False, width=120)
    WORK_YAML.write_text(text, encoding="utf-8")
    shutil.copy2(WORK_YAML, OUTPUT_YAML)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sources-only", action="store_true")
    parser.add_argument("--docx-only", action="store_true")
    args = parser.parse_args()
    if not args.docx_only:
        build_sources()
    if not args.sources_only:
        build_docx()
    print(WORK_MD)
    print(OUTPUT_YAML)
    if not args.sources_only:
        print(OUTPUT_DOCX)
