<script setup>
import StatusTag from '../../components/StatusTag.vue'
defineProps({module:{type:Object,required:true}})
</script>
<template>
<section class="page-stack">
  <div class="page-heading"><div class="module-icon">{{module.icon}}</div><div><h2>{{module.title}}</h2><p>{{module.description}}</p></div><StatusTag text="页面骨架"/></div>
  <div class="panel skeleton-panel">
    <div><small>需求追踪</small><strong>{{module.fr}}</strong><p>当前任务仅建立导航、页面布局和 Mock 接口入口；业务状态变化与完整操作闭环将在 G2-P03 实现。</p></div>
    <div class="skeleton-lines" aria-hidden="true"><span></span><span></span><span></span></div>
  </div>
</section>
</template>