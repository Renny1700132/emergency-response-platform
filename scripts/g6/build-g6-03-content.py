"""Build controlled defense content by quoting the accepted G6 metric baseline."""
from pathlib import Path
import json

root = Path.cwd()
work = root / 'docs/work/G6'
work.mkdir(parents=True, exist_ok=True)
review = json.loads((root / 'evidence/g6/G6-02/b-review.json').read_text(encoding='utf-8'))
run = json.loads((root / 'evidence/g6/G6-03/rehearsal-result.json').read_text(encoding='utf-8'))
assert review['results'] == {'NOT_RUN': 59, 'BLOCKED': 47, 'PASS': 11}
assert run['status'] in ['PASS', 'PASS_WITH_KNOWN_DISPLAY_DEFECT']
screens = {item['id']: item['path'] for item in run['screenshots']}
common = '本轮采用模拟数据和本地实际执行。C复核CHANGES_REQUIRED；状态/来源已整改，待C定向复验；真实项目验收继续延期。'
slides = []
def add(title, subtitle, body, notes, sources, layout='text', image=None, table=None):
    slides.append({'number': len(slides)+1, 'title': title, 'subtitle': subtitle, 'body': body, 'notes': notes,
                   'sources': sources, 'layout': layout, 'image': image, 'table': table})

add('应急管理子系统', '验收答辩候选 V0.2', ['博物馆智能运营中心', 'G6-03 / A主责；C复核退回，待定向复验', '模拟项目试演，当前系统本地实际运行'],
    '本次汇报对应tasks中的G6-03验收答辩、现场演示与质询。最新用户纠偏要求以远端master的任务边界执行，并授权生成合理模拟数据。开发总结属于G6-04，本轮不提交总结。请始终把模拟业务输入、本地实际执行和甲方真实验收区分清楚。'+common,
    ['tasks.md', 'docs/work/G6/g6_03_execution_baseline.md', 'control/overrides.md#OVR-039'], 'cover')

add('课程状态与真实验收', 'G5课程条件收口保留全部真实延期', [],
    '项目先后形成投标、需求、设计与研发成果。G3工程基线冻结为BASELINE-G3-M3-R1.0；G4任务在master收口。G5-03由C独立最终复核接受的是课程条件结论，真实实现、证据和环境延期仍在。G6-01已由A接受并DONE；G6-02已获B最终接受及A一致性接受并DONE。C已整体复核G6-03，结论CHANGES_REQUIRED，仅状态/来源整改待定向复验。不能把课程任务DONE当作117条验收条件全部通过。',
    ['tasks.md', 'control/baselines/BASELINE-G3-M3-R1.0.md', 'evidence/g5/G5-03/c-final-acceptance.json', 'evidence/g6/G6-02/b-review.json'], 'table',
    table=[['阶段', '已定位的证据', '结论边界'], ['G1—G3', '立项、需求、设计及冻结记录', '冻结范围继续受控'], ['G4', '任务已收口进入master', '研发收口不派生全量验收'], ['G5', 'C最终复核课程条件接受', '实现与真实环境延期'], ['G6', '手册、索引、答辩候选', 'G6-01/02 DONE；G6-03待C复验']])

add('冻结范围与责任边界', '39 FR，34项★FR，117 AC', [
    'Web承担事件核实、预案启动和任务统筹', 'H5嵌入既有APP，承担移动上报、接收和反馈',
    '甲方提供中台、地图与外部接口资源', '乙方实现业务适配与验证，后续补测继续保留'],
    '39 FR、34项★FR和117 AC取自G6-02唯一指标账和B机械复验，不能将页面数、工作台数或套件通过数当作需求通过数。H5交付与宿主责任来源F-008，地图责任来源F-009，外部接口责任来源F-005。原型与演示数据可以解释页面，但不能充当正式数据库或甲方联调证据。',
    ['control/facts.md#F-005', 'control/facts.md#F-008', 'control/facts.md#F-009', 'control/key_numbers.md#KN-063', 'evidence/g6/G6-02/metrics-ledger.md'])

