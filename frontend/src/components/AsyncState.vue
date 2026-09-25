<script setup lang="ts">
defineProps<{ state: 'loading' | 'empty' | 'forbidden' | 'failure'; message?: string; traceId?: string }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div class="async-state" :class="`state-${state}`" role="status">
    <strong>{{ state === 'loading' ? '正在加载' : state === 'empty' ? '暂无数据' : state === 'forbidden' ? '无权访问' : '加载失败' }}</strong>
    <p>{{ message ?? (state === 'empty' ? '当前范围内没有可显示的记录。' : '请稍后重试。') }}</p>
    <small v-if="traceId">追踪号：{{ traceId }}</small>
    <button v-if="state === 'failure'" type="button" @click="$emit('retry')">重新加载</button>
  </div>
</template>
