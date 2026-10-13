"""Build A's G6-04 sources from a locked master snapshot; never invent acceptance."""
from pathlib import Path
import subprocess, json, hashlib, re
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
SNAP = '3b47e8f97caac1fa6dc989fd1ff5279bd1eb5450'
WORK = ROOT / 'docs/work/G6'
OUT = ROOT / 'evidence/g6/G6-04'
OUT.mkdir(parents=True, exist_ok=True)

def git(*args):
    return subprocess.check_output(['git', '-c', 'core.quotepath=false', *args], cwd=ROOT)
def source(path):
    return git('show', f'{SNAP}:{path}').decode('utf-8-sig')
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding='utf-8')
def dump(path, value):
    write(path, json.dumps(value, ensure_ascii=False, indent=2)+'\n')

files = git('ls-tree','-r','--name-only',SNAP).decode().splitlines()
# Headers inside quoted prompts/examples are excluded. A block is an archived
# prompt, not necessarily a distinct user turn, invocation or reused pattern.
def outside_headers(text):
    fence = None
    for lineno, line in enumerate(text.splitlines(),1):
        m = re.match(r'^\s*(`{3,}|~{3,})',line)
        if m:
            marker=m[1]
            if fence is None: fence=marker
            elif marker[0]==fence[0] and len(marker)>=len(fence): fence=None
            continue
        if fence is None and re.match(r'^#{1,6}\s+',line):
            yield lineno,line

prompt_rows=[]
review_rows=[]
for path in files:
    if path.startswith('logs/prompts/') and path.endswith('.md'):
        blob=git('show',f'{SNAP}:{path}')
        headers=list(outside_headers(blob.decode('utf-8-sig')))
        blocks=[{'line':n,'heading':h} for n,h in headers if re.search(r'\bUSER_PROMPT_RAW\b',h)]
        ids=[{'line':n,'heading':h} for n,h in headers if re.search(r'\bLOG-',h)]
        prompt_rows.append({'path':path,'sha256GitBlob':hashlib.sha256(blob).hexdigest(),'rawPromptBlocks':blocks,'taskHeaders':ids})
    if path.startswith('logs/reviews/') and path.endswith('.md'):
        review_rows.append({'path':path,'sha256GitBlob':hashlib.sha256(git('show',f'{SNAP}:{path}')).hexdigest()})
counts={'promptFiles':len(prompt_rows),'archivedRawPromptBlocks':sum(len(x['rawPromptBlocks']) for x in prompt_rows),'reviewMarkdownFiles':len(review_rows)}
dump(OUT/'ai-log-census.json',{'snapshot':SNAP,'scope':'tracked logs/prompts/*.md and logs/reviews/*.md at snapshot; excludes current G6-04, history backups, quoted headers, JSON duplicate evidence','counts':counts,'unknown':['total user turns','AI line attribution','unique review event count','review rejection rate','pattern reuse','rework hours','time saved'],'prompts':prompt_rows,'reviews':review_rows})
write(OUT/'git-history.txt',git('log',SNAP,'--date=iso-strict','--format=%H%x09%aI%x09%cI%x09%an%x09%s').decode('utf-8'))
write(OUT/'task-snapshot.md',source('tasks.md'))

