"""A closeout verification and final archive view; no C source is mutated."""
from pathlib import Path
import subprocess,json,hashlib,re,zipfile
from collections import Counter
from docx import Document
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'evidence/g6/G6-04'
SNAP='3b47e8f97caac1fa6dc989fd1ff5279bd1eb5450'
def git(*args): return subprocess.check_output(['git','-c','core.quotepath=false',*args],cwd=ROOT)
snapshot_files=git('ls-tree','-r','--name-only',SNAP).decode().splitlines()
cached_paths=[p for p in snapshot_files if p.startswith(('docs/deliverables/','logs/reviews/','logs/prompts/','evidence/','quality/selfcheck/','control/','governance/','docs/work/G6/')) or 'rtm' in p.lower() or p in ['tasks.md','AGENTS.md','docs/README.md']]
batch_input=''.join(f'{SNAP}:{p}\n' for p in cached_paths).encode('utf-8')
batch_output=subprocess.check_output(['git','cat-file','--batch'],input=batch_input,cwd=ROOT)
blob_cache={}
offset=0
for path in cached_paths:
    eol=batch_output.index(b'\n',offset)
    size=int(batch_output[offset:eol].split()[-1])
    blob_cache[path]=batch_output[eol+1:eol+1+size]
    offset=eol+size+2
original_git=git
def git(*args):
    if len(args)==2 and args[0]=='show' and args[1].startswith(SNAP+':'):
        path=args[1].split(':',1)[1]
        if path in blob_cache: return blob_cache[path]
    return original_git(*args)
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def sha(b): return hashlib.sha256(b).hexdigest()
checks=[]
def check(name,condition,details=None):
    checks.append({'check':name,'pass':bool(condition),'details':details})
def same_content(actual,blob):
    return actual==blob or (b'\0' not in actual and actual.replace(b'\r\n',b'\n')==blob.replace(b'\r\n',b'\n'))

rtm=read('evidence/g6/G6-02/rtm-acceptance-increment.json')['rows']
rtm5={x['acId']:x for x in read('evidence/g5/G5-03/rtm-v5.json')['rows']}
check('Frozen denominators',len(rtm)==117 and len({x['frId'] for x in rtm})==39 and len({x['frId'] for x in rtm if x['star']})==34)
check('Actual results',Counter(x['actualResult'] for x in rtm)=={'PASS':11,'NOT_RUN':59,'BLOCKED':47})
for row in rtm: check(row['acId']+' history preserved',row['actualResult']==rtm5[row['acId']]['result'])
for path in ['evidence/g6/G6-02/metrics-ledger.md','evidence/g6/G6-02/gaps-deferrals.md','evidence/g6/G6-02/delivery-index.json','evidence/g6/G6-02/rtm-acceptance-increment.json','evidence/g5/G5-01/functional-gate-raw.json','logs/reviews/2026-10-12_G6-03-C-rereview.md','docs/work/G6/G6-01_A_rereview.md','docs/work/G6/G6-02_A_rereview.md']:
    check('Authoritative evidence unchanged '+path,same_content((ROOT/path).read_bytes(),git('show',f'{SNAP}:{path}')))
tasks=(ROOT/'tasks.md').read_text(encoding='utf-8-sig')
snapshot=git('show',f'{SNAP}:tasks.md').decode('utf-8-sig')
for task in ['G6-01','G6-02','G6-03']:
    old=next(x for x in snapshot.splitlines() if x.startswith('| '+task+' |'))
    new=next(x for x in tasks.splitlines() if x.startswith('| '+task+' |'))
    check(task+' task conclusion unchanged',old==new and '| DONE' in new)
check('G6-04 no premature DONE','| DONE' not in next(x for x in tasks.splitlines() if x.startswith('| G6-04 |')))
debts=read('evidence/g6/G6-04/technical-debt.json')
check('Debt IDs unique',len(debts)==12 and len({x['id'] for x in debts})==12)
for d in debts:
    check(d['id']+' transfer fields',all(d.get(k) for k in ['problem','source','impact','responsibility','priority','trigger','repaymentPlan','verification','plannedDate','realWorldStatus']))
