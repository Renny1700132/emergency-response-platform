<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthContext } from '@/shared/auth/auth-context'
import { moduleRoutes } from '@/router/modules'
const route = useRoute(), auth = useAuthContext()
const title = computed(() => String(route.meta.title ?? '移动应急'))
const navigation = moduleRoutes.filter((item) => item.audience === 'h5').slice(0, 4)
</script>
<template><div class="h5-stage"><section class="phone-shell"><header class="h5-header"><div><strong>{{ title }}</strong><small>{{ auth.user.value?.displayName ?? '身份待接入' }}</small></div><RouterLink to="/web/incidents">Web</RouterLink></header><main><RouterView /></main><nav class="h5-tabs"><RouterLink v-for="item in navigation" :key="item.path" :to="`/h5/${item.path}`">{{ item.shortTitle }}</RouterLink></nav></section></div></template>
