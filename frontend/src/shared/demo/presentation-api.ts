import type { ApiClient } from '@/shared/http/api-client'

type RecordValue = Record<string, unknown>
const now = () => new Date().toISOString()
const envelope = (data: unknown) => ({ code: 'OK', message: '演示请求成功', timestamp: now(), traceId: 'demo-trace-20260926', data })

const incidents: RecordValue[] = [
  { id: 'EVT-20260926-001', version: 4, status: 'RESPONDING', attributes: { title: '东展厅烟感异常', description: '二层东展厅烟感与温度传感器联动告警，现场人员已到位。', occurredAt: '2026-09-26T05:42:00.000Z', attachmentFileIds: ['FILE-现场照片-01'] } },
  { id: 'EVT-20260926-002', version: 2, status: 'PENDING_VERIFY', attributes: { title: '文创区客流密度预警', description: '客流达到预警阈值，等待值班负责人核实。', occurredAt: '2026-09-26T06:08:00.000Z', attachmentFileIds: [] } },
  { id: 'EVT-20260925-006', version: 8, status: 'CLOSED', attributes: { title: '地下库房漏水巡检', description: '已完成阀门处置和现场复核。', occurredAt: '2026-09-25T08:20:00.000Z', attachmentFileIds: ['FILE-处置报告-06'] } },
]
const tasks: RecordValue[] = [
  { id: 'TSK-260926-01', version: 3, status: 'IN_PROGRESS', attributes: { name: '疏散东展厅游客', assigneeRef: '安保一组', deadlineAt: '2026-09-26T06:00:00.000Z', progressPercent: 70 } },
  { id: 'TSK-260926-02', version: 2, status: 'ACKNOWLEDGED', attributes: { name: '确认消防通道状态', assigneeRef: '设备保障组', deadlineAt: '2026-09-26T06:05:00.000Z', progressPercent: 45 } },
  { id: 'TSK-260926-03', version: 1, status: 'PENDING', attributes: { name: '准备临时警戒物资', assigneeRef: '物资保障组', deadlineAt: '2026-09-26T06:10:00.000Z', progressPercent: 0 } },
]
const update = (items: RecordValue[], id: string, status: string, attributes: RecordValue = {}) => {
  const item = items.find((entry) => entry.id === id)
  if (!item) return
  item.status = status
  item.version = Number(item.version ?? 0) + 1
  item.attributes = { ...(item.attributes as RecordValue), ...attributes }
}

export function createPresentationApiClient(): ApiClient {
  const execute = async (method: string, path: string, options: RecordValue = {}) => {
    const body = (options.body ?? {}) as RecordValue
    const params = (options.path ?? {}) as RecordValue
    if (path === '/api/v1/platform/context') return envelope({ userId: 'demo-commander', displayName: '应急指挥员', roles: ['COMMANDER'], permissions: ['plan:read', 'incident:read', 'incident:create', 'incident:verify', 'incident:start-response', 'task:read', 'task:create', 'task:acknowledge', 'task:feedback', 'task:remind', 'task:complete', 'situation:read', 'resource:read', 'drill:read', 'duty:read', 'attendance:write', 'inventory:write', 'knowledge:read', 'integration:read'] })
    if (path === '/api/v1/incidents' && method === 'get') return envelope({ items: incidents })
    if (path === '/api/v1/incidents' && method === 'post') { incidents.unshift({ id: `EVT-DEMO-${String(incidents.length + 1).padStart(3, '0')}`, version: 1, status: 'PENDING_VERIFY', attributes: { ...body } }); return envelope(incidents[0]) }
    if (path.includes('/verify')) update(incidents, String(params.incidentId), body.decision === 'REJECTED' ? 'REJECTED' : 'VERIFIED')
    if (path.includes('/start-response')) update(incidents, String(params.incidentId), 'RESPONDING')
    if (path === '/api/v1/tasks' && method === 'get') return envelope({ items: tasks })
    if (path === '/api/v1/tasks' && method === 'post') { tasks.unshift({ id: `TSK-DEMO-${String(tasks.length + 1).padStart(3, '0')}`, version: 1, status: 'PENDING', attributes: { ...body, progressPercent: 0 } }); return envelope(tasks[0]) }
    const taskId = String(params.taskId ?? '')
    if (path.includes('/acknowledge')) update(tasks, taskId, 'ACKNOWLEDGED')
    if (path.includes('/feedback')) update(tasks, taskId, 'IN_PROGRESS', { progressPercent: body.progressPercent ?? 0 })
    if (path.includes('/complete')) update(tasks, taskId, 'COMPLETED', { progressPercent: 100 })
    return envelope({ accepted: true, demo: true })
  }
  return {
    request: ((method: string, path: string, options?: RecordValue) => execute(method, path, options)) as unknown as ApiClient['request'],
    get: ((path: string, options?: RecordValue) => execute('get', path, options)) as unknown as ApiClient['get'],
    post: ((path: string, options?: RecordValue) => execute('post', path, options)) as unknown as ApiClient['post'],
  }
}
