"""Apply reference-derived formatting without changing DOCX text or images."""

from __future__ import annotations

import argparse
import math
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


STYLE_NAMES = [
    "Title", "Subtitle", "Heading 1", "Heading 2", "Heading 3", "Normal",
    "List Paragraph", "Caption", "TOC 1", "TOC 2", "TOC 3",
]


def replace_child(parent, source_parent, tag: str) -> None:
    old = parent.find(qn(tag))
    if old is not None:
        parent.remove(old)
    source = None if source_parent is None else source_parent.find(qn(tag))
    if source is not None:
        parent.append(deepcopy(source))


def copy_style(current, reference, name: str) -> None:
    try:
        dst = current.styles[name].element
        src = reference.styles[name].element
    except KeyError:
        return
    replace_child(dst, src, "w:pPr")
    replace_child(dst, src, "w:rPr")


def copy_paragraph_format(dst, src, copy_style_name: bool = False) -> None:
    if copy_style_name:
        try:
            dst.style = src.style.name
        except (KeyError, ValueError):
            pass
    dst_ppr = dst._p.get_or_add_pPr()
    src_ppr = src._p.pPr
    # Preserve section/page-break plumbing; replace only paragraph formatting.
    for tag in [
        "w:jc", "w:ind", "w:spacing", "w:keepNext", "w:keepLines",
        "w:widowControl", "w:pageBreakBefore", "w:tabs", "w:contextualSpacing",
    ]:
        replace_child(dst_ppr, src_ppr, tag)


def copy_run_format(dst, src) -> None:
    dst_rpr = dst._r.get_or_add_rPr()
    src_rpr = src._r.rPr
    if src_rpr is None:
        return
    # Bold/italic/underline can be semantic emphasis, so preserve those three.
    for tag in ["w:rFonts", "w:sz", "w:szCs", "w:color", "w:spacing", "w:kern", "w:lang"]:
        replace_child(dst_rpr, src_rpr, tag)


def apply_paragraph_pattern(dst, src) -> None:
    copy_paragraph_format(dst, src)
    if not src.runs:
        return
    src_runs = [r for r in src.runs if r.text] or src.runs
    for index, run in enumerate(dst.runs):
        copy_run_format(run, src_runs[min(index, len(src_runs) - 1)])


def copy_table_format(dst, src) -> None:
    dst_tbl = dst._tbl
    src_tbl = src._tbl
    replace_child(dst_tbl, src_tbl, "w:tblPr")
    replace_child(dst_tbl, src_tbl, "w:tblGrid")
    for row_index, row in enumerate(dst.rows):
        src_row = src.rows[0 if row_index == 0 else min(row_index, len(src.rows) - 1)]
        replace_child(row._tr, src_row._tr, "w:trPr")
        for col_index, cell in enumerate(row.cells):
            src_cell = src_row.cells[min(col_index, len(src_row.cells) - 1)]
            dst_tcpr = cell._tc.get_or_add_tcPr()
            src_tcpr = src_cell._tc.tcPr
            for tag in ["w:tcW", "w:tcBorders", "w:shd", "w:tcMar", "w:vAlign", "w:textDirection", "w:noWrap"]:
                replace_child(dst_tcpr, src_tcpr, tag)
            for para_index, para in enumerate(cell.paragraphs):
                src_para = src_cell.paragraphs[min(para_index, len(src_cell.paragraphs) - 1)]
                apply_paragraph_pattern(para, src_para)