stages=[
 ('G1','立项竞标、范围与责任明确','建议书、投标、计划、风险、确认书','BASELINE-V1.0事实冻结；V1.2呈现文件自身仍PENDING_C_REVIEW，tasks历史G1-15 DONE照录，不重新裁决','control/baselines/BASELINE-V1.0.md'),
 ('G2','需求规格与原型走查','SRS、spec、RTM、澄清、原型走查及返工复审','BASELINE-G2-M2-R1.0 FROZEN / VERIFIED_BY_B_AND_C；原型不充当正式实现','control/baselines/BASELINE-G2-M2-R1.0.md'),
 ('G3','设计与工程计划','四设计、OpenAPI、ADR/NFR、测试与管理计划','BASELINE-G3-M3-R1.0 FROZEN；唯一受控研发设计输入','control/baselines/BASELINE-G3-M3-R1.0.md'),
 ('G4','两Sprint研发及工程护栏','前后端、数据库、模拟适配、测试、PR、RTM v4、Prompt模式与翻车记录','G4-00—11在tasks均DONE；保留030—039 backlog与SIMULATED边界','control/g4_final_sprint_state.md'),
 ('G5','测试、质量特性与课前三审','原始执行包、RTM v5、正式测试/审计报告','COURSE_CONDITIONAL_ACCEPTANCE；真实IMPLEMENTATION_AND_REAL_WORLD_DEFERRED','logs/reviews/2026-10-11_G5-03-C-final-review.md'),
 ('G6','交付、手册、答辩、复盘与移交','两手册、唯一审计索引、答辩、总结及债务/归档','G6-01/02/03 DONE；G6-04本轮执行，尚待C/B；不形成真实验收','logs/reviews/2026-10-12_G6-03-C-rereview.md')]

deviations=[
 {'id':'DEV-01','plan':'项目计划v1 WBS3.7/3.8：W5/W6真实视频、消息连通并纳入M2；P1全部接口责任不删','actual':'六类甲方系统真实联调0/6；已接受课程模拟链路','evidence':'docs/work/A_PM/project_plan_v1.md §2.3；G6-02 metrics-ledger、gaps-deferrals GAP007；OVR-039','cause':'真实账号、合法数据、网络及窗口没有就绪记录；G6-03另有模拟授权，模拟不能提供真实回执','impact':'KN-006/007/008/009/010/060/064真实验收证据缺失，课程接受不能关闭','improvement':'A在下一次联调前取得甲方资源清单，B按八端口与六类资源逐项实跑，C检查同traceId证据后关闭'},
 {'id':'DEV-02','plan':'P1全39FR功能覆盖/验收用例全部通过；G4执行范围优先001—029，030—039保留backlog','actual':'117AC为11 PASS/59 NOT_RUN/47 BLOCKED；30AC实现延期、76AC缺完整证据','evidence':'tasks G4范围；G6-02 metrics-ledger/gaps005—006；G5-01 functional-gate-raw.json','cause':'已登记backlog未获后续实现授权；其余AC未取得完整逐AC断言或所需环境，套件通过未覆盖全部AC','impact':'KN-031/032不满足真实全量验收；不得把RTM链路存在视作PASS','improvement':'B/A按原FR实施获授权backlog，C冻结逐AC证据清单，先解决59未测与17非backlog阻断后重评'},
 {'id':'DEV-03','plan':'G6-01 DoD每命令有实际输出、部署回退完整、发布版本一致','actual':'首轮A NEED_FIX，B整改V0.2后A接受；26条本地隔离步骤可核验','evidence':'docs/work/G6/G6-01_A_review.md、G6-01_B_remediation.md、G6-01_A_rereview.md；commit6255f94/e223f6d','cause':'首版关闭入口、命令证据、完整交付部署回退、版本映射分别命中ISSUE-G6-01-001—004；HTTP测试介质另有005小错','impact':'增加整改与复验次数；返工工时未知；真实KN-065仍未满足','improvement':'正式手册前锁release commit，实跑命令台账与环境指纹先验收，区分内存HTTP和PostgreSQL证据'},
 {'id':'DEV-04','plan':'G6-02最终审计挂接已接受手册、试演、版本hash和Review','actual':'首版/后续增量经过B/A复验接受，保留29与21/18/11各快照','evidence':'G6-02_A_review.md、G6-02_A_rereview.md；commit6fad770/cbc5dfb；G6-02 delivery-index.json','cause':'后续手册与接受记录未完整进入首版，旧状态表达滞后；ISSUE-G6-02-002—006记录修复','impact':'首版可用20/9不能充当最终齐套指标；重复相加会引入分母漂移','improvement':'C以同一索引日期化增量，A只引用账本；发布材料逐项挂当前接受记录而非候选快照'},
 {'id':'DEV-05','plan':'G6-03引用当前手册/审计接受和实际发布版本；C整体复核','actual':'C要求状态/来源整改后定向接受课程试演，真实现场与意见仍延期','evidence':'logs/reviews/2026-10-12_G6-03-C-review.md、2026-10-12_G6-03-C-rereview.md；commitb03de12/5ac7836','cause':'G6-01/02已完成时，答辩页脚、讲稿和移交仍保留旧候选状态；ISSUE-G6-03-002','impact':'下游材料不能直接从旧摘要继承当前结论；未取得真实现场意见不得填验收通过','improvement':'A发布前核对tasks+最新Review+页脚来源三处，版本变更只复验受影响链，现场记录独立增量'},
 {'id':'DEV-06','plan':'G6-04使用AI代码占比、打回率、复用次数、返工成本驱动复盘','actual':'G6-02四项均UNKNOWN；可统计留档Prompt块与Review文件，不能折算工时或代码比例','evidence':'G6-02 metrics-ledger AI四行；本轮ai-log-census.json','cause':'尚无可靠代码归因样本、冻结唯一首审事件集合、模式ID真实调用明细和实际返工工时账','impact':'无法证明AI节省时间或净收益；日志文件数不等于Review事件次数','improvement':'下一轮由C锁统计范围，A记录任务工时，B提供行级归因，Prompt调用明确模式ID后才核算'},
 {'id':'DEV-07','plan':'投标W1—W20及M1—M5合同里程碑；课程D18与G1—G6执行节点分轨','actual':'Git/Review有2026-09至10月实际提交记录；合同起算日及D18公历未确认','evidence':'project_plan_v1.md §1.3/§2.3；G6计划§4；key_numbers KN046—050；gaps014；git-history.txt','cause':'合同生效和教师日程无可定位确认记录；不得用Git时间猜测合同周数或实际工时','impact':'不能量化延期天数、SPI或人时偏差，日期差未知','improvement':'A获得正式起算/窗口记录后建立日历映射，提交时间只作证据时间，不当作持续工作时长'}]