transfer=(ROOT/'docs/work/G6/technical_debt_transfer.md').read_text(encoding='utf-8')
check('All C gaps covered',all(f'GAP{i:03}' in transfer for i in range(1,17)))
check('Real deferred preserved',all(x in transfer for x in ['REAL_WORLD_DEFERRED','KN-065','030—039','59 NOT_RUN','17个','试运行','签署','培训']))
report=(ROOT/'docs/work/G6/G6-04_project_development_summary.md').read_text(encoding='utf-8')
check('Required six report chapters',all('## '+x in report for x in ['1 项目概述','2 项目实施过程回顾','3 计划与实际偏差分析','4 AI辅助开发分析','5 技术债务','6 项目经验与流程改进']))
for d in read('evidence/g6/G6-04/deviations.json'):
    check(d['id']+' evidence/cause/impact/action',all(d.get(k) for k in ['plan','actual','evidence','cause','impact','improvement']))
census=read('evidence/g6/G6-04/ai-log-census.json')
check('Review corpus complete including Chinese paths',set(x['path'] for x in census['reviews'])==set(p for p in snapshot_files if p.startswith('logs/reviews/') and p.endswith('.md')))
check('Prompt corpus complete including Chinese paths',set(x['path'] for x in census['prompts'])==set(p for p in snapshot_files if p.startswith('logs/prompts/') and p.endswith('.md')))
check('Prompt block count matches details',census['counts']['archivedRawPromptBlocks']==sum(len(x['rawPromptBlocks']) for x in census['prompts']))
for row in census['prompts']+census['reviews']:
    check('AI source fingerprint '+row['path'],sha(git('show',f"{SNAP}:{row['path']}"))==row['sha256GitBlob'])
check('AI unknowns remain unknown',all(x+' | 未知' in report for x in ['AI代码占比','评审打回率','Prompt复用次数','返工成本']))
check('Reference source unchanged',sha((ROOT/'docs/reference/46-项目开发总结报告（复盘·教学样例）.docx').read_bytes())==read('evidence/g6/G6-04/document-pair-manifest.json')['referenceSha256'])
check('Final rendered OOXML inheritance',all(read('evidence/g6/G6-04/final-ooxml-inheritance.json')['canonicalXmlEquality'].values()))
check('Final visual QA',read('evidence/g6/G6-04/document-pair-manifest.json')['visualReview']=='PASS')
doc=Document(ROOT/'docs/deliverables/G6/46-项目开发总结报告.docx')
body_paras=doc.paragraphs
start=next(i for i,p in enumerate(body_paras) if p.text=='1 项目概述')
bodytext=[p.text for p in body_paras[start:] if p.text]
bodytable=[c.text for t in doc.tables[1:] for r in t.rows for c in r.cells]
source_lines=report.splitlines()
# Verify every source paragraph/heading and table cell, excluding Markdown
# delimiters/captions. Fields and front matter have their own audited contract.
source_text=[]
for line in source_lines[next(i for i,l in enumerate(source_lines) if l.startswith('## ')):]:
    if not line.strip() or line.startswith('| ---'): continue
    if line.startswith('|'):
        source_text.extend(c.strip() for c in line.strip().strip('|').split('|'))
    else: source_text.append(re.sub(r'^#{2,3}\s+','',line).replace('`',''))
available=Counter(bodytext+bodytable)
missing=[x for x in source_text if available[x]==0]
check('Work to DOCX content complete',not missing,missing)
check('Business captions unique',sum(p.text.startswith('表 1-1') for p in doc.paragraphs)==1 and sum(p.text.startswith('表 4-1') for p in doc.paragraphs)==1 and len(doc.tables)==3)
with zipfile.ZipFile(ROOT/'docs/deliverables/G6/46-项目开发总结报告.docx') as z:
    xml='\n'.join(z.read(x).decode('utf-8') for x in z.namelist() if x.endswith('.xml') and x.startswith('word/') and ('document' in x or 'header' in x or 'footer' in x))
