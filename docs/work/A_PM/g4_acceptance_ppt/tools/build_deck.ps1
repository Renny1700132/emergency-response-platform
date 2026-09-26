param(
    [Parameter(Mandatory = $true)][string]$Workspace,
    [Parameter(Mandatory = $true)][string]$OutputPptx,
    [Parameter(Mandatory = $true)][string]$RenderDir
)

$ErrorActionPreference = 'Stop'
$Workspace = (Resolve-Path -LiteralPath $Workspace).Path
$OutputPptx = [System.IO.Path]::GetFullPath((Join-Path $Workspace $OutputPptx))
$RenderDir = [System.IO.Path]::GetFullPath((Join-Path $Workspace $RenderDir))
$shotDir = Join-Path $Workspace 'docs\deliverables\g4_acceptance_ppt\screenshots'
New-Item -ItemType Directory -Force -Path ([System.IO.Path]::GetDirectoryName($OutputPptx)) | Out-Null
New-Item -ItemType Directory -Force -Path $RenderDir | Out-Null

function Rgb([string]$hex) {
    $h = $hex.TrimStart('#')
    $r = [Convert]::ToInt32($h.Substring(0,2),16)
    $g = [Convert]::ToInt32($h.Substring(2,2),16)
    $b = [Convert]::ToInt32($h.Substring(4,2),16)
    return $r + ($g * 256) + ($b * 65536)
}

$NAVY = Rgb '#12304B'; $BLUE = Rgb '#2468A2'; $TEAL = Rgb '#2A8793'; $ORANGE = Rgb '#E89A2D'
$INK = Rgb '#17324D'; $MUTED = Rgb '#5E7183'; $PALE = Rgb '#EEF4F7'; $WHITE = Rgb '#FFFFFF'
$RED = Rgb '#C94A45'; $GREEN = Rgb '#2B806A'; $LINE = Rgb '#D4E0E7'; $LIGHTBLUE = Rgb '#DCECF6'
$FONT = '微软雅黑'; $FONT_LIGHT = '等线 Light'

function AddText($slide, [string]$text, [double]$x, [double]$y, [double]$w, [double]$h, [double]$size=18, [int]$color=$INK, [bool]$bold=$false, [int]$align=1, [string]$font=$FONT) {
    $shape = $slide.Shapes.AddTextbox(1, $x, $y, $w, $h)
    $shape.TextFrame.MarginLeft = 0; $shape.TextFrame.MarginRight = 0; $shape.TextFrame.MarginTop = 0; $shape.TextFrame.MarginBottom = 0
    $shape.TextFrame.WordWrap = -1
    $shape.TextFrame.TextRange.Text = $text
    $shape.TextFrame.TextRange.Font.NameFarEast = $font
    $shape.TextFrame.TextRange.Font.Name = $font
    $shape.TextFrame.TextRange.Font.Size = $size
    $shape.TextFrame.TextRange.Font.Bold = $(if($bold){-1}else{0})
    $shape.TextFrame.TextRange.Font.Color.RGB = $color
    $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $align
    return $shape
}

function AddBox($slide, [double]$x, [double]$y, [double]$w, [double]$h, [int]$fill=$WHITE, [int]$line=$LINE, [double]$radiusShape=5) {
    $shape = $slide.Shapes.AddShape($radiusShape, $x, $y, $w, $h)
    $shape.Fill.ForeColor.RGB = $fill; $shape.Fill.Solid()
    $shape.Line.ForeColor.RGB = $line; $shape.Line.Weight = 1
    return $shape
}

function AddRule($slide, [double]$x1, [double]$y1, [double]$x2, [double]$y2, [int]$color=$LINE, [double]$weight=1.5, [bool]$arrow=$false) {
    $line = $slide.Shapes.AddLine($x1,$y1,$x2,$y2)
    $line.Line.ForeColor.RGB=$color; $line.Line.Weight=$weight
    if($arrow){$line.Line.EndArrowheadStyle=3}
    return $line
}

function AddImageFit($slide, [string]$file, [double]$x, [double]$y, [double]$w, [double]$h, [bool]$frame=$true) {
    $path = Join-Path $shotDir $file
    if(-not (Test-Path -LiteralPath $path)){ throw "Missing image: $path" }
    $pic = $slide.Shapes.AddPicture($path, 0, -1, 0, 0, -1, -1)
    $scale = [Math]::Min($w / $pic.Width, $h / $pic.Height)
    $pic.Width = $pic.Width * $scale; $pic.Height = $pic.Height * $scale
    $pic.Left = $x + (($w - $pic.Width)/2); $pic.Top = $y + (($h - $pic.Height)/2)
    if($frame){$pic.Line.Visible=-1; $pic.Line.ForeColor.RGB=$LINE; $pic.Line.Weight=1}
    return $pic
}

function AddCoverImage($slide, [string]$file, [double]$x, [double]$y, [double]$w, [double]$h) {
    $path = Join-Path $shotDir $file
    $pic = $slide.Shapes.AddPicture($path, 0, -1, $x, $y, $w, $h)
    $pic.Line.Visible=-1; $pic.Line.ForeColor.RGB=$LINE; $pic.Line.Weight=1
    return $pic
}

function AddTitle($slide, [int]$n, [string]$title, [string]$section) {
    AddText $slide ("{0:D2}" -f $n) 38 25 48 24 13 $ORANGE $true | Out-Null
    AddText $slide $title 88 20 790 42 26 $INK $true | Out-Null
    AddText $slide $section 782 29 135 18 11 $MUTED $false 3 | Out-Null
    AddRule $slide 38 70 922 70 $LINE 1 | Out-Null
}

function AddFooter($slide, [int]$n, [string]$label='某自然博物馆智能运营中心 · 应急管理子系统') {
    AddText $slide $label 38 510 700 16 9 $MUTED | Out-Null
    AddText $slide ("{0:D2}" -f $n) 880 510 42 16 9 $MUTED $true 3 | Out-Null
}

