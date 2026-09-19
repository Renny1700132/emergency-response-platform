from pathlib import Path
from zipfile import ZipFile
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SPEC = (ROOT / "docs/work/B_TECH/spec.md").read_text(encoding="utf-8")
PLAN = (ROOT / "docs/work/C_REQ/test_plan.md").read_text(encoding="utf-8")
FORMAL = ROOT / "docs/deliverables/19-测试计划.docx"

spec_ac = set(re.findall(r"AC-G2-FR-\d{3}-\d{2}", SPEC))
plan_tc = set(re.findall(r"TC-G2-FR-\d{3}-\d{2}", PLAN))
expected_tc = {x.replace("AC-", "TC-") for x in spec_ac}
fr_rows = re.findall(r"^\| G2-FR-\d{3} / (★|非★) \|", PLAN, re.M)
pe = set(re.findall(r"\| (PE-\d{2}) \|", PLAN))
p0 = set(re.findall(r"\| (P0-\d{2}) ", PLAN))

required_headings = [
    "## 1 引言", "## 2 测试范围", "## 3 测试策略", "## 4 准入与准出",
    "## 5 进度、角色与交付", "## 6 P0 场景与外部联动", "## 7 非功能与关键数字验证",
    "## 8 117 个 AC 级测试设计索引", "## 9 风险与应对", "## 10 配置、报告与准出结论",
]

problems = []
def check(ok, code, detail):
    if not ok:
        problems.append({"code": code, "detail": detail})

check(len(spec_ac) == 117, "SPEC_AC_COUNT", len(spec_ac))
check(len(plan_tc) == 117, "PLAN_TC_COUNT", len(plan_tc))
check(plan_tc == expected_tc, "TC_AC_SET", {"missing": sorted(expected_tc-plan_tc), "extra": sorted(plan_tc-expected_tc)})
check(len(fr_rows) == 39, "FR_ROW_COUNT", len(fr_rows))
check(fr_rows.count("★") == 34, "STAR_ROW_COUNT", fr_rows.count("★"))
check(pe == {f"PE-{i:02d}" for i in range(1,13)}, "PE_SET", sorted(pe))
check(p0 == {f"P0-{i:02d}" for i in range(1,9)}, "P0_SET", sorted(p0))
check(all(x in PLAN for x in required_headings), "HEADINGS", [x for x in required_headings if x not in PLAN])
check("状态：REVIEW" in PLAN and "尚未执行测试" in PLAN, "EVIDENCE_STATE", "计划必须保持 REVIEW 且明确未执行")
check("ISSUE-G3-01-001` 保持 OPEN" in PLAN, "OPEN_ISSUE", "缺少 OPEN 阻断声明")
check("主责 / 复核：C / A（OVR-025 单人复核）" in PLAN, "REVIEWER_OVERRIDE", "G3-09 复核主体未按 OVR-025 统一为 A")
check("可按 OVR-025 提交 A 单人复核" in PLAN, "REVIEWER_CONCLUSION", "结论仍含过时复核主体")

if FORMAL.exists():
    with ZipFile(FORMAL) as docx:
        xml = docx.read("word/document.xml").decode("utf-8")
        styles_xml = docx.read("word/styles.xml").decode("utf-8")
    formal_tc = set(re.findall(r"TC-G2-FR-\d{3}-\d{2}", xml))
    check(formal_tc == expected_tc, "FORMAL_TC_SET", {"count": len(formal_tc), "missing": sorted(expected_tc-formal_tc)})
    check("未定义书签" not in xml and " TOC \\o" not in xml, "FORMAL_TOC", "正式件含失效目录字段")
    check('descr="展示单元测试、集成测试、系统测试到验收测试的四级证据递进关系。"' in xml, "FIGURE_ALT_TEXT", "图 3-1 缺少有意义的替代文本")
    toc2_style_ids = {
        style_id
        for style_id, block in re.findall(
            r'<w:style[^>]*w:styleId="([^"]+)"[^>]*>(.*?)</w:style>', styles_xml, re.S
        )
        if re.search(r'<w:name w:val="toc 2"', block, re.I)
    }
    has_toc2_paragraph = 'w:pStyle w:val="TOC2"' in xml or any(
        f'w:pStyle w:val="{style_id}"' in xml for style_id in toc2_style_ids
    )
    check('w:leader="dot"' in xml and has_toc2_paragraph, "TOC_NAVIGATION", "目录缺少点引线或二级层级")
    check(not any(x in xml for x in ("澜图", "遥感影像智能解译", "samgeo", "QGIS")), "SAMPLE_POLLUTION", "正式件含教学案例业务词")
else:
    problems.append({"code": "FORMAL_MISSING", "detail": str(FORMAL)})

result = {
    "task": "G3-09",
    "counts": {
        "fr_rows": len(fr_rows), "star_rows": fr_rows.count("★"), "spec_ac": len(spec_ac),
        "test_cases": len(plan_tc), "pe": len(pe), "p0_scenarios": len(p0),
    },
    "problems": problems,
    "pass": not problems,
    "review_ready": not problems,
}
out = ROOT / "logs/reviews/2026-09-19_G3-09-C-self-audit.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
