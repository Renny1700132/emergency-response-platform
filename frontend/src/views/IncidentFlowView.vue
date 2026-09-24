<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AsyncState from '@/components/AsyncState.vue'
import AttachmentRefsField from '@/components/AttachmentRefsField.vue'
import { useAuthContext } from '@/shared/auth/auth-context'
import { useApiClient } from '@/shared/http/api-context'
import { createResponseWorkflow, visibleError, type VisibleError, type WorkflowItem } from '@/features/response/workflow'

defineProps<{ audience: 'web' | 'h5' }>()
const auth = useAuthContext()
const workflow = createResponseWorkflow(useApiClient())
const incidents = ref<WorkflowItem[]>([])
const loading = ref(true), error = ref<VisibleError | null>(null), busy = ref(''), notice = ref('')
const reportOpen = ref(false)
const report = reactive({ incidentTypeCode: '', title: '', description: '', occurredAt: new Date().toISOString().slice(0, 16), attachmentFileIds: [] as string[] })
const verification = reactive({ reason: '', decision: 'CONFIRMED' as 'CONFIRMED' | 'REJECTED' })
const response = reactive({ planVersionId: '', reason: '' })

const can = (permission: string) => auth.hasAnyPermission([permission])
async function load() {
  loading.value = true; error.value = null
  try { incidents.value = await workflow.listIncidents() } catch (cause) { error.value = visibleError(cause) } finally { loading.value = false }
}
async function run(key: string, operation: () => Promise<unknown>, message: string) {
  busy.value = key; error.value = null; notice.value = ''
  try { await operation(); notice.value = message; await load() } catch (cause) { error.value = visibleError(cause) } finally { busy.value = '' }
}
async function submitReport() {
  await run('report', () => workflow.reportIncident({ ...report, occurredAt: new Date(report.occurredAt).toISOString() }), '事件已提交，状态以服务端返回为准。')
  if (!error.value) reportOpen.value = false
}
onMounted(load)
</script>

<template>
  <section class="flow-page">
    <header class="flow-heading"><div><span class="eyebrow">G2-FR-013 / 014 · 正式 API</span><h2>事件处置</h2><p>上报、核实并启动预案；每次写操作均以服务端结果刷新状态。</p></div><button v-if="can('incident:create')" class="primary" @click="reportOpen = !reportOpen">{{ reportOpen ? '取消上报' : '上报事件' }}</button><span v-else class="permission-note">无事件上报权限</span></header>
    <form v-if="reportOpen" class="action-form" @submit.prevent="submitReport"><h3>事件上报</h3><div class="form-grid"><label>事件类型代码<input v-model.trim="report.incidentTypeCode" required /></label><label>发生时间<input v-model="report.occurredAt" type="datetime-local" required /></label><label class="wide">标题<input v-model.trim="report.title" required /></label><label class="wide">描述<textarea v-model.trim="report.description" required rows="3" /></label><AttachmentRefsField v-model="report.attachmentFileIds" class="wide" /></div><button class="primary" :disabled="busy === 'report'">{{ busy === 'report' ? '提交中…' : '提交上报' }}</button></form>
    <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    <AsyncState v-if="loading" state="loading" message="正在从事件 API 获取授权范围内数据。" />
    <AsyncState v-else-if="error" :state="error.kind" :message="error.message" :trace-id="error.traceId" @retry="load" />
    <AsyncState v-else-if="incidents.length === 0" state="empty" />
    <div v-else class="record-grid"><article v-for="incident in incidents" :key="incident.id" class="record-card"><header><div><h3>{{ incident.title }}</h3><small>{{ incident.id }}</small></div><span class="status-chip">{{ incident.status }}</span></header><p>{{ incident.description || '暂无描述' }}</p><dl><div><dt>发生时间</dt><dd>{{ incident.occurredAt || '—' }}</dd></div><div><dt>附件</dt><dd>{{ incident.attachmentFileIds.length ? incident.attachmentFileIds.join('、') : '无' }}</dd></div><div><dt>资源版本</dt><dd>{{ incident.version }}</dd></div></dl>
      <details><summary>核实 / 启动处置</summary><div class="inline-actions"><label>核实结论<select v-model="verification.decision"><option value="CONFIRMED">确认事件</option><option value="REJECTED">驳回</option></select></label><label>核实说明<input v-model.trim="verification.reason" /></label><button :disabled="!can('incident:verify') || busy === `verify-${incident.id}`" @click="run(`verify-${incident.id}`, () => workflow.verifyIncident(incident, verification.decision, verification.reason), '核实操作已提交。')">{{ can('incident:verify') ? '提交核实' : '无核实权限' }}</button></div><div class="inline-actions"><label>预案版本 ID<input v-model.trim="response.planVersionId" /></label><label>启动说明<input v-model.trim="response.reason" /></label><button :disabled="!can('incident:start-response') || !response.planVersionId || busy === `start-${incident.id}`" @click="run(`start-${incident.id}`, () => workflow.startResponse(incident, response.planVersionId, response.reason), '预案启动请求已提交。')">{{ can('incident:start-response') ? '启动预案' : '无启动权限' }}</button></div></details>
    </article></div>
  </section>
</template>
