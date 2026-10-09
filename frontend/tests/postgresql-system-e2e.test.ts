import { mount, type VueWrapper } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import IncidentFlowView from '../src/views/IncidentFlowView.vue'
import OperationsModuleView from '../src/views/OperationsModuleView.vue'
import TaskFlowView from '../src/views/TaskFlowView.vue'
import PlatformAttachmentField from '../src/components/PlatformAttachmentField.vue'
import { createAuthContext, authContextKey } from '../src/shared/auth/auth-context'
import { createApiClient } from '../src/shared/http/api-client'
import { apiClientKey } from '../src/shared/http/api-context'
import { createResponseWorkflow } from '../src/features/response/workflow'
import { moduleRoutes } from '../src/router/modules'
// @ts-expect-error The backend is an ESM JavaScript boundary exercised by this cross-package test.
import { createServer } from '../../backend/src/server.mjs'
// @ts-expect-error The backend config is an ESM JavaScript boundary exercised by this cross-package test.
import { loadConfig } from '../../backend/src/config.mjs'
// @ts-expect-error The database is an ESM JavaScript boundary exercised by this cross-package test.
import { createDatabase } from '../../backend/src/database.mjs'
// @ts-expect-error The Sprint 2 service is an ESM JavaScript boundary exercised by this cross-package test.
import { createSprint2Service } from '../../backend/src/sprint2-service.mjs'
// @ts-expect-error The Sprint 2 persistence is an ESM JavaScript boundary exercised by this cross-package test.
import { createSprint2Persistence } from '../../backend/src/sprint2-persistence.mjs'

const enabled = process.env.G5_SYSTEM_POSTGRES === 'true'
const databaseUrl = process.env.G4_DATABASE_URL ?? ''
const wrappers: VueWrapper[] = []
let server: ReturnType<typeof createServer>
let database: ReturnType<typeof createDatabase>
let api: ReturnType<typeof createApiClient>
let auth: ReturnType<typeof createAuthContext>
let persistence: ReturnType<typeof createSprint2Persistence>
let adapterCalls: Array<Record<string, unknown>> = []

const allTables = [
  'em_message_delivery', 'em_incident_closure', 'em_task_feedback', 'em_task_assignment_history',
  'em_response_task', 'em_verification_action', 'em_incident', 'em_task_template', 'em_plan_version',
  'em_idempotency_record', 'em_outbox_event', 'em_audit_log', 'em_plan_type', 'em_plan',
  'em_incident_type', 'em_incident_update', 'em_person_ref', 'em_emergency_group',
  'em_position_snapshot', 'em_material_site', 'em_stock_ledger', 'em_inventory_plan',
  'em_drill_plan', 'em_drill_execution', 'em_evaluation_template', 'em_duty_schedule',
  'em_check_point', 'em_attendance_record', 'em_attendance_alert', 'em_knowledge_item',
  'em_verification_config', 'em_external_alert', 'em_video_reference', 'em_control_command',
  'em_external_call_log', 'em_situation_projection',
]

const route = (id: string) => {
  const found = moduleRoutes.find((item) => item.id === id && item.audience === 'web')
  if (!found) throw new Error(`route ${id} is unavailable`)
  return found
}

