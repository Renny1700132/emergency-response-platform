param(
    [string]$Document = "docs/deliverables/14-接口设计说明书.docx"
)

$ErrorActionPreference = 'Stop'
$path = (Resolve-Path -LiteralPath $Document).Path
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($path, $false, $false)
    try {
        foreach ($toc in $doc.TablesOfContents) {
            $toc.Update()
        }
        foreach ($story in $doc.StoryRanges) {
            $range = $story
            while ($null -ne $range) {
                $range.Fields.Update() | Out-Null
                $range = $range.NextStoryRange
            }
        }
        $doc.Repaginate()
        $doc.Save()
        Write-Output ("UPDATED=" + $path)
        Write-Output ("PAGES=" + $doc.ComputeStatistics(2))
    } finally {
        $doc.Close(0)
    }
} finally {
    $word.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
