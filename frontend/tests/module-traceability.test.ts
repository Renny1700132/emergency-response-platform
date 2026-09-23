import { describe, expect, it } from 'vitest'
import { moduleRequirements, moduleRoutes } from '../src/router/modules'

const frozenMapping = {
  'MOD-PLAN': ['G2-FR-001', 'G2-FR-002', 'G2-FR-003', 'G2-FR-030', 'G2-FR-033'],
  'MOD-EVENT': ['G2-FR-013', 'G2-FR-014', 'G2-FR-015', 'G2-FR-016', 'G2-FR-034', 'G2-FR-037'],
  'MOD-TASK': ['G2-FR-003', 'G2-FR-015', 'G2-FR-020', 'G2-FR-022'],
  'MOD-SITUATION': ['G2-FR-004', 'G2-FR-005', 'G2-FR-006', 'G2-FR-007', 'G2-FR-026', 'G2-FR-039'],
  'MOD-RESOURCE': ['G2-FR-007', 'G2-FR-008', 'G2-FR-009', 'G2-FR-025', 'G2-FR-031', 'G2-FR-035'],
  'MOD-DUTY': ['G2-FR-017', 'G2-FR-018', 'G2-FR-019', 'G2-FR-020', 'G2-FR-024', 'G2-FR-032'],
  'MOD-DRILL': ['G2-FR-010', 'G2-FR-011', 'G2-FR-012', 'G2-FR-023', 'G2-FR-036'],
  'MOD-KNOWLEDGE': ['G2-FR-016', 'G2-FR-038'],
  'MOD-MOBILE': ['G2-FR-021', 'G2-FR-022', 'G2-FR-023', 'G2-FR-024', 'G2-FR-025', 'G2-FR-038'],
  'MOD-INTEGRATION': ['G2-FR-005', 'G2-FR-006', 'G2-FR-020', 'G2-FR-026', 'G2-FR-027', 'G2-FR-028', 'G2-FR-029'],
  'MOD-PLATFORM': ['G2-FR-001—039'],
}

describe('frozen module traceability', () => {
  it('matches every controlled MOD-* to its frozen G2-FR set', () => {
    expect(moduleRequirements).toEqual(frozenMapping)
  })

  it('keeps the MOD-MOBILE channel boundary and the invoked domain on every H5 route', () => {
    const h5Routes = moduleRoutes.filter((route) => route.audience === 'h5')
    expect(h5Routes.length).toBeGreaterThan(0)
    for (const route of h5Routes) {
      expect(route.channelId).toBe('MOD-MOBILE')
      expect(route.channelRequirements).toEqual(frozenMapping['MOD-MOBILE'])
      expect(route.requirements).toEqual(frozenMapping[route.id])
    }
  })
})
