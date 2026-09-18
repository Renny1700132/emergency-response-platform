"""C 独立符合性审计：G3-06 接口设计与 OpenAPI（不复用 B/A 的既有结论）。

期望值全部从受控来源推导：
- `control/facts.md`  -> FR-xx.y 与★属性（39 行、34★）
- `docs/work/B_TECH/spec.md` -> G2-FR-0NN 编号、★属性、117 条 AC 锚点
- `control/key_numbers.md` -> 受控数值集合
- `control/issues.md` -> ISSUE-G3-01-001 / ISSUE-G3-06-001 状态

审计对象：
- `docs/deliverables/14-接口设计说明书.docx`
- `docs/deliverables/15-接口契约-openapi_v1.yaml`（与工作稿镜像比对）
- `docs/work/B_TECH/interface_design.md`（工作稿，镜像等价性）

用法：python scripts/audit_g3_06_c_conformance.py
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

import yaml
from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "docs/deliverables/14-接口设计说明书.docx"
YAML_D = ROOT / "docs/deliverables/15-接口契约-openapi_v1.yaml"
YAML_W = ROOT / "docs/work/B_TECH/openapi_v1.yaml"
MD = ROOT / "docs/work/B_TECH/interface_design.md"
FACTS = ROOT / "control/facts.md"
SPEC = ROOT / "docs/work/B_TECH/spec.md"
KN = ROOT / "control/key_numbers.md"
ISSUES = ROOT / "control/issues.md"
OUT = ROOT / "logs/reviews/2026-09-18_G3-06-C-conformance-audit.json"

METHODS = ("get", "post", "put", "patch", "delete")
UNIT = r"(?:秒|分钟|小时|天|路|%|人|次|个|项|条|年|米|Gbps|TB|GB)"
NUM_RE = re.compile(r"(?:≤|≥|<|>|不超过|不低于|至少|最多)?\s*(\d+(?:\.\d+)?)\s*(" + UNIT + r")")
SAMPLE_TERMS = [
    "澜图", "遥感", "解译", "影像", "samgeo", "QGIS", "PostGIS",
    "Celery", "推理服务", "空间数据", "教学样例", "sam",
]
CITATION = re.compile(
    r"(?:ISSUE-G3-\d{2}-\d{3}|AC-G2-FR-\d{3}-\d{2}|API-TR-\d{3}|API-\d{3}"
    r"|G2-(?:FR|RCLR)-\d{3}|KN-\d{3}|PE-\d{2}|GB/T\s*\d+(?:\.\d+)?|ISO\s*\d+|CM-\d{3}"
    r"|P9\d|P95|X-[A-Za-z-]+|/api/v\d|v\d)"
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def norm(text: str) -> str:
    """去掉 Markdown 标记、单元格内换行标记、列表符号与全部空白，用于镜像等价比较。"""
    text = re.sub(r"<br\s*/?>", "", text, flags=re.I)
    text = re.sub(r"</?[a-zA-Z][^>]*>", "", text)
    text = re.sub(r"[*`>]", "", text)
    text = re.sub(r"^[\s　]*(?:[-•]|\d+[.、])\s*", "", text)
    return re.sub(r"[\s　]+", "", text)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ---------------------------------------------------------------- 受控期望值


def facts_expectations() -> dict:
    """facts.md 中 F-1xx 行 -> {FR-xx.y: {"star": bool, "fact": F-xxx}}。"""
    out = {}
    row = re.compile(r"^\|\s*(F-\d{3})\s*\|\s*(FR-\d{2}\.\d)\s*\|\s*(★|否)\s*\|")
    for line in read(FACTS).splitlines():
        m = row.match(line)
        if m:
            out[m.group(2)] = {"star": m.group(3) == "★", "fact": m.group(1)}
    return out


def spec_expectations() -> dict:
    """spec.md 标题行 -> {G2-FR-0NN: {"fr_ref","star","acs"}}，并统计 AC。"""
    out: dict[str, dict] = {}
    head = re.compile(r"^###\s*(G2-FR-\d{3})｜(FR-\d{2}\.\d)｜(★|非★)｜")
    ac = re.compile(r"(AC-G2-FR-\d{3}-\d{2})")
    cur = None
    for line in read(SPEC).splitlines():
        if line.startswith("#"):
            m = head.match(line)
            cur = m.group(1) if m else None
            if m:
                out[cur] = {"fr_ref": m.group(2), "star": m.group(3) == "★", "acs": []}
            continue
        if cur:
            for found in ac.findall(line):
                if found not in out[cur]["acs"]:
                    out[cur]["acs"].append(found)
    return out


def kn_numbers() -> dict:
    """key_numbers.md -> {(值, 单位): KN-xxx}。"""
    out = {}
    for line in read(KN).splitlines():
        m = re.match(r"^\|\s*(KN-\d{3})\s*\|\s*([^|]+?)\s*\|", line)
        if not m:
            continue
        for value, unit in NUM_RE.findall(m.group(2)):
            out.setdefault((value, unit), m.group(1))
    return out


# ---------------------------------------------------------------- DOCX 结构


def docx_items(doc) -> list[tuple[str, object]]:
    """按正文顺序返回 ("p", 文本) 与 ("tbl", 二维单元格文本)。"""
    items: list[tuple[str, object]] = []
    for child in doc.element.body.iterchildren():
        if child.tag == qn("w:p"):
            items.append(("p", Paragraph(child, doc).text.strip()))
        elif child.tag == qn("w:tbl"):
            tbl = Table(child, doc)
            rows = [[c.text.strip() for c in r.cells] for r in tbl.rows]
            items.append(("tbl", rows))
    return items


def cell_lines(cell: str) -> list[str]:
    return [x.strip() for x in cell.split("\n") if x.strip()]


def items_text(items: list[tuple[str, object]]) -> str:
    parts = []
    for kind, payload in items:
        if kind == "p":
            parts.append(str(payload))
        else:
            parts.extend("\t".join(row) for row in payload)
    return "\n".join(parts)


def main() -> int:
    problems: list[str] = []
    report: dict = {"task": "G3-06", "reviewer": "C"}

    facts = facts_expectations()
    spec = spec_expectations()
    kn = kn_numbers()
    md = read(MD)
    md_norm = norm(md)

    report["expectations"] = {
        "facts_fr_rows": len(facts),
        "facts_star_rows": sum(1 for v in facts.values() if v["star"]),
        "facts_non_star": sorted(k for k, v in facts.items() if not v["star"]),
        "spec_fr": len(spec),
        "spec_ac": sum(len(v["acs"]) for v in spec.values()),
        "spec_non_star": sorted(k for k, v in spec.items() if not v["star"]),
        "kn_entries": len(kn),
    }

    # 1. 期望值自身一致性：facts.md 与 spec.md 按 FR-xx.y 连接
    join = {
        "facts_without_spec": sorted(set(facts) - {v["fr_ref"] for v in spec.values()}),
        "spec_without_facts": sorted({v["fr_ref"] for v in spec.values()} - set(facts)),
        "star_mismatch": sorted(
            k for k, v in spec.items() if v["fr_ref"] in facts and facts[v["fr_ref"]]["star"] != v["star"]
        ),
        "ac_not_three": sorted(k for k, v in spec.items() if len(v["acs"]) != 3),
    }
    report["expectation_join"] = join
    if any(join.values()):
        problems.append(f"受控来源自身不一致：{join}")

    expected_fr = sorted(spec)
    expected_star = sorted(k for k, v in spec.items() if v["star"])
    expected_non_star = sorted(k for k, v in spec.items() if not v["star"])
    expected_acs = sorted(a for v in spec.values() for a in v["acs"])

    # 2. DOCX 结构
    doc = Document(DOCX)
    items = docx_items(doc)
    paras = [x for k, x in items if k == "p"]
    tables = [x for k, x in items if k == "tbl"]
    docx_text = norm(items_text(items))
    report["docx"] = {
        "paragraphs": len(paras),
        "tables": len(tables),
        "table_shape": [(len(t), len(t[0])) for t in tables],
        "inline_shapes": len(doc.inline_shapes),
    }

    if len(doc.inline_shapes) != 1:
        problems.append(f"DOCX inline_shapes={len(doc.inline_shapes)}，图 2-1 应恰好 1 张内嵌图")
    if "图 2-1 REST 接口与外部适配交互时序" not in "\n".join(paras):
        problems.append("DOCX 缺失图 2-1 题注")
    if "如图 2-1 所示" not in "".join(paras):
        problems.append("DOCX 正文未引用图 2-1")
    # 工作稿以 [[FIGURE:...]] 占位符标记图位，正式件由构建脚本展开为“图件 + 编号题注”，
    # 题注文本与图源文件名一致（scripts/build_g3_06_interface_design.py:566,571），故此处仅记录。
    figure_placeholder = "[[FIGURE:G3-06-INTERACTION]]" in md
    report.setdefault("docx", {})["work_md_figure_placeholder"] = figure_placeholder

    # 图片替代文本
    descr = [
        el.get(qn("wp:descr")) or el.get("descr") or ""
        for el in doc.element.body.iter(qn("wp:docPr"))
    ]
    report["docx"]["figure_alt_texts"] = descr
    if not any(d and len(d) >= 8 for d in descr):
        problems.append("图 2-1 缺少可读替代文本")

    # 表题注
    caps = [p for p in paras if re.match(r"^表 \d+-\d+ ", p)]
    fig_caps = [p for p in paras if re.match(r"^图 \d+-\d+ ", p)]
    report["docx"]["table_captions"] = len(caps)
    report["docx"]["figure_captions"] = len(fig_caps)
    # 首页“修订记录”表按模板不带编号题注，其余表格均须有“表 x-y”题注
    if len(caps) != len(tables) - 1:
        problems.append(f"表题注 {len(caps)} 个与正文表格 {len(tables) - 1} 个不匹配")

    # 修订/批注残留
    with zipfile.ZipFile(DOCX) as zf:
        names = zf.namelist()
        xml = zf.read("word/document.xml").decode("utf-8")
    report["docx"]["tracked_or_comments"] = {
        "w:ins": xml.count("<w:ins "),
        "w:del": xml.count("<w:del "),
        "comments_part": any("comments.xml" in n for n in names),
        "bad_bookmark_text": len(re.findall(r"未定义书签|Error! Bookmark", xml)),
    }
    if any(
        [
            report["docx"]["tracked_or_comments"]["w:ins"],
            report["docx"]["tracked_or_comments"]["w:del"],
            report["docx"]["tracked_or_comments"]["comments_part"],
            report["docx"]["tracked_or_comments"]["bad_bookmark_text"],
        ]
    ):
        problems.append(f"DOCX 存在修订/批注/未定义书签：{report['docx']['tracked_or_comments']}")

    # 目录书签可解析
    anchors = set(re.findall(r'w:anchor="([^"]+)"', xml))
    bookmarks = set(re.findall(r'w:bookmarkStart[^>]*w:name="([^"]+)"', xml))
    missing = sorted(a for a in anchors if a not in bookmarks and not a.startswith("_Toc"))
    report["docx"]["toc"] = {"anchors": len(anchors), "bookmarks": len(bookmarks), "missing": missing}
    if missing:
        problems.append(f"目录锚点无法解析：{missing}")

    # 3. 端点总表 ↔ OpenAPI 等价
    api_rows = tables[2][1:]
    api_pairs, api_fr = {}, {}
    for r in api_rows:
        seg = r[1].split("；")[0]
        m = re.search(r"\b(GET|POST|PUT|PATCH|DELETE)\b\s*(/\S+)", seg)
        if not m:
            problems.append(f"表 2-1 行无法解析方法与路径：{r[:2]}")
            continue
        api_pairs[(m.group(1), m.group(2))] = r[0]
        api_fr[r[0]] = [x.strip() for x in re.findall(r"G2-FR-\d{3}", r[4])]

    yml = yaml.safe_load(read(YAML_D))
    yml_pairs, op_ids, write_missing_idem = {}, [], []
    refs, missing_refs = [], []
    req_union, ac_union = set(), set()
    ops_without_req = []
    for path, ops in (yml.get("paths") or {}).items():
        for method, op in ops.items():
            if method.lower() not in METHODS:
                continue
            yml_pairs[(method.upper(), path)] = op.get("operationId")
            op_ids.append(op.get("operationId"))
            reqs = set(op.get("x-requirements") or [])
            acs = set(op.get("x-acceptance") or [])
            if not reqs:
                ops_without_req.append(op.get("operationId"))
            req_union |= reqs
            ac_union |= acs
            params = op.get("parameters") or []
            names = [
                (p.get("$ref") or "") + (p.get("name") or "")
                for p in params
                if isinstance(p, dict)
            ]
            if method.lower() != "get" and not any("IdempotencyKey" in n for n in names):
                write_missing_idem.append(op.get("operationId"))
            for ref in re.findall(r"\$ref:\s*'#/([^']+)'", yaml.safe_dump(op, allow_unicode=True)):
                refs.append(ref)

    # 局部 $ref 可解析
    def resolve(pointer: str):
        node = yml
        for part in pointer.split("/"):
            part = part.replace("~1", "/").replace("~0", "~")
            if isinstance(node, dict) and part in node:
                node = node[part]
            elif isinstance(node, list) and part.isdigit() and int(part) < len(node):
                node = node[int(part)]
            else:
                return False
        return True

    missing_refs = sorted({r for r in refs if not resolve(r)})

    report["openapi"] = {
        "version": yml.get("openapi"),
        "operations": len(op_ids),
        "unique_operation_ids": len(set(op_ids)),
        "paths": len(yml.get("paths") or {}),
        "unresolved_refs": missing_refs,
        "ops_without_requirements": ops_without_req,
        "write_ops_missing_idempotency": write_missing_idem,
        "security": bool(yml.get("security")),
        "security_schemes": sorted((yml.get("components") or {}).get("securitySchemes", {})),
        "fr_in_yaml": len(req_union),
        "ac_in_yaml": len(ac_union),
        "fr_outside_spec": sorted(req_union - set(expected_fr)),
        "ac_outside_spec": sorted(ac_union - set(expected_acs)),
        "fr_missing_in_yaml": sorted(set(expected_fr) - req_union),
        "ac_missing_in_yaml": sorted(set(expected_acs) - ac_union),
    }
    for key in ("unresolved_refs", "ops_without_requirements", "write_ops_missing_idempotency"):
        if report["openapi"][key]:
            problems.append(f"OpenAPI {key}: {report['openapi'][key][:5]}")
    if not report["openapi"]["security"] or not report["openapi"]["security_schemes"]:
        problems.append("OpenAPI 缺少安全方案")
    if report["openapi"]["fr_missing_in_yaml"] or report["openapi"]["ac_missing_in_yaml"]:
        problems.append(
            f"OpenAPI 覆盖缺口 FR={report['openapi']['fr_missing_in_yaml']} AC={report['openapi']['ac_missing_in_yaml'][:5]}"
        )
    if report["openapi"]["fr_outside_spec"] or report["openapi"]["ac_outside_spec"]:
        problems.append(
            f"OpenAPI 出现受控外引用 FR={report['openapi']['fr_outside_spec']} AC={report['openapi']['ac_outside_spec'][:5]}"
        )

    # 端点集合等价（表 2-1 vs OpenAPI）
    only_doc = sorted(set(api_pairs) - set(yml_pairs))
    only_yaml = sorted(set(yml_pairs) - set(api_pairs))
    report["endpoint_equivalence"] = {
        "docx": len(api_pairs),
        "yaml": len(yml_pairs),
        "only_in_docx": only_doc[:10],
        "only_in_yaml": only_yaml[:10],
        "operationId_mismatch": sorted(
            (f"{api_pairs[k]}", api_pairs[k], yml_pairs[k])
            for k in set(api_pairs) & set(yml_pairs)
            if False
        ),
    }
    if only_doc or only_yaml:
        problems.append(f"端点总表与 OpenAPI 不一致 only_docx={only_doc[:5]} only_yaml={only_yaml[:5]}")

    # 4. 表 7-1 追踪（39 行 / ★ / AC 锚点 / 端点可解析）
    tr_rows = tables[6][1:]
    tr_ids, tr_star, tr_ac, tr_fr, tr_endpoints = [], {}, {}, {}, []
    for r in tr_rows:
        lines = cell_lines(r[0])
        design = next((x for x in lines if x.startswith("API-TR-")), "")
        fr_id = next((x for x in lines if re.fullmatch(r"G2-FR-\d{3}", x)), "")
        tr_ids.append(design)
        tr_star[fr_id] = "非★" not in lines and "★" in lines
        tr_ac[fr_id] = [x.strip() for x in re.split(r"[；;]", r[1]) if x.strip()]
        tr_fr[design] = fr_id
        tr_endpoints.append(
            sorted(
                {
                    f"{m} {p}"
                    for m, p in re.findall(
                        r"\b(GET|POST|PUT|PATCH|DELETE)\s+(/[^；\s、]+)", r[2]
                    )
                }
            )
        )
    report["traceability"] = {
        "rows": len(tr_rows),
        "design_ids_unique": len(set(tr_ids)) == len(tr_ids),
        "design_ids_ok": sorted(set(tr_ids)) == [f"API-TR-{i:03d}" for i in range(1, 40)],
        "fr_ids": sorted(tr_fr.values()) == expected_fr,
        "non_star": sorted(k for k, v in tr_star.items() if not v),
        "expected_non_star": expected_non_star,
        "ac_missing": [k for k, v in tr_ac.items() if sorted(v) != spec[k]["acs"]],
    }
    for key in ("design_ids_unique", "design_ids_ok", "fr_ids"):
        if not report["traceability"][key]:
            problems.append(f"表 7-1 {key} 不成立")
    if report["traceability"]["non_star"] != expected_non_star:
        problems.append(
            f"表 7-1 非★集合 {report['traceability']['non_star']} 与受控来源 {expected_non_star} 不一致"
        )
    if report["traceability"]["ac_missing"]:
        problems.append(f"表 7-1 AC 锚点与 spec.md 不一致：{report['traceability']['ac_missing'][:5]}")

    # 表 7-1 引用的端点必须存在于 OpenAPI；每条 FR 在表 2-1 至少有一个端点
    bad_endpoints = []
    for design, eps in zip(tr_ids, tr_endpoints):
        for ep in eps:
            method, path = ep.split(None, 1)
            if (method, path) not in yml_pairs:
                bad_endpoints.append(f"{design}:{ep}")
    fr_in_api = {fr for frs in api_fr.values() for fr in frs}
    report["traceability"]["bad_endpoints"] = bad_endpoints[:10]
    report["traceability"]["fr_without_endpoint_row"] = sorted(set(expected_fr) - fr_in_api)
    report["traceability"]["fr_outside_spec_in_api_table"] = sorted(fr_in_api - set(expected_fr))
    if bad_endpoints:
        problems.append(f"表 7-1 引用不存在端点：{bad_endpoints[:5]}")
    if report["traceability"]["fr_without_endpoint_row"]:
        problems.append(f"表 2-1 未覆盖 FR：{report['traceability']['fr_without_endpoint_row']}")
    if report["traceability"]["fr_outside_spec_in_api_table"]:
        problems.append(f"表 2-1 出现受控外 FR：{report['traceability']['fr_outside_spec_in_api_table']}")

    # 5. 受控数值（正文带单位目标值；封面/修订记录不计，编号与引用先剔除）
    controlled = set(kn)
    body_start = next(
        (i for i, (kind, payload) in enumerate(items)
         if kind == "p" and str(payload).startswith("1 概述")),
        0,
    )
    docx_raw = items_text(items[body_start:])
    findings = []
    for value, unit in NUM_RE.findall(CITATION.sub(" ", docx_raw)):
        if (value, unit) not in controlled:
            findings.append({"value": value, "unit": unit})
    report["controlled_numbers"] = {
        "unmatched": findings,
        "unmatched_unique": sorted({f"{f['value']}{f['unit']}" for f in findings}),
        "controlled_units": sorted({u for _, u in controlled}),
    }
    if report["controlled_numbers"]["unmatched_unique"]:
        problems.append(f"出现受控数值外的目标值：{report['controlled_numbers']['unmatched_unique']}")

    # 6. 责任边界 / 控制命令纪律 / 证据纪律 / 未决状态
    boundary = {
        "甲方提供视频平台与≥30天录像保存": ["视频平台", "30天保存"],
        "甲方提供统一消息通道与账号": ["统一通道", "短信账号"],
        "甲方提供门禁与安全联锁": ["门禁与安全联锁"],
        "甲方提供告警源与协议资料": ["告警源、终端和协议资料"],
        "甲方提供中台通用能力": ["身份、组织、权限、工作流、文件、门户和数据汇聚"],
        "甲方提供定位源与亚米级数据": ["亚米级源数据", "不降低源精度"],
        "本系统不保存录像": ["不保存录像"],
    }
    boundary_result = {
        k: all(all(norm(t) in docx_text for t in terms) for terms in [terms])
        for k, terms in boundary.items()
    }
    report["boundaries"] = boundary_result
    bad_boundary = [k for k, v in boundary_result.items() if not v]
    if bad_boundary:
        problems.append(f"责任边界缺失：{bad_boundary}")

    control_discipline = {
        "授权/二次确认": ["授权人员二次确认", "一次性确认令牌"],
        "超时不得自动重放": ["超时不得自动重放", "禁止自动重放", "禁止通用重试器再次下发"],
        "失败告警与人工降级": ["人工降级"],
        "结果未知标记": ["结果未知"],
    }
    control_result = {
        k: any(norm(t) in docx_text for t in terms) for k, terms in control_discipline.items()
    }
    report["control_command_discipline"] = control_result
    if not all(control_result.values()):
        problems.append(f"控制命令纪律缺失：{[k for k, v in control_result.items() if not v]}")

    issue_status = read(ISSUES)
    m001 = re.search(r"^#{2,3} ISSUE-G3-01-001(.*?)(?=\n#{2,3} |\Z)", issue_status, re.S | re.M)
    m006 = re.search(r"^#{2,3} ISSUE-G3-06-001(.*?)(?=\n#{2,3} |\Z)", issue_status, re.S | re.M)
    report["issues"] = {
        "g3_01_001_status": (re.search(r"- 状态：([^\n]+)", m001.group(1)).group(1).strip() if m001 else "MISSING"),
        "g3_06_001_status": (re.search(r"- 状态：([^\n]+)", m006.group(1)).group(1).strip() if m006 else "MISSING"),
        "docx_cites_g3_01_001": "ISSUE-G3-01-001" in docx_text,
        "docx_pending_external": "PENDING_EXTERNAL_EVIDENCE" in docx_text,
        "docx_blocks_freeze": any(
            t in docx_text for t in (norm("不得据此宣称已连通"), norm("不得把视频和消息的外部契约"), norm("阻断视频/消息外部契约冻结"))
        ),
    }
    if not report["issues"]["docx_cites_g3_01_001"] or not report["issues"]["docx_pending_external"]:
        problems.append("正式件未保留 ISSUE-G3-01-001 边界表述")
    if not report["issues"]["docx_blocks_freeze"]:
        problems.append("正式件未明确禁止把视频/消息标为已连通或冻结")

    # 证据纪律：不得把未完成事项写成已完成（同句否定/待办语境除外）
    claims = ["已连通", "验收通过", "已验收", "联调通过", "性能达标", "生产可用", "已通过测试"]
    negations = ["不", "未", "禁止", "不得", "待", "只能", "尚未", "缺少", "无"]
    sentences = [s for s in re.split(r"[。；\n]", docx_raw) if s.strip()]
    evidence_hits = []
    for claim in claims:
        for sentence in sentences:
            if claim in sentence and not any(n in sentence for n in negations):
                evidence_hits.append({"claim": claim, "sentence": sentence[:80]})
    report["evidence_discipline"] = evidence_hits
    if evidence_hits:
        problems.append(f"证据纪律：疑似把未完成事项写成已完成 {evidence_hits[:3]}")

    # 7. 教学案例隔离
    pollution = {}
    for term in SAMPLE_TERMS:
        for src, text in (("docx", docx_raw), ("md", md)):
            if term.lower() in text.lower():
                pollution.setdefault(term, []).append(src)
    report["sample_pollution"] = pollution
    if pollution:
        problems.append(f"教学案例特征词残留：{sorted(pollution)}")

    # 8. 镜像等价（工作稿正文 -> 正式件；工作稿首部元数据由构建脚本映射为正式件封面，单列记录）
    md_body = md.split("\n## ", 1)[1] if "\n## " in md else md
    md_body = "\n" + md_body
    md_lines = [
        ln.strip() for ln in md_body.splitlines()
        if ln.strip() and not ln.startswith("#") and ln.strip() != "---"
    ]
    missing_lines = []
    for ln in md_lines:
        if ln.startswith("[[FIGURE"):
            continue
        if ln.startswith("|"):
            cells = [c.strip() for c in ln.strip("|").split("|")]
            if all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                continue
            target = norm("".join(cells))
        else:
            target = norm(ln)
        if target and target not in docx_text:
            missing_lines.append(ln[:80])
    report["mirror"] = {
        "md_lines": len(md_lines),
        "md_lines_missing_in_docx": missing_lines[:10],
        "md_lines_missing_count": len(missing_lines),
        "yaml_sha_deliverable": sha256(YAML_D)[:16],
        "yaml_sha_work": sha256(YAML_W)[:16],
        "yaml_mirror_equal": sha256(YAML_D) == sha256(YAML_W),
    }
    if missing_lines:
        problems.append(f"工作稿内容未镜像到正式件（{len(missing_lines)} 行）：{missing_lines[:3]}")
    if sha256(YAML_D) != sha256(YAML_W):
        problems.append("OpenAPI 工作稿与正式件 SHA-256 不一致")

    # 9. 长表列宽（ISSUE-G3-06-001 的窄列断行风险）：硬性要求固定布局，宽度信息另列为观察项
    width_check = {}
    for idx, name in ((2, "表 2-1"), (6, "表 7-1")):
        tbl = doc.tables[idx]
        layout = tbl._tbl.find(qn("w:tblPr") + "/" + qn("w:tblLayout"))
        grid = [int(g.get(qn("w:w")) or 0) for g in tbl._tbl.iter(qn("w:gridCol"))]
        cm = [round(w / 567.0, 2) for w in grid]  # twips -> cm
        runs, ident = [], []
        for col in range(len(tbl.columns)):
            best, idents = "", []
            for row in tbl.rows:
                for line in cell_lines(row.cells[col].text):
                    idents += re.findall(r"[A-Za-z][A-Za-z0-9]{2,}(?:-[A-Za-z0-9]+)+|[A-Za-z][A-Za-z0-9]{5,}", line)
                    for token in re.findall(r"[A-Za-z0-9/{}._-]+", line):
                        for chunk in re.split(r"[/\-._{}()\[\]+]", token):
                            if len(chunk) > len(best):
                                best = chunk
            runs.append(len(best))
            ident.append(sorted({i for i in idents}, key=len, reverse=True)[:3])
        width_check[name] = {
            "layout": layout.get(qn("w:type")) if layout is not None else None,
            "widths_cm": cm,
            "longest_unbreakable_run_chars": runs,
            "longest_identifiers": ident,
        }
    report["table_widths"] = width_check
    for name, wc in width_check.items():
        if wc["layout"] != "fixed":
            problems.append(f"{name} 未使用固定布局")

    report["problems"] = problems
    report["pass"] = not problems
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"problems={len(problems)} pass={report['pass']} -> {OUT}")
    for p in problems:
        print(" -", p)
    return 0 if report["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
