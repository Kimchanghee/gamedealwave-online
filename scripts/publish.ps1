# publish.ps1 -Slug <slug> [-DryRun]
# gate -> build -> wrangler deploy -> live verify (200 + title + disclosure + exact product href)
# -> IndexNow ping -> append ops/publish-log.jsonl. Exits non-zero on any failure. Never re-publishes a logged slug.
# -DryRun: everything except deploy, live fetch, IndexNow and log append (verifies the built dist page instead).
param(
  [Parameter(Mandatory = $true)][string]$Slug,
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
function Fail($msg) { Write-Host "PUBLISH FAIL: $msg" -ForegroundColor Red; exit 1 }

$log = 'ops/publish-log.jsonl'
if (Test-Path $log) {
  foreach ($line in Get-Content $log) {
    if (-not $line.Trim()) { continue }
    if (($line | ConvertFrom-Json).slug -eq $Slug) { Fail "slug '$Slug' already in $log (no duplicate publish)" }
  }
}

Write-Host "[1/6] build"
pnpm build; if ($LASTEXITCODE) { Fail 'build failed' }
Write-Host "[2/6] gate (page gate + commerce gate for $Slug)"
node scripts/gate.mjs --slug $Slug; if ($LASTEXITCODE) { Fail 'gate failed' }

$buildSha = (git rev-parse HEAD).Trim()
if (git status --porcelain -- "src/content/posts") { $buildSha = "$buildSha+dirty" }

if ($DryRun) {
  Write-Host "[3/6] DRY RUN: skip wrangler deploy"
  Write-Host "[4/6] verify built page (dist)"
  $v = node scripts/verify-post.mjs --slug $Slug --from dist; $code = $LASTEXITCODE
  Write-Host $v
  if ($code) { Fail 'dist verification failed' }
  $j = $v | ConvertFrom-Json
  Write-Host "[5/6] DRY RUN: skip IndexNow ping for $($j.url)"
  $entry = [ordered]@{ slug = $Slug; url = $j.url; 'product.url' = $j.productUrl; provider = $j.provider; publishedAt = $null; liveVerifiedAt = $null; buildSha = $buildSha; dryRun = $true }
  Write-Host "[6/6] DRY RUN: would append -> $($entry | ConvertTo-Json -Compress)"
  exit 0
}

Write-Host "[3/6] wrangler deploy"
npx wrangler deploy; if ($LASTEXITCODE) { Fail 'wrangler deploy failed' }
$publishedAt = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')

Write-Host "[4/6] live verify"
$v = $null; $code = 1
for ($i = 0; $i -lt 6 -and $code; $i++) {
  if ($i) { Start-Sleep -Seconds 10 }
  $v = node scripts/verify-post.mjs --slug $Slug --from live; $code = $LASTEXITCODE
}
Write-Host $v
if ($code) { Fail 'live verification failed (deployed, NOT logged; fix and re-run)' }
$j = $v | ConvertFrom-Json
$liveVerifiedAt = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')

Write-Host "[5/6] IndexNow ping"
$key = node -e "import('./src/site.config.ts').then(m=>process.stdout.write(m.site.indexNowKey))"
$domain = ([uri]$j.url).Host
$body = @{ host = $domain; key = $key; keyLocation = "https://$domain/$key.txt"; urlList = @($j.url, "https://$domain/picks/", "https://$domain/") } | ConvertTo-Json
try {
  $r = Invoke-WebRequest -Method Post -Uri 'https://api.indexnow.org/indexnow' -ContentType 'application/json; charset=utf-8' -Body $body -SkipHttpErrorCheck
  if ($r.StatusCode -notin 200, 202) { Fail "IndexNow returned $($r.StatusCode) (page is live; log not written)" }
} catch { Fail "IndexNow error: $_" }

Write-Host "[6/6] append $log"
$entry = [ordered]@{ slug = $Slug; url = $j.url; 'product.url' = $j.productUrl; provider = $j.provider; publishedAt = $publishedAt; liveVerifiedAt = $liveVerifiedAt; buildSha = $buildSha }
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
Add-Content -Path $log -Value ($entry | ConvertTo-Json -Compress) -Encoding utf8
Write-Host "PUBLISHED $($j.url)" -ForegroundColor Green
