import { describe, expect, it, vi } from 'vitest'
import { loadFormalModule } from '../src/features/formal/module-workbench'
import type { ApiClient } from '../src/shared/http/api-client'

const responseFor = (path: string) => {
  if (path.endsWith('/plans')) return { items: [{ name: '正式预案', level: '专项', version: 2, status: 'PUBLISHED' }], total: 1 }
  if (path.endsWith('/material-sites')) return { items: [{ name: '一号站', floor: '1F', x: 1, y: 2 }], total: 1 }
  if (path.endsWith('/material-ledgers')) return { items: [], total: 0 }
  if (path.endsWith('/persons')) return { items: [], total: 0 }
  if (path.endsWith('/positions/latest')) return { items: [], total: 0 }
  if (path.endsWith('/drill-plans')) return { items: [{ name: '演练', ownerRef: 'A' }], total: 1 }
  if (path.endsWith('/duty-schedules')) return { items: [{ name: '白班' }], total: 1 }
  if (path.endsWith('/attendance/records')) return { items: [], total: 0 }
  if (path.endsWith('/attendance/alerts')) return { items: [], total: 0 }
  if (path.endsWith('/knowledge-items')) return { items: [{ title: '指引', category: '应急', status: 'PUBLISHED' }], total: 1 }
  if (path.endsWith('/situation/resource-map')) return { sites: [{ name: '一号站', x: 1, y: 2 }], positions: [{ personId: 'A', x: 3, y: 4, usableForDispatch: true }] }
  if (path.endsWith('/statistics/emergency')) return { drillsCompleted: 1, generatedAt: '2026-10-08T00:00:00Z' }
  return { items: [], total: 0 }
}

const api = {
  get: vi.fn(async (path: string) => responseFor(path)),
  post: vi.fn(), request: vi.fn(),
} as unknown as ApiClient

describe('formal module workbench', () => {
  it.each(['MOD-PLAN', 'MOD-RESOURCE', 'MOD-DRILL', 'MOD-DUTY', 'MOD-KNOWLEDGE', 'MOD-SITUATION', 'MOD-INTEGRATION'])(
    'loads %s without presentation fallback', async (moduleId) => {
      const snapshot = await loadFormalModule(api, moduleId)
      expect(snapshot.metrics.length).toBeGreaterThan(0)
      expect(snapshot.evidence).toBeTruthy()
      expect(snapshot.rows).toBeInstanceOf(Array)
    },
  )
})