def copy_table_visual_keep_geometry(dst, src) -> None:
    """Copy reference table visuals while preserving a different column grid."""
    replace_child(dst._tbl, src._tbl, "w:tblPr")
    for row_index, row in enumerate(dst.rows):
        src_row = src.rows[0 if row_index == 0 else min(row_index, len(src.rows) - 1)]
        replace_child(row._tr, src_row._tr, "w:trPr")
        for col_index, cell in enumerate(row.cells):
            mapped = round(col_index * (len(src_row.cells) - 1) / max(len(row.cells) - 1, 1))
            src_cell = src_row.cells[mapped]
            dst_tcpr = cell._tc.get_or_add_tcPr()
            src_tcpr = src_cell._tc.tcPr
            for tag in ["w:tcBorders", "w:shd", "w:tcMar", "w:vAlign", "w:textDirection", "w:noWrap"]:
                replace_child(dst_tcpr, src_tcpr, tag)
            for para_index, para in enumerate(cell.paragraphs):
                src_para = src_cell.paragraphs[min(para_index, len(src_cell.paragraphs) - 1)]
                apply_paragraph_pattern(para, src_para)


def align_sections(current, reference) -> None:
    if len(reference.sections) == 1 and len(current.sections) > 1:
        # Intermediate section properties are format-only. Collapse them so the
        # skeleton matches the one-section reference while retaining the final
        # body sectPr and all visible content.
        for paragraph in current.element.body.findall(qn("w:p")):
            ppr = paragraph.find(qn("w:pPr"))
            sect = None if ppr is None else ppr.find(qn("w:sectPr"))
            if sect is not None:
                ppr.remove(sect)
    for index, section in enumerate(current.sections):
        source = reference.sections[min(index, len(reference.sections) - 1)]
        dst_sp, src_sp = section._sectPr, source._sectPr
        for tag in ["w:type", "w:pgSz", "w:pgMar", "w:cols", "w:titlePg", "w:vAlign", "w:pgNumType"]:
            replace_child(dst_sp, src_sp, tag)


def grid_ratios(table) -> list[float]:
    grid = table._tbl.tblGrid
    if grid is None:
        return []
    values = [float(x.get(qn("w:w"), "0")) for x in grid.gridCol_lst]
    total = sum(values) or 1.0
    return [x / total for x in values]


def choose_table_pattern(table, references):
    candidates = [t for t in references if len(t.columns) == len(table.columns)]
    if not candidates:
        return None
    target = grid_ratios(table)
    def score(candidate):
        ratios = grid_ratios(candidate)
        geometry = sum((a - b) ** 2 for a, b in zip(target, ratios)) if len(target) == len(ratios) else 1.0
        rows = abs(math.log((len(table.rows) + 1) / (len(candidate.rows) + 1)))
        return geometry * 8 + rows * 0.12
    return min(candidates, key=score)


def fit_table_to_text_width(table, max_twips: int = 9026) -> None:
    """Scale an over-wide frozen table into the reference text block."""
    grid = table._tbl.tblGrid
    if grid is None or not grid.gridCol_lst:
        return
    widths = [int(col.get(qn("w:w"), "0")) for col in grid.gridCol_lst]
    total = sum(widths)
    if total <= max_twips or total <= 0:
        return
    scale = max_twips / total
    for col, width in zip(grid.gridCol_lst, widths):
        col.set(qn("w:w"), str(max(1, round(width * scale))))
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.insert(0, tbl_w)
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(max_twips))
    for row in table.rows:
        for cell in row.cells:
            tc_w = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
            if tc_w is not None and tc_w.get(qn("w:type"), "dxa") == "dxa":
                old = int(tc_w.get(qn("w:w"), "0"))
                tc_w.set(qn("w:w"), str(max(1, round(old * scale))))


def first_paragraph(doc, style_name: str, predicate=None):
    for paragraph in doc.paragraphs:
        if paragraph.style.name == style_name and paragraph.text.strip() and (predicate is None or predicate(paragraph)):
            return paragraph
    return None


def apply_run_pattern_all(paragraph, source):
    copy_paragraph_format(paragraph, source)
    if not source.runs:
        return
    pattern = next((r for r in source.runs if r.text), source.runs[0])
    for run in paragraph.runs:
        copy_run_format(run, pattern)


