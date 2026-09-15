from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'docs' / 'deliverables' / '08-软件需求规格说明书SRS.docx'


def find(doc, start):
    for p in doc.paragraphs:
        if p.text.startswith(start):
            return p
    raise ValueError(start)


def set_text(p, text):
    p.clear()
    p.add_run(text)


def apply_caption_format(p, source):
    source_ppr = source._p.pPr
    if p._p.pPr is not None:
        p._p.remove(p._p.pPr)
    if source_ppr is not None:
        p._p.insert(0, deepcopy(source_ppr))
    if source.runs and p.runs and source.runs[0]._element.rPr is not None:
        target = p.runs[0]._element
        if target.rPr is not None:
            target.remove(target.rPr)
        target.insert(0, deepcopy(source.runs[0]._element.rPr))


def insert_para_after(anchor, text, style=None):
    p = anchor._parent.add_paragraph(text, style=style)
    (anchor._p if hasattr(anchor, '_p') else anchor._tbl).addnext(p._p)
    return p


def set_cell(cell, text, header=False):
    cell.text = text
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for p in cell.paragraphs:
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        for run in p.runs:
            run.font.name = '宋体'
            run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
            run.font.size = Pt(8.5)
            run.bold = header


def repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    node = OxmlElement('w:tblHeader')
    node.set(qn('w:val'), 'true')
    tr_pr.append(node)


def table_after(doc, anchor, caption, headers, rows, style, caption_source, widths=None):
    cap = insert_para_after(anchor, caption)
    apply_caption_format(cap, caption_source)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.keep_with_next = True
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = style
    table.autofit = False
    cap._p.addnext(table._tbl)
    for cell, text in zip(table.rows[0].cells, headers):
        set_cell(cell, text, True)
    repeat_header(table.rows[0])
    for values in rows:
        cells = table.add_row().cells
        for cell, text in zip(cells, values):
            set_cell(cell, text)
    if widths:
        for row in table.rows:
            for cell, width in zip(row.cells, widths):
                cell.width = width
    return table


doc = Document(PATH)
table_style = doc.tables[-1].style
caption_source = find(doc, '图 1-1')

# Controlled front matter and previously generated wording are updated in place.
set_text(doc.paragraphs[0], 'YJGL-G2-03    V1.1')
set_text(doc.paragraphs[11], '编制日期：2026 年 9 月 15 日')
set_text(doc.paragraphs[10], '批    准：【待人工确认】')
set_text(doc.paragraphs[14], '注：业务内容以 G2-R03 深化后的受控 SRS 工作稿为准；教学样例仅用于承载结构和版式。')
set_text(find(doc, '本说明书将第二关已确认'), '本说明书以39条受控功能需求为基础，形成可独立阅读、可评审、可验证的需求规格，为spec.md、反向澄清、RTM、设计和测试提供统一输入。本文中的“验证”表示应形成可复核证据，不表示接口、环境或能力已经验收通过。')
set_text(find(doc, '下表中的验收标准均为当前'), '下表保留39条受控功能需求及既有验收标准。G2-R03补充的流程、状态、字段和量化要求仅深化需求语义；影响AC的细化项明确列为G2-R05的spec/RTM待同步项。')
set_text(find(doc, '5.2 数据质量'), '5.3 数据质量与来源')
set_text(find(doc, '5.3 数据安全'), '5.4 数据安全与审计')
set_text(find(doc, '6.1 性能与容量'), '6.1 PE性能指标与容量')
set_text(find(doc, '系统应支持 7×24'), '系统对外部依赖应独立超时、告警和降级，不得静默阻断核心事件流程；控制类动作及不可证明幂等的调用不得自动重放。具体量化要求见表6-3。')
set_text(find(doc, '系统应实施认证'), '安全要求见表6-4。正式定级备案、基础环境合规和正式第三方等保测评由甲方组织；本要求不宣称上述活动已完成。')
set_text(find(doc, 'Web、H5、宿主 APP'), '关键操作不超过3个页面跳转；新用户应在≤2小时完成完整上报处置学习目标。兼容Chrome/Edge最新2个稳定版本；H5嵌入甲方既有宿主APP，不交付独立原生APP。关键操作应提供明确状态、失败原因和下一步，状态不得只靠颜色表达。')
set_text(find(doc, '接口、错误码、配置'), '接口、错误码、配置、部署、恢复和运维操作应形成文档；核心模块单元测试覆盖率≥70%，39条FR功能覆盖率与验收用例通过率均为100%。非乙方人员按手册在干净环境一次部署成功，用时≤2小时。')
set_text(find(doc, 'G2-04 应在'), 'G2-R05应在spec.md中使用本文件相同的G2-FR和AC编号，并将本轮标记为“spec/RTM待同步”的可观察规则补入双镜像。RTM至少追踪原始FR、G2-FR、用户故事、AC、G2-RCLR、设计、实现、测试和结果；任何编号、范围或验收语义差异均阻断M2返工准出。')

