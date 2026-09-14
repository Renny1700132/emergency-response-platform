import {createRouter,createWebHashHistory} from 'vue-router'
import WebLayout from '../layouts/WebLayout.vue'
import H5Layout from '../layouts/H5Layout.vue'
import DashboardView from '../views/web/DashboardView.vue'
import ModuleView from '../views/web/ModuleView.vue'
import PlansView from '../views/web/PlansView.vue'
import IncidentsView from '../views/web/IncidentsView.vue'
import SituationView from '../views/web/SituationView.vue'
import TasksView from '../views/web/TasksView.vue'
import DrillsView from '../views/web/DrillsView.vue'
import AttendanceView from '../views/web/AttendanceView.vue'
import MaterialsView from '../views/web/MaterialsView.vue'
import H5HomeView from '../views/h5/H5HomeView.vue'
import H5ReportView from '../views/h5/H5ReportView.vue'
import H5TasksView from '../views/h5/H5TasksView.vue'
import H5DrillsView from '../views/h5/H5DrillsView.vue'
import H5CheckinView from '../views/h5/H5CheckinView.vue'
import H5InventoryView from '../views/h5/H5InventoryView.vue'

export const webModules=[
{path:'plans',title:'应急预案',icon:'案',description:'分层预案、流程任务和版本配置',fr:'G2-FR-001—003'},
{path:'incidents',title:'事件管理',icon:'事',description:'事件上报、核实、处置、关闭与归档',fr:'G2-FR-013—016'},
{path:'situation',title:'指挥态势',icon:'图',description:'事件时间线、人员、视频和物资站点态势',fr:'G2-FR-004—007、026、029'},
{path:'tasks',title:'应急任务',icon:'任',description:'任务下发、催办、反馈和完成状态',fr:'G2-FR-003、015、022'},
{path:'duty',title:'人员与值班',icon:'值',description:'人员职责、值班计划和调派信息',fr:'G2-FR-017—020、031—032'},
{path:'materials',title:'物资管理',icon:'资',description:'物资台账、有效期、盘点和差异复核',fr:'G2-FR-007—009、025'},
{path:'drills',title:'演练管理',icon:'演',description:'计划、任务、执行结果和评估改进',fr:'G2-FR-010—012、023'},
{path:'attendance',title:'打卡管理',icon:'卡',description:'打卡点、二维码、统计和异常提醒',fr:'G2-FR-017—020、024'},
{path:'config',title:'基础配置',icon:'配',description:'预案、事件、站点、评估和审批配置',fr:'G2-FR-033—037'},
{path:'statistics',title:'数据统计',icon:'统',description:'事件、监控和流程统计与钻取',fr:'G2-FR-039'},
{path:'security',title:'综合安防',icon:'安',description:'终端状态、告警、定位和系统跳转',fr:'G2-FR-026、029'},
{path:'integrations',title:'系统对接',icon:'接',description:'外部适配器、Mock 状态和失败降级',fr:'G2-FR-027—029'}]
export const h5Modules=[
{path:'report',title:'事件上报',icon:'报',description:'模拟拍照、填写和提交事件',fr:'G2-FR-013、021'},
{path:'tasks',title:'我的任务',icon:'任',description:'确认、反馈、上传和完成任务',fr:'G2-FR-015、022'},
{path:'drills',title:'应急演练',icon:'演',description:'查看任务并提交执行结果',fr:'G2-FR-010—012、023'},
{path:'checkin',title:'扫码打卡',icon:'卡',description:'模拟扫码及身份、时段、范围校验',fr:'G2-FR-017—020、024'},
{path:'inventory',title:'物资盘点',icon:'盘',description:'移动盘点并显示数量差异',fr:'G2-FR-008—009、025'}]
const specific={plans:PlansView,incidents:IncidentsView,situation:SituationView,tasks:TasksView,materials:MaterialsView,drills:DrillsView,attendance:AttendanceView}
const h5Specific={report:H5ReportView,tasks:H5TasksView,drills:H5DrillsView,checkin:H5CheckinView,inventory:H5InventoryView}
const routes=[
{path:'/',redirect:'/web/dashboard'},
{path:'/web',component:WebLayout,children:[
{path:'',redirect:'/web/dashboard'},
{path:'dashboard',component:DashboardView,meta:{title:'应急驾驶舱'}},
...webModules.map(module=>({path:module.path,component:specific[module.path]||ModuleView,props:specific[module.path]?false:{module},meta:{title:module.title}}))
]},
{path:'/h5',component:H5Layout,children:[
{path:'',redirect:'/h5/home'},
{path:'home',component:H5HomeView,meta:{title:'移动应急'}},
...h5Modules.map(module=>({path:module.path,component:h5Specific[module.path],meta:{title:module.title}}))
]},
{path:'/:pathMatch(.*)*',redirect:'/web/dashboard'}]
const router=createRouter({history:createWebHashHistory(),routes})
router.afterEach(to=>{document.title=`${to.meta.title||'应急管理'} · 最小验证原型`})
export default router