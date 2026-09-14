<script setup>
import {computed,ref} from 'vue'
import {useRoute} from 'vue-router'
import PrototypeBadge from '../components/PrototypeBadge.vue'
import {webModules} from '../router/index.js'
const route=useRoute()
const collapsed=ref(false)
const currentTitle=computed(()=>route.meta.title||'应急管理')
</script>
<template>
<div class="web-shell" :class="{'is-collapsed':collapsed}">
  <aside class="sidebar">
    <div class="brand"><div class="brand-mark">应</div><div class="brand-copy"><strong>应急管理子系统</strong><small>智能运营中心</small></div></div>
    <nav aria-label="Web 主菜单">
      <RouterLink to="/web/dashboard" class="nav-item"><span>舱</span><b>应急驾驶舱</b></RouterLink>
      <RouterLink v-for="item in webModules" :key="item.path" :to="`/web/${item.path}`" class="nav-item"><span>{{item.icon}}</span><b>{{item.title}}</b></RouterLink>
    </nav>
  </aside>
  <section class="workspace">
    <header class="topbar">
      <button class="icon-button" type="button" aria-label="切换菜单" @click="collapsed=!collapsed">☰</button>
      <div><small>某自然博物馆</small><h1>{{currentTitle}}</h1></div>
      <div class="topbar-actions"><PrototypeBadge/><RouterLink to="/h5/home" class="surface-link">打开 H5</RouterLink><span class="avatar">指</span></div>
    </header>
    <main class="content"><RouterView/></main>
  </section>
</div>
</template>