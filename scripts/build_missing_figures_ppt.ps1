param([string]$OutputDir = "docs/deliverables/figures")

$ErrorActionPreference = 'Stop'
$root=(Get-Location).Path
$out=[IO.Path]::GetFullPath((Join-Path $root $OutputDir))
[IO.Directory]::CreateDirectory($out) | Out-Null

function Ole([int]$r,[int]$g,[int]$b){ return $r + 256*$g + 65536*$b }
$navy=Ole 31 59 87; $blue=Ole 220 230 242; $sand=Ole 242 235 220; $green=Ole 226 239 218
$orange=Ole 201 106 34; $lightOrange=Ole 250 229 211; $gray=Ole 242 242 242; $white=Ole 255 255 255

function AddText($slide,[string]$text,[double]$x,[double]$y,[double]$w,[double]$h,[double]$size=12,[bool]$bold=$false,[int]$color=$navy){
    $s=$slide.Shapes.AddTextbox(1,$x,$y,$w,$h)
    $s.TextFrame2.TextRange.Text=$text.Replace('`n',[Environment]::NewLine)
    $s.TextFrame2.TextRange.Font.Name='宋体'; $s.TextFrame2.TextRange.Font.NameFarEast='宋体'
    $s.TextFrame2.TextRange.Font.Size=$size; $s.TextFrame2.TextRange.Font.Bold=if($bold){-1}else{0}
    $s.TextFrame2.TextRange.Font.Fill.ForeColor.RGB=$color
    $s.TextFrame2.TextRange.ParagraphFormat.Alignment=2
    $s.TextFrame2.VerticalAnchor=3
    $s.TextFrame2.MarginLeft=4; $s.TextFrame2.MarginRight=4; $s.TextFrame2.MarginTop=2; $s.TextFrame2.MarginBottom=2
    return $s
}

function AddBox($slide,[string]$text,[double]$x,[double]$y,[double]$w,[double]$h,[int]$fill=$blue,[double]$size=11){
    $s=$slide.Shapes.AddShape(5,$x,$y,$w,$h)
    $s.Fill.ForeColor.RGB=$fill; $s.Line.ForeColor.RGB=$navy; $s.Line.Weight=1.2
    $s.TextFrame2.TextRange.Text=$text.Replace('`n',[Environment]::NewLine)
    $s.TextFrame2.TextRange.Font.Name='宋体'; $s.TextFrame2.TextRange.Font.NameFarEast='宋体'
    $s.TextFrame2.TextRange.Font.Size=$size; $s.TextFrame2.TextRange.Font.Fill.ForeColor.RGB=$navy
    $s.TextFrame2.TextRange.Font.Bold=-1; $s.TextFrame2.TextRange.ParagraphFormat.Alignment=2
    $s.TextFrame2.VerticalAnchor=3
    $s.TextFrame2.MarginLeft=5; $s.TextFrame2.MarginRight=5; $s.TextFrame2.MarginTop=3; $s.TextFrame2.MarginBottom=3
    return $s
}

function Connect($slide,$from,$to){
    $c=$slide.Shapes.AddConnector(1,0,0,10,0)
    $c.Line.ForeColor.RGB=$navy; $c.Line.Weight=1.3; $c.Line.EndArrowheadStyle=3
    $c.ConnectorFormat.BeginConnect($from,4); $c.ConnectorFormat.EndConnect($to,2)
    $c.RerouteConnections()
    return $c
}

function NewFigure([string]$stem,[scriptblock]$builder){
    $pres=$ppt.Presentations.Add(); $pres.PageSetup.SlideWidth=720; $pres.PageSetup.SlideHeight=270
    $slide=$pres.Slides.Add(1,12); $slide.FollowMasterBackground=$false; $slide.Background.Fill.ForeColor.RGB=$white
    & $builder $slide
    $pptx=Join-Path $out "$stem.pptx"; $emf=Join-Path $out "$stem.emf"; $png=Join-Path $out "$stem.png"
    $pres.SaveAs($pptx,24); $slide.Export($emf,'EMF',2400,900); $slide.Export($png,'PNG',3200,1200); $pres.Close()
    Write-Output "CREATED=$stem"
}

