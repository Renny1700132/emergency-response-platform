import type { ApiClient } from '@/shared/http/api-client'
import { activeDemoRole, commitPresentationChange, presentationState, type DemoRecord } from './presentation-state'

type RecordValue = Record<string, unknown>
const now = () => new Date().toISOString()
const envelope = (data: unknown) => ({ code: 'OK', message: '演示请求成功', timestamp: now(), traceId: 'demo-trace-20260926', data })
const update = (items: DemoRecord[], id: string, status: string, attributes: RecordValue = {}) => {
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
    const role = activeDemoRole()
    if (path === '/api/v1/platform/context') return envelope({ userId: `demo-${role.id.toLowerCase()}`, displayName: role.name, roles: [role.id], permissions: ['plan:read', 'incident:read', 'incident:create', 'incident:verify', 'incident:start-response', 'task:read', 'task:create', 'task:acknowledge', 'task:feedback', 'task:remind', 'task:complete', 'situation:read', 'resource:read', 'drill:read', 'duty:read', 'attendance:write', 'inventory:write', 'knowledge:read', 'integration:read'] })
    if (path === '/api/v1/incidents' && method === 'get') return envelope({ items: presentationState.incidents })
    if (path === '/api/v1/incidents' && method === 'post') { presentationState.incidents.unshift({ id: `EVT-DEMO-${String(presentationState.incidents.length + 1).padStart(3, '0')}`, version: 1, status: 'PENDING_VERIFY', attributes: { ...body } }); commitPresentationChange(`上报事件：${String(body.title ?? '未命名')}`); return envelope(presentationState.incidents[0]) }
    if (path.includes('/verify')) { update(presentationState.incidents, String(params.incidentId), body.decision === 'REJECTED' ? 'REJECTED' : 'VERIFIED'); commitPresentationChange(`核实事件：${String(params.incidentId)}`) }
    if (path.includes('/start-response')) { update(presentationState.incidents, String(params.incidentId), 'RESPONDING'); commitPresentationChange(`启动处置：${String(params.incidentId)}`) }
    if (path === '/api/v1/tasks' && method === 'get') return envelope({ items: presentationState.tasks })
    if (path === '/api/v1/tasks' && method === 'post') { presentationState.tasks.unshift({ id: `TSK-DEMO-${String(presentationState.tasks.length + 1).padStart(3, '0')}`, version: 1, status: 'PENDING', attributes: { ...body, progressPercent: 0 } }); commitPresentationChange(`创建任务：${String(body.name ?? '未命名')}`); return envelope(presentationState.tasks[0]) }
    const taskId = String(params.taskId ?? '')
    if (path.includes('/acknowledge')) { update(presentationState.tasks, taskId, 'ACKNOWLEDGED'); commitPresentationChange(`接收任务：${taskId}`) }
    if (path.includes('/feedback')) { update(presentationState.tasks, taskId, 'IN_PROGRESS', { progressPercent: body.progressPercent ?? 0 }); commitPresentationChange(`反馈任务：${taskId}，进度 ${String(body.progressPercent ?? 0)}%`) }
    if (path.includes('/complete')) { update(presentationState.tasks, taskId, 'COMPLETED', { progressPercent: 100 }); commitPresentationChange(`完成任务：${taskId}`) }
    return envelope({ accepted: true, demo: true })
  }
  return {
    request: ((method: string, path: string, options?: RecordValue) => execute(method, path, options)) as unknown as ApiClient['request'],
    get: ((path: string, options?: RecordValue) => execute('get', path, options)) as unknown as ApiClient['get'],
    post: ((path: string, options?: RecordValue) => execute('post', path, options)) as unknown as ApiClient['post'],
  }
}
