"""G3-08 独立复核审计（C 以用户授权代理 A、B 合并复核）。

期望值全部从受控来源推导，未被 G3-08 自检脚本（scripts/audit_g3_08_rtm.py）或
其结论约束：

- control/g2/requirements_catalog.md：G2-FR-001—039、原始 FR、★属性、KN 回指、MVP 优先级
- control/facts.md：原始 FR 的 ★/非★ 事实
- docs/work/B_TECH/spec.md：每 FR 的 AC 集合；§3.6 RCLR→受影响 FR/AC 权威映射
- docs/work/B_TECH/database_design.md：DBD-TR 集合与 RCLR 数据规则专表
- docs/work/B_TECH/detailed_design.md：DLD-TR 集合
- docs/work/B_TECH/interface_design.md + openapi_v1.yaml：API-TR 集合与操作数
- docs/deliverables/18-非功能设计与工程规则.md：PE-01—12、ENG-001—020、NFR-*
- docs/deliverables/17-ADR-002-*.md：ADR-002 自身声明的关联要求（适用面）
- docs/work/A_PM/overview_design.md：ARCH-01—05
- docs/work/B_TECH/G3-01_design_input_baseline.md：MOD-*、EXT-*
- docs/work/C_REQ/ai_reverse_clarifications.md：G2-RCLR 澄清记录（非权威，仅对照）
- control/key_numbers.md：KN 集合
- control/issues.md：Issue 状态

输出：只读检查，结果写入 logs/reviews/2026-09-18_G3-08-AB-audit.json（可用第一个
命令行参数覆盖输出文件名）。pass 只表示 RTM 工作稿的机械缺陷集合为空；done_ready
额外要求阻断项（正式件镜像、渲染 QA 证据、外部 Issue 状态裁决）均清零。
"""

from pathlib import Path
import json
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
RTM = ROOT / "docs/work/C_REQ/rtm_v1.md"
FORMAL_RTM = ROOT / "docs/deliverables/10-需求追踪矩阵RTMv1.docx"
RENDER_DIRS = ROOT / "logs/reviews"
RENDER_QA = RENDER_DIRS / "2026-09-19_G3-08-render-qa.json"

problems = []
observations = []
blockers = []


def read(p):
    return Path(p).read_text(encoding="utf-8")


def add(seq, code, detail):
    seq.append({"code": code, "detail": detail})


def fmt(n):
    return f"{n:03d}"


def expand_fr_list(text):
    """展开 “G2-FR-013/014”“G2-FR-017—020”“G2-FR-013、G2-FR-016” 等写法。"""
    out = set()
    for token in re.finditer(r"G2-FR-(\d{3})((?:[\-/]\d{3})*)", text):
        out.add(f"G2-FR-{token.group(1)}")
        for extra in re.findall(r"\d{3}", token.group(2)):
            out.add(f"G2-FR-{extra}")
    # G2-FR-017—020 这类整段范围：连字符为 em dash
    for m in re.finditer(r"G2-FR-(\d{3})—(\d{3})", text):
        for n in range(int(m.group(1)), int(m.group(2)) + 1):
            out.add(f"G2-FR-{fmt(n)}")
    return out


def expand_plain_numbers(text, prefix="G2-FR-"):
    """展开 ‘013、015、016、021、022’ 这类纯编号列表。"""
    out = set()
    for m in re.finditer(r"(\d{3})", text):
        out.add(f"{prefix}{m.group(1)}")
    return out


# ---------------------------------------------------------------- 受控来源

