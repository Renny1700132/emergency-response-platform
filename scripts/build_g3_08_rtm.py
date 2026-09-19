from __future__ import annotations

import re
import shutil
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/work/C_REQ/rtm_v1.md"
REFERENCE = ROOT / "docs/reference/26-需求追踪矩阵RTM-v3（设计挂接·教学样例）.docx"
OUTPUT = ROOT / "docs/deliverables/10-需求追踪矩阵RTMv1.docx"


def set_east_asia(run, font: str) -> None:
    run.font.name = "Times New Roman"
    rpr = run._element.get_or_add_rPr()
    fonts = rpr.rFonts
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        rpr.insert(0, fonts)
    fonts.set(qn("w:eastAsia"), font)
    fonts.set(qn("w:ascii"), "Times New Roman")
    fonts.set(qn("w:hAnsi"), "Times New Roman")


def replace_paragraph(paragraph, text: str, *, size: float | None = None, bold: bool | None = None) -> None:
    ppr = deepcopy(paragraph._p.pPr) if paragraph._p.pPr is not None else None
    for child in list(paragraph._p):
        paragraph._p.remove(child)
    if ppr is not None:
        paragraph._p.insert(0, ppr)
    run = paragraph.add_run(text)
    set_east_asia(run, "宋体")
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold


def clean_md(text: str) -> str:
    text = text.replace("**", "").replace("`", "")
    return text.strip()


def parse_md_table(lines: list[str], start: int) -> tuple[list[list[str]], int]:
    rows: list[list[str]] = []
    i = start
    while i < len(lines) and lines[i].lstrip().startswith("|"):
        cells = [clean_md(x) for x in lines[i].strip().strip("|").split("|")]
        if not all(re.fullmatch(r":?-{3,}:?", x) for x in cells):
            rows.append(cells)
        i += 1
    return rows, i


def repeat_header(row) -> None:
    trpr = row._tr.get_or_add_trPr()
    flag = OxmlElement("w:tblHeader")
    flag.set(qn("w:val"), "true")
    trpr.append(flag)


def prevent_row_split(row) -> None:
    trpr = row._tr.get_or_add_trPr()
    cant = OxmlElement("w:cantSplit")
    trpr.append(cant)


def set_table_fixed(table) -> None:
    tblpr = table._tbl.tblPr
    layout = tblpr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tblpr.append(layout)
    layout.set(qn("w:type"), "fixed")
    table.autofit = False


def widths_for(cols: int) -> list[float]:
    presets = {
        3: [4.3, 3.2, 8.4],
        7: [1.55, 2.15, 3.15, 3.45, 2.55, 1.75, 1.35],
        8: [1.25, 1.55, 1.15, 1.65, 2.15, 2.15, 2.15, 3.85],
        9: [1.15, 1.45, 1.10, 1.35, 1.75, 2.10, 1.55, 1.65, 1.80],
    }
    return presets.get(cols, [15.9 / cols] * cols)


def format_table(table, *, font_size: float) -> None:
    set_table_fixed(table)
    widths = widths_for(len(table.columns))
    total_twips = int(sum(widths) * 567)
    tblw = table._tbl.tblPr.find(qn("w:tblW"))
    if tblw is None:
        tblw = OxmlElement("w:tblW")
        table._tbl.tblPr.append(tblw)
    tblw.set(qn("w:type"), "dxa")
    tblw.set(qn("w:w"), str(total_twips))
    grid = table._tbl.tblGrid
    for gridcol, width in zip(grid.gridCol_lst, widths):
        gridcol.set(qn("w:w"), str(int(width * 567)))
    for r_idx, row in enumerate(table.rows):
        prevent_row_split(row)
        if r_idx == 0:
            repeat_header(row)
        for cell, width in zip(row.cells, widths):
            cell.width = Cm(width)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcpr = cell._tc.get_or_add_tcPr()
            tcw = tcpr.find(qn("w:tcW"))
            if tcw is None:
                tcw = OxmlElement("w:tcW")
                tcpr.append(tcw)
            tcw.set(qn("w:type"), "dxa")
            tcw.set(qn("w:w"), str(int(width * 567)))
            for paragraph in cell.paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER if r_idx == 0 else WD_ALIGN_PARAGRAPH.LEFT
                paragraph.paragraph_format.space_before = Pt(0)
                paragraph.paragraph_format.space_after = Pt(0)
                paragraph.paragraph_format.line_spacing = 1.0
                for run in paragraph.runs:
                    set_east_asia(run, "宋体")
                    run.font.size = Pt(font_size)
                    if r_idx == 0:
                        run.bold = True