def align_headers_footers(current, reference) -> None:
    for index, section in enumerate(current.sections):
        src = reference.sections[min(index, len(reference.sections) - 1)]
        for dst_part, src_part in [(section.header, src.header), (section.footer, src.footer)]:
            if src_part.paragraphs:
                pattern = src_part.paragraphs[0]
                for paragraph in dst_part.paragraphs:
                    apply_run_pattern_all(paragraph, pattern)
            # Set inheritance last: touching paragraphs on a linked, empty part
            # can materialize a local relationship and flip this flag back.
            dst_part.is_linked_to_previous = src_part.is_linked_to_previous
        # python-docx retains a first-section empty header relationship in some
        # packages even after the public flag is set. Remove that relationship
        # at XML level when the reference truly inherits/omits the part.
        if src.header.is_linked_to_previous:
            for rel in list(section._sectPr.findall(qn("w:headerReference"))):
                section._sectPr.remove(rel)
        if src.footer.is_linked_to_previous:
            for rel in list(section._sectPr.findall(qn("w:footerReference"))):
                section._sectPr.remove(rel)


def align_generic(current: Document, reference: Document, doc_id: str) -> None:
    body_start = next((i for i, p in enumerate(current.paragraphs) if p.style.name == "Heading 1"), 0)
    reference_body_start = next((i for i, p in enumerate(reference.paragraphs) if p.style.name == "Heading 1"), 0)
    patterns = {
        name: first_paragraph(reference, name)
        for name in ["Heading 1", "Heading 2", "Heading 3", "Normal", "List Paragraph"]
    }
    normal_body = next(
        (p for i, p in enumerate(reference.paragraphs) if i > reference_body_start and p.style.name == "Normal" and p.text.strip()),
        patterns["Normal"],
    )
    caption_pattern = next(
        (p for p in reference.paragraphs if p.text.strip().startswith(("图 ", "表 ", "图", "表")) and p.alignment == 1),
        None,
    )
    for index, paragraph in enumerate(current.paragraphs):
        if index < body_start or not paragraph.text.strip():
            continue
        text = paragraph.text.strip()
        if caption_pattern is not None and text.startswith(("图 ", "表 ")):
            apply_run_pattern_all(paragraph, caption_pattern)
        elif paragraph.style.name == "Normal" and normal_body is not None:
            apply_run_pattern_all(paragraph, normal_body)
        elif paragraph.style.name in patterns and patterns[paragraph.style.name] is not None:
            apply_run_pattern_all(paragraph, patterns[paragraph.style.name])

    for table in current.tables:
        pattern = choose_table_pattern(table, reference.tables)
        if pattern is not None:
            copy_table_format(table, pattern)
        fit_table_to_text_width(table)

    if reference.inline_shapes:
        refs = list(reference.inline_shapes)
        for shape in current.inline_shapes:
            ratio = shape.width / max(shape.height, 1)
            pattern = min(refs, key=lambda x: abs(math.log(ratio / (x.width / max(x.height, 1)))))
            current_ratio = shape.height / shape.width
            shape.width = pattern.width
            shape.height = int(shape.width * current_ratio)

    align_headers_footers(current, reference)

    if doc_id == "00":
        c, r = current.paragraphs, reference.paragraphs
        # Reference-derived cover typography for the three frozen content blocks.
        apply_run_pattern_all(c[0], r[5])
        apply_run_pattern_all(c[1], r[3])
        apply_run_pattern_all(c[2], r[6])
        c[0].alignment = c[1].alignment = c[2].alignment = 1
        # Static TOC: use reference TOC1 tab leader/rhythm while preserving every entry.
        toc = c[7]
        toc.paragraph_format.left_indent = 0
        toc.paragraph_format.right_indent = 0
        toc.paragraph_format.space_after = 0
        toc.paragraph_format.line_spacing = 1.0
        ppr = toc._p.get_or_add_pPr()
        tabs = ppr.find(qn("w:tabs"))
        if tabs is not None:
            ppr.remove(tabs)
        tabs = OxmlElement("w:tabs")
        tab = OxmlElement("w:tab")
        tab.set(qn("w:val"), "right")
        tab.set(qn("w:leader"), "dot")
        tab.set(qn("w:pos"), "9026")
        tabs.append(tab)
        ppr.append(tabs)
        for run in toc.runs:
            run.font.size = reference.paragraphs[16].runs[0].font.size
            run.font.bold = True
    elif doc_id == "01":
        c, r = current.paragraphs, reference.paragraphs
        # Map every existing frozen cover/revision block to the matching
        # reference role. Missing reference-only blocks are not synthesized.
        for dst_index, src_index in {
            0: 0, 1: 1, 2: 3, 3: 4, 4: 7, 5: 8, 6: 9, 7: 1, 8: 11,
            10: 13,
        }.items():
            apply_run_pattern_all(c[dst_index], r[src_index])
    elif doc_id == "04" and len(current.tables) > 2 and len(reference.tables) > 1:
        copy_table_visual_keep_geometry(current.tables[2], reference.tables[1])
        fit_table_to_text_width(current.tables[2])


