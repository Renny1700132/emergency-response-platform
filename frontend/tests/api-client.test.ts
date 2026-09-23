import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../src/shared/http/api-client'
import { ApiError } from '../src/shared/http/api-error'

describe('API Client', () => {
  it('adds authentication, request id and query parameters', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ data: { ok: true } }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    const client = createApiClient({ baseUrl: 'https://gateway.example', tokenProvider: () => 'short-lived-token', fetcher })
    await client.get('/api/v1/platform/context', { query: { page: 1 } })
    const [url, init] = fetcher.mock.calls[0]
    expect(String(url)).toContain('/api/v1/platform/context?page=1')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer short-lived-token')
    expect(new Headers(init?.headers).get('X-Request-Id')).toBeTruthy()
  })

  it('normalizes contract errors and preserves traceId', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ code: 'FORBIDDEN', message: '无权访问', traceId: 'trace-42' }), { status: 403 }))
    const client = createApiClient({ baseUrl: 'https://gateway.example', fetcher })
    await expect(client.get('/api/v1/platform/context')).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN', traceId: 'trace-42' } satisfies Partial<ApiError>)
  })

  it('reports network failures without leaking request details', async () => {
    const client = createApiClient({ baseUrl: 'https://gateway.example', fetcher: vi.fn(async () => { throw new Error('socket details') }) })
    await expect(client.get('/api/v1/platform/context')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR', message: '网络不可用，请稍后重试' } satisfies Partial<ApiError>)
  })

  it('sends JSON bodies and idempotency keys for writes', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 204 }))
    const client = createApiClient({ baseUrl: 'https://gateway.example/', fetcher })

    await expect(client.post('/api/v1/incidents', { body: { title: '演示事件' }, idempotencyKey: 'idem-1' })).resolves.toBeUndefined()

    const [, init] = fetcher.mock.calls[0]
    const headers = new Headers(init?.headers)
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Idempotency-Key')).toBe('idem-1')
    expect(init?.body).toBe(JSON.stringify({ title: '演示事件' }))
  })

  it('notifies the authentication boundary on a 401 response', async () => {
    const onUnauthorized = vi.fn()
    const fetcher = vi.fn(async () => new Response('not-json', { status: 401, headers: { 'X-Trace-Id': 'trace-401' } }))
    const client = createApiClient({ baseUrl: 'https://gateway.example', fetcher, onUnauthorized })

    await expect(client.get('/api/v1/platform/context')).rejects.toMatchObject({ status: 401, code: 'HTTP_ERROR', traceId: 'trace-401' })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('normalizes an already-aborted caller signal', async () => {
    const caller = new AbortController()
    caller.abort('cancelled-by-user')
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError')
      return new Response('{}')
    })
    const client = createApiClient({ baseUrl: 'https://gateway.example', fetcher })

    await expect(client.get('/api/v1/platform/context', { signal: caller.signal })).rejects.toMatchObject({ code: 'REQUEST_ABORTED' })
  })
})