$ppt=New-Object -ComObject PowerPoint.Application
try {
    NewFigure '01-图2-1-应急业务全流程与建设目标' {
        param($s)
        AddText $s '应急业务全流程与建设目标' 40 12 640 28 15 $true | Out-Null
        $labels=@('事前准备`n预案·资源·值班·演练','事件发现`nWeb/H5/告警接入','指挥处置`n核实·启动·调度','现场执行`n任务·反馈·联动','事后改进`n评估·调查·知识沉淀')
        $boxes=@(); for($i=0;$i -lt 5;$i++){ $boxes+=AddBox $s $labels[$i] (30+$i*138) 84 112 60 @($green,$blue,$sand,$blue,$green)[$i] 10.5 }
        for($i=0;$i -lt 4;$i++){Connect $s $boxes[$i] $boxes[$i+1] | Out-Null}
        AddText $s '目标：统一态势、秒级响应、全过程留痕；异常时按受控降级转人工处置。' 55 178 610 32 10 $false $orange | Out-Null
    }
    NewFigure '01-图3-1-建设内容分层结构' {
        param($s)
        AddText $s '建设内容分层结构' 40 10 640 28 15 $true | Out-Null
        $a=AddBox $s '应用层`nWeb 指挥与管理端　嵌入式 H5　应急信息与综合安防视图' 90 52 540 42 $blue 11
        $b=AddBox $s '业务层`n预案　指挥　资源　演练　事件　值班　基础管理' 90 104 540 42 $sand 11
        $c=AddBox $s '集成层`n视频　定位　消息　门禁　地图　物联网　统一中台' 90 156 540 42 $green 11
        $d=AddBox $s '数据与运行保障`n私有环境　容器化部署　审计留痕　备份恢复　安全验证' 90 208 540 42 $gray 11
    }
    NewFigure '02-图1-1-澄清与质询闭环流程' {
        param($s)
        AddText $s '澄清与质询闭环流程' 40 12 640 28 15 $true | Out-Null
        $labels=@('识别歧义`n条款·指标·边界','书面澄清`n课程模拟裁决','冻结解释`nDEC 与 Baseline','方案落实`n计划·风险·响应','验证归档`n里程碑证据')
        $boxes=@(); for($i=0;$i -lt 5;$i++){ $boxes+=AddBox $s $labels[$i] (30+$i*138) 90 112 60 @($blue,$sand,$blue,$sand,$green)[$i] 10.5 }
        for($i=0;$i -lt 4;$i++){Connect $s $boxes[$i] $boxes[$i+1] | Out-Null}
        AddText $s '原始需求明确条款始终优先；没有真实证据的事项不得写成已验收。' 75 185 570 30 10 $false $orange | Out-Null
    }
    NewFigure '05-图2-1-MVP范围与边界一览' {
        param($s)
        AddText $s 'MVP 范围与边界一览' 40 10 640 28 15 $true | Out-Null
        AddText $s '优先形成可验证闭环' 35 48 205 24 11 $true | Out-Null
        AddText $s '同步前置验证' 258 48 205 24 11 $true | Out-Null
        AddText $s '非 MVP 但仍属本期' 480 48 205 24 11 $true | Out-Null
        AddBox $s '预案与事件处置`n指挥态势与现场执行`n演练和值班闭环' 35 80 205 104 $blue 10.5 | Out-Null
        AddBox $s '视频·定位·消息·物联·中台`n性能·安全·部署`n均按里程碑形成证据' 258 80 205 104 $sand 10.5 | Out-Null
        AddBox $s '其余功能、数据初始化`n文档、培训、试运行与服务`n全量 39 条 FR 与 PE 验收' 480 80 205 104 $green 10.5 | Out-Null
        AddText $s '明确范围外：既有系统本体改造、硬件采购、地图重测/三维建模、原生 APP、正式第三方等保测评采购。' 45 207 630 36 9.5 $false $orange | Out-Null
    }
    NewFigure '00-图7-2-应用安全防护体系' {
        param($s)
        AddText $s '应用安全防护体系' 40 10 640 28 15 $true | Out-Null
        $labels=@('身份与权限`n最小授权·角色范围','接口安全`n令牌·加密·限流','数据安全`n敏感字段·导出审计','应用安全`nSCA·扫描·渗透复测','运行审计`n日志留存·异常告警')
        $boxes=@(); for($i=0;$i -lt 5;$i++){ $boxes+=AddBox $s $labels[$i] (30+$i*138) 83 112 66 @($blue,$sand,$green,$lightOrange,$gray)[$i] 10.5 }
        for($i=0;$i -lt 4;$i++){Connect $s $boxes[$i] $boxes[$i+1] | Out-Null}
        AddBox $s '部署于甲方私有环境；交付前高危漏洞清零，正式第三方等保测评采购不默认属于乙方范围。' 85 187 550 46 $white 10 | Out-Null
    }
    NewFigure '00-图9-2-四级测试与验收证据链' {
        param($s)
        AddText $s '四级测试与验收证据链' 40 10 640 28 15 $true | Out-Null
        $labels=@('单元测试`n核心模块覆盖率','集成测试`n接口契约与异常','系统测试`n功能·性能·安全','验收测试`n联动·部署·演练')
        $boxes=@(); for($i=0;$i -lt 4;$i++){ $boxes+=AddBox $s $labels[$i] (55+$i*165) 82 135 64 @($blue,$sand,$green,$lightOrange)[$i] 11 }
        for($i=0;$i -lt 3;$i++){Connect $s $boxes[$i] $boxes[$i+1] | Out-Null}
        AddText $s '每一级均回指需求、用例、结果与原始证据；自动检查不得替代现场验收。' 80 184 560 34 10 $false $orange | Out-Null
    }
    NewFigure '00-图8-5-项目责任关系' {
        param($s)
        AddText $s '项目责任关系' 40 10 640 28 15 $true | Out-Null
        $pm=AddBox $s '何思源`n项目经理 PM`n总编与最终质量负责人' 270 52 180 68 $blue 11
        $tech=AddBox $s '严宇`n技术负责人 / 架构师`n方案、接口与技术验证' 105 160 205 70 $sand 10.5
        $qa=AddBox $s '任俊强`n需求 / 质量 / 合规负责人`n条款、数字与符合性' 410 160 205 70 $green 10.5
        Connect $s $pm $tech | Out-Null; Connect $s $pm $qa | Out-Null
    }
} finally {
    $ppt.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
