import assert from 'node:assert/strict'
import {actions,state} from '../src/domain/prototypeStore.js'

actions.reset()
const report=actions.reportIncident({title:'烟雾模拟事件',type:'消防告警',location:'测试展厅',description:'烟测'})
assert.equal(report.ok,true)
assert.equal(report.event.status,'待核实')
assert.equal(actions.verifyIncident(report.event.id).ok,true)
assert.equal(report.event.status,'已核实')
assert.equal(actions.startIncident(report.event.id).ok,true)
const generated=state.tasks.filter(item=>item.eventId===report.event.id)
assert.equal(generated.length,2)
for(const task of generated){
  assert.equal(actions.acceptTask(task.id).ok,true)
  assert.equal(actions.feedbackTask(task.id,'已完成现场处置').ok,true)
  assert.equal(actions.completeTask(task.id).ok,true)
}
assert.equal(actions.closeIncident(report.event.id).ok,false,'关闭材料未完成时必须拒绝关闭')
assert.equal(actions.submitClosure(report.event.id,{evaluation:'',investigation:'原因已核实',reportTitle:'模拟报告'}).ok,false,'关闭材料缺项时必须拒绝保存')
assert.equal(actions.submitClosure(report.event.id,{evaluation:'处置有效',investigation:'模拟调查记录',reportTitle:'事件处置报告（模拟）',knowledgeNote:'展厅烟感处置要点'}).ok,true)
assert.equal(report.event.closure.status,'材料已完成')
assert.equal(actions.closeIncident(report.event.id).ok,true)
assert.equal(report.event.status,'已关闭')

assert.equal(actions.advanceDrill().ok,true)
assert.equal(actions.advanceDrill('完成演练').ok,true)
assert.equal(actions.advanceDrill().ok,true)
assert.equal(state.drill.status,'已完成')

assert.equal(actions.checkin(false).ok,false)
assert.equal(actions.checkin(true).ok,true)
assert.equal(actions.detectAttendanceException().ok,true)
assert.equal(state.attendanceAlerts[0].type,'缺卡/超时')
assert.equal(state.notificationRecords[0].status,'Mock 发送失败 / 待重试')
assert.equal(actions.retryAttendanceNotification(state.attendanceAlerts[0].id).ok,true)
assert.equal(state.attendanceAlerts[0].status,'人工处置')
assert.equal(state.notificationRecords[0].attempts,2)

assert.equal(actions.submitInventory(22).ok,true)
assert.equal(state.inventory.difference,-2)
assert.equal(actions.reviewInventory().ok,true)
assert.equal(state.inventory.bookQuantity,22)

console.log('G2-P03 remediation smoke PASS: closure gate and attendance alert/retry included')
