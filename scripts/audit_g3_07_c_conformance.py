"""G3-07 C 符合性审计：独立校验 ADR/非功能正式件与受控来源的一致性。

用途：C 复核 G3-07 时，独立于 B 自检脚本 `audit_g3_07_adr_nfr.py`，按受控来源
（SRS 的 PE-01—12、`control/key_numbers.md`、`control/facts.md`、spec.md、`control/issues.md`）
逐项核对 ADR-001/002 与非功能设计正式件的数值、计数、责任边界和状态表述。

输入：--srs、--key-numbers、--facts、--spec、--issues、--nfr、--adr1、--adr2、
--database-design、--detailed-design、--interface-design、--out。
输出：`--out` 指定的 JSON 审计结果；同时打印到标准输出。
运行方式：`python scripts/audit_g3_07_c_conformance.py --help` 查看全部参数。
失败行为：任一客观检查不通过时以退出码 1 结束；`findings` 为需人工判断的复核观察项，不改变退出码。
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

# PE 与 NFR 行 → 受控 KN 的映射（来源：SRS §PE 表、key_numbers.md）
KN_MAP = {
    "PE-01": ["KN-003"], "PE-02": ["KN-011"], "PE-03": ["KN-012"],
    "PE-04": ["KN-006", "KN-007"], "PE-05": ["KN-008", "KN-009"],
    "PE-06": ["KN-010", "KN-060"], "PE-07": ["KN-034"], "PE-08": ["KN-035"],
    "PE-09": ["KN-036"], "PE-10": ["KN-016", "KN-017"], "PE-11": ["KN-028"],
    "PE-12": ["KN-037"],
    "NFR-CAP-01": ["KN-018", "KN-019", "KN-022"],
    "NFR-CAP-02": ["KN-020", "KN-021"],
    "NFR-CAP-03": ["KN-023", "KN-024", "KN-025"],
    "NFR-CAP-04": ["KN-026"],
    "NFR-REL-01": ["KN-004", "KN-040"], "NFR-REL-02": ["KN-041"],
    "NFR-REL-03": ["KN-075", "KN-029", "KN-030"],
    "NFR-SEC-01": ["KN-042", "KN-043"], "NFR-SEC-02": ["KN-044"],
    "NFR-COMP-01": ["KN-038"], "NFR-USE-01": ["KN-033", "KN-039"],
    "NFR-MNT-01": ["KN-045", "KN-031", "KN-032"], "NFR-MNT-02": ["KN-005", "KN-065"],
    "NFR-PORT-01": [],
}

# 纯数字无法覆盖的受控语义（来源同 key_numbers.md 的“数值/单位”“含义”）
KN_KEYWORDS = {
    "KN-009": ["亚米级"], "KN-038": ["稳定版本"], "KN-042": ["不低于", "二级"],
    "KN-043": ["高危"], "KN-065": ["一次"], "KN-075": ["日增量", "周全量"],
    "KN-005": ["小时"], "KN-040": ["可用率"], "KN-041": ["MTTR"],
}

# 教学案例特征词（docs/reference 教学样例项目）
SAMPLE_TERMS = ["澜图", "遥感", "解译", "影像", "samgeo", "QGIS", "PostGIS", "Celery",
                "SAM", "推理服务", "空间数据", "教学样例"]

# 责任边界关键事实 → 应出现在 NFR 正文的受控表述
BOUNDARY_REQUIRED = {
    "甲方负责最终定级/备案": ["定级", "备案"],
    "甲方提供定位源/不降低源精度": ["定位源", "源精度"],
    "既有视频系统负责录像保存": ["既有系统", "保存"],
    "甲方提供地图服务": ["地图服务"],
    "H5 宿主由甲方负责": ["宿主"],
    "消息按正常验收通道口径": ["验收通道"],
    "RPO 保持待人工确认": ["RPO", "待人工确认"],
}

NUM_TOKEN = re.compile(r"\d+(?:\.\d+)?\s*(?:%|％|秒/次|秒|分钟|小时|天|路|人|个|条|项|年|位|级|次)")
# 编号与分位值描述不是目标数值，比较前剔除
CITATION = re.compile(r"(?:ISSUE-G3-\d{2}-\d{3}|AC-G2-FR-\d{3}-\d{2}|G2-(?:FR|RCLR)-\d{3}|KN-\d{3}|PE-\d{2}|NFR-[A-Z]+-\d{2}|ENG-\d{3}|P\d{2,3}|V\d(?:\.\d+)?|GB/T\s*\d+(?:\.\d+)?)")
# 受控值以中文数字书写、正文以汉字呈现的 KN，仅做关键词核对
NUMBER_SKIP = {"KN-065"}


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def strip_citations(value: str) -> str:
    return CITATION.sub(" ", value)


def numbers(value: str) -> list[str]:
    return re.findall(r"\d+(?:\.\d+)?", strip_citations(value))


def tokens(value: str) -> set[str]:
    return {re.sub(r"\s+", "", t) for t in NUM_TOKEN.findall(value)}


def parse_rows(document: str, prefix: str) -> dict[str, str]:
    """按行首 ID 收集表格行原文。"""
    rows: dict[str, str] = {}
    for line in document.splitlines():
        m = re.match(rf"^\|\s*({re.escape(prefix)}[-\w]*)\s*\|", line)
        if m:
            rows[m.group(1)] = line
    return rows


def parse_kn(path: Path) -> dict[str, dict[str, str]]:
    kn: dict[str, dict[str, str]] = {}
    for line in text(path).splitlines():
        m = re.match(r"^\|\s*(KN-\d{3})\s*\|([^|]*)\|([^|]*)\|", line)
        if m:
            kn[m.group(1)] = {"value": m.group(2).strip(), "meaning": m.group(3).strip()}
    return kn


def check_controlled_values(rows: dict[str, str], kn: dict[str, dict[str, str]]) -> list[dict]:
    """逐行核对：受控 KN 的数值与关键词必须出现在对应 PE/NFR 行内。"""
    problems = []
    for row_id, kn_ids in KN_MAP.items():
        if row_id not in rows:
            problems.append({"row": row_id, "kn": None, "issue": "行缺失"})
            continue
        row = rows[row_id]
        for kn_id in kn_ids:
            entry = kn.get(kn_id)
            if entry is None:
                problems.append({"row": row_id, "kn": kn_id, "issue": "受控索引中不存在该 KN"})
                continue
            for value in ([] if kn_id in NUMBER_SKIP else numbers(entry["value"])):
                if value not in numbers(row):
                    problems.append({"row": row_id, "kn": kn_id, "issue": f"受控数值 {value} 未出现在该行"})
            for keyword in KN_KEYWORDS.get(kn_id, []):
                if keyword not in row:
                    problems.append({"row": row_id, "kn": kn_id, "issue": f"受控表述“{keyword}”未出现在该行"})
    return problems


def check_pe_extra(srs_rows: dict[str, str], nfr_rows: dict[str, str]) -> dict[str, list[str]]:
    """PE 行反向检查：正式件不得出现 SRS 中不存在的额外目标数值。"""
    extra = {}
    for pe in [f"PE-{i:02d}" for i in range(1, 13)]:
        if pe in srs_rows and pe in nfr_rows:
            diff = set(numbers(nfr_rows[pe])) - set(numbers(srs_rows[pe]))
            if diff:
                extra[pe] = sorted(diff)
    return extra


def check_counts(spec: str, facts: str, nfr: str) -> dict:
    fr = {m for m in re.findall(r"(?<!AC-)\bG2-FR-\d{3}", spec)}
    ac = {m for m in re.findall(r"AC-G2-FR-\d{3}-\d{2}", spec)}
    star = 0
    rows = 0
    for line in facts.splitlines():
        m = re.match(r"^\|\s*F-1\d{2}\s*\|", line)
        if m:
            rows += 1
            if "★" in line.split("|")[3]:
                star += 1
    claimed = re.search(r"(\d+)\s*FR、(\d+)\s*★、(\d+)\s*AC", nfr)
    return {
        "spec_fr": len(fr), "spec_ac": len(ac), "facts_fr_rows": rows, "facts_star_rows": star,
        "nfr_claim": claimed.groups() if claimed else None,
        "conform": len(fr) == 39 and len(ac) == 117 and star == 34 and rows == 39
        and claimed is not None and claimed.groups() == ("39", "34", "117"),
    }


def check_boundaries(nfr: str) -> dict[str, bool]:
    return {name: all(word in nfr for word in words) for name, words in BOUNDARY_REQUIRED.items()}


def check_status_consistency(issues: str, nfr: str, key_numbers: str) -> dict:
    def status(issue_id: str) -> str | None:
        block = re.search(rf"^#{{2,3}}\s+{issue_id}\b(.*?)(?=^#{{2,3}}\s|\Z)", issues, re.S | re.M)
        if not block:
            return None
        lines = [l for l in block.group(1).splitlines() if l.startswith("- 状态：")]
        return lines[-1].replace("- 状态：", "").strip() if lines else None

    kn_status = {}
    for line in key_numbers.splitlines():
        m = re.match(r"^\|\s*(KN-\d{3})\s*\|.*\|\s*([^|]*\|?)\s*$", line)
        if m:
            kn_status[m.group(1)] = line
    return {
        "issues_md_g3_01_001": status("ISSUE-G3-01-001"),
        "issues_md_g3_06_001": status("ISSUE-G3-06-001"),
        "nfr_cites_g3_01_001": "ISSUE-G3-01-001" in nfr,
        "nfr_cites_g3_06_001": "ISSUE-G3-06-001" in nfr,
        "nfr_g3_06_claim": [l.strip() for l in nfr.splitlines() if "ISSUE-G3-06-001" in l],
        "kn_006_007_not_verified": ("未验收" in kn_status.get("KN-006", "")) and ("未验收" in kn_status.get("KN-007", "")),
    }


def check_cross_refs(adr2: str, dld: str, dbd: str, iface: str) -> dict[str, bool]:
    return {
        "adr2_cites_em_outbox_event": "em_outbox_event" in adr2 and "em_outbox_event" in dbd,
        "adr2_cites_unit_of_work": "UnitOfWork" in adr2 and "UnitOfWork" in dld,
        "adr2_cites_dispatcher": "OutboxDispatcher" in adr2 and "OutboxDispatcher" in dld,
        "adr2_cites_event_envelope": "领域事件信封" in adr2 and "领域事件信封" in iface,
        "iface_envelope_ids": all(x in iface for x in ["eventId", "eventType", "schemaVersion", "traceId"]),
    }


def proposed_only(adr: str) -> bool:
    """ADR 状态行必须为 Proposed，且不得存在任何“状态：Accepted”表述。"""
    status_lines = [l.strip() for l in adr.splitlines() if l.strip().startswith("- 状态：")]
    return status_lines == ["- 状态：Proposed（待 A/C 复核与人工接受）"] and "状态：Accepted" not in adr


def check_sample_pollution(docs: dict[str, str]) -> dict[str, list[str]]:
    hits = {}
    for name, content in docs.items():
        found = [t for t in SAMPLE_TERMS if t.lower() in content.lower()]
        if found:
            hits[name] = found
    return hits


def main() -> None:
    ap = argparse.ArgumentParser()
    for flag in ["srs", "key-numbers", "facts", "spec", "issues", "nfr", "adr1", "adr2",
                 "database-design", "detailed-design", "interface-design", "out"]:
        ap.add_argument(f"--{flag}", required=True)
    args = ap.parse_args()

    srs = text(Path(args.srs)); nfr = text(Path(args.nfr))
    facts = text(Path(args.facts)); spec = text(Path(args.spec))
    issues = text(Path(args.issues)); key_numbers = text(Path(args.key_numbers))
    adr1 = text(Path(args.adr1)); adr2 = text(Path(args.adr2))
    dbd = text(Path(args.database_design)); dld = text(Path(args.detailed_design))
    iface = text(Path(args.interface_design))
    kn = parse_kn(Path(args.key_numbers))

    nfr_rows = parse_rows(nfr, "NFR-") | parse_rows(nfr, "PE-")
    srs_rows = parse_rows(srs, "PE-")

    result = {
        "task": "G3-07",
        "reviewer": "C",
        "controlled_value_problems": check_controlled_values(nfr_rows, kn),
        "pe_target_row_nfr": sorted(parse_rows(nfr, "PE-")),
        "pe_extra_numbers": check_pe_extra(srs_rows, parse_rows(nfr, "PE-")),
        "counts": check_counts(spec, facts, nfr),
        "boundaries": check_boundaries(nfr),
        "status": check_status_consistency(issues, nfr, key_numbers),
        "cross_refs": check_cross_refs(adr2, dld, dbd, iface),
        "sample_pollution": check_sample_pollution({"adr1": adr1, "adr2": adr2, "nfr": nfr}),
        "adr_status": {"adr1_proposed": proposed_only(adr1), "adr2_proposed": proposed_only(adr2)},
    }
    result["pass"] = all([
        not result["controlled_value_problems"],
        not result["pe_extra_numbers"],
        result["counts"]["conform"],
        all(result["boundaries"].values()),
        result["cross_refs"]["adr2_cites_em_outbox_event"],
        result["cross_refs"]["adr2_cites_unit_of_work"],
        result["cross_refs"]["adr2_cites_dispatcher"],
        result["cross_refs"]["adr2_cites_event_envelope"],
        result["cross_refs"]["iface_envelope_ids"],
        not result["sample_pollution"],
        result["adr_status"]["adr1_proposed"], result["adr_status"]["adr2_proposed"],
        result["status"]["nfr_cites_g3_01_001"], result["status"]["nfr_cites_g3_06_001"],
        result["status"]["kn_006_007_not_verified"],
    ])
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["pass"] else 1)


if __name__ == "__main__":
    main()
