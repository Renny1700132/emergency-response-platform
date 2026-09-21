from __future__ import annotations
import json
from pathlib import Path
import win32com.client as win32

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/".tmp/G3-14-v02-render"
PAIRS={"current":ROOT/"docs/deliverables/23-风险管理计划与风险登记册v2.docx","reference":ROOT/"docs/reference/25-风险管理计划与风险登记册v2（教学样例）.docx"}
OUT.mkdir(parents=True,exist_ok=True)
word=win32.gencache.EnsureDispatch("Word.Application"); word.Visible=False; word.DisplayAlerts=0
result={}
try:
    for label,path in PAIRS.items():
        doc=word.Documents.Open(str(path),False,True)
        try:
            doc.Repaginate(); pdf=OUT/f"{label}.pdf"; doc.ExportAsFixedFormat(str(pdf),17)
            result[label]={"file":str(path.relative_to(ROOT)),"pages":doc.ComputeStatistics(2),"words":doc.ComputeStatistics(0),"pdf":str(pdf.relative_to(ROOT))}
        finally: doc.Close(False)
finally: word.Quit()
(OUT/"render.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