function AddTag($slide, [string]$text, [double]$x, [double]$y, [double]$w, [int]$fill=$LIGHTBLUE, [int]$color=$BLUE) {
    $b=AddBox $slide $x $y $w 23 $fill $fill 5
    AddText $slide $text ($x+7) ($y+4) ($w-14) 15 10 $color $true 2 | Out-Null
}

function SetNotes($slide, [string]$text) {
    try {
        $placeholder = $slide.NotesPage.Shapes.Placeholders.Item(2)
        $placeholder.TextFrame.TextRange.Text = $text
    } catch {
        $box = $slide.NotesPage.Shapes.AddTextbox(1, 48, 90, 620, 360)
        $box.TextFrame.TextRange.Text = $text
    }
}

function RenderSlide($slide, [int]$index) {
    $path = Join-Path $RenderDir ("slide-{0:D2}.png" -f $index)
    $slide.Export($path, 'PNG', 1600, 900)
}

function AddStepChain($slide, [string[]]$steps, [double]$x, [double]$y, [double]$totalWidth, [int]$fill=$LIGHTBLUE, [int]$accent=$BLUE, [double]$fontSize=11) {
    $gap=8; $w=($totalWidth-($gap*($steps.Count-1)))/$steps.Count
    for($i=0;$i -lt $steps.Count;$i++){
        AddBox $slide ($x+$i*($w+$gap)) $y $w 40 $fill $fill 5 | Out-Null
        AddText $slide $steps[$i] ($x+$i*($w+$gap)+5) ($y+10) ($w-10) 20 $fontSize $accent $true 2 | Out-Null
        if($i -lt $steps.Count-1){ AddRule $slide ($x+$i*($w+$gap)+$w) ($y+20) ($x+$i*($w+$gap)+$w+$gap-1) ($y+20) $accent 1.5 $true | Out-Null }
    }
}

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$presentation = $ppt.Presentations.Add()
$presentation.PageSetup.SlideWidth = 960
$presentation.PageSetup.SlideHeight = 540

