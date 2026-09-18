param(
    [string]$OutputDir = "docs/deliverables/figures"
)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$out = [IO.Path]::GetFullPath((Join-Path $root $OutputDir))
[IO.Directory]::CreateDirectory($out) | Out-Null

function Ole([int]$r, [int]$g, [int]$b) { return $r + 256 * $g + 65536 * $b }

$navy = Ole 25 47 70
$slate = Ole 104 128 156
$orange = Ole 195 96 35
$blue = Ole 220 230 242
$sand = Ole 242 235 220
$green = Ole 226 239 218
$gray = Ole 242 242 242
$white = Ole 255 255 255

function Add-Participant($slide, [string]$text, [double]$x, [double]$w, [int]$fill) {
    $shape = $slide.Shapes.AddShape(5, $x, 18, $w, 34)
    $shape.Fill.ForeColor.RGB = $fill
    $shape.Line.ForeColor.RGB = $navy
    $shape.Line.Weight = 1.2
    $shape.TextFrame2.TextRange.Text = $text.Replace('`n', [Environment]::NewLine)
    $shape.TextFrame2.TextRange.Font.Name = '宋体'
    $shape.TextFrame2.TextRange.Font.NameFarEast = '宋体'
    $shape.TextFrame2.TextRange.Font.Size = 10.5
    $shape.TextFrame2.TextRange.Font.Bold = -1
    $shape.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = $navy
    $shape.TextFrame2.TextRange.ParagraphFormat.Alignment = 2
    $shape.TextFrame2.VerticalAnchor = 3
    $shape.TextFrame2.MarginLeft = 3
    $shape.TextFrame2.MarginRight = 3
    $shape.TextFrame2.MarginTop = 2
    $shape.TextFrame2.MarginBottom = 2
    return $shape
}

function Add-LifeLine($slide, [double]$x) {
    $line = $slide.Shapes.AddLine($x, 54, $x, 330)
    $line.Line.ForeColor.RGB = $slate
    $line.Line.Weight = 1.1
    $line.Line.DashStyle = 4
    return $line
}

function Add-Message($slide, [double]$x1, [double]$x2, [double]$y, [string]$text, [bool]$reply = $false) {
    $line = $slide.Shapes.AddConnector(1, $x1, $y, $x2, $y)
    $line.Line.ForeColor.RGB = if ($reply) { $orange } else { $navy }
    $line.Line.Weight = 1.25
    $line.Line.EndArrowheadStyle = 3
    if ($reply) { $line.Line.DashStyle = 4 }

    $left = [Math]::Min($x1, $x2) + 2
    $width = [Math]::Abs($x2 - $x1) - 4
    $label = $slide.Shapes.AddTextbox(1, $left, $y - 16, $width, 15)
    $label.Fill.Visible = 0
    $label.Line.Visible = 0
    $label.TextFrame2.TextRange.Text = $text
    $label.TextFrame2.TextRange.Font.Name = '宋体'
    $label.TextFrame2.TextRange.Font.NameFarEast = '宋体'
    $label.TextFrame2.TextRange.Font.Size = 8.5
    $label.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = if ($reply) { $orange } else { $navy }
    $label.TextFrame2.TextRange.ParagraphFormat.Alignment = 2
    $label.TextFrame2.VerticalAnchor = 3
    $label.TextFrame2.MarginLeft = 1
    $label.TextFrame2.MarginRight = 1
    $label.TextFrame2.MarginTop = 0
    $label.TextFrame2.MarginBottom = 0
    return $line
}

function Add-Note($slide, [string]$text, [double]$x, [double]$y, [double]$w, [double]$h, [int]$fill) {
    $shape = $slide.Shapes.AddShape(5, $x, $y, $w, $h)
    $shape.Fill.ForeColor.RGB = $fill
    $shape.Line.ForeColor.RGB = $navy
    $shape.Line.Weight = 0.9
    $shape.TextFrame2.TextRange.Text = $text.Replace('`n', [Environment]::NewLine)
    $shape.TextFrame2.TextRange.Font.Name = '宋体'
    $shape.TextFrame2.TextRange.Font.NameFarEast = '宋体'
    $shape.TextFrame2.TextRange.Font.Size = 8.5
    $shape.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = $navy
    $shape.TextFrame2.TextRange.ParagraphFormat.Alignment = 2
    $shape.TextFrame2.VerticalAnchor = 3
    $shape.TextFrame2.MarginLeft = 4
    $shape.TextFrame2.MarginRight = 4
    $shape.TextFrame2.MarginTop = 2
    $shape.TextFrame2.MarginBottom = 2
    return $shape
}

$stem = '14-图2-1-REST接口与外部适配交互时序'
$pptx = Join-Path $out "$stem.pptx"
$emf = Join-Path $out "$stem.emf"
$png = Join-Path $out "$stem.png"

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $presentation = $ppt.Presentations.Add()
    $presentation.PageSetup.SlideWidth = 720
    $presentation.PageSetup.SlideHeight = 362
    $slide = $presentation.Slides.Add(1, 12)
    $slide.FollowMasterBackground = $false
    $slide.Background.Fill.ForeColor.RGB = $white

    $centers = @(72, 216, 360, 504, 648)
    $labels = @(
        'Web / H5 / 大屏',
        'API 网关`n应用服务',
        '领域服务`n关系数据库',
        'Outbox`n异步任务',
        '外部适配器`n既有系统'
    )
    $fills = @($blue, $sand, $green, $gray, $blue)
    for ($i = 0; $i -lt $centers.Count; $i++) {
        Add-Participant $slide $labels[$i] ($centers[$i] - 54) 108 $fills[$i] | Out-Null
        Add-LifeLine $slide $centers[$i] | Out-Null
    }

    Add-Message $slide $centers[0] $centers[1] 78 'POST /incidents/{id}/start-response' | Out-Null
    Add-Message $slide $centers[1] $centers[2] 112 '鉴权、状态与版本校验' | Out-Null
    Add-Message $slide $centers[2] $centers[3] 146 '同事务：响应上下文、任务、Outbox' | Out-Null
    Add-Message $slide $centers[2] $centers[1] 180 '提交结果 / traceId' $true | Out-Null
    Add-Message $slide $centers[1] $centers[0] 214 '200：已受理（预案启动目标≤3秒）' $true | Out-Null
    Add-Message $slide $centers[3] $centers[4] 248 '提交后：消息、投影、专业系统调用' | Out-Null
    Add-Message $slide $centers[4] $centers[3] 282 '受理 / 回执 / 错误 / 超时' $true | Out-Null
    Add-Message $slide $centers[3] $centers[2] 316 '幂等更新投递状态与审计' $true | Out-Null

    Add-Note $slide '同步事务只确认本系统事实；外部失败不回滚已确认事件。门禁命令超时标记“结果未知”，禁止自动重放。' 110 334 500 23 $sand | Out-Null

    $presentation.SaveAs($pptx, 24)
    $slide.Export($emf, 'EMF', 2400, 1207)
    $slide.Export($png, 'PNG', 2400, 1207)
    $presentation.Close()
} finally {
    $ppt.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}

Write-Output "PPTX=$pptx"
Write-Output "EMF=$emf"
Write-Output "PNG=$png"