check('No teaching case residue',not any(x in xml for x in ['澜图','segment-geospatial','TensorRT','GeoPackage','通关实训第 3 组']))
check('Current branch master',git('branch','--show-current').decode().strip()=='master')

# Archive view references the C source item IDs/snapshots; existence is never
# relabelled acceptance. Original index remains the sole delivery metrics source.
idx=read('evidence/g6/G6-02/delivery-index.json')
links={}
groups=[(idx['items'],'initialSnapshot')]+[(idx['currentIncrement']['items'],'currentIncrement')]+[(g['items'],'subsequentIncrement') for g in idx['subsequentIncrements']]
for items,group in groups:
    for item in items: links.setdefault(item['file'],[]).append({'id':item['id'],'snapshotGroup':group,'version':item.get('version'),'historicalStatus':item['status'],'recordedSha256':item['sha256']})
tracked=git('ls-tree','-r','--name-only',SNAP).decode().splitlines()
def category(path):
    if path.startswith('docs/deliverables/'): return '正式文档'
    if 'rtm' in path.lower() and (path.startswith('docs/work/') or path.startswith('evidence/')): return 'RTM'
    if path.startswith('logs/reviews/'): return 'Review记录'
    if path.startswith('logs/prompts/'): return 'Prompt日志'
    if path.startswith(('evidence/','quality/selfcheck/')): return '测试/质量/Git过程证据'
    if path.startswith(('control/','governance/')) or path in ['tasks.md','AGENTS.md','docs/README.md']: return '控制/治理/计划'
    if path.startswith('docs/work/G6/'): return 'G6移交源'
    return None
paths=set(p for p in tracked if category(p))
newprefixes=['docs/work/G6/G6-04','docs/work/G6/technical_debt_transfer','docs/deliverables/G6/46-','evidence/g6/G6-04/','logs/prompts/2026-10-13-A.md','scripts/g6/build-g6-04','scripts/g6/audit-g6-04','logs/history/2026-10-13-g6-04-bootstrap-preserved/']
for directory in ['docs/work/G6','docs/deliverables/G6','evidence/g6/G6-04','logs/prompts','scripts/g6','logs/history/2026-10-13-g6-04-bootstrap-preserved']:
    for p in (ROOT/directory).rglob('*'):
        if p.is_file():
            rel=p.relative_to(ROOT).as_posix()
            if any(rel.startswith(prefix) for prefix in newprefixes): paths.add(rel)
# Hash index/audit have no self fingerprint. Events in mutable closeout files
# must be validated by the enclosing Git commit, not recursive file re-hashing.
excluded={'evidence/g6/G6-04/final-archive-index.json','evidence/g6/G6-04/INDEX.md','evidence/g6/G6-04/consistency-audit.json'}
rows=[]
for path in sorted(paths-excluded):
    p=ROOT/path
    if not p.exists():
        rows.append({'path':path,'category':category(path),'status':'NOT_AVAILABLE','version':'见C索引','sha256':None,'cIndexLinks':links.get(path,[])})
        continue
    b=p.read_bytes()
    old=git('show',f'{SNAP}:{path}') if path in tracked else None
    mutable=path in ['tasks.md','control/overrides.md','control/issues.md','docs/README.md','logs/prompts/2026-10-13-A.md','docs/work/G6/G6-04_A_self_review.md']
    changed=old is not None and not same_content(b,old)
    rows.append({'file':p.name,'path':path,'category':category(path) or 'G6-04制作/启动留痕','version':f'V0.1 G6-04 REVIEW；上游Git {SNAP[:7]}' if old is None or changed else f'Git snapshot {SNAP[:7]}；文内版号以源件/C映射为准','sha256':sha(b),'bytes':len(b),'status':'AVAILABLE_PENDING_C_AND_B' if old is None or changed else 'AVAILABLE_RETAINED_HISTORY_NOT_UNCONDITIONAL_ACCEPTANCE','inputGitBlobSha256':sha(old) if old is not None else None,'physicalHashRule':'SHA256 physical bytes; canonical blob separately records EOL conversion','mutableAfterSnapshot':mutable,'cIndexLinks':links.get(path,[])})
