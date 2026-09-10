# G1-01 条款清单与来源定位工作稿

- 主责：C；复核：B；版本：0.2；状态：`ACCEPTED_AS_BASELINE_INPUT / G1-05_MAPPED`
- P1：`docs/用户需求书-03-应急管理子系统.docx`，SHA-256 `045F1E4083AF5D7CB8C3A18451A6D4F173D1F5F5B85EE7187D989CA36037B28A`，Word 渲染 24 页。
- P2：`docs/通关实验任务书1-立项竞标.pdf`，SHA-256 `8093C40786FC20F6390B59716F03FCE3CCF37AD1B83DE480B5C2EEA2C90E70E6`，4 页。
- 定位规则：优先采用章节、表名、FR/PE/里程碑等稳定锚点；页码仅辅助。`VERIFIED` 表示忠实取自原文，不代表 B 已复核；`RESOLVED_BY_SIMULATED_CLARIFICATION` 表示需求歧义已有课程模拟裁决，但技术能力未验收且仍待 B 复核。裁决证据见 `G1-01_clarification_record.md`。

## A. 项目、目标、范围与总体技术

| 稳定编号 | 忠实摘要 | 原文定位 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| REQ-PROJ-001 | 项目名称与招标文件性质 | P1 封面；CLR-012 | RESOLVED_BY_SIMULATED_CLARIFICATION | 使用正式匿名称；待 B 复核 |
| REQ-PROJ-002 | 人员密集与文物保护双重对象、复合突发事件背景 | P1 §1.1 前2段 | VERIFIED | 背景事实 |
| REQ-PROJ-003 | 现状痛点：预案、调度、资源、演练值班、事件闭环五类 | P1 §1.1（1）—（5） | VERIFIED | 不引入外部数据 |
| REQ-PROJ-004 | 建设四阶段融合指挥中心 | P1 §1.1 末段 | VERIFIED | 事前/事发/事中/事后 |
| REQ-GOAL-001 | 总体目标：预案、资源、演练、事件、值班闭环与多系统联动 | P1 §1.2.1 | VERIFIED | — |
| REQ-GOAL-002 | 9 项具体建设目标 | P1 §1.2.2（1）—（9） | VERIFIED | 数字转 KN-003 |
| REQ-PRINCIPLE-001 | 实用实效 | P1 §1.3（1） | VERIFIED | — |
| REQ-PRINCIPLE-002 | 平战结合 | P1 §1.3（2） | VERIFIED | — |
| REQ-PRINCIPLE-003 | 融合联动且避免重复建设 | P1 §1.3（3） | VERIFIED | — |
| REQ-PRINCIPLE-004 | 标准规范 | P1 §1.3（4） | VERIFIED | — |
| REQ-PRINCIPLE-005 | 安全可靠、连续运行、后备电源 | P1 §1.3（5） | VERIFIED | KN-004 |
| REQ-PRINCIPLE-006 | 开放可扩展、配置化、标准接口 | P1 §1.3（6） | VERIFIED | — |
| REQ-ROLE-001 | 8 类角色及职责/主要功能 | P1 §1.4 角色表 | VERIFIED | 含第三方系统 |
| REQ-SCOPE-001 | Web、移动、接口、文档和培训；11 个模块 | P1 §3.1 表 | VERIFIED | F-01—F-11 |
| REQ-OOS-001 | 既有安防等前端硬件及子系统自身建设改造范围外 | P1 §3.2（1） | VERIFIED | 接口仍在范围内 |
| REQ-OOS-002 | 应急物资、安防终端、定位基站采购范围外 | P1 §3.2（2）；CLR-002 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方提供定位基础设施和验收源数据；技术验证待 B 复核 |
| REQ-OOS-003 | 机房、服务器、网络采购范围外，甲方自备 | P1 §3.2（3）；CLR-008 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方另提供域名证书、备份介质、后备电源；乙方提交最低配置和部署方案 |
| REQ-OOS-004 | 政府应急平台专线范围外，系统预留标准接口 | P1 §3.2（4） | VERIFIED | — |
| REQ-REL-001 | 视频实时调阅/历史回放，录像保存≥30天 | P1 §3.3（1）；CLR-001 | RESOLVED_BY_SIMULATED_CLARIFICATION | 历史回放为强制；既有视频系统负责存储及保存，乙方负责接口回放与验证；技术验证待 B 复核 |
| REQ-REL-002 | 信息发布一键发布疏散指引/公告 | P1 §3.3（2）；CLR-010 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方提供/协调接口条件，乙方逐接口适配验证 |
| REQ-REL-003 | 入侵/门禁/消防告警转事件，疏散门禁开启 | P1 §3.3（3）；CLR-003、010 | RESOLVED_BY_SIMULATED_CLARIFICATION | 门禁联动“应支持”；授权确认、安全联锁、失败告警与人工降级待 B 复核 |
| REQ-REL-004 | 物联网提供设备告警和客流 | P1 §3.3（4）；CLR-010 | RESOLVED_BY_SIMULATED_CLARIFICATION | 接口条件由甲方提供/协调，乙方适配验证 |
| REQ-REL-005 | 中台提供身份、组织、权限、消息、工作流、文件存储、门户和数据汇聚 | P1 §3.3（5）；CLR-005 | RESOLVED_BY_SIMULATED_CLARIFICATION | 乙方仅做业务适配；能力待技术验证 |
| REQ-REL-006 | 复用 APP/短信平台消息通道 | P1 §3.3（6）；CLR-004 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方提供通道/账号/签名/配额；乙方调用、并发、重试、回执、留痕 |
| REQ-FLOW-001 | 预案闭环端到端流程 | P1 §3.4（1） | VERIFIED | — |
| REQ-FLOW-002 | 演练全流程 | P1 §3.4（2） | VERIFIED | — |
| REQ-FLOW-003 | 值班打卡流程 | P1 §3.4（3） | VERIFIED | — |
| REQ-FLOW-004 | 事件接报处置闭环 | P1 §3.4（4） | VERIFIED | — |
| REQ-FLOW-005 | 物资盘点流程 | P1 §3.4（5） | VERIFIED | — |
| REQ-ARCH-001 | 数据/支撑/服务/应用四层总体架构 | P1 §4.1（1）—（4）；CLR-005 | RESOLVED_BY_SIMULATED_CLARIFICATION | 中台通用能力由甲方提供，乙方业务适配 |
| REQ-ARCH-002 | 投标方案给总体架构图、部署图和技术选型理由 | P1 §4.1 末段 | VERIFIED | — |
| REQ-DEPLOY-001 | 甲方内部私有环境、Linux 64位或认可国产OS | P1 §4.2（1）；CLR-008 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方提供基础环境，乙方提交最低配置与部署方案 |
| REQ-DEPLOY-002 | 连续运行及后备电源关键功能 | P1 §4.2（2）；CLR-008 | RESOLVED_BY_SIMULATED_CLARIFICATION | 后备电源由甲方提供，连续性待技术验证 |
| REQ-DEPLOY-003 | ★容器化一键部署、脚本/文档、≤2小时 | P1 §4.2（3） | VERIFIED | KN-005 |
| REQ-DEPLOY-004 | Web浏览器；移动端采用 H5 嵌入既有智慧管理 APP | P1 §4.2（4）；CLR-007 | RESOLVED_BY_SIMULATED_CLARIFICATION | 交付 H5 包；甲方负责宿主 APP 和发布；集成待技术验证 |
| REQ-TECH-001 | 主流开放成熟框架，不绑定单一不可替换闭源组件 | P1 §4.3（1） | VERIFIED | — |
| REQ-TECH-002 | 二维/三维/楼层地图加载、标注、拾取 | P1 §4.3（2）；CLR-006 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方提供地图/服务和合法使用权；乙方不负责测绘或三维建模 |
| REQ-TECH-003 | 视频应支持 GB/T 28181；厂商 SDK/ONVIF 为宜 | P1 §4.3（3） | VERIFIED | 保留强度 |
| REQ-TECH-004 | 统一消息 APP/短信，≥20路并行 | P1 §4.3（4）；CLR-004 | RESOLVED_BY_SIMULATED_CLARIFICATION | 正常验收通道验证；技术能力未验收 |
| REQ-TECH-005 | 离线安装、无运行时在线激活、开源许可证合规 | P1 §4.3（5） | VERIFIED | — |
| REQ-TECH-006 | 北京时间 UTC+8、ISO 8601 时间戳 | P1 §4.3（6） | VERIFIED | — |
| REQ-KEYTECH-001 | 预案并行处理保证≤3秒 | P1 §4.4（1） | VERIFIED | KN-003 |
| REQ-KEYTECH-002 | 消息重试/回执保证≥99% | P1 §4.4（2）；CLR-004 | RESOLVED_BY_SIMULATED_CLARIFICATION | 责任已澄清，消息性能仍待验证 |
| REQ-KEYTECH-003 | 人员≤2秒刷新、视频、物资地图聚合 | P1 §4.4（3）；CLR-002、006 | RESOLVED_BY_SIMULATED_CLARIFICATION | 甲方提供源能力，乙方适配；定位与地图仍待验证 |
| REQ-KEYTECH-004 | 流程/模板配置化且无需改代码 | P1 §4.4（4） | VERIFIED | — |
| REQ-KEYTECH-005 | 跨系统容错、超时、降级 | P1 §4.4（5） | VERIFIED | — |
| REQ-KEYTECH-006 | 二维码/地理围栏防作弊 | P1 §4.4（6） | VERIFIED | — |

