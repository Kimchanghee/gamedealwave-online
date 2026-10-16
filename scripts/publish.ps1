# Local-only publisher. No default publication, account calls, deploy or IndexNow path.
param([string]$Slug, [switch]$DryRun, [switch]$Fixture)
$ErrorActionPreference = 'Stop'
if (-not $DryRun) { Write-Error 'Fail closed: production publishing disabled pending account and production proof. Use -DryRun.'; exit 1 }
if ($Fixture -and $Slug) { Write-Error 'Choose Fixture OR Slug'; exit 1 }
if ($Fixture) { node "$PSScriptRoot/isolated-dryrun.mjs" --fixture }
elseif ($Slug) { node "$PSScriptRoot/isolated-dryrun.mjs" --slug $Slug }
else { Write-Error 'Provide a real Slug or explicit Fixture'; exit 1 }
exit $LASTEXITCODE
