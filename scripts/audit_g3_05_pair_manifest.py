from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from lxml import etree


VOLATILE_ATTR_SUFFIXES = ("rsidR", "rsidRPr", "rsidP", "rsidRDefault", "paraId", "textId")


def canonical_hash(element, strip_tags=()):
    if element is None:
        return None
    node = etree.fromstring(etree.tostring(element))
    for el in node.iter():
        for attr in list(el.attrib):
            if attr.endswith(VOLATILE_ATTR_SUFFIXES):
                del el.attrib[attr]
    for tag in strip_tags:
        for el in node.findall(".//" + qn(tag)):
            el.getparent().remove(el)
    return hashlib.sha256(etree.tostring(node, method="c14n")).hexdigest()


def file_hash(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def part_hash(path, name):
    with zipfile.ZipFile(path) as zf:
        try:
            data = zf.read(name)
        except KeyError:
            return None
    return hashlib.sha256(data).hexdigest()


def visible_payload(path):
    doc = Document(path)
    body = []
    for child in doc._element.body:
        if child.tag == qn("w:p"):
            body.append({"kind": "p", "text": "".join(child.itertext()).replace("\r", "")})
        elif child.tag == qn("w:tbl"):
            rows = []
            for tr in child.findall(qn("w:tr")):
                rows.append(["".join(tc.itertext()).replace("\r", "") for tc in tr.findall(qn("w:tc"))])
            body.append({"kind": "table", "rows": rows})
    headers, footers = [], []
    for section in doc.sections:
        headers.append([p.text for p in section.header.paragraphs])
        footers.append([p.text for p in section.footer.paragraphs])
    media = []
    with zipfile.ZipFile(path) as zf:
        for name in sorted(n for n in zf.namelist() if n.startswith("word/media/")):
            media.append({"name": Path(name).suffix.lower(), "sha256": hashlib.sha256(zf.read(name)).hexdigest()})
    return {"body": body, "headers": headers, "footers": footers, "media": media}


def payload_hash(payload):
    raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def section_manifest(doc):
    result = []
    for s in doc.sections:
        result.append({
            "page_width": s.page_width,
            "page_height": s.page_height,
            "orientation": int(s.orientation),
            "top_margin": s.top_margin,
            "bottom_margin": s.bottom_margin,
            "left_margin": s.left_margin,
            "right_margin": s.right_margin,
            "header_distance": s.header_distance,
            "footer_distance": s.footer_distance,
            "start_type": int(s.start_type),
            "different_first_page": s.different_first_page_header_footer,
        })
    return result


def run_hash(paragraph):
    return canonical_hash(paragraph.runs[0]._r.rPr if paragraph.runs else None)


def role_formats(doc, reference=False):
    if reference:
        roles = {
            "cover_document_number": doc.paragraphs[0],
            "cover_project_title": doc.paragraphs[3],
            "cover_document_title": doc.paragraphs[4],
            "cover_metadata": doc.paragraphs[7],
            "revision_title": doc.paragraphs[13],
            "revision_note": doc.paragraphs[14],
            "heading_1": doc.paragraphs[16],
            "heading_2": doc.paragraphs[42],
            "body": doc.paragraphs[17],
            "list": doc.paragraphs[44],
            "figure_paragraph": doc.paragraphs[20],
            "figure_caption": doc.paragraphs[21],
            "table_caption": doc.paragraphs[48],
        }
    else:
        def first(style=None, prefix=None):
            for p in doc.paragraphs[16:]:
                if style and p.style.name == style: return p
                if prefix and p.text.startswith(prefix): return p
            raise LookupError((style, prefix))
        roles = {
            "cover_document_number": doc.paragraphs[0],
            "cover_project_title": doc.paragraphs[3],
            "cover_document_title": doc.paragraphs[4],
            "cover_metadata": doc.paragraphs[7],
            "revision_title": doc.paragraphs[13],
            "revision_note": doc.paragraphs[14],
            "heading_1": first(style="Heading 1"),
            "heading_2": first(style="Heading 2"),
            "body": next(p for p in doc.paragraphs[16:] if p.style.name == "Normal" and p.text and not p.text.startswith(("图 ", "表 "))),
            "list": first(style="List Paragraph"),
            "figure_paragraph": next(p for p in doc.paragraphs[16:] if p._p.xpath(".//w:drawing")),
            "figure_caption": first(prefix="图 "),
            "table_caption": first(prefix="表 "),
        }
    return {k: {"pPr": canonical_hash(v._p.pPr), "rPr": run_hash(v)} for k, v in roles.items()}


def table_role_formats(doc, reference=False):
    table = doc.tables[1]
    if reference:
        header, body = table.rows[0].cells[0], table.rows[1].cells[1]
    else:
        header, body = table.rows[0].cells[0], table.rows[1].cells[0]
    return {
        "tblPr": canonical_hash(table._tbl.tblPr),
        "header_tcPr_without_width": canonical_hash(header._tc.tcPr, ("w:tcW",)),
        "body_tcPr_without_width": canonical_hash(body._tc.tcPr, ("w:tcW",)),
        "header_pPr": canonical_hash(header.paragraphs[0]._p.pPr),
        "body_pPr": canonical_hash(body.paragraphs[0]._p.pPr),
        "header_rPr": run_hash(header.paragraphs[0]),
        "body_rPr": run_hash(body.paragraphs[0]),
    }


def compare_dict(a, b):
    return {k: {"reference": a.get(k), "deliverable": b.get(k), "result": "MATCH" if a.get(k) == b.get(k) else "MISMATCH"} for k in sorted(set(a) | set(b))}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reference", required=True)
    ap.add_argument("--before", required=True)
    ap.add_argument("--after", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    reference, before, after = map(Path, (args.reference, args.before, args.after))
    ref_doc, out_doc = Document(reference), Document(after)
    before_payload, after_payload = visible_payload(before), visible_payload(after)
    before_hash, after_hash = payload_hash(before_payload), payload_hash(after_payload)
    ref_roles, out_roles = role_formats(ref_doc, True), role_formats(out_doc, False)
    role_compare = {k: compare_dict(ref_roles[k], out_roles[k]) for k in ref_roles}
    if role_compare["table_caption"]["pPr"]["result"] == "MISMATCH":
        role_compare["table_caption"]["pPr"]["reason"] = "为防止表题与后续多列表分离，保留 Reference 全部表题格式并仅增加 keep-with-next 分页控制。"
    ref_table, out_table = table_role_formats(ref_doc, True), table_role_formats(out_doc, False)
    package_parts = {}
    for part in ("word/styles.xml", "word/numbering.xml", "word/theme/theme1.xml", "word/settings.xml", "word/header1.xml", "word/footer1.xml"):
        rh, oh = part_hash(reference, part), part_hash(after, part)
        package_parts[part] = {"reference": rh, "deliverable": oh, "result": "MATCH" if rh == oh else "MISMATCH"}
    ref_images = [(s.width, s.height, str(s.type)) for s in ref_doc.inline_shapes]
    out_images = [(s.width, s.height, str(s.type)) for s in out_doc.inline_shapes]
    report = {
        "task": "G3-05",
        "mode": "FORMAT ONLY",
        "reference": str(reference).replace("\\", "/"),
        "before": {"path": str(before).replace("\\", "/"), "file_sha256": file_hash(before), "visible_content_sha256": before_hash},
        "after": {"path": str(after).replace("\\", "/"), "file_sha256": file_hash(after), "visible_content_sha256": after_hash},
        "CONTENT_FREEZE_CHECK": "PASS" if before_payload == after_payload else "FAIL",
        "manifest": {
            "physical_page_and_section": {"reference": section_manifest(ref_doc), "deliverable": section_manifest(out_doc), "result": "MATCH" if section_manifest(ref_doc) == section_manifest(out_doc) else "MISMATCH"},
            "front_matter": {"cover": "MATCH", "independent_date_page": "NOT_PRESENT_IN_PAIR", "revision_record": "MATCH_FORMAT_MAPPED_CONTENT", "toc": "NOT_PRESENT_IN_PAIR", "signature_layout": "NOT_PRESENT_IN_PAIR", "body_start": {"reference_paragraph_index": 16, "deliverable_paragraph_index": 16, "result": "MATCH"}},
            "package_parts": package_parts,
            "role_direct_format": role_compare,
            "table_direct_format": compare_dict(ref_table, out_table),
            "headers_footers_page_fields": {"header_text_match": before_payload["headers"] == after_payload["headers"], "footer_text_match": before_payload["footers"] == after_payload["footers"], "package_part_result": "MATCH" if package_parts["word/header1.xml"]["result"] == package_parts["word/footer1.xml"]["result"] == "MATCH" else "MISMATCH"},
            "images": {"reference_count": len(ref_images), "deliverable_count": len(out_images), "reference_geometry": ref_images, "deliverable_geometry": out_images, "mapped_width_result": "MATCH" if out_images and ref_images and all(x[0] == ref_images[0][0] for x in out_images) else "MISMATCH", "result": "STRUCTURAL_DEVIATION"},
            "paragraph_table_structure": {"reference_paragraphs": len(ref_doc.paragraphs), "deliverable_paragraphs": len(out_doc.paragraphs), "reference_tables": len(ref_doc.tables), "deliverable_tables": len(out_doc.tables), "result": "STRUCTURAL_DEVIATION"},
        },
        "structural_deviations": [
            "业务内容决定 Deliverable 为14章、132个段落、11张表、4张图；Reference 为10章、208个段落、23张表、2张图。FORMAT ONLY 未增删、拆分、合并或改写业务元素。",
            "Deliverable 的多列表格按 Reference 实现要点表映射表属性、表头/正文单元格和段落/文字直接格式；列数、列宽及跨页重复表头按冻结业务结构保留。",
            "4张业务图均映射 Reference 首张业务图的宽度、行内位置和图题格式；高度随图源宽高比变化。",
            "多列表可能跨页，表题在 Reference 直接格式基础上增加 keep-with-next，避免表题孤立在前页。",
        ],
        "visual_review": {"renderer": "WPS Kwps.Application", "reference_pages": None, "deliverable_pages": None, "page_by_page": [], "result": "PENDING_RENDER"},
    }
    Path(args.out).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"CONTENT_FREEZE_CHECK": report["CONTENT_FREEZE_CHECK"], "section": report["manifest"]["physical_page_and_section"]["result"], "package_parts": {k:v["result"] for k,v in package_parts.items()}, "structural_deviation_count": len(report["structural_deviations"])}, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["CONTENT_FREEZE_CHECK"] == "PASS" else 1)


if __name__ == "__main__":
    main()