# Revision history is a layout table and has no business-table caption.
history = doc.tables[0]
if not any(row.cells[0].text.strip() == 'V1.1' for row in history.rows[1:]):
    cells = history.add_row().cells
    for cell, value in zip(cells, ('V1.1', '2026-09-15', '第3、5、6、10章', 'G2-R03深化核心流程、状态模型、字段字典与PE/NFR量化表，重建正式件并完成自动渲染QA。', '何思源')):
        set_cell(cell, value)

# Captions for all retained independent business tables; captions inherit the Reference Caption style.
requirements = [('表 3-1 数字预案与事件处置功能需求', 1), ('表 3-2 指挥态势、视频与定位功能需求', 2), ('表 3-3 演练、移动执行与值班物资功能需求', 3), ('表 3-4 外部联动与中台业务适配功能需求', 4), ('表 3-5 非MVP、本期范围功能需求', 5), ('表 4-1 外部接口需求', 6)]
for caption, index in reversed(requirements):
    table = doc.tables[index]
    p = doc.add_paragraph(caption)
    apply_caption_format(p, caption_source)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    table._tbl.addprevious(p._p)

# Requirement-level business flows and state models are placed before chapter 4.
anchor = find(doc, '4 外部接口需求')
states = [
('事件', '已接报→待核实→已核实→处置中→待关闭→已关闭；驳回核实可标记无效并留痕。', '核实超时仅提醒升级，不自动生效或启动；关闭前须完成强制评估、调查和报告。', 'FR-013—016；RCLR-001、002、004、010'),
('处置任务', '待下发→已下发→已接收→执行中→待复核→已完成/已归档。', '重指派完整留痕且默认不改截止时间；逾期、下发失败、迟到回执可追溯。', 'FR-003、015、022；RCLR-003、008'),
('演练', '草稿→已发布→待执行→执行中→待评估→已完成；整改可待复核/关闭。', '取消、逾期、未完成均不计完成；补演关联原计划并保留原异常。', 'FR-010—012、023；RCLR-007'),
('盘点', '草稿→已发布（快照形成）→盘点中→待复核→已确认/已调整。', '期间变动独立记录；差异不得绕过复核直接调整。', 'FR-009、025；RCLR-006'),
('打卡', '规则草稿→已生效→待打卡→有效/无效打卡→统计归档。', '过期或校验不符为无效；重复扫码幂等；缺卡与迟到回执历史保留。', 'FR-017—020、024、032；RCLR-005、008'),
('位置与消息', '位置：有效→过期→恢复有效；消息：待发送→已发送→已回执/失败/降级处置。', '过期位置禁止自动调派；迟到回执更新最终送达但不删除过程历史。', 'FR-005、020、022；RCLR-008、009'),
]
flows = [
('事件接报、核实与关闭', '接报→创建/关联→人工核实→授权启动预案→任务→反馈/评估/调查/报告→关闭。', '可靠ID重复接收仅更新/续报；无ID相似告警人工关联；核实超时不自动启动。', 'FR-013—016、027；RCLR-001、002、004、010；spec/RTM待同步'),
('任务下发、执行与重指派', '预案启动/临时创建→下发/接收→反馈、催办→完成→复核/归档。', '重复请求不重复建任务；重指派和显式改期审计；消息异常不丢失确认状态。', 'FR-003、015、022；RCLR-003、008、010；spec/RTM待同步'),
('演练与补演', '发布计划→周期下发→执行取证→评估/整改→复核→统计。', '取消/未完成不计完成；补演保留原计划和逾期历史。', 'FR-010—012、023；RCLR-007；spec/RTM待同步'),
('盘点与物资调整', '发布计划并形成快照→实盘→快照比对→复核期间变动→授权调整。', '正常出入库独立记录；未复核不得形成最终调整。', 'FR-008、009、025；RCLR-006；spec/RTM待同步'),
('值班打卡与告警', '发布规则→扫码校验→有效记录→统计；缺卡/超时触发消息。', '过期码拒绝；重复扫码幂等；超时、重试、降级和迟到回执历史保留。', 'FR-017—020、024、032；RCLR-005、008；spec/RTM待同步'),
('位置态势与受权联动', '接收位置→展示新鲜度→有效数据研判/调派；确认后门禁联锁执行。', '过期仅显示最后有效位置；联锁失败告警并人工降级，不绕过或自动重试控制。', 'FR-005、029；RCLR-009；spec/RTM待同步'),
]
p = insert_para_after(anchor, '3.6核心业务流程与异常路径。表3-6覆盖主路径及异常路径；其可观察规则将在G2-R05同步至spec.md和RTM。', 'Heading 2')
t = table_after(doc, p, '表 3-6 核心业务流程及异常路径', ['流程', '主路径', '异常/边界路径', '追踪与待同步'], flows, table_style, caption_source, [Cm(3), Cm(5), Cm(5), Cm(4)])
p = insert_para_after(t, '3.7核心状态模型。表3-7仅定义需求级可观察状态与迁移约束，不规定技术实现。', 'Heading 2')
table_after(doc, p, '表 3-7 核心业务状态模型', ['对象', '正常状态与迁移', '异常/受限规则', '来源'], states, table_style, caption_source, [Cm(2.2), Cm(5.4), Cm(6), Cm(4.2)])

