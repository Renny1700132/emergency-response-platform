$ErrorActionPreference='Stop'
$taskWord=New-Object -ComObject Word.Application
$taskWord.Visible=$false
$taskWord.DisplayAlerts=0
$results=@()
try {
  $sources=@((Get-Item -LiteralPath 'docs/reference/36-测试报告（教学样例）.docx')) + @(Get-ChildItem -LiteralPath docs/deliverables/G5 -Filter *.docx)
  foreach ($item in $sources) {
    $label=if ($item.DirectoryName -like '*reference') {'native-reference'} else {'native-'+$item.BaseName.Substring(0,2)}
    $dir=Join-Path 'tmp/g5-03' $label
    New-Item -ItemType Directory -Force $dir | Out-Null
    $pdf=[IO.Path]::GetFullPath((Join-Path $dir 'document.pdf'))
    $doc=$taskWord.Documents.Open($item.FullName,$false,$true)
    try {
      $doc.Repaginate()
      $pages=$doc.ComputeStatistics(2)
      $doc.ExportAsFixedFormat($pdf,17)
      $results+=@{file=$item.FullName;renderer='Microsoft Word 16.0';pages=$pages;pdf=$pdf}
      Write-Output ($label+': pages='+$pages)
    } finally {$doc.Close(0)}
  }
} finally {$taskWord.Quit()}
$results | ConvertTo-Json -Depth 4 | Set-Content evidence/g5/G5-03/native-render-metadata.json -Encoding utf8
