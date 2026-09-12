"""Targeted G1-08 publication cleanup for the technical-bid DOCX."""
from copy import copy
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "docs" / "deliverables" / "00-投标文件技术标.docx"
REFERENCE = ROOT / "docs" / "reference" / "00-澜图遥感影像智能解译平台-投标文件技术标（教学案例）.docx"

def all_paragraphs(parent):
    for p in parent.paragraphs:
        yield p
    for table in parent.tables:
        for row in table.rows:
            for cell in row.cells:
                yield from all_paragraphs(cell)

def replace_paragraph(paragraph, text):
    if paragraph.text == text:
        return
    style = paragraph.style
    alignment = paragraph.alignment
    old = paragraph.runs[0] if paragraph.runs else None
    paragraph.clear()
    paragraph.style = style
    paragraph.alignment = alignment
    run = paragraph.add_run(text)
    if old is not None:
        run.bold = old.bold
        run.italic = old.italic
        run.font.name = old.font.name
        run.font.size = old.font.size

def remove_paragraph(paragraph):
    paragraph._element.getparent().remove(paragraph._element)

doc = Document(TARGET)
reference = Document(REFERENCE)

# Use the reference's actual heading-style definitions rather than an
# approximate color or point-size match.  Content and table styles remain
# untouched; only the shared heading ladder is aligned.
for name in ("Heading 1", "Heading 2", "Heading 3"):
    target_style = doc.styles[name]._element
    reference_style = reference.styles[name]._element
    for tag in ("w:rPr", "w:pPr"):
        existing = target_style.find(qn(tag))
        source = reference_style.find(qn(tag))
        if existing is not None:
            target_style.remove(existing)
        if source is not None:
            target_style.append(copy(source))

# The source draft carried an unmaterialized Word-field reminder.  A compact
# static directory is used so the published file has visible, stable entries
# and page numbers even in readers that do not refresh Word fields.
toc_lines = [
    "第一章  投标响应总述\t4", "第二章  需求理解\t5", "第三章  总体技术方案\t11",
    "第四章  功能实现方案\t20", "第五章  关键技术实现方案\t36", "第六章  开源组件与许可证合规\t44",
    "第七章  非功能设计\t46", "第八章  项目实施方案\t49", "第九章  质量保障方案\t54",
    "第十章  培训与售后服务方案\t57", "第十一章  技术规格响应与偏离表\t58", "第十二章  项目团队\t80",
    "第十三章  类似项目业绩\t82", "第十四章  合理化建议\t83", "附录 A  术语和缩略语\t84",
    "附录 B  接口与报文设计节选\t85", "附录 C  条款—投标方案索引\t87", "附录 D  核心数据字典\t90",
    "附录 E  质量度量与验收用例框架\t92", "附录 F  评分要点响应对照\t93", "附录 G  交付物清单\t94",
]
for p in doc.paragraphs:
    if "请在 Word 中更新域" in p.text or p.text.startswith("第一章  投标响应总述\t"):
        replace_paragraph(p, "\n".join(toc_lines))
        p.paragraph_format.line_spacing = 1.2
        break

# Remove the isolated, duplicate structural heading that breaks Chapter 3.
for p in list(all_paragraphs(doc)):
    if p.text.strip() == "第 2 部分 关键技术":
        remove_paragraph(p)

# Keep the reference's two-section page system.  The earlier draft introduced
# an additional section solely for a landscape response table; all tables now
# use the reference portrait geometry.
embedded_sections = [
    p for p in doc.paragraphs
    if p._p.pPr is not None and p._p.pPr.sectPr is not None
]
for p in embedded_sections[:-1]:
    p._p.pPr.remove(p._p.pPr.sectPr)

