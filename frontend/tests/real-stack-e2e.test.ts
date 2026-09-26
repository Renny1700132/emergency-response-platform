import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import IncidentFlowView from '../src/views/IncidentFlowView.vue'
import TaskFlowView from '../src/views/TaskFlowView.vue'
import { createAuthContext, authContextKey } from '../src/shared/auth/auth-context'
import { createApiClient } from '../src/shared/http/api-client'
import { apiClientKey } from '../src/shared/http/api-context'
import { createResponseWorkflow } from '../src/features/response/workflow'
// @ts-expect-error The backend is an ESM JavaScript boundary exercised by this cross-package test.
import { createServer } from '../../backend/src/server.mjs'
// @ts-expect-error The backend config is an ESM JavaScript boundary exercised by this cross-package test.
import { loadConfig } from '../../backend/src/config.mjs'

const servers: Array<{ close(callback?: () => void): void }> = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(resolve))))
})

async function startRealStack() {
  const identityProvider = {
    async resolveBearer(token: string) {
      if (token !== 'g4-07-valid-token') return null
      return {
        actorId: 'commander',
        displayName: '值班指挥员',
        roles: ['emergency.read', 'emergency.write'],
        permissions: [
          'incident:create', 'incident:verify', 'incident:start-response',
          'task:create', 'task:acknowledge', 'task:feedback', 'task:complete', 'task:remind',
        ],
      }
    },
  }
  const planProvider = {
    async loadPublishedPlan() {
      return {
        id: 'plan-v1',
        templates: [{ name: '现场疏散', assigneeRef: 'commander', deadlineAt: '2026-09-26T12:00:00Z' }],
      }
    },
  }
  const messagePort = { async sendTask() { return { status: 'ACCEPTED', marker: 'SIMULATED_EVIDENCE' } } }
  const server = createServer({
    config: loadConfig({ NODE_ENV: 'development' }), identityProvider, planProvider, messagePort,
    logger: { info() {} },
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  servers.push(server)
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('backend did not expose a TCP port')
  const tokenProvider = async () => 'g4-07-valid-token'
  const baseUrl = `http://127.0.0.1:${address.port}`
  const api = createApiClient({ baseUrl, tokenProvider })
  const auth = createAuthContext(api, tokenProvider)
  await auth.bootstrap()
  return { api, auth, baseUrl }
}

describe('G4-07 real frontend/backend E2E', () => {
  it('runs the core incident closure through the formal client, Bearer identity, HTTP server and mounted pages', async () => {
    const { api, auth, baseUrl } = await startRealStack()
    expect(auth.status.value).toBe('authenticated')
    const provide = { [apiClientKey as symbol]: api, [authContextKey as symbol]: auth }

    const incidentPage = mount(IncidentFlowView, { props: { audience: 'web' }, global: { provide } })
    await vi.waitFor(() => expect(incidentPage.text()).toContain('暂无数据'))
    await incidentPage.get('button.primary').trigger('click')
    const reportInputs = incidentPage.findAll('input')
    await reportInputs[0].setValue('FIRE')
    await reportInputs[2].setValue('展厅烟雾')
    await incidentPage.get('textarea').setValue('现场发现烟雾')
    await incidentPage.get('form').trigger('submit')
    await vi.waitFor(() => expect(incidentPage.text()).toContain('展厅烟雾'))

    const workflow = createResponseWorkflow(api)
    let [incident] = await workflow.listIncidents()
    await workflow.verifyIncident(incident, 'CONFIRMED', '现场确认')
    ;[incident] = await workflow.listIncidents()
    await workflow.startResponse(incident, 'plan-v1', '立即启动')
    ;[incident] = await workflow.listIncidents()
    expect(incident.status).toBe('RESPONDING')

    const taskPage = mount(TaskFlowView, { props: { audience: 'h5' }, global: { provide } })
    await vi.waitFor(() => expect(taskPage.text()).toContain('现场疏散'))
    let [task] = await workflow.listTasks()
    await workflow.acknowledgeTask(task)
    ;[task] = await workflow.listTasks()
    await workflow.feedbackTask(task, { content: '已到位', progressPercent: 50 })
    ;[task] = await workflow.listTasks()
    await workflow.completeTask(task, '处置完成')
    ;[task] = await workflow.listTasks()
    expect(task.status).toBe('COMPLETED')

    await api.post('/api/v1/incidents/{incidentId}/close', {
      path: { incidentId: incident.id },
      body: { reason: '现场恢复安全', resourceVersion: incident.version, attributes: { reportRef: 'report-g4-07' } },
      idempotencyKey: 'g4-07-close-0001',
    })
    const [closed] = await workflow.listIncidents()
    expect(closed.status).toBe('CLOSED')

    const forbidden = createApiClient({
      baseUrl,
      tokenProvider: async () => 'invalid-token',
    })
    await expect(forbidden.get('/api/v1/incidents', { query: { page: 1, size: 50 } })).rejects.toMatchObject({ status: 403 })

    incidentPage.unmount()
    taskPage.unmount()
  })
})
