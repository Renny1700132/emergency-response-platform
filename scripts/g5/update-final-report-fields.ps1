$ErrorActionPreference='Stop'
$taskWord = New-Object -ComObject Word.Application
$taskWord.Visible=$false
$taskWord.DisplayAlerts=0
try {
  foreach ($item in Get-ChildItem -LiteralPath docs/deliverables/G5 -Filter *.docx) {
    $doc=$taskWord.Documents.Open($item.FullName,$false,$false)
    try {
      $doc.Repaginate()
      foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
      $doc.Fields.Update() | Out-Null
      $doc.Repaginate()
      foreach ($toc in $doc.TablesOfContents) { $toc.UpdatePageNumbers() }
      $doc.Save()
      Write-Output ($item.Name+': TOC='+$doc.TablesOfContents.Count+'; pages='+$doc.ComputeStatistics(2))
    } finally { $doc.Close(0) }
  }
} finally { $taskWord.Quit() }