special = {
    "本文件以真实用户需求书、冻结基线、G1-03至G1-07工作成果、facts、key_numbers和compliance_matrix为内容依据。教学参考技术标只提供章节、信息类型、图表密度和Word格式，不向本项目引入其业务、技术栈、算法、人员、业绩、指标或承诺。": "本技术标依据招标文件及其组成文件编制。各项响应以本文件的方案说明、技术规格响应表及实施阶段形成的验证资料为准。",
    "文中“响应”表示方案已给出设计或管理安排，不等于现场实施和验收已经完成。接口连通、性能、安全、部署、演练和最终验收证据仍按项目计划形成，统一标记为PENDING_EVIDENCE。人员姓名、资历、类似业绩、合同编号等没有真实资料的内容标记【待人工确认】。": "本文件所述验证安排将在实施阶段形成可追溯的设计、测试、联调、试运行和验收资料。投标主体信息、人员履历及类似业绩等应按招标文件要求补充可核验材料。",
    "职责关系见图 4-1。三名成员可以为同一交付物提供输入或复核，但每份正式产物只设一名主责。复核意见通过 Issue 或评审记录交回主责修改，复核人依据关闭证据确认，不维护另一套正式版本。": "职责关系见图 4-1。项目实行项目经理负责制，各专业岗位按职责分工协同完成设计、实施、测试、交付与质量复核。",
    "5. 历史 Issue 的关闭仅表示需求解释已裁决。发生新的接口、环境、数据或验证问题时，A 新建 Issue 或变更记录，不覆盖已关闭历史。": "5. 已确认的需求边界作为后续实施依据。新增接口、环境、数据或验证问题按变更管理程序评估、处置并形成闭环记录。",
    "6. G1-06 项目计划 v1 完成 C 的 Review 前，RR-01—RR-08、RR-10—RR-11、RR-13—RR-14、RR-16 的 WBS、阶段和资源关联须由 A 与 C 复核；本登记册不修改 G1-06。": "6. 对进度、阶段和资源存在关联的风险，项目组在例会和阶段评审中同步复核，并以更新后的实施计划和风险处置记录为准。",
    "7. 风险关闭必须同时满足：触发条件解除或已被控制、预防/应急措施有执行证据、残余影响已评估、关联 Issue/测试/验收记录可回溯，并由相应责任人和复核人确认。无证据的风险不得标记为关闭。": "7. 风险关闭须同时满足：触发条件解除或已受控、预防或应急措施具有执行证据、残余影响已评估，且可回溯至相应的测试、验收或管理记录。",
    "项目使用任务看板、周报、风险登记册、Issue、变更记录、评审记录和配置审计。周报至少包含完成项、下周计划、偏差、风险、接口前置和需甲方决策事项。状态必须有证据，不以主观百分比替代。": "项目采用周报、风险登记、变更控制、评审与配置审计等机制进行管理。周报至少说明完成事项、下周计划、偏差、风险、接口前置条件及需甲方决策事项，并以客观证据说明工作状态。",
    "每周质量数据进入周报，重大偏差进入Issue或风险。重复缺陷执行根因分析并改进检查单、测试或设计规则。人工复核负责确认AI辅助内容、数字、★条款和图表，工具结果不能替代责任人结论。": "每周质量数据纳入周报，重大偏差进入风险或问题处置流程。重复缺陷实施根因分析，并更新检查单、测试用例或设计规则；关键数据、条款和图表均由责任人员复核确认。",
    "本章以control/compliance_matrix.md的168行受控记录为唯一来源。表中设计响应说明本方案如何承接要求；验证证据是实施后应形成的证据，不表示现场已经完成。当前矩阵18行为FULLY_COMPLIANT，150行为PENDING_EVIDENCE；正偏离0、负偏离0、不适用0。": "本章逐项说明招标要求、方案响应、对应章节、验证安排及偏离结论。验证资料将在实施、测试、联调、试运行和验收阶段形成；本技术标各项响应均为无偏离。",
    "全部条款当前为无偏离响应，未提出优于需求的无依据承诺。PENDING_EVIDENCE表示设计或管理安排已经建立，但接口、环境、测试、试运行、签认或验收证据需要在后续里程碑形成。任何★条款出现负偏离、关键数字无来源或高影响问题未关闭时，项目不得冻结或提交竣工验收。": "全部条款均作无偏离响应，未提出无依据的优于需求承诺。接口、环境、测试、试运行、签认和验收资料将在相应实施阶段形成；任何实质性条款、关键指标或重大风险均按招标文件要求进行验证和闭环。",
    "本技术标全文完。G1-08状态为REVIEW，等待B技术复核和C合规复核，不在本次自行标记DONE。": "本技术标全文完。",
}

generic = [
    ("成熟度：DESIGN_COVERED_EVIDENCE_PENDING；证据状态：PENDING_EVIDENCE", "验证安排：实施阶段形成设计、测试与验收证据"),
    ("成熟度：PLANNED_INTEGRATION_EVIDENCE_PENDING；证据状态：PENDING_EVIDENCE", "验证安排：实施阶段形成管理、联调与验收证据"),
    ("成熟度：FROZEN_AND_DOCUMENTED；证据状态：FULLY_COMPLIANT", "验证安排：形成需求确认与方案评审资料"),
    ("PENDING_EVIDENCE", "实施阶段形成验证证据"),
    ("FULLY_COMPLIANT", "已形成方案响应说明"),
    ("G1-03", "项目建议书"),
    ("G1-04", "技术方案"),
    ("G1-05", "技术规格响应"),
    ("G1-06", "项目实施计划"),
    ("G1-07", "风险管理安排"),
    ("G1-08", "本技术标"),
    ("facts.md", "需求事实清单"),
    ("key_numbers.md", "关键指标清单"),
    ("compliance_matrix.md", "技术规格响应表"),
    ("Issue", "问题"),
    ("Prompt", "编制记录"),
    ("Git", "版本管理"),
    ("Markdown", "电子文档"),
]

