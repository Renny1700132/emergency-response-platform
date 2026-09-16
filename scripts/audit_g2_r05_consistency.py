"""Read-only mechanical evidence for the G2-R05 consistency audit."""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
paths = {
    "catalog": ROOT / "control/g2/requirements_catalog.md",
    "srs": ROOT / "docs/work/A_PM/software_requirements_specification_v0.1.md",
    "spec": ROOT / "docs/work/B_TECH/spec.md",
    "rtm": ROOT / "docs/work/C_REQ/rtm_v1.md",
    "clarifications": ROOT / "docs/work/C_REQ/ai_reverse_clarifications.md",
}
texts = {name: path.read_text(encoding="utf-8") for name, path in paths.items()}

def ids(text, pattern):
    return sorted(set(re.findall(pattern, text)))

fr_pattern = r"G2-FR-(\d{3})"
ac_pattern = r"AC-G2-FR-(\d{3})-(\d{2})"
rclr_pattern = r"G2-RCLR-(\d{3})"
result = {"sources": {k: str(v.relative_to(ROOT)).replace("\\", "/") for k,v in paths.items()}}
for name, text in texts.items():
    result[name] = {
        "fr": ids(text, fr_pattern),
        "ac": sorted({f"{a}-{b}" for a,b in re.findall(ac_pattern, text)}),
        "rclr": ids(text, rclr_pattern),
        "old_clr": ids(text, r"G2-CLR-(\d{3})"),
        "kn": ids(text, r"KN-(\d{3})"),
    }
expected_fr = [f"{i:03d}" for i in range(1,40)]
expected_rclr = [f"{i:03d}" for i in range(1,11)]
result["checks"] = {
    "missing_fr": {name: sorted(set(expected_fr)-set(result[name]["fr"])) for name in ("catalog","srs","spec","rtm")},
    "missing_rclr": {name: sorted(set(expected_rclr)-set(result[name]["rclr"])) for name in ("srs","spec","rtm","clarifications")},
    "ac_fr_coverage": {name: sorted({a.split("-")[0] for a in result[name]["ac"]}) for name in ("srs","spec","rtm")},
}
(ROOT / "logs/reviews/G2-R05_mechanical_consistency.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
for name in ("catalog","srs","spec","rtm","clarifications"):
    print(name, "FR", len(result[name]["fr"]), "AC", len(result[name]["ac"]), "RCLR", len(result[name]["rclr"]), "CLR", len(result[name]["old_clr"]))
print(json.dumps(result["checks"]["missing_rclr"], ensure_ascii=False))