## B. 法规标准与解释规则

| 稳定编号 | 法规/标准 | 原文定位 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| STD-001 | WW/T 0111-2023 | P1 §2（1） | VERIFIED | 博物馆公共安全应急管理 |
| STD-002 | GB/T 29639-2020 | §2（2） | VERIFIED | 应急预案编制 |
| STD-003 | YJ/T 9007-2019（原AQ/T） | §2（3） | VERIFIED | 演练基本规范 |
| STD-004 | AQ/T 9009-2015 | §2（4） | VERIFIED | 演练评估 |
| STD-005 | GB 50348-2018 | §2（5） | VERIFIED | 安全防范工程 |
| STD-006 | GA 27-2002 | §2（6） | VERIFIED | 博物馆风险/防护级别 |
| STD-007 | GB/T 16571-2012 | §2（7） | VERIFIED | 文博安防系统 |
| STD-008 | GB/T 28181（不注日期） | §2（8） | VERIFIED | 适用最新版本规则 |
| STD-009 | GB/T 22239-2019 | §2（9） | VERIFIED | 等保基本要求 |
| STD-010 | GB/T 25000.10-2016 | §2（10） | VERIFIED | 质量模型 |
| STD-011 | GB/T 25000.51-2016 | §2（11） | VERIFIED | RUSP质量/测试 |
| STD-012 | GB/T 8567-2006 | §2（12） | VERIFIED | 软件文档 |
| STD-013 | GB/T 9385-2008 | §2（13） | VERIFIED | 需求规格 |
| STD-014 | GB/T 15532-2008 | §2（14） | VERIFIED | 软件测试 |
| STD-015 | GB/T 11457-2006 | §2（15） | VERIFIED | 软件工程术语 |
| STD-016 | 中华人民共和国突发事件应对法 | §2（16） | VERIFIED | — |
| STD-017 | 突发事件应急预案管理办法（国办发〔2024〕5号） | §2（17） | VERIFIED | — |
| STD-018 | 突发事件应急演练指南（应急办函〔2009〕62号） | §2（18） | VERIFIED | — |
| STD-019 | 博物馆安全保卫工作规定 | §2（19） | VERIFIED | — |
| STD-020 | 关于加强博物馆安全工作的通知（公通字〔2011〕33号） | §2（20） | VERIFIED | — |
| STD-RULE-001 | 注日期用指定版；不注日期用最新版 | §2 首段 | VERIFIED | — |
| STD-RULE-002 | 应/宜/可及★解释规则 | §2 倒数2段、§5首段 | VERIFIED | ★不许负偏离 |
| STD-RULE-003 | 标准冲突取较高，歧义由甲方书面澄清 | §2 末段 | VERIFIED | 本任务不自行裁决 |

