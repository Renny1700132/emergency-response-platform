<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ModuleRoute } from '@/router/modules'

const props = defineProps<{ module: ModuleRoute }>()
const notice = ref(''), query = ref(''), showConfirm = ref(false)
const presentation = import.meta.env.MODE === 'presentation'
type ModuleContent = { kicker: string; description: string; metrics: { label: string; value: string; hint: string }[]; primary: string; secondary: string }
const contents: Record<string, ModuleContent> = {
  'MOD-PLAN': { kicker: 'PLAN ORCHESTRATION', description: '分层预案、流程任务、资源与通知对象统一编排，版本全程可追溯。', metrics: [{ label: '已发布预案', value: '18', hint: '综合 3 · 专项 6 · 现场 9' }, { label: '待审核版本', value: '3', hint: '平均审核时长 1.2 天' }, { label: '覆盖风险类型', value: '12', hint: '本月新增 2 类' }], primary: '新建预案', secondary: '版本对比' },
  'MOD-RESOURCE': { kicker: 'RESOURCE READINESS', description: '人员、物资站点和库存台账一体化管理，临期与差异及时预警。', metrics: [{ label: '物资站点', value: '32', hint: '全部已定位' }, { label: '台账物资', value: '1,286', hint: '可用率 96.8%' }, { label: '临期提醒', value: '7', hint: '30 天内到期' }], primary: '创建盘点计划', secondary: '导出台账' },
  'MOD-DRILL': { kicker: 'DRILL MANAGEMENT', description: '按月、季、年编排演练，自动下发任务并闭环评估与整改。', metrics: [{ label: '年度计划', value: '24', hint: '已完成 17 场' }, { label: '本月演练', value: '3', hint: '下一场 09-28' }, { label: '整改事项', value: '5', hint: '2 项即将到期' }], primary: '新建演练', secondary: '评估模板' },
  'MOD-DUTY': { kicker: 'DUTY & ATTENDANCE', description: '值班规则、二维码点位、到岗统计与缺卡告警形成完整值守闭环。', metrics: [{ label: '今日值守', value: '24', hint: '4 个值班小组' }, { label: '到岗率', value: '100%', hint: '全部正常' }, { label: '打卡点位', value: '18', hint: '在线 18/18' }], primary: '配置值班规则', secondary: '导出统计' },
  'MOD-KNOWLEDGE': { kicker: 'KNOWLEDGE BASE', description: '沉淀预案、处置案例、调查报告和应急知识，支撑快速检索与复用。', metrics: [{ label: '知识条目', value: '156', hint: '本月新增 12' }, { label: '处置案例', value: '38', hint: '已结构化归档' }, { label: '今日检索', value: '42', hint: '高频：火情处置' }], primary: '新增知识', secondary: '分类管理' },
  'MOD-INTEGRATION': { kicker: 'INTEGRATION HUB', description: '八类外部端口统一观测，明确回执、超时、失败与人工降级路径。', metrics: [{ label: '接入端口', value: '8', hint: '独立适配与审计' }, { label: '在线端口', value: '7', hint: '1 路轻微延迟' }, { label: '今日调用', value: '3,842', hint: '成功率 99.7%' }], primary: '接口健康检查', secondary: '调用日志' },
  'MOD-SITUATION': { kicker: 'SITUATION AWARENESS', description: '事件、人员、物资、视频与安防告警在同一空间视图联动呈现。', metrics: [{ label: '活跃事件', value: '2', hint: '1 起正在处置' }, { label: '在线终端', value: '286', hint: '在线率 98.6%' }, { label: '周边人员', value: '16', hint: '8 人已就位' }], primary: '进入全屏指挥', secondary: '态势快照' },
}
const content = computed(() => contents[props.module.id] ?? contents['MOD-PLAN'])
const rows = computed(() => {
  const data: Record<string, string[][]> = {
    'MOD-PLAN': [['展厅火情专项预案', '专项预案', 'V3.2', '已发布'], ['人员密集场所疏散预案', '综合预案', 'V2.5', '已发布'], ['地下库房漏水处置卡', '现场预案', 'V1.4', '审核中'], ['极端天气闭馆预案', '专项预案', 'V2.1', '草稿']],
    'MOD-RESOURCE': [['东展厅应急柜', '灭火器 / 呼吸面罩', '98%', '正常'], ['中央大厅物资点', '警戒带 / 扩音器', '92%', '正常'], ['地下库房物资点', '防汛沙袋 / 水泵', '84%', '待补充'], ['西展厅医疗点', '急救箱 / AED', '100%', '正常']],
    'MOD-DRILL': [['人员密集场所疏散演练', '2026-09-28', '安保一组', '待执行'], ['展厅初起火灾处置演练', '2026-09-18', '消防专班', '已完成'], ['极端天气闭馆演练', '2026-09-08', '运营中心', '整改中'], ['文物转移专项演练', '2026-10-12', '藏品管理部', '待发布']],
    'MOD-DUTY': [['安保一组', '08:00–16:00', '6 / 6', '全部到岗'], ['设备保障组', '08:00–16:00', '5 / 5', '全部到岗'], ['消防专班', '全天', '4 / 4', '全部到岗'], ['夜间巡检组', '16:00–24:00', '0 / 5', '未到时段']],
    'MOD-KNOWLEDGE': [['展厅火情初期处置要点', '处置指南', '2026-09-24', '1,284'], ['人员密集场所疏散案例', '典型案例', '2026-09-20', '956'], ['文物库房防汛检查清单', '检查清单', '2026-09-16', '632'], ['应急广播标准话术', '知识卡片', '2026-09-12', '518']],
    'MOD-INTEGRATION': [['EXT-VIDEO', '视频平台', '正常', '82 ms'], ['EXT-PUBLISH', '信息发布', '正常', '126 ms'], ['EXT-INTRUSION', '入侵报警', '正常', '94 ms'], ['EXT-ACCESS', '门禁系统', '正常', '108 ms'], ['EXT-FIRE', '消防系统', '正常', '76 ms'], ['EXT-IOT', '物联网平台', '正常', '115 ms'], ['EXT-MIDDLE', '统一中台', '正常', '68 ms'], ['EXT-MESSAGE', '消息通道', '轻微延迟', '420 ms']],
  }
  return (data[props.module.id] ?? []).filter((row) => row.join('').toLowerCase().includes(query.value.toLowerCase()))
})
const headings = computed(() => {
  const labels: Record<string, string[]> = {
    'MOD-PLAN': ['预案名称', '层级', '当前版本', '状态'], 'MOD-RESOURCE': ['站点', '核心物资', '完备率', '状态'], 'MOD-DRILL': ['演练计划', '计划日期', '责任团队', '状态'], 'MOD-DUTY': ['值班小组', '时段', '到岗', '状态'], 'MOD-KNOWLEDGE': ['知识标题', '分类', '更新时间', '浏览量'], 'MOD-INTEGRATION': ['端口代码', '外部系统', '状态', '延迟'],
  }
  return labels[props.module.id] ?? ['名称', '类型', '进度', '状态']
})
function action(label: string) { notice.value = `${label}已在演示模式中触发；正式提交将经过权限校验、二次确认与审计留痕。` }
</script>

