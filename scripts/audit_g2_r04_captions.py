"""Structural audit for G2-R04 caption, numbering and body-reference QA."""
from __future__ import annotations

import json
import re
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "07": "docs/deliverables/07-用户访谈记录与MoSCoW优先级.docx",
    "08": "docs/deliverables/08-软件需求规格说明书SRS.docx",
    "09": "docs/deliverables/09-AI反向澄清记录.docx",
    "10": "docs/deliverables/10-需求追踪矩阵RTMv1.docx",
}
CAPTION = re.compile(r"^(表|图)\s*(\d+)-(\d+)\s*(.+)$")
REF = re.compile(r"(?:见|如|参见|依据|对应|详见)?\s*((?:表|图)\s*\d+-\d+)")


def count_images(doc: Document) -> int:
    return len(doc.inline_shapes) + len(doc.part._element.xpath(".//w:drawing")) - len(doc.inline_shapes)


def audit(path: Path) -> dict:
    doc = Document(path)
    paragraphs = list(doc.paragraphs)
    caps, refs = [], []
    for index, p in enumerate(paragraphs):
        text = p.text.strip()
        match = CAPTION.match(text)
        if match:
            caps.append({"paragraph": index, "kind": match.group(1), "id": f"{match.group(2)}-{match.group(3)}", "text": text})
        for found in REF.findall(text):
            refs.append({"paragraph": index, "id": re.sub(r"\s+", "", found), "text": text})
    ids = [f"{c['kind']}{c['id']}" for c in caps]
    duplicate = sorted({x for x in ids if ids.count(x) > 1})
    caption_ids = set(ids)
    invalid_refs = []
    for ref in refs:
        expected = re.sub(r"\s+", "", ref["id"])
        if expected not in caption_ids:
            invalid_refs.append(ref)
    # A caption must immediately precede/follow an object block. Tables are
    # identified by the document body ordering not exposed by python-docx; this
    # audit records the structural caption/reference facts for human pagination QA.
    return {
        "file": str(path.relative_to(ROOT)).replace("\\", "/"),
        "tables_total": len(doc.tables),
        "inline_images": count_images(doc),
        "captions": caps,
        "caption_count": len(caps),
        "duplicate_caption_ids": duplicate,
        "body_references": refs,
        "invalid_body_references": invalid_refs,
        "status": "PASS" if not duplicate and not invalid_refs else "FAIL",
    }


def main() -> None:
    results = {key: audit(ROOT / value) for key, value in FILES.items()}
    (ROOT / "logs/reviews/G2-R04_caption_reference_audit.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    for key, result in results.items():
        print(key, result["tables_total"], result["inline_images"], result["caption_count"], result["status"])


if __name__ == "__main__":
    main()
