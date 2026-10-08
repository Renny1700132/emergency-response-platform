<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { presentationState, type DemoRecord } from '@/shared/demo/presentation-state'
import { useApiClient } from '@/shared/http/api-context'
import { createResponseWorkflow, type WorkflowItem } from '@/features/response/workflow'
import { loadFormalModule } from '@/features/formal/module-workbench'

const activeFloor = ref('二层')
const presentation = import.meta.env.MODE === 'presentation'
const api = useApiClient()
const workflow = createResponseWorkflow(api)
const formalIncidents = ref<WorkflowItem[]>([])
const formalTasks = ref<WorkflowItem[]>([])
const formalSituation = ref<{ sites: number; positions: number; drills: string }>({ sites: 0, positions: 0, drills: '0' })
const formalStatus = ref('正在读取正式服务')
onMounted(async () => {
  if (presentation) return
  try {
    const [incidents, tasks, situation] = await Promise.all([workflow.listIncidents(), workflow.listTasks(), loadFormalModule(api, 'MOD-SITUATION')])
    formalIncidents.value = incidents
    formalTasks.value = tasks
    formalSituation.value = { sites: Number(situation.metrics[0]?.value ?? 0), positions: Number(situation.metrics[1]?.value ?? 0), drills: situation.metrics[2]?.value ?? '0' }
    formalStatus.value = '正式 API 已同步'
  } catch (error) { formalStatus.value = `正式服务不可用：${error instanceof Error ? error.message : '未知错误'}（未使用演示回退）` }
})
const floors = ['一层', '二层', '三层']
const clock = computed(() => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()))
type DashboardRecord = DemoRecord | WorkflowItem
const attribute = (record: DashboardRecord | undefined, key: string) => {
  if (!record) return ''
  const direct = (record as unknown as Record<string, unknown>)[key]
  const nested = 'attributes' in record ? record.attributes[key] : undefined
  return String(direct ?? nested ?? '')
}
const statusText: Record<string, string> = { PENDING: '待执行', ACKNOWLEDGED: '已接收', IN_PROGRESS: '处置中', COMPLETED: '已完成', PENDING_VERIFY: '待核实', VERIFIED: '已核实', RESPONDING: '处置中', CLOSED: '已关闭', REJECTED: '已驳回' }
const incidentSource = computed(() => presentation ? presentationState.incidents : formalIncidents.value)
const taskSource = computed(() => presentation ? presentationState.tasks : formalTasks.value)
const activeIncident = computed(() => incidentSource.value.find((item) => !['CLOSED', 'REJECTED'].includes(item.status)) ?? incidentSource.value[0])
const metrics = computed(() => [
  { label: '进行中事件', value: String(incidentSource.value.filter((item) => !['CLOSED', 'REJECTED'].includes(item.status)).length), trend: `${incidentSource.value.filter((item) => item.status === 'PENDING_VERIFY').length} 起待核实`, tone: 'orange', icon: '!' },
  { label: '处置任务', value: String(taskSource.value.length), trend: `${taskSource.value.filter((item) => item.status === 'COMPLETED').length} 项已完成`, tone: 'blue', icon: '✓' },
  { label: '资源站点', value: presentation ? '32' : String(formalSituation.value.sites), trend: presentation ? '演示数据' : `${formalSituation.value.positions} 个人员定位`, tone: 'green', icon: '⌁' },
  { label: '完成演练', value: presentation ? '17' : formalSituation.value.drills, trend: presentation ? '演示数据' : '正式统计接口', tone: 'purple', icon: '◉' },
])
const tasks = computed(() => taskSource.value.slice(0, 4).map((task) => ({
  title: attribute(task, 'title') || attribute(task, 'name'),
  owner: attribute(task, 'assignee') || attribute(task, 'assigneeRef') || '待分派',
  value: Number(attribute(task, 'progressPercent') || 0),
  state: statusText[task.status] ?? task.status,
})))
const timeline = computed(() => presentation ? [
  { time: clock.value.split(' ').at(-1) ?? '刚刚', title: presentationState.lastAction, text: `${presentationState.lastActor} · 已同步至 Web/H5 全流程`, tone: 'success' },
  { time: '13:42', title: '烟感与温度联动告警', text: '东展厅二层 · 自动关联事件 EVT-20260926-001', tone: 'danger' },
  { time: '13:44', title: '值班人员完成核实', text: '确认现场轻微烟雾，启动《展厅火情专项预案》', tone: 'warning' },
  { time: '13:45', title: '处置任务自动下发', text: '3 个任务已发送至移动端，消息回执 3/3', tone: 'info' },
] : activeIncident.value ? [{
  time: attribute(activeIncident.value, 'updatedAt') || '—',
  title: attribute(activeIncident.value, 'title') || activeIncident.value.id,
  text: `正式事件状态：${statusText[activeIncident.value.status] ?? activeIncident.value.status}`,
  tone: 'info',
}] : [])
</script>

