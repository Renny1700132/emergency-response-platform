import type { ApiClient } from '@/shared/http/api-client'
import { ApiError } from '@/shared/http/api-error'

export interface WorkflowItem {
  id: string
  title: string
  status: string
  version: number
  description?: string
  occurredAt?: string
  assignee?: string
  deadlineAt?: string
  progressPercent?: number
  attachmentFileIds: string[]
}

export interface VisibleError { kind: 'forbidden' | 'failure'; message: string; traceId?: string }

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
const strings = (value: unknown) => Array.isArray(value) ? value.map(String) : []

export function toWorkflowItem(value: unknown): WorkflowItem {
  const item = record(value)
  const attributes = record(item.attributes)
  return {
    id: String(item.id ?? attributes.id ?? ''),
    title: String(item.title ?? item.name ?? attributes.title ?? attributes.name ?? '未命名'),
    status: String(item.status ?? attributes.status ?? 'UNKNOWN'),
    version: Number(item.version ?? attributes.resourceVersion ?? attributes.version ?? 0),
    description: String(item.description ?? attributes.description ?? ''),
    occurredAt: String(item.occurredAt ?? attributes.occurredAt ?? ''),
    assignee: String(item.assigneeRef ?? attributes.assigneeRef ?? ''),
    deadlineAt: String(item.deadlineAt ?? attributes.deadlineAt ?? ''),
    progressPercent: Number(item.progressPercent ?? attributes.progressPercent ?? 0),
    attachmentFileIds: strings(item.attachmentFileIds ?? attributes.attachmentFileIds),
  }
}

export function visibleError(error: unknown): VisibleError {
  if (error instanceof ApiError) return {
    kind: error.status === 403 ? 'forbidden' : 'failure',
    message: error.status === 403 ? '当前账号无权执行此操作。' : error.message,
    traceId: error.traceId,
  }
  return { kind: 'failure', message: '操作失败，请稍后重试。' }
}

const idempotencyKey = (scope: string) => `${scope}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`

export function createResponseWorkflow(api: ApiClient) {
  return {
    async listIncidents() {
      const response = await api.get('/api/v1/incidents', { query: { page: 1, size: 50 } })
      return (response.data?.items ?? []).map(toWorkflowItem)
    },
    async reportIncident(input: { incidentTypeCode: string; title: string; description: string; occurredAt: string; attachmentFileIds?: string[] }) {
      return api.post('/api/v1/incidents', { body: input, idempotencyKey: idempotencyKey('incident-report') })
    },
    async verifyIncident(incident: WorkflowItem, decision: 'CONFIRMED' | 'REJECTED', reason: string) {
      return api.post('/api/v1/incidents/{incidentId}/verify', {
        path: { incidentId: incident.id }, body: { decision, reason, resourceVersion: incident.version }, idempotencyKey: idempotencyKey('incident-verify'),
      })
    },
    async startResponse(incident: WorkflowItem, planVersionId: string, reason?: string) {
      return api.post('/api/v1/incidents/{incidentId}/start-response', {
        path: { incidentId: incident.id }, body: { planVersionId, resourceVersion: incident.version, reason }, idempotencyKey: idempotencyKey('response-start'),
      })
    },
    async listTasks() {
      const response = await api.get('/api/v1/tasks', { query: { page: 1, size: 50 } })
      return (response.data?.items ?? []).map(toWorkflowItem)
    },
    async acknowledgeTask(task: WorkflowItem) {
      return api.post('/api/v1/tasks/{taskId}/acknowledge', {
        path: { taskId: task.id }, body: { reason: '移动端接收任务', resourceVersion: task.version }, idempotencyKey: idempotencyKey('task-ack'),
      })
    },
    async feedbackTask(task: WorkflowItem, input: { content: string; progressPercent?: number; attachmentFileIds?: string[] }) {
      return api.post('/api/v1/tasks/{taskId}/feedback', {
        path: { taskId: task.id }, body: { ...input, resourceVersion: task.version }, idempotencyKey: idempotencyKey('task-feedback'),
      })
    },
  }
}
