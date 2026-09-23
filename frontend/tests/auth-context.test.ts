import { describe, expect, it, vi } from 'vitest'
import { browserTokenProvider, createAuthContext } from '../src/shared/auth/auth-context'
import type { ApiClient } from '../src/shared/http/api-client'

const apiClient = (getMock: (path: string, options?: unknown) => Promise<unknown>): ApiClient => ({
  request: vi.fn(),
  get: async (path, ...args) => await getMock(path, args[0]),
  post: vi.fn(),
} as ApiClient)

describe('authentication context', () => {
  it('stays anonymous when the host provides no access token', async () => {
    const get = vi.fn()
    const auth = createAuthContext(apiClient(get), async () => null)

    await auth.bootstrap()

    expect(auth.status.value).toBe('anonymous')
    expect(auth.user.value).toBeNull()
    expect(get).not.toHaveBeenCalled()
  })

  it('loads identity and evaluates permissions without persisting the token', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        userId: 'user-1',
        displayName: '审核用户',
        roles: ['dispatcher'],
        permissions: ['incident.read'],
      },
    })
    const auth = createAuthContext(apiClient(get), async () => 'short-lived-token')

    await Promise.all([auth.bootstrap(), auth.bootstrap()])

    expect(get).toHaveBeenCalledTimes(1)
    expect(auth.status.value).toBe('authenticated')
    expect(auth.user.value?.userId).toBe('user-1')
    expect(auth.hasAnyPermission()).toBe(true)
    expect(auth.hasAnyPermission(['incident.read'])).toBe(true)
    expect(auth.hasAnyPermission(['incident.write'])).toBe(false)

    auth.clear()
    expect(auth.status.value).toBe('anonymous')
    expect(auth.user.value).toBeNull()
  })

  it('enters a controlled error state when identity loading fails', async () => {
    const get = vi.fn().mockRejectedValue(new Error('upstream unavailable'))
    const auth = createAuthContext(apiClient(get), async () => 'short-lived-token')

    await auth.bootstrap()

    expect(auth.status.value).toBe('error')
    expect(auth.user.value).toBeNull()
  })

  it('reads a short-lived token from the host bridge without persistence', async () => {
    const getAccessToken = vi.fn().mockResolvedValue('host-token')
    vi.stubGlobal('window', { MuseumHostBridge: { getAccessToken } })

    await expect(browserTokenProvider()()).resolves.toBe('host-token')
    expect(getAccessToken).toHaveBeenCalledTimes(1)

    vi.unstubAllGlobals()
  })
})
