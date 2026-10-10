import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const readJson = async (relativePath) => JSON.parse(await readFile(new URL(relativePath, root), 'utf8'))

const raw = await readJson('evidence/g5/G5-01/functional-gate-raw.json')
const course = await readJson('evidence/g5/G5-01/course-conditional-acceptance.json')

assert.equal(course.taskId, 'G5-01')
assert.equal(course.decisionId, 'OVR-035')
assert.equal(course.status, 'COURSE_CONDITIONAL_ACCEPTANCE_PENDING_A')
assert.equal(course.classification, 'CONDITIONAL_ACCEPTANCE_RECORD')
assert.equal(course.userAuthorization, '现在完成01的后续任务，采用单独的课程条件验收裁决即可')
assert.equal(raw.overall, 'BLOCKED')
assert.deepEqual(course.truthSnapshot.acResults, raw.resultSummary)
assert.deepEqual(course.truthSnapshot.starResults, raw.starSummary)
assert.equal(Object.values(raw.resultSummary).reduce((sum, value) => sum + value, 0), 117)
assert.equal(Object.values(raw.starSummary).reduce((sum, value) => sum + value, 0), 34)
assert.equal(course.deferredScope.implementationDeferred.requirements.length, 10)
assert.equal(course.deferredScope.implementationDeferred.acceptanceCriteria, 30)
assert.equal(course.deferredScope.implementationDeferred.realStatus, 'IMPLEMENTATION_DEFERRED')
assert.equal(course.deferredScope.evidenceDeferred.notRunAcceptanceCriteria, raw.resultSummary.NOT_RUN)
assert.equal(
  course.deferredScope.evidenceDeferred.otherBlockedAcceptanceCriteria +
    course.deferredScope.implementationDeferred.acceptanceCriteria,
  raw.resultSummary.BLOCKED,
)
assert.equal(course.deferredScope.evidenceDeferred.realStatus, 'EVIDENCE_DEFERRED')
assert.equal(course.deferredScope.realWorldDeferred.realStatus, 'REAL_WORLD_DEFERRED')
assert.equal(course.review.requiredReviewer, 'A')
assert.equal(course.review.status, 'PENDING_A_FINAL_REVIEW')
assert.ok(course.notAcceptedFor.includes('marking G5-01 DONE before A final review'))
assert.equal(course.unconditionalRealWorldPass, false)

console.info(JSON.stringify({
  taskId: course.taskId,
  status: 'PASS_WITH_COURSE_WAIVERS_PENDING_A',
  realAcResults: course.truthSnapshot.acResults,
  realStarResults: course.truthSnapshot.starResults,
  implementationDeferredAc: course.deferredScope.implementationDeferred.acceptanceCriteria,
  evidenceDeferredAc:
    course.deferredScope.evidenceDeferred.notRunAcceptanceCriteria +
    course.deferredScope.evidenceDeferred.otherBlockedAcceptanceCriteria,
  realWorldDeferredItems: course.deferredScope.realWorldDeferred.items.length,
  unconditionalRealWorldPass: course.unconditionalRealWorldPass,
}, null, 2))
