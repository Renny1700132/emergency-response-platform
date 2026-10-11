import json, hashlib, re, zipfile, subprocess
from pathlib import Path
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[2]
base = root / 'evidence/g6/G6-03'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
content = read(root/'docs/work/G6/g6_03_defense_content.json')
result = read(base/'rehearsal-result.json')
checks = []
def check(name, condition):
    checks.append({'check': name, 'status': 'PASS' if condition else 'FAIL'})
    assert condition, name
check('latest actual simulated run has 23 passing checks', result['actualExecution'] and result['evidenceKind']=='COURSE_SIMULATED_REHEARSAL' and len(result['checks'])==23 and all(c['status']=='PASS' for c in result['checks']))
check('expected database readiness boundary remains 503', any(c.get('actualHttp')==503 for c in result['checks']))
check('actual 409 and 403 exceptions retained', all(any(c.get('actualHttp')==v for c in result['checks']) for v in [409,403]))
history = [read(p)['status'] for p in sorted((base/'raw').glob('*/result.json'))]
check('failed attempts and original display defect retained', history.count('FAIL')==2 and 'PASS_WITH_KNOWN_DISPLAY_DEFECT' in history and 'PASS' in history)
lock = read(base/'rehearsal-release-lock.json')
check('application bytes match run lock', all(hashlib.sha256((root/f['path']).read_bytes()).hexdigest()==f['sha256'] for f in lock['files']))
check('only two application files corrected', set(lock['changedFilesFromBase'])=={'frontend/src/features/response/workflow.ts','frontend/tests/workflow.test.ts'})
for slide in content['slides']:
    for source in slide['sources']:
        check('source exists: '+source, (root/source.split('#')[0]).exists())
ppt = root/'docs/deliverables/G6/G6-03-验收答辩候选.pptx'
pdf = ppt.with_suffix('.pdf')
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(ppt) as z:
    slides=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)]
    notes=[n for n in z.namelist() if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n)]
    check('14 native slides and 14 notes', len(slides)==len(notes)==len(content['slides'])==14)
    for s in content['slides']:
        text=''.join(ET.fromstring(z.read(f"ppt/slides/slide{s['number']}.xml")).itertext())
        check('slide title '+str(s['number']), s['title'] in text)
        note=''.join(ET.fromstring(z.read(f"ppt/notesSlides/notesSlide{s['number']}.xml")).itertext())
        check('speaker notes '+str(s['number']), s['notes'] in note)
check('PDF has 14 pages', len(re.findall(rb'/Type\s*/Page\b',pdf.read_bytes()))==14)
tasks=(root/'tasks.md').read_text(encoding='utf-8-sig')
row=next(l for l in tasks.splitlines() if l.startswith('| G6-03 |'))
check('task remains REVIEW with reviewer pending', 'REVIEW' in row and '待' in row)
changed=subprocess.check_output(['git','diff','--name-only','deaddc6'],cwd=root,text=True).splitlines()
check('no frozen baseline or G5 historical evidence rewritten', not any(p.startswith(('control/baselines/','evidence/g5/')) for p in changed))
forbidden=['g6_03_fact_baseline.md','g6_03_ai_collaboration_analysis.md','g6_03_technical_debt.md','project_development_summary_report.md']
check('wrong retrospective outputs absent', not any(list(root.rglob(n)) for n in forbidden))
deck=read(base/'deck-generation.json')
deck['visualInspection']='PASS_BY_A_ALL_14_SLIDES_FINAL_IMAGE_PAGES_8_TO_12_RECHECKED'
deck['renderCacheRemovedAfterInspection']=True
(base/'deck-generation.json').write_text(json.dumps(deck,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out={'taskId':'G6-03','checkedAt':datetime.now(timezone.utc).isoformat(),'scope':'A selfcheck only; B technical confirmation and C overall review pending','status':'PASS_FOR_CANDIDATE_SELF_CHECK','checks':checks,'historyStatuses':history,'outputs':[{'path':str(p.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [ppt,pdf]]}
(base/'selfcheck.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':out['status'],'checks':len(checks)},ensure_ascii=False))