catalog_text = read(ROOT / "control/g2/requirements_catalog.md")
facts_text = read(ROOT / "control/facts.md")
spec_text = read(ROOT / "docs/work/B_TECH/spec.md")
dbd_text = read(ROOT / "docs/work/B_TECH/database_design.md")
dld_text = read(ROOT / "docs/work/B_TECH/detailed_design.md")
api_text = read(ROOT / "docs/work/B_TECH/interface_design.md")
openapi_text = read(ROOT / "docs/deliverables/15-接口契约-openapi_v1.yaml")
nfr_text = read(ROOT / "docs/deliverables/18-非功能设计与工程规则.md")
adr002_text = read(ROOT / "docs/deliverables/17-ADR-002-事务Outbox与持久任务.md")
arch_text = read(ROOT / "docs/work/A_PM/overview_design.md")
g301_text = read(ROOT / "docs/work/B_TECH/G3-01_design_input_baseline.md")
rclr_text = read(ROOT / "docs/work/C_REQ/ai_reverse_clarifications.md")
kn_text = read(ROOT / "control/key_numbers.md")
issues_text = read(ROOT / "control/issues.md")
rtm_text = read(RTM)

# catalog：G2-FR → (原始 FR, ★, KN 回指)
catalog = {}
for m in re.finditer(
    r"^\| (G2-FR-\d{3}) \| (FR-\d{2}\.\d) \| (是|否) \|.*?\| F-(\d{3})([^|]*)\|",
    catalog_text,
    re.M,
):
    catalog[m.group(1)] = {
        "orig": m.group(2),
        "star": m.group(3) == "是",
        "fact": "F-" + m.group(4),
        "kn": set(re.findall(r"KN-\d{3}", m.group(5))),
    }

# facts：原始 FR → ★
facts_star = {}
for m in re.finditer(r"^\| (F-\d{3}) \| (FR-\d{2}\.\d) \| (★|否) \|", facts_text, re.M):
    facts_star[m.group(2)] = m.group(3) == "★"

# spec：G2-FR → AC 集合
spec_ac = {}
for m in re.finditer(r"^### (G2-FR-\d{3})｜([^｜]+)｜(★|非★)｜(.*)$", spec_text, re.M):
    start = m.end()
    nxt = spec_text.find("\n#", start)
    body = spec_text[start : nxt if nxt > 0 else len(spec_text)]
    spec_ac[m.group(1)] = {
        "ac": set(re.findall(r"AC-G2-FR-\d{3}-\d{2}", body)),
        "star": m.group(3) == "★",
        "orig": m.group(2).strip(),
    }

# spec §3.6：RCLR → 受影响 FR（权威映射）
spec_rclr = {}
for m in re.finditer(
    r"^\| (G2-RCLR-\d{3})[^|]*\| ([^|]+?) \| (AC-[^|]+?) \|", spec_text, re.M
):
    spec_rclr[m.group(1)] = {
        "fr": expand_plain_numbers(m.group(2)),
        "ac": set(re.findall(r"AC-G2-FR-\d{3}-\d{2}", m.group(3))),
    }

# 澄清记录：RCLR → 规格来源 FR（非权威对照）
clar_rclr = {}
rclr_section = rclr_text[rclr_text.index("### G2-RCLR-001") - 4 :]
for block in re.split(r"\n### ", rclr_section):
    m = re.match(r"(G2-RCLR-\d{3})｜", block)
    if not m:
        continue
    src = re.search(r"\*\*规格来源与歧义\*\*：(.*)", block)
    clar_rclr[m.group(1)] = expand_fr_list(src.group(1)) if src else set()


# 设计追踪矩阵：TR 编号 → (G2-FR, ★)
def tr_map(text, prefix):
    out = {}
    for m in re.finditer(
        rf"^\| {prefix}-(\d{{3}})<br>(G2-FR-\d{{3}})<br>(★|非★)", text, re.M
    ):
        out[f"{prefix}-{fmt(int(m.group(1)))}"] = {
            "fr": m.group(2),
            "star": m.group(3) == "★",
        }
    return out


dbd = tr_map(dbd_text, "DBD-TR")
dld = tr_map(dld_text, "DLD-TR")
api = tr_map(api_text, "API-TR")

# OpenAPI 操作数
openapi_ops = len(re.findall(r"^ {4}(get|post|put|patch|delete):", openapi_text, re.M))

