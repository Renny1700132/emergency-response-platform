<script setup>
import {ref} from 'vue'
import {state,actions} from '../../domain/prototypeStore.js'
import StatusTag from '../../components/StatusTag.vue'
const message=ref('')
const act=(fn)=>{const result=fn();message.value=result.message||(result.ok?'操作成功':'操作未执行')}
</script>
<template><section class="page-stack">
<div class="page-heading"><div class="module-icon">事</div><div><h2>事件处置</h2><p>上报、核实、启动、任务反馈和关闭</p></div><RouterLink class="primary-link" to="/h5/report">H5 上报事件</RouterLink></div>
<div v-if="message" class="action-message">{{message}}</div>
<article v-for="event in state.events" :key="event.id" class="panel incident-card">
<header><div><h2>{{event.title}}</h2><p>{{event.id}} · {{event.type}} · {{event.location}}</p></div><StatusTag :text="event.status"/></header>
<p>{{event.description}}</p>
<div class="button-row">
<button v-if="event.status==='待核实'" class="primary-button active" @click="act(()=>actions.verifyIncident(event.id,true))">核实通过</button>
<button v-if="event.status==='待核实'" class="secondary-button" @click="act(()=>actions.verifyIncident(event.id,false))">驳回</button>
<button v-if="event.status==='已核实'" class="primary-button active" @click="act(()=>actions.startIncident(event.id))">启动预案并生成任务</button>
<button v-if="event.status==='处置中'" class="primary-button active" @click="act(()=>actions.closeIncident(event.id))">关闭并归档</button>
<RouterLink v-if="event.status==='处置中'" class="secondary-link" to="/web/tasks">查看关联任务</RouterLink>
</div>
<details><summary>处置时间线（{{event.timeline.length}}）</summary><ol class="timeline"><li v-for="item in event.timeline" :key="item.time+item.label"><time>{{item.time}}</time><div><strong>{{item.label}}</strong><p>{{item.detail}}</p></div></li></ol></details>
</article></section></template>