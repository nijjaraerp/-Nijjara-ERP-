$ErrorActionPreference = "Stop"
param(
  [string]$ScriptId = $env:CLASP_SCRIPT_ID,
  [string]$RootDir = "main"
)
if (-not $ScriptId -or $ScriptId.Trim().Length -eq 0) { Write-Error "CLASP_SCRIPT_ID not set. Provide -ScriptId or set environment variable." }
$config = @{ scriptId = $ScriptId; rootDir = $RootDir } | ConvertTo-Json -Compress
Set-Content -LiteralPath ".clasp.json" -Value $config -Encoding UTF8
Set-Content -LiteralPath ".claspignore" -Value "node_modules/`n*.log`nlogs/`nbackups/`nsrc/" -Encoding UTF8
Write-Host ".clasp.json and .claspignore created with scriptId=$ScriptId rootDir=$RootDir"

