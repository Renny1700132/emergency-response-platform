param(
    [Parameter(Mandatory = $true)][string]$InputPptx,
    [Parameter(Mandatory = $true)][string]$OutputDir
)
$ErrorActionPreference='Stop'
$InputPptx=(Resolve-Path -LiteralPath $InputPptx).Path
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$OutputDir=(Resolve-Path -LiteralPath $OutputDir).Path
$ppt=New-Object -ComObject PowerPoint.Application
$ppt.Visible=-1
$deck=$ppt.Presentations.Open($InputPptx,$true,$false,$false)
try{foreach($slide in $deck.Slides){$slide.Export((Join-Path $OutputDir ("slide-{0:D2}.png" -f $slide.SlideIndex)),'PNG',1600,900)}}
finally{$deck.Close();$ppt.Quit()}