def align_06(current: Document, reference: Document) -> None:
    c, r = current.paragraphs, reference.paragraphs
    # Cover roles. Frozen extra subsystem/date-page text keeps its own slot.
    mapping = {0: 0, 1: 1, 2: 2, 3: 3, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9, 11: 10}
    for dst_index, src_index in mapping.items():
        apply_paragraph_pattern(c[dst_index], r[src_index])

    # Independent date page uses the reference cover metadata type system.
    for dst_index, src_index in {21: 7, 22: 11, 23: 11}.items():
        apply_paragraph_pattern(c[dst_index], r[src_index])
        c[dst_index].alignment = 1

    # Revision title/note and figure caption.
    for dst_index, src_index in {25: 13, 26: 14, 30: 18}.items():
        apply_paragraph_pattern(c[dst_index], r[src_index])

    # Match the reference heading ladder without changing heading text.
    for para in c:
        text = para.text.strip()
        if text.startswith(("第一部分", "第二部分", "第三部分")):
            para.style = current.styles["Heading 1"]
        elif text and text[0].isdigit() and (":" in text or "：" in text) and "—" in text:
            para.style = current.styles["Heading 2"]
        elif text[:4] in {"2.1 ", "2.2 ", "2.3 ", "2.4 ", "2.5 ", "3.1 ", "3.2 "}:
            para.style = current.styles["Heading 2"]

    # Reference body rhythm: apply to non-front-matter ordinary paragraphs.
    normal_pattern = r[20]
    list_pattern = r[33]
    for index, para in enumerate(c):
        if index <= 30 or not para.text.strip():
            continue
        if para.style.name == "Normal":
            apply_paragraph_pattern(para, normal_pattern)
        elif para.style.name == "List Paragraph":
            apply_paragraph_pattern(para, list_pattern)
        if para.text.startswith("我们用三类协同保证"):
            para.paragraph_format.keep_together = True

    # Revision table and both four-column strategy/response tables.
    copy_table_format(current.tables[0], reference.tables[0])
    copy_table_format(current.tables[1], reference.tables[1])
    copy_table_format(current.tables[2], reference.tables[1])

    # Match reference figure width while preserving the deliverable aspect ratio.
    if current.inline_shapes and reference.inline_shapes:
        shape = current.inline_shapes[0]
        ratio = shape.height / shape.width
        shape.width = reference.inline_shapes[0].width
        shape.height = int(shape.width * ratio)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", required=True)
    parser.add_argument("--current", required=True, type=Path)
    parser.add_argument("--reference", required=True, type=Path)
    args = parser.parse_args()
    current = Document(args.current)
    reference = Document(args.reference)
    for name in STYLE_NAMES:
        copy_style(current, reference, name)
    align_sections(current, reference)
    if args.id == "06":
        align_06(current, reference)
    else:
        align_generic(current, reference, args.id)
    current.save(args.current)


if __name__ == "__main__":
    main()
