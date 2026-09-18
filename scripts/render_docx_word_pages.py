"""C 独立渲染证据：用 Microsoft Word COM 只读打开、重新分页、导出 PDF 并统计页数。

- 只写 `tmp/`（已在 .gitignore 中）临时缓存，不改动任何交付物；复核完成后删除缓存。
- 与 B 的 WPS/Word 自检、A 的 LibreOffice 渲染相互独立，用于跨渲染器分页差异的复核。

用法：python scripts/render_docx_word_pages.py --out tmp/c_render
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import win32com.client as win32

ROOT = Path(__file__).resolve().parents[1]
WD_STAT_PAGES = 2
WD_STAT_WORDS = 0
WD_EXPORT_PDF = 17

PAIRS = {
    "deliverable": ROOT / "docs/deliverables/14-接口设计说明书.docx",
    "reference": ROOT / "docs/reference/14-接口设计说明书（教学样例）.docx",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="tmp/c_render")
    args = ap.parse_args()
    out = (ROOT / args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    word = win32.gencache.EnsureDispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    result = {}
    try:
        for label, path in PAIRS.items():
            doc = word.Documents.Open(str(path), False, True)  # ConfirmConversions, ReadOnly
            try:
                doc.Repaginate()
                pages = doc.ComputeStatistics(WD_STAT_PAGES)
                words = doc.ComputeStatistics(WD_STAT_WORDS)
                pdf = out / f"{label}.pdf"
                doc.ExportAsFixedFormat(str(pdf), WD_EXPORT_PDF)
                result[label] = {
                    "file": str(path.relative_to(ROOT)),
                    "pages": pages,
                    "words": words,
                    "pdf": str(pdf.relative_to(ROOT)),
                }
            finally:
                doc.Close(False)
    finally:
        word.Quit()
    (out / "render.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
