# crawler-check.ps1 -Base http://127.0.0.1:4332 [-Paths '/','/guides/x/'] -> crawler-eye evidence (curl, no JS)
param([string]$Base = 'http://127.0.0.1:4331', [string]$Paths = '/,/guides/,/picks/', [string]$Out = 'seo/after-curl.txt')
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path -Parent $PSScriptRoot)
$lines = @("# AFTER evidence: curl (no JS) against $Base, captured $(Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz')", '')
foreach ($p in @('/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml', '/llms.txt', '/rss.xml', '/ads.txt', '/no-such-page-x/')) {
  $lines += "GET $p -> " + (curl.exe -s -o NUL -w '%{http_code} %{content_type}' "$Base$p")
}
$lines += '', '## robots.txt'; $lines += (curl.exe -s "$Base/robots.txt")
$lines += '', '## sitemap-index.xml'; $lines += (curl.exe -s "$Base/sitemap-index.xml")
$locs = ([regex]::Matches((curl.exe -s "$Base/sitemap-0.xml") -join '', '<loc>(.*?)</loc>')).Count
$last = ([regex]::Matches((curl.exe -s "$Base/sitemap-0.xml") -join '', '<lastmod>(.*?)</lastmod>') | % { $_.Groups[1].Value } | Sort-Object | Select-Object -Last 1)
$lines += "sitemap-0.xml: $locs URLs, newest lastmod $last"
$lines += '', '## llms.txt (first 8 lines)'; $lines += (curl.exe -s "$Base/llms.txt" | Select-Object -First 8)
foreach ($p in ($Paths -split ',')) {
  $html = (curl.exe -s "$Base$p") -join "`n"
  $code = curl.exe -s -o NUL -w '%{http_code}' "$Base$p"
  $t = [regex]::Match($html, '<title>(.*?)</title>').Groups[1].Value
  $d = [regex]::Match($html, '<meta name="description" content="([^"]*)"').Groups[1].Value
  $c = [regex]::Match($html, '<link rel="canonical" href="([^"]*)"').Groups[1].Value
  $r = [regex]::Match($html, '<meta name="robots" content="([^"]*)"').Groups[1].Value
  $h1 = ([regex]::Matches($html, '<h1')).Count
  $ld = [regex]::Matches($html, '<script type="application/ld\+json">(.*?)</script>', 'Singleline') | % {
    try { $j = $_.Groups[1].Value | ConvertFrom-Json; (@($j.'@graph') | % { $_.'@type' }) -join ',' } catch { 'INVALID-JSON' } }
  $words = ([regex]::Matches(([regex]::Replace(([regex]::Match($html, '<main.*?</main>', 'Singleline').Value), '<[^>]+>', ' ')), "[A-Za-z0-9']+")).Count
  $lines += '', "## $p  [$code]", "title ($($t.Length)): $t", "description ($($d.Length)): $d", "canonical: $c", "robots: $r", "h1 count: $h1 · main words (server HTML): $words", "JSON-LD @types: $ld"
  $lines += "og:image: " + [regex]::Match($html, '<meta property="og:image" content="([^"]*)"').Groups[1].Value
  $lines += "adsense meta: " + ($html -match 'google-adsense-account') + " · adsbygoogle script: " + ($html -match 'adsbygoogle.js\?client=ca-pub-4490818204529253')
}
$lines | Set-Content $Out
Write-Host "wrote $Out"
