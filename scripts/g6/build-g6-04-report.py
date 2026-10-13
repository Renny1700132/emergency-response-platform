"""Physically inherit Reference 46; map controlled A source into copied package."""
from pathlib import Path
from copy import deepcopy
import shutil, json, hashlib, re, zipfile
from docx import Document
from docx.oxml.ns import qn
from docx.shared import Inches
import importlib.util
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('manual_helpers',ROOT/'scripts/g6/build-g6-01-manuals.py')
helper=importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
REF=ROOT/'docs/reference/46-项目开发总结报告（复盘·教学样例）.docx'
TARGET=ROOT/'docs/deliverables/G6/46-项目开发总结报告.docx'
SOURCE=ROOT/'docs/work/G6/G6-04_project_development_summary.md'
EVIDENCE=ROOT/'evidence/g6/G6-04'
reference=Document(REF)
proto={
 'normal':reference.paragraphs[21],
 'heading1':reference.paragraphs[26],
 'heading2':reference.paragraphs[22],
 'caption':reference.paragraphs[25],
 'list':reference.paragraphs[27],
}
manifest={
 'mode':'NEW DOCUMENT','reference':REF.relative_to(ROOT).as_posix(),
 'referenceSha256':hashlib.sha256(REF.read_bytes()).hexdigest(),
 'target':TARGET.relative_to(ROOT).as_posix(),'source':SOURCE.relative_to(ROOT).as_posix(),
 'physicalCopy':True,'renderer':'Microsoft Word COM, native PDF export + Poppler',
 'referencePages':10,'visualReview':'PENDING',
 'elements':{
  'pageGeometry':'MATCH: cloned sectPr page size/margins/header/footer distances',
  'frontMatter':'MATCH: cloned cover/revision/TOC/body-start; no independent date page in Pair',
  'styleInheritance':'MATCH: original styles/basedOn/docDefaults/theme/numbering retained',
  'paragraphDirectFormatting':'MATCH: normal p21, heading1 p26, heading2 p22, caption p25; actual pPr/rPr cloned',
  'tableDirectFormatting':'MATCH: body table1 tblPr/header/body tcPr/pPr/rPr; column counts and widths adapted to 3 fields',
  'headersFootersPageFields':'MATCH: original parts/references retained, project text replaced; Word updates fields',
  'imageDimensions':'MATCH/NONE: no project figures; teaching charts with unverifiable times/AI numbers removed',
  'pageVisualResult':'MISMATCH/PENDING: requires final per-page review'
 },
 'structuralDeviation':'NEW DOCUMENT: project-specific chapters replace case chapters; unsupported time/AI charts omitted; debt paragraphs replace narrow case table; no case data reused.',
 'businessTables':2,'businessCaptions':['表 1-1','表 4-1'],'figures':0,
 'contentFreezeCheck':'N/A NEW DOCUMENT; work-to-deliverable equality checked separately',
}
(EVIDENCE/'document-pair-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'.tmp/g6-04/artifact.md').write_text('# Reference 46执行约定\n\n'+json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copy2(REF,TARGET)
doc=Document(TARGET)
replacements={0:'文档编号：YJGL-G6-46　　版本号：V0.1',1:'密　　级：内部 · 课程交付',
 3:'某自然博物馆智能运营中心建设项目\n应急管理子系统',4:'项目开发总结报告（复盘）',5:'G6-04 送审候选',
 7:'编制单位：020202项目组',8:'编　　制：何思源（项目经理）',
 9:'审　　核：任俊强（待复核）',10:'批　　准：课程负责人（待评审）',11:'编制日期：2026 年 10 月 13 日'}
for index,text in replacements.items(): helper.set_text(doc.paragraphs[index],text)
rev=doc.tables[0]
while len(rev.rows)>2: rev._tbl.remove(rev.rows[-1]._tr)
for cell,text in zip(rev.rows[1].cells,['V0.1','2026-10-13','全部','G6-04事实/偏差、AI证据、技术债与归档送审；未冻结','何思源']):
    helper.set_text(cell.paragraphs[0],text)
cut=list(doc._element.body).index(doc.paragraphs[19]._p)
for element in list(doc._element.body)[cut:]:
    if element.tag!=qn('w:sectPr'): doc._element.body.remove(element)
blocks=helper.parse_markdown(SOURCE)
for block in blocks:
    kind=block['type']
    if kind=='table':
        helper.add_table(doc,block['caption'],block['headers'],block['rows'],proto['caption'],reference.tables[1])
        table=doc.tables[-1]
        table.autofit=False
        widths=[1.4,1.7,3.15] if '1-1' in block['caption'] else [1.4,1.7,3.15]
        for col,width in zip(table.columns,widths): col.width=Inches(width)
        for row in table.rows:
            for cell,width in zip(row.cells,widths): cell.width=Inches(width)
        continue
    role='heading'+str(block['level']) if kind=='heading' else 'list' if kind=='list' else 'normal'
    text=block.get('text','').replace('`','')
    p=helper.add_like(doc,proto[role],text)
    if kind=='heading':
        pr=p._p.pPr
        if pr is not None:
            sec=pr.find(qn('w:sectPr'))
            if sec is not None: pr.remove(sec)
        p.paragraph_format.keep_with_next=True
    elif kind=='paragraph':
        # A source long project pathname should wrap naturally at line edge.
        p.paragraph_format.keep_with_next=False
for part in doc.part.package.parts:
    if str(part.partname).startswith(('/word/header','/word/footer')):
        for t in part._element.iter(qn('w:t')):
            if t.text: t.text=t.text.replace('澜图','应急管理').replace('LTPT','YJGL')
doc.save(TARGET)
with zipfile.ZipFile(REF) as r,zipfile.ZipFile(TARGET) as t:
    inherited={p:r.read(p)==t.read(p) for p in ['word/styles.xml','word/numbering.xml','word/theme/theme1.xml']}
    assert all(inherited.values()),inherited
manifest['packagePartsInherited']=inherited
manifest['sourceSha256']=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
(EVIDENCE/'document-pair-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'physicalCopy':True,'packagePartsInherited':inherited,'businessTables':2,'target':str(TARGET)},ensure_ascii=False))
