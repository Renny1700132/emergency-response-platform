<script setup lang="ts">
import { computed, ref } from 'vue'

const activeFloor = ref('二层')
const floors = ['一层', '二层', '三层']
const clock = computed(() => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()))
const metrics = [
  { label: '进行中事件', value: '2', trend: '1 起待核实', tone: 'orange', icon: '!' },
  { label: '处置任务', value: '12', trend: '9 项按时推进', tone: 'blue', icon: '✓' },
  { label: '在线设备', value: '286', trend: '在线率 98.6%', tone: 'green', icon: '⌁' },
  { label: '今日值守', value: '24', trend: '到岗率 100%', tone: 'purple', icon: '◉' },
]
const tasks = [
  { title: '疏散东展厅游客', owner: '安保一组', value: 70, state: '处置中' },
  { title: '确认消防通道状态', owner: '设备保障组', value: 45, state: '已接收' },
  { title: '准备临时警戒物资', owner: '物资保障组', value: 10, state: '待执行' },
]
const timeline = [
  { time: '13:42', title: '烟感与温度联动告警', text: '东展厅二层 · 自动关联事件 EVT-20260926-001', tone: 'danger' },
  { time: '13:44', title: '值班人员完成核实', text: '确认现场轻微烟雾，启动《展厅火情专项预案》', tone: 'warning' },
  { time: '13:45', title: '处置任务自动下发', text: '3 个任务已发送至移动端，消息回执 3/3', tone: 'info' },
  { time: '13:49', title: '现场反馈', text: '安保一组已抵达，游客疏散进度 70%', tone: 'success' },
]
</script>

<template>
  <section class="dashboard-page">
    <header class="hero-strip">
      <div><span class="eyebrow">EMERGENCY COMMAND CENTER</span><h2>应急态势总览</h2><p>{{ clock }} · 全馆运行态势稳定，1 起事件正在处置</p></div>
      <div class="hero-actions"><span class="live-pill"><i /> 实时更新</span><RouterLink class="primary" to="/web/incidents">进入事件处置</RouterLink></div>
    </header>
    <div class="metric-grid"><article v-for="item in metrics" :key="item.label" class="metric-card" :class="`tone-${item.tone}`"><span class="metric-icon">{{ item.icon }}</span><div><small>{{ item.label }}</small><strong>{{ item.value }}</strong><p>{{ item.trend }}</p></div></article></div>
    <div class="dashboard-grid">
      <article class="panel map-panel">
        <header class="panel-heading"><div><span class="panel-kicker">GIS 态势</span><h3>馆区应急一张图</h3></div><div class="segmented"><button v-for="floor in floors" :key="floor" :class="{ active: activeFloor === floor }" @click="activeFloor = floor">{{ floor }}</button></div></header>
        <div class="museum-map"><div class="map-grid"/><div class="building-zone zone-a"><b>东展厅</b><small>当前客流 328</small></div><div class="building-zone zone-b"><b>中央大厅</b><small>当前客流 192</small></div><div class="building-zone zone-c"><b>西展厅</b><small>当前客流 146</small></div><button class="map-marker danger" style="left:32%;top:30%"><span>!</span><em>烟感告警</em></button><button class="map-marker person" style="left:44%;top:57%"><span>3</span><em>处置人员</em></button><button class="map-marker supply" style="left:71%;top:67%"><span>+</span><em>物资站点</em></button><div class="map-legend"><span><i class="legend-danger"/>告警</span><span><i class="legend-person"/>人员</span><span><i class="legend-supply"/>物资</span><small>{{ activeFloor }}</small></div></div>
      </article>
      <article class="panel incident-panel">
        <header class="panel-heading"><div><span class="panel-kicker danger-text">ACTIVE INCIDENT</span><h3>东展厅烟感异常</h3></div><span class="status-chip danger-chip">处置中</span></header><div class="incident-meta"><span>EVT-20260926-001</span><span>二层东展厅</span><span>P2 较大</span></div>
        <div class="timeline"><div v-for="item in timeline" :key="item.time" class="timeline-item"><time>{{ item.time }}</time><i :class="item.tone"/><div><strong>{{ item.title }}</strong><p>{{ item.text }}</p></div></div></div><RouterLink class="text-link" to="/web/incidents">查看完整处置链路 →</RouterLink>
      </article>
      <article class="panel task-panel"><header class="panel-heading"><div><span class="panel-kicker">TASK PROGRESS</span><h3>任务执行进度</h3></div><RouterLink class="text-link" to="/web/tasks">全部任务</RouterLink></header><div class="progress-list"><div v-for="task in tasks" :key="task.title" class="progress-item"><div class="progress-title"><div><strong>{{ task.title }}</strong><small>{{ task.owner }}</small></div><span>{{ task.state }}</span></div><div class="progress-track"><i :style="{ width: `${task.value}%` }"/></div><small>{{ task.value }}%</small></div></div></article>
      <article class="panel health-panel"><header class="panel-heading"><div><span class="panel-kicker">SYSTEM HEALTH</span><h3>关键系统状态</h3></div><span class="healthy">运行正常</span></header><div class="health-grid"><div><i class="good"/><span>视频平台</span><b>在线</b></div><div><i class="good"/><span>消防系统</span><b>在线</b></div><div><i class="good"/><span>物联网</span><b>在线</b></div><div><i class="warn"/><span>客流系统</span><b>轻微延迟</b></div></div></article>
    </div>
  </section>
</template>
