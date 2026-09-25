import type { InjectionKey } from 'vue'
import { inject } from 'vue'
import type { ApiClient } from './api-client'

export const apiClientKey: InjectionKey<ApiClient> = Symbol('api-client')

export function useApiClient() {
  const client = inject(apiClientKey)
  if (!client) throw new Error('ApiClient is not installed')
  return client
}
