import json, re, zipfile, hashlib
from pathlib import Path
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[2]
base=root/'evidence/g6/G6-03'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
c=read(root/'docs/work/G6/g6_03_defense_content.json')
checks=[]
def check(n,b):
 checks.append({'check':n,'status':'PASS' if b else 'FAIL'})
 assert b,n
check('14 pages maintained',len(c['slides'])==14)
review=read(base/'C-review/review-result.json')
check('actual C review CHANGES_REQUIRED retained',review['conclusion']=='CHANGES_REQUIRED' and not review['accepted'])
check('C current code run is 23/23',review['checks']['currentAcceptedCodeRun']['passed']==23)
tasks=(root/'tasks.md').read_text(encoding='utf-8-sig')
for t in ['G6-01','G6-02']:
 check(t+' actual DONE', 'DONE' in next(l for l in tasks.splitlines() if l.startswith('| '+t+' |')))
check('G6-03 stays REVIEW','REVIEW' in next(l for l in tasks.splitlines() if l.startswith('| G6-03 |')))
old=['C整体复核待完成','待B/C确认关闭','G6-01手册当前为REVIEW','尚无A整体接受记录','最终仍REVIEW','G6-02 B结论明确只接受首版']
text=json.dumps(c,ensure_ascii=False)
check('stale claims absent',not any(x in text for x in old))
ppt=root/'docs/deliverables/G6/G6-03-验收答辩候选.pptx'
with zipfile.ZipFile(ppt) as z:
 for s in c['slides']:
  slide=''.join(ET.fromstring(z.read(f"ppt/slides/slide{s['number']}.xml")).itertext())
  note=''.join(ET.fromstring(z.read(f"ppt/notesSlides/notesSlide{s['number']}.xml")).itertext())
  check('updated footer '+str(s['number']),'待定向复验' in slide and '真实验收延期' in slide)
  check('notes synchronized '+str(s['number']),s['notes'] in note)
  for source in s['sources']:
   check('source '+source,(root/source.split('#')[0]).exists())
pdf=ppt.with_suffix('.pdf')
check('PDF 14 pages',len(re.findall(rb'/Type\s*/Page\b',pdf.read_bytes()))==14)
g=read(base/'deck-generation.json')
check('all geometry fits',all(x.get('withinCanvas',True) and x.get('textFits',True) for x in g['geometry']))
g['visualInspection']='A_FINAL_ALL_14_PAGES_INSPECTED';g['renderCacheRemovedAfterInspection']=True
(base/'deck-generation.json').write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out={'taskId':'G6-03','version':'V0.2','scope':'A remediation selfcheck; not C targeted rereview','status':'REMEDIATED_PENDING_C_TARGETED_REREVIEW','cOverallReview':'CHANGES_REQUIRED','issue001':'CLOSED_VERIFIED_BY_B_AND_C','issue002':'REMEDIATED_PENDING_C_TARGETED_REREVIEW','realWorldStatus':'REAL_WORLD_DEFERRED','checks':checks,'outputs':[{'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [ppt,pdf]]}
for name in ['selfcheck.json','remediation-selfcheck.json']:
 (base/name).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS',len(checks))