## C. 功能需求

表 5-1 共 39 条，34 条★；详细忠实摘要在 `control/facts.md` 的 F-100—F-138。以下每行定位均为“P1 表5-1 + §5对应模块详细要求/验收要点”。

| 稳定编号 | 名称 | ★ | 状态/备注 |
| --- | --- | --- | --- |
| FR-01.1 | 应急预案编制 | ★ | VERIFIED |
| FR-01.2 | 处置流程配置 | ★ | VERIFIED |
| FR-01.3 | 应急处置任务管理 | ★ | VERIFIED；KN-003 |
| FR-01.4 | 预案附件与预案库 | 否 | VERIFIED |
| FR-02.1 | 事件救援动态监控 | ★ | VERIFIED |
| FR-02.2 | 周边人员位置监控 | ★ | RESOLVED_BY_SIMULATED_CLARIFICATION；CLR-002；技术/现场验证待 B 复核 |
| FR-02.3 | 视频联动查看 | ★ | RESOLVED_BY_SIMULATED_CLARIFICATION；CLR-001；历史回放按强制要求，技术验证待 B 复核 |
| FR-02.4 | 物资站点与配置 | 否 | VERIFIED |
| FR-03.1 | 应急人员管理 | ★ | VERIFIED |
| FR-03.2 | 应急值班计划 | 否 | VERIFIED |
| FR-03.3 | 应急物资管理 | ★ | VERIFIED |
| FR-03.4 | 物资盘点计划执行 | ★ | VERIFIED |
| FR-04.1 | 演练计划管理 | ★ | VERIFIED |
| FR-04.2 | 演练任务自动下发 | ★ | VERIFIED |
| FR-04.3 | 演练执行与评估 | ★ | VERIFIED |
| FR-05.1 | 事件发起与列表 | ★ | VERIFIED |
| FR-05.2 | 核实审批与生命周期 | ★ | VERIFIED |
| FR-05.3 | 应急任务下发 | ★ | VERIFIED |
| FR-05.4 | 事故调查与报告 | ★ | VERIFIED |
| FR-06.1 | 打卡小组 | ★ | VERIFIED |
| FR-06.2 | 打卡点位 | ★ | VERIFIED |
| FR-06.3 | 就位统计 | ★ | VERIFIED |
| FR-06.4 | 打卡预警 | ★ | RESOLVED_BY_SIMULATED_CLARIFICATION；CLR-004；消息通道待验证 |
| FR-07.1 | 预案类型 | 否 | VERIFIED |
| FR-07.2 | 事件类型 | ★ | VERIFIED |
| FR-07.3 | 物资站点 | ★ | VERIFIED |
| FR-07.4 | 评估模板 | ★ | VERIFIED |
| FR-07.5 | 核实审批流程 | ★ | VERIFIED |
| FR-08.1 | 移动事件 | ★ | VERIFIED |
| FR-08.2 | 移动任务 | ★ | RESOLVED_BY_SIMULATED_CLARIFICATION；CLR-004、007；消息与 H5 集成待验证 |
| FR-08.3 | 移动知识库 | 否 | VERIFIED |
| FR-08.4 | 移动演练 | ★ | VERIFIED |
| FR-08.5 | 移动打卡 | ★ | VERIFIED |
| FR-08.6 | 移动物资盘点 | ★ | VERIFIED |
| FR-09.1 | 应急信息统计 | ★ | VERIFIED |
| FR-10.1 | 综合安防显示 | ★ | VERIFIED |
| FR-11.1 | 物联网对接 | ★ | VERIFIED_WITH_DEPENDENCY |
| FR-11.2 | 中台对接 | ★ | RESOLVED_BY_SIMULATED_CLARIFICATION；CLR-005；业务适配待验证 |
| FR-11.3 | 视频与信息发布对接 | ★ | RESOLVED_BY_SIMULATED_CLARIFICATION；CLR-001、003；视频回放强制、门禁“应支持”，待 B 复核 |

