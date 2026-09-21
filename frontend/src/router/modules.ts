export interface ModuleRoute {
  id: string
  path: string
  title: string
  shortTitle: string
  audience: 'web' | 'h5'
  permissions: string[]
  requirements: string[]
}

export const moduleRoutes: ModuleRoute[] = [
  { id: 'MOD-PLAN', path: 'plans', title: '预案管理', shortTitle: '预案', audience: 'web', permissions: ['plan:read'], requirements: ['G2-FR-001—003'] },
  { id: 'MOD-EVENT', path: 'incidents', title: '事件管理', shortTitle: '事件', audience: 'web', permissions: ['incident:read'], requirements: ['G2-FR-013—016'] },
  { id: 'MOD-TASK', path: 'tasks', title: '应急任务', shortTitle: '任务', audience: 'web', permissions: ['task:read'], requirements: ['G2-FR-004—006'] },
  { id: 'MOD-SITUATION', path: 'situation', title: '指挥态势', shortTitle: '态势', audience: 'web', permissions: ['situation:read'], requirements: ['G2-FR-017—020'] },
  { id: 'MOD-RESOURCE', path: 'resources', title: '人员与物资', shortTitle: '资源', audience: 'web', permissions: ['resource:read'], requirements: ['G2-FR-007—009'] },
  { id: 'MOD-DRILL', path: 'drills', title: '演练管理', shortTitle: '演练', audience: 'web', permissions: ['drill:read'], requirements: ['G2-FR-010—012'] },
  { id: 'MOD-DUTY', path: 'duty', title: '值班与打卡', shortTitle: '值班', audience: 'web', permissions: ['duty:read'], requirements: ['G2-FR-021—023'] },
  { id: 'MOD-KNOWLEDGE', path: 'knowledge', title: '知识与配置', shortTitle: '知识', audience: 'web', permissions: ['knowledge:read'], requirements: ['G2-FR-024—026'] },
  { id: 'MOD-INTEGRATION', path: 'integrations', title: '系统对接', shortTitle: '对接', audience: 'web', permissions: ['integration:read'], requirements: ['G2-FR-027—029'] },
  { id: 'MOD-EVENT', path: 'events', title: '移动事件', shortTitle: '事件', audience: 'h5', permissions: ['incident:read'], requirements: ['G2-FR-013—016'] },
  { id: 'MOD-TASK', path: 'tasks', title: '我的任务', shortTitle: '任务', audience: 'h5', permissions: ['task:read'], requirements: ['G2-FR-004—006'] },
  { id: 'MOD-DRILL', path: 'drills', title: '移动演练', shortTitle: '演练', audience: 'h5', permissions: ['drill:read'], requirements: ['G2-FR-010—012'] },
  { id: 'MOD-DUTY', path: 'check-in', title: '扫码打卡', shortTitle: '打卡', audience: 'h5', permissions: ['attendance:write'], requirements: ['G2-FR-023'] },
  { id: 'MOD-RESOURCE', path: 'inventory', title: '物资盘点', shortTitle: '盘点', audience: 'h5', permissions: ['inventory:write'], requirements: ['G2-FR-009'] },
  { id: 'MOD-KNOWLEDGE', path: 'knowledge', title: '应急知识', shortTitle: '知识', audience: 'h5', permissions: ['knowledge:read'], requirements: ['G2-FR-025'] },
]
