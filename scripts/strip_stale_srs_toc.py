import os
import tempfile
import zipfile
from copy import deepcopy
from pathlib import Path
from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
PATH = Path(os.environ.get('G2_R03_SRS_TOC_PATH', ROOT / 'docs' / 'deliverables' / '08-软件需求规格说明书SRS.docx'))
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

fd, temp_name = tempfile.mkstemp(suffix='.docx', dir=PATH.parent)
os.close(fd)
temp = Path(temp_name)
try:
    with zipfile.ZipFile(PATH, 'r') as src, zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED) as dst:
        for info in src.infolist():
            data = src.read(info.filename)
            if info.filename == 'word/document.xml':
                root = etree.fromstring(data)
                stale = [sdt for sdt in root.xpath('.//w:sdt', namespaces=NS) if 'M-01 项目与会话管理' in ''.join(sdt.itertext())]
                if len(stale) != 1:
                    raise RuntimeError(f'expected one stale TOC content control, found {len(stale)}')
                # Preserve the reference-document TOC title formatting while
                # discarding only the stale teaching-case TOC entries.
                title_paragraphs = [
                    p for p in stale[0].xpath('.//w:p', namespaces=NS)
                    if ''.join(p.itertext()).strip() == '目 录'
                ]
                title = deepcopy(title_paragraphs[0]) if title_paragraphs else None
                # The original title paragraph closes the preceding section.
                # Keeping that section boundary would place the title on the
                # prior page after the stale TOC is removed.
                if title is not None:
                    for sect_pr in title.xpath('./w:pPr/w:sectPr', namespaces=NS):
                        sect_pr.getparent().remove(sect_pr)
                stale[0].getparent().remove(stale[0])

                body = root.find('.//w:body', namespaces=NS)
                toc_first = next(
                    (p for p in body.xpath('./w:p', namespaces=NS)
                     if '3.5 非MVP范围与承接关系' in ''.join(p.itertext())),
                    None,
                )
                if title is not None and toc_first is not None:
                    toc_index = list(body).index(toc_first)
                    body.insert(toc_index, title)
                    # A section boundary is attached to the paragraph that
                    # *ends* the prior section.  In the source it was on the
                    # first TOC-entry paragraph, which leaves the inserted
                    # title behind on the revision-record page.  Move it to
                    # the preceding note so the title and entries form the
                    # same TOC section.
                    toc_sect = toc_first.xpath('./w:pPr/w:sectPr', namespaces=NS)
                    previous = title.getprevious()
                    if toc_sect and previous.tag == '{%s}p' % NS['w']:
                        toc_sect[0].getparent().remove(toc_sect[0])
                        previous_ppr = previous.find('./w:pPr', namespaces=NS)
                        if previous_ppr is None:
                            previous_ppr = etree.Element('{%s}pPr' % NS['w'])
                            previous.insert(0, previous_ppr)
                        previous_ppr.append(toc_sect[0])
                    # Defensive repeat: the cloned reference title must never
                    # retain a section boundary of its own.
                    for sect_pr in title.xpath('./w:pPr/w:sectPr', namespaces=NS):
                        sect_pr.getparent().remove(sect_pr)

                # The surviving (non-SDT) title and first static entry can
                # still carry the source TOC's split-section properties.
                # Remove those properties so the heading is not separated
                # from its entries by a blank page.
                for paragraph in body.xpath('./w:p', namespaces=NS):
                    if ''.join(paragraph.itertext()).strip() == '目 录' or '3.5 非MVP范围与承接关系' in ''.join(paragraph.itertext()):
                        for sect_pr in paragraph.xpath('./w:pPr/w:sectPr', namespaces=NS):
                            sect_pr.getparent().remove(sect_pr)

                # The regenerated static TOC spans two pages.  Mark its
                # continuation explicitly so it cannot be mistaken for body
                # content during visual review.
                toc_continue = next(
                    (p for p in body.xpath('./w:p', namespaces=NS)
                     if '3.6 核心业务流程' in ''.join(p.itertext())),
                    None,
                )
                if toc_continue is not None:
                    continuation = etree.Element('{%s}p' % NS['w'])
                    ppr = etree.SubElement(continuation, '{%s}pPr' % NS['w'])
                    etree.SubElement(ppr, '{%s}jc' % NS['w'], val='center')
                    run = etree.SubElement(continuation, '{%s}r' % NS['w'])
                    etree.SubElement(run, '{%s}t' % NS['w']).text = '目 录（续）'
                    body.insert(list(body).index(toc_continue), continuation)
                data = etree.tostring(root, encoding='UTF-8', xml_declaration=True, standalone=True)
            dst.writestr(info, data)
    os.replace(temp, PATH)
finally:
    if temp.exists():
        temp.unlink()
print(PATH)