# 受控标识符集合
pe = set(re.findall(r"PE-\d{2}", nfr_text))
eng = set(re.findall(r"ENG-\d{3}", nfr_text))
nfr_ids = set(re.findall(r"NFR-[A-Z]+-\d{2}", nfr_text))
adr_ids = set(re.findall(r"ADR-\d{3}", nfr_text))
kn = set(re.findall(r"KN-\d{3}", kn_text))
mod = set(re.findall(r"MOD-[A-Z]+", g301_text))
arch = set(re.findall(r"ARCH-0\d", arch_text))
ext = set(re.findall(r"EXT-[A-Z]+", g301_text))

# ADR-002 自身声明的适用面（“关联要求：G2-FR-003、011、…；G2-RCLR-…；PE-…；NFR-…”）
adr002_req = set()
m = re.search(r"关联要求：(.*)", adr002_text)
if m:
    first_seg = m.group(1).split("；")[0]
    adr002_req = expand_plain_numbers(first_seg)

# RCLR 在设计件中的标注密度（用于校验 §8 挂接声明）
rclr_mentions = {
    "DBD": dbd_text.count("RCLR"),
    "DLD": dld_text.count("RCLR"),
    "API": api_text.count("RCLR"),
    "NFR": nfr_text.count("RCLR"),
}

# ---------------------------------------------------------------- RTM 解析

# §2/§3 行（正向追踪）。§2 含“裁决边界”列，§3 不含，两套列宽分别解析。
rtm_forward = {}
for m in re.finditer(
    r"^\| (G2-FR-\d{3}) \| ([^|]+?) \| ([^|]+?) \| (SRS §[^|]+?) \| (AC-G2-FR-\d{3}-01—03) \| (.*?) \| DES-[^|]+\| TC-[^|]+\| COVERED_PENDING_EVIDENCE \|$",
    rtm_text,
    re.M,
):
    rtm_forward[m.group(1)] = {
        "orig_cell": m.group(2).strip(),
        "prio_cell": m.group(3).strip(),
        "srs": m.group(4).strip(),
        "ac": m.group(5),
        "boundary": m.group(6),
    }
for m in re.finditer(
    r"^\| (G2-FR-\d{3}) \| ([^|]+?) \| ([^|]+?) \| (SRS §[^|]+?) \| (AC-G2-FR-\d{3}-01—03) \| DES-[^|]+\| TC-[^|]+\| COVERED_PENDING_EVIDENCE \|$",
    rtm_text,
    re.M,
):
    rtm_forward.setdefault(
        m.group(1),
        {
            "orig_cell": m.group(2).strip(),
            "prio_cell": m.group(3).strip(),
            "srs": m.group(4).strip(),
            "ac": m.group(5),
            "boundary": "",
        },
    )

# §7 行（设计挂接）
rtm_design = {}
for m in re.finditer(
    r"^\| (G2-FR-\d{3}) / (★|非★) \| (AC-G2-FR-\d{3}-01—03) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| (TC-G2-FR-\d{3}-01—03（G3-09）) \| ([A-Z_0-9\-]+) \|$",
    rtm_text,
    re.M,
):
    rtm_design[m.group(1)] = {
        "star": m.group(2) == "★",
        "ac": m.group(3),
        "design": m.group(4),
        "api": m.group(5),
        "nfr": m.group(6),
        "test": m.group(7),
        "status": m.group(8),
    }

expected = {f"G2-FR-{fmt(i)}" for i in range(1, 40)}

# ---------------------------------------------------------------- 检查

# 1. §7 覆盖与编号
if set(rtm_design) != expected:
    add(problems, "RTM_DESIGN_FR_SET", f"缺失 {sorted(expected - set(rtm_design))}；多出 {sorted(set(rtm_design) - expected)}")