add('实现与发布基线', '启动版本一致，显示整改后单独锁定新候选', [],
    '本轮从deaddc6快照开始。启动时应用代码与G6-01发布快照beb605f的Git差异为零，证据在input-manifest。实际试演发现H5进度显示问题后透明登记Issue，仅修正进度映射并新增回归断言，quality与完整试演复跑。新候选使用rehearsal-release-lock的文件哈希，不把新结果挂回旧commit。生产设计使用PostgreSQL与持久Outbox；本轮采用现有后端内存路径，注入模拟身份、消息和预案端口，不证明持久化或崩溃恢复。ADR接受不等于全部机制已被本轮验证。',
    ['evidence/g6/G6-01/release-lock.json', 'evidence/g6/G6-03/input-manifest.json', 'evidence/g6/G6-03/rehearsal-release-lock.json', 'backend/src/server.mjs', 'frontend/src/main.ts', 'docs/work/B_TECH/adr/ADR-001-应用拆分与部署单元.md', 'docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md'], 'table',
    table=[['对象', '当前实现', '本轮验证范围'], ['前端', 'Vue 3 / Vite，正式API模式', '实际Web与H5页面操作'], ['后端', 'Node.js，模块化业务和端口', '实际HTTP和状态迁移'], ['持久化', '生产设计为PostgreSQL', '本轮内存执行，不验证持久化'], ['外部能力', '身份、消息、预案端口', '本轮显式模拟，不接甲方系统']])

add('G5质量结果', '逐AC原始结果保持原分母', [],
    f"G6-02账本与G5最终Review一致：{review['fr']} FR、{review['starFr']}项★FR、{review['rtmRows']} AC。PASS {review['results']['PASS']}、NOT_RUN {review['results']['NOT_RUN']}、BLOCKED {review['results']['BLOCKED']}。完整通过的★FR只有1项，33项仍BLOCKED。性能1160样本来自8组本地内存HTTP和模拟适配，0失败也不能推断生产SLA或目标规模已通过。本轮试演增加的是具体路径证据，不改写这份历史分母或结果。",
    ['evidence/g6/G6-02/metrics-ledger.md', 'evidence/g6/G6-02/b-review.json', 'evidence/g5/G5-03/c-final-acceptance.json'], 'table',
    table=[['指标', '真实结果', '含义'], ['AC PASS', str(review['results']['PASS']), '仅这些AC已有对应真实通过证据'], ['AC NOT_RUN', str(review['results']['NOT_RUN']), '仍需执行并归档'], ['AC BLOCKED', str(review['results']['BLOCKED']), '保留实现或资源阻断'], ['★FR', '1 PASS / 33 BLOCKED', '分母34，不以局部套件推导']])

add('交付与证据导航', '沿用唯一索引，当前候选进入增量交接', [
    'G6-01：两本手册、命令台账与已知限制', 'G6-02：最终审计包，B/A复核接受',
    'G6-03：逐页来源、实际试演和异常响应', '最终状态由指定复核人和后续审计确认'],
    '唯一交付索引由C维护，首版为29项，其中20可用、9缺项，这是首版存在性快照，不是当前齐套或验收通过率。本轮不修改C的索引和RTM，提供一份行级增量交接请求。G6-01 V0.2及26步命令证据已由A接受；G6-02最终审计经B再复验与A一致性复验接受。首版29项快照保留，增量GI三段21/18/11分列。此次修订作为后续增量交接，不倒改已锁历史指纹。',
    ['evidence/g6/G6-02/delivery-index.json', 'evidence/g6/G6-02/b-review.json', 'tasks.md', 'evidence/g6/G6-01/command-execution-ledger.md'])

add('模拟试演输入', '全部业务输入显著标记为模拟数据', [
    '场景：一层展厅烟雾提示的核实与处置', '预案：疏散通道检查、展厅人员清点',
    '角色：模拟指挥员、执行员、只读观察员', '后端内存存储，身份与消息端口模拟'],
    '上述场景、标题、任务、角色都是本轮按用户授权生成的模拟输入，不是仓库事实源中的真实事故或真实人员。实际时间来自机器运行，数据发生时间也是生成输入的一部分。操作使用生产构建的前端、当前后端HTTP和真实浏览器，保留原始请求响应和审计。health为200；没有数据库的ready明确503，不能称数据库就绪或生产部署通过。',
    ['evidence/g6/G6-03/simulated-dataset.json', 'evidence/g6/G6-03/rehearsal-result.json', 'control/overrides.md#OVR-039'])

