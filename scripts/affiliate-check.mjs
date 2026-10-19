// Partner-layer contract: enabled programs need a real ID, disclosure and allowlisted hosts;
// product posts may only use enabled programs, allowlisted hosts and linkable categories.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function checkAffiliates(root = process.cwd()) {
  const e = [];
  const cfg = JSON.parse(readFileSync(join(root, 'src/data/affiliates.json'), 'utf8'));
  for (const [k, p] of Object.entries(cfg.programs)) {
    if (p.enabled && !/^[A-Za-z0-9._-]{3,}$/.test(p.id ?? '')) e.push(`program ${k} enabled without a real id`);
    if (p.enabled && !(p.disclosure ?? '').trim()) e.push(`program ${k} enabled without disclosure`);
    if (!Array.isArray(p.hosts) || !p.hosts.length) e.push(`program ${k} has no host allowlist`);
    if (!['query', 'issued'].includes(p.linkFormat?.type)) e.push(`program ${k} has no documented linkFormat`);
    if (p.linkFormat?.type === 'query' && !p.linkFormat.param) e.push(`program ${k} query format without param`);
    if (p.enabled && p.linkFormat?.type === 'issued' && !(p.trackingHosts ?? []).length) e.push(`program ${k} uses issued links but lists no trackingHosts`);
  }
  const dir = join(root, 'src/content/posts');
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => /^[^_].*\.mdx?$/.test(f))) {
      const t = readFileSync(join(dir, f), 'utf8');
      const prov = (t.match(/^\s*provider:\s*["']?([a-z]+)/m) || [])[1];
      const cat = (t.match(/^category:\s*["']?([a-z-]+)/m) || [])[1];
      const url = (t.match(/^\s*url:\s*["']?(https?:[^"'\s]+)/m) || [])[1];
      if (/AFFILIATE_URL_PENDING|\{\{/.test(t)) e.push(`${f}: placeholder link left in post`);
      if ((cfg.noLinkCategories ?? []).includes(cat)) e.push(`${f}: category ${cat} never carries affiliate links`);
      const p = cfg.programs[prov];
      if (!p) { e.push(`${f}: provider ${prov} not in affiliates.json`); continue; }
      if (!p.enabled) e.push(`${f}: provider ${prov} is disabled; product posts need an enabled program`);
      try { if (url && ![...p.hosts, ...(p.trackingHosts ?? [])].includes(new URL(url).hostname)) e.push(`${f}: product host not allowlisted for ${prov}`); } catch { e.push(`${f}: invalid product url`); }
    }
  }
  return e;
}

if (process.argv[1] && process.argv[1].endsWith('affiliate-check.mjs')) {
  const e = checkAffiliates();
  if (e.length) { console.error('affiliate-check FAIL\n' + e.join('\n')); process.exit(1); }
  console.log('affiliate-check: PASS');
}
