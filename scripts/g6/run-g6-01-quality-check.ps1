$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$evidence = Join-Path $root 'evidence/g6/G6-01'
$raw = Join-Path $evidence 'raw'
New-Item -ItemType Directory -Force -Path $raw | Out-Null
$started = Get-Date
$log = Join-Path $raw 'npm-quality.log'
Push-Location $root
try {
  & cmd.exe /d /c "npm run quality > `"$log`" 2>&1"
  $exitCode = $LASTEXITCODE
  Get-Content -LiteralPath $log
} finally {
  Pop-Location
}
$finished = Get-Date
$result = [ordered]@{
  schemaVersion = 1
  taskId = 'G6-01'
  releaseCommit = 'beb605f83e738a39dfe388ed4bc25b5b724eddcf'
  command = 'npm run quality'
  environment = [ordered]@{
    platform = [System.Environment]::OSVersion.VersionString
    node = (& node --version)
    npm = (& npm.cmd --version)
  }
  startedAt = $started.ToString('o')
  finishedAt = $finished.ToString('o')
  durationSeconds = [math]::Round(($finished - $started).TotalSeconds, 3)
  exitCode = $exitCode
  status = if ($exitCode -eq 0) { 'PASS' } else { 'FAIL' }
  rawLog = 'evidence/g6/G6-01/raw/npm-quality.log'
}
$result | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $evidence 'quality-check.json')
if ($exitCode -ne 0) { exit $exitCode }
