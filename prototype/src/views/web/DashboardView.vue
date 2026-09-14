<script setup>
import StatusTag from '../../components/StatusTag.vue'
import {state,actions} from '../../domain/prototypeStore.js'
</script>
<template>
<section class="page-stack">
<div class="notice"><strong>原型边界：</strong>当前业务及外部连接均为课程模拟，不构成真实联调、性能或验收证据。<button class="text-button" @click="actions.reset()">重置演示数据</button></div>
<div class="metric-grid">
<article><small>当前事件</small><strong>{{state.events.length}}</strong><span>待核实、处置与关闭</span></article>
<article><small>待办任务</small><strong>{{state.tasks.filter(x=>x.status!=='已完成').length}}</strong><span>本地 Mock 状态</span></article>
<article><small>有效打卡</small><strong>{{state.checkins.filter(x=>x.status==='有效').length}}</strong><span>模拟扫码结果</span></article>
<article><small>盘点差异</small><strong>{{state.inventory.difference??'—'}}</strong><span>东区物资站</span></article>
</div>
<div class="panel-grid">
<article class="panel"><header><div><h2>事件动态</h2><p>G2-FR-004、013—016</p></div><RouterLink to="/web/incidents">进入处置</RouterLink></header>
<div class="event-list"><div v-for="event in state.events.slice(0,4)" :key="event.id" class="event-row"><div><strong>{{event.title}}</strong><small>{{event.id}} · {{event.location}}</small></div><StatusTag :text="event.status"/></div></div></article>
<article class="panel"><header><div><h2>指挥态势</h2><p>人员、视频与物资 Mock</p></div><RouterLink to="/web/situation">打开态势</RouterLink></header>
<div class="map-placeholder"><span class="map-ring"></span><b>东区展厅</b><small>定位坐标与视频画面均为模拟数据</small></div></article>
</div>
<article class="panel"><header><div><h2>外部能力状态</h2><p>真实接口均待后续集成验证</p></div><RouterLink to="/web/integrations">系统对接</RouterLink></header>
<div class="adapter-grid"><div v-for="item in state.adapters" :key="item.key"><strong>{{item.name}}</strong><StatusTag :text="item.status"/><small>{{item.note}}</small></div></div></article>
</section>
</template>