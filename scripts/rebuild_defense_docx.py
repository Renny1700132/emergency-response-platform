"""Rebuild the G1-12 defense DOCX with evidence-based front matter and PPT-authored figure."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".tmp" / "g1_11_python_libs"))

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

REFERENCE = ROOT / "docs/reference/06-述标答辩讲稿与策略（教学样例）.docx"
SOURCE = ROOT / "docs/work/A_PM/presentation_and_defense.md"
FIGURE = ROOT / "docs/deliverables/figures/06-图1-1-述标8分钟时间分配总览.png"
TARGET = ROOT / ".tmp/final_rework/06-defense-rebuilt.docx"


def clear_body(doc):
    body = doc._element.body
    for child in list(body):
        if not child.tag.endswith("sectPr"):
            body.remove(child)


def set_run_font(run, name="宋体", size=12, bold=False):
    run.font.name = name
    run.font.size = Pt(size)
    run.bold = bold
    rpr = run._element.get_or_add_rPr()
    fonts = rpr.rFonts
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        rpr.insert(0, fonts)
    fonts.set(qn("w:eastAsia"), name)
    fonts.set(qn("w:ascii"), "Times New Roman")
    fonts.set(qn("w:hAnsi"), "Times New Roman")


def shade(cell, fill):
    tcpr = cell._tc.get_or_add_tcPr()
    shd = tcpr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tcpr.append(shd)
    shd.set(qn("w:fill"), fill)


def format_table(table, widths=None, font_size=9.5):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for r_idx, row in enumerate(table.rows):
        row.cells[0]._tc.getparent().set(qn("w:cantSplit"), "1")
        if r_idx == 0:
            row._tr.get_or_add_trPr().append(OxmlElement("w:tblHeader"))
        for c_idx, cell in enumerate(row.cells):
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if widths and c_idx < len(widths):
                cell.width = Cm(widths[c_idx])
            if r_idx == 0:
                shade(cell, "D9E2F3")
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.0
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx < 2 else WD_ALIGN_PARAGRAPH.LEFT
                for run in p.runs:
                    set_run_font(run, size=font_size, bold=(r_idx == 0))


def add_cover(doc):
    p = doc.add_paragraph("文档编号：03-G1-12　　　　　　版本号：V1.2")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(p.runs[0], size=12)
    p = doc.add_paragraph("密　　级：内部·教学用")
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    set_run_font(p.runs[0], size=12)
    doc.add_paragraph()
    for text, size in [
        ("某自然博物馆智能运营中心建设项目", 22),
        ("应急管理子系统", 22),
        ("述标答辩讲稿与策略", 26),
        ("课程模拟", 14),
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(8)
        set_run_font(p.add_run(text), "黑体" if size >= 20 else "宋体", size, size >= 20)
    doc.add_paragraph()
    for text in [
        "编制单位：项目组【待人工确认】",
        "编　　制：何思源（项目经理 PM）",
        "审　　核：任俊强（合规与数字）",
        "批　　准：【待人工确认】",
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_run_font(p.add_run(text), size=13)
    doc.add_page_break()


def add_date_page(doc):
    for _ in range(8):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(p.add_run("编制日期"), "黑体", 22, True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20)
    set_run_font(p.add_run("2026 年 9 月 13 日"), "宋体", 18)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(36)
    set_run_font(p.add_run("适用阶段：第一关立项竞标最终返工"), "宋体", 12)
    doc.add_page_break()


def add_revision_page(doc):
    p = doc.add_paragraph("修订记录", style="Heading 1")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    table = doc.add_table(rows=1, cols=5)
    headers = ["版本", "日期", "修订章节", "修订说明", "编制/修订人"]
    for c, text in zip(table.rows[0].cells, headers):
        c.text = text
    rows = [
        ("V0.1", "2026-09-12", "全文", "形成课程模拟述标稿与质询策略初稿。", "何思源"),
        ("V1.0", "2026-09-12", "全文", "通过严宇技术复核与任俊强合规复核，纳入第一关冻结。", "何思源"),
        ("V1.1", "2026-09-13", "封面及署名", "完成正式交付物实名化和首轮格式规范化。", "何思源"),
        ("V1.2", "2026-09-13", "前置页、图 1-1、修订记录", "按教学样例重建独立日期页和修订记录页，补充可编辑时间分配图。", "何思源"),
    ]
    for values in rows:
        cells = table.add_row().cells
        for c, text in zip(cells, values):
            c.text = text
    format_table(table, [1.4, 2.4, 3.0, 8.0, 2.2], 9)
    p = doc.add_paragraph("注：V0.1 对应初稿提交；V1.0 对应 2026-09-12 技术与合规复核通过并纳入 BASELINE-V1.0；V1.1 对应 2026-09-13 实名化与首轮格式收口；V1.2 为本次有证据的格式返工。")
    p.paragraph_format.space_before = Pt(8)
    set_run_font(p.add_run() if not p.runs else p.runs[0], size=9)
    doc.add_page_break()


def table_from_lines(doc, lines):
    rows = [[part.strip() for part in line.strip().strip("|").split("|")] for line in lines]
    rows = [row for row in rows if not all(set(cell) <= {"-", ":"} for cell in row)]
    table = doc.add_table(rows=1, cols=len(rows[0]))
    for cell, value in zip(table.rows[0].cells, rows[0]):
        cell.text = value
    for row in rows[1:]:
        cells = table.add_row().cells
        for cell, value in zip(cells, row):
            cell.text = value
    if len(rows[0]) == 4:
        format_table(table, [1.4, 4.0, 8.2, 3.2], 8.5)
    else:
        format_table(table, font_size=9)


def build_content(doc):
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith("## 第一部分"))
    lines = lines[start:]
    i = 0
    skipped_time_table = False
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            if not skipped_time_table:
                skipped_time_table = True
                continue
            table_from_lines(doc, table_lines)
            continue
        if line == "### 时间分配":
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.keep_with_next = True
            p.add_run().add_picture(str(FIGURE), width=Cm(16.5))
            cap = doc.add_paragraph("图 1-1 述标 8 分钟时间分配总览")
            cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cap.paragraph_format.keep_with_next = True
            for run in cap.runs:
                set_run_font(run, size=10)
        elif line.startswith("### "):
            doc.add_heading(line[4:], level=3)
        elif line.startswith("## "):
            doc.add_heading(line[3:], level=2)
        elif line.startswith("# "):
            doc.add_heading(line[2:], level=1)
        elif line.startswith("- "):
            doc.add_paragraph(line[2:], style="List Paragraph")
        else:
            doc.add_paragraph(line)
        i += 1


doc = Document(REFERENCE)
clear_body(doc)
add_cover(doc)
add_date_page(doc)
add_revision_page(doc)
build_content(doc)

for p in doc.paragraphs:
    if p.style.name in {"Normal", "List Paragraph"}:
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(3)
        for run in p.runs:
            if run.text:
                set_run_font(run, size=10.5)
    elif p.style.name.startswith("Heading"):
        p.paragraph_format.keep_with_next = True
        p.paragraph_format.widow_control = True
    if p.text.strip() == "第三部分 答辩组织与策略":
        p.paragraph_format.page_break_before = True

TARGET.parent.mkdir(parents=True, exist_ok=True)
doc.save(TARGET)
print(TARGET)
