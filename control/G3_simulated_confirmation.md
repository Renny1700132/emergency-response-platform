# 第三关课程项目模拟确认基线

- 标识：`SIMULATED_OWNER_CONFIRMATION`
- 日期：2026-09-21
- 性质：课程项目模拟甲方确认；不得描述为真实甲方提供、真实生产环境或真实现场验收。
- 编制单位：020202项目组；A 何思源，B 严宇，C 任俊强；批准人李晓雷；签章日期 2026.09.26。

## 环境与外部接口

DEV/UAT/ACC 网关依次为 `https://gw-dev.museum-ops.example`、`https://gw-uat.museum-ops.example`、`https://gw-acc.museum-ops.example`，业务前缀 `/api/v1`。八端口配置：EXT-VIDEO（VMS OpenAPI 2.4 + GB/T28181-2016，OAuth2 Client Credentials/SIP Digest，`svc_ers_video`）；EXT-PUBLISH（Publish API 1.3，OAuth2，`svc_ers_publish`）；EXT-INTRUSION（Alarm Gateway API 1.1，mTLS + HMAC-SHA256，`svc_ers_intrusion`）；EXT-ACCESS（Access API 3.0，mTLS + OAuth2，`svc_ers_access`）；EXT-FIRE（Fire Gateway API 1.2，mTLS + HMAC-SHA256，`svc_ers_fire`）；EXT-IOT（IoT API 2.0/MQTT 5.0，TLS客户端证书，`svc_ers_iot`）；EXT-MIDDLE（Unified Platform API 2.1，OAuth2 + JWT，`svc_ers_middle`）；EXT-MESSAGE（Message Hub API 2.0，OAuth2 + Callback HMAC，`svc_ers_message`）。除中台窗口工作日09:30—17:30外，其余为工作日14:00—17:30；专项UAT为2026-09-22—25每日14:00—17:30（UTC+8）。秘密只由KMS-01下发，不进入仓库或文档。

## 地图、H5、备份与配置

地图统一EPSG:4490；二维WMTS 1.0.0，楼层WMS 1.3.0 + GeoJSON，三维3D Tiles 1.1，UAT平台 `https://gis-uat.museum-ops.example`，楼层B1/F1/F2/F3，WGS84经GIS Adapter转换。H5宿主为自然博物馆智慧管理APP V3.8.0；验收组合为Android 10/12/14 + WebView 140+及iOS 15.8/17.7/18.x + WKWebView。定位/扫码由宿主Bridge提供，不要求后台定位与通讯录。

RPO≤30分钟、MTTR≤2小时；WAL 15分钟、日增量、周全量，分别保留35天/12周，月归档36个月；每日DR、每周WORM 90天、每月离线归档36个月，季度恢复演练。TLS 1.2+、AES-256、KMS-01；服务凭据90天、主密钥180天轮换。维护窗口每周三20:00—22:00。制品/配置/归档/备份库分别为 `registry.museum-ops.example/ers`、`configrepo.museum-ops.example/ers`、`archive.museum-ops.example/ers`、`backup-dr.museum-ops.example/ers`。

## 模拟验收证据

证据根目录为 `evidence/simulated/`，所有文件与正文显式标记 `SIMULATED_EVIDENCE`。证据编号：SIM-EV-INT-001、SIM-EV-INT-002、SIM-EV-KN064-001、SIM-EV-GIS-001、SIM-EV-PERF-001、SIM-EV-COMP-001、SIM-EV-BACKUP-001、SIM-EV-SEC-001、SIM-EV-DEPLOY-001、SIM-EV-ROLLBACK-001、SIM-EV-DR-001、SIM-EV-CM-001、SIM-EV-REL-001。

冻结模拟结果：八接口8/8与KN-064三类场景PASS；通知/任务P95 1.42s，告警0.74s，确认至任务42s，消息24并发/99.6%，定位1.68s/0.50m，视频首帧2.36s，Web 1.82s，地图1.31s，H5扫码0.71s，安防刷新17.6s，应急信息33.8s，在线120用户/99.8%，报表3.35s；六组合兼容PASS；安全高危0、中危0、低危观察2项；部署68分钟、回滚11分40秒、恢复54分钟/RPO 12分钟。以上均为课程模拟结果。

## 变更与发布责任

CCB=A+B+C，A召集，B技术评估，C需求/合规/追踪评估。一般变更三人通过；冻结FR/★/验收变化还需模拟甲方项目经理书面批准；紧急技术变更A+B可先处置，C于1个工作日内补核且不得改变冻结需求。正式发布由模拟甲方项目经理+A批准，A发布/回滚，B技术执行，C质量确认。
