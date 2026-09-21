<script setup lang="ts">
import type { ModuleRoute } from '@/router/modules'
defineProps<{ module: ModuleRoute }>()
</script>
<template><section class="module-card"><span class="eyebrow">{{ module.id }} · 正式模块边界</span><h2>{{ module.title }}</h2><p>基础设施已就绪，具体业务闭环将在后续任务按 OpenAPI 契约接入。</p><dl><div><dt>需求范围</dt><dd>{{ module.requirements.join('、') }}</dd></div><div><dt>权限入口</dt><dd>{{ module.permissions.join('、') }}</dd></div><div><dt>数据来源</dt><dd>统一 API Client（不使用 Prototype Store / localStorage / Mock 作为正式数据）</dd></div></dl></section></template>