# Requirement-level field dictionary is placed before data quality.
anchor = find(doc, '5.3 数据质量')
fields = [
('应急预案', 'planId、名称、状态、适用场景', '草稿/已发布/停用；关联版本、模板和事件。', 'FR-001—003'),
('预案版本', 'versionId、版本号、生效状态', '发布后作为启动依据，可追溯。', 'FR-001'),
('预案任务模板', 'templateId、任务名称、责任组、时限', '缺关键关系不得发布，启动时生成任务。', 'FR-002、003'),
('应急事件', 'incidentId、类型、状态、发生时间', '含待核实/核实超时/处置/关闭；关联续报、任务、附件。', 'FR-013—016'),
('事件续报', 'updateId、业务时间、接收时间、内容', '迟到标识且不覆盖历史。', 'RCLR-001、004'),
('处置任务', 'taskId、当前责任人、状态、截止时间', '重指派留痕，改期显式审计。', 'FR-015；RCLR-003'),
('任务反馈', 'feedbackId、内容、反馈时间', '接收、反馈、催办和完成证据。', 'FR-015'),
('人员/值班', 'personId、职责、值班时段', '人员、职责、当前值班关联。', 'FR-017、018'),
('位置状态', 'personId、坐标、源时间、新鲜度', '过期阈值可配置，过期禁自动调派。', 'FR-005；RCLR-009'),
('物资站点/条目', 'siteId、itemId、数量、有效期', '台账、站点与临期状态。', 'FR-007—009'),
('盘点计划/快照/记录', 'planId、快照数量、实盘数量、复核状态', '快照为基准，期间变动单独记录。', 'FR-009；RCLR-006'),
('演练计划/执行/评估', 'drillId、计划时间、实际完成、状态', '取消/逾期不计完成，补演关联原计划。', 'FR-010—012；RCLR-007'),
('打卡点/记录', 'pointId、taskId、扫码时间、结果', '任务/点位/时段绑定，重复扫码幂等。', 'FR-017—020；RCLR-005'),
('消息发送/外部调用', 'messageId、尝试序号、最终状态、回执时间', '保留超时/重试/降级历史，重复回执幂等。', 'FR-020、022；RCLR-008'),
('附件/审计记录', 'attachmentId、关联对象、删除状态、操作者', '逻辑删除、归档引用保护和删除审计。', 'FR-013、016；RCLR-010'),
]
p = insert_para_after(anchor, '5.2核心实体字段字典。表5-1为需求级语义字典，不是数据库ER或物理表设计。', 'Heading 2')
table_after(doc, p, '表 5-1 核心实体字段字典', ['实体', '核心字段（均含唯一标识）', '业务含义与约束', '来源'], fields, table_style, caption_source, [Cm(3), Cm(5.3), Cm(6.7), Cm(3.8)])