for p in list(all_paragraphs(doc)):
    text = special.get(p.text, p.text)
    for old, new in generic:
        text = text.replace(old, new)
    text = re.sub(r"control/[A-Za-z0-9_./-]+", "技术规格响应表", text)
    text = re.sub(r"docs/[A-Za-z0-9_./-]+", "相关技术文件", text)
    text = re.sub(r"CM-\d+[／/]", "", text)
    text = text.replace("governance与logs/prompts", "质量管理说明")
    # The appendix must remain a customer-facing scoring summary, not a course-process trace.
    text = text.replace("配置库、编制记录/评审日志、提交物与评分核验记录", "技术文件、验证资料与交付清单")
    if text != p.text:
        replace_paragraph(p, text)

# Replace the thirteen mechanically identical key-technology verification paragraphs.
verification = [
    "以预案发布版本为基线，压测启动至任务受理的端到端时延；重复启动仅产生一次任务快照，并核对回滚后的待处置清单。",
    "以通道受理、发送、到达和业务确认四类回执核对消息状态；模拟回执缺失时验证重试节奏、去重键和人工催办入口。",
    "对并发催办、临时任务插入和关闭竞争进行状态迁移测试；核查非法迁移被拒绝且全过程保留审计轨迹。",
    "以同一事件的时间线、地图图层和任务状态为对照，验证多源时间戳排序；地图服务不可用时保留列表态势与最后有效位置。",
    "使用甲方提供的定位源数据测量刷新间隔、楼层映射和源精度保持；定位流中断时显示最后更新时间并停止将旧位置表述为实时位置。",
    "以授权设备的实时调阅、历史检索和首帧时间为用例；信令或码流异常时记录失败原因、保留事件时间线并提供重新调阅入口。",
    "在授权、二次确认和安全联锁条件下验证指令下发、回执与审计；无回执或联锁拒绝时立即告警并转入人工处置，不以界面状态替代执行结果。",
    "对身份、组织、权限、消息和流程能力分别进行契约校验；中台能力不可用时拒绝越权操作，保存待补偿请求并提示责任人员。",
    "在目标宿主、登录态过期、深链唤起和弱网恢复场景下验证 H5 行为；宿主桥接不可用时提供受控的 Web 访问提示，不绕过身份与权限校验。",
    "对审批节点、时限和人员变更后的新旧版本进行运行快照核验；配置发布失败时保持已发布版本继续可用，并记录待处理差异。",
    "按接口类别验证超时、幂等重试、熔断和限流；外部服务不可用时切换为明确的人工操作指引，并在恢复后按顺序补偿可重放请求。",
    "在约定并发和容量边界下测量响应时间、队列积压与资源水位；达到阈值时优先保障事件、任务和告警链路，并输出压测记录与调优结论。",
    "演练单节点故障、服务重启和备份恢复，核对恢复时间、数据点和审计连续性；恢复未完成前启用受控人工登记，恢复后按记录完成补录与核验。",
]
old_verification = "测试覆盖正常路径、边界输入、重复请求、超时、依赖中断、恢复和权限拒绝。验证记录包含环境、数据、时间戳、请求与回执、结果和问题关闭证据，未取得现场条件时保持实施阶段形成验证证据。"
matches = [p for p in all_paragraphs(doc) if p.text == old_verification]
for p, text in zip(matches, verification):
    replace_paragraph(p, text)

# Remove the non-essential landscape section: all pages follow the reference A4 portrait geometry.
for section in doc.sections:
    section.orientation = WD_ORIENT.PORTRAIT
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.header_distance = Inches(0.5)
    section.footer_distance = Inches(0.5)

# Ensure Word refreshes field results when opened; the subsequent Word pass materializes the TOC.
settings = doc.settings.element
update = settings.find(qn("w:updateFields"))
if update is None:
    update = OxmlElement("w:updateFields")
    settings.append(update)
update.set(qn("w:val"), "true")

doc.save(TARGET)
print(f"saved {TARGET}; replaced {len(matches)} key-technology verification paragraphs")
