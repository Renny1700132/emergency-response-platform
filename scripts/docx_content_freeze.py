"""Create and compare deterministic visible-text snapshots for DOCX files.

The snapshot keeps ordered body paragraphs, table cells, headers, footers and
caption paragraphs. Field instruction/result runs are omitted so automatic
TOC and page-number refreshes do not create false content changes.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}


def paragraph_text(p: etree._Element) -> str:
    parts: list[str] = []
    field_depth = 0
    for node in p.iter():
        if node.xpath("ancestor::w:pPr", namespaces=NS):
            continue
        if node.tag == f"{{{W}}}fldChar":
            kind = node.get(f"{{{W}}}fldCharType")
            if kind == "begin":
                field_depth += 1
            elif kind == "end" and field_depth:
                field_depth -= 1
            continue
        if field_depth:
            continue
        if node.tag == f"{{{W}}}t" and node.text:
            parts.append(node.text)
        elif node.tag == f"{{{W}}}tab":
            parts.append("\t")
        elif node.tag in {f"{{{W}}}br", f"{{{W}}}cr"}:
            parts.append("\n")
    return "".join(parts)


def style_id(p: etree._Element) -> str:
    found = p.find("./w:pPr/w:pStyle", NS)
    return "" if found is None else found.get(f"{{{W}}}val", "")


def part_records(data: bytes, part: str) -> list[dict[str, str]]:
    root = etree.fromstring(data)
    records: list[dict[str, str]] = []
    for index, p in enumerate(root.xpath(".//w:p", namespaces=NS), 1):
        # Nested paragraphs are intentionally included once in document order.
        ancestors = p.xpath("ancestor::w:tc", namespaces=NS)
        kind = "table_cell_paragraph" if ancestors else "paragraph"
        sid = style_id(p)
        text = paragraph_text(p)
        records.append({
            "part": part,
            "index": str(index),
            "kind": kind,
            "style": sid,
            "caption": "true" if sid.lower() in {"caption", "caption1", "题注"} else "false",
            "text": text,
        })
    return records


def snapshot(path: Path) -> dict:
    records: list[dict[str, str]] = []
    with zipfile.ZipFile(path) as package:
        names = package.namelist()
        ordered = ["word/document.xml"]
        ordered += sorted(n for n in names if n.startswith("word/header") and n.endswith(".xml"))
        ordered += sorted(n for n in names if n.startswith("word/footer") and n.endswith(".xml"))
        for name in ordered:
            if name in names:
                records.extend(part_records(package.read(name), name))
    body_records = [record["text"] for record in records if record["part"] == "word/document.xml"]
    header_parts: dict[str, list[str]] = {}
    footer_parts: dict[str, list[str]] = {}
    for record in records:
        if record["part"].startswith("word/header"):
            header_parts.setdefault(record["part"], []).append(record["text"])
        elif record["part"].startswith("word/footer"):
            footer_parts.setdefault(record["part"], []).append(record["text"])
    # Duplicate linked/unlinked parts with identical visible content are equivalent.
    # Merely opening an empty header/footer through python-docx can materialize an
    # empty OOXML part.  It has no visible content and must not fail the freeze.
    headers = sorted({json.dumps(value, ensure_ascii=False) for value in header_parts.values() if any(value)})
    footers = sorted({json.dumps(value, ensure_ascii=False) for value in footer_parts.values() if any(value)})
    content_records = {"body": body_records, "headers": headers, "footers": footers}
    canonical = json.dumps(content_records, ensure_ascii=False, separators=(",", ":"))
    return {
        "path": str(path).replace("\\", "/"),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest().upper(),
        "text_sha256": hashlib.sha256(canonical.encode("utf-8")).hexdigest().upper(),
        "record_count": len(records),
        "records": records,
        "content_records": content_records,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--compare", type=Path)
    args = parser.parse_args()
    current = snapshot(args.docx)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.compare:
        before = json.loads(args.compare.read_text(encoding="utf-8"))
        if before.get("content_records") and isinstance(before["content_records"], dict):
            before_content = before["content_records"]
        else:
            before_records = before["records"]
            body = [record["text"] for record in before_records if record["part"] == "word/document.xml"]
            hparts: dict[str, list[str]] = {}
            fparts: dict[str, list[str]] = {}
            for record in before_records:
                if record["part"].startswith("word/header"):
                    hparts.setdefault(record["part"], []).append(record["text"])
                elif record["part"].startswith("word/footer"):
                    fparts.setdefault(record["part"], []).append(record["text"])
            before_content = {
                "body": body,
                "headers": sorted({json.dumps(value, ensure_ascii=False) for value in hparts.values() if any(value)}),
                "footers": sorted({json.dumps(value, ensure_ascii=False) for value in fparts.values() if any(value)}),
            }
        same = before_content == current["content_records"]
        before_canonical = json.dumps(before_content, ensure_ascii=False, separators=(",", ":"))
        before_hash = hashlib.sha256(before_canonical.encode("utf-8")).hexdigest().upper()
        print(json.dumps({"same": same, "before": before_hash, "after": current["text_sha256"]}, ensure_ascii=False))
        raise SystemExit(0 if same else 1)
    print(json.dumps({k: current[k] for k in ("path", "sha256", "text_sha256", "record_count")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