dump(OUT/'deviations.json',deviations)

# The original C gap ledger remains untouched. Responsibility here is an A
# transfer proposal until B technical confirmation and C compliance review.
debt=[
 ('TD-01','真实接口和联合联动未验收','GAP007；F005/F208；KN006/007/008/009/010/060/064','消息、定位、视频、发布与联动性能未证明','B执行；A协调甲方；C复核','P0','甲方账号/接口资料/合法数据/窗口到位','逐八端口与六类资源补适配/联调，同traceId覆盖正常、无权、超时失败','原始请求响应/回执、视频首帧回放、精度/到达率及联合演练；C确认','REAL_WORLD_DEFERRED'),
 ('TD-02','真实干净环境非乙方独立部署未发生','GAP002/008；KN005/065；KN070—076建议配置仍待确认','本地26步骤不能证明独立一次成功或现场部署时限','A协调真实独立操作者；B手册/制品；C见证','P0','独立人员及甲方干净环境到位','锁制品/配置/身份，按接受手册实跑，保留失败并整改复验','身份边界、时限、每命令退出码/输出、版本、healthcheck与问题记录','REAL_WORLD_DEFERRED'),
 ('TD-03','030—039 backlog尚未实现','GAP005；tasks G4范围','30AC未实现，真实全FR覆盖不满足','后续项目负责人授权；B后端/A前端；C验收','P0','明确后续实现范围授权与资源','沿冻结设计实施原需求，逐FR/AC测试后指定Review','代码/commit、逐AC执行原始证据、RTM及Review闭环','IMPLEMENTATION_DEFERRED'),
 ('TD-04','59 NOT_RUN及17个非backlog BLOCKED','GAP006；G5-01 functional-gate-raw','76AC证据不足；KN031/032不能满足','C测试追踪；B/A实现责任','P0','完整断言、数据库与所需环境可用','按117行RTM提取这76行，逐条复跑并记录，不把套件数当AC数','每AC断言、原始locator、实际结果、缺陷与复核','EVIDENCE_DEFERRED'),
 ('TD-05','真实移动宿主、浏览器及新用户补测','G5-03三审/最终Review；F203；KN038/039/077/078','本地自动测试不足以证明宿主兼容和学习可达性','A组织真实用户；B/A适配；C验证','P1','目标手机/宿主/浏览器矩阵与新用户到位','按受控矩阵执行H5权限、上传、扫码及完整上报处置；建议下限先确认','设备/宿主版本、路径、计时与异常，保留失败；独立Review','REAL_WORLD_DEFERRED'),
 ('TD-06','目标规模性能与长期可靠/安全未验收','G5-03 three-audits/final Review；KN003/004/011/012/016—030/034—037/040—045','1160本地内存HTTP样本不能证明真实负载、保存期、可用率或完整安全','B目标环境执行；C指标/安全追踪；A协调','P0','生产等价配置、数据规模、合法安全测试与监测窗口到位','沿PE/KN逐项做数据库规模、并发、故障恢复、保留/备份及安全复测；已有本地门禁只引用','原始负载与percentile样本、故障恢复时间、长期监控、应用安全报告及逐KN判定','REAL_WORLD_DEFERRED'),
 ('TD-07','部署脚本动态时限与残留审计改进','GAP013；ISSUE-G5-02-008','下次真实部署可能遗漏动态时限或残留审计；既有NON_BLOCKING不改','B','P2','下次真实部署或脚本迭代','补动态时限、清理和残留审计，保留现有已接受部署证据','成功与失败分支、超时处理、残留清单及定向Review','OPEN_NON_BLOCKING_IMPROVEMENT'),
 ('TD-08','培训材料、签到与考核缺项','GAP003；F303；KN052','角色培训交付与实际掌握情况未证明','A统筹；B技术支持；甲方组织','P1','培训窗口与真实参与者确认','制作项目培训材料，真实培训后归档签到、录屏和考核','各角色时长、真实签到/考核与甲方确认；不从试演倒推','REAL_WORLD_DEFERRED'),
 ('TD-09','试运行及真实演练报告缺项','GAP009；F302/305/307；KN040/049/050','课程收口不满足试运行周期或竣工条件','A统筹；B监测运维；C审核；甲方确认','P0','真实初验与试运行启动记录成立','依冻结计划连续监测并执行真实演练，周期结束形成问题与整改报告','实际周期、可用率分母、演练、问题、整改和确认记录','REAL_WORLD_DEFERRED'),
 ('TD-10','真实现场意见、验收签署缺项','GAP004/011/014/015；ISSUE-G6-00-001；G6-03 C复验','无真实会议/意见/签署，不能冻结真实验收；D18日历仍未知','A协调甲方/课程窗口；B环境；C合规','P0','真实验收/现场窗口与主体确认','记录真实正常及异常分支、意见与整改；签署由实际主体完成；课程候选路径原样引用','现场原始记录、整改复验、真实签署或明确待签','REAL_WORLD_DEFERRED'),
 ('TD-11','基础业务源数据与双方确认未到位','GAP012；F301','模拟数据不能用作生产初始化与业务正确性证明','甲方提供/确认；B导入技术校验；A协调','P1','合法源数据与甲方业务确认人到位','模板/清洗映射/导入/技术校验，再由双方确认','源数据合法依据、校验、导入、业务确认及异常记录','OWNER_DATA_REQUIRED'),
 ('TD-12','AI四项量化缺可靠样本','G6-02 metrics-ledger四项UNKNOWN','不可证明代码贡献、打回率、真实复用和返工成本','A管理工时；B代码归因；C审计','P2','下一轮统计范围/样本口径接受','冻结任务或PR首审集合，记录模式调用与实际工时；历史未知继续未知','样本、分母、排除项、明细与可复算结果；不倒造历史','METRICS_UNKNOWN')]
