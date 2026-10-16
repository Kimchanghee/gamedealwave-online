// pnpm refresh — this site has no live price feed (Amazon prices need PA-API, which is not connected).
// What it refreshes: a reachability snapshot of every official source cited by guides/posts,
// written to src/data/source-check.json { asOf, source, sourceUrl, results[] }.
// A source that fails keeps its last good result (with its real checkedAt); nothing is invented.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../src/site.config.ts';
import { splitMd } from './gate-lib.mjs';

const ROOT = process.cwd();
const outPath = join(ROOT, 'src/data/source-check.json');
const prev = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : { results: [] };
const prevBy = new Map(prev.results.map((r) => [r.url, r]));
const urls = new Map();
for (const d of ['src/content/guides', 'src/content/posts']) {
  const dir = join(ROOT, d);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    const { fm } = splitMd(readFileSync(join(dir, f), 'utf8'));
    for (const s of fm.sources ?? []) urls.set(s.url, [...(urls.get(s.url) ?? []), fm.slug]);
  }
}
const UA = `${site.name}-source-check/1.0 (+${site.url}; ${site.contactEmail})`;
async function check(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'User-Agent': UA } });
    return { status: r.status, finalUrl: r.url };
  } catch (e) { return { status: 0, error: String(e.name ?? e) }; } finally { clearTimeout(t); }
}
const results = [];
let okCount = 0;
for (const [url, usedBy] of urls) {
  const r = await check(url);
  const now = new Date().toISOString();
  if (r.status >= 200 && r.status < 400) { okCount++; results.push({ url, usedBy, status: r.status, finalUrl: r.finalUrl, checkedAt: now }); }
  else {
    const last = prevBy.get(url);
    results.push({ url, usedBy, status: r.status, error: r.error, checkedAt: now, lastGood: last?.status >= 200 && last?.status < 400 ? { status: last.status, checkedAt: last.checkedAt } : last?.lastGood ?? null });
  }
  await new Promise((res) => setTimeout(res, 300));
}
if (urls.size && okCount === 0 && prev.results.length) {
  console.error('refresh: every source failed (network down?) — keeping last snapshot', prev.asOf);
  process.exit(0);
}
mkdirSync(join(ROOT, 'src/data'), { recursive: true });
writeFileSync(outPath, JSON.stringify({ asOf: new Date().toISOString(), source: 'HTTP reachability of cited official sources', sourceUrl: site.url + '/methodology/', results }, null, 2) + '\n');
console.log(`refresh: ${okCount}/${urls.size} sources reachable; non-2xx/3xx are listed for manual review (some sites block scripted requests).`);
