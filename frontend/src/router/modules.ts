export const moduleRequirements = {
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
} as const

export type ModuleId = keyof typeof moduleRequirements

export interface ModuleRoute {
  id: Exclude<ModuleId, 'MOD-MOBILE' | 'MOD-PLATFORM'>
  channelId?: 'MOD-MOBILE'
  path: string
  title: string
  shortTitle: string
  audience: 'web' | 'h5'
  permissions: string[]
  requirements: readonly string[]
  channelRequirements?: readonly string[]
}

const web = <T extends ModuleRoute['id']>(route: Omit<ModuleRoute, 'audience' | 'requirements'> & { id: T }): ModuleRoute => ({
  ...route,
  audience: 'web',
  requirements: moduleRequirements[route.id],
})

const h5 = <T extends ModuleRoute['id']>(route: Omit<ModuleRoute, 'audience' | 'requirements' | 'channelId' | 'channelRequirements'> & { id: T }): ModuleRoute => ({
  ...route,
  audience: 'h5',
  channelId: 'MOD-MOBILE',
  requirements: moduleRequirements[route.id],
  channelRequirements: moduleRequirements['MOD-MOBILE'],
})

export const moduleRoutes: ModuleRoute[] = [
  web({ id: 'MOD-PLAN', path: 'plans', title: '预案管理', shortTitle: '预案', permissions: ['plan:read'] }),
  web({ id: 'MOD-EVENT', path: 'incidents', title: '事件管理', shortTitle: '事件', permissions: ['incident:read'] }),
  web({ id: 'MOD-TASK', path: 'tasks', title: '应急任务', shortTitle: '任务', permissions: ['task:read'] }),
  web({ id: 'MOD-SITUATION', path: 'situation', title: '指挥态势', shortTitle: '态势', permissions: ['situation:read'] }),
  web({ id: 'MOD-RESOURCE', path: 'resources', title: '人员与物资', shortTitle: '资源', permissions: ['resource:read'] }),
  web({ id: 'MOD-DRILL', path: 'drills', title: '演练管理', shortTitle: '演练', permissions: ['drill:read'] }),
  web({ id: 'MOD-DUTY', path: 'duty', title: '值班与打卡', shortTitle: '值班', permissions: ['duty:read'] }),
  web({ id: 'MOD-KNOWLEDGE', path: 'knowledge', title: '知识管理', shortTitle: '知识', permissions: ['knowledge:read'] }),
  web({ id: 'MOD-INTEGRATION', path: 'integrations', title: '系统对接', shortTitle: '对接', permissions: ['integration:read'] }),
  h5({ id: 'MOD-EVENT', path: 'events', title: '移动事件', shortTitle: '事件', permissions: ['incident:read'] }),
  h5({ id: 'MOD-TASK', path: 'tasks', title: '我的任务', shortTitle: '任务', permissions: ['task:read'] }),
  h5({ id: 'MOD-DRILL', path: 'drills', title: '移动演练', shortTitle: '演练', permissions: ['drill:read'] }),
  h5({ id: 'MOD-DUTY', path: 'check-in', title: '扫码打卡', shortTitle: '打卡', permissions: ['attendance:write'] }),
  h5({ id: 'MOD-RESOURCE', path: 'inventory', title: '物资盘点', shortTitle: '盘点', permissions: ['inventory:write'] }),
  h5({ id: 'MOD-KNOWLEDGE', path: 'knowledge', title: '应急知识', shortTitle: '知识', permissions: ['knowledge:read'] }),
]