debt_rows=[dict(zip(['id','problem','source','impact','responsibility','priority','trigger','repaymentPlan','verification','realWorldStatus'],x),plannedDate='【待人工确认】',ownerConfirmation='PENDING_B_TECHNICAL_CONFIRMATION',courseStatus='承接既有课程接受；本债务未因此真实关闭') for x in debt]
dump(OUT/'technical-debt.json',debt_rows)
debt_md='# G6-04 技术债务与真实履约补测移交\n\n主责A；V0.1送审；C符合性复核/B最终技术确认待取得。此文件是A对C唯一延期账的移交映射，不覆盖G6-02台账或历史结论。所有排期为【待人工确认】，按资源触发顺序推进，不新增合同承诺。\n\n## 三条状态线\n\n课程完成：G6-01手册与本地交付接受、G6-02审计包接受、G6-03课程模拟试演接受。真实履约：REAL_WORLD_DEFERRED，六类系统0/6、独立操作者0、真实签署待签。后续补测：责任人取得资源后按下列验证条件关闭，只有指定复核人接受才更新真实状态。\n'
for d in debt_rows:
    debt_md+=f"\n## {d['id']} {d['problem']}\n\n"+'\n'.join(f'- {k}：{d[v]}' for k,v in [('来源','source'),('影响','impact'),('责任','responsibility'),('优先级','priority'),('触发条件','trigger'),('偿还计划','repaymentPlan'),('验证方式','verification'),('真实状态','realWorldStatus'),('计划日期','plannedDate'),('责任接受','ownerConfirmation')])+'\n'