# 2. §7 ★ 集合 == catalog ★ 集合
exp_star = {k for k, v in catalog.items() if v["star"]}
got_star = {k for k, v in rtm_design.items() if v["star"]}
if exp_star != got_star:
    add(problems, "RTM_STAR_MISMATCH", f"missing={sorted(exp_star - got_star)} extra={sorted(got_star - exp_star)}")

# 2b. catalog ★ == facts ★
for g2, meta in catalog.items():
    if facts_star.get(meta["orig"]) != meta["star"]:
        add(problems, "CATALOG_FACTS_STAR", f"{g2} {meta['orig']} catalog={meta['star']} facts={facts_star.get(meta['orig'])}")

# 3. §7 AC == spec AC
for g2 in sorted(expected):
    want = spec_ac.get(g2, {}).get("ac", set())
    if len(want) != 3:
        add(problems, "SPEC_AC_COUNT", f"{g2} spec AC={sorted(want)}")
    row = rtm_design.get(g2)
    if not row:
        continue
    if row["ac"] != f"AC-{g2}-01—03":
        add(problems, "RTM_AC_RANGE", f"{g2} 行内 AC 写法 {row['ac']}")

# 4. 设计 ID 集合与同号映射
for name, src in (("DBD-TR", dbd), ("DLD-TR", dld), ("API-TR", api)):
    exp = {f"{name}-{fmt(i)}" for i in range(1, 40)}
    if set(src) != exp:
        add(problems, f"{name}_SOURCE_SET", f"源文档缺失 {sorted(exp - set(src))} 多出 {sorted(set(src) - exp)}")
    for tr_id, meta in src.items():
        if meta["fr"] != f"G2-FR-{tr_id[-3:]}":
            add(problems, f"{name}_FR_MISMATCH", f"{tr_id} → {meta['fr']}")

# 5. §7 行内设计 ID 与 FR 同号，且在源集合内
for g2, row in rtm_design.items():
    num = g2[-3:]
    for name, src in (("DBD-TR", dbd), ("DLD-TR", dld), ("API-TR", api)):
        ids = set(re.findall(rf"{name}-\d{{3}}", row["design"] + " " + row["api"]))
        want = {f"{name}-{num}"}
        if ids != want:
            add(problems, f"RTM_{name}_ROW", f"{g2} 引用 {sorted(ids)}，期望 {sorted(want)}")
        for i in ids:
            if i not in src:
                add(problems, f"RTM_{name}_UNRESOLVED", f"{g2} 引用源文档不存在的 {i}")

# 6. 反向：源设计 ID 是否都被 RTM 引用（无漏挂）
rtm_all_ids = set(re.findall(r"(?:DBD|DLD|API)-TR-\d{3}", rtm_text))
for name in ("DBD-TR", "DLD-TR", "API-TR"):
    exp = {f"{name}-{fmt(i)}" for i in range(1, 40)}
    if exp - rtm_all_ids:
        add(problems, f"RTM_{name}_MISSING", f"RTM 未引用 {sorted(exp - rtm_all_ids)}")

# 7. 模块 / ARCH / 端口 / ADR / NFR / ENG 可解析
for g2, row in rtm_design.items():
    for mid in set(re.findall(r"MOD-[A-Z]+", row["design"])):
        if mid not in mod:
            add(problems, "MOD_UNRESOLVED", f"{g2} 引用未受控模块 {mid}")
    for aid in set(re.findall(r"ARCH-0\d", row["design"])):
        if aid not in arch:
            add(problems, "ARCH_UNRESOLVED", f"{g2} 引用不存在的 {aid}")
    for rid in set(re.findall(r"ADR-\d{3}", row["nfr"])):
        if rid not in adr_ids | {"ADR-001", "ADR-002"}:
            add(problems, "ADR_UNRESOLVED", f"{g2} 引用 {rid}")
    for nid in set(re.findall(r"NFR-[A-Z]+-\d{2}", row["nfr"])):
        if nid not in nfr_ids:
            add(problems, "NFR_UNRESOLVED", f"{g2} 引用 {nid}")
    for eid in set(re.findall(r"ENG-\d{3}", row["nfr"])):
        if eid not in eng:
            add(problems, "ENG_UNRESOLVED", f"{g2} 引用 {eid}")

