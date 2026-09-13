# Formal Deliverable FORMAT ONLY Audit — 04 / 05 / 06

- Task: `G1-17-FMT-VISUAL-040506`
- Operator: 何思源（A）
- Mode: `FORMAT ONLY`
- Renderer: WPS COM → PDF → Poppler PNG; each Reference/Deliverable pair used the same renderer.
- Content rule: ordered body paragraphs, table cells, captions, headers and footers were frozen before direct-format mapping. Automatic Word field caches are the only declared exclusion.

## 04 — 风险登记册 v1

- Reference: `docs/reference/04-风险登记册v1（教学样例）.docx`
- Manifest: page / section / margins / header-footer distance / Heading 1—3 / Normal / tables / captions / image physical size / headers-footers = `MATCH`; cover and revision-record roles = `MATCH` after direct `pPr`/`rPr` and `tblPr`/`trPr`/`tcPr` mapping.
- 修复项: direct-copy/mapping of Reference `sectPr`, style inheritance, paragraph/run direct properties, table properties, header/footer properties and same-role image width; retained frozen table grid where business columns differ.
- STRUCTURAL_DEVIATION: Deliverable has 3 tables and 9 rendered pages; Reference has 2 tables and 5 pages. The extra risk linkage table and its rows are frozen project content and were not deleted, combined or reworded.
- CONTENT_FREEZE_CHECK: `PASS` — `1B697A57227CB1D6775E666402F81234221992C6FA125988C6D9B74C8ED1F07B` before = after.
- Render Review: 9 + 5 pages inspected side by side; no clipping, overlap, table overflow, blurred figure, caption, header/footer or page-number defect.
- Final Status: `PASS`

## 05 — 需求确认书

- Reference: `docs/reference/05-需求确认书（教学样例）.docx`
- Manifest: page / section / margins / header-footer distance / Heading 1—3 / Normal / tables / captions / image physical size / headers-footers = `MATCH`; cover, revision-record, body and signature visual roles = `MATCH` after Reference-property mapping.
- 修复项: direct-copy/mapping of Reference `sectPr`, styles/basedOn-level properties, paragraph/run direct properties, table `tblPr`/`trPr`/`tcPr`, caption treatment, header/footer presentation and figure width.
- STRUCTURAL_DEVIATION: Deliverable has 4 tables and 7 rendered pages; Reference has 3 tables and 5 pages. Frozen MVP confirmation detail and signature content require the additional table/page structure; no business rows, columns or sections were changed.
- CONTENT_FREEZE_CHECK: `PASS` — `509F91CE62B7E11816563169F20F680DAED75E6CE15F440B502D86EA3420A8C5` before = after.
- Render Review: 7 + 5 pages inspected side by side; no clipping, overlap, table overflow, blurred figure, caption, header/footer or page-number defect.
- Final Status: `PASS`

## 06 — 述标答辩讲稿与策略

- Reference: `docs/reference/06-述标答辩讲稿与策略（教学样例）.docx`
- Manifest: page / section / margins / header-footer distance / Heading 1—3 / Normal / tables / captions / image physical size / headers-footers = `MATCH`; cover, independent date page, revision-record and body visual roles = `MATCH` after Reference-property mapping.
- 修复项: direct-copy/mapping of Reference `sectPr`, styles/basedOn-level properties, front-matter and body `pPr`/`rPr`, table `tblPr`/`trPr`/`tcPr`, caption presentation, header/footer presentation and time-allocation figure size.
- STRUCTURAL_DEVIATION: Deliverable has 3 tables and 9 rendered pages; Reference has 2 tables and 5 pages. The independent date page and frozen project speech/Q&A/strategy material remain as controlled content; they were not removed, merged, added or reworded.
- CONTENT_FREEZE_CHECK: `PASS` — `13DD9A699E388390A2B581F445467553148367AF08EFDDC2AC0681744178A33C` before = after.
- Render Review: 9 + 5 pages inspected side by side; no clipping, overlap, table overflow, blurred figure, caption, header/footer or page-number defect.
- Final Status: `PASS`

## Closure

All three files passed. This audit does not treat a different frozen business structure or page count as permission to change content. No version number or revision-record text was modified.
