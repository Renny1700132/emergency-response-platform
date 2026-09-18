from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


SAMPLE_TERMS = ["澜图", "遥感影像", "samgeo", "QGIS", "Celery", "PostGIS", "SAM"]
PE = {f"PE-{i:02d}" for i in range(1, 13)}
CAP = {f"NFR-CAP-{i:02d}" for i in range(1, 5)}
REL = {f"NFR-REL-{i:02d}" for i in range(1, 4)}
SEC = {f"NFR-SEC-{i:02d}" for i in range(1, 3)}
OTHER = {"NFR-COMP-01", "NFR-USE-01", "NFR-MNT-01", "NFR-MNT-02", "NFR-PORT-01"}
RULES = {f"ENG-{i:03d}" for i in range(1, 21)}
CONTROLLED_VALUES = [
    "预案启动通知与任务下发≤3秒", "告警接入响应≤2秒", "事件确认至任务下达≤3分钟",
    "消息并行≥20路", "到达率≥99%", "位置刷新≤2秒/次", "亚米级源精度",
    "视频首帧≤3秒", "保存≥30天", "95%请求≤3秒", "地图常规操作≤2秒",
    "扫码打卡写入/回传≤1秒", "综合安防刷新≤30秒", "应急信息默认刷新≤60秒",
    "峰值在线用户≥100人", "一年期统计报表≤5秒", "试运行可用率≥99.5%",
    "MTTR≤2小时", "高危0", "口令≥8位", "核心单元测试覆盖率≥70%",
    "干净环境一次部署成功且≤2小时",
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def missing(expected, text):
    return sorted(x for x in expected if x not in text)


def adr_audit(path: Path):
    text = path.read_text(encoding="utf-8")
    headings = ["## 1 背景", "## 2 待决问题", "## 3", "## 4", "## 5", "## 6", "## 7", "## 8"]
    candidates = len(re.findall(r"^### \d+\.\d+ 方案 [A-Z]", text, re.M))
    return {
        "path": str(path).replace("\\", "/"),
        "status_proposed": "状态：Proposed" in text,
        "required_sections": all(x in text for x in headings),
        "candidate_count": candidates,
        "has_rejected_reasoning": "否决" in text or "不建议" in text,
        "has_consequences": "后果" in text and "负面" in text,
        "has_validation": "验证" in text and "接受条件" in text,
        "has_revisit_triggers": "重新评估触发条件" in text,
        "sample_pollution": [x for x in SAMPLE_TERMS if x.lower() in text.lower()],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--adr1", required=True); ap.add_argument("--adr2", required=True)
    ap.add_argument("--nfr", required=True); ap.add_argument("--deliverable-dir", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    adr_paths = [Path(args.adr1), Path(args.adr2)]
    nfr_path = Path(args.nfr); nfr = nfr_path.read_text(encoding="utf-8")
    deliverable = Path(args.deliverable_dir)
    mirrors = [deliverable / "16-ADR-001-应用拆分与部署单元.md", deliverable / "17-ADR-002-事务Outbox与持久任务.md", deliverable / "18-非功能设计与工程规则.md"]
    source = adr_paths + [nfr_path]
    result = {
        "task": "G3-07",
        "adrs": [adr_audit(x) for x in adr_paths],
        "nfr": {
            "missing_pe": missing(PE, nfr), "missing_capacity": missing(CAP, nfr),
            "missing_reliability": missing(REL, nfr), "missing_security": missing(SEC, nfr),
            "missing_other": missing(OTHER, nfr), "missing_engineering_rules": missing(RULES, nfr),
            "gbt_25000_10": "GB/T 25000.10" in nfr,
            "quality_characteristics": {x: x in nfr for x in ["功能适合性", "性能效率", "兼容性", "易用性", "可靠性", "安全性", "可维护性", "可移植性"]},
            "issue_g3_01_001": "ISSUE-G3-01-001" in nfr,
            "issue_g3_06_001": "ISSUE-G3-06-001" in nfr,
            "sample_pollution": [x for x in SAMPLE_TERMS if x.lower() in nfr.lower()],
            "engineering_rule_count": len(set(re.findall(r"ENG-\d{3}", nfr))),
            "missing_controlled_values": [x for x in CONTROLLED_VALUES if x not in nfr],
        },
        "mirrors": [],
    }
    for src, dst in zip(source, mirrors):
        result["mirrors"].append({"source": str(src).replace("\\", "/"), "deliverable": str(dst).replace("\\", "/"), "exists": dst.exists(), "same_sha256": dst.exists() and sha(src) == sha(dst)})
    result["pass"] = all([
        all(a["status_proposed"] and a["required_sections"] and a["candidate_count"] >= 3 and a["has_rejected_reasoning"] and a["has_consequences"] and a["has_validation"] and a["has_revisit_triggers"] and not a["sample_pollution"] for a in result["adrs"]),
        not result["nfr"]["missing_pe"], not result["nfr"]["missing_capacity"],
        not result["nfr"]["missing_reliability"], not result["nfr"]["missing_security"],
        not result["nfr"]["missing_other"], not result["nfr"]["missing_engineering_rules"],
        result["nfr"]["gbt_25000_10"], all(result["nfr"]["quality_characteristics"].values()),
        result["nfr"]["issue_g3_01_001"], result["nfr"]["issue_g3_06_001"],
        not result["nfr"]["sample_pollution"], result["nfr"]["engineering_rule_count"] == 20,
        not result["nfr"]["missing_controlled_values"],
        all(x["exists"] and x["same_sha256"] for x in result["mirrors"]),
    ])
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["pass"] else 1)


if __name__ == "__main__":
    main()
