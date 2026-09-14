<script setup>
import {onMounted,ref} from 'vue'
import StatusTag from '../../components/StatusTag.vue'
import {mockApi} from '../../services/mockApi.js'
const dashboard=ref(null)
onMounted(async()=>{dashboard.value=await mockApi.getDashboard()})
</script>
<template>
<section v-if="dashboard" class="page-stack">
  <div class="notice"><strong>原型边界：</strong>当前全部业务及外部连接均为课程模拟，不构成真实联调、性能或验收证据。</div>
  <div class="metric-grid">
    <article><small>处置中事件</small><strong>{{dashboard.summary.activeEvents}}</strong><span>含待核实和待反馈</span></article>
    <article><small>待办任务</small><strong>{{dashboard.summary.pendingTasks}}</strong><span>模拟任务数据</span></article>
    <article><small>当前值班</small><strong>{{dashboard.summary.onDutyPeople}}</strong><span>模拟组织数据</span></article>
    <article><small>物资提醒</small><strong>{{dashboard.summary.materialAlerts}}</strong><span>临期/库存提醒</span></article>
  </div>
  <div class="panel-grid">
    <article class="panel">
      <header><div><h2>事件动态</h2><p>对应 G2-FR-004、013—016</p></div><RouterLink to="/web/incidents">查看全部</RouterLink></header>
      <div class="event-list"><div v-for="event in dashboard.events" :key="event.id" class="event-row"><div><strong>{{event.title}}</strong><small>{{event.id}} · {{event.updatedAt}}</small></div><StatusTag :text="event.status"/></div></div>
    </article>
    <article class="panel">
      <header><div><h2>指挥态势</h2><p>静态地图占位</p></div><StatusTag text="模拟连接"/></header>
      <div class="map-placeholder"><span class="map-ring"></span><b>东区展厅</b><small>人员、视频、物资图层待 G2-P03 交互化</small></div>
    </article>
  </div>
  <article class="panel">
    <header><div><h2>外部能力状态</h2><p>真实接口均待后续集成验证</p></div><RouterLink to="/web/integrations">进入对接状态</RouterLink></header>
    <div class="adapter-grid"><div v-for="item in dashboard.adapters" :key="item.key"><strong>{{item.name}}</strong><StatusTag :text="item.status"/><small>{{item.note}}</small></div></div>
  </article>
</section>
<div v-else class="loading">正在载入 Mock 数据…</div>
</template>