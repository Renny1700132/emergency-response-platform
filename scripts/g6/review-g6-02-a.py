"""Read-only independent A verification; prints actual assertions as JSON."""
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
checks = []


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def verify(name, condition):
    checks.append({"check": name, "passed": bool(condition)})
    if not condition:
        raise AssertionError(name)


delivery = read("evidence/g6/G6-02/delivery-index.json")
rtm = read("evidence/g6/G6-02/rtm-acceptance-increment.json")
source = read("evidence/g5/G5-03/rtm-v5.json")
raw = read("evidence/g5/G5-01/functional-gate-raw.json")
b = read("evidence/g6/G6-02/b-final-rereview.json")
verify("B final overall acceptance exists", b["accepted"] is True)
verify("B review source unchanged", git("show", "6fad770:evidence/g6/G6-02/b-final-rereview.json") == (ROOT / "evidence/g6/G6-02/b-final-rereview.json").read_bytes().replace(b"\r\n", b"\n"))
verify("historical initial items unchanged", delivery["items"] == json.loads(git("show", "0de6884:evidence/g6/G6-02/delivery-index.json"))["items"])
verify("historical 21 item increment unchanged", delivery["currentIncrement"] == json.loads(git("show", "0de6884:evidence/g6/G6-02/delivery-index.json"))["currentIncrement"])
for group in [delivery["currentIncrement"], *delivery["subsequentIncrements"]]:
    for item in group["items"]:
        blob = git("show", group["inputCommit"] + ":" + item["file"])
        verify(item["id"] + " canonical bytes/hash", len(blob) == item["bytes"] and hashlib.sha256(blob).hexdigest() == item["sha256"])
latest = {}
for group in [delivery["currentIncrement"], *delivery["subsequentIncrements"]]:
    for item in group["items"]:
        latest[item["file"]] = (group["inputCommit"], item)
for file in ["docs/deliverables/G6/34-用户手册.docx", "docs/deliverables/G6/34-用户手册.pdf", "docs/deliverables/G6/45-部署与运维手册.docx", "docs/deliverables/G6/45-部署与运维手册.pdf"]:
    _, item = latest[file]
    verify(file + " latest bytes match current", hashlib.sha256((ROOT / file).read_bytes()).hexdigest() == item["sha256"])
source_by_ac = {row["acId"]: row for row in source["rows"]}
verify("117 AC unique", len(rtm["rows"]) == len({row["acId"] for row in rtm["rows"]}) == 117)
verify("39 FR / 34 star FR", len({row["frId"] for row in rtm["rows"]}) == 39 and len({row["frId"] for row in rtm["rows"] if row["star"]}) == 34)
verify("AC 11/59/47", Counter(row["actualResult"] for row in rtm["rows"]) == {"PASS": 11, "NOT_RUN": 59, "BLOCKED": 47})
for row in rtm["rows"]:
    original = source_by_ac[row["acId"]]
    actual = raw["acResults"][int(row["rawLocator"].rsplit("/", 1)[1])]
    verify(row["acId"] + " FR/TC/raw/result chain", row["frId"] == original["frId"] and row["plannedTC"] == original["plannedTC"] and row["star"] == original["star"] and row["acId"] == actual["acId"] and row["actualResult"] == original["result"] == actual["result"] and bool(original["designIds"]) and (row["actualResult"] != "PASS" or bool(actual["evidence"])))
verify("real world remains unaccepted", rtm["unconditionalRealWorldPass"] is False and rtm["boundaries"]["ownerSystemsReal"] == "0/6" and rtm["boundaries"]["independentRealOperator"] == 0)
for commit in ["56e9da9", "e194cdb", "deaddc6", "0de6884", "6f56ab6", "6f5d86e", "858f1f0", "81fc5a4", "ca5b916", "56dbeff", "6fad770", "41b8180", "e223f6d", "d322c64"]:
    verify(commit + " audit ancestor", subprocess.run(["git", "merge-base", "--is-ancestor", commit, "HEAD"], cwd=ROOT).returncode == 0)
metrics = (ROOT / "evidence/g6/G6-02/metrics-ledger.md").read_text(encoding="utf-8")
for label in ["AI代码占比", "评审打回率", "Prompt复用次数", "返工成本"]:
    verify(label + " honestly unknown", any(label in line and "UNKNOWN" in line for line in metrics.splitlines()))
print(json.dumps({"status": "PASS", "inputHead": git("rev-parse", "HEAD").decode().strip(), "assertions": len(checks), "checks": checks, "scope": "A_DIRECTORY_PLAN_CONSISTENCY_REVIEW", "realWorldAccepted": 0}, ensure_ascii=False, indent=2))
