<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthContext } from '@/shared/auth/auth-context'
import { moduleRoutes } from '@/router/modules'
import { activeDemoRole, demoRoles, presentationState, switchDemoRole } from '@/shared/demo/presentation-state'
const route = useRoute(), auth = useAuthContext(), collapsed = ref(false)
const title = computed(() => String(route.meta.title ?? '应急管理'))
const navigation = moduleRoutes.filter((item) => item.audience === 'web')
const presentation = import.meta.env.MODE === 'presentation'
const demoRole = computed(activeDemoRole)
</script>
<template>
  <div class="web-shell" :class="{ collapsed }">
    <aside class="sidebar"><div class="brand"><span>应</span><div><strong>应急管理子系统</strong><small>智能运营中心</small></div></div>
      <nav><RouterLink to="/web/overview"><b>总</b><span>态势总览</span></RouterLink><RouterLink v-for="item in navigation" :key="item.path" :to="`/web/${item.path}`"><b>{{ item.shortTitle.slice(0, 1) }}</b><span>{{ item.title }}</span></RouterLink></nav>
      <footer class="sidebar-footer"><span class="system-dot"/><div><strong>系统运行正常</strong><small>版本 G4 · Sprint 2</small></div></footer>
    </aside>
    <section class="workspace"><header class="topbar"><button aria-label="折叠菜单" @click="collapsed = !collapsed">☰</button><div><small>某自然博物馆 · 智能运营中心</small><h1>{{ title }}</h1></div><span v-if="presentation" class="demo-badge">演示数据 · 实时互通</span><div class="topbar-tools"><label v-if="presentation" class="role-switcher">演示角色<select :value="presentationState.activeRoleId" @change="switchDemoRole(($event.target as HTMLSelectElement).value)"><option v-for="role in demoRoles" :key="role.id" :value="role.id">{{ role.name }}</option></select></label><button aria-label="消息" class="tool-button">♢<i>3</i></button><span class="divider"/><div class="identity"><span class="avatar">{{ presentation ? demoRole.short : '指' }}</span><div><b>{{ presentation ? demoRole.name : (auth.user.value?.displayName ?? '身份待接入') }}</b><small>{{ presentation ? demoRole.team : '应急指挥中心' }}</small></div><RouterLink to="/h5/events">H5</RouterLink></div></div></header><main><RouterView /></main></section>
  </div>
</template>
