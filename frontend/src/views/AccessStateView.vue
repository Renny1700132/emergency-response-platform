<script setup lang="ts">
defineProps<{ kind: 'auth' | 'forbidden' }>()
</script>
<template><main class="access-state"><div><span class="eyebrow">{{ kind === 'auth' ? 'AUTH REQUIRED' : 'ACCESS DENIED' }}</span><h1>{{ kind === 'auth' ? '请从统一门户或智慧管理 APP 进入' : '当前账号无访问权限' }}</h1><p>{{ kind === 'auth' ? '正式工程只接收宿主或统一中台注入的短期令牌，不在浏览器持久化登录态。' : '请联系管理员核对角色与数据权限。' }}</p></div></main></template>