describe.skipIf(!enabled)('G5-01 Web/H5 to HTTP to PostgreSQL system package', () => {
  beforeAll(async () => {
    if (!databaseUrl) throw new Error('G4_DATABASE_URL is required for the PostgreSQL system package')
    const parsed = new URL(databaseUrl)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) || parsed.pathname !== '/emergency_g4_test') {
      throw new Error('PostgreSQL system package only permits localhost/emergency_g4_test')
    }
    database = createDatabase({ databaseUrl })
    await database.query(`TRUNCATE TABLE ${allTables.join(', ')} RESTART IDENTITY CASCADE`)
    await database.query(
      `INSERT INTO em_plan_version (id,status,version_label,published_at) VALUES ($1,'PUBLISHED',$2,now())`,
      ['plan-system-v1', 'system-v1'],
    )
    await database.query(
      `INSERT INTO em_task_template (plan_version_id,sequence_no,name,assignee_ref,deadline_minutes)
       VALUES ($1,1,$2,$3,30)`,
      ['plan-system-v1', '系统级疏散任务', 'commander'],
    )

    persistence = createSprint2Persistence(database)
    await Promise.all([
      persistence.save('plan', { id: 'plan-ui-1', name: '数据库预案', level: '专项预案', version: 1, status: 'PUBLISHED' }),
      persistence.save('materialSite', { id: 'site-ui-1', name: '数据库物资站', floor: '1F', x: 10, y: 20, status: 'ACTIVE' }),
      persistence.save('materialLedger', { id: 'ledger-ui-1', siteId: 'site-ui-1', itemId: 'mask', quantity: 8, version: 1 }),
      persistence.save('person', { id: 'person-ui-1', name: '系统测试人员', active: true }),
      persistence.save('position', { id: 'position-ui-1', personId: 'person-ui-1', x: 11, y: 21, freshness: 'FRESH' }),
      persistence.save('drillPlan', { id: 'drill-ui-1', name: '数据库疏散演练', scheduledAt: '2026-10-10T01:00:00Z', ownerRef: 'commander', status: 'ISSUED' }),
      persistence.save('dutySchedule', { id: 'duty-ui-1', name: '数据库值班计划', startAt: '2026-10-09T00:00:00Z', endAt: '2026-10-09T08:00:00Z', status: 'ACTIVE' }),
      persistence.save('attendanceRecord', { id: 'attendance-ui-1', actorId: 'commander', status: 'VALID' }),
      persistence.save('attendanceAlert', { id: 'attendance-alert-ui-1', personId: 'backup', status: 'OPEN' }),
      persistence.save('knowledgeItem', { id: 'knowledge-ui-1', title: '数据库应急知识', category: '处置指南', publishedAt: '2026-10-09T00:00:00Z', status: 'PUBLISHED' }),
    ])

    const sprint2Service = createSprint2Service({
      persistence,
      adapters: {
        async invoke(adapter: string, action: string, payload: unknown, context: Record<string, unknown>) {
          adapterCalls.push({ adapter, action, payload, context })
          return { status: 'ACCEPTED', interlock: 'ALLOWED', receiptId: 'access-receipt-system-1', marker: 'SIMULATED_EVIDENCE' }
        },
      },
    })
    const identityProvider = {
      async resolveBearer(token: string) {
        if (token !== 'g5-system-valid-token') return null
        return {
          actorId: 'commander', displayName: '值班指挥员', roles: ['emergency.read', 'emergency.write'],
          organizationId: 'museum-ops', dataScopes: ['museum'],
          permissions: [
            'incident:create', 'incident:verify', 'incident:start-response',
            'task:create', 'task:acknowledge', 'task:feedback', 'task:complete', 'task:remind',
            'plan:read', 'resource:read', 'drill:read', 'duty:read', 'knowledge:read', 'situation:read',
          ],
        }
      },
    }
    const messagePort = {
      async sendTask() {
        return { status: 'ACCEPTED', platformMessageId: 'message-system-1', marker: 'SIMULATED_EVIDENCE' }
      },
    }
    server = createServer({
      config: loadConfig({ NODE_ENV: 'development' }), database, identityProvider, messagePort, sprint2Service,
      logger: { info() {} },
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('backend did not expose a TCP port')
    const tokenProvider = async () => 'g5-system-valid-token'
    api = createApiClient({ baseUrl: `http://127.0.0.1:${address.port}`, tokenProvider })
    auth = createAuthContext(api, tokenProvider)
    await auth.bootstrap()
  }, 30_000)

  afterAll(async () => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()))
    if (database) await database.close()
  })

  it('proves the core positive and negative flow through mounted Web/H5 pages, HTTP and PostgreSQL', async () => {
    expect(auth.status.value).toBe('authenticated')
    const provide = { [apiClientKey as symbol]: api, [authContextKey as symbol]: auth }
    const incidentPage = mount(IncidentFlowView, { props: { audience: 'web' }, global: { provide } })
    wrappers.push(incidentPage)
    await vi.waitFor(() => expect(incidentPage.text()).toContain('暂无数据'))
    await incidentPage.get('button.primary').trigger('click')
    const reportInputs = incidentPage.findAll('input')
    await reportInputs[0].setValue('FIRE')
    await reportInputs[2].setValue('系统级数据库烟雾事件')
    await incidentPage.get('textarea').setValue('Web 页面提交后必须写入 PostgreSQL')
    await incidentPage.get('form').trigger('submit')
    await vi.waitFor(() => expect(incidentPage.text()).toContain('系统级数据库烟雾事件'))

    const storedIncident = (await database.query(
      `SELECT id,incident_no,status,created_by,incident_type_code,title FROM em_incident WHERE title=$1`,
      ['系统级数据库烟雾事件'],
    )).rows[0]
    expect(storedIncident).toMatchObject({ status: 'PENDING_VERIFICATION', created_by: 'commander', incident_type_code: 'FIRE' })
    expect(storedIncident.incident_no).toMatch(/^INC-/)

    const workflow = createResponseWorkflow(api)
    let [incident] = await workflow.listIncidents()
    await workflow.verifyIncident(incident, 'CONFIRMED', '系统级现场核实通过')
    const verification = (await database.query(
      `SELECT decision,reason,actor_id,occurred_at FROM em_verification_action WHERE incident_id=$1`,
      [incident.id],
    )).rows[0]
    expect(verification).toMatchObject({ decision: 'VERIFIED', reason: '系统级现场核实通过', actor_id: 'commander' })
    expect(verification.occurred_at).toBeTruthy()

    ;[incident] = await workflow.listIncidents()
    await workflow.startResponse(incident, 'plan-system-v1', '系统级启动')
    const linkedIncident = (await database.query(
      `SELECT status,plan_version_id FROM em_incident WHERE id=$1`, [incident.id],
    )).rows[0]
    const generatedTask = (await database.query(
      `SELECT id,incident_id,name,assignee_ref,deadline_at,status,delivery_status,version FROM em_response_task WHERE incident_id=$1`,
      [incident.id],
    )).rows[0]
    expect(linkedIncident).toEqual({ status: 'RESPONDING', plan_version_id: 'plan-system-v1' })
    expect(generatedTask).toMatchObject({ incident_id: incident.id, name: '系统级疏散任务', assignee_ref: 'commander', status: 'PENDING', delivery_status: 'ACCEPTED' })
    expect(generatedTask.deadline_at).toBeTruthy()

    const taskPage = mount(TaskFlowView, { props: { audience: 'h5' }, global: { provide } })
    wrappers.push(taskPage)
    await vi.waitFor(() => expect(taskPage.text()).toContain('系统级疏散任务'))
    await taskPage.get('.card-actions button').trigger('click')
    await vi.waitFor(async () => {
      const row = (await database.query(`SELECT status FROM em_response_task WHERE id=$1`, [generatedTask.id])).rows[0]
      expect(row.status).toBe('ACKNOWLEDGED')
    })
    const acknowledgedAudit = (await database.query(
      `SELECT action,outcome,actor_id FROM em_audit_log WHERE target_id=$1 AND action='TASK_ACKNOWLEDGED'`,
      [generatedTask.id],
    )).rows[0]
    expect(acknowledgedAudit).toMatchObject({ action: 'TASK_ACKNOWLEDGED', outcome: 'allowed', actor_id: 'commander' })

    const details = taskPage.get('details')
    details.element.open = true
    await taskPage.get('details textarea').setValue('H5 已到位并上传现场照片')
    await taskPage.get('details input[type="number"]').setValue(60)
    taskPage.getComponent(PlatformAttachmentField).vm.$emit('update:modelValue', ['file-system-1'])
    await taskPage.vm.$nextTick()
    const feedbackButton = taskPage.findAll('details button').find((button) => button.text() === '提交反馈')
    if (!feedbackButton) throw new Error('H5 feedback button was not found')
    await feedbackButton.trigger('click')
    await vi.waitFor(() => expect(taskPage.text()).toContain('任务反馈已提交'))
    const [task] = await workflow.listTasks()
    const feedback = (await database.query(
      `SELECT task_id,actor_id,content,progress_percent,attachment_file_ids,occurred_at FROM em_task_feedback WHERE task_id=$1`,
      [task.id],
    )).rows[0]
    expect(feedback).toMatchObject({ task_id: task.id, actor_id: 'commander', content: 'H5 已到位并上传现场照片', progress_percent: 60, attachment_file_ids: ['file-system-1'] })
    expect(feedback.occurred_at).toBeTruthy()
    expect((await database.query(`SELECT status FROM em_response_task WHERE id=$1`, [task.id])).rows[0].status).toBe('IN_PROGRESS')

    const createSearchCandidate = async (suffix: string, input: { incidentTypeCode: string; title: string; description: string; occurredAt: string }, responding: boolean) => {
      const created = await api.post('/api/v1/incidents', {
        body: input,
        idempotencyKey: `g5-system-search-${suffix}`,
      })
      const candidate = created.data
      if (!candidate?.id) throw new Error(`search candidate ${suffix} was not created`)
      if (responding) {
        await api.post('/api/v1/incidents/{incidentId}/verify', {
          path: { incidentId: candidate.id },
          body: { decision: 'CONFIRMED', reason: `检索反例 ${suffix} 核实`, resourceVersion: 1 },
          idempotencyKey: `g5-system-search-${suffix}-verify`,
        })
        await api.post('/api/v1/incidents/{incidentId}/start-response', {
          path: { incidentId: candidate.id },
          body: { planVersionId: 'plan-system-v1', resourceVersion: 2, reason: `检索反例 ${suffix} 启动` },
          idempotencyKey: `g5-system-search-${suffix}-start`,
        })
      }
      return candidate.id
    }
    const excludedIds = [
      await createSearchCandidate('status', { incidentTypeCode: 'FIRE', title: '数据库烟雾状态反例', description: '仅状态不匹配', occurredAt: '2026-10-09T02:00:00Z' }, false),
      await createSearchCandidate('type', { incidentTypeCode: 'WATER', title: '数据库烟雾类型反例', description: '仅类型不匹配', occurredAt: '2026-10-09T02:01:00Z' }, true),
      await createSearchCandidate('keyword', { incidentTypeCode: 'FIRE', title: '展厅温度异常', description: '仅关键字不匹配', occurredAt: '2026-10-09T02:02:00Z' }, true),
      await createSearchCandidate('time', { incidentTypeCode: 'FIRE', title: '数据库烟雾时间反例', description: '仅时间不匹配', occurredAt: '2025-12-31T23:59:59Z' }, true),
    ]
    const allIncidentIds = (await database.query(`SELECT id FROM em_incident ORDER BY id`)).rows.map((row: { id: string }) => row.id)
    expect(allIncidentIds).toHaveLength(5)
    expect(allIncidentIds).toEqual(expect.arrayContaining([incident.id, ...excludedIds]))

    const filtered = await api.get('/api/v1/incidents', {
      query: { page: 1, size: 50, status: 'RESPONDING', incidentTypeCode: 'FIRE', keyword: '数据库烟雾', occurredFrom: '2026-01-01T00:00:00Z' },
    } as never)
    expect(filtered.data?.total).toBe(1)
    const filteredIds = filtered.data?.items?.map((item) => item.id) ?? []
    expect(filteredIds).toEqual([incident.id])
    for (const excludedId of excludedIds) expect(filteredIds).not.toContain(excludedId)

    const forbidden = createApiClient({
      baseUrl: apiBaseUrl(), tokenProvider: async () => 'g5-system-invalid-token',
    })
    const beforeDenied = Number((await database.query(`SELECT count(*)::int AS count FROM em_incident`)).rows[0].count)
    await expect(forbidden.post('/api/v1/incidents', {
      body: { incidentTypeCode: 'FIRE', title: '禁止写入', description: '无权限', occurredAt: '2026-10-09T00:00:00Z' },
      idempotencyKey: 'g5-system-denied-create',
    })).rejects.toMatchObject({ status: 403, code: 'AUTH_FORBIDDEN' })
    expect(Number((await database.query(`SELECT count(*)::int AS count FROM em_incident`)).rows[0].count)).toBe(beforeDenied)
    expect(Number((await database.query(`SELECT count(*)::int AS count FROM em_audit_log WHERE action='event.write' AND outcome='denied'`)).rows[0].count)).toBe(1)
  }, 30_000)

  it('renders all remaining MVP formal workbenches from PostgreSQL and completes confirmed access control after interlock receipt', async () => {
    const provide = { [apiClientKey as symbol]: api, [authContextKey as symbol]: auth }
    const expectations: Array<[string, string]> = [
      ['MOD-PLAN', '数据库预案'], ['MOD-RESOURCE', '数据库物资站'], ['MOD-DRILL', '数据库疏散演练'],
      ['MOD-DUTY', '数据库值班计划'], ['MOD-KNOWLEDGE', '数据库应急知识'], ['MOD-SITUATION', '数据库物资站'],
    ]
    for (const [moduleId, expectedText] of expectations) {
      const wrapper = mount(OperationsModuleView, { props: { module: route(moduleId) }, global: { provide } })
      wrappers.push(wrapper)
      await vi.waitFor(() => expect(wrapper.text()).toContain(expectedText))
      expect(wrapper.text()).toContain('正式 API 模式')
    }

    const situation = wrappers.at(-1)
    if (!situation) throw new Error('situation workbench was not mounted')
    const input = situation.get('input[placeholder="输入正式门禁编号"]')
    await input.setValue('DOOR-SYSTEM-01')
    expect(adapterCalls).toHaveLength(0)
    expect(Number((await database.query(`SELECT count(*)::int AS count FROM em_control_command`)).rows[0].count)).toBe(0)
    await situation.get('button.warning-action').trigger('click')
    expect(situation.text()).toContain('必须等待安全联锁回执')
    expect(adapterCalls).toHaveLength(0)
    await situation.get('button.danger-button').trigger('click')
    await vi.waitFor(() => expect(situation.text()).toContain('门禁控制回执：ACCEPTED'))
    expect(adapterCalls).toHaveLength(1)
    expect(adapterCalls[0]).toMatchObject({ adapter: 'EXT-ACCESS', action: 'ACCESS_CONTROL' })
    const command = (await database.query(`SELECT payload FROM em_control_command`)).rows[0].payload
    expect(command).toMatchObject({ targetId: 'DOOR-SYSTEM-01', confirmedBy: 'commander', status: 'ACCEPTED' })
    expect(command.receipt).toMatchObject({ interlock: 'ALLOWED', receiptId: 'access-receipt-system-1' })
  }, 30_000)
})

function apiBaseUrl() {
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('backend did not expose a TCP port')
  return `http://127.0.0.1:${address.port}`
}
