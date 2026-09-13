$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$files = Get-ChildItem (Join-Path $root 'docs/deliverables') -Filter '*.docx' | Sort-Object Name
$wps = New-Object -ComObject Kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    foreach ($file in $files) {
        $doc = $wps.Documents.Open($file.FullName, $false, $false)
        try {
            try { $doc.Fields.Update() | Out-Null } catch {}
            try {
                foreach ($toc in $doc.TablesOfContents) { $toc.Update() | Out-Null }
            } catch {}
            $doc.Save()
            Write-Output "NORMALIZED=$($file.Name) PAGES=$($doc.ComputeStatistics(2))"
        } finally { $doc.Close(0) }
    }
} finally {
    $wps.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null
}