<template>
  <section class="dashboard-page">
    <header class="hero-strip">
      <div><span class="eyebrow">EMERGENCY COMMAND CENTER</span><h2>应急态势总览</h2><p>{{ clock }} · {{ presentation ? `演示会话版本 ${presentationState.revision}` : formalStatus }}</p></div>
      <div class="hero-actions"><span class="live-pill"><i /> {{ presentation ? '实时更新' : '正式接口' }}</span><RouterLink class="primary" to="/web/incidents">进入事件处置</RouterLink></div>
    </header>
    <div class="metric-grid"><article v-for="item in metrics" :key="item.label" class="metric-card" :class="`tone-${item.tone}`"><span class="metric-icon">{{ item.icon }}</span><div><small>{{ item.label }}</small><strong>{{ item.value }}</strong><p>{{ item.trend }}</p></div></article></div>
    <div class="dashboard-grid">
      <article class="panel map-panel">
        <header class="panel-heading"><div><span class="panel-kicker">GIS 态势</span><h3>馆区应急一张图</h3></div><div v-if="presentation" class="segmented"><button v-for="floor in floors" :key="floor" :class="{ active: activeFloor === floor }" @click="activeFloor = floor">{{ floor }}</button></div></header>
        <div v-if="presentation" class="museum-map"><div class="map-grid"/><div class="building-zone zone-a"><b>东展厅</b><small>当前客流 328</small></div><div class="building-zone zone-b"><b>中央大厅</b><small>当前客流 192</small></div><div class="building-zone zone-c"><b>西展厅</b><small>当前客流 146</small></div><button class="map-marker danger" style="left:32%;top:30%"><span>!</span><em>烟感告警</em></button><button class="map-marker person" style="left:44%;top:57%"><span>3</span><em>处置人员</em></button><button class="map-marker supply" style="left:71%;top:67%"><span>+</span><em>物资站点</em></button><div class="map-legend"><span><i class="legend-danger"/>告警</span><span><i class="legend-person"/>人员</span><span><i class="legend-supply"/>物资</span><small>{{ activeFloor }}</small></div></div>
        <div v-else class="museum-map" data-evidence-mode="formal"><div class="map-grid"/><div class="building-zone zone-a"><b>正式资源接口</b><small>物资站点 {{ formalSituation.sites }}</small></div><div class="building-zone zone-b"><b>正式定位接口</b><small>人员定位 {{ formalSituation.positions }}</small></div><div class="map-legend"><small>未从正式接口取得的客流、告警和空间位置不会显示</small></div></div>
      </article>
      <article class="panel incident-panel">
        <header class="panel-heading"><div><span class="panel-kicker danger-text">ACTIVE INCIDENT</span><h3>{{ attribute(activeIncident, 'title') || '暂无进行中事件' }}</h3></div><span v-if="activeIncident" class="status-chip danger-chip">{{ statusText[activeIncident.status] ?? activeIncident.status }}</span></header><div class="incident-meta"><span>{{ activeIncident?.id ?? '—' }}</span><span>{{ presentation ? '演示联动' : '正式事件接口' }}</span></div>
        <div v-if="timeline.length" class="timeline"><div v-for="item in timeline" :key="`${item.time}-${item.title}`" class="timeline-item"><time>{{ item.time }}</time><i :class="item.tone"/><div><strong>{{ item.title }}</strong><p>{{ item.text }}</p></div></div></div><p v-else>正式接口当前无进行中事件及时间线记录。</p><RouterLink class="text-link" to="/web/incidents">查看完整处置链路 →</RouterLink>
      </article>
      <article class="panel task-panel"><header class="panel-heading"><div><span class="panel-kicker">TASK PROGRESS</span><h3>任务执行进度</h3></div><RouterLink class="text-link" to="/web/tasks">全部任务</RouterLink></header><div class="progress-list"><div v-for="task in tasks" :key="task.title" class="progress-item"><div class="progress-title"><div><strong>{{ task.title }}</strong><small>{{ task.owner }}</small></div><span>{{ task.state }}</span></div><div class="progress-track"><i :style="{ width: `${task.value}%` }"/></div><small>{{ task.value }}%</small></div></div></article>
      <article class="panel health-panel"><header class="panel-heading"><div><span class="panel-kicker">SYSTEM HEALTH</span><h3>关键系统状态</h3></div><span :class="presentation ? 'healthy' : ''">{{ presentation ? '演示状态' : '未提供聚合状态' }}</span></header><div v-if="presentation" class="health-grid"><div><i class="good"/><span>视频平台</span><b>在线</b></div><div><i class="good"/><span>消防系统</span><b>在线</b></div><div><i class="good"/><span>物联网</span><b>在线</b></div><div><i class="warn"/><span>客流系统</span><b>轻微延迟</b></div></div><p v-else>正式后端尚未提供外部系统健康聚合接口；页面不推断在线、延迟或成功率。</p></article>
    </div>
  </section>
</template>
