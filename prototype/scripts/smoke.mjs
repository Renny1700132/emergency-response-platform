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
assert.equal(actions.closeIncident(report.event.id).ok,true)
assert.equal(report.event.status,'已关闭')

assert.equal(actions.advanceDrill().ok,true)
assert.equal(actions.advanceDrill('完成演练').ok,true)
assert.equal(actions.advanceDrill().ok,true)
assert.equal(state.drill.status,'已完成')

assert.equal(actions.checkin(false).ok,false)
assert.equal(actions.checkin(true).ok,true)
assert.equal(actions.submitInventory(22).ok,true)
assert.equal(state.inventory.difference,-2)
assert.equal(actions.reviewInventory().ok,true)
assert.equal(state.inventory.bookQuantity,22)

console.log('G2-P03 smoke PASS: event, task, drill, check-in and inventory loops')
