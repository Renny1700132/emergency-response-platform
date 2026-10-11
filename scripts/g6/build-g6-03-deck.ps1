param([string]$Workspace = (Get-Location).Path)
$ErrorActionPreference = 'Stop'
$Workspace = (Resolve-Path -LiteralPath $Workspace).Path
$source = Join-Path $Workspace 'docs/work/G6/g6_03_defense_content.json'
$content = Get-Content -LiteralPath $source -Raw -Encoding UTF8 | ConvertFrom-Json
$outputDir = Join-Path $Workspace 'docs/deliverables/G6'
$renderDir = Join-Path $Workspace 'tmp/g6-03-slide-qa'
$evidenceDir = Join-Path $Workspace 'evidence/g6/G6-03'
New-Item -ItemType Directory -Force -Path $outputDir,$renderDir,$evidenceDir | Out-Null
$pptxPath = Join-Path $outputDir 'G6-03-验收答辩候选.pptx'
$pdfPath = Join-Path $outputDir 'G6-03-验收答辩候选.pdf'
$font = '微软雅黑'
function Rgb([string]$hex) {
  $h = $hex.TrimStart('#')
  return [Convert]::ToInt32($h.Substring(0,2),16) + 256*[Convert]::ToInt32($h.Substring(2,2),16) + 65536*[Convert]::ToInt32($h.Substring(4,2),16)
}
$ink = Rgb '#172E3A'; $blue = Rgb '#185478'; $muted = Rgb '#506471'; $red = Rgb '#8C351E'
function Text($slide,[string]$name,[string]$value,[double]$x,[double]$y,[double]$w,[double]$h,[double]$size,[int]$color,[bool]$bold=$false) {
  $shape = $slide.Shapes.AddTextbox(1,$x,$y,$w,$h)
  $shape.Name=$name
  $shape.TextFrame.MarginLeft=0; $shape.TextFrame.MarginRight=0
  $shape.TextFrame.MarginTop=0; $shape.TextFrame.MarginBottom=0
  $shape.TextFrame.WordWrap=-1; $shape.TextFrame.AutoSize=0
  $range=$shape.TextFrame.TextRange; $range.Text=$value
  $range.Font.Name=$font; $range.Font.NameFarEast=$font; $range.Font.Size=$size
  $range.Font.Color.RGB=$color; $range.Font.Bold=$(if($bold){-1}else{0})
  $range.ParagraphFormat.SpaceAfter=12
  $shape.TextFrame2.AutoSize=0
  $shape.Height=$h
  return $shape
}
$app=New-Object -ComObject PowerPoint.Application
$deck=$app.Presentations.Add(0)
$deck.PageSetup.SlideWidth=960; $deck.PageSetup.SlideHeight=540
$geometry=@(); $rendered=@()
try {
  foreach($item in $content.slides) {
    $slide=$deck.Slides.Add($deck.Slides.Count+1,12)
    $slide.FollowMasterBackground=0; $slide.Background.Fill.ForeColor.RGB=Rgb '#FFFFFF'
    if($item.layout -eq 'cover') {
      [void](Text $slide 'title' $item.title 64 116 840 68 44 $ink $true)
      [void](Text $slide 'subtitle' $item.subtitle 66 197 820 45 29 $blue $true)
      [void](Text $slide 'cover-body' ($item.body -join "`r`n") 68 289 820 145 23 $ink)
    } else {
      [void](Text $slide 'title' $item.title 48 31 864 53 32 $ink $true)
      [void](Text $slide 'subtitle' $item.subtitle 50 91 860 37 18 $blue)
      if($item.layout -eq 'table') {
        $rows=@($item.table); $cols=@($rows[0]).Count
        $tableShape=$slide.Shapes.AddTable($rows.Count,$cols,48,145,864,300)
        $tableShape.Name='evidence-table'
        if($cols -eq 3) { $tableShape.Table.Columns.Item(1).Width=190; $tableShape.Table.Columns.Item(2).Width=300; $tableShape.Table.Columns.Item(3).Width=374 }
        for($r=1;$r -le $rows.Count;$r++) {
          for($c=1;$c -le $cols;$c++) {
            $cell=$tableShape.Table.Cell($r,$c).Shape
            $cell.TextFrame.TextRange.Text=[string]$rows[$r-1][$c-1]
            $cell.TextFrame.TextRange.Font.Name=$font; $cell.TextFrame.TextRange.Font.NameFarEast=$font
            $cell.TextFrame.TextRange.Font.Size=18
            $cell.TextFrame.TextRange.Font.Color.RGB=$ink
            $cell.TextFrame.TextRange.Font.Bold=$(if($r -eq 1){-1}else{0})
            $cell.TextFrame.MarginLeft=12; $cell.TextFrame.MarginRight=12
            $cell.TextFrame.MarginTop=9; $cell.TextFrame.MarginBottom=6
            $cell.Fill.ForeColor.RGB=$(if($r -eq 1){Rgb '#EDF2F5'}else{Rgb '#FFFFFF'})
          }
        }
      } elseif($item.layout -eq 'image') {
        $imagePath=Join-Path $Workspace $item.image
        if(-not(Test-Path -LiteralPath $imagePath)){throw "Missing image $imagePath"}
        $pic=$slide.Shapes.AddPicture($imagePath,0,-1,0,0,-1,-1)
        $pic.Name='actual-run-screenshot'
        $pic.LockAspectRatio=0
        $factor=[Math]::Min(552/$pic.Width,320/$pic.Height)
        $pic.Width=$pic.Width*$factor; $pic.Height=$pic.Height*$factor
        $pic.Left=48+(552-$pic.Width)/2; $pic.Top=143+(320-$pic.Height)/2
        [void](Text $slide 'image-source' ('模拟数据，实际截图；版本：'+$content.rehearsalRunId) 48 474 555 19 10 $muted)
        [void](Text $slide 'evidence-observations' ($item.body -join "`r`n`r`n") 637 152 275 322 19 $ink)
      } else {
        [void](Text $slide 'body' ($item.body -join "`r`n`r`n") 64 161 832 310 23 $ink)
      }
    }
    [void](Text $slide 'boundary' '课程模拟试演候选；真实项目验收延期；C整体复核待完成' 48 498 822 22 11 $red)
    [void](Text $slide 'page-number' ([string]$item.number) 891 496 25 22 12 $muted)
    $notes=$item.notes+"`r`n`r`n来源：`r`n"+($item.sources -join "`r`n")+"`r`n截图版本："+$content.rehearsalRunId+"`r`n数据和状态：COURSE_SIMULATED_REHEARSAL / REAL_WORLD_DEFERRED / C_PENDING_REVIEW"
    $slide.NotesPage.Shapes.Placeholders.Item(2).TextFrame.TextRange.Text=$notes
  }
  $deck.SaveAs($pptxPath,24)
  $deck.SaveAs($pdfPath,32)
  foreach($slide in $deck.Slides) {
    $imagePath=Join-Path $renderDir ('slide-{0:D2}.png' -f $slide.SlideIndex)
    $slide.Export($imagePath,'PNG',1600,900)
    $rendered+=@{slide=$slide.SlideIndex;path=$imagePath}
    foreach($shape in $slide.Shapes) {
      $item=@{slide=$slide.SlideIndex;name=$shape.Name;x=[double]$shape.Left;y=[double]$shape.Top;width=[double]$shape.Width;height=[double]$shape.Height;withinCanvas=($shape.Left -ge -1 -and $shape.Top -ge -1 -and ($shape.Left+$shape.Width) -le 961 -and ($shape.Top+$shape.Height) -le 541)}
      if($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
        $item.text=[string]$shape.TextFrame.TextRange.Text
        $item.boundHeight=[double]$shape.TextFrame2.TextRange.BoundHeight
        $item.textFits=($item.boundHeight -le ($item.height+2))
      }
      $geometry+=$item
    }
  }
  $result=@{taskId='G6-03';mode='NEW_DOCUMENT';authoring='Microsoft PowerPoint native COM';runtimeFallback='artifact-tool/load_workspace_dependencies unavailable';fontPolicy=@{basis='design';families=@($font)};slides=$deck.Slides.Count;slideWidthPt=960;slideHeightPt=540;editableNotes=$true;source='docs/work/G6/g6_03_defense_content.json';pptx='docs/deliverables/G6/G6-03-验收答辩候选.pptx';pdf='docs/deliverables/G6/G6-03-验收答辩候选.pdf';rendered=$rendered;geometry=$geometry;visualInspection='PENDING';cOverallReview='PENDING_REVIEW'}
  $result | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $evidenceDir 'deck-generation.json') -Encoding UTF8
  Write-Output ("Created native PPTX/PDF, slides={0}, geometry objects={1}" -f $deck.Slides.Count,$geometry.Count)
} finally {
  $deck.Close(); $app.Quit()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($deck)
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