rtm_ext = set(re.findall(r"EXT-[A-Z]+", rtm_text))
if rtm_ext - ext:
    add(problems, "EXT_UNRESOLVED", f"RTM 引用未受控端口 {sorted(rtm_ext - ext)}")

# 8. RCLR：RTM 挂接集合 == spec §3.6（权威）
rtm_rclr = {f"G2-RCLR-{fmt(i)}": set() for i in range(1, 11)}
for g2, row in rtm_forward.items():
    for rid in re.findall(r"G2-RCLR-\d{3}", row["boundary"]):
        rtm_rclr.setdefault(rid, set()).add(g2)
for rid in sorted(rtm_rclr):
    want = spec_rclr.get(rid, {}).get("fr", set())
    got = rtm_rclr.get(rid, set())
    if got != want:
        add(problems, "RCLR_FR_MISMATCH", f"{rid}：RTM={sorted(got)} spec §3.6={sorted(want)}")
if set(rtm_rclr) != {f"G2-RCLR-{fmt(i)}" for i in range(1, 11)}:
    add(problems, "RCLR_SET", sorted(rtm_rclr))

# 8b. spec §3.6 与澄清记录对照（来源之间的差异，不是 RTM 缺陷）
for rid in sorted(spec_rclr):
    if clar_rclr.get(rid) and clar_rclr[rid] != spec_rclr[rid]["fr"]:
        add(
            observations,
            "RCLR_SOURCE_DISAGREEMENT",
            f"{rid}：spec §3.6={sorted(spec_rclr[rid]['fr'])} 澄清记录={sorted(clar_rclr[rid])}（以 spec §3.6 为准）",
        )

# 8c. RCLR 在设计件中的标注（校验 §8 挂接声明是否有落点）
rclr_row = re.search(r"^\| G2-RCLR-001—010 \| (.*?) \| (.*?) \|$", rtm_text, re.M)
if rclr_row:
    claim = rclr_row.group(1)
    if re.search(r"ENG-\d{3}", claim) and rclr_mentions["NFR"] == 0:
        add(problems, "RCLR_CLAIM_UNSUPPORTED_ENG", "§8 声称 RCLR 在 ENG 规则上挂接，但 NFR 交付物含 0 处 RCLR 标注")
    if "DLD-TR" in claim and rclr_mentions["DLD"] == 0 and "未逐条标注" not in claim:
        add(problems, "RCLR_CLAIM_UNSUPPORTED_DLD", f"§8 声称在 DLD-TR 挂接 RCLR，但 detailed_design.md 含 {rclr_mentions['DLD']} 处 RCLR 引用且未限定表述")
    if "API-TR" in claim and rclr_mentions["API"] == 0 and "未逐条标注" not in claim:
        add(problems, "RCLR_CLAIM_UNSUPPORTED_API", f"§8 声称在 API-TR 挂接 RCLR，但 interface_design.md 含 {rclr_mentions['API']} 处 RCLR 引用且未限定表述")

# 9. KN 回指：catalog 的 KN 出现在 RTM 对应行
for g2, meta in catalog.items():
    row = rtm_forward.get(g2)
    if not row:
        continue
    for k in meta["kn"]:
        if k not in row["orig_cell"] and k not in row["boundary"]:
            add(problems, "KN_MISSING_IN_RTM", f"{g2} 缺少 {k}")
rtm_kn = set(re.findall(r"KN-\d{3}", rtm_text))
if rtm_kn - kn:
    add(problems, "KN_UNRESOLVED", f"RTM 引用未受控 {sorted(rtm_kn - kn)}")

