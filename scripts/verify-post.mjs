// Verifies a post page contains the exact title, disclosure and product href.
// Usage: node scripts/verify-post.mjs --slug <slug> --from dist|live   -> prints JSON, exit 1 on failure
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { site, productHref, disclosureFor } from '../src/site.config.ts';
import { splitMd } from './gate-lib.mjs';

const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null);
const slug = arg('--slug');
const from = arg('--from') ?? 'dist';
const ROOT = process.cwd();
const dir = join(ROOT, 'src/content/posts');
const file = existsSync(dir) ? readdirSync(dir).find((f) => f.endsWith('.md') && !f.startsWith('_') && splitMd(readFileSync(join(dir, f), 'utf8')).fm.slug === slug) : null;
if (!file) { console.log(JSON.stringify({ ok: false, error: `no post with slug ${slug}` })); process.exit(1); }
const { fm } = splitMd(readFileSync(join(dir, file), 'utf8'));
const url = `${site.url}/picks/${slug}/`;
const href = productHref(fm.product.url);
const disclosure = fm.disclosure ?? disclosureFor(fm.product.provider);
const title = fm.seoTitle ?? fm.title;
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

let status = 0, html = '';
if (from === 'live') {
  const r = await fetch(url, { headers: { 'User-Agent': `${site.name}-publish-verify (+${site.url})`, 'Cache-Control': 'no-cache' } });
  status = r.status; html = await r.text();
} else {
  const p = join(ROOT, 'dist', 'picks', slug, 'index.html');
  if (existsSync(p)) { status = 200; html = readFileSync(p, 'utf8'); } else status = 404;
}
const text = dec(html);
const checks = {
  status200: status === 200,
  title: dec(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '') === title,
  disclosure: text.includes(disclosure),
  productHref: text.includes(`href="${href}"`),
};
const ok = Object.values(checks).every(Boolean);
console.log(JSON.stringify({ ok, from, url, status, checks, slug, productUrl: fm.product.url, href, provider: fm.product.provider, file }));
process.exit(ok ? 0 : 1);
