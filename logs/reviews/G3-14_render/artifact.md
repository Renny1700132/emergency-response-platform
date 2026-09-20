# G3-14 Reference distillation contract

- Reference: `E:/ZongHeShiXi/emergency-response-platform/docs/reference/25-风险管理计划与风险登记册v2（教学样例）.docx`
- SHA-256: `86107A89B0BD1BBCDF4626A3725EFF457F2C85AE73D70B0A74F338921372BAAA`
- Size: 55,094 bytes; Word render: 8 pages; section count: 1.
- Evidence: `reference.pdf`, `reference-page-1.png`—`reference-page-8.png`, `format_pair.json`, `style_lint.json`.

## Page and component system

Reference patterns are: cover; revision record; independent TOC; portrait body with running header/footer and logical page numbering; compact risk tables; chapter/subchapter hierarchy. The working copy preserves the page setup, section properties, styles, header/footer relationships, numbering definitions, theme and table visual treatment.

## Slot map and content flow

- Cover metadata, project/title/version, compiler/reviewer/approver/date: rewrite for G3-14.
- Revision table: retain structure and rewrite with one auditable V0.1 event.
- TOC content control: replace with static dotted-leader entries matching the new body.
- Reference body beginning at `1 风险管理方法`: remove in the working copy and replace with project-specific chapters 1—9.
- Header: rewrite project/document name; footer and page fields: preserve.
- Teaching image and all teaching project facts: remove; no unsupported visual slot is reused.

## Tables and fidelity gates

Tables retain the Reference visual system, repeated header treatment and cell margins. Wide risk data is split across a high/extreme register and a continuous-monitoring register to preserve portrait readability. Fidelity gates are: Reference hash unchanged; same physical source copied before editing; cover/revision/TOC/body page patterns retained; no teaching-project facts; no clipped or overlapping content; every page rendered with the same Word renderer.

## Package preservation

The copy-based build preserves styles, numbering, theme, headers, footers, relationships and section settings. Body paragraphs/tables and the TOC content control are the only intentional rewrites; the teaching image relationship is not used in the new body. `format_pair.json` records the resulting package/style comparison.
