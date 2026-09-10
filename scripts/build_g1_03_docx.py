from __future__ import annotations

from pathlib import Path
import re
import shutil
import tempfile
import zipfile

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "work" / "A_PM" / "project_proposal.md"
REFERENCE = ROOT / "docs" / "reference" / "01-项目建议书（教学样例）.docx"
OUT = ROOT / "docs" / "deliverables" / "01-项目建议书.docx"

VERSION = "V0.9"
STATUS = "符合性复核候选稿"
DATE = "2026 年 9 月 10 日"
PROJECT = "某自然博物馆智能运营中心建设项目——应急管理子系统"

FORBIDDEN_CASE_TERMS = (
    "澜图",
    "遥感影像",
    "segment-geospatial",
    "FastAPI",
    "GeoPackage",
    "QGIS",
    "SAM",
)


def set_run_font(run, east_asia="宋体", size=12, bold=False, latin="Times New Roman"):
    run.font.name = latin
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor(0, 0, 0)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:eastAsia"), east_asia)
    rfonts.set(qn("w:ascii"), latin)
    rfonts.set(qn("w:hAnsi"), latin)


def set_style_font(style, east_asia, latin, size, bold):
    style.font.name = latin
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.color.rgb = RGBColor(0, 0, 0)
    rpr = style.element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:eastAsia"), east_asia)
    rfonts.set(qn("w:ascii"), latin)
    rfonts.set(qn("w:hAnsi"), latin)


def set_cell_margins(cell, top=90, start=100, bottom=90, end=100):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for tag, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{tag}"))
        if node is None:
            node = OxmlElement(f"w:{tag}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_table_borders(table, color="7F7F7F", size="4"):
    tbl_pr = table._tbl.tblPr
    old = tbl_pr.find(qn("w:tblBorders"))
    if old is not None:
        tbl_pr.remove(old)
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)
        borders.append(element)
    tbl_pr.append(borders)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


def set_paragraph_bottom_border(paragraph, color="000000", size="12", space="8"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), space)
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)


def clear_document_body(doc):
    body = doc._element.body
    for child in list(body):
        if child.tag != qn("w:sectPr"):
            body.remove(child)


def configure_styles(doc):
    normal = doc.styles["Normal"]
    set_style_font(normal, "宋体", "Times New Roman", 12, False)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.first_line_indent = Cm(0.84)
    normal.paragraph_format.space_after = Pt(5)
    normal.paragraph_format.widow_control = True

    title = doc.styles["Title"]
    set_style_font(title, "黑体", "Arial", 28, True)
    title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_before = Pt(26)
    title.paragraph_format.space_after = Pt(10)

    for name, size, before, after in (
        ("Heading 1", 16, 12, 8),
        ("Heading 2", 13, 10, 6),
        ("Heading 3", 12, 8, 4),
    ):
        style = doc.styles[name]
        set_style_font(style, "黑体", "Arial", size, True)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.widow_control = True

    list_style = doc.styles["List Paragraph"]
    set_style_font(list_style, "宋体", "Times New Roman", 12, False)
    list_style.paragraph_format.line_spacing = 1.5
    list_style.paragraph_format.space_after = Pt(3)
    list_style.paragraph_format.left_indent = Cm(0.84)
    list_style.paragraph_format.first_line_indent = Cm(-0.42)

    if "Header" in doc.styles:
        header_ppr = doc.styles["Header"].element.get_or_add_pPr()
        header_border = header_ppr.find(qn("w:pBdr"))
        if header_border is not None:
            header_ppr.remove(header_border)


def configure_section(doc):
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.left_margin = Cm(2.54)
    section.right_margin = Cm(2.54)
    section.header_distance = Cm(1.25)
    section.footer_distance = Cm(1.25)
    section.different_first_page_header_footer = False
    for reference in list(section._sectPr.findall(qn("w:headerReference"))):
        section._sectPr.remove(reference)
    for paragraph in section.footer.paragraphs:
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER


def add_cover(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.space_after = Pt(4)
    set_run_font(p.add_run(f"文档编号：01　　版本号：{VERSION}"), "宋体", 12)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.space_before = Pt(60)
    set_run_font(p.add_run(f"文档状态：{STATUS}"), "宋体", 12)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(100)
    p.paragraph_format.space_after = Pt(18)
    set_run_font(p.add_run(PROJECT), "黑体", 22, True, "Arial")
    set_paragraph_bottom_border(p)

    p = doc.add_paragraph(style="Title")
    set_run_font(p.add_run("项 目 建 议 书"), "黑体", 28, True, "Arial")

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(112)
    p.paragraph_format.space_after = Pt(10)
    set_run_font(p.add_run("编制单位：项目编制组"), "仿宋", 16)
    for label, value in (
        ("编　　制", "A（项目经理）"),
        ("复　　核", "C（符合性复核）"),
        ("文档版本", VERSION),
        ("编制日期", DATE),
    ):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(10)
        set_run_font(p.add_run(f"{label}：{value}"), "仿宋", 16)
    doc.add_page_break()


def set_column_widths(table, widths_cm):
    table.autofit = False
    for row in table.rows:
        for index, width in enumerate(widths_cm):
            row.cells[index].width = Cm(width)


def add_table(doc, rows, widths_cm, font_size=10.5):
    table = doc.add_table(rows=0, cols=len(rows[0]))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Normal Table"
    set_table_borders(table)
    for row_index, values in enumerate(rows):
        cells = table.add_row().cells
        for index, value in enumerate(values):
            cell = cells[index]
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.left_indent = Cm(0)
            paragraph.paragraph_format.right_indent = Cm(0)
            paragraph.paragraph_format.space_before = Pt(0)
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.15
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER if row_index == 0 or index == 0 else WD_ALIGN_PARAGRAPH.LEFT
            run = paragraph.add_run(value)
            set_run_font(run, "黑体" if row_index == 0 else "宋体", 11 if row_index == 0 else font_size, row_index == 0)
            if row_index == 0:
                set_cell_shading(cell, "D9E2F3")
        if row_index == 0:
            set_repeat_table_header(table.rows[-1])
    set_column_widths(table, widths_cm)
    return table


def add_revision_page(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    set_run_font(p.add_run("修订记录"), "黑体", 12, True, "Arial")
    rows = [
        ["版本", "日期", "修订章节", "修订说明", "编制/修订人"],
        ["V0.1", "2026-09-10", "全部", "基于冻结编标输入形成项目建议书工作稿。", "A"],
        ["V0.2", "2026-09-10", "状态、3.1、3.3、7", "明确课程模拟澄清边界，采用总体技术方案 V0.6 稳定结论，并按教学样例重新排版。", "A"],
    ]
    add_table(doc, rows, [2.2, 2.6, 2.7, 5.5, 2.92], 10.5)
    doc.add_page_break()


def clean_text(text):
    text = text.replace("`", "")
    text = re.sub(r"\[来源：[^\]]*\]", "", text)
    text = re.sub(r"【分析性结论；依据：[^】]*】", "", text)
    text = text.replace("BASELINE-G1-V0.1", "当前编标基线")
    text = text.replace("G1-04 V0.6", "总体技术方案 V0.6")
    text = text.replace("G1-04", "总体技术方案")
    text = text.replace("G1-06 项目计划 v1", "后续项目计划")
    text = text.replace("G1-07", "后续风险管理")
    text = text.replace("当前编标 Baseline", "当前编标基线")
    text = text.replace("正式风险登记册由后续风险管理建立并维护", "后续形成正式风险登记册并持续维护")
    text = text.replace("Issue/Change", "问题与变更")
    text = text.replace("**", "")
    return re.sub(r"\s+$", "", text).strip()


def parse_body_blocks():
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    blocks = []
    table_rows = []
    started = False

    def flush_table():
        nonlocal table_rows
        if table_rows:
            blocks.append(("table", table_rows))
            table_rows = []

    for raw in lines:
        if raw.startswith("## 1 "):
            started = True
        if not started:
            continue
        if raw.startswith("# "):
            continue
        if raw.startswith("## "):
            flush_table()
            blocks.append(("h1", clean_text(raw[3:])))
        elif raw.startswith("### "):
            flush_table()
            blocks.append(("h2", clean_text(raw[4:])))
        elif raw.startswith("| "):
            values = [clean_text(value) for value in raw.strip().strip("|").split("|")]
            if not all(re.fullmatch(r"[- :]+", value) for value in values):
                table_rows.append(values)
        elif not raw.strip():
            flush_table()
        elif raw.startswith("- "):
            flush_table()
            blocks.append(("bullet", clean_text(raw[2:])))
        elif raw.startswith("本工作稿提交 C"):
            flush_table()
            continue
        else:
            flush_table()
            blocks.append(("p", clean_text(raw)))
    flush_table()
    return blocks


def add_body_paragraph(doc, text, bullet=False):
    paragraph = doc.add_paragraph(style="List Paragraph" if bullet else "Normal")
    if bullet:
        set_run_font(paragraph.add_run("• "), "宋体", 12)
    match = re.match(r"^([^。]{2,18}。)(.*)$", text) if bullet else None
    if match:
        set_run_font(paragraph.add_run(match.group(1)), "宋体", 12, True)
        set_run_font(paragraph.add_run(match.group(2)), "宋体", 12)
    else:
        set_run_font(paragraph.add_run(text), "宋体", 12)
    paragraph.paragraph_format.widow_control = True
    return paragraph


def add_body(doc):
    for kind, value in parse_body_blocks():
        if kind == "h1":
            doc.add_heading(value, level=1)
        elif kind == "h2":
            doc.add_heading(value, level=2)
        elif kind == "bullet":
            add_body_paragraph(doc, value, True)
        elif kind == "p" and value:
            add_body_paragraph(doc, value)
        elif kind == "table":
            if value and value[0] and value[0][0] == "编号":
                add_table(doc, value, [1.6, 3.5, 10.82], 10.5)
            else:
                add_table(doc, value, [3.0, 5.2, 7.72], 10.5)
            spacer = doc.add_paragraph()
            spacer.paragraph_format.space_after = Pt(2)


def set_update_fields(doc):
    settings = doc.settings.element
    old = settings.find(qn("w:updateFields"))
    if old is not None:
        settings.remove(old)
    update = OxmlElement("w:updateFields")
    update.set(qn("w:val"), "true")
    settings.append(update)


def scrub_template_media(path):
    with zipfile.ZipFile(path, "r") as src:
        entries = {info.filename: src.read(info.filename) for info in src.infolist()}
    rel_path = "word/_rels/document.xml.rels"
    if rel_path in entries:
        from lxml import etree

        root = etree.fromstring(entries[rel_path])
        for rel in list(root):
            rel_type = rel.get("Type", "")
            target = rel.get("Target", "")
            if rel_type.endswith("/image") or target.startswith("media/"):
                root.remove(rel)
        entries[rel_path] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone="yes")
    entries = {name: data for name, data in entries.items() if not name.startswith("word/media/")}
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        temp_path = Path(tmp.name)
    try:
        with zipfile.ZipFile(temp_path, "w", zipfile.ZIP_DEFLATED) as out_zip:
            for name, data in entries.items():
                out_zip.writestr(name, data)
        shutil.move(temp_path, path)
    finally:
        temp_path.unlink(missing_ok=True)


def assert_no_case_content(path):
    with zipfile.ZipFile(path) as zf:
        for info in zf.infolist():
            if info.filename.startswith("word/media/"):
                raise RuntimeError(f"案例媒体残留：{info.filename}")
            if info.filename.endswith((".xml", ".rels")):
                text = zf.read(info.filename).decode("utf-8", errors="ignore")
                for term in FORBIDDEN_CASE_TERMS:
                    if term in text:
                        raise RuntimeError(f"教学案例内容残留：{term} in {info.filename}")


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REFERENCE, OUT)
    doc = Document(OUT)
    clear_document_body(doc)
    configure_section(doc)
    configure_styles(doc)
    doc.core_properties.title = f"{PROJECT}项目建议书"
    doc.core_properties.subject = "项目建议书"
    doc.core_properties.author = "项目编制组"
    doc.core_properties.last_modified_by = "项目编制组"
    doc.core_properties.keywords = ""
    doc.core_properties.comments = ""
    add_cover(doc)
    add_revision_page(doc)
    add_body(doc)
    set_update_fields(doc)
    doc.save(OUT)
    scrub_template_media(OUT)
    assert_no_case_content(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
