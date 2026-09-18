"""C 独立渲染证据分析（G3-06）：把 Word 导出的 PDF 转成可核对的结构化证据。

针对 ISSUE-G3-06-001 的原始缺陷（长表窄列的中文逐字竖排碎片），给出可量化的检查：
1. 页数、行数；
2. 单字行（仅 1 个中文字符的文本行）数量；
3. “竖向碎片”签名：同一 x 位置连续出现 ≥3 个单字行；
4. 图 2-1 与题注是否同页相邻；
5. 表 2-1 / 表 7-1 的渲染页范围。

以 Reference 教学样例作为同口径基线，避免只看绝对值。

用法：python scripts/render_evidence_g3_06_c.py --dir tmp/c_render --out logs/reviews/2026-09-18_G3-06-C-render-evidence.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]


def analyse(pdf: Path) -> dict:
    doc = pymupdf.open(pdf)
    single_lines, total_lines = [], 0
    per_page = {}
    for pno, page in enumerate(doc, 1):
        page_singles = []
        for block in page.get_text("dict")["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                text = "".join(s["text"] for s in line["spans"]).strip()
                if not text:
                    continue
                total_lines += 1
                cjk = [c for c in text if "一" <= c <= "鿿"]
                if len(cjk) == 1 and len(text) <= 2:
                    x0 = round(min(s["bbox"][0] for s in line["spans"]), 1)
                    y0 = round(min(s["bbox"][1] for s in line["spans"]), 1)
                    page_singles.append({"page": pno, "text": text, "x": x0, "y": y0})
        single_lines.extend(page_singles)
        per_page[pno] = len(page_singles)

    # 竖向碎片：同一 x（±0.6pt）上纵向相邻（行距 ≤24pt）连续 ≥3 个单字行
    stacks = []
    for pno in {s["page"] for s in single_lines}:
        rows = sorted([s for s in single_lines if s["page"] == pno], key=lambda s: s["y"])
        run = []
        for s in rows:
            if run and abs(s["x"] - run[-1]["x"]) <= 0.6 and s["y"] - run[-1]["y"] <= 24:
                run.append(s)
            else:
                if len(run) >= 3:
                    stacks.append({"page": run[0]["page"], "x": run[0]["x"], "chars": "".join(r["text"] for r in run)})
                run = [s]
        if len(run) >= 3:
            stacks.append({"page": run[0]["page"], "x": run[0]["x"], "chars": "".join(r["text"] for r in run)})

    text_pages = [page.get_text() for page in doc]
    full = "\n".join(text_pages)

    def page_of(pattern: str, pages=text_pages):
        for i, t in enumerate(pages, 1):
            if re.search(pattern, t):
                return i
        return None

    figure_pages = [i for i, page in enumerate(doc, 1) if page.get_images()]

    return {
        "file": str(pdf.relative_to(ROOT)),
        "pages": doc.page_count,
        "text_lines": total_lines,
        "single_char_lines": len(single_lines),
        "single_char_ratio": round(len(single_lines) / max(total_lines, 1), 4),
        "single_char_per_page": per_page,
        "vertical_stacks": stacks,
        "figure_pages": figure_pages,
        "figure_caption_page": page_of(r"图\s*2-1\s*REST"),
        "table_2_1_caption_page": page_of(r"表\s*2-1"),
        "table_7_1_caption_page": page_of(r"表\s*7-1"),
        "api_001_page": page_of(r"API-001"),
        "api_057_page": page_of(r"API-057"),
        "api_tr_001_page": page_of(r"API-TR-001"),
        "api_tr_039_page": page_of(r"API-TR-039"),
        "has_undefined_bookmark": bool(re.search(r"未定义书签|Error! Bookmark", full)),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="tmp/c_render")
    ap.add_argument("--out", default="logs/reviews/2026-09-18_G3-06-C-render-evidence.json")
    args = ap.parse_args()
    base = (ROOT / args.dir).resolve()
    out = ROOT / args.out
    result = {
        "renderer": "Microsoft Word COM（本机 Word 16，只读打开后 Repaginate + ExportAsFixedFormat）",
        "notes": [
            "api_001_page / api_057_page 为 null：编号列（1.25 cm）容不下 `API-001`（约 1.36 cm @11pt），"
            "Word 在连字符处断为 `API-` 与 `001` 两行，故正则整体匹配不到；`API-TR-001` 等较宽列可正常匹配。",
            "vertical_stacks 为“同一 x（±0.6pt）且纵向相邻（行距≤24pt）连续 ≥3 个单字行”的签名，"
            "用于识别原 Issue 描述的逐字竖排碎片；孤立的单字行（如中文词组末字换行）不计入。",
            "PDF 为临时渲染缓存，脚本可重放；复核完成后已删除。",
        ],
        "deliverable": analyse(base / "deliverable.pdf"),
        "reference": analyse(base / "reference.pdf"),
    }
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
