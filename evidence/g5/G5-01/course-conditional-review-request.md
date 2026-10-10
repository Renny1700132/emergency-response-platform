# G5-01 A 最终课程条件验收请求

- 主责：C（任俊强）。
- 指定 Review：A（何思源 / @WhiteApricot）。
- 裁决：OVR-035 / CHG-G5-01-001。
- Review 状态：`COURSE_CONDITIONAL_ACCEPTANCE_PENDING_A`。
- 候选结论：`DONE（COURSE_CONDITIONAL_ACCEPTANCE / IMPLEMENTATION_AND_REAL_WORLD_DEFERRED）`，仅 A 接受后生效。

## 请 A 核对

1. 真实结果是否原样保留为 11 PASS / 59 NOT_RUN / 47 BLOCKED、★FR 1 PASS / 33 BLOCKED，且原始 `functional-gate-raw.json` 仍为 `overall=BLOCKED`；
2. G2-FR-030—039 的 30 个 AC 是否仅标记 `COURSE_DEFERRED / IMPLEMENTATION_DEFERRED`，未写成已实现或 PASS；
3. 其余 59 NOT_RUN / 17 BLOCKED 是否仅标记 `EVIDENCE_DEFERRED`，Chrome/Edge 双版本、Android/iOS 宿主、KN-039 真实用户及目标环境依赖是否继续为 `REAL_WORLD_DEFERRED`；
4. ISSUE-G5-01-003/004/005 是否保持既有 `CLOSED / VERIFIED_BY_A`，未用本裁决重写历史；
5. G5-03 是否被要求同时展示课程准出和未实现/未执行/真实世界延期，禁止出现 117/117、34/34 或无条件生产 PASS 表述。

## C 自检结论

`node scripts/g5/validate-functional-course-acceptance.mjs` 必须返回 `PASS_WITH_COURSE_WAIVERS_PENDING_A`，并显示 `unconditionalRealWorldPass=false`。在 A 留下独立接受结论前，C 不把 G5-01 自行标为 DONE。
