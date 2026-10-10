# G5-03 template contract
Reference: docs/reference/36-测试报告（教学样例）.docx, physical copy for all four reports.
Unique Pair: 测试报告. Other three: explicit fallback OVR-036, no claim of unique Pair.
Preserve: three sections, exact sectPr; cover paragraph pPr/rPr, revision-table controls, TOC SDT and fields, headers/footers, style/theme/numbering definitions.
Slots: 0/1 metadata; 3 project; 4 title; 5 subtitle; 7–11 author/reviewer/date. Replace real project fields only; pending C/approval is not a signature.
Revision: one real V0.1 event 2026-10-11. Remove case history rows.
Body: replace instructional case chapters using actual source body/heading/caption properties; tables map source tblPr/tcPr/pPr with adaptive business grids, repeat header and cantSplit. Case drawings removed as business slots; no new engineering figures.
TOC: physically retained; native Word updates TOC and fields before final render. Cache differences are permitted only for automatic fields. No stale teaching-case TOC permitted.
Renderer: bundled render_docx.py + installed LibreOffice; reference and final same renderer. Inspect every page; native Word update is separate from rendering and not a LibreOffice save.
Fidelity: exact physical Reference bytes unchanged; source styles/theme/numbering preserved during initial authoring; Word-native field refresh may serialise OOXML and must be recorded. All business paragraphs and table values identical to Markdown block source.
