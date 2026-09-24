import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { AuthContext } from '@/shared/auth/auth-context'
import WebLayout from '@/layouts/WebLayout.vue'
import H5Layout from '@/layouts/H5Layout.vue'
import ModuleBoundaryView from '@/views/ModuleBoundaryView.vue'
import AccessStateView from '@/views/AccessStateView.vue'
import IncidentFlowView from '@/views/IncidentFlowView.vue'
import TaskFlowView from '@/views/TaskFlowView.vue'
import { moduleRoutes } from './modules'

const children = (audience: 'web' | 'h5'): RouteRecordRaw[] => moduleRoutes.filter((item) => item.audience === audience).map((item) => ({
  path: item.path,
  component: item.id === 'MOD-EVENT' ? IncidentFlowView : item.id === 'MOD-TASK' ? TaskFlowView : ModuleBoundaryView,
  props: item.id === 'MOD-EVENT' || item.id === 'MOD-TASK' ? { audience: item.audience } : { module: item },
  meta: { title: item.title, requiresAuth: true, permissions: item.permissions },
}))

export function createAppRouter(auth: AuthContext) {
  const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes: [
    { path: '/', redirect: '/web/incidents' },
    { path: '/web', component: WebLayout, children: children('web') },
    { path: '/h5', component: H5Layout, children: children('h5') },
    { path: '/auth-required', component: AccessStateView, props: { kind: 'auth' }, meta: { title: '需要登录' } },
    { path: '/forbidden', component: AccessStateView, props: { kind: 'forbidden' }, meta: { title: '无访问权限' } },
    { path: '/:pathMatch(.*)*', redirect: '/web/incidents' },
  ] })

  router.beforeEach(async (to) => {
    if (!to.meta.requiresAuth) return true
    await auth.bootstrap()
    if (auth.status.value !== 'authenticated') return { path: '/auth-required', query: { redirect: to.fullPath } }
    const required = Array.isArray(to.meta.permissions) ? to.meta.permissions as string[] : []
    if (!auth.hasAnyPermission(required)) return { path: '/forbidden' }
    return true
  })
  router.afterEach((to) => { document.title = `${String(to.meta.title ?? '应急管理')} · ${import.meta.env.VITE_APP_TITLE ?? '博物馆智能运营中心'}` })
  return router
}
