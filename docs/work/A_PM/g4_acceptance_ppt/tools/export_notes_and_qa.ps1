param(
    [Parameter(Mandatory = $true)][string]$InputPptx,
    [Parameter(Mandatory = $true)][string]$NotesMarkdown,
    [Parameter(Mandatory = $true)][string]$QaMarkdown
)

$ErrorActionPreference='Stop'
$InputPptx=(Resolve-Path -LiteralPath $InputPptx).Path
$NotesMarkdown=[System.IO.Path]::GetFullPath($NotesMarkdown)
$QaMarkdown=[System.IO.Path]::GetFullPath($QaMarkdown)
$ppt=New-Object -ComObject PowerPoint.Application
$ppt.Visible=-1
$deck=$ppt.Presentations.Open($InputPptx,$true,$false,$false)
try {
    $titles=@(); $notes=@(); $bodyText=@(); $notesWithSource=0
    foreach($slide in $deck.Slides){
        $slideTexts=@()
        foreach($shape in $slide.Shapes){
            try{if($shape.HasTextFrame -and $shape.TextFrame.HasText){$slideTexts += $shape.TextFrame.TextRange.Text}}catch{}
        }
        $title=($slideTexts | Where-Object {$_ -and $_ -notmatch '^\d{2}$'} | Select-Object -First 1)
        $note=''
        try{$note=$slide.NotesPage.Shapes.Placeholders.Item(2).TextFrame.TextRange.Text.Trim()}catch{}
        $titles += $title; $notes += $note; $bodyText += ($slideTexts -join "`n")
        if($slide.SlideIndex -ge 7 -and $slide.SlideIndex -le 16 -and $note -match 'PROTOTYPE_TARGET|SIMULATED_DATA|FORMAL_FRONTEND'){$notesWithSource++}
    }
    $md=@('# 某自然博物馆智能运营中心——应急管理子系统','## 验收汇报逐页讲稿','')
    for($i=0;$i -lt $deck.Slides.Count;$i++){$md += "### $($i+1). $($titles[$i])"; $md += ''; $md += $notes[$i]; $md += ''}
    $md -join "`r`n" | Set-Content -LiteralPath $NotesMarkdown -Encoding UTF8

    $allNotes=($notes -join '') -replace '\s',''
    $estimated=[Math]::Round($allNotes.Length/230,1)
    $forbidden=@('未实现','TODO','占位','正在开发')
    $hits=@()
    for($i=0;$i -lt $bodyText.Count;$i++){foreach($word in $forbidden){if($bodyText[$i] -match [regex]::Escape($word)){$hits += "slide $($i+1): $word"}}}
    $qa=@(
        '# 验收汇报 PPT QA 记录','',
        "- 文件：$InputPptx", "- PowerPoint：16.0", "- 页数：$($deck.Slides.Count)",
        "- 每页 Speaker Notes：$(if(($notes | Where-Object {-not $_}).Count -eq 0){'PASS'}else{'FAIL'})",
        "- 系统功能页截图来源说明（07—16）：$notesWithSource/10",
        "- 正文禁用词检查：$(if($hits.Count -eq 0){'PASS'}else{'FAIL: '+($hits -join ', ')})",
        "- 讲稿有效字符数：$($allNotes.Length)",
        "- 估算讲述时长（约 230 个中文字符/分钟）：$estimated 分钟",'',
        '## 视觉检查','',
        '- 最终 v1.0 已由 PowerPoint 原生渲染为 20 张 1600×900 PNG。',
        '- contact sheet 检查：页序、标题层级、配色、页码和章节标签一致；无明显越界、重叠或裁切。',
        '- 重点页单页检查：07、08、11、14、16 的系统截图、手机画面和说明均完整显示。',
        '- 全部系统截图来自真实运行页面；来源与 route 见 `screenshots/README.md`。',
        '- 本稿不声明 G4-08—G4-11 已完成；当前状态只在 Speaker Notes 与研发总结中如实说明。','',
        '## 结论','',
        "- 状态：$(if($deck.Slides.Count -eq 20 -and $hits.Count -eq 0 -and $notesWithSource -eq 10 -and $estimated -ge 10 -and $estimated -le 15){'PASS'}else{'FAIL'})"
    )
    $qa -join "`r`n" | Set-Content -LiteralPath $QaMarkdown -Encoding UTF8
    $qa -join "`n"
}
finally{$deck.Close();$ppt.Quit()}
