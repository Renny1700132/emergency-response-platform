"""G5-00 startup inspection only; no application tests or performance execution."""
import hashlib, json, re, subprocess
from pathlib import Path
from datetime import datetime, timezone, timedelta

root=Path(__file__).resolve().parents[3]
def git(*args):
    return subprocess.check_output(['git',*args],cwd=root).decode('utf-8')
def read(p): return (root/p).read_text(encoding='utf-8-sig')
def sha(p): return hashlib.sha256((root/p).read_bytes()).hexdigest()

base='9279768'
files=git('ls-files','-z').split('\0')
terms=r'自\s*`?G4-01`?\s*起|功能分支|\bPR\b|PR Merge|Approve|禁止直接.*push|受保护.*master|master.*不用于日常|单\s*PR|g4_development_workflow|push 功能分支'
pattern=re.compile(terms,re.I)
hits=[]
for f in files:
    if not f or not f.endswith(('.md','.json','.yaml','.yml','.txt','.mjs','.ts','.py')): continue
    p=root/f
    if not p.is_file(): continue
    for n,line in enumerate(read(f).splitlines(),1):
        if pattern.search(line): hits.append({'file':f,'line':n,'text':line})
(root/'evidence/g5/G5-00/keyword-inventory.json').write_text(json.dumps({'base':base,'pattern':terms,'hits':hits},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

changed=git('diff','--name-only',base).splitlines()
protected=('evidence/g4/','control/baselines/','docs/deliverables/','docs/work/B_TECH/','docs/work/C_REQ/','logs/reviews/2026-10-08_G4','backend/','frontend/','tests/','scripts/g4/')
protected_changes=[p for p in changed if p.startswith(protected)]
checks={}
checks['master']=git('branch','--show-current').strip()=='master'
checks['original_pdf_hash']=sha('docs/inputs/G5/通关实验任务书5-质量门禁.pdf')=='2eb41fdaa684d590069fcef189cb87419ec0034af6e5e5ab96150d1b13eafe07'
checks['historical_g4_and_design_unchanged']=not protected_changes
for p in ['logs/prompts/2026-10-08-A.md','control/issues.md','control/overrides.md','control/change_log.md']:
    original=git('show',base+':'+p).replace('\r\n','\n').rstrip()
    checks['history_append_only:'+p]=read(p).replace('\r\n','\n').startswith(original)
for p in ['AGENTS.md','constitution.md','README.md','governance/git_workflow.md','governance/ai_logging.md','governance/review_workflow.md']:
    s=read(p)
    checks['g5_rule:'+p]='OVR-032' in s and '非 force 直接 push master' in s and '仅解释历史，不约束 G5' in s
checks['g4_scope_marker']='本文件仅适用于第四关历史研发；自 G5-00 起不再作为当前 Git 工作流。' in read('governance/g4_development_workflow.md')
checks['pr_template_optional']='G5 按 OVR-032' in read('.gitee/PULL_REQUEST_TEMPLATE.md')
tasks=read('tasks.md')
rows=[x for x in tasks.splitlines() if re.match(r'^\| G5-0[0-3] \|',x)]
checks['exact_four_g5_tasks']=len(rows)==4 and len(set(re.findall(r'^\| (G5-0[0-3]) \|',tasks,re.M)))==4
checks['status_done_then_todo']=rows[0].endswith('| DONE |') and all(x.endswith('| TODO |') for x in rows[1:])
checks['roles_and_review']=all(token in row for row,token in zip(rows,['A（何思源','| C | A |','| B | C |','| A | C最终复核 |']))
plan=read('docs/work/A_PM/g5_quality_gate_plan.md')
checks['hard_gate_checklist']=all(t in plan for t in ['集成最终100%PASS','每条需求至少1条实际PASS','P99','三项课前审计无BLOCKER','Docker干净部署','四类正式交付','八大质量特性','严重缺陷不得进入下一关','RTM无断链'])
checks['parallel_and_final_dependency']='G5-01/02尽量并行' in plan and 'G5-01/02 DONE' in plan
checks['na_preserves_position_accuracy']='N/A：本应急管理信息系统无适用的冻结影像集算法精度指标' in plan and 'PE-05/KN-009仍实测' in plan
checks['audit_original_definition']=all(t in plan for t in ['文档审计','可移植性批量验证','AI使用审计','PDF315页'])
checks['range_risk_registered']='ISSUE-G5-00-001' in read('control/issues.md') and 'BLOCKING_TO_G5_FINAL_GATE' in read('control/issues.md')
checks['no_g5_test_execution']='本轮仅检查' in plan and 'G5-01/02/03为TODO' in plan
checks['diff_check']=subprocess.run(['git','diff','--check'],cwd=root,capture_output=True).returncode==0
result={'task':'G5-00','executed_at':datetime.now(timezone(timedelta(hours=8))).isoformat(),'base_commit':base,'kind':'STARTUP_GOVERNANCE_ONLY','decision':'PASS' if all(checks.values()) else 'FAIL','checks':checks,'protected_changes':protected_changes,'keyword_inventory':'keyword-inventory.json','inspection_scope':'All tracked textual project files; current rule occurrences manually classified; G4 evidence/logs/reference/frozen snapshots retained.','manual_rule_review':'A / Codex-assisted startup inspection; not independent C Review','independent_review':'PENDING_REVIEW','g5_01_02_execution':'NOT_STARTED','final_gate_risks':['ISSUE-G5-00-001: backlog versus full FR PASS; does not block startup','Real target/host/external/independent deploy prerequisites not proven ready']}
(root/'evidence/g5/G5-00/governance-selfcheck.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(0 if result['decision']=='PASS' else 1)