missing=[{'file':x['name'],'path':x['file'],'version':x.get('version','见C历史快照'),'hash':None,'status':'NOT_AVAILABLE / DEFERRED','cIndexId':x['id']} for x in idx['items'] if not (ROOT/x['file']).exists()]
archive={'schemaVersion':1,'task':'G6-04','state':'REVIEW_PENDING_C_AND_B_NOT_FROZEN','sourceMaster':SNAP,'cIndexSource':'evidence/g6/G6-02/delivery-index.json','countsAreArchiveEntriesNotDeliveryAcceptance':True,'rows':rows,'missingPlannedPaths':missing,'selfReferencePolicy':'INDEX/audit hashes excluded; validate through enclosing Git commit. Mutable rows carry snapshot hashes; later log/task changes require Git object checks, not overwriting historical hashes.'}
(OUT/'final-archive-index.json').write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md='# G6-04 最终归档INDEX（送审快照，未冻结）\n\n源master：'+SNAP+'。本INDEX为A最终归档视图，上游唯一交付/验收索引仍是C的G6-02 delivery-index.json。路径存在、受控历史状态与验收接受分开；不重算C的29项与三段增量。\n\n机器完整索引：final-archive-index.json，逐项包含文件/路径/版本/hash/状态/字节/C配置项映射。第三方先校验physical SHA256，再按sourceMaster与inputGitBlobSha256核对canonical Git blob；行尾转换可能改变物理hash，不改变内容。Git事件全集见git-history.txt，commit可在仓库历史定位。\n\n| 类别 | 归档记录数 | 状态边界 |\n| --- | --- | --- |\n'
for cat,count in Counter(x['category'] for x in rows).items(): md+=f'| {cat} | {count} | 存在性与历史归档；不推导验收PASS |\n'
md+='\n## 未到位的计划路径\n\n'
for x in missing: md+=f"- {x['cIndexId']}：{x['file']}，`{x['path']}`；{x['status']}；hash未知/无文件。\n"
md+='\n## G6-04送审包\n\n事实基线、总结工作稿、46号DOCX/PDF、technical_debt_transfer、AI留档计数、偏差/债务JSON、A自检与一致性审计、C/B复核请求均在机器INDEX定位。真实现场、签署、培训、试运行及补测仍按移交债务处理。当前可变日志/任务/控制状态由后续Git对象验真；INDEX不包含自身hash，避免无限回填。\n'
(OUT/'INDEX.md').write_text(md,encoding='utf-8')
for row in rows:
    if row.get('sha256'): check('Archive physical hash '+row['path'],sha((ROOT/row['path']).read_bytes())==row['sha256'])
check('Archive categories covered',all(any(x['category']==cat for x in rows) for cat in ['正式文档','RTM','Review记录','Prompt日志','测试/质量/Git过程证据']))
failures=[x for x in checks if not x['pass']]
result={'task':'G6-04','executor':'A Codex-assisted self-review, not C/B approval','sourceMaster':SNAP,'status':'PASS' if not failures else 'FAIL','assertionCount':len(checks),'failures':failures,'checks':checks,'releaseDecision':'NOT_FROZEN_PENDING_C_COMPLIANCE_B_TECHNICAL_CONFIRMATION','realWorldStatus':'REAL_WORLD_DEFERRED','archiveRows':len(rows)}
(OUT/'consistency-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:result[k] for k in ['status','assertionCount','failures','archiveRows','releaseDecision']},ensure_ascii=False))
raise SystemExit(bool(failures))
