import { createApiClient } from '../src/shared/http/api-client'

const client = createApiClient()

const contextResponse = client.get('/api/v1/platform/context', { query: { page: 1, size: 20 } })
contextResponse.then((response) => response.data)

client.post('/api/v1/incidents', {
  body: {
    incidentTypeCode: 'FIRE',
    title: '类型正例',
    description: '由冻结 OpenAPI 推导请求体',
    occurredAt: '2026-09-23T08:00:00Z',
  },
  idempotencyKey: 'type-positive-case',
})

client.get('/api/v1/incidents/{incidentId}', { path: { incidentId: 'incident-1' } })

// @ts-expect-error 该路径只允许 POST，错误方法必须被类型检查阻断。
client.get('/api/v1/incidents/{incidentId}/verify')

// @ts-expect-error IncidentCreateRequest 缺少必填字段，错误请求体必须被阻断。
client.post('/api/v1/incidents', { body: { title: '缺少必填字段' } })

// @ts-expect-error GET operation 不接受 request body。
client.get('/api/v1/platform/context', { body: { unexpected: true } })

// @ts-expect-error 成功响应由契约推导，不能声明为不相容的字符串 Promise。
const invalidResponse: Promise<string> = client.get('/api/v1/platform/context')

// @ts-expect-error 契约声明 incidentId 为必填 path 参数，不得省略 options.path。
client.get('/api/v1/incidents/{incidentId}')

// @ts-expect-error 契约声明写操作 X-Idempotency-Key 必填，不得省略 idempotencyKey。
client.post('/api/v1/incidents', {
  body: {
    incidentTypeCode: 'FIRE',
    title: '缺少幂等键',
    description: '类型负例',
    occurredAt: '2026-09-23T08:00:00Z',
  },
})

void invalidResponse