<template>
  <section class="operations-page">
    <header class="module-hero"><div><span class="eyebrow">{{ content.kicker }} · {{ module.id }}</span><h2>{{ module.title }}</h2><p>{{ content.description }}</p><div class="trace-tags"><span v-for="item in module.requirements" :key="item">{{ item }}</span></div></div><div class="module-actions"><button class="secondary" @click="action(content.secondary)">{{ content.secondary }}</button><button class="primary" @click="action(content.primary)">＋ {{ content.primary }}</button></div></header>
    <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    <div v-if="!presentation" class="formal-boundary"><strong>正式 API 接线边界</strong><p>页面结构已就绪；当前未启用演示适配层，数据将由 G4-08 正式服务经类型化 API Client 提供。</p></div>
    <div class="module-metrics"><article v-for="metric in content.metrics" :key="metric.label"><small>{{ metric.label }}</small><strong>{{ metric.value }}</strong><p>{{ metric.hint }}</p></article></div>
    <div v-if="module.id === 'MOD-SITUATION'" class="situation-layout">
      <article class="panel situation-map"><header class="panel-heading"><div><span class="panel-kicker">LIVE MAP</span><h3>综合安防态势</h3></div><span class="live-pill"><i/> 30 秒刷新</span></header><div class="security-map"><div class="map-grid"/><div class="building-zone zone-a"><b>东展厅</b><small>告警 1</small></div><div class="building-zone zone-b"><b>中央大厅</b><small>设备 68</small></div><div class="building-zone zone-c"><b>西展厅</b><small>人员 12</small></div><span class="pulse alarm" style="left:30%;top:32%">!</span><span class="pulse camera" style="left:56%;top:45%">▶</span><span class="pulse access" style="left:72%;top:64%">↔</span></div></article>
      <article class="panel control-panel"><header class="panel-heading"><div><span class="panel-kicker danger-text">SECURITY CONTROL</span><h3>联动控制</h3></div></header><div class="video-placeholder"><span>▶</span><b>东展厅 · CAM-2F-018</b><small>模拟视频画面 · EXT-VIDEO</small></div><div class="control-list"><button @click="action('实时视频调阅')"><span>视频调阅</span><small>在线 · 82 ms</small></button><button class="warning-action" @click="showConfirm = true"><span>授权开启门禁</span><small>需二次确认与安全联锁</small></button><button @click="action('信息发布')"><span>发布疏散信息</span><small>统一发布接口</small></button></div></article>
    </div>
    <article v-else class="panel data-panel"><header class="panel-heading"><div><span class="panel-kicker">OPERATION RECORDS</span><h3>{{ module.title }}工作台</h3></div><label class="search-box"><span>⌕</span><input v-model="query" placeholder="搜索名称、状态或责任人"/></label></header><div class="data-table"><div class="table-row table-head"><b v-for="head in headings" :key="head">{{ head }}</b></div><button v-for="row in rows" :key="row[0]" class="table-row" @click="action(`查看${row[0]}详情`)"><span v-for="(cell,index) in row" :key="cell" :class="{ 'row-status': index === row.length - 1 }">{{ cell }}</span></button></div><footer class="table-footer"><span>共 {{ rows.length }} 条演示记录</span><div><button disabled>上一页</button><b>1</b><button disabled>下一页</button></div></footer></article>
    <div v-if="module.id === 'MOD-RESOURCE'" class="insight-grid"><article><span>临期物资</span><strong>7</strong><p>其中 2 项需在 7 天内处置</p></article><article><span>盘点差异</span><strong>3</strong><p>已保留快照与复核记录</p></article><article><span>待补充站点</span><strong>1</strong><p>地下库房物资点</p></article></div>
    <div v-if="module.id === 'MOD-DRILL'" class="calendar-strip"><div v-for="day in ['26 周六','27 周日','28 周一','29 周二','30 周三']" :key="day" :class="{ selected: day.startsWith('28') }"><small>09 月</small><b>{{ day }}</b><span v-if="day.startsWith('28')">疏散演练</span></div></div>
    <div v-if="showConfirm" class="modal-backdrop" @click.self="showConfirm = false"><section class="confirm-dialog"><span class="confirm-icon">!</span><h3>确认发送门禁开启指令？</h3><p>该操作将通过既有门禁接口发送授权请求，必须等待安全联锁回执。拒绝、超时或联锁失败将进入人工降级处置。</p><div><button class="secondary" @click="showConfirm = false">取消</button><button class="danger-button" @click="showConfirm = false; action('门禁开启指令')">确认并发送</button></div></section></div>
  </section>
</template>
