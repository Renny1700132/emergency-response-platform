import type { ApiClient } from '@/shared/http/api-client'

export type FormalMetric = { label: string; value: string; hint: string }
export type FormalModuleSnapshot = {
  metrics: FormalMetric[]
  headings: string[]
  rows: string[][]
  evidence: string
}

type Page = { items?: Record<string, unknown>[]; total?: number }
type RecordValue = Record<string, unknown>
const unwrap = (value: unknown): unknown => value && typeof value === 'object' && 'data' in value ? (value as RecordValue).data : value
const page = (value: unknown) => (unwrap(value) ?? {}) as Page
const record = (value: unknown) => (unwrap(value) ?? {}) as RecordValue
const text = (value: unknown, fallback = '—') => value === undefined || value === null || value === '' ? fallback : String(value)
const total = (value: unknown) => Number(page(value).total ?? page(value).items?.length ?? 0)
const items = (value: unknown) => page(value).items ?? []

export async function loadFormalModule(api: ApiClient, moduleId: string): Promise<FormalModuleSnapshot> {
  if (moduleId === 'MOD-PLAN') {
    const result = await api.get('/api/v1/plans', { query: { page: 1, size: 50 } })
    return {
      metrics: [{ label: '正式预案', value: text(total(result)), hint: '来源：正式 API' }],
      headings: ['预案名称', '层级', '版本', '状态'],
      rows: items(result).map((item) => [text(item.name), text(item.level), text(item.version), text(item.status)]),
      evidence: 'GET /api/v1/plans',
    }
  }
  if (moduleId === 'MOD-RESOURCE') {
    const [sites, ledgers, persons, positions] = await Promise.all([
      api.get('/api/v1/material-sites', { query: { page: 1, size: 50 } }),
      api.get('/api/v1/material-ledgers', { query: { page: 1, size: 50 } }),
      api.get('/api/v1/persons', { query: { page: 1, size: 50 } }),
      api.get('/api/v1/positions/latest', { query: { page: 1, size: 50 } }),
    ])
    return {
      metrics: [
        { label: '物资站点', value: text(total(sites)), hint: '正式台账' },
        { label: '物资记录', value: text(total(ledgers)), hint: '正式台账' },
        { label: '人员 / 定位', value: `${total(persons)} / ${total(positions)}`, hint: '最新定位' },
      ],
      headings: ['站点', '楼层', '坐标', '状态'],
      rows: items(sites).map((item) => [text(item.name), text(item.floor), `${text(item.x)}, ${text(item.y)}`, text(item.status, '有效')]),
      evidence: 'GET material-sites / material-ledgers / persons / positions/latest',
    }
  }
  if (moduleId === 'MOD-DRILL') {
    const result = await api.get('/api/v1/drill-plans', { query: { page: 1, size: 50 } })
    return {
      metrics: [{ label: '演练计划', value: text(total(result)), hint: '正式 API' }],
      headings: ['演练名称', '计划时间', '责任人', '状态'],
      rows: items(result).map((item) => [text(item.name), text(item.scheduledAt), text(item.ownerRef), text(item.status, '待下发')]),
      evidence: 'GET /api/v1/drill-plans',
    }
  }
  if (moduleId === 'MOD-DUTY') {
    const [schedules, records, alerts] = await Promise.all([
      api.get('/api/v1/duty-schedules', { query: { page: 1, size: 50 } }),
      api.get('/api/v1/attendance/records', { query: { page: 1, size: 50 } }),
      api.get('/api/v1/attendance/alerts', { query: { page: 1, size: 50 } }),
    ])
    return {
      metrics: [
        { label: '值班计划', value: text(total(schedules)), hint: '正式排班' },
        { label: '有效签到', value: text(total(records)), hint: '正式记录' },
        { label: '签到告警', value: text(total(alerts)), hint: '待处置告警' },
      ],
      headings: ['值班名称', '开始时间', '结束时间', '状态'],
      rows: items(schedules).map((item) => [text(item.name), text(item.startAt), text(item.endAt), text(item.status, '有效')]),
      evidence: 'GET duty-schedules / attendance/records / attendance/alerts',
    }
  }
  if (moduleId === 'MOD-KNOWLEDGE') {
    const result = await api.get('/api/v1/knowledge-items', { query: { page: 1, size: 50 } })
    return {
      metrics: [{ label: '已发布知识', value: text(total(result)), hint: '正式知识库' }],
      headings: ['标题', '分类', '发布时间', '状态'],
      rows: items(result).map((item) => [text(item.title), text(item.category), text(item.publishedAt), text(item.status)]),
      evidence: 'GET /api/v1/knowledge-items',
    }
  }
  if (moduleId === 'MOD-SITUATION') {
    const [map, statistics] = await Promise.all([
      api.get('/api/v1/situation/resource-map'),
      api.get('/api/v1/statistics/emergency'),
    ])
    const mapValue = record(map), stats = record(statistics)
    const sites = Array.isArray(mapValue.sites) ? mapValue.sites as RecordValue[] : []
    const positions = Array.isArray(mapValue.positions) ? mapValue.positions as RecordValue[] : []
    return {
      metrics: [
        { label: '物资站点', value: text(sites.length), hint: '正式资源一张图' },
        { label: '人员定位', value: text(positions.length), hint: '最新位置' },
        { label: '已完成演练', value: text(stats.drillsCompleted, '0'), hint: `生成于 ${text(stats.generatedAt)}` },
      ],
      headings: ['对象', '类型', '位置', '可调度'],
      rows: [...sites.map((item) => [text(item.name), '物资站点', `${text(item.x)}, ${text(item.y)}`, '是']), ...positions.map((item) => [text(item.personId), '人员', `${text(item.x)}, ${text(item.y)}`, item.usableForDispatch ? '是' : '否'])],
      evidence: 'GET situation/resource-map / statistics/emergency',
    }
  }
  return {
    metrics: [{ label: '外部端口', value: '8', hint: '冻结契约；状态按调用回执判定' }],
    headings: ['端口代码', '外部系统', '证据边界', '状态'],
    rows: [
      ['EXT-VIDEO', '视频平台', '正式调用留痕', '按回执判定'], ['EXT-PUBLISH', '信息发布', '适配器契约', '需环境联调'],
      ['EXT-INTRUSION', '入侵报警', 'SIMULATED_EVIDENCE', '课程模拟'], ['EXT-ACCESS', '门禁系统', '二次确认与联锁', '按回执判定'],
      ['EXT-FIRE', '消防系统', 'SIMULATED_EVIDENCE', '课程模拟'], ['EXT-IOT', '物联网平台', 'SIMULATED_EVIDENCE', '课程模拟'],
      ['EXT-MIDDLE', '统一中台', '适配器契约', '需环境联调'], ['EXT-MESSAGE', '消息通道', '失败人工降级', '按回执判定'],
    ],
    evidence: '冻结八端口契约；外部课程环境仅形成 SIMULATED_EVIDENCE',
  }
}