# Replace the old short NFR table with explicit PE-01—12 and append the remaining NFR tables.
old = doc.tables[-1]
old._element.getparent().remove(old._element)
anchor = find(doc, '6.1 PE性能')
pe = [
('PE-01', '预案启动通知与任务下发≤3秒。', '授权启动至产生可追踪下发记录的端到端时间戳。', 'KN-003'),
('PE-02', '告警接入响应≤2秒。', '外部告警至本系统接收/记录时间戳。', 'KN-011'),
('PE-03', '事件确认至任务下达≤3分钟。', '核实通过至处置任务下发记录时间戳。', 'KN-012'),
('PE-04', '消息并行≥20路、正常通道到达率≥99%。', '发送、尝试、回执、失败与重复回执统计。', 'KN-006、007'),
('PE-05', '位置刷新≤2秒/次且精度不低于甲方亚米级源精度。', '源、接收、展示时间戳及精度；过期阈值可配置。', 'KN-008、009'),
('PE-06', '实时视频首帧≤3秒；既有系统保存录像≥30天。', '受权首帧计时和既有系统保存责任证据。', 'KN-010、060'),
('PE-07', 'Web普通页面95%请求≤3秒。', '目标数据规模与指定浏览器中的分位统计。', 'KN-034'),
('PE-08', '地图常规操作≤2秒。', '合法地图服务、典型点位加载/操作计时。', 'KN-035'),
('PE-09', '扫码打卡写入/回传≤1秒。', '有效与无效扫码均记录响应及校验结果。', 'KN-036'),
('PE-10', '综合安防刷新≤30秒；应急信息默认刷新≤60秒。', '刷新配置与实际时间戳。', 'KN-016、017'),
('PE-11', '应急峰值在线用户≥100人。', '目标环境并发压测，记录成功率、响应和资源。', 'KN-028'),
('PE-12', '一年期统计报表生成≤5秒。', '授权范围内一年期数据的统计用时。', 'KN-037'),
]
t = table_after(doc, anchor, '表 6-1 PE-01—PE-12性能指标', ['编号', '量化要求', '验证口径', '来源'], pe, table_style, caption_source, [Cm(1.7), Cm(6), Cm(7), Cm(2.3)])
capacity = [('NFR-CAP-01', '预案≥50个、模板≥200条、应急人员≥300人。', '初始化/导入后的查询与配置用例。'), ('NFR-CAP-02', '年均事件约200起、平均10任务/起；在线≥10年、事件≥2万、任务≥20万。', '受控测试数据的导入、查询与保存验证。'), ('NFR-CAP-03', '物资站点≥30个、台账≥1000项、打卡点≥100个。', '目标数据规模下的配置、检索和关联用例。'), ('NFR-CAP-04', '日打卡约200人次、年约7.3万，在线保存≥3年。', '保留期和典型统计查询验证。')]
table_after(doc, t, '表 6-2 容量要求', ['编号', '量化要求', '验证口径'], capacity, table_style, caption_source, [Cm(3), Cm(9), Cm(5)])
anchor = find(doc, '6.2 可用性')
reliability = [('NFR-REL-01', '7×24运行，试运行可用率≥99.5%（计划维护除外）。', '试运行监控、维护与不可用时段记录。'), ('NFR-REL-02', '单点故障MTTR≤2小时；未完成任务重启后可恢复。', '故障演练与恢复记录。'), ('NFR-REL-03', '日增量、周全量备份；过程数据≥3年，审计日志≥180天。', '备份计划、恢复演练和保留期审计。')]
table_after(doc, anchor, '表 6-3 可用性、可靠性与恢复要求', ['编号', '量化/可验证要求', '验证口径'], reliability, table_style, caption_source, [Cm(3), Cm(9), Cm(5)])
anchor = find(doc, '6.3 安全')
security = [('NFR-SEC-01', '应用安全不低于等保二级中与应用软件直接相关条款；交付前高危漏洞为0。', '应用侧SCA、漏洞扫描、Web渗透复测证据。'), ('NFR-SEC-02', '口令长度≥8位；敏感数据按角色与数据范围控制，导出留痕。', '身份、权限、导出和审计用例。')]
table_after(doc, anchor, '表 6-4 安全要求', ['编号', '量化/可验证要求', '验证口径'], security, table_style, caption_source, [Cm(3), Cm(9), Cm(5)])
anchor = find(doc, '6.4 兼容')
usable = [('NFR-USE-01', '关键操作≤3个页面跳转；新用户≤2小时完成完整上报处置学习目标。', '可用性走查与培训考核记录。'), ('NFR-COMP-01', 'Chrome/Edge最新2个稳定版本；H5嵌入既有宿主APP。', '甲方确认的终端/宿主矩阵与兼容测试。')]
table_after(doc, anchor, '表 6-5 易用性与兼容性要求', ['编号', '量化/可验证要求', '验证口径'], usable, table_style, caption_source, [Cm(3), Cm(9), Cm(5)])
anchor = find(doc, '6.5 可维护')
maintain = [('NFR-MNT-01', '核心模块单元测试覆盖率≥70%；39条FR功能覆盖率与验收用例通过率均为100%。', '测试报告与RTM双向追踪。'), ('NFR-MNT-02', '非乙方人员按手册在干净环境一次部署成功，用时≤2小时。', '独立部署验收记录。')]
table_after(doc, anchor, '表 6-6 可维护性与可测试性要求', ['编号', '量化/可验证要求', '验证口径'], maintain, table_style, caption_source, [Cm(3), Cm(9), Cm(5)])

