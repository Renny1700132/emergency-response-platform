import type { paths } from '@/api/generated/schema'
import { ApiError } from './api-error'

export type ApiPath = keyof paths
export type ApiMethod = 'get' | 'post'
export type TokenProvider = () => string | null | Promise<string | null>

type OperationAt<P extends ApiPath, M extends ApiMethod> = M extends keyof paths[P]
  ? Exclude<paths[P][M], undefined>
  : never

export type ApiPathFor<M extends ApiMethod> = {
  [P in ApiPath]: OperationAt<P, M> extends never ? never : P
}[ApiPath]

type JsonContent<T> = T extends { content: infer C }
  ? C extends { 'application/json': infer Json } ? Json : never
  : never

type RequestBody<P extends ApiPath, M extends ApiMethod> = OperationAt<P, M> extends { requestBody: infer Body }
  ? JsonContent<Body>
  : never

type QueryParameters<P extends ApiPath, M extends ApiMethod> = OperationAt<P, M> extends { parameters: infer Parameters }
  ? Parameters extends { query?: infer Query } ? Exclude<Query, undefined> : never
  : never

type PathParameters<P extends ApiPath, M extends ApiMethod> = OperationAt<P, M> extends { parameters: infer Parameters }
  ? Parameters extends { path?: infer Path } ? Exclude<Path, undefined> : never
  : never

type HeaderParameters<P extends ApiPath, M extends ApiMethod> = OperationAt<P, M> extends { parameters: infer Parameters }
  ? Parameters extends { header?: infer Header } ? Exclude<Header, undefined> : never
  : never

type SuccessResponseEntry<Responses> = Responses extends object
  ? Responses[Extract<keyof Responses, 200 | 201 | 202 | 204>]
  : never

export type ApiResponse<P extends ApiPath, M extends ApiMethod> = OperationAt<P, M> extends { responses: infer Responses }
  ? JsonContent<SuccessResponseEntry<Responses>> extends never ? undefined : JsonContent<SuccessResponseEntry<Responses>>
  : never

type OptionalTransportOptions<P extends ApiPath, M extends ApiMethod> = {
  query?: QueryParameters<P, M>
  headers?: HeadersInit
  signal?: AbortSignal
}

type PathOption<P extends ApiPath, M extends ApiMethod> = PathParameters<P, M> extends never
  ? { path?: never }
  : { path: PathParameters<P, M> }

type IdempotencyOption<P extends ApiPath, M extends ApiMethod> = HeaderParameters<P, M> extends { 'X-Idempotency-Key': unknown }
  ? { idempotencyKey: string }
  : { idempotencyKey?: string }

export type RequestOptions<P extends ApiPath, M extends ApiMethod> = RequestBody<P, M> extends never
  ? OptionalTransportOptions<P, M> & PathOption<P, M> & IdempotencyOption<P, M> & { body?: never }
  : OptionalTransportOptions<P, M> & PathOption<P, M> & IdempotencyOption<P, M> & { body: RequestBody<P, M> }

type HasRequiredOptions<P extends ApiPath, M extends ApiMethod> = RequestBody<P, M> extends never
  ? PathParameters<P, M> extends never
    ? HeaderParameters<P, M> extends { 'X-Idempotency-Key': unknown } ? true : false
    : true
  : true

type RequestArguments<P extends ApiPath, M extends ApiMethod> = HasRequiredOptions<P, M> extends true
  ? [options: RequestOptions<P, M>]
  : [options?: RequestOptions<P, M>]

export interface ApiClientOptions {
  baseUrl?: string
  timeoutMs?: number
  tokenProvider?: TokenProvider
  fetcher?: typeof fetch
  onUnauthorized?: () => void
}

export interface ApiClient {
  request<M extends ApiMethod, P extends ApiPathFor<M>>(method: M, path: P, ...args: RequestArguments<P, M>): Promise<ApiResponse<P, M>>
  get<P extends ApiPathFor<'get'>>(path: P, ...args: RequestArguments<P, 'get'>): Promise<ApiResponse<P, 'get'>>
  post<P extends ApiPathFor<'post'>>(path: P, ...args: RequestArguments<P, 'post'>): Promise<ApiResponse<P, 'post'>>
}

const trimSlash = (value: string) => value.replace(/\/$/, '')
const newRequestId = () => globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`

const applyPathParameters = (path: string, parameters?: object) => Object.entries(parameters ?? {}).reduce(
  (resolved, [name, value]) => resolved.replace(`{${name}}`, encodeURIComponent(String(value))),
  path,
)

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = trimSlash(options.baseUrl ?? import.meta.env?.VITE_API_BASE_URL ?? '')
  const timeoutMs = options.timeoutMs ?? Number(import.meta.env?.VITE_REQUEST_TIMEOUT_MS ?? 10000)
  const fetcher = options.fetcher ?? fetch

  async function request<M extends ApiMethod, P extends ApiPathFor<M>>(
    method: M,
    path: P,
    ...args: RequestArguments<P, M>
  ): Promise<ApiResponse<P, M>> {
    const requestOptions = (args[0] ?? {}) as RequestOptions<P, M>
    const resolvedPath = applyPathParameters(String(path), requestOptions.path as object | undefined)
    const url = new URL(`${baseUrl}${resolvedPath}`, globalThis.location?.origin ?? 'http://localhost')
    Object.entries(requestOptions.query ?? {}).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })

    const token = await options.tokenProvider?.()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort('request-timeout'), timeoutMs)
    if (requestOptions.signal?.aborted) controller.abort(requestOptions.signal.reason)
    else requestOptions.signal?.addEventListener('abort', () => controller.abort(requestOptions.signal?.reason), { once: true })

    const headers = new Headers(requestOptions.headers)
    headers.set('Accept', 'application/json')
    headers.set('X-Request-Id', newRequestId())
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (requestOptions.idempotencyKey) headers.set('X-Idempotency-Key', requestOptions.idempotencyKey)
    if (requestOptions.body !== undefined) headers.set('Content-Type', 'application/json')

    try {
      const response = await fetcher(url, {
        method: method.toUpperCase(),
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
      return payload as ApiResponse<P, M>
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
    get: (path, ...args) => request('get', path, ...args),
    post: (path, ...args) => request('post', path, ...args),
  }
}
