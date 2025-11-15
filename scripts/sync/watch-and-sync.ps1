$ErrorActionPreference = "Stop"
$root = Resolve-Path "." | Select-Object -ExpandProperty Path
$mainDir = Join-Path $root "main"
$logsDir = Join-Path $root (if ($env:SYNC_LOG_DIR) { $env:SYNC_LOG_DIR } else { "logs" })
$backupsDir = Join-Path $root (if ($env:SYNC_BACKUP_DIR) { $env:SYNC_BACKUP_DIR } else { "backups" })
$logFile = Join-Path $logsDir (if ($env:SYNC_LOG_FILE) { $env:SYNC_LOG_FILE } else { "sync.log" })
$branchPrefix = if ($env:SYNC_BRANCH_PREFIX) { $env:SYNC_BRANCH_PREFIX } else { "feature" }
$pullIntervalMs = if ($env:SYNC_PULL_INTERVAL_MS) { [int]$env:SYNC_PULL_INTERVAL_MS } else { 300000 }
$notify = if ($env:SYNC_NOTIFY) { $env:SYNC_NOTIFY -eq "true" } else { $true }

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
New-Item -ItemType Directory -Force -Path $backupsDir | Out-Null

function Write-Log($msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] $msg"
  Add-Content -LiteralPath $logFile -Value $line
  Write-Host $line
}

function Show-Notification($title, $message) {
  if (-not $notify) { return }
  try {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($message, $title) | Out-Null
  } catch {}
}

function Test-Network() {
  try { return (Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet) } catch { return $false }
}

function Ensure-ClaspConfig() {
  if (-not (Test-Path ".clasp.json")) {
    $sid = $env:CLASP_SCRIPT_ID
    if (-not $sid) { Write-Log "Missing CLASP_SCRIPT_ID. Run scripts/sync/init-clasp.ps1 or set env."; throw "No scriptId" }
    & "$root\scripts\sync\init-clasp.ps1" -ScriptId $sid -RootDir "main"
  }
}

function Validate-AppManifest() {
  $path = Join-Path $mainDir "appsscript.json"
  if (Test-Path $path) { Get-Content -LiteralPath $path -Raw | ConvertFrom-Json | Out-Null }
}

function Backup-ChangedFiles($changed) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $dest = Join-Path $backupsDir $stamp
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  foreach ($f in $changed) {
    $rel = Resolve-Path $f | Select-Object -ExpandProperty Path
    $relPath = $rel.Substring($root.Length).TrimStart("\\")
    $target = Join-Path $dest $relPath
    New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
    if (Test-Path $f) { Copy-Item -LiteralPath $f -Destination $target -Force }
  }
  Write-Log "Backup created at $dest"
}

function Git-EnsureRepo() {
  try { & git rev-parse --is-inside-work-tree | Out-Null; return $true } catch { return $false }
}

function Git-RemoteExists() {
  try { & git remote get-url origin | Out-Null; return $true } catch { return $false }
}

function Git-BranchAndPush($changed) {
  if (-not (Git-EnsureRepo)) { Write-Log "Not a git repo. Skipping git ops."; return }
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $branch = "$branchPrefix/$ts"
  try { & git checkout -b $branch | Out-Null } catch { & git checkout $branch | Out-Null }
  & git add -A | Out-Null
  $files = ($changed | ForEach-Object { Split-Path $_ -Leaf }) -join ", "
  & git commit -m "sync: $ts changed: $files" | Out-Null
  if (Git-RemoteExists) { & git push -u origin $branch --force | Out-Null } else { Write-Log "No git remote 'origin'. Skipping push." }
  Write-Log "Git operations completed on $branch"
}

function Clasp-Push() {
  Ensure-ClaspConfig
  if (-not (Test-Network)) { Write-Log "Network unavailable"; throw "Network" }
  try { & clasp push --force | Out-Null; Write-Log "clasp push --force completed" } catch { Write-Log "clasp push failed: $($_.Exception.Message)"; throw }
}

function Clasp-Pull() {
  try { & clasp pull | Out-Null; Write-Log "clasp pull completed" } catch { Write-Log "clasp pull failed: $($_.Exception.Message)" }
}

$debounce = @{}
function Invoke-Sync($paths) {
  try {
    Validate-AppManifest
    Backup-ChangedFiles $paths
    Clasp-Push
    Git-BranchAndPush $paths
    Write-Log "Synchronization successful"
  } catch {
    $msg = "Synchronization failed: $($_.Exception.Message)"
    Write-Log $msg
    Show-Notification "Sync failure" $msg
  }
}

$fsw = New-Object System.IO.FileSystemWatcher $mainDir
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.Filter = "*"

function Queue-Path($path) {
  if (-not $path) { return }
  $now = [DateTime]::UtcNow
  $debounce[$path] = $now
}

Register-ObjectEvent -InputObject $fsw -EventName Changed -Action { Queue-Path $Event.SourceEventArgs.FullPath } | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Created -Action { Queue-Path $Event.SourceEventArgs.FullPath } | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Deleted -Action { Queue-Path $Event.SourceEventArgs.FullPath } | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Renamed -Action { Queue-Path $Event.SourceEventArgs.FullPath } | Out-Null

$timer = New-Object System.Timers.Timer
$timer.Interval = 1000
$timer.AutoReset = $true
$timer.add_Elapsed({
  $threshold = [DateTime]::UtcNow.AddMilliseconds(-1500)
  $ready = $debounce.GetEnumerator() | Where-Object { $_.Value -lt $threshold } | Select-Object -ExpandProperty Key
  if ($ready -and $ready.Count -gt 0) {
    $paths = @($ready)
    foreach ($k in $ready) { $debounce.Remove($k) | Out-Null }
    Invoke-Sync $paths
  }
})
$timer.Start()

$pullTimer = New-Object System.Timers.Timer
$pullTimer.Interval = $pullIntervalMs
$pullTimer.AutoReset = $true
$pullTimer.add_Elapsed({ Clasp-Pull })
$pullTimer.Start()

Write-Log "Watcher started at $mainDir"
Write-Log "Auto-pull interval: $pullIntervalMs ms"
Write-Log "Press Ctrl+C to stop"
while ($true) { Start-Sleep -Milliseconds 500 }

