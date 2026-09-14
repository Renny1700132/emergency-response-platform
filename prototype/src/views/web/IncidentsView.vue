<script setup>
import {reactive,ref} from 'vue'
import {state,actions} from '../../domain/prototypeStore.js'
import StatusTag from '../../components/StatusTag.vue'
const message=ref('')
const closureForms=reactive(Object.fromEntries(state.events.map(event=>[event.id,{evaluation:event.closure?.evaluation||'',investigation:event.closure?.investigation||'',reportTitle:event.closure?.reportTitle||'',knowledgeNote:event.closure?.knowledgeNote||''}])))
const ensureForm=event=>{if(!closureForms[event.id])closureForms[event.id]={evaluation:'',investigation:'',reportTitle:'',knowledgeNote:''};return closureForms[event.id]}
const act=fn=>{const result=fn();message.value=result.message||(result.ok?'操作成功':'操作未执行')}
</script>
<template><section class="page-stack">
<div class="page-heading"><div class="module-icon">事</div><div><h2>事件处置</h2><p>上报、核实、启动、任务反馈、关闭材料和归档</p></div><RouterLink class="primary-link" to="/h5/report">H5 上报事件</RouterLink></div>
<div v-if="message" class="action-message">{{message}}</div>
<article v-for="event in state.events" :key="event.id" class="panel incident-card">
<header><div><h2>{{event.title}}</h2><p>{{event.id}} · {{event.type}} · {{event.location}}</p></div><StatusTag :text="event.status"/></header><p>{{event.description}}</p>
<div class="button-row">
<button v-if="event.status==='待核实'" class="primary-button active" @click="act(()=>actions.verifyIncident(event.id,true))">核实通过</button>
<button v-if="event.status==='待核实'" class="secondary-button" @click="act(()=>actions.verifyIncident(event.id,false))">驳回</button>
<button v-if="event.status==='已核实'" class="primary-button active" @click="act(()=>actions.startIncident(event.id))">启动预案并生成任务</button>
<RouterLink v-if="event.status==='处置中'" class="secondary-link" to="/web/tasks">查看关联任务</RouterLink>
</div>
<section v-if="event.status==='处置中'" class="closure-panel">
<header><div><h3>关闭材料（Mock）</h3><p>评估、调查和报告完成后才允许关闭事件</p></div><StatusTag :text="event.closure?.status||'待填写'"/></header>
<div v-if="event.closure?.status!=='材料已完成'" class="closure-form">
<label>评估结论<textarea :value="ensureForm(event).evaluation" @input="ensureForm(event).evaluation=$event.target.value" rows="2" placeholder="填写处置效果与结论"></textarea></label>
<label>调查记录<textarea :value="ensureForm(event).investigation" @input="ensureForm(event).investigation=$event.target.value" rows="2" placeholder="填写原因和证据摘要"></textarea></label>
<label>事件报告名称<input :value="ensureForm(event).reportTitle" @input="ensureForm(event).reportTitle=$event.target.value" placeholder="例如：事件处置报告（模拟）"></label>
<label>知识条目<input :value="ensureForm(event).knowledgeNote" @input="ensureForm(event).knowledgeNote=$event.target.value" placeholder="可选"></label>
<button class="secondary-button" @click="act(()=>actions.submitClosure(event.id,ensureForm(event)))">保存关闭材料</button>
</div>
<div v-else class="closure-summary"><p><strong>评估：</strong>{{event.closure.evaluation}}</p><p><strong>调查：</strong>{{event.closure.investigation}}</p><p><strong>报告：</strong>{{event.closure.reportTitle}}</p></div>
<button class="primary-button active" @click="act(()=>actions.closeIncident(event.id))">关闭并归档</button>
</section>
<section v-if="event.status==='已关闭'&&event.closure" class="closure-summary"><h3>关闭记录（Mock）</h3><p><strong>评估：</strong>{{event.closure.evaluation}}</p><p><strong>调查：</strong>{{event.closure.investigation}}</p><p><strong>报告：</strong>{{event.closure.reportTitle}}</p></section>
<details><summary>处置时间线（{{event.timeline.length}}）</summary><ol class="timeline"><li v-for="item in event.timeline" :key="item.time+item.label"><time>{{item.time}}</time><div><strong>{{item.label}}</strong><p>{{item.detail}}</p></div></li></ol></details>
</article></section></template>
