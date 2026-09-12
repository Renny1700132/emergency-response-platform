param(
    [string]$DocxPath = "docs\\deliverables\\00-投标文件技术标.docx",
    [string]$PdfPath = ".tmp\\g1-08-final-render\\technical-bid-final.pdf"
)
$ErrorActionPreference = "Stop"
$docx = [IO.Path]::GetFullPath((Join-Path (Get-Location) $DocxPath))
$pdf = [IO.Path]::GetFullPath((Join-Path (Get-Location) $PdfPath))
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($pdf)) | Out-Null
$wps = New-Object -ComObject Kwps.Application
try {
    $wps.Visible = $false
    $doc = $wps.Documents.Open($docx, $false, $true)
    $doc.ExportAsFixedFormat($pdf, 17)
    $doc.Close(0)
    Write-Output "PDF_RENDERED=$pdf"
}
finally {
    $wps.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null
}
