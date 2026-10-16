# refresh-build.ps1 — refresh (source-link check snapshot) -> build -> gate. Non-zero exit on failure.
# The parent schedules this and deploys; this script never deploys.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
pnpm refresh; if ($LASTEXITCODE) { Write-Host 'refresh failed' -ForegroundColor Red; exit 1 }
pnpm build;   if ($LASTEXITCODE) { Write-Host 'build failed' -ForegroundColor Red; exit 1 }
pnpm gate;    if ($LASTEXITCODE) { Write-Host 'gate failed' -ForegroundColor Red; exit 1 }
node scripts/gate-examples.mjs; if ($LASTEXITCODE) { Write-Host 'gate self-test failed' -ForegroundColor Red; exit 1 }
Write-Host 'refresh-build OK' -ForegroundColor Green
