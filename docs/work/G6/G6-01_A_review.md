# G6-01 A整体Review

- 日期：2026-10-12；对象：master@40f2002；G6-01内容提交f9eec53、回填ad4febe；手册版本V0.1，发布beb605f/代码5fc359a。
- 主责B；本轮复核A（Codex辅助，不冒充自然人签署）；结论 **NEED_FIX / CHANGES_REQUESTED**。tasks保留REVIEW，不置DONE。
- 判据：最新tasks G6-01 DoD及P1 §10.4、KN-065；基线见G6_A_review_baseline.md。

## 1 用户手册审核

| 项目 | 审核证据与结果 | 判定 |
|---|---|---|
| 用户角色 | §1/3覆盖指挥、安保、物资、值班、管理员，列权限点及禁止操作；中台分配声明明确 | 内容存在；角色绑定尚无真实中台证据 |
| 正常路径 | §4上报/核实/启动、§5接收/反馈/完成；和IncidentFlowView/TaskFlowView入口及API操作核对 | 这些步骤对应源码 |
| 事件闭环 | 发现→确认→处置→反馈有步骤；没有关闭评估、调查/报告、附件、知识沉淀、授权角色、前置条件、关闭结果核对步骤 | NEED_FIX：ISSUE-G6-01-001 |
| 页面真实性 | 三张图实际为presentation模式，均显著演示数据；部分其他工作台§6称“建计划/记录执行”等而源码正式分支主要查询，未给操作入口 | NEED_FIX：001；需逐项明确可操作/仅展示/API待接线 |
| 异常 | §7/9有401/403/404/409/422/429/503与traceId、降级，控制指令禁止重放 | 内容合格，不等于每类实跑 |
| 当前版本 | 手册锁beb605f；最新8dbfbab修改H5反馈进度映射，待B/C确认；截图70%为演示数据，不能证明旧正式API反馈显示正确 | NEED_FIX：ISSUE-G6-01-004 |

后端event-workflow.mjs存在close方法，但IncidentFlowView没有关闭入口；不可把G6-03通过HTTP关闭并显示CLOSED解释为用户已能按手册完成页面关闭。整改须B交代真实可用入口；若需代码接线，先登记范围/验证，不能以文案掩盖。

## 2 部署运维手册审核

| 要求 | 证据 | 判定 |
|---|---|---|
| 环境要求 | §2给OS、Node、Docker、数据库、资源建议，非甲方采购/容量事实 | 存在 |
| 安装/启停 | §4及§11有后端Compose和迁移；缺前端构建、静态托管、反向代理、API地址、门户/H5令牌注入完整步骤 | NEED_FIX：ISSUE-G6-01-003 |
| 配置 | §3列IDENTITY_PATH/FILE_PRESIGN_PATH/REQUEST_TIMEOUT_MS，但compose.yaml未透传这些可配项；只export不会自动注入后端容器 | NEED_FIX：003 |
| 日志监控 | §7有health/ready、日志、API、Outbox、数据库、磁盘、外部端口 | 存在；精确logs命令无本轮执行证据 |
| 故障处理 | §10包含启动失败、数据库/身份/附件/消息/门禁故障及资源缺失 | 存在 |
| 回退方案 | §9写migrate down；脚本对全部已应用迁移逆序执行，不限单次升级；001/002/003 down具有删表影响 | NEED_FIX：003；须说明目标迁移集合、备份/恢复点、停止写入与数据保持验证 |
| 非作者可执行 | Docker记录由B在其WSL路径执行，非独立运维人员；完整Web/H5交付步骤不足 | 尚不能认定；课程可运行部分不满足全部交接DoD |

手册“database healthy、backend healthy/running”需对应当前Compose：database有healthcheck，backend没有healthcheck；backend running不证明ready。备份cp前应明确创建宿主backup目录并验证复制文件哈希。原始运行使用g6-backup.dump，而手册为emergency.dump，须提供等价映射与准确命令证据。

部署版本溯源补充：raw实际路径为`/mnt/e/26shixi/emergency-response-platform-g5-02/compose.yaml`，并出现backend Healthy；但锁定beb605f中的compose及Dockerfile均无backend healthcheck。可能存在执行目录差异或未归档override，【待人工确认】；现有JSON releaseCommit为脚本硬编码，未记录实跑目录git HEAD/dirty diff/compose config/镜像对应配置指纹，因此不能仅据JSON确认执行文件就是锁定版本。并入002要求B提交实际环境配置/代码指纹和差异解释，不认定伪造，也不把该日志用于锁定版本全部命令PASS。

## 3 命令真实性审核

本轮只审核历史原始输出；未冒充重新执行B部署、生产回退或独立部署。全部台账行逐项如下：

