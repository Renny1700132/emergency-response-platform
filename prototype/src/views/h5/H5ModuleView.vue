<script setup>defineProps({module:{type:Object,required:true}})</script>
<template>
<section class="h5-page">
  <div class="h5-module-hero"><span>{{module.icon}}</span><h2>{{module.title}}</h2><p>{{module.description}}</p></div>
  <div class="h5-card"><small>需求追踪</small><strong>{{module.fr}}</strong><p>当前为 H5 页面骨架。表单、状态校验和反馈闭环将在 G2-P03 按 spec/AC 实现。</p></div>
  <button class="primary-button" type="button" disabled>功能待 G2-P03 接入</button>
</section>
</template>