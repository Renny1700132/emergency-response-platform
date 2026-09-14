<script setup>
import {ref} from 'vue'
import {state,actions} from '../../domain/prototypeStore.js'
import StatusTag from '../../components/StatusTag.vue'
const message=ref('')
const act=fn=>{const result=fn();message.value=result.message||(result.ok?'操作成功':'操作未执行')}
const notification=alert=>state.notificationRecords.find(item=>item.alertId===alert.id)
</script>
<template><section class="page-stack">
<div class="page-heading"><div class="module-icon">卡</div><div><h2>打卡与异常提醒</h2><p>有效/拒绝记录、缺卡检测、Mock 通知与人工降级</p></div><div class="button-row"><RouterLink class="primary-link" to="/h5/checkin">打开 H5 扫码</RouterLink><button class="secondary-button" @click="act(()=>actions.detectAttendanceException())">模拟检测缺卡/超时</button></div></div>
<div v-if="message" class="action-message">{{message}}</div>
<article class="panel"><header><div><h2>异常提醒</h2><p>统一消息仅为 Mock，不构成真实发送或到达率证据</p></div><StatusTag text="模拟消息"/></header>
<div v-for="alert in state.attendanceAlerts" :key="alert.id" class="alert-row"><div><strong>{{alert.type}}：{{alert.person}}</strong><small>{{alert.point}} · {{alert.detectedAt}}</small><p>{{notification(alert)?.channel}}：{{notification(alert)?.status}}；尝试 {{notification(alert)?.attempts}} 次</p><p>{{notification(alert)?.note}}</p></div><div><StatusTag :text="alert.status"/><button v-if="alert.status==='通知待重试'" class="secondary-button" @click="act(()=>actions.retryAttendanceNotification(alert.id))">Mock 重试</button></div></div>
<p v-if="!state.attendanceAlerts.length" class="empty">尚未检测到缺卡/超时，可点击上方按钮演示。</p></article>
<div class="table-card"><table><thead><tr><th>人员</th><th>点位</th><th>时间</th><th>结果</th><th>校验说明</th></tr></thead><tbody><tr v-for="row in state.checkins" :key="row.id"><td>{{row.person}}</td><td>{{row.point}}</td><td>{{row.time}}</td><td><StatusTag :text="row.status"/></td><td>{{row.reason}}</td></tr><tr v-if="!state.checkins.length"><td colspan="5" class="empty">暂无扫码记录，请从 H5 模拟扫码。</td></tr></tbody></table></div>
</section></template>
