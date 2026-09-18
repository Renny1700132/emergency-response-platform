from pathlib import Path
import re,json
p=Path("docs/work/C_REQ/rtm_v1.md"); s=p.read_text(encoding="utf-8")
ids=lambda pat:set(re.findall(pat,s))
fr=ids(r"G2-FR-(\d{3})"); ac=ids(r"AC-G2-FR-(\d{3})-(\d{2})"); rows=ids(r"\| G2-FR-(\d{3}) /")
need={f"{i:03d}" for i in range(1,40)}
res={"fr_rows":len(rows),"fr_missing":sorted(need-rows),"star_expected":34,"star_rows":len(re.findall(r"\| G2-FR-\d{3} / ★ \|",s[s.index("## 7"):])) ,"ac_ranges":len(ac),"ac_effective":len(ac)*3,"dbd":len(ids(r"DBD-TR-(\d{3})")),"dld":len(ids(r"DLD-TR-(\d{3})")),"api":len(ids(r"API-TR-(\d{3})")),"rclr":len(ids(r"G2-RCLR-(\d{3})")),"pending_marker":"待 G3-06/07 Review 确认" in s}
res["pass"]=res["fr_rows"]==39 and not res["fr_missing"] and res["star_rows"]==34 and res["ac_effective"]==117 and res["dbd"]>=39 and res["dld"]>=39 and res["api"]>=39 and res["rclr"]==10 and res["pending_marker"]
print(json.dumps(res,ensure_ascii=False,indent=2))
Path("logs/reviews/2026-09-18_G3-08-rtm-audit.json").write_text(json.dumps(res,ensure_ascii=False,indent=2),encoding="utf-8")