## D. 数据、非功能与接口条款

| 稳定编号 | 忠实摘要 | 原文定位 | 状态/备注 |
| --- | --- | --- | --- |
| DATA-FMT-001—009 | 九类数据内容与格式 | P1 §6.1 表9行 | VERIFIED |
| DATA-SCALE-001 | ≥50预案、≥200任务模板 | §6.2（1） | VERIFIED |
| DATA-SCALE-002 | 年200起/每起10任务；≥10年、2万事件、20万任务 | §6.2（2） | VERIFIED |
| DATA-SCALE-003 | ≥300人、30站点、1000物资项、100打卡点 | §6.2（3） | VERIFIED |
| DATA-SCALE-004 | 日200人次、年7.3万、在线≥3年 | §6.2（4） | VERIFIED |
| DATA-SCALE-005 | 日常30—50、应急并发≥100、消息≥20路 | §6.2（5） | VERIFIED |
| DATA-SEC-001—005 | 内部保存、权限/审计、防篡改/期限、加密鉴权、日增量周全量备份 | §6.3（1）—（5） | VERIFIED |
| NFR-FUNC-001—003 | 覆盖/正确性100%，关键操作≤3跳 | §7.1（1）—（3） | VERIFIED |
| PE-01—PE-12 | 12项性能指标 | §7.2 表 | VERIFIED | 全量数字见 KN-003、006—012、016—017、028、034—037 |
| NFR-COMP-001—004 | 浏览器、移动、协议、部署兼容 | §7.3（1）—（4） | VERIFIED | “宜”保持原强度 |
| NFR-USE-001—004 | 中文术语、培训后独立操作、二次确认/演练区分、错误引导 | §7.4（1）—（4） | VERIFIED |
| NFR-REL-001 | ★7×24、试运行≥99.5% | §7.5（1） | VERIFIED |
| NFR-REL-002—004 | 重试恢复、后备电源、MTTR≤2小时/异常拦截 | §7.5（2）—（4） | VERIFIED_WITH_DEPENDENCY |
| NFR-SEC-001 | ★等保不低于二级应用条款 | §7.6（1）；CLR-011 | RESOLVED_BY_SIMULATED_CLARIFICATION；责任已分工，应用安全待验证 |
| NFR-SEC-002 | ★扫描/渗透，高危清零 | §7.6（2）；CLR-011 | RESOLVED_BY_SIMULATED_CLARIFICATION；乙方应用侧责任，指标不弱化 |
| NFR-SEC-003—004 | 口令/令牌/限流；日志防篡改≥180天 | §7.6（3）—（4） | VERIFIED |
| NFR-MAINT-001—003 | 模块配置化；源码/构建/文档/健康/日志；单测≥70% | §7.7（1）—（3） | VERIFIED |
| NFR-PORT-001 | ★一键部署≤2小时且第三方实测 | §7.8（1） | VERIFIED |
| NFR-PORT-002—003 | 配置代码分离；数据完整导出迁移 | §7.8（2）—（3） | VERIFIED |
| INT-EXT-001 | 视频 GB/T 28181、实时/云台授权/历史回放 | §8.1（1）；CLR-001、010 | RESOLVED_BY_SIMULATED_CLARIFICATION；历史回放强制，M2 连通和性能待验证 |
| INT-EXT-002 | 信息发布发布/撤消 | §8.1（2）；CLR-010 | RESOLVED_BY_SIMULATED_CLARIFICATION；接口待验证 |
| INT-EXT-003 | 安防消防接入及门禁开启指令 | §8.1（3）；CLR-003、010 | RESOLVED_BY_SIMULATED_CLARIFICATION；门禁“应支持”，安全联锁待验证 |
| INT-EXT-004 | 短信网关复用平台通道 | §8.1（4）；CLR-004、010 | RESOLVED_BY_SIMULATED_CLARIFICATION；通道由甲方提供，乙方适配验证 |
| INT-IN-001—003 | 物联网、中台、内部统一API且界面不得直连库 | §8.2（1）—（3）；CLR-005、010 | RESOLVED_BY_SIMULATED_CLARIFICATION；接口能力待验证 |
| INT-OPEN-001 | 至少5类REST API，鉴权/审计/限流/OpenAPI 3.0 | §8.3 | VERIFIED |

