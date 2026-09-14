<script setup>
import {reactive,ref} from 'vue'
import {state,actions} from '../../domain/prototypeStore.js'
import StatusTag from '../../components/StatusTag.vue'
const feedback=reactive({})
const message=ref('')
const act=fn=>{const r=fn();message.value=r.message||(r.ok?'操作成功':'操作未执行')}
</script>
<template><section class="h5-page"><div v-if="message" class="action-message">{{message}}</div>
<article v-for="task in state.tasks" :key="task.id" class="h5-card"><header><strong>{{task.title}}</strong><StatusTag :text="task.status"/></header><small>{{task.id}} · {{task.assignee}} · {{task.deadline}}</small><p>关联事件：{{task.eventId}}</p>
<button v-if="task.status==='待接收'" class="primary-button active" @click="act(()=>actions.acceptTask(task.id))">确认接收</button>
<template v-if="task.status==='执行中'"><input v-model="feedback[task.id]" :placeholder="task.feedback||'填写现场反馈'"><div class="button-row"><button class="secondary-button" @click="act(()=>actions.feedbackTask(task.id,feedback[task.id]||task.feedback))">提交反馈</button><button class="primary-button active" @click="act(()=>actions.completeTask(task.id))">完成任务</button></div></template>
<p v-if="task.feedback"><strong>反馈：</strong>{{task.feedback}}</p></article>
<div v-if="!state.tasks.length" class="h5-card empty">暂无任务，请先在 Web 端启动预案。</div></section></template>