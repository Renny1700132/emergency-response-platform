export const mockSummary=Object.freeze({activeEvents:3,pendingTasks:12,onDutyPeople:8,materialAlerts:2})
export const mockEvents=Object.freeze([
{id:'EVT-20260914-001',title:'东区展厅烟感告警',level:'较大',status:'待核实',updatedAt:'2026-09-14T16:20:00+08:00'},
{id:'EVT-20260914-002',title:'一层客流密度异常',level:'一般',status:'处置中',updatedAt:'2026-09-14T16:05:00+08:00'},
{id:'EVT-20260914-003',title:'库房温湿度异常',level:'一般',status:'待反馈',updatedAt:'2026-09-14T15:48:00+08:00'}])
export const mockAdapters=Object.freeze([
{key:'map',name:'二维/楼层地图',status:'模拟连接',note:'静态平面图占位'},
{key:'position',name:'人员定位',status:'模拟连接',note:'定时变化坐标'},
{key:'video',name:'视频平台',status:'待后续集成验证',note:'占位播放器'},
{key:'message',name:'统一消息',status:'模拟连接',note:'发送/回执/重试状态'},
{key:'access',name:'疏散门禁',status:'待后续集成验证',note:'授权确认与失败降级'},
{key:'middleware',name:'统一中台',status:'模拟连接',note:'模拟用户、组织和权限'}])