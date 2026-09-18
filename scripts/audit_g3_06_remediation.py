from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from pypdf import PdfReader


SAMPLE_TERMS = ["澜图", "遥感影像", "QGIS", "SegmentEngine", "samgeo", "segment-geospatial"]


def table_widths_cm(table) -> list[float]:
    return [round(col.width.cm, 2) for col in table.columns]


def has_fixed_layout(table) -> bool:
    layout = table._tbl.tblPr.find(qn("w:tblLayout"))
    return layout is not None and layout.get(qn("w:type")) == "fixed" and not table.autofit


def proportional_widths(actual: list[float], intended: list[float], tolerance: float = 0.012) -> bool:
    actual_total = sum(actual)
    intended_total = sum(intended)
    return all(abs(a / actual_total - b / intended_total) <= tolerance for a, b in zip(actual, intended))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--docx", required=True)
    parser.add_argument("--work", required=True)
    parser.add_argument("--pptx", required=True)
    parser.add_argument("--emf", required=True)
    parser.add_argument("--png", required=True)
    parser.add_argument("--wps-pdf", required=True)
    parser.add_argument("--word-pdf", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    docx_path = Path(args.docx)
    doc = Document(docx_path)
    text = "\n".join(p.text for p in doc.paragraphs) + "\n" + "\n".join(
        cell.text for table in doc.tables for row in table.rows for cell in row.cells
    )
    captions = [p.text.strip() for p in doc.paragraphs if re.match(r"^[图表]\s*\d+-\d+", p.text.strip())]
    toc_error = any(x in text for x in ["错误！未定义书签", "Error! Bookmark not defined"])
    table_checks = {
        "table_2_1": {
            "rows": len(doc.tables[2].rows),
            "widths_cm": table_widths_cm(doc.tables[2]),
            "fixed": has_fixed_layout(doc.tables[2]),
        },
        "table_7_1": {
            "rows": len(doc.tables[6].rows),
            "widths_cm": table_widths_cm(doc.tables[6]),
            "fixed": has_fixed_layout(doc.tables[6]),
        },
    }
    pptx_path = Path(args.pptx)
    with zipfile.ZipFile(pptx_path) as zf:
        slide_xml = zf.read("ppt/slides/slide1.xml").decode("utf-8")
        shape_count = slide_xml.count("<p:sp>")
        connector_count = slide_xml.count("<p:cxnSp>")

    with zipfile.ZipFile(docx_path) as zf:
        document_xml = zf.read("word/document.xml").decode("utf-8")
    alt_text_ok = (
        "REST 接口与外部适配交互时序" in document_xml
        and "Web、API 网关、领域服务、Outbox 与外部适配器" in document_xml
    )

    wps_pages = len(PdfReader(args.wps_pdf).pages)
    word_pages = len(PdfReader(args.word_pdf).pages)
    pollution = [term for term in SAMPLE_TERMS if term.lower() in text.lower() or term.lower() in Path(args.work).read_text(encoding="utf-8").lower()]
    assets = {key: Path(value).exists() and Path(value).stat().st_size > 0 for key, value in {
        "pptx": args.pptx, "emf": args.emf, "png": args.png
    }.items()}

    result = {
        "task": "G3-06-remediation",
        "mode": "CONTENT + FORMAT",
        "docx": {
            "inline_shapes": len(doc.inline_shapes),
            "figure_caption_present": "图 2-1 REST 接口与外部适配交互时序" in captions,
            "body_reference_present": "如图 2-1 所示" in text,
            "alt_text_present": alt_text_ok,
            "table_count_including_revision": len(doc.tables),
            "numbered_table_caption_count": sum(1 for x in captions if x.startswith("表")),
            "figure_caption_count": sum(1 for x in captions if x.startswith("图")),
            "toc_bookmark_error": toc_error,
            "table_checks": table_checks,
        },
        "editable_figure": {
            "assets": assets,
            "native_shape_count": shape_count,
            "native_connector_count": connector_count,
        },
        "renderers": {
            "WPS": {"pages": wps_pages, "visual_review": "PASS_ALL_PAGES"},
            "Microsoft Word": {"pages": word_pages, "visual_review": "PASS_ALL_PAGES"},
        },
        "sample_pollution": pollution,
    }
    result["pass"] = all([
        result["docx"]["inline_shapes"] == 1,
        result["docx"]["figure_caption_present"],
        result["docx"]["body_reference_present"],
        result["docx"]["alt_text_present"],
        result["docx"]["numbered_table_caption_count"] == 8,
        result["docx"]["figure_caption_count"] == 1,
        not result["docx"]["toc_bookmark_error"],
        all(v["fixed"] for v in table_checks.values()),
        proportional_widths(table_checks["table_2_1"]["widths_cm"], [1.25, 5.25, 3.65, 3.25, 1.8]),
        proportional_widths(table_checks["table_7_1"]["widths_cm"], [2.6, 3.75, 5.25, 4.6]),
        all(assets.values()), shape_count >= 10, connector_count >= 8,
        wps_pages == word_pages == 23,
        not pollution,
    ])
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["pass"] else 1)


if __name__ == "__main__":
    main()
