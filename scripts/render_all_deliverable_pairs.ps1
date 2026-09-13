param([string]$OutputDir = ".tmp/final_rework/all_pairs")

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$out = [IO.Path]::GetFullPath((Join-Path $root $OutputDir))
[IO.Directory]::CreateDirectory($out) | Out-Null
$pairs = @(
    @('00','docs/deliverables/00-投标文件技术标.docx','docs/reference/00-澜图遥感影像智能解译平台-投标文件技术标（教学案例）.docx'),
    @('01','docs/deliverables/01-项目建议书.docx','docs/reference/01-项目建议书（教学样例）.docx'),
    @('02','docs/deliverables/02-澄清与质询记录.docx','docs/reference/02-澄清与质询记录（教学样例）.docx'),
    @('03','docs/deliverables/03-项目计划v1（WBS与甘特图）.docx','docs/reference/03-项目计划v1（WBS与甘特图·教学样例）.docx'),
    @('04','docs/deliverables/04-风险登记册v1.docx','docs/reference/04-风险登记册v1（教学样例）.docx'),
    @('05','docs/deliverables/05-需求确认书.docx','docs/reference/05-需求确认书（教学样例）.docx'),
    @('06','docs/deliverables/06-述标答辩讲稿与策略.docx','docs/reference/06-述标答辩讲稿与策略（教学样例）.docx')
)

$wps = New-Object -ComObject Kwps.Application
$wps.Visible = $false
$wps.DisplayAlerts = 0
try {
    foreach ($pair in $pairs) {
        $id=$pair[0]
        foreach ($kind in @('current','reference')) {
            $rel = if ($kind -eq 'current') { $pair[1] } else { $pair[2] }
            $src=[IO.Path]::GetFullPath((Join-Path $root $rel))
            $pdf=Join-Path $out "$id-$kind.pdf"
            $doc=$wps.Documents.Open($src,$false,$true)
            try {
                $doc.ExportAsFixedFormat($pdf,17)
                Write-Output "$id $kind $($doc.ComputeStatistics(2)) $pdf"
            } finally { $doc.Close(0) }
        }
    }
} finally {
    $wps.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($wps) | Out-Null
}
