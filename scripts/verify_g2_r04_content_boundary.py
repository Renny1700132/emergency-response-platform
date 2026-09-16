"""Verify no non-caption visible text changed in the G2-R04 caption repair."""
from __future__ import annotations

import hashlib
import io
import json
import subprocess
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "docs/deliverables/09-AI反向澄清记录.docx",
    "docs/deliverables/10-需求追踪矩阵RTMv1.docx",
]


def snapshot(document: Document):
    items = []
    for i, p in enumerate(document.paragraphs):
        # Caption labels are the explicit, user-authorized G2-R04 metadata delta.
        if p.text.strip().startswith(("表 ", "图 ")):
            continue
        # Paragraph ordinal moves after caption insertion, so the normalized
        # content comparison intentionally keeps the preserved text only.
        items.append(p.text)
    for ti, table in enumerate(document.tables):
        for ri, row in enumerate(table.rows):
            for ci, cell in enumerate(row.cells):
                items.append("\n".join(p.text for p in cell.paragraphs))
    payload = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
    return {"sha256": hashlib.sha256(payload.encode()).hexdigest(), "items": items}


results = {}
for rel in FILES:
    before_bytes = subprocess.check_output(["git", "show", f"HEAD:{rel}"], cwd=ROOT)
    before, after = Document(io.BytesIO(before_bytes)), Document(ROOT / rel)
    left, right = snapshot(before), snapshot(after)
    results[rel] = {"before": left, "after": right, "NON_CAPTION_CONTENT_FREEZE_CHECK": "PASS" if left["items"] == right["items"] else "FAIL"}

(ROOT / "logs/reviews/G2-R04_caption_metadata_boundary.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
for name, result in results.items():
    print(name, result["NON_CAPTION_CONTENT_FREEZE_CHECK"])
    if result["NON_CAPTION_CONTENT_FREEZE_CHECK"] != "PASS":
        raise SystemExit(1)
