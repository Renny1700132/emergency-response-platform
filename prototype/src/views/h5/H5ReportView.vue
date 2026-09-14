<script setup>
import {reactive,ref} from 'vue'
import {actions} from '../../domain/prototypeStore.js'
const form=reactive({title:'',type:'消防告警',location:'东区展厅',description:''})
const message=ref('')
const submit=()=>{const r=actions.reportIncident(form);message.value=r.ok?`已创建 ${r.event.id}，等待 Web 核实`:r.message;if(r.ok){form.title='';form.description=''}}
</script>
<template><section class="h5-page"><div class="h5-module-hero"><span>报</span><h2>事件上报</h2><p>G2-FR-013、021 · 图片仅使用 Mock 引用</p></div>
<div v-if="message" class="action-message">{{message}}</div><form class="h5-card form-stack" @submit.prevent="submit">
<label>事件名称<input v-model="form.title" placeholder="例如：展厅发现异常烟雾"></label>
<label>事件类型<select v-model="form.type"><option>消防告警</option><option>客流异常</option><option>设备异常</option><option>其他事件</option></select></label>
<label>发生地点<input v-model="form.location"></label><label>情况说明<textarea v-model="form.description" rows="3" placeholder="填写现场情况"></textarea></label>
<div class="mock-upload">＋ 模拟拍照附件<br><small>不调用相机，不表示附件已真实上传</small></div>
<button class="primary-button active" type="submit">提交事件</button></form></section></template>