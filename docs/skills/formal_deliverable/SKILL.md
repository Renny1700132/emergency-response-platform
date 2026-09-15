---
name: formal-deliverable-visual-alignment
description: Govern generation and revision of controlled formal DOCX/PDF deliverables, with pair-specific OOXML inheritance, direct-format inspection and rendered visual comparison.
---

# Formal Deliverable Visual Alignment

## Scope and mode gate

Use this skill for every formal deliverable intended for `docs/deliverables/` or for a client, teacher, reviewer or acceptance audience. Read `AGENTS.md`, the logging and Git workflows, and `docs/deliverables/SKILL.md` first. Then declare exactly one mode:

| Mode | Use when | Required boundary |
|---|---|---|
| NEW DOCUMENT | A formal deliverable does not yet exist | Controlled work source → Reference pair → formal document → render QA |
| CONTENT EDIT | Business text, requirements, figures, numbers, conclusions or chapter content changes | Update controlled work source first, then formal document and review evidence |
| FORMAT ONLY | Only visual layout is requested | Freeze all visible content; change only visual properties of existing elements |
| CONTENT + FORMAT | Both are requested | Finish and evidence the content stage, make a new freeze point, then run FORMAT ONLY |

Do not let a formatting request alter business content, chapter organization, table business information, captions, header/footer text, figure information, version number or revision-record text. Word automatic field caches are the only permitted comparison exclusion and must be named in the audit.

## One Pair, one manifest, one renderer

For each Deliverable ↔ Reference pair, find one unique corresponding DOCX under `docs/reference/`. If no unique pair exists, stop and record the missing template; never invent a similar design.

Before a change, create a pair-specific manifest that evaluates **every item** below as `MATCH` or `MISMATCH`:

- physical page size, orientation, margins, header/footer distances and section break locations;
- cover, independent date page, revision-record page, TOC, body-start page and signature layout when the Reference contains them;
- `sectPr`, section header/footer references, styles, `basedOn`, `docDefaults`, theme and numbering;
- paragraph `pPr`, run `rPr`, direct paragraph formatting and direct run formatting;
- table `tblPr`, `tblGrid`, `trPr`, `tcPr`, row header/repeat and cross-page settings;
- captions, headers, footers, page-number formatting and fields;
- image physical dimensions, anchor/inline position, alignment and surrounding whitespace;
- renderer/page-level visual result, listed page by page.

Style ID equality alone is never evidence of a match. Resolve the effective format through `Style + basedOn + docDefaults + theme + paragraph direct formatting + run direct formatting`. Empty top-level style attributes may be inherited; they must not be treated as “no requirement”.

## Direct inheritance: do not re-guess a template

The Reference is a template, not a style suggestion. When a unique pair exists, prefer copying or mapping its actual OOXML properties to a like-for-like existing Deliverable element:

- section `sectPr` and linked header/footer references;
- paragraph `pPr` and run `rPr`;
- `tblPr`, `tblGrid`, `trPr` and `tcPr`;
- `styles.xml`, inheritance / `basedOn`, `docDefaults`, theme and numbering definitions;
- header/footer part properties and page-number formatting.

Do not reconstruct a format from approximate rules such as “Songti 12 pt, heading 16 pt”. Copy the pair’s actual property where a matching element exists. Preserve visible text and element order during a FORMAT ONLY operation.

When the business document has a different number of columns, rows, paragraphs or pages, map a same-role Reference element’s visual properties while retaining the frozen content geometry. Do not delete, split, combine, move, add or reword business elements merely to equalise page count.

## FORMAT ONLY structural boundary

In `FORMAT ONLY`:

1. Extract ordered paragraphs, table cells, captions, headers, footers and verifiable figure text before editing.
2. Permit only existing-element visual fixes: section/page properties, style/direct formatting, pagination controls, table geometry/visual properties, existing image size/position, caption presentation and header/footer/page-number presentation.
3. Re-extract with the same normalisation after editing. `CONTENT_FREEZE_CHECK = PASS` requires exact equality except explicitly excluded automatic Word-field caches.
4. If the Reference has content structure that the Deliverable lacks or the Deliverable has frozen additional structure, record `STRUCTURAL_DEVIATION`. Do not repair it under FORMAT ONLY.

Only a user instruction explicitly authorising chapter/structure reconstruction may upgrade the work to `CONTENT/STRUCTURE EDIT`.

## Mandatory serial visual loop

Process one document at a time, without a batch pass claim:

`Reference inspection → Pair manifest → format modification → content freeze check → same-renderer PDF/PNG render → page-by-page side-by-side visual diff → correction if needed → re-render → PASS/FAIL`

Render both files using the same renderer. Inspect every final rendered page side by side for clipping, overlap, font substitution, misaligned cover blocks, bad table wrapping/borders, broken captions, incorrect image size/position, header/footer/page-number errors, orphan headings and unexpected whitespace. OOXML inspection alone is insufficient. “Basically consistent”, “overall close” and “does not affect reading” are never PASS reasons.

## Evidence and closure

The audit must record, separately for every document:

- full Reference path and manifest results;
- every actual fix and direct-inheritance source;
- each `STRUCTURAL_DEVIATION`;
- before/after content hashes and `CONTENT_FREEZE_CHECK`;
- renderer, page counts and page-level visual review;
- final status, strictly `PASS` or `FAIL`.

Keep business content traceable to `docs/work/` and controlled project sources. Teaching examples supply format only and must never contaminate project facts. Check revision records against real Prompt/Review/Git evidence; do not fabricate version events. Commit only task-related Skill, deliverable, audit and logging evidence after staged-diff checks; fetch/merge safely and non-force push `origin/master`.

## Captions and figure/table-number QA

Treat captions as mandatory deliverable structure, not decoration. Every independently meaningful business table, figure, flow, architecture diagram, ER/UML/data-flow diagram, Gantt chart, screenshot or other illustration must have one adjacent Caption. Layout-only cover/revision key-value tables are exempt only where the unique Reference uses no caption.

Inherit the Reference numbering style first. If the Reference is silent, use `表 X-Y 表名` and `图 X-Y 图名`, with X as chapter and Y as in-chapter sequence. Audit each document after every create/edit for table count, image/shape count, caption count, required-caption coverage, duplicate/skip numbering, caption adjacency, and valid body references. Render final pages and inspect that no caption is separated from its object. Record counts and PASS/FAIL in the document QA; XML-only Caption detection is insufficient.
