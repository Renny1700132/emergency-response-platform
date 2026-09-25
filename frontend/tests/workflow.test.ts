import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../src/shared/http/api-client'
import { ApiError } from '../src/shared/http/api-error'
import { createResponseWorkflow, toWorkflowItem, visibleError } from '../src/features/response/workflow'

const api = (overrides: Partial<ApiClient> = {}) => ({ get: vi.fn(), post: vi.fn(), request: vi.fn(), ...overrides }) as ApiClient

describe('Sprint 1 response workflow', () => {
  it('maps generic contract entities into visible incident and task state', () => {
    expect(toWorkflowItem({ id: 'i-1', status: 'REPORTED', version: 2, attributes: { title: '展厅烟雾', attachmentFileIds: ['file-1'] } })).toMatchObject({ id: 'i-1', title: '展厅烟雾', status: 'REPORTED', version: 2, attachmentFileIds: ['file-1'] })
  })

  it('loads lists through the formal client and preserves empty data', async () => {
    const client = api({ get: vi.fn().mockResolvedValue({ data: { items: [], page: 1, size: 50, total: 0 } }) })
    await expect(createResponseWorkflow(client).listIncidents()).resolves.toEqual([])
    expect(client.get).toHaveBeenCalledWith('/api/v1/incidents', { query: { page: 1, size: 50 } })
  })

  it('submits incident report, verification and response start with typed paths and idempotency', async () => {
    const post = vi.fn().mockResolvedValue({ data: { id: 'i-1' } })
    const workflow = createResponseWorkflow(api({ post }))
    const incident = toWorkflowItem({ id: 'i-1', version: 7, status: 'REPORTED', attributes: { title: '测试事件' } })
    await workflow.reportIncident({ incidentTypeCode: 'FIRE', title: '测试事件', description: '烟雾', occurredAt: '2026-09-24T08:00:00Z', attachmentFileIds: ['file-1'] })
    await workflow.verifyIncident(incident, 'CONFIRMED', '现场确认')
    await workflow.startResponse(incident, 'plan-v1', '按预案执行')
    expect(post).toHaveBeenNthCalledWith(2, '/api/v1/incidents/{incidentId}/verify', expect.objectContaining({ path: { incidentId: 'i-1' }, body: { decision: 'CONFIRMED', reason: '现场确认', resourceVersion: 7 }, idempotencyKey: expect.any(String) }))
    expect(post).toHaveBeenNthCalledWith(3, '/api/v1/incidents/{incidentId}/start-response', expect.objectContaining({ body: { planVersionId: 'plan-v1', resourceVersion: 7, reason: '按预案执行' } }))
  })

  it('submits task acknowledgement and feedback with attachments and resource version', async () => {
    const post = vi.fn().mockResolvedValue({ data: { id: 't-1' } })
    const workflow = createResponseWorkflow(api({ post }))
    const task = toWorkflowItem({ id: 't-1', version: 3, status: 'ISSUED', attributes: { name: '疏散引导' } })
    await workflow.acknowledgeTask(task)
    await workflow.feedbackTask(task, { content: '已到位', progressPercent: 60, attachmentFileIds: ['file-2'] })
    expect(post).toHaveBeenNthCalledWith(1, '/api/v1/tasks/{taskId}/acknowledge', expect.objectContaining({ path: { taskId: 't-1' }, body: expect.objectContaining({ resourceVersion: 3 }) }))
    expect(post).toHaveBeenNthCalledWith(2, '/api/v1/tasks/{taskId}/feedback', expect.objectContaining({ body: { content: '已到位', progressPercent: 60, attachmentFileIds: ['file-2'], resourceVersion: 3 } }))
  })

  it('keeps forbidden, failure and trace states visible', () => {
    expect(visibleError(new ApiError('forbidden detail', 403, 'FORBIDDEN', 'trace-403'))).toEqual({ kind: 'forbidden', message: '当前账号无权执行此操作。', traceId: 'trace-403' })
    expect(visibleError(new ApiError('服务暂不可用', 503, 'UNAVAILABLE', 'trace-503'))).toEqual({ kind: 'failure', message: '服务暂不可用', traceId: 'trace-503' })
    expect(visibleError(new Error('unknown'))).toEqual({ kind: 'failure', message: '操作失败，请稍后重试。' })
  })
})
