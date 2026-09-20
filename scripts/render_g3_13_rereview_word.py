from __future__ import annotations
import json
from pathlib import Path
import win32com.client as win32

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".tmp/G3-13-rereview-render"
PAIRS = {
    "current": ROOT / "docs/deliverables/22-配置管理计划.docx",
    "reference": ROOT / "docs/reference/24-配置管理计划（教学样例）.docx",
}
OUT.mkdir(parents=True, exist_ok=True)
word = win32.gencache.EnsureDispatch("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
result = {}
try:
    for label, path in PAIRS.items():
        doc = word.Documents.Open(str(path), False, True)
        try:
            doc.Repaginate()
            pdf = OUT / f"{label}.pdf"
            doc.ExportAsFixedFormat(str(pdf), 17)
            result[label] = {"pages": doc.ComputeStatistics(2), "words": doc.ComputeStatistics(0), "pdf": str(pdf)}
        finally:
            doc.Close(False)
finally:
    word.Quit()
(OUT / "render.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