## E. 实施、服务、验收与交付

| 稳定编号 | 忠实摘要 | 原文定位 | 状态/备注 |
| --- | --- | --- | --- |
| IMPL-M1—M5 | 需求/设计/初验/试运行/竣工五里程碑及交付 | P1 §9.1 表 | VERIFIED；KN-046—050 |
| PM-001—004 | 1周内计划、周例会周报、变更书面确认、代码快照 | §9.2（1）—（4） | VERIFIED |
| TRAIN-001—003 | 五类对象时长；课件/录屏/签到/考核；甲方地点桌面推演 | §9.3（1）—（3） | VERIFIED |
| SLA-001 | 12个月质保，免费缺陷/适应性升级 | §9.4（1） | VERIFIED |
| SLA-002 | 一/二/三级故障响应与解决时限 | §9.4（2） | VERIFIED |
| SLA-003 | 7×24申告、7×12远程、重大活动保障、期满报告 | §9.4（3） | VERIFIED |
| RISK-001—003 | 风险登记册五类风险；重大风险24小时报告；M2前视频/消息连通验证 | §9.5（1）—（3） | VERIFIED |
| ACC-ORG-001 | 初验/竣工两阶段、甲方组织乙方配合、四级测试 | §10.1 首段 | VERIFIED |
| ACC-ORG-002 | 文审→用例→性能→联动→安全；不合格15日整改复验 | §10.1 次段 | VERIFIED |
| ACC-FUNC-001 | 全FR用例、通过率100%、双向追踪 | §10.2（1） | VERIFIED |
| ACC-PERF-001 | PE全达标，PE-01/04现场实测 | §10.2（2） | VERIFIED |
| ACC-INT-001 | 视频/发布/物联网/中台联动及一次模拟联合演练 | §10.2（3） | VERIFIED |
| ACC-SEC-001 | 高危清零，越权/注入全通过 | §10.2（4） | VERIFIED |
| ACC-PORT-001 | 非乙方人员干净环境独立部署一次成功 | §10.2（5） | VERIFIED |
| DEL-SW-001 | 源码/构建、镜像、初始化脚本、H5 包 | §10.3 软件行；CLR-007 | RESOLVED_BY_SIMULATED_CLARIFICATION；不要求另做原生 APP |
| DEL-DOC-001 | 计划、SRS、概要/详细/数据库/接口设计 | §10.3 文档第1行 | VERIFIED |
| DEL-DOC-002 | 测试计划、测试设计、测试报告 | §10.3 文档第2行 | VERIFIED |
| DEL-DOC-003 | 用户、部署运维、培训材料 | §10.3 文档第3行 | VERIFIED |
| DEL-DOC-004 | 开源许可证说明、追踪矩阵、试运行、总结 | §10.3 文档第4行 | VERIFIED |
| DEL-DATA-001 | 基础数据初始化成果，双方确认 | §10.3 数据行；CLR-009 | RESOLVED_BY_SIMULATED_CLARIFICATION；甲方确认业务正确性，乙方清洗映射/导入/技术校验 |
| DEL-OTHER-001 | 演练记录、培训记录、质保承诺函 | §10.3 其他行 | VERIFIED |
| DOC-QA-001—004 | 完整一致、双向追踪、第三方可运维、源文件+PDF | §10.4（1）—（4） | VERIFIED |