def add_caption(doc: Document, text: str) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(3)
    run = p.add_run(text)
    set_east_asia(run, "黑体")
    run.bold = True
    run.font.size = Pt(9)


def add_table(doc: Document, rows: list[list[str]], caption: str, template_style) -> None:
    add_caption(doc, caption)
    table = doc.add_table(rows=1, cols=len(rows[0]))
    table.style = template_style
    for idx, value in enumerate(rows[0]):
        table.rows[0].cells[idx].text = value
    for values in rows[1:]:
        cells = table.add_row().cells
        for idx, value in enumerate(values):
            cells[idx].text = value
    format_table(table, font_size=7.0 if len(rows[0]) >= 7 else 8.5)


def remove_reference_body(doc: Document) -> None:
    body = doc.element.body
    children = list(body)
    # Retain cover, revision record, TOC, and its section-break paragraph (0..19),
    # plus the final body sectPr. Remove the reference project's substantive body.
    for child in children[20:-1]:
        body.remove(child)


def update_front_matter(doc: Document) -> None:
    cover = {
        0: "文档编号：YJGL-G3-08    版本号：V1.2",
        1: "密    级：内部·教学用",
        3: "某自然博物馆智能运营中心建设项目——应急管理子系统",
        4: "需求追踪矩阵（RTM）v1",
        5: "（G3-08 设计挂接版）",
        7: "编制单位：020202项目组",
        8: "编    制：任俊强（需求与合规负责人）",
        9: "审    核：严宇（技术负责人）",
        10: "批    准：李晓雷（教师模拟甲方代表）",
        11: "编制日期：2026 年 9 月 19 日",
        13: "修订记录",
        14: "注：本表记录 G2 需求追踪基线到 G3-08 设计挂接的真实版本沿革；详细证据见正文、Issue 与 Review 记录。",
    }
    for idx, text in cover.items():
        replace_paragraph(doc.paragraphs[idx], text)

    table = doc.tables[0]
    while len(table.rows) > 1:
        table._tbl.remove(table.rows[-1]._tr)
    revisions = [
        ["V1.0", "2026-09-14", "第1—5章", "建立 39 FR、34★、117 AC 的 G2 RTM 正式基线。", "任俊强"],
        ["V1.1", "2026-09-18", "第6—8章", "增加 G3-03—07 设计挂接并按 A/B Review 修正追踪口径。", "任俊强"],
        ["V1.2", "2026-09-19", "全文", "同步正式设计挂接版，关闭 G3-08 Review 问题并完成渲染 QA。", "任俊强"],
    ]
    for values in revisions:
        cells = table.add_row().cells
        for cell, value in zip(cells, values):
            cell.text = value
    format_table(table, font_size=8.5)

    sample_terms = {
        "澜图": "某自然博物馆",
        "遥感影像智能解译与地物提取平台建设项目": "智能运营中心建设项目——应急管理子系统",
        "通关实训第 3 组": "020202项目组",
        "丙（需求工程师）": "任俊强（需求与合规负责人）",
        "乙（架构师）": "严宇（技术负责人）",
        "评委会（M2 设计评审）": "李晓雷（教师模拟甲方代表）",
    }
    for section in doc.sections:
        for part in (section.header, section.footer):
            for p in part.paragraphs:
                value = p.text
                for old, new in sample_terms.items():
                    value = value.replace(old, new)
                if value != p.text:
                    replace_paragraph(p, value, size=9)


