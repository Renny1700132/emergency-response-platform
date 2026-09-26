import { reactive } from 'vue'

export type DemoRecord = { id: string; version: number; status: string; attributes: Record<string, unknown> }

export const demoRoles = [
  { id: 'COMMANDER', name: '应急指挥员', short: '指', team: '应急指挥中心' },
  { id: 'SECURITY', name: '现场安保员', short: '安', team: '安保一组' },
  { id: 'SUPPORT', name: '物资保障员', short: '保', team: '物资保障组' },
] as const

const initialIncidents = (): DemoRecord[] => [
  { id: 'EVT-20260926-001', version: 4, status: 'RESPONDING', attributes: { title: '东展厅烟感异常', description: '二层东展厅烟感与温度传感器联动告警，现场人员已到位。', occurredAt: '2026-09-26T05:42:00.000Z', attachmentFileIds: ['FILE-现场照片-01'] } },
  { id: 'EVT-20260926-002', version: 2, status: 'PENDING_VERIFY', attributes: { title: '文创区客流密度预警', description: '客流达到预警阈值，等待值班负责人核实。', occurredAt: '2026-09-26T06:08:00.000Z', attachmentFileIds: [] } },
  { id: 'EVT-20260925-006', version: 8, status: 'CLOSED', attributes: { title: '地下库房漏水巡检', description: '已完成阀门处置和现场复核。', occurredAt: '2026-09-25T08:20:00.000Z', attachmentFileIds: ['FILE-处置报告-06'] } },
]
const initialTasks = (): DemoRecord[] => [
  { id: 'TSK-260926-01', version: 3, status: 'IN_PROGRESS', attributes: { name: '疏散东展厅游客', assigneeRef: '安保一组', deadlineAt: '2026-09-26T06:00:00.000Z', progressPercent: 70 } },
  { id: 'TSK-260926-02', version: 2, status: 'ACKNOWLEDGED', attributes: { name: '确认消防通道状态', assigneeRef: '设备保障组', deadlineAt: '2026-09-26T06:05:00.000Z', progressPercent: 45 } },
  { id: 'TSK-260926-03', version: 1, status: 'PENDING', attributes: { name: '准备临时警戒物资', assigneeRef: '物资保障组', deadlineAt: '2026-09-26T06:10:00.000Z', progressPercent: 0 } },
]

export const presentationState = reactive({
  activeRoleId: 'COMMANDER',
  incidents: initialIncidents(),
  tasks: initialTasks(),
  revision: 0,
  lastAction: '演示会话已就绪',
  lastActor: '应急指挥员',
})

let channel: BroadcastChannel | undefined
const instanceId = globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random()}`
const snapshot = () => JSON.parse(JSON.stringify({ activeRoleId: presentationState.activeRoleId, incidents: presentationState.incidents, tasks: presentationState.tasks, revision: presentationState.revision, lastAction: presentationState.lastAction, lastActor: presentationState.lastActor }))
const publish = (payload: Record<string, unknown>) => {
  try { channel?.postMessage(payload) } catch { /* 单标签页继续可用，广播失败不阻断演示操作。 */ }
}

export const activeDemoRole = () => demoRoles.find((role) => role.id === presentationState.activeRoleId) ?? demoRoles[0]

export function enablePresentationSync() {
  if (channel || typeof BroadcastChannel === 'undefined') return
  channel = new BroadcastChannel('museum-emergency-presentation-session')
  channel.onmessage = ({ data }) => {
    if (!data || data.source === instanceId) return
    if (data.type === 'request') { publish({ ...snapshot(), type: 'state', source: instanceId }); return }
    if (data.type !== 'state') return
    presentationState.activeRoleId = String(data.activeRoleId ?? presentationState.activeRoleId)
    presentationState.incidents.splice(0, presentationState.incidents.length, ...(data.incidents ?? []))
    presentationState.tasks.splice(0, presentationState.tasks.length, ...(data.tasks ?? []))
    presentationState.revision = Number(data.revision ?? presentationState.revision)
    presentationState.lastAction = String(data.lastAction ?? presentationState.lastAction)
    presentationState.lastActor = String(data.lastActor ?? presentationState.lastActor)
  }
  publish({ type: 'request', source: instanceId })
}

export function commitPresentationChange(action: string) {
  presentationState.revision += 1
  presentationState.lastAction = action
  presentationState.lastActor = activeDemoRole().name
  publish({ ...snapshot(), type: 'state', source: instanceId })
}

export function switchDemoRole(roleId: string) {
  if (!demoRoles.some((role) => role.id === roleId)) return
  presentationState.activeRoleId = roleId
  commitPresentationChange('切换演示角色')
}

export function resetPresentationState() {
  presentationState.activeRoleId = 'COMMANDER'
  presentationState.incidents.splice(0, presentationState.incidents.length, ...initialIncidents())
  presentationState.tasks.splice(0, presentationState.tasks.length, ...initialTasks())
  presentationState.revision = 0
  presentationState.lastAction = '演示会话已就绪'
  presentationState.lastActor = '应急指挥员'
}
