<script setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'
const route=useRoute()
const currentTitle=computed(()=>route.meta.title||'移动应急')
</script>
<template>
<div class="h5-stage">
  <div class="phone-shell">
    <header class="h5-header"><RouterLink to="/web/dashboard" aria-label="返回 Web 端">‹</RouterLink><div><strong>{{currentTitle}}</strong><small>H5 嵌入预览 · Mock</small></div><span>•••</span></header>
    <main class="h5-content"><RouterView/></main>
    <nav class="h5-tabs" aria-label="H5 快捷菜单"><RouterLink to="/h5/home">首页</RouterLink><RouterLink to="/h5/report">上报</RouterLink><RouterLink to="/h5/tasks">任务</RouterLink><RouterLink to="/h5/checkin">打卡</RouterLink></nav>
  </div>
  <p class="h5-note">本页面模拟嵌入既有智慧管理 APP，不代表独立原生 APP。</p>
</div>
</template>