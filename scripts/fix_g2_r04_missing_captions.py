"""Add only missing required table-caption metadata for G2-R04.

The text labels are required by ISSUE-G2-R01-002.  They contain no new
business facts and inherit the paired reference caption's direct formatting.
"""
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
PAIRS = [
    ("docs/deliverables/09-AI反向澄清记录.docx", "docs/reference/09-AI反向澄清记录（教学样例）.docx", {1: "表 4-1　自检结果"}),
    ("docs/deliverables/10-需求追踪矩阵RTMv1.docx", "docs/reference/10-需求追踪矩阵RTM-v2（教学样例）.docx", {
        1: "表 2-1　MVP 正向追踪矩阵",
        2: "表 3-1　非 MVP 本期范围追踪矩阵",
        3: "表 4-1　覆盖统计与准出",
    }),
]


def table_caption_sample(doc):
    for p in doc.paragraphs:
        if p.text.strip().startswith("表"):
            return p
    raise RuntimeError("paired reference has no table caption")


for target_rel, ref_rel, inserts in PAIRS:
    target_path, ref_path = ROOT / target_rel, ROOT / ref_rel
    target, reference = Document(target_path), Document(ref_path)
    sample = table_caption_sample(reference)
    for index in sorted(inserts, reverse=True):
        table = target.tables[index]
        paragraph = Paragraph(deepcopy(sample._p), table._parent)
        paragraph.clear()
        paragraph.add_run(inserts[index])
        # The copied pPr/rPr remains the direct paired-reference format.
        table._tbl.addprevious(paragraph._p)
    target.save(target_path)
