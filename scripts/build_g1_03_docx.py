from pathlib import Path
import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs' / 'work' / 'A_PM' / 'project_proposal.md'
OUT = ROOT / 'docs' / 'deliverables' / '01-项目建议书.docx'

def set_font(run, size=10.5, bold=False):
    run.font.name = '宋体'; run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
    run.font.size = Pt(size); run.font.bold = bold

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr(); shd = OxmlElement('w:shd'); shd.set(qn('w:fill'), fill); tcPr.append(shd)

def borders(table):
    tblPr = table._tbl.tblPr; el = OxmlElement('w:tblBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        e = OxmlElement(f'w:{edge}'); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'4'); e.set(qn('w:color'),'D9D9D9'); el.append(e)
    tblPr.append(el)

def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run('第 '); set_font(run, 9)
    fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'), 'PAGE')
    paragraph._p.append(fld)
    run = paragraph.add_run(' 页'); set_font(run, 9)

def add_para(doc, text, style=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text); set_font(r)
    return p

def add_table(doc, rows):
    t = doc.add_table(rows=0, cols=len(rows[0])); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.style = 'Table Grid'; borders(t)
    for ri, row in enumerate(rows):
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cells[i].paragraphs[0]; p.paragraph_format.space_after = Pt(2); p.paragraph_format.space_before = Pt(2)
            r = p.add_run(val); set_font(r, 9.5, ri == 0)
            if ri == 0:
                shade(cells[i], '1F4E78'); r.font.color.rgb = RGBColor(255,255,255)
    doc.add_paragraph()

def main():
    doc = Document(); sec = doc.sections[0]
    sec.page_width = Cm(21); sec.page_height = Cm(29.7)
    sec.top_margin = Cm(2.54); sec.bottom_margin = Cm(2.54); sec.left_margin = Cm(2.54); sec.right_margin = Cm(2.54)
    styles = doc.styles
    for name, sz in [('Normal',12),('Heading 1',16),('Heading 2',13),('Heading 3',12)]:
        s=styles[name]; s.font.name='宋体'; s._element.rPr.rFonts.set(qn('w:eastAsia'),'宋体'); s.font.size=Pt(sz); s.font.bold=name!='Normal'
    # header/footer
    sec.header.paragraphs[0].text = ''
    add_page_number(sec.footer.paragraphs[0])
    # cover
    for _ in range(5): doc.add_paragraph()
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; r=p.add_run('文档编号：【待人工确认】    版本号：V0.9'); set_font(r,12)
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; r=p.add_run('密  级：【待人工确认】'); set_font(r,12)
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run('某自然博物馆智能运营中心建设项目——应急管理子系统'); set_font(r,22,True); r.font.name='黑体'; r._element.rPr.rFonts.set(qn('w:eastAsia'),'黑体')
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run('项 目 建 议 书'); set_font(r,28,True); r.font.name='黑体'; r._element.rPr.rFonts.set(qn('w:eastAsia'),'黑体')
    for _ in range(7): doc.add_paragraph()
    for label,value in [('编制单位','【待人工确认】'),('编制','A（项目经理 PM / 总编）'),('审核','C（符合性复核）'),('批准','【待人工确认】'),('编制日期','2026 年 9 月 10 日')]:
        p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(f'{label}：{value}'); set_font(r,12)
    doc.add_page_break()
    # parse Markdown preserving material content
    lines=SOURCE.read_text(encoding='utf-8').splitlines(); i=0; table=[]
    while i < len(lines):
        line=lines[i]
        if line.startswith('# '): i+=1; continue
        if line.startswith('## '):
            if table: add_table(doc,table); table=[]
            doc.add_heading(line[3:],1)
        elif line.startswith('### '):
            if table: add_table(doc,table); table=[]
            doc.add_heading(line[4:],2)
        elif line.startswith('|'):
            vals=[x.strip() for x in line.strip('|').split('|')]
            if not all(re.fullmatch(r'[- :]+',x) for x in vals): table.append(vals)
        elif line.strip()=='' :
            if table: add_table(doc,table); table=[]
        elif line.startswith('- '):
            if table: add_table(doc,table); table=[]
            p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.line_spacing=1.5; r=p.add_run(line[2:]); set_font(r)
        else:
            if table: add_table(doc,table); table=[]
            p=add_para(doc,line); p.paragraph_format.first_line_indent=Cm(0.74); p.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
        i+=1
    if table: add_table(doc,table)
    OUT.parent.mkdir(parents=True,exist_ok=True); doc.save(OUT)

if __name__ == '__main__': main()
