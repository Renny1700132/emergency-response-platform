$ErrorActionPreference = 'Stop'
$out = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\docs\deliverables\figures\g3_04_core_domain_model.pptx'))
New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($out)) | Out-Null
$app = $null
try {
    try { $app = New-Object -ComObject PowerPoint.Application }
    catch { $app = New-Object -ComObject KPresentation.Application }
    $app.Visible = -1
    $prs = $app.Presentations.Add()
    $prs.PageSetup.SlideWidth = 960
    $prs.PageSetup.SlideHeight = 540
    $slide = $prs.Slides.Add(1, 12)
    function Add-Box($x,$y,$w,$h,$text,$color) {
        $shape = $slide.Shapes.AddShape(5,$x,$y,$w,$h)
        $shape.Fill.ForeColor.RGB = $color
        $shape.Line.ForeColor.RGB = 0x505050
        $shape.TextFrame.TextRange.Text = $text
        $shape.TextFrame.TextRange.Font.Name = '宋体'
        $shape.TextFrame.TextRange.Font.Size = 13
        $shape.TextFrame.TextRange.ParagraphFormat.Alignment = 2
        $shape.TextFrame.VerticalAnchor = 3
    }
    Add-Box 25 32 150 55 "预案域`n版本  流程  模板" 0xF5EBE1
    Add-Box 220 32 150 55 "事件域`n事件  续报  核实" 0xE6F0E1
    Add-Box 415 32 150 55 "任务域`n任务  指派  反馈" 0xD7EBF5
    Add-Box 610 32 150 55 "资源域`n人员  定位  物资" 0xF5E6EB
    Add-Box 795 32 140 55 "值班演练`n打卡  评估" 0xE1F0EB
    Add-Box 145 215 170 65 "业务事实层`n单一写入  状态版本`n四类时间" 0xF4E8DA
    Add-Box 395 215 170 65 "可靠性层`nOutbox  幂等`n消息回执  调用日志" 0xCCE5F3
    Add-Box 645 215 170 65 "横切数据层`n附件引用  审计`n可重建态势投影" 0xE0EBE2
    Add-Box 80 400 185 60 "统一中台`n身份  组织  权限  文件" 0xF0F0F0
    Add-Box 385 400 185 60 "既有业务系统`n视频  消息  门禁  IoT" 0xF0F0F0
    Add-Box 695 400 185 60 "运维与数据治理`n备份  归档  恢复  迁移" 0xF0F0F0
    foreach($ln in @(
        @(175,60,220,60),@(370,60,415,60),@(565,60,610,60),@(760,60,795,60),
        @(265,87,230,215),@(490,87,480,215),@(680,87,730,215),
        @(315,247,395,247),@(565,247,645,247),
        @(230,280,172,400),@(480,280,477,400),@(730,280,787,400)
    )) {
        $c=$slide.Shapes.AddConnector(1,$ln[0],$ln[1],$ln[2],$ln[3]); $c.Line.ForeColor.RGB=0x5A5A5A; $c.Line.Weight=1.25
    }
    $prs.SaveAs($out)
    $prs.Close()
} finally {
    if ($app) { $app.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null }
}
Write-Output $out