# Course-project decisions remain their own controlled section, not an implementation claim.
anchor = doc.paragraphs[-1]
p = insert_para_after(anchor, '10 G2规格化阶段补充业务规则（课程项目人工决策）', 'Heading 1')
p.paragraph_format.page_break_before = True
q = insert_para_after(p, '本节继承项目负责人2026-09-15对G2-RCLR-001—010的课程项目人工决策，不是甲方正式法律文件或现实现场验收结论；不改变既有FR、★属性、量化指标或责任边界。表10-1是正文直接可读的规则索引，完整选项和裁决证据见ai_reverse_clarifications.md。', None)
q = insert_para_after(q, '逐项继承：G2-RCLR-001、G2-RCLR-002、G2-RCLR-003、G2-RCLR-004、G2-RCLR-005、G2-RCLR-006、G2-RCLR-007、G2-RCLR-008、G2-RCLR-009、G2-RCLR-010。完整选项、来源与验证见 ai_reverse_clarifications.md。', None)
rules = [('事件与告警', '可靠外部告警ID幂等；无可靠ID不自动合并；核实超时仅升级提醒，时间线优先业务时间，迟到不覆盖历史。', 'RCLR-001、002、004'), ('任务与消息', '重指派完整留痕、默认不改截止时间；迟到/重复回执幂等并保留超时、重试、降级和人工历史。', 'RCLR-003、008'), ('打卡、位置与盘点', '码绑定任务/点位/时段，过期无效、重复扫码幂等；位置过期禁自动调派；盘点以快照比对并纳入期间变动复核。', 'RCLR-005、006、009'), ('演练与附件', '取消/未完成不计完成，补演不消除原异常；附件逻辑删除、审计保留、归档引用受保护。', 'RCLR-007、010')]
table_after(doc, q, '表 10-1 G2-RCLR补充业务规则索引', ['规则域', '可直接实施理解', '来源'], rules, table_style, caption_source, [Cm(3), Cm(12), Cm(2)])

doc.core_properties.title = '某自然博物馆智能运营中心建设项目——应急管理子系统 软件需求规格说明书（SRS）'
doc.core_properties.author = '何思源'
doc.core_properties.last_modified_by = '何思源'
doc.save(PATH)
import subprocess
subprocess.run(['python', str(ROOT / 'scripts' / 'fix_g2_r03_review.py')], check=True)
print(PATH)
