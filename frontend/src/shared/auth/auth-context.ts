import type { InjectionKey, Ref } from 'vue'
import { inject, readonly, ref } from 'vue'
import type { ApiClient, TokenProvider } from '../http/api-client'

export interface UserContext { userId: string; displayName: string; roles: readonly string[]; permissions: readonly string[] }
export interface AuthContext {
  status: Readonly<Ref<'idle' | 'loading' | 'authenticated' | 'anonymous' | 'error'>>
  user: Readonly<Ref<UserContext | null>>
  bootstrap(): Promise<void>
  hasAnyPermission(required?: string[]): boolean
  clear(): void
}

export function browserTokenProvider(): TokenProvider {
  return async () => {
    const provider = window.MuseumHostBridge ?? window.__MUSEUM_AUTH__
    return provider ? provider.getAccessToken() : null
  }
}

export function createAuthContext(api: ApiClient, tokenProvider: TokenProvider = browserTokenProvider()): AuthContext {
  const status = ref<AuthContext['status']['value']>('idle')
  const user = ref<UserContext | null>(null)
  let pending: Promise<void> | undefined

  const clear = () => { user.value = null; status.value = 'anonymous' }
  const bootstrap = async () => {
    if (pending) return pending
    pending = (async () => {
      status.value = 'loading'
      const token = await tokenProvider()
      if (!token) return clear()
      try {
        const response = await api.get('/api/v1/platform/context')
        const data = (response.data ?? {}) as Partial<UserContext>
        user.value = {
          userId: String(data.userId ?? ''), displayName: String(data.displayName ?? '已认证用户'),
          roles: Array.isArray(data.roles) ? data.roles.map(String) : [],
          permissions: Array.isArray(data.permissions) ? data.permissions.map(String) : [],
        }
        status.value = 'authenticated'
      } catch { user.value = null; status.value = 'error' }
    })().finally(() => { pending = undefined })
    return pending
  }

  return {
    status: readonly(status), user: readonly(user), bootstrap,
    hasAnyPermission: (required = []) => required.length === 0 || required.some((item) => user.value?.permissions.includes(item)),
    clear,
  }
}

export const authContextKey: InjectionKey<AuthContext> = Symbol('auth-context')
export function useAuthContext() {
  const context = inject(authContextKey)
  if (!context) throw new Error('AuthContext is not installed')
  return context
}