debt_md+='\n## C原缺项逐项覆盖\n\nGAP001手册已接受；GAP002→TD02；GAP003→TD08；GAP004→TD10；GAP005→TD03；GAP006→TD04；GAP007→TD01；GAP008→TD02（真实KN-065仍延期）；GAP009→TD09；GAP010→本轮总结候选（待C/B，尚未关闭）；GAP011→TD10；GAP012→TD11；GAP013→TD07；GAP014→TD10；GAP015以G6-03最新C接受为当前课程结论，候选路径保留，真实部分→TD10；GAP016引用G6-02接受、不重评。原账快照不倒改。\n\n## 接收与关闭规则\n\nB逐项确认技术影响、KN范围、偿还顺序及可验证性；C核对所有延期未漏、课程/真实分列、甲方责任与P1验收不弱化。A只协调和整合。真实资源未到位不填完成日期，不代甲方签署；新结果通过C唯一RTM/指标/交付索引日期化增量挂接。\n'
write(WORK/'technical_debt_transfer.md',debt_md)

baseline=f'# G6-04 事实基线\n\n主责A；V0.1；输入master `{SNAP}`；发布应用版本 `75f01c3bb33369d3785acf69a3a00eb983aa188b`。G6-01/02/03既有结论只引用。\n\n## 1 项目阶段基线\n\n| 阶段 | 目标 | 主要产物 | 冻结/接受状态 | 来源 |\n| --- | --- | --- | --- | --- |\n'
for row in stages: baseline+='| '+' | '.join(row)+' |\n'
baseline+='\n## 2 计划基线\n\n项目计划v1 §2.3的WBS1.1—6.x使用合同相对周W1—W20，合同起算日未知；KN046—050的合同M1—M5与课程M2/M3/G1—G6不能互换。G3 plan.md原子任务≤0.5人日是计划上限，不是实际工时。G6计划D18是课程第18工作日，公历日期未知。以下完整任务表为启动Git快照引用，各任务计划时间继承所属计划；未明确时间写未知。\n\n'
baseline+='| 任务 | 主责/复核 | 计划时间/依据 | 输入状态 |\n| --- | --- | --- | --- |\n'
for line in source('tasks.md').splitlines():
    if re.match(r'^\| G[1-6]-',line):
        cells=[x.strip() for x in line.strip('|').split('|')]
        stage=cells[0][:2]
        owner=(cells[3]+'/'+cells[4]) if stage=='G4' else cells[2]+'/'+cells[3]
        when={'G1':'D1—D4建议，实际日历未知；项目计划v1为合同周','G2':'依tasks前置；具体日历计划未知','G3':'plan.md D0—D3/M3依赖；具体日历计划未知','G4':'tasks Sprint1/2及G4-00计划；日历未知','G5':'g5_quality_gate_plan.md阶段门禁；具体日历未知','G6':'g6_delivery_acceptance_plan.md D18门禁；公历未知'}[stage]
        baseline+=f'| {cells[0]} | {owner} | {when} | {cells[-1]} |\n'