add('事件核实与预案启动', 'Web页面实际提交，服务端状态为RESPONDING', [
    '页面上报写入当前后端', '核实后启动锁定模拟预案', '自动生成两条模拟任务', '原始请求、响应和traceId可追溯'],
    '切换到Web事件页面，先展示底部模拟标识。本轮事件由实际页面表单提交，核实和启动通过实际HTTP执行。服务端生成任务并返回RESPONDING，当前页面重新加载显示相同状态。这里核实的人物和灾情都是模拟输入，自动任务消息回执也是明确模拟端口返回，不代表短信或甲方APP已送达。截图来自本轮成功闭环的同一runId。',
    ['evidence/g6/G6-03/rehearsal-result.json', 'evidence/g6/G6-03/simulated-dataset.json', 'scripts/g6/run-g6-03-rehearsal.mjs'], 'image', screens['01-web-response'])

add('H5接收与反馈', '整改后页面与反馈记录均为60%', [
    '执行员在实际H5页面接收任务', '后台反馈记录保存60%进度', '最新页面实际显示60%，状态IN_PROGRESS', 'ISSUE-G6-03-001已由B/C确认关闭'],
    'H5接收和反馈按钮在实际浏览器中执行。旧候选后端反馈保存60，页面显示0，原因是映射漏读反馈数组。本轮登记Issue后仅修正映射，并用回归断言保护显式零值；完整quality及Web/H5正常异常路径重跑。最新截图和原始响应均显示60，任务为IN_PROGRESS。旧FAIL与带问题试演保留，B技术确认和C独立复演均有实际记录；问题已CLOSED / VERIFIED_BY_B_AND_C。当前002状态/来源修订仍待C定向复验。',
    ['evidence/g6/G6-03/rehearsal-result.json', 'evidence/g6/G6-03/quality-gate.log', 'frontend/src/features/response/workflow.ts', 'backend/src/event-workflow.mjs', 'control/issues.md#ISSUE-G6-03-001'], 'image', screens['02-h5-feedback'])

add('并发版本冲突', '同一任务的旧页面写入返回409', [
    '另一终端先接收第二条任务', '旧页面再次接收触发版本冲突', '页面展示真实错误与traceId', '刷新后核对状态，再决定操作'],
    '异常分支通过真实状态变化制造：页面仍持有旧版本，另一终端已经接收同一任务。随后点击旧页面接收按钮，服务器实际返回409，页面显示冲突信息与traceId。另有事件启动旧版本请求同样返回409。这是模拟业务输入下的真实异常运行，不是手工画出的错误截图。故障处置为刷新核对版本，不重复盲提交；门禁等物理控制不纳入这次异常验证。',
    ['evidence/g6/G6-03/rehearsal-result.json', 'scripts/g6/run-g6-03-rehearsal.mjs', 'docs/work/B_TECH/g6_user_manual.md#7'], 'image', screens['03-h5-version-conflict'])

add('角色权限拒绝', '只读角色写入返回403，事件数保持一致', [
    '只读角色调用写接口遭服务端拒绝', '拒绝前后事件数量相同', '无页面权限时转到拒绝页面', '三类模拟角色均有明确交接边界'],
    '权限验证分两层：只读模拟角色对事件写入API发起实际请求，后端返回403，拒绝前后的事件数量没有增加；只读角色打开缺少plan:read权限的页面，路由守卫转到无访问权限页面。原始审计含denied。注入模拟Bearer只为本地试演，未使用开发身份头绕过生产约束，不构成甲方真实统一身份平台验收。A负责叙事、B负责技术边界、C负责数字与证据复核。',
    ['evidence/g6/G6-03/rehearsal-result.json', 'backend/src/identity.mjs', 'frontend/src/router/index.ts', 'docs/work/B_TECH/g6_user_manual.md#3'], 'image', screens['04-web-permission-denied'])

add('处置闭环与运行结果', '两条任务完成后，事件实际进入CLOSED', [
    '接收与反馈保留任务资源版本', '完成任务后提交关闭理由', 'Web页面重新加载显示CLOSED', '本地试演PASS；C要求状态/来源整改'],
    f"当前后端实际完成两条任务，关闭事件并在Web页面显示CLOSED。本轮自动化运行耗时{run['elapsedSeconds']}秒，来自机器计时，不是人的现场讲述时长，也不能说明性能SLA。整改后本轮结果为{run['status']}，H5显示和其他路径实际断言见原始记录。此前记录器404和进度问题失败均保留，没有隐藏或把整个过程写成一次成功。PASS仅描述本轮模拟试演自检，不能替代C整体复核或真实项目验收。",
    ['evidence/g6/G6-03/rehearsal-result.json', 'evidence/g6/G6-03/raw/', 'control/issues.md#ISSUE-G6-03-001'], 'image', screens['05-web-closed'])

