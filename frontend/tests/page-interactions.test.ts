import { flushPromises, mount } from '@vue/test-utils'
import { readonly, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import IncidentFlowView from '../src/views/IncidentFlowView.vue'
import TaskFlowView from '../src/views/TaskFlowView.vue'
import PlatformAttachmentField from '../src/components/PlatformAttachmentField.vue'
import { apiClientKey } from '../src/shared/http/api-context'
import { authContextKey, type AuthContext } from '../src/shared/auth/auth-context'
import type { ApiClient } from '../src/shared/http/api-client'
import { ApiError } from '../src/shared/http/api-error'
import { createAppRouter } from '../src/router'

const auth = (permissions: string[]): AuthContext => {
  const status = ref<'authenticated'>('authenticated')
  const user = ref({ userId: 'u-1', displayName: '测试用户', roles: ['operator'], permissions })
  return { status: readonly(status), user: readonly(user), bootstrap: vi.fn(), clear: vi.fn(), hasAnyPermission: (required = []) => required.length === 0 || required.some((item) => permissions.includes(item)) }
}
const client = (get: ApiClient['get'], post: ApiClient['post'] = vi.fn()) => ({ get, post, request: vi.fn() }) as ApiClient
const mountPage = (component: typeof IncidentFlowView | typeof TaskFlowView, api: ApiClient, permissions: string[], audience: 'web' | 'h5' = 'web') => mount(component, { props: { audience }, global: { provide: { [apiClientKey as symbol]: api, [authContextKey as symbol]: auth(permissions) } } })
const entity = (id: string, title: string) => ({ id, status: 'REPORTED', version: 2, createdAt: '2026-09-24T00:00:00Z', updatedAt: '2026-09-24T00:00:00Z', attributes: { title } })

describe('G4-06 mounted page interactions', () => {
  it('renders loading then empty state from the real incident component', async () => {
    let resolve!: (value: unknown) => void
    const api = client(vi.fn(() => new Promise((done) => { resolve = done })) as ApiClient['get'])
    const wrapper = mountPage(IncidentFlowView, api, ['incident:read'])
    expect(wrapper.text()).toContain('正在加载')
    resolve({ data: { items: [], page: 1, size: 50, total: 0 } })
    await flushPromises()
    expect(wrapper.text()).toContain('暂无数据')
  })

  it('renders dedicated 403 and ordinary failure states with traceId and retry', async () => {
    const get = vi.fn().mockRejectedValueOnce(new ApiError('无权访问', 403, 'FORBIDDEN', 'trace-403')).mockRejectedValueOnce(new ApiError('服务故障', 503, 'UNAVAILABLE', 'trace-503')).mockResolvedValue({ data: { items: [] } })
    const wrapper = mountPage(IncidentFlowView, client(get), ['incident:read'])
    await flushPromises()
    expect(wrapper.text()).toContain('无权访问')
    expect(wrapper.text()).toContain('trace-403')
    await wrapper.unmount()
    const failed = mountPage(IncidentFlowView, client(get), ['incident:read'])
    await flushPromises()
    expect(failed.text()).toContain('加载失败')
    expect(failed.text()).toContain('trace-503')
    await failed.get('button').trigger('click')
    await flushPromises()
    expect(failed.text()).toContain('暂无数据')
  })

  it('keeps unauthorized actions visible and disabled', async () => {
    const get = vi.fn().mockResolvedValue({ data: { items: [entity('i-1', '展厅烟雾')] } })
    const wrapper = mountPage(IncidentFlowView, client(get), ['incident:read'])
    await flushPromises()
    expect(wrapper.text()).toContain('无事件上报权限')
    await wrapper.get('summary').trigger('click')
    const labels = wrapper.findAll('button').map((button) => button.text())
    expect(labels).toContain('无核实权限')
    expect(labels).toContain('无启动权限')
    expect(wrapper.findAll('button').filter((button) => button.text().startsWith('无')).every((button) => button.attributes('disabled') !== undefined)).toBe(true)
  })

  it('submits an incident report through the mounted form and refreshes server state', async () => {
    const get = vi.fn().mockResolvedValue({ data: { items: [] } })
    const post = vi.fn().mockResolvedValue({ data: entity('i-1', '展厅烟雾') })
    const wrapper = mountPage(IncidentFlowView, client(get, post), ['incident:read', 'incident:create'])
    await flushPromises(); await wrapper.get('button.primary').trigger('click')
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('FIRE'); await inputs[2].setValue('展厅烟雾'); await wrapper.get('textarea').setValue('发现烟雾')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/incidents', expect.objectContaining({ body: expect.objectContaining({ incidentTypeCode: 'FIRE', title: '展厅烟雾', description: '发现烟雾' }) }))
    expect(get).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('事件已提交')
  })

  it('submits verification and response start from the mounted incident card', async () => {
    const get = vi.fn().mockResolvedValue({ data: { items: [entity('i-1', '展厅烟雾')] } }), post = vi.fn().mockResolvedValue({ data: entity('i-1', '展厅烟雾') })
    const wrapper = mountPage(IncidentFlowView, client(get, post), ['incident:read', 'incident:verify', 'incident:start-response'])
    await flushPromises()
    const textInputs = wrapper.findAll('input')
    await textInputs[0].setValue('现场确认'); await wrapper.findAll('button').find((button) => button.text() === '提交核实')!.trigger('click'); await flushPromises()
    await textInputs[1].setValue('plan-v1'); await textInputs[2].setValue('立即启动'); await wrapper.findAll('button').find((button) => button.text() === '启动预案')!.trigger('click'); await flushPromises()
    expect(post.mock.calls.map(([path]) => path)).toEqual(expect.arrayContaining(['/api/v1/incidents/{incidentId}/verify', '/api/v1/incidents/{incidentId}/start-response']))
    expect(get).toHaveBeenCalledTimes(3)
  })

  it('executes acknowledge, feedback, remind and complete from the mounted task page', async () => {
    const task = { ...entity('t-1', '疏散引导'), attributes: { name: '疏散引导', assigneeRef: 'u-1' } }
    const get = vi.fn().mockResolvedValue({ data: { items: [task] } }), post = vi.fn().mockResolvedValue({ data: task })
    const wrapper = mountPage(TaskFlowView, client(get, post), ['task:read', 'task:acknowledge', 'task:feedback', 'task:remind', 'task:complete'])
    await flushPromises()
    for (const label of ['接收任务', '催办', '完成任务']) { await wrapper.findAll('button').find((button) => button.text() === label)!.trigger('click'); await flushPromises() }
    await wrapper.get('summary').trigger('click'); await wrapper.get('textarea').setValue('已到位')
    await wrapper.findAll('button').find((button) => button.text() === '提交反馈')!.trigger('click'); await flushPromises()
    expect(post.mock.calls.map(([path]) => path)).toEqual(expect.arrayContaining(['/api/v1/tasks/{taskId}/acknowledge', '/api/v1/tasks/{taskId}/remind', '/api/v1/tasks/{taskId}/complete', '/api/v1/tasks/{taskId}/feedback']))
    expect(get.mock.calls.length).toBeGreaterThanOrEqual(5)
  })

  it('creates a temporary task from the mounted Web task form', async () => {
    const get = vi.fn().mockResolvedValue({ data: { items: [] } }), post = vi.fn().mockResolvedValue({ data: entity('t-2', '临时巡查') })
    const wrapper = mountPage(TaskFlowView, client(get, post), ['task:read', 'task:create'])
    await flushPromises(); await wrapper.get('button.primary').trigger('click')
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('临时巡查'); await inputs[1].setValue('u-2'); await inputs[2].setValue('2026-09-25T10:00')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/tasks', expect.objectContaining({ body: expect.objectContaining({ name: '临时巡查', assigneeRef: 'u-2' }) }))
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('uses the same controlled views for Web and H5 routes', async () => {
    const router = createAppRouter(auth(['incident:read', 'task:read']))
    await router.push('/web/incidents'); expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBe(IncidentFlowView)
    await router.push('/h5/events'); expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBe(IncidentFlowView)
    await router.push('/web/tasks'); expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBe(TaskFlowView)
    await router.push('/h5/tasks'); expect(router.currentRoute.value.matched.at(-1)?.components?.default).toBe(TaskFlowView)
  })

  it('shows H5 upload failure and retries the same selected file', async () => {
    const post = vi.fn().mockRejectedValueOnce(new ApiError('文件服务不可用', 503, 'UNAVAILABLE')).mockResolvedValue({ data: { id: 'file-1', attributes: { uploadUrl: 'https://upload.example/file-1' } } })
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetcher)
    const wrapper = mount(PlatformAttachmentField, { props: { modelValue: [], capture: true }, global: { provide: { [apiClientKey as symbol]: client(vi.fn() as ApiClient['get'], post) } } })
    const file = new File(['photo'], 'scene.jpg', { type: 'image/jpeg' })
    Object.defineProperty(wrapper.get('input').element, 'files', { value: [file] })
    await wrapper.get('input').trigger('change'); await flushPromises()
    expect(wrapper.text()).toContain('文件服务不可用')
    await wrapper.get('button').trigger('click'); await flushPromises()
    expect(post).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenCalledWith('https://upload.example/file-1', expect.objectContaining({ method: 'PUT', body: file }))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['file-1']])
    vi.unstubAllGlobals()
  })
})