try {
    # 01 封面
    $s=$presentation.Slides.Add(1,12); $s.FollowMasterBackground=0; $s.Background.Fill.ForeColor.RGB=$NAVY
    AddBox $s 0 0 18 540 $ORANGE $ORANGE 1 | Out-Null
    AddText $s '某自然博物馆智能运营中心' 72 78 650 30 18 $LIGHTBLUE $false | Out-Null
    AddText $s '应急管理子系统' 72 128 720 66 40 $WHITE $true | Out-Null
    AddText $s '项目介绍与阶段性验收汇报' 72 204 630 36 23 $WHITE $false | Out-Null
    AddRule $s 72 270 260 270 $ORANGE 4 | Out-Null
    AddText $s '以数字化预案为核心，以指挥中心为枢纽，以移动处置为延伸' 72 292 710 28 16 $LIGHTBLUE | Out-Null
    AddText $s '汇报人：A（项目负责人）' 72 438 350 22 14 $WHITE | Out-Null
    AddText $s '2026.09' 72 468 180 18 12 $LIGHTBLUE | Out-Null
    SetNotes $s '各位老师、各位评审好。本次汇报介绍某自然博物馆智能运营中心的应急管理子系统。系统围绕预案、事件、任务、资源和外部联动建立业务闭环，Web 端承担管理与指挥，H5 服务现场人员。今天我将重点讲清系统解决什么问题、功能如何协同、当前研发成果怎样落地，以及现场演示如何完成。'
    RenderSlide $s 1

    # 02 目录
    $s=$presentation.Slides.Add(2,12); AddTitle $s 2 '目录' '总体结构'
    $items=@(@('01','项目概述','背景、目标、范围与总体架构'),@('02','系统完成情况','十个功能域与核心业务闭环'),@('03','研发技术总结','架构、数据、接口与工程保障'),@('04','项目实施管理','三人协作、AI 辅助与双向追踪'),@('05','系统演示','主演示路线与辅助展示入口'))
    for($i=0;$i -lt $items.Count;$i++){
        $y=105+$i*76
        AddText $s $items[$i][0] 80 $y 50 30 16 $ORANGE $true | Out-Null
        AddText $s $items[$i][1] 145 ($y-2) 235 32 22 $INK $true | Out-Null
        AddText $s $items[$i][2] 405 ($y+2) 420 24 14 $MUTED | Out-Null
        AddRule $s 145 ($y+42) 850 ($y+42) $LINE 1 | Out-Null
    }
    AddFooter $s 2
    SetNotes $s '汇报分为五部分。前两部分占主要时间：先说明建设背景、目标和架构，再用十页展开系统功能，不用一张清单带过。随后用一页总结技术实现，一页说明项目管理和 AI 辅助研发流程，最后给出一条可以现场执行的主演示路线和若干辅助入口。'
    RenderSlide $s 2

    # 03 背景与痛点
    $s=$presentation.Slides.Add(3,12); AddTitle $s 3 '博物馆应急处置面临跨系统、跨岗位、跨现场协同' '项目概述'
    AddText $s '典型风险来源' 56 98 220 25 15 $MUTED $true | Out-Null
    $risks=@(@('消防与烟感','设备告警'),@('客流与秩序','密度异常'),@('安防与门禁','入侵联动'),@('设施与环境','IoT 告警'))
    for($i=0;$i -lt 4;$i++){
        $x=55+$i*215
        AddBox $s $x 135 180 75 $(if($i%2 -eq 0){$LIGHTBLUE}else{$PALE}) $LINE 5 | Out-Null
        AddText $s $risks[$i][0] ($x+14) 150 150 22 16 $INK $true 2 | Out-Null
        AddText $s $risks[$i][1] ($x+14) 180 150 18 12 $MUTED $false 2 | Out-Null
    }
    AddRule $s 145 230 815 230 $ORANGE 3 $true | Out-Null
    $pains=@('告警来源分散，事件入口不统一','预案停留在文档，启动后任务靠人工拆分','现场反馈依赖电话，责任与进度难追溯','人员、物资、视频和门禁信息分布在不同系统','关闭后调查、评估和经验沉淀缺少闭环')
    AddText $s '建设前的协同断点' 55 258 240 28 17 $INK $true | Out-Null
    for($i=0;$i -lt $pains.Count;$i++){
        $y=302+$i*36
        AddBox $s 62 ($y+2) 10 10 $ORANGE $ORANGE 9 | Out-Null
        AddText $s $pains[$i] 88 $y 750 24 15 $INK | Out-Null
    }
    AddFooter $s 3
    SetNotes $s '博物馆的应急风险来自消防、客流、入侵、门禁和设施物联网等多个渠道。真正的困难不只是发现告警，而是跨岗位协同：谁来核实、是否启动预案、任务怎样下发、现场怎样反馈、指挥员怎样掌握人员和资源，以及事件关闭后怎样形成调查与经验。系统建设的核心，就是把这些分散动作收进一条可追溯的业务链。'
    RenderSlide $s 3

    # 04 目标与范围
    $s=$presentation.Slides.Add(4,12); AddTitle $s 4 '建设目标与交付边界' '项目概述'
    AddText $s '建设目标' 55 98 180 26 17 $INK $true | Out-Null
    AddText $s '以数字化预案组织处置，以统一事件串联过程，以任务驱动现场协同，以态势视图支撑指挥决策。' 55 132 850 44 20 $BLUE $true | Out-Null
    $scope=@(@('Web 管理与指挥','预案、事件、任务、资源、值班、演练、统计、安防'),@('H5 移动处置','上报、任务反馈、演练、扫码、盘点、知识查询'),@('标准接口与适配','OpenAPI 3.0，视频、门禁、IoT、中台、消息等端口'),@('数据与交付','关系数据库、迁移脚本、部署与用户/运维文档'))
    for($i=0;$i -lt 4;$i++){
        $x=55+($i%2)*445; $y=205+[Math]::Floor($i/2)*100
        AddBox $s $x $y 410 80 $WHITE $LINE 5 | Out-Null
        AddText $s $scope[$i][0] ($x+18) ($y+14) 150 24 16 $INK $true | Out-Null
        AddText $s $scope[$i][1] ($x+172) ($y+13) 218 48 13 $MUTED | Out-Null
    }
    AddBox $s 55 420 850 58 $PALE $PALE 5 | Out-Null
    AddText $s '责任边界' 73 437 90 20 13 $ORANGE $true | Out-Null
    AddText $s '不采购或改造既有安防硬件，不建设原生 Android/iOS APP，不替代统一中台与专业系统；系统负责业务适配、联动和验证。' 165 434 710 34 13 $INK | Out-Null
    AddFooter $s 4
    SetNotes $s '建设范围包括 Web、嵌入既有智慧管理 APP 的 H5、标准接口、领域数据与配套文档。需求共覆盖 11 个模块、39 条功能需求，其中 34 条为实质性条款。边界同样重要：项目不采购或改造视频、门禁、消防等既有硬件，不另做原生手机 APP，也不重复建设统一中台。我们的责任是把这些能力接入应急业务并形成可验证链路。'
    RenderSlide $s 4

    # 05 功能全景
    $s=$presentation.Slides.Add(5,12); AddTitle $s 5 '事前准备、事中处置、事后闭环贯通全部功能域' '系统完成情况'
    $columns=@(
        @{title='事前准备'; color=$TEAL; items=@('数字化预案','预案流程与任务模板','应急人员与物资','值班计划','演练计划','基础配置')},
        @{title='事中处置'; color=$ORANGE; items=@('Web / H5 上报与告警接入','核实、启动预案、自动任务','消息通知与移动反馈','指挥态势与人员定位','视频调阅与门禁联动')},
        @{title='事后闭环'; color=$BLUE; items=@('事件关闭与事故调查','评估报告','演练整改与补演','知识沉淀','统计分析与钻取')}
    )
    for($c=0;$c -lt 3;$c++){
        $x=45+$c*305
        AddBox $s $x 105 270 335 $WHITE $LINE 5 | Out-Null
        AddBox $s $x 105 270 52 $columns[$c].color $columns[$c].color 5 | Out-Null
        AddText $s $columns[$c].title ($x+18) 119 235 25 19 $WHITE $true 2 | Out-Null
        for($i=0;$i -lt $columns[$c].items.Count;$i++){
            $y=180+$i*43
            AddBox $s ($x+22) ($y+5) 8 8 $columns[$c].color $columns[$c].color 9 | Out-Null
            AddText $s $columns[$c].items[$i] ($x+44) $y 205 24 13 $INK | Out-Null
        }
        if($c -lt 2){AddRule $s ($x+270) 270 ($x+302) 270 $MUTED 2 $true | Out-Null}
    }
    AddText $s '同一事件编号、同一时间线、同一责任链' 255 466 450 25 16 $NAVY $true 2 | Out-Null
    AddFooter $s 5
    SetNotes $s '功能全景按业务发生顺序组织。事前准备阶段把预案、人员、物资、值班、演练和基础配置准备好。事中处置阶段接收上报和外部告警，完成核实、预案启动、任务下发、移动反馈和态势联动。事后阶段完成关闭、调查、评估、整改、知识沉淀和统计。三段共用事件编号、时间线和责任链，避免各模块各自形成孤岛。'
    RenderSlide $s 5

    # 06 架构
    $s=$presentation.Slides.Add(6,12); AddTitle $s 6 'Web、H5 与大屏共用领域服务和标准接口' '项目概述'
    $layers=@(
        @{name='应用层'; color=$BLUE; text='Web 管理端    H5 移动端    指挥大屏'},
        @{name='服务层'; color=$TEAL; text='预案  事件  任务  态势  资源  值班  演练  知识'},
        @{name='支撑层'; color=$ORANGE; text='鉴权与权限    幂等    事务 Outbox    审计与 traceId    OpenAPI'},
        @{name='数据层'; color=$NAVY; text='关系数据库    领域数据单一写入主责    可重建态势/统计投影'}
    )
    for($i=0;$i -lt 4;$i++){
        $y=100+$i*78
        AddBox $s 95 $y 720 58 $WHITE $layers[$i].color 5 | Out-Null
        AddBox $s 95 $y 125 58 $layers[$i].color $layers[$i].color 5 | Out-Null
        AddText $s $layers[$i].name 112 ($y+17) 90 22 15 $WHITE $true 2 | Out-Null
        AddText $s $layers[$i].text 245 ($y+17) 535 25 14 $INK $false 2 | Out-Null
    }
    AddText $s '外部适配端口' 55 430 130 22 14 $MUTED $true | Out-Null
    $ext=@('视频','信息发布','入侵','门禁','消防','IoT','中台','消息','GIS/定位','宿主 APP')
    for($i=0;$i -lt $ext.Count;$i++){AddTag $s $ext[$i] (170+$i*72) 426 64 $PALE $NAVY}
    AddFooter $s 6
    SetNotes $s '总体架构分为应用、服务、支撑和数据四层。Web、H5 与大屏共享同一套领域服务和 API，避免不同渠道出现不同业务口径。后端采用模块化单体，按领域划分写入主责；态势和统计使用可重建投影。外部系统通过适配端口接入，内部业务不直接依赖厂商协议。这样既能保持当前部署简单，也为后续集成和扩展保留清晰边界。'
    RenderSlide $s 6

    # 07 预案
    $s=$presentation.Slides.Add(7,12); AddTitle $s 7 '数字化预案把流程、责任人与任务模板固化为可执行版本' '系统完成情况'
    AddImageFit $s 'prototype-plans.png' 45 95 610 330 $true | Out-Null
    AddText $s '预案能力' 688 102 180 24 16 $INK $true | Out-Null
    $bul=@('综合、专项、现场处置分层分类','场景、流程节点、核实环节可配置','任务模板绑定岗位、人员与截止时限','通知、调派对象和附件随版本保存','发布版本不可原位修改，历史可追溯')
    for($i=0;$i -lt $bul.Count;$i++){AddBox $s 692 (140+$i*44) 8 8 $TEAL $TEAL 9|Out-Null; AddText $s $bul[$i] 712 (134+$i*44) 202 34 12 $INK|Out-Null}
    AddStepChain $s @('编制','审核/发布','事件匹配','启动','实例化任务') 80 450 800 $LIGHTBLUE $BLUE 11
    AddFooter $s 7
    SetNotes $s '预案编制人员在事前维护综合预案、专项预案和现场处置方案，并把核实流程、任务模板、责任岗位、通知人与调派对象放进同一个版本。事件核实后，指挥员选择已发布版本启动响应，系统依据冻结快照自动创建任务，后续修改不会反向污染已启动事件。当前正式版本已经实现预案启动与任务实例化的后端闭环。本页界面来自已完成的交互原型，来源类型为 PROTOTYPE_TARGET。'
    RenderSlide $s 7

    # 08 事件生命周期
    $s=$presentation.Slides.Add(8,12); AddTitle $s 8 '事件全生命周期闭环：从多渠道上报到关闭归档全程可追溯' '系统完成情况'
    AddStepChain $s @('上报/告警','待核实','通过/驳回','启动预案','响应与续报','任务处置','关闭评估','调查/知识') 45 92 870 $PALE $NAVY 10
    AddImageFit $s 'formal-web-incidents.png' 45 155 560 310 $true | Out-Null
    AddImageFit $s 'formal-h5-events.png' 625 155 120 310 $true | Out-Null
    AddText $s '事件主数据' 775 165 130 22 15 $INK $true | Out-Null
    $items=@('事件编号','类型 / 等级 / 位置 / 时间','图片与附件引用','核实意见与生命周期状态','续报、处置、关闭多时间轴')
    for($i=0;$i -lt $items.Count;$i++){AddText $s ('• '+$items[$i]) 775 (202+$i*43) 145 32 12 $INK|Out-Null}
    AddFooter $s 8
    SetNotes $s '值班人员、现场人员或外部告警都可以形成事件候选。系统生成事件编号，记录类型、时间、位置和附件，随后进入核实。核实通过后才能启动预案，驳回也保留意见。响应期间续报、任务反馈和状态变化进入时间线；关闭前检查任务、调查与报告材料。当前正式版本已实现 Web/H5 上报、核实、启动、任务、反馈与关闭的 Sprint 1 核心链。本页截图依赖受控模拟数据，来源类型为 SIMULATED_DATA。'
    RenderSlide $s 8

    # 09 态势
    $s=$presentation.Slides.Add(9,12); AddTitle $s 9 '指挥员一屏掌握事件、人员、资源、视频与告警状态' '系统完成情况'
    AddImageFit $s 'prototype-situation.png' 45 95 640 335 $true | Out-Null
    AddText $s '一屏态势' 715 104 165 22 16 $INK $true | Out-Null
    $items=@('事件基本态势与时间线','当前任务、处理人和职责','人员位置、是否就位与位置新鲜度','物资站点、清单和数量','视频点位、实时调阅与回放入口','消防、入侵、IoT 与发布状态')
    for($i=0;$i -lt $items.Count;$i++){AddBox $s 720 (144+$i*43) 9 9 $(if($i -lt 3){$TEAL}else{$ORANGE}) $(if($i -lt 3){$TEAL}else{$ORANGE}) 9|Out-Null; AddText $s $items[$i] 742 (137+$i*43) 170 34 12 $INK|Out-Null}
    AddBox $s 70 454 810 35 $PALE $PALE 5|Out-Null
    AddText $s '态势只读投影不反向修改领域事实；数据过期、断连和降级状态在界面显式呈现。' 90 463 770 20 12 $NAVY $true 2|Out-Null
    AddFooter $s 9
    SetNotes $s '这页面向应急指挥员。事件发生后，他不需要在多个系统之间来回切换，而是在同一视图查看事件时间线、任务进度、人员职责和位置、物资站点、视频点位以及安防告警。态势服务读取事件、任务和外部数据形成只读投影，不回写业务事实；位置过期、接口断连或视频不可用都会显式标识。当前正式版本的态势与安防接线属于 Sprint 2 范围，本页界面来自交互原型，来源类型为 PROTOTYPE_TARGET。'
    RenderSlide $s 9

    # 10 任务
    $s=$presentation.Slides.Add(10,12); AddTitle $s 10 '任务驱动协同处置：自动下发、移动反馈、全过程留痕' '系统完成情况'
    AddStepChain $s @('模板','自动创建','分派/通知','H5 接收','执行反馈','进度/催办','完成') 45 92 870 $PALE $BLUE 10
    AddImageFit $s 'formal-web-tasks.png' 45 158 560 300 $true | Out-Null
    AddImageFit $s 'formal-h5-tasks.png' 625 158 120 300 $true | Out-Null
    AddText $s '任务控制点' 775 165 130 22 15 $INK $true | Out-Null
    $items=@('临时任务与重指派','截止时间与历史责任人','文字 / 图片附件反馈','任务状态和资源版本','消息发送、回执、重试与人工处置')
    for($i=0;$i -lt $items.Count;$i++){AddText $s ('• '+$items[$i]) 775 (204+$i*44) 145 34 12 $INK|Out-Null}
    AddFooter $s 10
    SetNotes $s '预案启动后，系统按模板创建任务并记录执行人和截止时间。现场人员在 H5 接收任务，提交文字、图片和进度；指挥员在 Web 看到任务状态，可催办或创建临时任务。发生重指派时，系统追加历史责任人和原因，不覆盖原记录。消息失败只改变投递状态，不把业务任务误判为失败，并提供人工处置入口。当前正式版本已实现任务接收、反馈、完成、临时任务和催办，本页截图来源为 SIMULATED_DATA。'
    RenderSlide $s 10

    # 11 人员物资
    $s=$presentation.Slides.Add(11,12); AddTitle $s 11 '人员与物资保障：知道谁能到场，也知道资源是否可用' '系统完成情况'
    AddText $s '人员保障' 55 94 210 24 16 $INK $true|Out-Null
    AddImageFit $s 'prototype-staff.png' 45 124 405 245 $true|Out-Null
    AddText $s '档案、职责、小组、调派、在线与就位状态、位置新鲜度提示' 55 382 385 40 12 $MUTED|Out-Null
    AddText $s '物资保障' 500 94 210 24 16 $INK $true|Out-Null
    AddImageFit $s 'prototype-materials.png' 490 124 300 245 $true|Out-Null
    AddImageFit $s 'prototype-h5-inventory.png' 805 124 110 245 $true|Out-Null
    AddText $s '站点与台账、数量和有效期、临期提醒、盘点快照、实盘差异与复核' 500 382 410 40 12 $MUTED|Out-Null
    AddBox $s 210 448 540 38 $LIGHTBLUE $LIGHTBLUE 5|Out-Null
    AddText $s '账面快照 + 现场实盘 + 期间变动 = 可审计差异' 235 458 490 20 13 $BLUE $true 2|Out-Null
    AddFooter $s 11
    SetNotes $s '资源保障分为人员和物资。人员侧维护应急人员档案、职责和小组，事件处置时结合调派、在线状态、就位状态与位置新鲜度判断可用人员。物资侧维护站点、台账、有效期和临期提醒；盘点计划发布时冻结账面快照，现场人员用 H5 填写实盘数量，系统计算差异，授权人员复核后才更新台账。当前正式版本的资源全功能属于 Sprint 2 范围，本页界面来自交互原型，来源类型为 PROTOTYPE_TARGET。'
    RenderSlide $s 11

    # 12 值班打卡
    $s=$presentation.Slides.Add(12,12); AddTitle $s 12 '值班与二维码打卡：规则校验、异常发现和提醒形成闭环' '系统完成情况'
    AddImageFit $s 'prototype-attendance.png' 45 95 570 290 $true|Out-Null
    AddImageFit $s 'prototype-h5-checkin.png' 635 95 115 290 $true|Out-Null
    AddText $s '正常链' 780 105 90 20 14 $GREEN $true|Out-Null
    $normal=@('排班','到岗','扫码','身份/时段/半径校验','打卡成功','统计')
    for($i=0;$i -lt $normal.Count;$i++){AddText $s (($i+1).ToString()+'. '+$normal[$i]) 780 (136+$i*32) 145 22 11 $INK|Out-Null}
    AddText $s '异常链' 780 340 90 20 14 $RED $true|Out-Null
    AddText $s '超时未打卡 → 告警 → 统一消息 → 有限重试 → 人工处理' 780 372 145 68 11 $INK|Out-Null
    AddBox $s 70 430 680 54 $PALE $PALE 5|Out-Null
    AddText $s '重复扫码在同一用户、规则窗口与幂等键下返回首次结果；调整排班保留版本与前后值。' 92 445 640 28 12 $NAVY $true 2|Out-Null
    AddFooter $s 12
    SetNotes $s '值班管理员配置小组、班次、点位、有效时段、有效半径和二维码。人员到岗后用 H5 扫码，系统按身份、二维码版本、时段、位置范围和幂等键逐项校验。重复扫码返回首次结果，避免重复记录。到期仍无有效记录时，系统生成唯一异常告警，通过统一消息提醒；重试仍失败则转人工处理。当前正式版本尚未完成值班与打卡全功能接线，本页界面来自交互原型，来源类型为 PROTOTYPE_TARGET。'
    RenderSlide $s 12

    # 13 演练
    $s=$presentation.Slides.Add(13,12); AddTitle $s 13 '演练闭环把计划、执行、评估和整改连成持续改进链' '系统完成情况'
    AddStepChain $s @('年/季/月计划','到期触发','自动任务','H5 执行','模板评估','报告','整改关闭','必要时补演') 45 92 870 $PALE $TEAL 9
    AddImageFit $s 'prototype-drills.png' 45 155 610 285 $true|Out-Null
    AddImageFit $s 'prototype-h5-drills.png' 680 155 115 285 $true|Out-Null
    AddText $s '管理口径' 820 165 95 20 14 $INK $true|Out-Null
    AddText $s '频次管理`n人员执行`n评估模板与评分`n整改责任与期限`n历史记录`n实际完成率' 820 202 100 190 12 $INK|Out-Null
    AddFooter $s 13
    SetNotes $s '安全管理人员按年度、季度或月度维护演练计划和频次。到期后系统形成演练任务，参与人员在 H5 确认并上传记录。管理端按确定的评估模板评分、形成报告；不合格项转为整改，指定责任人和期限，必要时关联补演。统计只把实际完成的执行计入完成率，取消和逾期单独呈现。当前正式版本的演练闭环属于 Sprint 2 范围，本页界面来自交互原型，来源类型为 PROTOTYPE_TARGET。'
    RenderSlide $s 13

    # 14 H5
    $s=$presentation.Slides.Add(14,12); AddTitle $s 14 'H5 将上报、任务和现场作业带到处置人员手中' '系统完成情况'
    $phones=@('prototype-h5-report.png','formal-h5-events.png','formal-h5-tasks.png','prototype-h5-inventory.png')
    $labels=@('移动事件上报','我的事件','任务接收与反馈','移动物资盘点')
    for($i=0;$i -lt 4;$i++){
        $x=55+$i*220
        AddImageFit $s $phones[$i] $x 95 150 315 $true|Out-Null
        AddText $s $labels[$i] ($x-5) 420 160 22 13 $INK $true 2|Out-Null
    }
    AddBox $s 125 462 710 34 $LIGHTBLUE $LIGHTBLUE 5|Out-Null
    AddText $s 'H5 嵌入既有智慧管理 APP，复用统一认证与宿主能力，不建设独立原生 Android/iOS APP。' 145 471 670 18 12 $BLUE $true 2|Out-Null
    AddFooter $s 14
    SetNotes $s 'H5 是现场处置端，不是 Web 的简单缩小版。现场人员可以拍照上报事件、查看自己的事件和任务、确认接收、反馈进度和附件，也可以执行演练、扫码打卡、移动盘点和查询应急知识。H5 嵌入既有智慧管理 APP，复用宿主认证和发布能力，不建设独立原生客户端。中间两张为正式 frontend 界面并依赖模拟数据，来源类型 SIMULATED_DATA；两侧为交互原型，来源类型 PROTOTYPE_TARGET。'
    RenderSlide $s 14

    # 15 外部联动
    $s=$presentation.Slides.Add(15,12); AddTitle $s 15 '多系统联动形成统一应急态势，并保留失败降级路径' '系统完成情况'
    AddBox $s 365 205 230 95 $NAVY $NAVY 5|Out-Null
    AddText $s '应急管理子系统' 390 230 180 30 20 $WHITE $true 2|Out-Null
    AddText $s '事件 · 任务 · 态势 · 审计' 390 265 180 18 11 $LIGHTBLUE $false 2|Out-Null
    $nodes=@(
        @{x=60;y=105;t='视频监控';d='实时调阅 / 回放'},@{x=60;y=205;t='信息发布';d='发布指令 / 状态'},@{x=60;y=305;t='入侵 / 消防';d='告警 → 事件'},@{x=60;y=405;t='IoT / 客流';d='监测 / 补传'},
        @{x=710;y=105;t='门禁';d='授权开启 / 联锁 / 回执'},@{x=710;y=205;t='统一消息';d='通知 / 缺卡 / 回执'},@{x=710;y=305;t='统一中台';d='身份 / 组织 / 权限 / 文件'},@{x=710;y=405;t='GIS / 定位';d='地图 / 楼层 / 位置'}
    )
    foreach($n in $nodes){AddBox $s $n.x $n.y 190 66 $WHITE $LINE 5|Out-Null; AddText $s $n.t ($n.x+14) ($n.y+10) 162 20 14 $INK $true 2|Out-Null; AddText $s $n.d ($n.x+10) ($n.y+36) 170 18 10 $MUTED $false 2|Out-Null; $cx=$(if($n.x -lt 300){$n.x+190}else{$n.x}); AddRule $s $cx ($n.y+33) $(if($n.x -lt 300){365}else{595}) 252 $MUTED 1 $true|Out-Null}
    AddTag $s '正常' 315 350 70 $LIGHTBLUE $BLUE; AddTag $s '超时' 395 350 70 $PALE $ORANGE; AddTag $s '失败' 475 350 70 $PALE $RED; AddTag $s '人工处置' 555 350 90 $PALE $NAVY
    AddText $s '控制指令结果未知时禁止自动重放' 335 405 290 25 14 $RED $true 2|Out-Null
    AddText $s '课程项目以 simulated-integrations 验证正常、无权、超时和失败语义；真实现场联调仍需甲方接口、账号与环境。' 275 448 410 42 11 $MUTED $false 2|Out-Null
    AddFooter $s 15
    SetNotes $s '系统通过独立适配端口连接视频、信息发布、入侵、门禁、消防、IoT、中台、消息、GIS 和定位。每个接口不仅定义成功路径，也定义无权、超时、失败和人工降级。普通通知允许有限重试；门禁等控制指令若超时导致结果未知，系统禁止自动重放，必须核对现场后重新授权。本页展示的是最终联动设计能力。对外接口在课程项目中采用 simulated-integrations 验证语义，来源类型为 SIMULATED_DATA，不代表真实现场已经联通。'
    RenderSlide $s 15

    # 16 统计知识配置
    $s=$presentation.Slides.Add(16,12); AddTitle $s 16 '统计、知识与基础配置支撑复盘和日常运营' '系统完成情况'
    AddImageFit $s 'prototype-statistics.png' 45 95 440 255 $true|Out-Null
    AddImageFit $s 'prototype-config.png' 505 95 270 255 $true|Out-Null
    AddImageFit $s 'prototype-h5-knowledge.png' 795 95 120 255 $true|Out-Null
    $blocks=@(@('统计分析','事件与状态、处置效率、任务、安防、打卡、演练；筛选、钻取与年度报表'),@('知识沉淀','关闭事件与完成演练形成知识条目；分类、关键字和 H5 权限检索'),@('基础配置','预案类型、事件类型、物资站点、评估模板、核实审批配置'))
    for($i=0;$i -lt 3;$i++){
        $x=55+$i*300
        AddText $s $blocks[$i][0] $x 380 220 22 15 $(if($i -eq 0){$BLUE}elseif($i -eq 1){$TEAL}else{$ORANGE}) $true|Out-Null
        AddText $s $blocks[$i][1] $x 410 265 58 12 $INK|Out-Null
    }
    AddFooter $s 16
    SetNotes $s '管理者用统计页查看事件数量、状态分布、处置效率、任务、安防、打卡和演练完成情况，并从汇总下钻到明细。关闭事件和完成演练后，受控材料可以沉淀为知识条目，现场人员在 H5 按分类和关键字检索。基础配置统一维护预案类型、事件类型、物资站点、评估模板和核实流程，减少硬编码。当前正式版本尚未完成这些 Sprint 2 页面接线，本页界面来自交互原型，来源类型为 PROTOTYPE_TARGET。'
    RenderSlide $s 16

    # 17 技术总结
    $s=$presentation.Slides.Add(17,12); AddTitle $s 17 '模块化单体与契约优先支撑可追踪、可测试的研发交付' '研发技术总结'
    $tech=@(
        @{t='前端';d='Vue 3 · Web / H5 共用路由与类型化 API Client';c=$BLUE},
        @{t='后端';d='Node.js 模块化单体 · 领域模块与端口适配';c=$TEAL},
        @{t='数据';d='PostgreSQL · 领域数据单一写入主责 · 成对迁移';c=$NAVY},
        @{t='接口';d='OpenAPI 3.0 · Adapter · 稳定错误码与资源版本';c=$ORANGE},
        @{t='一致性';d='事务 Outbox · 幂等键 · 外部失败不回滚业务事实';c=$TEAL},
        @{t='安全与工程';d='鉴权、权限、审计、traceId · Git / PR Review / 本地质量门禁';c=$BLUE}
    )
    for($i=0;$i -lt 6;$i++){
        $x=55+($i%2)*440; $y=95+[Math]::Floor($i/2)*100
        AddBox $s $x $y 405 76 $WHITE $tech[$i].c 5|Out-Null
        AddText $s $tech[$i].t ($x+18) ($y+14) 95 22 15 $tech[$i].c $true|Out-Null
        AddText $s $tech[$i].d ($x+118) ($y+12) 265 48 12 $INK|Out-Null
    }
    AddBox $s 55 415 845 64 $PALE $PALE 5|Out-Null
    AddText $s '当前研发证据' 72 428 120 20 13 $ORANGE $true|Out-Null
    AddText $s 'Sprint 1 核心事件闭环已通过契约、集成、E2E、覆盖率、安全与本地质量门禁；Sprint 2 将完成剩余 MVP 与外部适配验证。' 195 425 685 40 12 $INK|Out-Null
    AddFooter $s 17
    SetNotes $s '技术实现强调边界清晰和可验证。前端采用 Vue 3，Web 与 H5 共用 API 契约；后端采用模块化单体，模块之间通过应用服务和领域事件协作。关系数据库按领域划分写入主责，迁移成对提供。写操作使用幂等键，领域事实和 Outbox 同事务提交；鉴权、权限、审计和 traceId 贯穿请求。工程上执行功能分支、PR Review、本地质量门禁和自动化测试。当前 Sprint 1 核心事件闭环已经准出，Sprint 2 仍需完成剩余 MVP。'
    RenderSlide $s 17

    # 18 实施管理
    $s=$presentation.Slides.Add(18,12); AddTitle $s 18 '需求、设计、代码与测试通过同一追踪链闭环' '项目实施管理'
    AddStepChain $s @('需求','SRS / spec','设计','原子任务','AI 辅助编码','主责自检','队友 Review','测试','PR Merge','RTM 更新') 45 105 870 $PALE $NAVY 9
    AddText $s '三人责任分工' 55 200 200 24 17 $INK $true|Out-Null
    $roles=@(@('A','项目管理与前端','整合范围、节奏、Web/H5 与最终一致性',$BLUE),@('B','架构与后端','架构、数据库、接口、后端与技术正确性',$TEAL),@('C','需求与质量','需求、RTM、合规、测试和审计',$ORANGE))
    for($i=0;$i -lt 3;$i++){
        $x=55+$i*295
        AddBox $s $x 242 265 115 $WHITE $roles[$i][3] 5|Out-Null
        AddText $s $roles[$i][0] ($x+18) 260 45 35 25 $roles[$i][3] $true 2|Out-Null
        AddText $s $roles[$i][1] ($x+78) 255 165 24 15 $INK $true|Out-Null
        AddText $s $roles[$i][2] ($x+78) 287 165 50 11 $MUTED|Out-Null
    }
    AddBox $s 120 402 720 65 $LIGHTBLUE $LIGHTBLUE 5|Out-Null
    AddText $s 'AI 辅助范围' 145 416 110 20 13 $BLUE $true|Out-Null
    AddText $s '需求解析、设计草稿、编码、Review、测试与追踪均保留 Prompt、人工自检、审核结论和 commit；AI 不替代唯一审核人。' 260 413 550 42 12 $INK|Out-Null
    AddFooter $s 18
    SetNotes $s '项目把需求、设计、任务、代码、测试和 RTM 放在同一条受控链上。每项研发任务先确定 AC 和设计输入，再进入功能分支实现，主责运行本地质量门禁，队友作为唯一审核人 Review，通过后才能 PR Merge，最后更新 RTM。A 负责项目和前端，B 负责架构和后端，C 负责需求和质量。AI 参与需求分析、草稿、编码、评审和测试，但 Prompt、范围、自检与人工审核全部留痕，AI 不能替代责任人。'
    RenderSlide $s 18

    # 19 演示路线
    $s=$presentation.Slides.Add(19,12); AddTitle $s 19 '主演示围绕一个事件跑通 Web 与 H5 协同闭环' '系统演示'
    $demo=@('H5 上报事件','Web 收到事件','核实','启动预案','自动生成任务','H5 接收任务','提交进度 / 图片','Web 查看处置状态','完成任务','关闭事件')
    for($i=0;$i -lt $demo.Count;$i++){
        $x=45+($i%5)*178; $y=100+[Math]::Floor($i/5)*78
        AddBox $s $x $y 155 48 $(if($i%2 -eq 0){$LIGHTBLUE}else{$PALE}) $(if($i -lt 5){$BLUE}else{$TEAL}) 5|Out-Null
        AddText $s (($i+1).ToString('00')+'  '+$demo[$i]) ($x+10) ($y+13) 135 22 11 $INK $true 2|Out-Null
        if($i%5 -ne 4){AddRule $s ($x+155) ($y+24) ($x+174) ($y+24) $MUTED 1.5 $true|Out-Null}
    }
    AddText $s '辅助展示入口' 55 292 160 24 16 $INK $true|Out-Null
    $aux=@('指挥态势','人员位置 / 视频','物资与移动盘点','演练','值班扫码','综合安防','统计与知识库')
    for($i=0;$i -lt $aux.Count;$i++){AddTag $s $aux[$i] (55+($i%4)*215) (335+[Math]::Floor($i/4)*48) 190 $(if($i%2 -eq 0){$PALE}else{$LIGHTBLUE}) $NAVY}
    AddBox $s 55 448 850 38 $PALE $PALE 5|Out-Null
    AddText $s '演示原则：先跑通主演示，再根据时间选择辅助入口；每个外部状态明确标注模拟或目标界面来源。' 80 458 800 20 12 $MUTED $true 2|Out-Null
    AddFooter $s 19
    SetNotes $s '现场演示只围绕一个事件，避免在页面之间无目的跳转。先用 H5 上报，再切到 Web 核实并启动预案，确认系统自动生成任务；随后回到 H5 接收、提交进度和图片，再在 Web 查看处置状态，完成任务并关闭事件。主演示完成后，根据剩余时间进入态势、人员视频、盘点、演练、扫码、安防或统计知识库。涉及外部系统的状态会明确说明课程模拟边界。'
    RenderSlide $s 19

    # 20 总结
    $s=$presentation.Slides.Add(20,12); AddTitle $s 20 '从事件接报到复盘沉淀，系统建立统一应急协同链' '总结与后期规划'
    AddText $s '建设成果' 55 100 200 28 18 $INK $true|Out-Null
    $results=@('完整覆盖事前准备、事中处置和事后闭环','Web 指挥与 H5 现场协同，共用事件、任务和时间线','模块化架构、标准接口和可审计数据支撑持续演进','需求、设计、代码、测试与 RTM 双向追踪')
    for($i=0;$i -lt $results.Count;$i++){AddBox $s 65 (145+$i*46) 10 10 $GREEN $GREEN 9|Out-Null; AddText $s $results[$i] 92 (138+$i*46) 560 34 14 $INK|Out-Null}
    AddBox $s 675 95 230 210 $NAVY $NAVY 5|Out-Null
    AddText $s '下一阶段' 705 118 170 25 18 $WHITE $true 2|Out-Null
    AddText $s '完成剩余 MVP`n态势与安防正式接线`n真实接口资料与现场联调`n最终集成、安全与性能验证`n试运行、培训与竣工验收' 707 165 165 120 13 $LIGHTBLUE $false 2|Out-Null
    AddRule $s 55 350 905 350 $ORANGE 3|Out-Null
    AddText $s '系统把分散的告警、预案、任务、人员、物资和外部系统，组织成一条可执行、可追溯、可复盘的应急链。' 90 380 780 58 21 $BLUE $true 2|Out-Null
    AddText $s '感谢聆听' 390 468 180 30 18 $INK $true 2|Out-Null
    AddFooter $s 20
    SetNotes $s '最后总结。系统从接报开始，用数字化预案组织响应，用任务驱动协同，用态势汇聚人员、资源和外部状态，再通过关闭、调查、评估和知识沉淀完成复盘。当前已经完成 Sprint 1 核心事件处置闭环及相应工程门禁，下一阶段将完成剩余 MVP、态势与安防接线、真实接口联调和最终集成验证，再进入试运行、培训和竣工验收。我们不会把模拟结果替代现场证据。谢谢各位。'
    RenderSlide $s 20

    $presentation.SaveAs($OutputPptx,24)
}
finally {
    $presentation.Close()
    $ppt.Quit()
}
