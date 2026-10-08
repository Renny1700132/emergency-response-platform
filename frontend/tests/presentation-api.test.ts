import { beforeEach, describe, expect, it } from 'vitest'
import { createPresentationApiClient } from '@/shared/demo/presentation-api'
import { presentationState, resetPresentationState, switchDemoRole } from '@/shared/demo/presentation-state'

describe('presentation API adapter', () => {
  beforeEach(resetPresentationState)
  it('provides an explicit demo identity and mutable incident workflow', async () => {
    const api = createPresentationApiClient() as any
    const context = await api.get('/api/v1/platform/context')
    expect(context.data.displayName).toBe('应急指挥员')

    const before = await api.get('/api/v1/incidents')
    await api.post('/api/v1/incidents', { body: { title: '演示新增事件', description: '演示', occurredAt: '2026-09-26T14:00:00Z' } })
    const after = await api.get('/api/v1/incidents')
    expect(after.data.items).toHaveLength(before.data.items.length)
    const id = after.data.items[0].id
    await api.post('/api/v1/incidents/{incidentId}/verify', { path: { incidentId: id }, body: { decision: 'REJECTED' } })
    expect(after.data.items[0].status).toBe('REJECTED')
    await api.post('/api/v1/incidents/{incidentId}/verify', { path: { incidentId: id }, body: { decision: 'CONFIRMED' } })
    await api.post('/api/v1/incidents/{incidentId}/start-response', { path: { incidentId: id }, body: {} })
    expect(after.data.items[0].status).toBe('RESPONDING')
    await api.post('/api/v1/incidents/{incidentId}/verify', { path: { incidentId: 'missing' }, body: { decision: 'CONFIRMED' } })
  })

  it('supports task actions and a safe generic acknowledgement', async () => {
    const api = createPresentationApiClient() as any
    await api.post('/api/v1/tasks', { body: { name: '演示临时任务', assigneeRef: '演示组' } })
    const response = await api.get('/api/v1/tasks')
    const task = response.data.items[0]
    await api.post('/api/v1/tasks/{taskId}/acknowledge', { path: { taskId: task.id }, body: {} })
    expect(task.status).toBe('ACKNOWLEDGED')
    await api.post('/api/v1/tasks/{taskId}/feedback', { path: { taskId: task.id }, body: { progressPercent: 66 } })
    expect(task.attributes.progressPercent).toBe(66)
    await api.post('/api/v1/tasks/{taskId}/complete', { path: { taskId: task.id }, body: {} })
    expect(task.status).toBe('COMPLETED')
    const fallback = await api.request('post', '/api/v1/platform/files/presign', { body: {} })
    expect(fallback.data).toMatchObject({ accepted: true, demo: true })
  })

  it('shares role actions and workflow changes with the live presentation state', async () => {
    const api = createPresentationApiClient() as any
    switchDemoRole('SECURITY')
    const context = await api.get('/api/v1/platform/context')
    expect(context.data.displayName).toBe('现场安保员')
    await api.post('/api/v1/tasks/{taskId}/feedback', { path: { taskId: 'TSK-260926-01' }, body: { progressPercent: 88 } })
    expect(presentationState.tasks[0].attributes.progressPercent).toBe(88)
    expect(presentationState.lastActor).toBe('现场安保员')
    expect(presentationState.lastAction).toContain('88%')
    expect(presentationState.revision).toBeGreaterThan(1)
  })
})
