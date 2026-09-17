from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path('docs/reference/11-概要设计说明书（教学样例）.docx'); O=Path('docs/deliverables/11-概要设计说明书.review.docx'); W=Path('docs/work/A_PM/overview_design.md'); A=Path('docs/work/A_PM/g3_03_figures');A.mkdir(exist_ok=True)
def ft(n,b=False):
 try:return ImageFont.truetype('C:/Windows/Fonts/simhei.ttf' if b else 'C:/Windows/Fonts/simsun.ttc',n)
 except:return ImageFont.load_default()
def image(n,title,items):
 im=Image.new('RGB',(1600,700),'white');d=ImageDraw.Draw(im);d.text((40,25),title,font=ft(36,1),fill='black')
 for i,(h,x) in enumerate(items):
  l=40+i*390;d.rectangle((l,180,l+310,520),outline='black',width=4,fill='#f2f2f2');d.multiline_text((l+20,220),h+'\n\n'+x,font=ft(24),fill='black',spacing=10)
  if i<3:d.line((l+310,350,l+380,350),fill='black',width=4)
 im.save(A/(n+'.png'))
image('tech','高层技术架构',[('渠道','Web\n大屏\nH5'),('统一边界','MOD-PLATFORM\n鉴权 审计 traceId'),('领域模块','预案 事件 任务\n资源 值班 演练'),('外部端口','视频 发布 安防\nIoT 中台 消息')])
image('flow','领域数据流',[('业务写入','唯一写入主责'),('持久化','业务ID 外部ID\n四类时间'),('派生','通知 读投影\n外部适配'),('处置','回执 失败\n人工降级')])
image('deploy','逻辑部署与故障域',[('渠道/API','Web 大屏 H5'),('业务','模块化应用\n持久化任务'),('适配','独立端口\n限时/重试'),('观测','日志 健康\n恢复演练')])
image('integration','集成架构',[('应急系统','MOD-INTEGRATION'),('既有平台','中台 视频 消息'),('安防物联','发布 入侵 门禁\\n消防 IoT'),('联动证据','traceId/eventId\n失败降级')])
D=Document(R); body=D._element.body; sec=body.sectPr
for e in list(body)[16:]:
 if e is not sec:body.remove(e)
for p in D.paragraphs:
 for a,b in {'LTPT-2026-G3-11':'EM-G3-03','V3.0':'V0.2（评审稿）','内部 · 教学用':'内部 · 评审用','“澜图”遥感影像智能解译与地物提取平台建设项目':'某自然博物馆智能运营中心建设项目','（教学样例）':'','通关实训第 3 组':'项目组','乙（架构师）':'A（项目负责人）【待人工确认】','甲（项目经理）':'C（需求与符合性复核）【待人工确认】','评委会（M2 设计评审）':'【待 C Review】','2026 年 8 月 21 日':'2026 年 9 月 17 日','本表记录自初稿以来的全部版本沿革；逐次修订的详细影响面分析见正文相关章节与变更单。':'本表记录本概要设计的受控版本沿革；本版待 C 复核。'}.items():
  if a in p.text:
   for r in p.runs:r.text=r.text.replace(a,b)
t=D.tables[0]
for r in t.rows:
 for c in r.cells:
  for p in c.paragraphs:
   for x in p.runs:x.text=x.text.replace('V1.0','V0.2').replace('2026-08-19','2026-09-17').replace('首版，随设计冻结发布（D8）','完整重构为本项目概要设计评审稿').replace('乙','A【待人工确认】')
# Review correction: replace complete cover paragraphs and retain only the one true project revision row.
cover={0:'文档编号：EM-G3-03　　版本号：V0.2（评审稿）',1:'密　　级：内部 · 评审用',3:'某自然博物馆智能运营中心建设项目——应急管理子系统',4:'概要设计说明书',7:'编制单位：项目组【待人工确认】',8:'编　　制：A（项目负责人）【待人工确认】',9:'审　　核：C（需求与符合性复核）【待人工确认】',10:'批　　准：【待 C Review】',11:'编制日期：2026 年 9 月 17 日'}
for i,text in cover.items():
 D.paragraphs[i].clear();D.paragraphs[i].add_run(text)
while len(t.rows)>2:t._tbl.remove(t.rows[-1]._tr)
for c,text in zip(t.rows[1].cells,['V0.2','2026-09-17','全部','首次形成概要设计评审稿，待 C 复核','A【待人工确认】']):
 c.paragraphs[0].clear();c.paragraphs[0].add_run(text)
