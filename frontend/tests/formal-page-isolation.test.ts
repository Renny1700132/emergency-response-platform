import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DashboardView from '../src/views/DashboardView.vue'
import OperationsModuleView from '../src/views/OperationsModuleView.vue'
import { moduleRoutes } from '../src/router/modules'
import { apiClientKey } from '../src/shared/http/api-context'
import type { ApiClient } from '../src/shared/http/api-client'
import { ApiError } from '../src/shared/http/api-error'

const formalIncident = { id: 'INC-FORMAL-1', title: '正式接口事件', status: 'RESPONDING', version: 2, updatedAt: '2026-10-08T06:00:00Z' }
const response = (path: string) => {
  if (path === '/api/v1/incidents') return { data: { items: [formalIncident], total: 1 } }
  if (path === '/api/v1/tasks') return { data: { items: [{ id: 'TASK-FORMAL-1', name: '正式接口任务', status: 'IN_PROGRESS', version: 1, progressPercent: 40 }], total: 1 } }
  if (path === '/api/v1/situation/resource-map') return { data: { sites: [{ name: '正式接口站点', x: 10, y: 20 }], positions: [] } }
  if (path === '/api/v1/statistics/emergency') return { data: { drillsCompleted: 2, generatedAt: '2026-10-08T06:00:00Z' } }
  return { data: { items: [], total: 0 } }
}
const createClient = () => {
  const get = vi.fn(async (path: string) => response(path))
  const post = vi.fn(async () => ({ data: { id: 'CMD-FORMAL-1', status: 'ACCEPTED' } }))
  return { api: { get, post, request: vi.fn() } as unknown as ApiClient, get, post }
}

describe('formal page isolation and control receipt', () => {
  it('renders Dashboard only from formal responses and omits presentation facts', async () => {
    const { api } = createClient()
    const wrapper = mount(DashboardView, { global: { provide: { [apiClientKey as symbol]: api }, stubs: { RouterLink: { template: '<a><slot /></a>' } } } })
    await flushPromises()
    expect(wrapper.text()).toContain('正式接口事件')
    expect(wrapper.text()).toContain('正式接口任务')
    expect(wrapper.text()).toContain('物资站点 1')
    for (const forbidden of ['当前客流 328', '烟感与温度联动告警', '消息回执 3/3', '运行正常', '轻微延迟']) expect(wrapper.text()).not.toContain(forbidden)
  })

  it('omits situation presentation facts and sends a typed formal access command with visible receipt', async () => {
    const { api, post } = createClient()
    const module = moduleRoutes.find((item) => item.id === 'MOD-SITUATION' && item.audience === 'web')!
    const wrapper = mount(OperationsModuleView, { props: { module }, global: { provide: { [apiClientKey as symbol]: api } } })
    await flushPromises()
    expect(wrapper.text()).toContain('正式接口站点')
    for (const forbidden of ['告警 1', '设备 68', '模拟视频画面', '在线 · 82 ms']) expect(wrapper.text()).not.toContain(forbidden)
    await wrapper.get('input[placeholder="输入正式门禁编号"]').setValue('DOOR-FORMAL-1')
    await wrapper.findAll('button').find((button) => button.text().includes('授权开启门禁'))!.trigger('click')
    await wrapper.findAll('button').find((button) => button.text() === '确认并发送')!.trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/incidents/{incidentId}/access-control-commands', expect.objectContaining({
      path: { incidentId: 'INC-FORMAL-1' },
      body: expect.objectContaining({ doorRef: 'DOOR-FORMAL-1', action: 'REQUEST_OPEN', reason: '应急疏散人工二次确认' }),
      idempotencyKey: expect.any(String),
    }))
    expect(wrapper.text()).toContain('门禁控制回执：ACCEPTED（指令 CMD-FORMAL-1）')
  })

  it('does not fall back to presentation facts when formal Dashboard APIs fail', async () => {
    const api = { get: vi.fn().mockRejectedValue(new ApiError('正式服务不可用', 503, 'UNAVAILABLE')), post: vi.fn(), request: vi.fn() } as unknown as ApiClient
    const wrapper = mount(DashboardView, { global: { provide: { [apiClientKey as symbol]: api }, stubs: { RouterLink: { template: '<a><slot /></a>' } } } })
    await flushPromises()
    expect(wrapper.text()).toContain('正式服务不可用')
    expect(wrapper.text()).toContain('未使用演示回退')
    for (const forbidden of ['当前客流 328', '烟感与温度联动告警', '消息回执 3/3', '运行正常', '轻微延迟']) expect(wrapper.text()).not.toContain(forbidden)
  })

  it('shows formal control failure and explicit manual degradation without a success claim', async () => {
    const { api } = createClient()
    api.post = vi.fn().mockRejectedValue(new ApiError('门禁适配器超时', 503, 'EXTERNAL_TIMEOUT')) as ApiClient['post']
    const module = moduleRoutes.find((item) => item.id === 'MOD-SITUATION' && item.audience === 'web')!
    const wrapper = mount(OperationsModuleView, { props: { module }, global: { provide: { [apiClientKey as symbol]: api } } })
    await flushPromises()
    await wrapper.get('input[placeholder="输入正式门禁编号"]').setValue('DOOR-FORMAL-2')
    await wrapper.findAll('button').find((button) => button.text().includes('授权开启门禁'))!.trigger('click')
    await wrapper.findAll('button').find((button) => button.text() === '确认并发送')!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('门禁控制失败：门禁适配器超时；请转人工处置。')
    expect(wrapper.text()).not.toContain('门禁控制回执：ACCEPTED')
  })
})
