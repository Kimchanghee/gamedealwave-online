# qa-staged.ps1 — end-to-end proof of the publish pipeline without publishing anything.
# Temporarily stages the marked pass example as a real post, runs publish.ps1 -DryRun with the Amazon tag
# OFF and ON (fake tag), saves evidence to qa/, then removes the staged files and rebuilds clean.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
New-Item -ItemType Directory -Force qa | Out-Null
$slug = (Select-String -Path src/content/posts/_examples/pass-example.md -Pattern '^slug:\s*(\S+)').Matches[0].Groups[1].Value
$stagedMd = 'src/content/posts/qa-staged-example.md'
$stagedImg = 'public/example-cover.svg'
$code = 0
try {
  Copy-Item src/content/posts/_examples/pass-example.md $stagedMd
  Copy-Item src/content/posts/_examples/assets/example-cover.svg $stagedImg
  foreach ($mode in 'off', 'on') {
    if ($mode -eq 'on') { $env:PUBLIC_AMAZON_TAG = 'qatest-20' } else { Remove-Item Env:PUBLIC_AMAZON_TAG -ErrorAction SilentlyContinue }
    pwsh -File scripts/publish.ps1 -Slug $slug -DryRun *> "qa/publish-dryrun-tag-$mode.txt"
    $c = $LASTEXITCODE
    Copy-Item "dist/picks/$slug/index.html" "qa/staged-pick-tag-$mode.html" -ErrorAction SilentlyContinue
    Write-Host "dry run (tag $mode): exit $c  -> qa/publish-dryrun-tag-$mode.txt"
    if ($c) { $code = 1 }
  }
} finally {
  Remove-Item Env:PUBLIC_AMAZON_TAG -ErrorAction SilentlyContinue
  Remove-Item $stagedMd, $stagedImg -ErrorAction SilentlyContinue
  pnpm build *> $null
}
if (Test-Path "dist/picks/$slug") { Write-Host 'staged example leaked into clean build' -ForegroundColor Red; exit 1 }
exit $code