add('遗留问题与验收边界', '问题、延期和未知数据继续显著披露', [],
    'H5进度显示问题属于本轮新增技术输入。G5的30条AC实现延期、其余76条AC证据延期继续保留，六类甲方系统真实联调0/6、真实非乙方部署操作者0也未改变。AI代码占比、首审打回率、Prompt复用次数和返工工时尚无可靠归因样本，账本为UNKNOWN，不写零或虚构比例。现场意见和实际签署尚未发生，材料只能作为候选。',
    ['control/issues.md', 'evidence/g6/G6-02/gaps-deferrals.md', 'evidence/g6/G6-02/metrics-ledger.md', 'evidence/g6/G6-03/rehearsal-result.json'], 'table',
    table=[['事项', '当前状态', '下一步'], ['H5进度显示', 'CLOSED / B及C验证', '保留原失败及B/C确认记录'], ['功能与证据', '30 AC实现 / 76 AC证据延期', '按RTM逐项补实现和断言'], ['真实联调/独立部署', '0/6系统 / 0真实独立操作者', '资源到位后保留真实证据'], ['AI量化与现场结论', 'UNKNOWN / 尚未发生', '可靠样本、真实复核及意见']])

add('质询分工与故障预案', '以固定版本、实际证据和问题记录作答', [
    'A：任务范围、交付状态、演示叙事与风险', 'B：端口、事务、数据库、部署和技术问题',
    'C：FR/AC/★分母、审计、延期与符合性', '失败时保留traceId，改用标注版本的证据'],
    '现场执行前核对版本、前端构建、模拟标识和权限。服务不可用时停止写操作，记录真实失败，不临场升级或改代码；改用本轮已归档截图和原始记录，明确是备用证据而非现场成功。若出现409，刷新并核对版本；403检查权限，不能借用他人账号。消息失败转人工确认，物理门禁控制禁止自动重放。G6-01 A接受及G6-02 B/A最终审计已闭环；C整体Review为CHANGES_REQUIRED。此次002整改待C定向复验，不能提前置DONE。真实现场的质询、计时和意见仅在实际发生后追加记录。',
    ['docs/work/G6/g6_03_demo_and_qna.md', 'docs/work/B_TECH/g6_user_manual.md', 'docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md', 'tasks.md'])

for slide in slides:
    slide['sources'] += ['docs/work/G6/G6-01_A_rereview.md', 'docs/work/G6/G6-02_A_rereview.md', 'logs/reviews/2026-10-12_G6-03-C-review.md', 'evidence/g6/G6-03/C-review/review-result.json']

content = {'taskId': 'G6-03', 'mode': 'CONTENT_EDIT', 'version': 'V0.2', 'status': 'REMEDIATED_PENDING_C_TARGETED_REREVIEW',
           'author': 'A', 'reviewer': 'C', 'snapshot': '93934c5',
           'evidenceKind': 'COURSE_SIMULATED_REHEARSAL', 'realWorldStatus': 'REAL_WORLD_DEFERRED',
           'rehearsalRunId': run['runId'], 'slides': slides}
(work / 'g6_03_defense_content.json').write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
talk = ['# G6-03 验收答辩讲稿与逐页来源', '', '- V0.2，A主责；C整体复核CHANGES_REQUIRED，002已整改待定向复验。', '- 讲稿与PPT来自同一JSON内容源。模拟数据与真实执行边界在正文显著保留。', '- 本轮不填课程D18日期/指定时长；实际自动化运行计时仅描述机器执行。', '']
for slide in slides:
    talk.extend([f"## 第{slide['number']}页 {slide['title']}", '', slide['notes'], '', '来源：', ''])
    for source in slide['sources']:
        file, _, anchor = source.partition('#')
        talk.append(f'- [{source}](../../../{file}' + (f'#{anchor}' if anchor else '') + ')')
    talk.append('')
(work / 'g6_03_defense_script.md').write_text('\n'.join(talk) + '\n', encoding='utf-8')
print(json.dumps({'slides': len(slides), 'contentSource': 'docs/work/G6/g6_03_defense_content.json', 'rehearsalStatus': run['status']}))
