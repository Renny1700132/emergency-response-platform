$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$path = (Get-ChildItem -LiteralPath (Join-Path $root 'docs\deliverables') -Filter '14-*.docx' | Select-Object -First 1).FullName
$wps = New-Object -ComObject Kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    $doc = $wps.Documents.Open($path, $false, $false)
    try {
        foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
        $doc.Fields.Update() | Out-Null
        $doc.Repaginate()
        $doc.Save()
    } finally { $doc.Close(0) }
} finally {
    $wps.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null
}
Write-Output $path