baseline+='\n## 3 实际执行\n\nGit日期为提交事件时间，作者不自动等于真实操作者，主责按tasks。完整Git历史见evidence/g6/G6-04/git-history.txt；任务启动快照见task-snapshot.md。下列commit均属于启动master历史。\n\n'
for stage,goal,products,state,path in stages:
    event=git('log',SNAP,'-1','--format=%H %aI %an %s','--',path).decode().strip()
    baseline+=f'- {stage}：实际产物 {products}；责任按任务快照；来源 `{path}`；该来源最近提交事件 `{event}`；结论 {state}。\n'
baseline+='\nG6-01主责B，A复验2026-10-12/e223f6d；G6-02主责C，B整体6fad770及A一致性cbc5dfb；G6-03主责A，C最终2026-10-12/5ac7836，回填3b47e8f。实际Review内容分别见G6-01_A_rereview、G6-02_A_rereview及G6-03-C-rereview。Prompt逐文件/行号见ai-log-census.json，真实人时未知。\n\n## 4 偏差列表\n'
for d in deviations:
    baseline+=f"\n### {d['id']}\n\n"+'\n'.join(f'- {k}：{d[v]}' for k,v in [('计划','plan'),('实际','actual'),('依据','evidence'),('原因','cause'),('影响','impact'),('改进措施','improvement')])+'\n'
baseline+='\n## 5 数据与结论锁定\n\nG6-02指标账是总结唯一验收数字来源。39FR/34★/117AC、11/59/47、★1/33、1160本地样本失败0、首版29项20/9及三段21/18/11分别引用，不相加。真实甲方联调0/6与独立操作者0均为有证据的零；AI四项未知不写零。G6-04新增日志数量仅为启动快照留档计数附件，不改变C指标账。\n'
write(WORK/'G6-04_fact_baseline.md',baseline)

report='# 项目开发总结报告\n\nV0.1 G6-04送审；编制何思源；C符合性与B技术确认待取得。\n\n## 1 项目概述\n\n本报告整理应急管理子系统从G1到G6的受控事实、执行偏差、AI证据、技术债务与移交条件。系统以数字化预案为核心、指挥中心为枢纽、移动处置为延伸，覆盖事前、事发、事中、事后。范围继承F001—010及F100—138：Web、H5、数据接口与配套文档培训，共11模块；既有系统硬件及自身改造、定位基础设施采购、地图重测绘、原生APP不默认属于乙方范围，接口适配与验证责任保留。\n\n当前G6-01手册与本地交付复核接受、G6-02审计包接受、G6-03课程模拟试演接受；G6-04本件仍待C整体符合性复核和B最终技术确认。课程状态与真实履约分列。真实甲方接口、现场意见、独立部署、培训、试运行、签署及未实现/未测AC继续延期，没有真实验收通过结论。\n\n表 1-1 受控结果与统计边界\n\n| 指标 | 值 | 来源和边界 |\n| --- | --- | --- |\n| FR与★FR与AC | 39 / 34 / 117 | G6-02 metrics-ledger；冻结分母 |\n| AC实际结果 | 11 PASS / 59 NOT_RUN / 47 BLOCKED | G6-02账本与G5原始执行；不由测试套件转算 |\n| ★FR实际结果 | 1 PASS / 33 BLOCKED | G6-02账本；全部AC满足才整FR通过 |\n| 性能样本 | 1160，失败0 | G6-02账本；仅本地内存HTTP和模拟适配 |\n| 历史首版交付索引 | 29项，20可用/9缺项 | G6-02账本；存在性不等于接受 |\n| 三段增量 | 21 / 18 / 11项 | G6-02账本；不同快照，不与29混算 |\n| 真实联调/独立部署人员 | 0/6 / 0人 | G6-02账本；已证实缺资源 |\n| 当前手册 | 共20页；本地26步骤失败0 | G6-02账本；历史22页不充当现版页数 |\n\n## 2 项目实施过程回顾\n'
for stage,goal,products,state,path in stages:
    report+=f'\n### 2.{len(report.split("### 2."))} {stage}\n\n目标为{goal}，形成{products}。当前引用结论为{state}。依据为{path}及tasks启动快照；阶段过程与责任详见G6-04事实基线。不得将需求或设计冻结视作功能、性能或真实履约已经验收。\n'
