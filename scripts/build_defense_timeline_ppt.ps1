param([string]$OutputDir = "docs/deliverables/figures")

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$out = [IO.Path]::GetFullPath((Join-Path $root $OutputDir))
[IO.Directory]::CreateDirectory($out) | Out-Null
$pptx = Join-Path $out '06-图1-1-述标8分钟时间分配总览.pptx'
$svg = Join-Path $out '06-图1-1-述标8分钟时间分配总览.svg'
$emf = Join-Path $out '06-图1-1-述标8分钟时间分配总览.emf'
$png = Join-Path $out '06-图1-1-述标8分钟时间分配总览.png'

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Add()
    $pres.PageSetup.SlideWidth = 720
    $pres.PageSetup.SlideHeight = 158.4
    $slide = $pres.Slides.Add(1, 12)
    $slide.FollowMasterBackground = $false
    $slide.Background.Fill.ForeColor.RGB = 16777215

    $segments = @(
        @{Label='开场'; Time='0:00–0:35'; Seconds=35; Fill=15983321},
        @{Label='需求理解'; Time='0:35–1:55'; Seconds=80; Fill=14215150},
        @{Label='总体方案'; Time='1:55–3:25'; Seconds=90; Fill=15983321},
        @{Label='关键技术'; Time='3:25–5:20'; Seconds=115; Fill=14215150},
        @{Label='实施与质量'; Time='5:20–6:35'; Seconds=75; Fill=15983321},
        @{Label='AI 辅助策略'; Time='6:35–7:25'; Seconds=50; Fill=2255561},
        @{Label='收尾'; Time='7:25–8:00'; Seconds=35; Fill=15983321}
    )
    $x = 25.2; $y = 52; $totalW = 669.6; $h = 36; $totalSeconds = 480
    foreach ($seg in $segments) {
        $w = $totalW * $seg.Seconds / $totalSeconds
        $shape = $slide.Shapes.AddShape(5, $x, $y, $w, $h)
        $shape.Fill.ForeColor.RGB = $seg.Fill
        $shape.Line.ForeColor.RGB = 6116887
        $shape.Line.Weight = 1.15
        $shape.TextFrame2.TextRange.Text = ''

        $label = $slide.Shapes.AddTextbox(1, $x, 25, $w, 20)
        $label.TextFrame2.TextRange.Text = $seg.Label
        $label.TextFrame2.TextRange.Font.Name = '宋体'
        $label.TextFrame2.TextRange.Font.NameFarEast = '宋体'
        $label.TextFrame2.TextRange.Font.Size = 10.5
        $label.TextFrame2.TextRange.Font.Bold = -1
        $label.TextFrame2.TextRange.ParagraphFormat.Alignment = 2
        $label.TextFrame2.MarginLeft = 0; $label.TextFrame2.MarginRight = 0

        $time = $slide.Shapes.AddTextbox(1, $x, 92, $w, 18)
        $time.TextFrame2.TextRange.Text = $seg.Time
        $time.TextFrame2.TextRange.Font.Name = 'Times New Roman'
        $time.TextFrame2.TextRange.Font.NameFarEast = '宋体'
        $time.TextFrame2.TextRange.Font.Size = 8.5
        $time.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = 10066329
        $time.TextFrame2.TextRange.ParagraphFormat.Alignment = 2
        $time.TextFrame2.MarginLeft = 0; $time.TextFrame2.MarginRight = 0
        $x += $w
    }

    $note = $slide.Shapes.AddTextbox(1, 40, 120, 640, 21)
    $note.TextFrame2.TextRange.Text = '时间按 8 分钟控制，关键技术与总体方案合计 205 秒；超时优先压缩案例说明，不削减范围、边界和验证口径。'
    $note.TextFrame2.TextRange.Font.Name = '宋体'
    $note.TextFrame2.TextRange.Font.NameFarEast = '宋体'
    $note.TextFrame2.TextRange.Font.Size = 9
    $note.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = 23736
    $note.TextFrame2.TextRange.ParagraphFormat.Alignment = 2

    $pres.SaveAs($pptx, 24)
    try { $slide.Export($svg, 'SVG', 2000, 440) } catch { Write-Output "SVG_UNAVAILABLE=$($_.Exception.Message)" }
    $slide.Export($emf, 'EMF', 2000, 440)
    $slide.Export($png, 'PNG', 3000, 660)
    $pres.Close()
    Write-Output "PPTX=$pptx"
    Write-Output "SVG=$svg"
    Write-Output "EMF=$emf"
    Write-Output "PNG=$png"
} finally {
    $ppt.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