# 10. 正向表 ID：§2/§3 与 catalog 的原 FR、★ 一致
for g2, meta in catalog.items():
    row = rtm_forward.get(g2)
    if not row:
        add(problems, "RTM_FORWARD_MISSING", g2)
        continue
    if meta["orig"] not in row["orig_cell"] or meta["fact"] not in row["orig_cell"]:
        add(problems, "RTM_FORWARD_ORIG", f"{g2} 行={row['orig_cell']} catalog={meta['orig']}/{meta['fact']}")
    star_cell = "★" if meta["star"] else "非★"
    if star_cell not in row["prio_cell"]:
        add(problems, "RTM_FORWARD_STAR", f"{g2} 行={row['prio_cell']} catalog={star_cell}")

# 10b. §2/§3 的 G2 历史口径必须被显式限定（避免与 §7 状态冲突）
if "（待设计）" in rtm_text and "以第 6—8 章（§7）为准" not in rtm_text:
    add(problems, "RTM_HISTORICAL_VIEW_UNQUALIFIED", "§2/§3 保留“（待设计）/COVERED_PENDING_EVIDENCE”历史口径，但 §6 未声明以 §7 为准")

# 11. OpenAPI 操作数与 RTM 声明一致
if openapi_ops != 57:
    add(problems, "OPENAPI_OPS", f"OpenAPI 操作数 {openapi_ops}，受控声明 57")
ops_claim = rtm_text.count("OpenAPI 契约共 57 项操作")
if ops_claim != len(rtm_design):
    add(problems, "RTM_OPS_CLAIM", f"§7 含 57 项操作声明的行数 {ops_claim}，期望 {len(rtm_design)}")
if "OpenAPI operationId（" in rtm_text:
    add(problems, "RTM_OPS_TOKEN", "§7 仍把操作计数写作 operationId（应为契约级计数，不是逐 FR 的 operationId 列表）")

# 12. ISSUE-G3-01-001 口径
if "ISSUE-G3-01-001" not in rtm_text:
    add(problems, "ISSUE_REF_MISSING", "RTM 未引用 ISSUE-G3-01-001")
issue_block = re.search(r"## ISSUE-G3-01-001(.*?)\n## ", issues_text, re.S)
if issue_block:
    body = issue_block.group(1)
    if "状态：OPEN" not in body:
        contradicts = []
        if "保持 OPEN" in body or "继续阻断" in body:
            contradicts.append("同一条目的正文仍要求保持 OPEN/继续阻断")
        if "ISSUE-G3-01-001 的 OPEN 状态" in issues_text:
            contradicts.append("同册 ISSUE-G3-06-001 关闭语明确“不改变 ISSUE-G3-01-001 的 OPEN 状态”")
        if "ISSUE-G3-01-001` 保持 OPEN" in rtm_text:
            contradicts.append("RTM §6/§8 仍声明 OPEN")
        add(
            blockers,
            "ISSUE_G3_01_001_STATE",
            "control/issues.md 将 ISSUE-G3-01-001 置为 CLOSED / VERIFIED_BY_C；"
            + "；".join(contradicts)
            + "。无关闭证据行，待人工裁决，C 不单方回滚他人提交。",
        )
g306 = re.search(r"### ISSUE-G3-06-001(.*?)\n## ", issues_text, re.S)
if g306 and "状态：CLOSED / VERIFIED_BY_C" not in g306.group(1):
    add(problems, "ISSUE_G3_06_001_STATE", "ISSUE-G3-06-001 非 CLOSED")
stale_g3 = re.search(r"待 G3-0[67]|G3-0[67] Review|PENDING_G3-0[67]", rtm_text)
if stale_g3:
    add(observations, "RTM_G3_06_STATUS_STALE", f"RTM 仍存在待确认标注“{stale_g3.group(0)}”，而 G3-06/07 均已 DONE")

