param(
    [Parameter(Mandatory=$true)][string]$Current,
    [Parameter(Mandatory=$true)][string]$Reference,
    [Parameter(Mandatory=$true)][string]$OutDir
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function SafeText([object]$range) {
    if ($null -eq $range) { return '' }
    return (($range.Text -replace '[\r\a]', ' ') -replace '\s+', ' ').Trim()
}

function FontInfo([object]$font) {
    return [ordered]@{
        name = [string]$font.Name
        name_far_east = [string]$font.NameFarEast
        size_pt = [double]$font.Size
        bold = [int]$font.Bold
        italic = [int]$font.Italic
        color = [int]$font.Color
        spacing_pt = [double]$font.Spacing
    }
}

function ParaInfo([object]$pf) {
    return [ordered]@{
        alignment = [int]$pf.Alignment
        left_indent_pt = [double]$pf.LeftIndent
        right_indent_pt = [double]$pf.RightIndent
        first_line_indent_pt = [double]$pf.FirstLineIndent
        line_spacing_rule = [int]$pf.LineSpacingRule
        line_spacing_pt = [double]$pf.LineSpacing
        space_before_pt = [double]$pf.SpaceBefore
        space_after_pt = [double]$pf.SpaceAfter
        keep_with_next = [int]$pf.KeepWithNext
        keep_together = [int]$pf.KeepTogether
        widow_control = [int]$pf.WidowControl
        page_break_before = [int]$pf.PageBreakBefore
    }
}

function InspectDoc([object]$word, [string]$path, [string]$pdfPath) {
    $resolved = (Resolve-Path -LiteralPath $path).Path
    $doc = $word.Documents.Open($resolved, $false, $true)
    try {
        $doc.Repaginate()
        $sections = @()
        for ($i=1; $i -le $doc.Sections.Count; $i++) {
            $s = $doc.Sections.Item($i)
            $ps = $s.PageSetup
            $headers = @()
            $footers = @()
            for ($j=1; $j -le 3; $j++) {
                try { $headers += [ordered]@{index=$j; exists=[bool]$s.Headers.Item($j).Exists; linked=[bool]$s.Headers.Item($j).LinkToPrevious; text=(SafeText $s.Headers.Item($j).Range)} } catch {}
                try { $footers += [ordered]@{index=$j; exists=[bool]$s.Footers.Item($j).Exists; linked=[bool]$s.Footers.Item($j).LinkToPrevious; text=(SafeText $s.Footers.Item($j).Range)} } catch {}
            }
            $sections += [ordered]@{
                index=$i; orientation=[int]$ps.Orientation; width_pt=[double]$ps.PageWidth; height_pt=[double]$ps.PageHeight
                margin_top_pt=[double]$ps.TopMargin; margin_bottom_pt=[double]$ps.BottomMargin
                margin_left_pt=[double]$ps.LeftMargin; margin_right_pt=[double]$ps.RightMargin
                header_distance_pt=[double]$ps.HeaderDistance; footer_distance_pt=[double]$ps.FooterDistance
                different_first_page=[bool]$ps.DifferentFirstPageHeaderFooter
                section_start=[int]$ps.SectionStart; headers=$headers; footers=$footers
            }
        }

        $styles = [ordered]@{}
        $styleEnums = [ordered]@{Title=-63; Heading1=-2; Heading2=-3; Heading3=-4; Normal=-1; Caption=-35}
        foreach ($key in $styleEnums.Keys) {
            try {
                $st = $doc.Styles.Item($styleEnums[$key])
                $styles[$key] = [ordered]@{name_local=[string]$st.NameLocal; font=(FontInfo $st.Font); paragraph=(ParaInfo $st.ParagraphFormat)}
            } catch { $styles[$key] = $null }
        }

        $paras = @()
        $limit = [Math]::Min(80, $doc.Paragraphs.Count)
        for ($i=1; $i -le $limit; $i++) {
            $p = $doc.Paragraphs.Item($i)
            $txt = SafeText $p.Range
            if ($txt) {
                $paras += [ordered]@{index=$i; page=[int]$p.Range.Information(3); style=[string]$p.Range.Style.NameLocal; text=$txt; font=(FontInfo $p.Range.Font); paragraph=(ParaInfo $p.Format)}
            }
        }

        $tables = @()
        for ($i=1; $i -le $doc.Tables.Count; $i++) {
            $t = $doc.Tables.Item($i)
            $cols = @(); for ($c=1; $c -le $t.Columns.Count; $c++) { try { $cols += [double]$t.Columns.Item($c).Width } catch { $cols += $null } }
            $head = @(); if ($t.Rows.Count -gt 0) { for($c=1;$c -le $t.Columns.Count;$c++){ try{$head += (SafeText $t.Cell(1,$c).Range)}catch{$head += ''} } }
            $tables += [ordered]@{index=$i; page=[int]$t.Range.Information(3); rows=[int]$t.Rows.Count; cols=[int]$t.Columns.Count; width_pt=[double]$t.PreferredWidth; preferred_width_type=[int]$t.PreferredWidthType; column_widths_pt=$cols; heading_format=[int]$t.Rows.Item(1).HeadingFormat; allow_autofit=[bool]$t.AllowAutoFit; header_text=$head; style=[string]$t.Style}
        }

        $figures = @()
        for ($i=1; $i -le $doc.InlineShapes.Count; $i++) {
            $x=$doc.InlineShapes.Item($i); $figures += [ordered]@{kind='inline';index=$i;page=[int]$x.Range.Information(3);width_pt=[double]$x.Width;height_pt=[double]$x.Height;alt=[string]$x.AlternativeText}
        }
        for ($i=1; $i -le $doc.Shapes.Count; $i++) {
            $x=$doc.Shapes.Item($i); $figures += [ordered]@{kind='floating';index=$i;page=[int]$x.Anchor.Information(3);width_pt=[double]$x.Width;height_pt=[double]$x.Height;alt=[string]$x.AlternativeText}
        }

        $doc.ExportAsFixedFormat($pdfPath, 17)
        return [ordered]@{
            path=$resolved; sha256=(Get-FileHash -LiteralPath $resolved -Algorithm SHA256).Hash
            pages=[int]$doc.ComputeStatistics(2); sections=[int]$doc.Sections.Count; paragraphs=[int]$doc.Paragraphs.Count
            tables=[int]$doc.Tables.Count; inline_shapes=[int]$doc.InlineShapes.Count; floating_shapes=[int]$doc.Shapes.Count
            section_details=$sections; style_details=$styles; front_matter_paragraphs=$paras; table_details=$tables; figure_details=$figures
        }
    } finally { $doc.Close(0) }
}

$word = New-Object -ComObject Kwps.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $result = [ordered]@{
        generated_at=(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
        current=(InspectDoc $word $Current (Join-Path $OutDir 'current.pdf'))
        reference=(InspectDoc $word $Reference (Join-Path $OutDir 'reference.pdf'))
    }
    $result | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $OutDir 'audit.json') -Encoding UTF8
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
