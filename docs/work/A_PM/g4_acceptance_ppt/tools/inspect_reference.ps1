param(
    [Parameter(Mandatory = $true)][string]$InputPptx,
    [Parameter(Mandatory = $true)][string]$OutputDir
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$OutputDir = (Resolve-Path -LiteralPath $OutputDir).Path
$InputPptx = (Resolve-Path -LiteralPath $InputPptx).Path

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$presentation = $null
try {
    $presentation = $ppt.Presentations.Open($InputPptx, $true, $false, $false)
    $metadata = [ordered]@{
        source = $InputPptx
        slide_width_points = $presentation.PageSetup.SlideWidth
        slide_height_points = $presentation.PageSetup.SlideHeight
        slide_count = $presentation.Slides.Count
        slides = @()
    }

    foreach ($slide in $presentation.Slides) {
        $texts = @()
        foreach ($shape in $slide.Shapes) {
            try {
                if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
                    $texts += [ordered]@{
                        name = $shape.Name
                        left = [math]::Round($shape.Left, 2)
                        top = [math]::Round($shape.Top, 2)
                        width = [math]::Round($shape.Width, 2)
                        height = [math]::Round($shape.Height, 2)
                        text = $shape.TextFrame.TextRange.Text
                        font = $shape.TextFrame.TextRange.Font.Name
                        font_size = $shape.TextFrame.TextRange.Font.Size
                        color_rgb = $shape.TextFrame.TextRange.Font.Color.RGB
                    }
                }
            } catch { }
        }
        $png = Join-Path $OutputDir ("slide-{0:D2}.png" -f $slide.SlideIndex)
        $slide.Export($png, 'PNG', 1600, 900)
        $metadata.slides += [ordered]@{
            index = $slide.SlideIndex
            layout = $slide.CustomLayout.Name
            background_rgb = $(try { $slide.Background.Fill.ForeColor.RGB } catch { $null })
            texts = $texts
        }
    }

    $metadata | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $OutputDir 'reference_metadata.json')
}
finally {
    if ($null -ne $presentation) { $presentation.Close() }
    $ppt.Quit()
}
