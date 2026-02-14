# ============================================================
# Supabase backup script (Windows + PowerShell)
# ============================================================
# Uses PostgreSQL tools installed locally:
# - pg_dump.exe (schema/data)
# - pg_dumpall.exe (roles)
#
# Expected local install path:
#   C:\Program Files\PostgreSQL\18\bin
#
# Usage:
#   .\backup-supabase.ps1 -ConnectionString "postgresql://..."
#   .\backup-supabase.ps1   # reads DB_URL / SUPABASE_DB_URL / .env.local
# ============================================================

param(
  [string]$ConnectionString = "",
  [string]$PgBinDir = "C:\Program Files\PostgreSQL\18\bin",
  [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"

$pgDump = Join-Path $PgBinDir "pg_dump.exe"
$pgDumpAll = Join-Path $PgBinDir "pg_dumpall.exe"

if (-not (Test-Path $pgDump)) {
  Write-Host "ERROR: pg_dump.exe not found at: $pgDump" -ForegroundColor Red
  Write-Host "Install PostgreSQL tools (v18+) or pass -PgBinDir." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path $pgDumpAll)) {
  Write-Host "ERROR: pg_dumpall.exe not found at: $pgDumpAll" -ForegroundColor Red
  Write-Host "Install PostgreSQL tools (v18+) or pass -PgBinDir." -ForegroundColor Yellow
  exit 1
}

Write-Host "Using tools:" -ForegroundColor Cyan
& $pgDump --version
& $pgDumpAll --version

if (-not (Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

function Resolve-ConnectionString {
  param([string]$ArgConnectionString)

  if ($ArgConnectionString) { return $ArgConnectionString }
  if ($env:DB_URL) { return $env:DB_URL }
  if ($env:SUPABASE_DB_URL) { return $env:SUPABASE_DB_URL }

  if (Test-Path ".env.local") {
    $lines = Get-Content ".env.local"
    foreach ($line in $lines) {
      if ($line -match "^\s*DB_URL\s*=\s*(.+)$") { return $matches[1].Trim('"').Trim("'").Trim() }
      if ($line -match "^\s*SUPABASE_DB_URL\s*=\s*(.+)$") { return $matches[1].Trim('"').Trim("'").Trim() }
    }
  }

  return ""
}

$dbUrl = Resolve-ConnectionString -ArgConnectionString $ConnectionString
if (-not $dbUrl) {
  Write-Host "ERROR: no connection string found." -ForegroundColor Red
  Write-Host "Pass -ConnectionString or set DB_URL / SUPABASE_DB_URL." -ForegroundColor Yellow
  exit 1
}

if ($dbUrl -notmatch "^postgres(ql)?://") {
  Write-Host "ERROR: invalid connection string format." -ForegroundColor Red
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$schemaFile = Join-Path $BackupDir "schema_$timestamp.sql"
$dataFile = Join-Path $BackupDir "data_$timestamp.sql"
$rolesFile = Join-Path $BackupDir "roles_$timestamp.sql"

Write-Host ""
Write-Host "Starting backup..." -ForegroundColor Cyan
Write-Host "Output dir: $BackupDir" -ForegroundColor Gray

Write-Host ""
Write-Host "1/3 schema dump..." -ForegroundColor Yellow
& $pgDump `
  "--dbname=$dbUrl" `
  "--schema-only" `
  "--file=$schemaFile"

Write-Host "OK: $schemaFile" -ForegroundColor Green

Write-Host ""
Write-Host "2/3 data dump..." -ForegroundColor Yellow
& $pgDump `
  "--dbname=$dbUrl" `
  "--data-only" `
  "--file=$dataFile"

Write-Host "OK: $dataFile" -ForegroundColor Green

Write-Host ""
Write-Host "3/3 roles dump..." -ForegroundColor Yellow
try {
  & $pgDumpAll `
    "--dbname=$dbUrl" `
    "--roles-only" `
    "--file=$rolesFile"
  Write-Host "OK: $rolesFile" -ForegroundColor Green
} catch {
  Write-Host "WARN: roles dump failed (permissions may be restricted)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Backup finished." -ForegroundColor Green

