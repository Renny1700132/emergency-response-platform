$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$deliverableDir = Join-Path $root 'docs/deliverables/G6'
$qaDir = Join-Path $root '.tmp/g6-word-render'
New-Item -ItemType Directory -Force -Path $deliverableDir, $qaDir | Out-Null

$pairs = @(
  @{ Source = 'docs/deliverables/G6/34-用户手册.docx'; Pdf = 'docs/deliverables/G6/34-用户手册.pdf'; Qa = 'deliverable-34.pdf' },
  @{ Source = 'docs/deliverables/G6/45-部署与运维手册.docx'; Pdf = 'docs/deliverables/G6/45-部署与运维手册.pdf'; Qa = 'deliverable-45.pdf' },
  @{ Source = 'docs/reference/34-用户手册（教学样例）.docx'; Pdf = $null; Qa = 'reference-34.pdf' },
  @{ Source = 'docs/reference/45-部署与运维手册（教学样例）.docx'; Pdf = $null; Qa = 'reference-45.pdf' }
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$results = @()
try {
  foreach ($pair in $pairs) {
    $source = Join-Path $root $pair.Source
    $qaPdf = Join-Path $qaDir $pair.Qa
    $readOnly = -not [bool]$pair.Pdf
    $doc = $word.Documents.Open($source, $false, $readOnly)
    try {
      if ($pair.Pdf) {
        foreach ($toc in $doc.TablesOfContents) { $toc.Update(); $toc.UpdatePageNumbers() }
        $doc.Fields.Update() | Out-Null
        $doc.Repaginate()
        $doc.Save()
      }
      $doc.Repaginate()
      $doc.ExportAsFixedFormat($qaPdf, 17)
      if ($pair.Pdf) { Copy-Item -LiteralPath $qaPdf -Destination (Join-Path $root $pair.Pdf) -Force }
      $results += [ordered]@{ source = $pair.Source; qaPdf = (Resolve-Path $qaPdf).Path; pages = $doc.ComputeStatistics(2); finalPdf = $pair.Pdf }
    } finally {
      $doc.Close($false)
    }
  }
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) | Out-Null
}
$results | ConvertTo-Json -Depth 4 | Set-Content -Encoding utf8 (Join-Path $qaDir 'word-export.json')
$results | ConvertTo-Json -Depth 4
