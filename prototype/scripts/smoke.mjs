import assert from 'node:assert/strict'
import {actions,state} from '../src/domain/prototypeStore.js'

actions.reset()
const reported=actions.reportIncident({title:'演示烟感告警',type:'消防告警',location:'测试展厅',description:'烟测事件'},'Web')
assert.equal(reported.ok,true)
assert.equal(actions.verifyIncident(reported.event.id).ok,true)
assert.equal(actions.startIncident(reported.event.id,'PLAN-FIRE-001').ok,true)
const generated=state.tasks.filter(t=>t.eventId===reported.event.id)
assert.equal(generated.length,2)
assert.equal(generated.every(t=>t.id.startsWith('TASK-')),true)
for(const t of generated){assert.equal(actions.acceptTask(t.id).ok,true);assert.equal(actions.feedbackTask(t.id,'现场已处理').ok,true);assert.equal(actions.completeTask(t.id).ok,true)}
assert.equal(actions.addUpdate(reported.event.id,'现场秩序稳定').ok,true)
assert.equal(actions.submitClosure(reported.event.id,{evaluation:'处置有效',investigation:'已核查原因',reportTitle:'事件处置报告',knowledgeNote:'现场处置要点'}).ok,true)
assert.equal(actions.closeIncident(reported.event.id).ok,true)
const drill=state.drills[0]
assert.equal(actions.startDrill(drill.id).ok,true)
assert.equal(actions.submitDrill(drill.id,'集合完成').ok,true)
assert.equal(actions.evaluateDrill(drill.id,'满足演练目标').ok,true)
assert.equal(actions.checkin(true).ok,true)
assert.equal(actions.detectAttendanceException().ok,true)
assert.equal(actions.retryAttendance(state.attendanceAlerts[0].id).ok,true)
assert.equal(actions.resolveAttendance(state.attendanceAlerts[0].id).ok,true)
const plan=state.inventoryPlans[0]
assert.equal(actions.submitInventory(plan.id,22).ok,true)
assert.equal(actions.reviewInventory(plan.id).ok,true)
assert.equal(state.materials.find(x=>x.id===plan.materialId).quantity,22)
console.log('G2-P05 smoke PASS: event, plan, task, drill, attendance and inventory flows')