## F. 第一关提交、评分与验收（P2）

| 稳定编号 | 忠实摘要 | 原文定位 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| TB-OUT-001—005 | 建议书、技术投标书、澄清记录、计划v1、风险登记册v1 | P2 第2—3页 §三 | VERIFIED | 本Task不启动这些后续任务 |
| TB-QA-001 | 配置库统一管理、封面/修订/图号、正文黑色 | P2 第3页 注意事项1 | VERIFIED | — |
| TB-QA-002 | 无页数上限，禁止口号，论点以数据/图表/证据支撑 | 第3页 注意事项2 | VERIFIED | — |
| TB-QA-003 | 过程产物与正式文档同为评分依据 | 第3页 注意事项3 | VERIFIED | — |
| TB-GATE-001 | D1—D4，D4述标评审；Bootcamp为门槛不计分 | 第3页 §四 | VERIFIED | 课程事实 |
| TB-GATE-002 | 立项评审/符合性先行，否决可24小时补正 | 第3页 §四 条件1 | VERIFIED | — |
| TB-GATE-003 | 无重大需求误解，偏差须书面澄清 | 第3页 §四 条件2 | VERIFIED | — |
| TB-GATE-004 | AI策略须具体可执行 | 第3页 §四 条件3 | VERIFIED | — |
| TB-SCORE-001 | 招标解析25：矩阵逐条、★零漏、逐日留痕 | 第3页 §五（1） | VERIFIED | B人工复核仍必需 |
| TB-SCORE-002 | 技术标50：需求10、方案验证25、WBS风险10、文档5 | 第3页 §五（2） | VERIFIED | — |
| TB-SCORE-003 | AI策略25：环节表、纪律、度量 | 第4页 §五（3） | VERIFIED | — |
| TB-AI-001—004 | ★/数据/图表人工核验；矩阵逐条人工确认；留Prompt；可解释 | 第4页 §六 | VERIFIED | 当前仍待B复核 |

