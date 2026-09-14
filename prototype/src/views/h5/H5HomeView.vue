<script setup>
import {computed} from 'vue'
import {h5Modules} from '../../router/index.js'
import {state} from '../../domain/prototypeStore.js'
const pending=computed(()=>state.tasks.filter(x=>x.status!=='已完成').length)
</script>
<template><section class="h5-page"><div class="h5-welcome"><small>下午好，值班人员</small><h2>移动应急</h2><p>所有数据均为课程模拟</p></div>
<div class="h5-actions"><RouterLink v-for="item in h5Modules" :key="item.path" :to="`/h5/${item.path}`"><span>{{item.icon}}</span><strong>{{item.title}}</strong><small>{{item.description}}</small></RouterLink></div>
<div class="h5-card"><header><strong>待处理任务</strong><span>{{pending}}</span></header><p>Web 启动预案后会在这里生成 Mock 处置任务。</p></div></section></template>