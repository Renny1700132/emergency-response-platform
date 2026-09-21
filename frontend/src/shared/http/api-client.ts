import type { paths } from '@/api/generated/schema'
import { ApiError } from './api-error'

export type ApiPath = keyof paths
export type TokenProvider = () => string | null | Promise<string | null>

export interface ApiClientOptions {
  baseUrl?: string
  timeoutMs?: number
  tokenProvider?: TokenProvider
  fetcher?: typeof fetch
  onUnauthorized?: () => void
}

export interface RequestOptions<TBody = unknown> {
  query?: Record<string, string | number | boolean | undefined>
  body?: TBody
  headers?: HeadersInit
  signal?: AbortSignal
  idempotencyKey?: string
}

export interface ApiClient {
  request<TResponse, TBody = unknown>(method: string, path: ApiPath, options?: RequestOptions<TBody>): Promise<TResponse>
  get<TResponse>(path: ApiPath, options?: RequestOptions): Promise<TResponse>
  post<TResponse, TBody = unknown>(path: ApiPath, options?: RequestOptions<TBody>): Promise<TResponse>
}

const trimSlash = (value: string) => value.replace(/\/$/, '')
const newRequestId = () => globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = trimSlash(options.baseUrl ?? import.meta.env?.VITE_API_BASE_URL ?? '')
  const timeoutMs = options.timeoutMs ?? Number(import.meta.env?.VITE_REQUEST_TIMEOUT_MS ?? 10000)
  const fetcher = options.fetcher ?? fetch

  async function request<TResponse, TBody = unknown>(method: string, path: ApiPath, requestOptions: RequestOptions<TBody> = {}) {
    const url = new URL(`${baseUrl}${String(path)}`, globalThis.location?.origin ?? 'http://localhost')
    Object.entries(requestOptions.query ?? {}).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })

    const token = await options.tokenProvider?.()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort('request-timeout'), timeoutMs)
    requestOptions.signal?.addEventListener('abort', () => controller.abort(requestOptions.signal?.reason), { once: true })

    const headers = new Headers(requestOptions.headers)
    headers.set('Accept', 'application/json')
    headers.set('X-Request-Id', newRequestId())
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (requestOptions.idempotencyKey) headers.set('Idempotency-Key', requestOptions.idempotencyKey)
    if (requestOptions.body !== undefined) headers.set('Content-Type', 'application/json')

    try {
      const response = await fetcher(url, {
        method,
        headers,
        body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
        signal: controller.signal,
        credentials: 'same-origin',
      })
      const payload = response.status === 204 ? undefined : await response.json().catch(() => undefined)
      if (!response.ok) {
        if (response.status === 401) options.onUnauthorized?.()
        const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
        throw new ApiError(
          String(record.message ?? `请求失败（HTTP ${response.status}）`),
          response.status,
          String(record.code ?? 'HTTP_ERROR'),
          String(record.traceId ?? response.headers.get('X-Trace-Id') ?? '') || undefined,
          record.details,
        )
      }
      return payload as TResponse
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (controller.signal.aborted) throw new ApiError('请求超时或已取消', 0, 'REQUEST_ABORTED')
      throw new ApiError('网络不可用，请稍后重试', 0, 'NETWORK_ERROR', undefined, error)
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    request,
    get: (path, requestOptions) => request('GET', path, requestOptions),
    post: (path, requestOptions) => request('POST', path, requestOptions),
  }
}