## G. 未决项索引

`ISSUE-G1-01-001` 至 `ISSUE-G1-01-012` 详见 `control/issues.md`。截至 2026-09-09 的 `OPEN/BLOCKING` 历史保留；2026-09-10 经课程模拟书面裁决、C 映射及 B 裁决后技术复核，12 项均为 `RESOLVED / NON_BLOCKING`，仅表示需求歧义已裁决并完成映射复核。G1-01 已为 `DONE`；接口、环境、性能、安全与现场验收证据仍未形成，Issue 不因此冒充现场能力已验证。

## H. 课程模拟书面裁决证据索引

| CLR | Issue | 关联条款 | 证据与状态 |
| --- | --- | --- | --- |
| CLR-001 | ISSUE-G1-01-001 | REQ-REL-001、FR-02.3、FR-11.3、INT-EXT-001、KN-010、KN-060 | `G1-01_clarification_record.md#clr-001`；需求歧义已裁决，视频能力待验证 |
| CLR-002 | ISSUE-G1-01-002 | REQ-OOS-002、REQ-KEYTECH-003、FR-02.2、KN-008、KN-009 | `#clr-002`；定位能力待现场验证 |
| CLR-003 | ISSUE-G1-01-003 | REQ-REL-003、FR-11.3、INT-EXT-003 | `#clr-003`；门禁安全联锁待验证 |
| CLR-004 | ISSUE-G1-01-004 | REQ-REL-006、REQ-TECH-004、REQ-KEYTECH-002、FR-06.4、FR-08.2、INT-EXT-004、KN-006、KN-007 | `#clr-004`；消息能力待验证 |
| CLR-005 | ISSUE-G1-01-005 | REQ-REL-005、REQ-ARCH-001、FR-11.2、INT-IN-001—003 | `#clr-005`；中台能力待验证 |
| CLR-006 | ISSUE-G1-01-006 | REQ-TECH-002、REQ-KEYTECH-003 | `#clr-006`；地图适配待验证 |
| CLR-007 | ISSUE-G1-01-007 | REQ-DEPLOY-004、FR-08.2、DEL-SW-001 | `#clr-007`；H5 宿主集成待验证 |
| CLR-008 | ISSUE-G1-01-008 | REQ-OOS-003、REQ-DEPLOY-001、REQ-DEPLOY-002 | `#clr-008`；部署环境待验证 |
| CLR-009 | ISSUE-G1-01-009 | DEL-DATA-001 | `#clr-009`；数据初始化待验证 |
| CLR-010 | ISSUE-G1-01-010 | REQ-REL-002—004、INT-EXT-001—004、INT-IN-001—003、RISK-001—003 | `#clr-010`；既有接口与 M2 连通待验证 |
| CLR-011 | ISSUE-G1-01-011 | NFR-SEC-001、NFR-SEC-002、KN-042、KN-043 | `#clr-011`；应用安全待验证 |
| CLR-012 | ISSUE-G1-01-012 | REQ-PROJ-001 | `#clr-012`；匿名称谓已统一，待 B 映射复核 |