| 台账行 | 环境/版本 | 时间 | 输出/原始记录 | exit code依据 | 判定 |
|---|---|---|---|---|---|
| 1 quality | Windows/Node24.14/npm11.9 | JSON精确起止 | quality-check.json、npm-quality.log，exit0且套件/契约/扫描可读 | JSON显式0 | 有完整聚合命令证据 |
| 2 部署脚本 | WSL/Docker28.1/Compose2.35 | 21:04:06—25 | deployment-check.json/完整raw日志 | 台账写0；JSON无exitCode；成功尾行+脚本set-e | 部分，不能替代逐命令 |
| 2.1 build --no-cache | 同上/Node24 Alpine | 只引用父脚本区间 | raw记录镜像构建与npm ci输出 | 未独立记录 | 部分 |
| 2.2 up -d --wait | 同上 | 无逐条时间 | raw有启动、database/backend输出 | 未独立记录 | 部分 |
| 2.3 migrate up | 同上 | 无逐条时间 | raw有三组applied | 未独立记录 | 部分 |
| 2.4 health/ready | 同上 | 无逐条时间 | JSON及raw有200/200 | 未独立记录 | 部分 |
| 2.5 pg_dump/hash | 同上 | 无逐条时间 | raw含备份与sha256；和手册文件名不同 | 未独立记录 | 部分 |
| 2.6 createdb/pg_restore | 同上 | 无逐条时间 | raw含37→37、哨兵1→1 | 未独立记录 | 部分 |
| 2.7 restart/ready | 同上 | 无逐条时间 | raw先000后200，失败重试保留 | 未独立记录 | 部分 |
| 2.8 down -v | 同上 | 成功尾部，JSON结束时间在清理前 | raw保留删除及残留0/0/0 | 未独立记录 | 部分 |
| 3 首轮失败 | 同上 | “21:03左右”非精确 | attempt-1-failed.log保留WSL node缺失 | 台账127，原始错误支持失败；未见结构化逐步退出码 | FAIL真实保留，时间证据需完善 |
| 4 Vite截图 | Windows版本共用 | 21:04—05区间 | 三图存在、演示标记可见；无服务启动/截图程序原始记录 | 文字写0，无独立执行记录 | 只有部分产物证据 |

额外逐条对照手册命令：宿主npm ci、npm ci --prefix frontend、docker compose ps、两条logs --since=30m、docker compose cp、docker compose pull、migrate down、git checkout批准标签、down不带-v，未找到本轮对应精确执行记录。容器npm ci输出不能替代宿主npm ci；cleanup日志采集不能替代两条指定--since命令。升级和回退不应在生产中为凑证据运行，应由B在受控隔离环境执行并留证。**ISSUE-G6-01-002：MAJOR，命令逐条证据DoD未满足。**

## 4 真实边界审核

两手册、台账和交接材料均明确B作者侧隔离部署、六类甲方系统真实0/6、真实非乙方操作者0、移动宿主/浏览器补测、生产容量灾备未验收；KN-065保持REAL_WORLD_DEFERRED。19秒G6运行与17秒历史G5运行是不同执行，不应混计。11/59/47和课程条件接受边界一致。此项边界表达通过，不代表真实履约通过。

## 5 文档规范审核

- Pair manifest的Reference/DOCX/PDF六类指纹均独立复算匹配；生成源码明确shutil.copy2物理复制。
- 两份PDF各11页；A使用Poppler85DPI全页渲染、四张拼图检查全部22页，并查看三张原始操作截图。未见越界、遮挡、乱码、错误书签或异常空白页。表格跨页重复表头可读；后续内容整改须重新生成/渲染。
- 页尺寸/边距/栏/分页编号与各Pair一致；显式正文无非黑颜色；题注未重号；用户7表3图、运维8表（含修订表，无图）。
- 用户手册styles/numbering/sectPr字节与Reference不同，页几何一致，主题相同；运维三个组件/sectPr一致。字节不同本身不判格式失败；记录为格式观察，B下次生成须解释Word导出/字段更新差异并保持既有格式。
- Poppler提示Symbol/ArialUnicode无显示字体；实际渲染中文和正文可读，不隐去工具warning。
- 正式件中关闭缺口与部署步骤缺口同工作稿；不能只改MD不改DOCX/PDF。

## 问题分类与复验

001业务闭环/页面能力、002命令证据、003完整部署与回退均MAJOR OPEN，责任B/A复验；004最新版本/H5已知限制为MAJOR OPEN，B技术确认、C G6-03复核、A一致性复验。真实资源延期沿用已有台账，不新造PASS。A本轮审查完成并正式退回；作者整改和指定复验未发生，不能写问题已关闭。
