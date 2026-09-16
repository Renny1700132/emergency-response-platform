"""G2-R04 MODE-C formatting-only repair for the formal SRS.

Copies only OOXML presentation properties from the unique paired reference.
The before/after visible-text snapshots are written beside the QA evidence and
must compare equal before the script reports success.
"""
from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "docs/deliverables/08-软件需求规格说明书SRS.docx"
REFERENCE = ROOT / "docs/reference/08-软件需求规格说明书SRS-v3（教学样例）.docx"
OUT = ROOT / "logs/reviews/G2-R04_08_content_freeze.json"


def visible_snapshot(doc: Document) -> dict:
    """Ordered visible DOCX text, including headers/footers and tables."""
    parts = []
    for i, p in enumerate(doc.paragraphs):
        parts.append((f"body.p.{i}", p.text))
    for ti, table in enumerate(doc.tables):
        for ri, row in enumerate(table.rows):
            for ci, cell in enumerate(row.cells):
                for pi, p in enumerate(cell.paragraphs):
                    parts.append((f"table.{ti}.{ri}.{ci}.{pi}", p.text))
    seen = set()
    for si, section in enumerate(doc.sections):
        for label, part in (("header", section.header), ("footer", section.footer)):
            key = id(part._element)
            if key in seen:
                continue
            seen.add(key)
            for pi, p in enumerate(part.paragraphs):
                parts.append((f"{label}.{si}.{pi}", p.text))
            for ti, table in enumerate(part.tables):
                for ri, row in enumerate(table.rows):
                    for ci, cell in enumerate(row.cells):
                        for pi, p in enumerate(cell.paragraphs):
                            parts.append((f"{label}.table.{si}.{ti}.{ri}.{ci}.{pi}", p.text))
    canonical = json.dumps(parts, ensure_ascii=False, separators=(",", ":"))
    return {"sha256": hashlib.sha256(canonical.encode("utf-8")).hexdigest(), "items": parts}


def copy_child(src, dst, name: str) -> None:
    src_el = getattr(src._p if hasattr(src, "_p") else src, name, None)
    dst_el_parent = dst._p if hasattr(dst, "_p") else dst
    if src_el is None:
        return
    old = getattr(dst_el_parent, name, None)
    if old is not None:
        dst_el_parent.remove(old)
    dst_el_parent.insert(0, deepcopy(src_el))


def copy_paragraph_format(src, dst) -> None:
    # pPr includes indents, spacing, justification and keep-with-next. Runs stay
    # untouched so existing bold/italic emphasis is not accidentally flattened.
    copy_child(src, dst, "pPr")


def copy_run_format(src, dst) -> None:
    if not src.runs:
        return
    source_rpr = src.runs[0]._r.rPr
    if source_rpr is None:
        return
    for run in dst.runs:
        if run._r.rPr is not None:
            run._r.remove(run._r.rPr)
        run._r.insert(0, deepcopy(source_rpr))


def first_paragraph(doc, predicate):
    for p in doc.paragraphs:
        if predicate(p):
            return p
    raise RuntimeError("Reference paragraph sample not found")


def caption_kind(text: str) -> str | None:
    text = text.strip()
    if text.startswith("表"):
        return "table"
    if text.startswith("图"):
        return "figure"
    return None


def copy_table_presentation(source, target) -> None:
    # Copy table-level appearance, then header/body cells separately. Grid and
    # widths are deliberately preserved because this document has different data.
    if source._tbl.tblPr is not None:
        if target._tbl.tblPr is not None:
            target._tbl.remove(target._tbl.tblPr)
        target._tbl.insert(0, deepcopy(source._tbl.tblPr))
    source_rows = source.rows
    for ri, row in enumerate(target.rows):
        source_row = source_rows[0 if ri == 0 else min(1, len(source_rows) - 1)]
        if source_row._tr.trPr is not None:
            if row._tr.trPr is not None:
                row._tr.remove(row._tr.trPr)
            row._tr.insert(0, deepcopy(source_row._tr.trPr))
        for ci, cell in enumerate(row.cells):
            source_cell = source_row.cells[min(ci, len(source_row.cells) - 1)]
            if source_cell._tc.tcPr is not None:
                if cell._tc.tcPr is not None:
                    cell._tc.remove(cell._tc.tcPr)
                cell._tc.insert(0, deepcopy(source_cell._tc.tcPr))
            for pi, p in enumerate(cell.paragraphs):
                sample = source_cell.paragraphs[min(pi, len(source_cell.paragraphs) - 1)]
                copy_paragraph_format(sample, p)


def main() -> None:
    target = Document(TARGET)
    before = visible_snapshot(target)
    reference = Document(REFERENCE)

    normal = first_paragraph(reference, lambda p: p.style.name == "Normal" and len(p.text.strip()) > 20)
    heading_samples = {}
    for style_name in ("Heading 1", "Heading 2", "Heading 3"):
        heading_samples[style_name] = first_paragraph(reference, lambda p, s=style_name: p.style.name == s)
    cap_table = first_paragraph(reference, lambda p: caption_kind(p.text) == "table")
    cap_figure = first_paragraph(reference, lambda p: caption_kind(p.text) == "figure")

    changed = {"normal": 0, "headings": 0, "captions": 0, "tables": 0}
    for p in target.paragraphs:
        kind = caption_kind(p.text)
        if kind:
            sample = cap_table if kind == "table" else cap_figure
            copy_paragraph_format(sample, p)
            copy_run_format(sample, p)
            changed["captions"] += 1
        elif p.style.name in heading_samples:
            sample = heading_samples[p.style.name]
            copy_paragraph_format(sample, p)
            copy_run_format(sample, p)
            changed["headings"] += 1
        elif p.style.name == "Normal" and p.text.strip():
            copy_paragraph_format(normal, p)
            changed["normal"] += 1

    # The reference's first ordinary matrix is the direct source for table body
    # appearance; it intentionally has no project facts copied across.
    table_source = reference.tables[0]
    for table in target.tables:
        copy_table_presentation(table_source, table)
        changed["tables"] += 1

    target.save(TARGET)
    after = visible_snapshot(Document(TARGET))
    evidence = {
        "task": "G2-R04",
        "mode": "FORMAT ONLY",
        "target": str(TARGET.relative_to(ROOT)).replace("\\", "/"),
        "reference": str(REFERENCE.relative_to(ROOT)).replace("\\", "/"),
        "before": before,
        "after": after,
        "CONTENT_FREEZE_CHECK": "PASS" if before["items"] == after["items"] else "FAIL",
        "presentation_changes": changed,
    }
    OUT.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    if evidence["CONTENT_FREEZE_CHECK"] != "PASS":
        raise SystemExit("CONTENT_FREEZE_CHECK failed")
    print(json.dumps({k: evidence[k] for k in ("CONTENT_FREEZE_CHECK", "presentation_changes")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
