import {reactive} from 'vue'

const emptyClosure=()=>({evaluation:'',investigation:'',reportTitle:'',knowledgeNote:'',status:'待填写',completedAt:''})
const seed=()=>({
  events:[
    {id:'EVT-20260914-001',title:'东区展厅烟感告警',type:'消防告警',location:'东区展厅',description:'模拟烟感设备产生告警，等待人工核实。',status:'待核实',planId:null,createdBy:'模拟物联网',updatedAt:'16:20',closure:emptyClosure(),timeline:[{time:'16:20',label:'事件上报',detail:'模拟物联网告警转入待核实事件'}]},
    {id:'EVT-20260914-002',title:'一层客流密度异常',type:'客流异常',location:'一层中庭',description:'模拟客流密度超过展示阈值。',status:'处置中',planId:'PLAN-CROWD-001',createdBy:'模拟客流平台',updatedAt:'16:05',closure:emptyClosure(),timeline:[{time:'15:54',label:'事件上报',detail:'客流平台模拟告警'},{time:'15:57',label:'核实通过',detail:'值班人员确认需要处置'},{time:'16:05',label:'启动预案',detail:'关联客流疏导预案'}]}
  ],
  tasks:[
    {id:'TASK-20260914-001',eventId:'EVT-20260914-002',title:'疏导一层中庭游客',assignee:'现场处置组',deadline:'17:00',status:'待接收',feedback:''},
    {id:'TASK-20260914-002',eventId:'EVT-20260914-002',title:'复核主要通道状态',assignee:'安全保障组',deadline:'17:10',status:'执行中',feedback:'已到达现场'}
  ],
  plans:[
    {id:'PLAN-FIRE-001',name:'展厅火情现场处置预案',level:'现场处置',status:'已发布',tasks:['确认报警点','组织人员疏散']},
    {id:'PLAN-CROWD-001',name:'客流异常疏导预案',level:'专项',status:'已发布',tasks:['疏导游客','复核通道']}
  ],
  drill:{id:'DRILL-202609-001',name:'秋季消防疏散演练',place:'东区展厅',owner:'应急保障组',status:'待执行',result:'',improvement:''},
  checkins:[],
  attendanceAlerts:[],
  notificationRecords:[],
  inventory:{planId:'INV-202609-001',station:'东区物资站',item:'应急手电',bookQuantity:24,actualQuantity:null,difference:null,status:'待盘点',reviewer:''},
  adapters:[
    {key:'map',name:'二维/楼层地图',status:'模拟连接',note:'静态平面图与点位'},
    {key:'position',name:'人员定位',status:'模拟连接',note:'模拟坐标，非真实精度证据'},
    {key:'video',name:'视频平台',status:'待后续集成验证',note:'占位画面，未连接 GB/T 28181'},
    {key:'message',name:'统一消息',status:'模拟连接',note:'模拟发送、回执和重试'},
    {key:'access',name:'疏散门禁',status:'待后续集成验证',note:'不下发真实控制指令'},
    {key:'middleware',name:'统一中台',status:'模拟连接',note:'模拟用户、组织和权限'}
  ]
})

const storageKey='museum-emergency-prototype-v1'
const clone=value=>JSON.parse(JSON.stringify(value))
const normalize=saved=>{
  const base=seed()
  if(!saved)return base
  return {...base,...saved,
    events:(saved.events||base.events).map(event=>({...event,closure:{...emptyClosure(),...(event.closure||{})}})),
    attendanceAlerts:saved.attendanceAlerts||[],
    notificationRecords:saved.notificationRecords||[]
  }
}
const load=()=>{
  if(typeof window==='undefined')return seed()
  try{return normalize(JSON.parse(window.localStorage.getItem(storageKey)))}catch{return seed()}
}
export const state=reactive(load())
const persist=()=>{if(typeof window!=='undefined')window.localStorage.setItem(storageKey,JSON.stringify(state))}
const now=()=>new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})
const nextId=prefix=>`${prefix}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${String(Date.now()).slice(-4)}`
const eventBy=id=>state.events.find(item=>item.id===id)
const taskBy=id=>state.tasks.find(item=>item.id===id)
const addTimeline=(event,label,detail)=>{event.timeline.push({time:now(),label,detail});event.updatedAt=now()}

