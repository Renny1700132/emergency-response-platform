from pathlib import Path

from docx import Document
from docx.oxml.ns import qn


path = Path(__file__).resolve().parents[1] / "docs" / "deliverables" / "00-投标文件技术标.docx"
doc = Document(path)
for section in list(doc.sections)[1:]:
    element = section._sectPr.find(qn("w:pgNumType"))
    if element is not None:
        section._sectPr.remove(element)
doc.save(path)
print(path)
