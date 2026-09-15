import {createRouter,createWebHashHistory} from 'vue-router'
import WebLayout from '../layouts/WebLayout.vue'
import H5Layout from '../layouts/H5Layout.vue'
import DashboardView from '../views/web/DashboardView.vue'
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
import H5EventsView from '../views/h5/H5EventsView.vue'
import H5KnowledgeView from '../views/h5/H5KnowledgeView.vue'
import StaffView from '../views/web/StaffView.vue'
import ConfigView from '../views/web/ConfigView.vue'
import StatisticsView from '../views/web/StatisticsView.vue'
import SecurityView from '../views/web/SecurityView.vue'
import IntegrationsView from '../views/web/IntegrationsView.vue'

export const webModules=[
{path:'plans',title:'应急预案',icon:'案',description:'预案与任务模板'},{path:'incidents',title:'事件管理',icon:'事',description:'事件接报、核实与处置'},{path:'situation',title:'指挥态势',icon:'图',description:'事件、人员与资源态势'},{path:'tasks',title:'应急任务',icon:'任',description:'任务下达、催办与反馈'},{path:'duty',title:'人员与值班',icon:'值',description:'人员与当前值班'},{path:'materials',title:'物资管理',icon:'资',description:'物资台账与盘点'},{path:'drills',title:'演练管理',icon:'演',description:'演练计划、执行和评估'},{path:'attendance',title:'打卡管理',icon:'卡',description:'打卡规则、记录与异常'},{path:'config',title:'基础配置',icon:'配',description:'业务基础信息维护'},{path:'statistics',title:'数据统计',icon:'统',description:'处置与运行概览'},{path:'security',title:'综合安防',icon:'安',description:'设备与告警态势'},{path:'integrations',title:'系统对接',icon:'接',description:'外部能力接入状态'}]
export const h5Modules=[
{path:'report',title:'事件上报',icon:'报',description:'提交现场事件与附件'},{path:'events',title:'我的事件',icon:'事',description:'查看上报进度与续报'},{path:'tasks',title:'我的任务',icon:'任',description:'接收、反馈和完成任务'},{path:'drills',title:'应急演练',icon:'演',description:'参与演练并提交结果'},{path:'checkin',title:'扫码打卡',icon:'卡',description:'完成今日到岗打卡'},{path:'inventory',title:'物资盘点',icon:'盘',description:'提交现场盘点数量'},{path:'knowledge',title:'应急知识库',icon:'知',description:'查看处置指引'}]
const specific={plans:PlansView,incidents:IncidentsView,situation:SituationView,tasks:TasksView,materials:MaterialsView,drills:DrillsView,attendance:AttendanceView,duty:StaffView,config:ConfigView,statistics:StatisticsView,security:SecurityView,integrations:IntegrationsView}
const h5Specific={report:H5ReportView,events:H5EventsView,tasks:H5TasksView,drills:H5DrillsView,checkin:H5CheckinView,inventory:H5InventoryView,knowledge:H5KnowledgeView}
const routes=[
{path:'/',redirect:'/web/dashboard'},
{path:'/web',component:WebLayout,children:[
{path:'',redirect:'/web/dashboard'},
{path:'dashboard',component:DashboardView,meta:{title:'应急驾驶舱'}},
...webModules.map(module=>({path:module.path,component:specific[module.path],meta:{title:module.title}}))
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