report+='\n## 3 计划与实际偏差分析\n\n投标合同周、课程关卡和Git提交时间分轨记录；未知的合同起点、公历计划日和实际工时不填数。偏差归因只使用已登记Issue、Review和资源就绪证据，不以“资源不足”或“任务复杂”代替原因。\n'
for d in deviations:
    report+=f"\n### 3.{d['id'].split('-')[1].lstrip('0')} {d['id']}\n\n"+'\n\n'.join(f'{k}：{d[v]}' for k,v in [('计划','plan'),('实际','actual'),('证据','evidence'),('原因','cause'),('影响','impact'),('改进','improvement')])+'\n'
report+=f'''\n## 4 AI辅助开发分析\n\n### 4.1 留档使用量与范围\n\n启动master快照下，受控Prompt日志文件{counts['promptFiles']}份，文件内明确USER_PROMPT_RAW标题块{counts['archivedRawPromptBlocks']}个；Review目录Markdown记录{counts['reviewMarkdownFiles']}份。数据来自evidence/g6/G6-04/ai-log-census.json，可按文件/行号/Git blob hash复算，扫描仅纳入启动快照logs/prompts与logs/reviews，排除本轮G6-04、隔离备份、引用围栏中的标题和JSON镜像。Prompt块数是已归档原文块数，不是全部真实用户调用次数；历史摘要式日志可能没有该标识，总调用次数未知。Review文件数是可核验留档数量，唯一Review事件次数未知，不能据此计算打回率。\n\nAI辅助范围由Prompt与对应commit/Review共同印证：G1事实解析、建议书/投标/计划及正式件排版；G2需求规格、RTM、原型与澄清返工；G3设计/OpenAPI/ADR、计划及一致性；G4正式前后端、测试护栏、模拟接口和PR证据；G5测试执行组织、报告/三审及延期盘点；G6两手册、交付索引、答辩/试演及本轮复盘归档。生成或修改内容必须按对应Task实际产物确认，Git作者与文件存在不能证明AI逐行贡献。\n\n本轮A使用AI编制事实基线、偏差明细、日志留档计数、债务移交、总结内容与Reference继承、归档指纹及审计脚本。未新增业务功能，没有修改历史测试结果或执行真实甲方验收。\n\n### 4.2 四项量化指标与未知\n\n表 4-1 G6-02唯一AI指标账引用\n\n| 指标 | 当前值 | 分母或样本与原因 |\n| --- | --- | --- |\n| AI代码占比 | 未知【待人工确认】 | 无可靠行级归因样本；作者不是AI归因 |\n| 评审打回率 | 未知【待人工确认】 | 未冻结唯一任务/PR首审事件集合；复验不可重复计首审 |\n| Prompt复用次数 | 未知【待人工确认】 | 缺模式ID真实调用明细；相似措辞不算复用 |\n| 返工成本 | 未知【待人工确认】 | 无实际返工工时记录；提交间隔不是工时 |\n\n来源为G6-02 metrics-ledger.md四项UNKNOWN原行；没有新填0，也不估计节省时间或净收益。\n\n### 4.3 有证据的返工\n\nG6-01首版A要求整改，B修复关闭入口、命令真实性、部署回退与版本映射后A复验接受；G6-02增量与审计状态整改后B/A接受；G6-03状态与来源整改后C接受。各轮Review原文和commit均在归档索引可定位，返工事实成立但其人工工时、AI责任占比和净收益未知。G1呈现返工、G2需求深化及G4翻车记录按原记录引用，不将所有返工归因为AI。\n'''
report+='\n## 5 技术债务\n\n以下为A移交建议，责任接受和技术范围待B确认，完整来源、触发器和验证方式见technical_debt_transfer.md及technical-debt.json。所有日期【待人工确认】；未满足KN、真实延期与backlog不删除。\n'
for d in debt_rows:
    report+=f"\n### 5.{int(d['id'].split('-')[1])} {d['id']} {d['problem']}\n\n来源：{d['source']}。影响：{d['impact']}。\n\n责任：{d['responsibility']}；优先级{d['priority']}；触发条件：{d['trigger']}。\n\n偿还计划：{d['repaymentPlan']}。验证方式：{d['verification']}。当前{d['realWorldStatus']}；计划日期{d['plannedDate']}。\n"