def h(x,l=1):D.add_paragraph(x,style='Heading '+str(l))
def p(x):D.add_paragraph(x)
def tab(cap,heads,rows):
 t=D.add_table(rows=1,cols=len(heads))
 for c,x in zip(t.rows[0].cells,heads):c.text=x
 for row in rows:
  for c,x in zip(t.add_row().cells,row):c.text=x
 q=D.add_paragraph(cap);q.alignment=WD_ALIGN_PARAGRAPH.CENTER
 for r in q.runs:r.bold=True
def pic(f,cap):
 q=D.add_paragraph();q.alignment=WD_ALIGN_PARAGRAPH.CENTER;q.add_run().add_picture(str(A/f),width=Inches(6.0));q=D.add_paragraph(cap);q.alignment=WD_ALIGN_PARAGRAPH.CENTER
 for r in q.runs:r.bold=True
chapters=[
('1 引言','本说明书依据受控 SRS、spec、RTM、G3-01R、G3-02、constitution 与控制台账，定义应急管理子系统的高层设计。覆盖总体、技术、功能、数据、部署、集成、安全、非功能、接口概述、运行、出错、追踪与演进；不冻结 DLD、DBD、OpenAPI 或 ADR。',('表 1-1 设计原则',['原则','约束','回指'],[('单一写入主责','领域对象唯一写入模块','G3-01R'),('先提交后派生','外部失败不回滚业务提交','AC-014-01'),('端口隔离','业务决策不下沉适配器','KN-064'),('可验证','未测不写通过','PE-01—12')])),
('2 总体设计','系统服务 Web、大屏与 H5；统一中台和既有平台提供通用能力，本系统承担应急业务规则、关联、审计与失败处理。ARC-A 是 Proposed 候选，须后续 ADR 和人工决策。',None),
('3 技术架构','渠道仅经 MOD-PLATFORM 访问领域模块；公共能力提供鉴权上下文、traceId、审计、幂等、错误和健康检查；外部协议由 MOD-INTEGRATION 隔离。',('表 3-1 技术分层',['层次','职责','元素'],[('渠道','展示和交互','Web、大屏、H5'),('边界','统一入口和治理','MOD-PLATFORM'),('领域','业务与数据主责','PLAN/EVENT/TASK/RESOURCE等'),('投影/适配','读模型与端口隔离','SITUATION/INTEGRATION')])),
('4 功能架构','MOD-PLAN 管预案，MOD-EVENT 管事件，MOD-TASK 管处置，MOD-SITUATION 管可重建读投影，MOD-RESOURCE 管人员物资，MOD-DUTY 管值班，MOD-DRILL 管演练，MOD-KNOWLEDGE 管知识，MOD-MOBILE 管 H5，MOD-INTEGRATION 管端口，MOD-PLATFORM 管横切能力。',('表 4-1 模块与需求覆盖',['模块','主责','FR'],[('PLAN/EVENT/TASK','预案、事件、任务','001—003、013—016、020、022'),('SITUATION/RESOURCE','态势、人员、物资、盘点','004—009、025、026、039'),('DUTY/DRILL/KNOWLEDGE','值班、演练、知识','010—012、017—024、036、038'),('MOBILE/INTEGRATION/PLATFORM','渠道、端口、公共能力','021—029；横切001—039')])),
('5 数据架构','数据按领域拥有：预案、事件、任务、资源、值班、演练、知识各有唯一写入主责；所有跨系统记录保留业务标识、外部标识、traceId 与业务发生/源产生/系统接收/处理时间。MOD-SITUATION 仅为可重建投影。物理设计留待 G3-04。',('表 5-1 数据治理边界',['数据','规则','后续'],[('业务事实','唯一写入、逻辑删除、审计','G3-04/05'),('跨系统关联','ID、traceId、四类时间','G3-06'),('投影','可重建，不反写事实','G3-05'),('审计','操作、授权、调用、结果','G3-07')])),
('6 部署架构','甲方内部环境私有化容器部署，配置、凭据和日志不进入制品。渠道/API、领域业务、外部适配、数据与观测是逻辑故障域；KN-070—078 为建议，待容量、网络、存储和恢复验证。',('表 6-1 故障域',['故障域','隔离与恢复'],[('渠道/API','限时、鉴权、健康检查'),('领域业务','先持久化，再派生'),('外部适配','有限重试、审计、人工降级'),('数据/观测','备份恢复、关联日志、告警')])),
('7 集成架构','EXT-VIDEO、EXT-PUBLISH、EXT-INTRUSION、EXT-ACCESS、EXT-FIRE、EXT-IOT、EXT-MIDDLE、EXT-MESSAGE 保持独立逻辑语义。ISSUE-G3-01-001 OPEN：字段、认证、回执和性能待验证，禁止冻结或宣称连通。',('表 7-1 端口边界',['端口','责任','状态'],[('VIDEO/PUBLISH','关联、授权、回执、降级','PENDING_INTERFACE_VALIDATION'),('INTRUSION/ACCESS/FIRE','独立语义、审计、失败处置','PENDING_INTERFACE_VALIDATION'),('IOT/MIDDLE/MESSAGE','校验去重、身份消息关联','PENDING_INTERFACE_VALIDATION')])),
('8 安全架构','采用统一认证授权、最小权限、输入校验、敏感操作审计、凭据外置、脱敏日志和私有化分区。安全要求与高危漏洞、审计留存、扫描门禁均是后续验证条件，不宣称实测通过。',('表 8-1 安全措施',['层面','措施','验证'],[('身份权限','统一上下文、最小权限','AC-013-03'),('接口','校验、幂等、统一错误','AC-020-02'),('数据日志','脱敏、逻辑删除、审计','KN-042—045'),('部署','内网、凭据外置','KN-005、040')])),
('9 非功能设计','按 GB/T 25000.10 组织性能效率、可靠性、安全性、兼容性、可维护性与可移植性。预案≤3秒、告警≤2秒、定位≤2秒、视频≤3秒、95%页面≤3秒、峰值≥100人、试运行≥99.5%、MTTR≤2小时均为待测要求。',('表 9-1 NFR 映射',['特性','机制','追踪'],[('性能','预算、读投影、限时','PE-01—12'),('可靠性','持久化、恢复、降级','KN-040、041'),('安全','授权、审计、扫描','KN-042—045'),('可移植','容器、配置外置','KN-005、038')])),
('10 接口设计概述','内部服务经 MOD-PLATFORM 统一边界暴露；版本、鉴权、traceId、幂等、错误和审计为共性约束。【待 G3-06 固化】字段、OpenAPI Schema、外部认证细节和版本策略。',None),
('11 运行设计','渠道请求先鉴权校验并生成 traceId；领域提交成功后再派生通知、适配调用和态势投影。外部不可用保持业务状态，记录失败、有限重试和人工降级；控制指令不自动重放。',('表 11-1 运行控制',['场景','规则','证据'],[('提交','先持久化','业务ID/traceId'),('外部失败','保留状态、人工降级','调用审计'),('控制调用','二次确认，不自动重放','授权/回执'),('恢复','健康检查、演练','监控记录')])),
('12 出错处理设计','无权或输入错误不形成不完整状态；外部超时记录请求/结果并转人工；重复或迟到回执按幂等键关联；安全联锁失败等待人工处置。',('表 12-1 错误处理',['类别','原则','回指'],[('无权/输入','拒绝、统一错误','AC-013-03'),('超时失败','有限重试、降级','AC-020-02、029-03'),('重复迟到','幂等关联','RCLR-001、008'),('联锁失败','不自动重放','AC-029-03')])),
('13 设计追踪、未解决问题与演进','ARCH-01 统一边界、ARCH-02 事件任务、ARCH-03 资源快照、ARCH-04 外部端口、ARCH-05 安全运行分别锚定 FR/AC/PE/KN/RCLR。G3-08 仍须完成 39 FR、34 ★FR、117 AC 的逐条双向 RTM。未决：ISSUE-G3-01-001、地图坐标/楼层、宿主矩阵、部署资源；分别待 G3-04—07 主责固化。',('表 13-1 演进路径',['项','触发','处置'],[('应用拆分','容量/故障证据','ADR Proposed 后人工决策'),('读模型','态势/报表压力','保留迁移边界'),('适配独立部署','协议风险/隔离需要','依据联调压测')]))]
for title,text,table in chapters:
 h(title);p(text)
 if title.startswith('2 '):pic('tech.png','图 2-1 高层技术架构图')
 if title.startswith('5 '):pic('flow.png','图 5-1 领域数据流图')
 if title.startswith('6 '):pic('deploy.png','图 6-1 逻辑部署与故障域图')
 if title.startswith('7 '):pic('integration.png','图 7-1 集成架构图')
 if title.startswith('11 '):pic('flow.png','图 11-1 运行处理流程图')
 if table:tab(*table)
D.save(O)
W.write_text('# G3-03 概要设计说明书（工作稿）\n\n状态：SELF_CHECKED / REVIEW。受控输入为 SRS、spec、RTM、G3-01R、G3-02、constitution、facts、key_numbers、issues。\n\n'+ '\n\n'.join('## '+x[0]+'\n\n'+x[1] for x in chapters),encoding='utf8')
print('done')




