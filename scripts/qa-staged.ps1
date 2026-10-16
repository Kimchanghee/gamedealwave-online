# Explicit fixture opt-in; never stages in this repository or rebuilds real dist.
param([switch]$Fixture)
$ErrorActionPreference = 'Stop'
if (-not $Fixture) { Write-Error 'Fail closed: use -Fixture for isolated local examples only'; exit 1 }
node "$PSScriptRoot/isolated-dryrun.mjs" --fixture
exit $LASTEXITCODE