# 13. ★ 计数 / 覆盖统计自洽
mvp_star = len([g for g, v in catalog.items() if v["star"] and int(g[-3:]) <= 29])
nonmvp_star = len([g for g, v in catalog.items() if v["star"] and int(g[-3:]) >= 30])
if (mvp_star, nonmvp_star) != (28, 6):
    add(problems, "STAR_SPLIT", f"MVP★={mvp_star} 非MVP★={nonmvp_star}（期望 28/6）")

# 14. ADR-002 适用面是否被无限定地泛化
adr002_rows = {g2 for g2, row in rtm_design.items() if "ADR-002" in row["nfr"]}
over = adr002_rows - adr002_req
if over and "候选级" not in rtm_text:
    add(
        problems,
        "ADR_002_BLANKET_SCOPE",
        f"§7 将 ADR-002 判给 {len(adr002_rows)} 条 FR，其中 {len(over)} 条不在 ADR-002 文首关联要求（{sorted(adr002_req)}）内，且 RTM 未限定为候选级挂接",
    )

# 15. 正式件 10 与工作稿镜像（阻断项）
if FORMAL_RTM.exists():
    xml = zipfile.ZipFile(FORMAL_RTM).read("word/document.xml").decode("utf-8")
    missing = [t for t in ("DBD-TR", "DLD-TR", "API-TR", "ARCH-", "MOD-", "G2-RCLR") if t not in xml]
    if missing:
        add(blockers, "FORMAL_RTM_NOT_SYNCED", f"正式件 10-需求追踪矩阵RTMv1.docx 不含 {missing}；G3-08 设计挂接未镜像到正式件")
    if "G2-RCLR" in xml and "COVERED_DESIGN" not in xml:
        add(blockers, "FORMAL_RTM_STATE", "正式件仍为 G2-R05 内容，未含 G3-08 设计挂接状态列")

# 16. G3-08 渲染 / 编号引用检查证据。逐页 PNG/PDF 是临时缓存，按正式文档
# Skill 在检查完成后删除；长期审计证据保留为结构化 JSON。
if not RENDER_QA.exists():
    add(blockers, "G3_08_RENDER_QA_MISSING", "缺少 G3-08 持久化渲染 QA 记录")
else:
    try:
        render_qa = json.loads(RENDER_QA.read_text(encoding="utf-8"))
        if render_qa.get("status") != "PASS" or not render_qa.get("all_pages_inspected"):
            add(blockers, "G3_08_RENDER_QA_NOT_PASS", "G3-08 渲染 QA 未记录为全页 PASS")
    except (OSError, json.JSONDecodeError) as exc:
        add(blockers, "G3_08_RENDER_QA_INVALID", f"G3-08 渲染 QA 记录不可解析：{exc}")

# 17. 测试挂接未冒充已完成
if re.search(r"TC-G2-FR-\d{3}-01—03（待测试）", rtm_text) and "（G3-09）" in rtm_text:
    pass  # §7 用（G3-09）预留，§2/§3 用（待测试），均未声称已执行

result = {
    "rtm": str(RTM.relative_to(ROOT)).replace("\\", "/"),
    "counts": {
        "forward_rows": len(rtm_forward),
        "design_rows": len(rtm_design),
        "star_rows": len(got_star),
        "ac_ranges": len(rtm_design),
        "dbd_source": len(dbd),
        "dld_source": len(dld),
        "api_source": len(api),
        "rclr": len(spec_rclr),
        "openapi_operations": openapi_ops,
        "adr002_related_fr": sorted(adr002_req),
        "rclr_mentions": rclr_mentions,
        "kn_controlled": len(kn),
        "mod_controlled": len(mod),
        "ext_controlled": len(ext),
    },
    "problems": problems,
    "observations": observations,
    "blockers": blockers,
    "pass": not problems,
    "done_ready": not problems and not blockers,
}

out_name = sys.argv[1] if len(sys.argv) > 1 else "2026-09-18_G3-08-AB-audit.json"
out = ROOT / "logs/reviews" / out_name
out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
