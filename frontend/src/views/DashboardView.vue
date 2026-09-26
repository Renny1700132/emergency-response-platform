<script setup lang="ts">
import { computed, ref } from 'vue'
import { presentationState, type DemoRecord } from '@/shared/demo/presentation-state'

const activeFloor = ref('二层')
const floors = ['一层', '二层', '三层']
const clock = computed(() => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()))
const attribute = (record: DemoRecord | undefined, key: string) => String(record?.attributes[key] ?? '')
const statusText: Record<string, string> = { PENDING: '待执行', ACKNOWLEDGED: '已接收', IN_PROGRESS: '处置中', COMPLETED: '已完成', PENDING_VERIFY: '待核实', VERIFIED: '已核实', RESPONDING: '处置中', CLOSED: '已关闭', REJECTED: '已驳回' }
const activeIncident = computed(() => presentationState.incidents.find((item) => !['CLOSED', 'REJECTED'].includes(item.status)) ?? presentationState.incidents[0])
const metrics = computed(() => [
  { label: '进行中事件', value: String(presentationState.incidents.filter((item) => !['CLOSED', 'REJECTED'].includes(item.status)).length), trend: `${presentationState.incidents.filter((item) => item.status === 'PENDING_VERIFY').length} 起待核实`, tone: 'orange', icon: '!' },
  { label: '处置任务', value: String(presentationState.tasks.length), trend: `${presentationState.tasks.filter((item) => item.status === 'COMPLETED').length} 项已完成`, tone: 'blue', icon: '✓' },
  { label: '在线设备', value: '286', trend: '在线率 98.6%', tone: 'green', icon: '⌁' },
  { label: '今日值守', value: '24', trend: '到岗率 100%', tone: 'purple', icon: '◉' },
])
const tasks = computed(() => presentationState.tasks.slice(0, 4).map((task) => ({ title: attribute(task, 'name'), owner: attribute(task, 'assigneeRef') || '待分派', value: Number(task.attributes.progressPercent ?? 0), state: statusText[task.status] ?? task.status })))
const timeline = computed(() => [
  { time: clock.value.split(' ').at(-1) ?? '刚刚', title: presentationState.lastAction, text: `${presentationState.lastActor} · 已同步至 Web/H5 全流程`, tone: 'success' },
  { time: '13:42', title: '烟感与温度联动告警', text: '东展厅二层 · 自动关联事件 EVT-20260926-001', tone: 'danger' },
  { time: '13:44', title: '值班人员完成核实', text: '确认现场轻微烟雾，启动《展厅火情专项预案》', tone: 'warning' },
  { time: '13:45', title: '处置任务自动下发', text: '3 个任务已发送至移动端，消息回执 3/3', tone: 'info' },
])
</script>

<template>
  <section class="dashboard-page">
    <header class="hero-strip">
      <div><span class="eyebrow">EMERGENCY COMMAND CENTER</span><h2>应急态势总览</h2><p>{{ clock }} · 会话内数据已实时互通（版本 {{ presentationState.revision }}）</p></div>
      <div class="hero-actions"><span class="live-pill"><i /> 实时更新</span><RouterLink class="primary" to="/web/incidents">进入事件处置</RouterLink></div>
    </header>
    <div class="metric-grid"><article v-for="item in metrics" :key="item.label" class="metric-card" :class="`tone-${item.tone}`"><span class="metric-icon">{{ item.icon }}</span><div><small>{{ item.label }}</small><strong>{{ item.value }}</strong><p>{{ item.trend }}</p></div></article></div>
    <div class="dashboard-grid">
      <article class="panel map-panel">
        <header class="panel-heading"><div><span class="panel-kicker">GIS 态势</span><h3>馆区应急一张图</h3></div><div class="segmented"><button v-for="floor in floors" :key="floor" :class="{ active: activeFloor === floor }" @click="activeFloor = floor">{{ floor }}</button></div></header>
        <div class="museum-map"><div class="map-grid"/><div class="building-zone zone-a"><b>东展厅</b><small>当前客流 328</small></div><div class="building-zone zone-b"><b>中央大厅</b><small>当前客流 192</small></div><div class="building-zone zone-c"><b>西展厅</b><small>当前客流 146</small></div><button class="map-marker danger" style="left:32%;top:30%"><span>!</span><em>烟感告警</em></button><button class="map-marker person" style="left:44%;top:57%"><span>3</span><em>处置人员</em></button><button class="map-marker supply" style="left:71%;top:67%"><span>+</span><em>物资站点</em></button><div class="map-legend"><span><i class="legend-danger"/>告警</span><span><i class="legend-person"/>人员</span><span><i class="legend-supply"/>物资</span><small>{{ activeFloor }}</small></div></div>
      </article>
      <article class="panel incident-panel">
        <header class="panel-heading"><div><span class="panel-kicker danger-text">ACTIVE INCIDENT</span><h3>{{ attribute(activeIncident, 'title') || '暂无进行中事件' }}</h3></div><span class="status-chip danger-chip">{{ statusText[activeIncident?.status ?? ''] ?? activeIncident?.status }}</span></header><div class="incident-meta"><span>{{ activeIncident?.id ?? '—' }}</span><span>全馆联动</span><span>实时同步</span></div>
        <div class="timeline"><div v-for="item in timeline" :key="item.time" class="timeline-item"><time>{{ item.time }}</time><i :class="item.tone"/><div><strong>{{ item.title }}</strong><p>{{ item.text }}</p></div></div></div><RouterLink class="text-link" to="/web/incidents">查看完整处置链路 →</RouterLink>
      </article>
      <article class="panel task-panel"><header class="panel-heading"><div><span class="panel-kicker">TASK PROGRESS</span><h3>任务执行进度</h3></div><RouterLink class="text-link" to="/web/tasks">全部任务</RouterLink></header><div class="progress-list"><div v-for="task in tasks" :key="task.title" class="progress-item"><div class="progress-title"><div><strong>{{ task.title }}</strong><small>{{ task.owner }}</small></div><span>{{ task.state }}</span></div><div class="progress-track"><i :style="{ width: `${task.value}%` }"/></div><small>{{ task.value }}%</small></div></div></article>
      <article class="panel health-panel"><header class="panel-heading"><div><span class="panel-kicker">SYSTEM HEALTH</span><h3>关键系统状态</h3></div><span class="healthy">运行正常</span></header><div class="health-grid"><div><i class="good"/><span>视频平台</span><b>在线</b></div><div><i class="good"/><span>消防系统</span><b>在线</b></div><div><i class="good"/><span>物联网</span><b>在线</b></div><div><i class="warn"/><span>客流系统</span><b>轻微延迟</b></div></div></article>
    </div>
  </section>
</template>
