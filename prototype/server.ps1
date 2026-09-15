param([ValidateSet('start','stop','restart','status','')][string]$Action='')
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$pidFile=Join-Path $root '.prototype-server.pid'
$logFile=Join-Path $root '.prototype-server.log'
$web='http://127.0.0.1:5173/#/web/dashboard'
$h5='http://127.0.0.1:5173/#/h5/home'
function Get-PrototypeProcess {
  if(!(Test-Path $pidFile)){return $null}
  $pidValue=[int](Get-Content $pidFile -Raw)
  try { Get-Process -Id $pidValue -ErrorAction Stop } catch { Remove-Item -LiteralPath $pidFile -Force; return $null }
}
function Show-Status {
  $p=Get-PrototypeProcess
  if($p){Write-Host "正在运行（PID $($p.Id)）" -ForegroundColor Green;Write-Host "Web：$web";Write-Host "H5 ：$h5"}else{Write-Host '未运行' -ForegroundColor Yellow}
}
function Start-Prototype {
  if(Get-PrototypeProcess){Write-Host 'Prototype 已在运行，不重复启动。';Show-Status;return}
  if(!(Get-Command node -ErrorAction SilentlyContinue) -or !(Get-Command npm -ErrorAction SilentlyContinue)){throw '未检测到 Node.js 或 npm，请安装后重试。'}
  if(!(Test-Path (Join-Path $root 'node_modules'))){Write-Host '首次启动，正在安装依赖…';Push-Location $root;try{npm install}catch{throw '依赖安装失败，请检查网络或 npm 配置。'}finally{Pop-Location}}
  $vite=Join-Path $root 'node_modules/vite/bin/vite.js'
  if(!(Test-Path $vite)){throw '未找到 Vite 启动文件，请重新执行 npm install。'}
  $node=(Get-Command node).Source
  $p=Start-Process -FilePath $node -ArgumentList $vite,'--host','127.0.0.1' -WorkingDirectory $root -RedirectStandardOutput $logFile -PassThru -WindowStyle Hidden
  Set-Content -LiteralPath $pidFile -Value $p.Id -NoNewline
  Start-Sleep -Seconds 2
  Write-Host 'Prototype 已启动。' -ForegroundColor Green;Show-Status
}
function Stop-Prototype {
  $p=Get-PrototypeProcess
  if(!$p){Write-Host 'Prototype 未运行。';return}
  Stop-Process -Id $p.Id -ErrorAction Stop
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  Write-Host "已停止 Prototype 服务（PID $($p.Id)）。" -ForegroundColor Green
}
if(!$Action){Write-Host '1. 启动 Prototype';Write-Host '2. 停止 Prototype';Write-Host '3. 重启 Prototype';Write-Host '4. 查看状态';$choice=Read-Host '请选择';$Action=@{'1'='start';'2'='stop';'3'='restart';'4'='status'}[$choice];if(!$Action){throw '无效选择。'}}
try {
  switch($Action) {
    'start' { Start-Prototype }
    'stop' { Stop-Prototype }
    'restart' { Stop-Prototype; Start-Prototype }
    'status' { Show-Status }
  }
} catch { Write-Host "操作失败：$($_.Exception.Message)" -ForegroundColor Red; exit 1 }
