"""Read-only evidence review; writes only A review evidence, never author artifacts."""
import collections, hashlib, json, re, subprocess, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'evidence/g6/G6-A-review'
OUT.mkdir(parents=True, exist_ok=True)
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
def blob(commit,p): return subprocess.check_output(['git','show',f'{commit}:{p}'],cwd=ROOT)
report = {'reviewer':'A (Codex-assisted; not B final review)', 'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()}
idx = read('evidence/g6/G6-02/delivery-index.json')
items = idx['items']
report['indexSnapshot'] = {'rows':len(items),'claimed':dict(collections.Counter(i['availability'] for i in items)), 'currentExistingIndexedPaths':sum((ROOT/i['file']).exists() for i in items), 'staleMissingClaims':[i['id'] for i in items if i['availability']=='NOT_AVAILABLE' and (ROOT/i['file']).exists()]}
report['indexSnapshot']['unindexedNewEvidence'] = [p for p in ['evidence/g6/G6-01/command-execution-ledger.md','evidence/g6/G6-01/document-pair-manifest.json','evidence/g6/G6-03/rehearsal-result.json','evidence/g6/G6-03/rehearsal-release-lock.json'] if p not in [i['file'] for i in items]]
g6 = read('evidence/g6/G6-02/rtm-acceptance-increment.json')['rows']
g5 = {r['acId']:r for r in read('evidence/g5/G5-03/rtm-v5.json')['rows']}
raw = read('evidence/g5/G5-01/functional-gate-raw.json')['acResults']
drift=[]; loc_errors=[]
for r in g6:
    s=g5[r['acId']]
    for a,b in [('frId','frId'),('star','star'),('plannedTC','plannedTC'),('actualResult','result'),('rawLocator','rawLocator'),('deferredStatuses','deferredStatuses')]:
        if r[a]!=s[b]: drift.append([r['acId'],a])
    n=int(r['rawLocator'].split('/')[-1])
    if raw[n]['acId']!=r['acId'] or raw[n]['result']!=r['actualResult']: loc_errors.append(r['acId'])
report['rtm']={'rows':len(g6),'uniqueAC':len({r['acId'] for r in g6}),'FR':len({r['frId'] for r in g6}),'starFR':len({r['frId'] for r in g6 if r['star']}),'results':dict(collections.Counter(r['actualResult'] for r in g6)), 'rowDrift':drift,'rawLocatorErrors':loc_errors,'passRowsWithActualTCAndEvidence':sum(s['result']=='PASS' and s['testCase']!='N/A' and bool(s['evidence']) for s in g5.values()), 'plannedTCIsNotExecutionEvidence':True}
perf=read('evidence/g5/G5-02/performance-raw.json')
report['performance']={'groups':len(perf['measurements']),'samples':sum(len(m['samples']) for m in perf['measurements']),'failures':sum(m['failures'] for m in perf['measurements']),'csvRows':len((ROOT/'evidence/g5/G5-02/performance-samples.csv').read_text(encoding='utf-8').strip().splitlines())-1, 'boundary':'Local HTTP/simulated; not production SLA'}
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
docs=[]
for pair in read('evidence/g6/G6-01/document-pair-manifest.json'):
    p=pair['target']; ref=pair['reference']
    with zipfile.ZipFile(ROOT/p) as z,zipfile.ZipFile(ROOT/ref) as rz:
        xml=ET.fromstring(z.read('word/document.xml')); rxml=ET.fromstring(rz.read('word/document.xml'))
        text='\n'.join(''.join(t.itertext()) for t in xml.findall('.//w:t',ns))
        paras=[''.join(p.itertext()) for p in xml.findall('.//w:p',ns)]
        captions=[x for x in paras if re.match(r'^(表|图)\s+\d+-\d+',x)]
        dup=[x for x,c in collections.Counter(re.match(r'^(表|图)\s+\d+-\d+',x).group() for x in captions).items() if c>1]
        package_parts=['word/styles.xml','word/numbering.xml','word/theme/theme1.xml']
        inherited={part:part in z.namelist() and part in rz.namelist() and z.read(part)==rz.read(part) for part in package_parts}
        sections=[ET.tostring(x,encoding='unicode') for x in xml.findall('.//w:sectPr',ns)]
        refsections=[ET.tostring(x,encoding='unicode') for x in rxml.findall('.//w:sectPr',ns)]
        geometry=lambda root: {tag:[x.attrib for x in root.findall('.//w:sectPr/w:'+tag,ns)] for tag in ['pgSz','pgMar','cols','pgNumType']}
        docs.append({'file':p,'referenceHashMatches':sha(ref)==pair['referenceSha256'],'docxHashMatches':sha(p)==pair['docxSha256'],'pdfHashMatches':sha(pair['pdf'])==pair['pdfSha256'],'inheritedPartsEqual':inherited,'sectionPropertiesEqual':sections==refsections,'pageGeometryEqual':geometry(xml)==geometry(rxml),'tables':len(xml.findall('.//w:tbl',ns)),'imageRelationships':len([n for n in z.namelist() if n.startswith('word/media/')]),'captions':captions,'duplicateCaptionIDs':dup,'explicitNonBlackColors':sorted({x.get('{'+ns['w']+'}val') for x in xml.findall('.//w:color',ns) if x.get('{'+ns['w']+'}val') not in ('000000','auto',None)}),'caseNameContamination':'澜图' in text})
report['documents']=docs
report['commands']={'ledgerEntries':['1','2','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','3','4'],'deploymentPerCommandTimestamps':False,'deploymentPerCommandExitCodes':False,'scriptAggregateSuccessDoesNotReplaceCommandEvidence':True,'unrecordedManualCommands':['npm ci (host)','npm ci --prefix frontend (host)','docker compose ps','docker compose logs --since=30m backend/database','docker compose cp','docker compose pull','migrate down','git checkout <approved tag>','docker compose down (without -v)'],'backupDumpNamesDiffer':'manual emergency.dump; raw g6-backup.dump'}
report['applicationChangesSinceManualLock']=subprocess.check_output(['git','diff','--name-only','beb605f','HEAD','--','frontend','backend','compose.yaml'],cwd=ROOT,text=True).splitlines()
report['renderWarnings']=['Poppler: No display font for Symbol/ArialUnicode; visual inspection required']
(OUT/'mechanical-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for prefix in ['user','ops']:
    paths=sorted(p for p in OUT.glob(prefix+'-*.png') if re.fullmatch(prefix+r'-\d+\.png',p.name))
    thumbs=[]
    for p in paths:
        im=Image.open(p).convert('RGB'); im.thumbnail((390,555))
        tile=Image.new('RGB',(410,590),'#eeeeee');tile.paste(im,((410-im.width)//2,25));ImageDraw.Draw(tile).text((12,7),p.name,fill='black');thumbs.append(tile)
    for start in range(0,len(thumbs),6):
        batch=thumbs[start:start+6];sheet=Image.new('RGB',(1230,1180),'white')
        for n,t in enumerate(batch):sheet.paste(t,((n%3)*410,(n//3)*590))
        sheet.save(OUT/f'{prefix}-contact-{start//6+1}.png')
print(json.dumps({'index':report['indexSnapshot'],'rtm':report['rtm'],'performance':report['performance'],'documents':[{k:v for k,v in d.items() if k!='captions'} for d in docs],'codeChanges':report['applicationChangesSinceManualLock']},ensure_ascii=False))