def replace_toc_with_static_entries(doc: Document) -> None:
    """Remove stale Reference bookmarks and retain its TOC page as a static index."""
    body = doc.element.body
    sdts = body.xpath("./w:sdt")
    if not sdts:
        raise RuntimeError("Reference TOC content control not found")
    toc = sdts[0]

    def make_p(text: str, style: str, *, centered: bool = False, page: str | None = None):
        p = OxmlElement("w:p")
        ppr = OxmlElement("w:pPr")
        pstyle = OxmlElement("w:pStyle")
        pstyle.set(qn("w:val"), style)
        ppr.append(pstyle)
        if centered:
            jc = OxmlElement("w:jc")
            jc.set(qn("w:val"), "center")
            ppr.append(jc)
        if page is not None:
            tabs = OxmlElement("w:tabs")
            tab = OxmlElement("w:tab")
            tab.set(qn("w:val"), "right")
            tab.set(qn("w:leader"), "dot")
            tab.set(qn("w:pos"), "8500")
            tabs.append(tab)
            ppr.append(tabs)
        p.append(ppr)
        r = OxmlElement("w:r")
        t = OxmlElement("w:t")
        t.text = text
        r.append(t)
        p.append(r)
        if page is not None:
            rtab = OxmlElement("w:r")
            rtab.append(OxmlElement("w:tab"))
            p.append(rtab)
            rpage = OxmlElement("w:r")
            tpage = OxmlElement("w:t")
            tpage.text = page
            rpage.append(tpage)
            p.append(rpage)
        return p

    entries = [
        ("1 追踪规则与读法", "1"),
        ("2 MVP 正向追踪（29 条）", "1"),
        ("3 非 MVP、仍属本期范围的逐条追踪（10 条）", "3"),
        ("4 覆盖统计与准出", "3"),
        ("5 后续使用", "4"),
        ("6 G3-08 设计挂接规则与状态", "4"),
        ("7 逐 FR 双向设计追踪（39 条）", "5"),
        ("8 关键约束、反向追踪与准出", "8"),
    ]
    toc.addprevious(make_p("目 录", "TOCHeading", centered=True))
    for text, page in entries:
        toc.addprevious(make_p(text, "TOC1", page=page))
    body.remove(toc)


def add_source_content(doc: Document) -> None:
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    template_style = doc.tables[0].style
    metadata = []
    for line in lines[1:]:
        if line.startswith("## "):
            break
        if line.startswith("- ") and "：" in line:
            key, value = line[2:].split("：", 1)
            metadata.append([clean_md(key), clean_md(value)])

    add_caption(doc, "表 1-1 文档控制")
    control = doc.add_table(rows=1, cols=2)
    control.style = template_style
    control.rows[0].cells[0].text = "项目"
    control.rows[0].cells[1].text = "内容"
    for key, value in metadata:
        cells = control.add_row().cells
        cells[0].text = key
        cells[1].text = value
    format_table(control, font_size=8.5)

    captions = {
        2: "表 2-1 MVP 需求正向追踪矩阵",
        3: "表 3-1 非 MVP 本期需求正向追踪矩阵",
        4: "表 4-1 覆盖统计与准出检查",
        7: "表 7-1 逐 FR 双向设计追踪矩阵",
        8: "表 8-1 关键约束与设计验证落点",
    }
    current_section = 0
    i = 1
    while i < len(lines):
        raw = lines[i]
        if raw.startswith("## "):
            title = clean_md(raw[3:])
            match = re.match(r"(\d+)\s+", title)
            current_section = int(match.group(1)) if match else current_section
            p = doc.add_paragraph(style="Heading 1")
            p.paragraph_format.keep_with_next = True
            run = p.add_run(title)
            set_east_asia(run, "黑体")
            i += 1
            continue
        if raw.lstrip().startswith("|"):
            rows, i = parse_md_table(lines, i)
            if rows:
                add_table(doc, rows, captions.get(current_section, f"表 {current_section}-1 追踪信息"), template_style)
            continue
        text = clean_md(raw)
        if not text or raw.startswith("# ") or (raw.startswith("- ") and current_section == 0):
            i += 1
            continue
        style = "List Paragraph" if re.match(r"^(?:\d+\.|- )", text) else "Normal"
        p = doc.add_paragraph(style=style)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.25
        if style == "Normal" and not text.startswith("准出结论") and not text.startswith("G3-08 准出结论"):
            p.paragraph_format.first_line_indent = Pt(24)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        run = p.add_run(text)
        set_east_asia(run, "宋体")
        run.font.size = Pt(10.5)
        i += 1


def main() -> int:
    shutil.copy2(REFERENCE, OUTPUT)
    doc = Document(OUTPUT)
    remove_reference_body(doc)
    update_front_matter(doc)
    replace_toc_with_static_entries(doc)
    add_source_content(doc)
    # python-docx appends new blocks after the retained body sectPr. OOXML requires
    # the final sectPr to remain the last child; move it back after authoring.
    body = doc.element.body
    final_sectpr = body.sectPr
    body.remove(final_sectpr)
    body.append(final_sectpr)
    doc.core_properties.title = "需求追踪矩阵（RTM）v1—G3-08设计挂接版"
    doc.core_properties.subject = "某自然博物馆智能运营中心建设项目——应急管理子系统"
    doc.core_properties.author = "020202项目组"
    doc.core_properties.last_modified_by = "020202项目组"
    doc.save(OUTPUT)
    print(OUTPUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
