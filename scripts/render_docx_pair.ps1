param(
    [Parameter(Mandatory=$true)][string]$Current,
    [Parameter(Mandatory=$true)][string]$Reference,
    [Parameter(Mandatory=$true)][string]$OutDir
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$wps = New-Object -ComObject Kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    foreach ($item in @(
        @{Kind='current'; Path=$Current},
        @{Kind='reference'; Path=$Reference}
    )) {
        $source = (Resolve-Path -LiteralPath $item.Path).Path
        $pdf = [IO.Path]::GetFullPath((Join-Path $OutDir ($item.Kind + '.pdf')))
        $doc = $wps.Documents.Open($source, $false, $true)
        try {
            $doc.Repaginate()
            $pages = $doc.ComputeStatistics(2)
            $doc.ExportAsFixedFormat($pdf, 17)
            Write-Output ($item.Kind + ': pages=' + $pages + '; pdf=' + $pdf)
        } finally {
            $doc.Close(0)
        }
    }
} finally {
    $wps.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null
}