report+='''\n## 6 项目经验与流程改进\n\n### 6.1 先锁事实再制作正式件\n\nA在正式文档生成前维护唯一事实源索引，数字只取C指标账，章节锁定后再物理复制对应Reference并排版。新增数量附件单列统计对象，防止首版29项、后续增量和当前存在性混算。依据DEV04；验收标准为报告每个数字可回指口径与快照。\n\n### 6.2 先实跑命令再发布手册\n\nB在手册送审前逐命令保存环境、发布commit、时间、退出码及原始输出，A核对台账、配置和制品hash。HTTP内存证据与数据库/部署证据分列。依据G6-01整改；验收标准为命令均可追溯，失败原样保留。\n\n### 6.3 发布材料检查当前状态来源\n\nA每次提交PPT或总结前同时核对tasks、最新接受Review、材料页脚，历史候选保留原名和时点。依据G6-03整改；验收标准为当前状态没有引用旧待审结论，受影响链定向复验。\n\n### 6.4 逐AC验收与资源检查前置\n\nC从冻结117行AC产生补测清单，B/A仅在明确断言与资源就绪后执行。A开联调前取得甲方账号、合法数据、窗口和独立部署主体确认；所有模拟标识持续保留。依据DEV01/02；验收标准为真实延期只有原始证据与指定复核齐全才关闭。\n\n### 6.5 AI度量按实际事件留证\n\n下一轮由C先定义唯一首审分母及模式ID，B记录行级AI生成/人工重写归因，A记录实际工时。现有未知保持未知，不能通过复盘倒造。依据DEV06；验收标准为每项指标有样本/排除项/可复算明细。\n\n## 7 归档与最终移交条件\n\nA最终INDEX以C唯一交付索引为上游映射，补充本轮受控产物及Git/Prompt/Review/测试证据的路径、版本、hash和状态，不另建验收分母。历史条目hash按原canonical Git blob验证，当前物理文件指纹与Git行尾转换分开。INDEX自身不自哈希，当前日志/任务状态等收口可变文件由下一次提交外部Git对象校验，避免无限自引用。\n\nG6-04须完成A一致性、C整体符合性复核与B最终技术确认。真实现场意见与签署仍待取得，课程条件接受不自动生成真实验收PASS。本件未冻结；待审项见G6-04_A_self_review.md及review-request.md。债务接收、当前INDEX和实际复核记录齐全后才允许迁移状态；真实验收另按P1办理。\n'''
write(WORK/'G6-04_project_development_summary.md',report)
print(json.dumps({'counts':counts,'deviations':len(deviations),'debt':len(debt_rows),'snapshot':SNAP},ensure_ascii=False))