export const actions={
  reset(){Object.assign(state,clone(seed()));persist()},
  reportIncident(input){
    if(!input.title?.trim()||!input.type||!input.location?.trim())return{ok:false,message:'请完整填写事件名称、类型和地点'}
    const event={id:nextId('EVT'),title:input.title.trim(),type:input.type,location:input.location.trim(),description:input.description?.trim()||'未填写补充说明',status:'待核实',planId:null,createdBy:'H5 值班人员',updatedAt:now(),closure:emptyClosure(),timeline:[{time:now(),label:'H5 事件上报',detail:'已保存事件信息；图片为 Mock 引用'}]}
    state.events.unshift(event);persist();return{ok:true,event}
  },
  verifyIncident(id,accepted=true){
    const event=eventBy(id)
    if(!event||event.status!=='待核实')return{ok:false,message:'仅待核实事件可提交核实结论'}
    event.status=accepted?'已核实':'已驳回';addTimeline(event,accepted?'核实通过':'核实驳回',accepted?'值班人员确认进入预案选择':'事件不进入处置流程');persist();return{ok:true}
  },
  startIncident(id,planId='PLAN-FIRE-001'){
    const event=eventBy(id),plan=state.plans.find(item=>item.id===planId&&item.status==='已发布')
    if(!event||event.status!=='已核实'||!plan)return{ok:false,message:'事件须已核实且预案须已发布'}
    event.status='处置中';event.planId=plan.id
    plan.tasks.forEach((title,index)=>state.tasks.push({id:nextId(`TASK${index+1}`),eventId:id,title,assignee:index?'安全保障组':'现场处置组',deadline:'今日 18:00',status:'待接收',feedback:''}))
    addTimeline(event,'启动预案',`已关联 ${plan.name} 并生成 ${plan.tasks.length} 个 Mock 任务`);persist();return{ok:true}
  },
  acceptTask(id){const task=taskBy(id);if(!task||task.status!=='待接收')return{ok:false,message:'仅待接收任务可确认'};task.status='执行中';const event=eventBy(task.eventId);if(event)addTimeline(event,'任务已接收',`${task.assignee} 接收“${task.title}”`);persist();return{ok:true}},
  feedbackTask(id,text){const task=taskBy(id);if(!task||task.status!=='执行中'||!text?.trim())return{ok:false,message:'执行中任务需要填写反馈'};task.feedback=text.trim();const event=eventBy(task.eventId);if(event)addTimeline(event,'任务反馈',`${task.title}：${task.feedback}`);persist();return{ok:true}},
  completeTask(id){const task=taskBy(id);if(!task||task.status!=='执行中'||!task.feedback)return{ok:false,message:'请先提交任务反馈'};task.status='已完成';const event=eventBy(task.eventId);if(event)addTimeline(event,'任务完成',task.title);persist();return{ok:true}},
  submitClosure(id,input){
    const event=eventBy(id)
    if(!event||event.status!=='处置中')return{ok:false,message:'仅处置中事件可填写关闭材料'}
    const evaluation=input.evaluation?.trim(),investigation=input.investigation?.trim(),reportTitle=input.reportTitle?.trim()
    if(!evaluation||!investigation||!reportTitle)return{ok:false,message:'评估结论、调查记录和报告名称均为必填'}
    event.closure={evaluation,investigation,reportTitle,knowledgeNote:input.knowledgeNote?.trim()||'未形成知识条目',status:'材料已完成',completedAt:now()}
    addTimeline(event,'关闭材料完成',`已保存 Mock 评估、调查和报告“${reportTitle}”`);persist();return{ok:true}
  },
  closeIncident(id){
    const event=eventBy(id),related=state.tasks.filter(item=>item.eventId===id)
    if(!event||event.status!=='处置中')return{ok:false,message:'仅处置中事件可关闭'}
    if(related.length&&related.some(item=>item.status!=='已完成'))return{ok:false,message:'仍有任务未完成，暂不能关闭'}
    if(event.closure?.status!=='材料已完成')return{ok:false,message:'请先完成评估、调查和报告材料'}
    event.status='已关闭';addTimeline(event,'事件关闭',`关闭材料已确认：${event.closure.reportTitle}`);persist();return{ok:true}
  },
  advanceDrill(result='按计划完成疏散集合'){const order=['待执行','执行中','待评估','已完成'],index=order.indexOf(state.drill.status);if(index<0||index===order.length-1)return{ok:false,message:'演练已经完成'};state.drill.status=order[index+1];if(state.drill.status==='待评估')state.drill.result=result;if(state.drill.status==='已完成')state.drill.improvement='加强疏散口引导标识检查';persist();return{ok:true}},
  checkin(valid=true){const record={id:nextId('CHK'),person:'当前值班人员',point:'东区展厅入口',time:now(),status:valid?'有效':'已拒绝',reason:valid?'身份、时段和模拟范围校验通过':'模拟超出有效范围'};state.checkins.unshift(record);persist();return{ok:valid,record,message:record.reason}},
  detectAttendanceException(){
    const open=state.attendanceAlerts.find(item=>item.status!=='已处理')
    if(open)return{ok:false,message:'已有缺卡告警待处理'}
    const alertId=nextId('ALERT'),messageId=nextId('MSG')
    state.attendanceAlerts.unshift({id:alertId,person:'夜班巡检员（模拟）',point:'东区展厅入口',type:'缺卡/超时',detectedAt:now(),status:'通知待重试',messageId})
    state.notificationRecords.unshift({id:messageId,alertId,channel:'统一消息 Mock',attempts:1,status:'Mock 发送失败 / 待重试',note:'未调用真实通道，不计入到达率'})
    persist();return{ok:true,message:'已生成缺卡/超时告警，Mock 通知首次发送失败'}
  },
  retryAttendanceNotification(alertId){
    const alert=state.attendanceAlerts.find(item=>item.id===alertId),record=state.notificationRecords.find(item=>item.alertId===alertId)
    if(!alert||!record||alert.status!=='通知待重试')return{ok:false,message:'当前告警不处于待重试状态'}
    record.attempts+=1;record.status='Mock 重试失败 / 转人工处置';record.note='已加入人工联系清单，未调用真实消息通道';alert.status='人工处置';persist();return{ok:true,message:'Mock 重试失败，已转人工处置'}
  },
  submitInventory(value){const actual=Number(value);if(!Number.isInteger(actual)||actual<0)return{ok:false,message:'盘点数量必须是非负整数'};state.inventory.actualQuantity=actual;state.inventory.difference=actual-state.inventory.bookQuantity;state.inventory.status='待复核';persist();return{ok:true}},
  reviewInventory(){if(state.inventory.status!=='待复核')return{ok:false,message:'仅待复核结果可确认更新'};state.inventory.bookQuantity=state.inventory.actualQuantity;state.inventory.status='已复核';state.inventory.reviewer='物资管理员';persist();return{ok:true}}
}
