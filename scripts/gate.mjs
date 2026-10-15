// pnpm gate — fails (exit 1) unless every built page passes the CONTRACT §4 publish gate
// and every post passes the SHOPPING commerce gate. Run after `pnpm build`.
// Usage: node scripts/gate.mjs [--slug <post-slug>]   (--slug limits the commerce gate to one post; page gate always runs)
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'node-html-parser';
import { site, productHref, isAffiliateMode, AMAZON_STATEMENT } from '../src/site.config.ts';
import { checkPostSource, splitMd, readLog, PLACEHOLDER, words } from './gate-lib.mjs';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const onlySlug = process.argv.includes('--slug') ? process.argv[process.argv.indexOf('--slug') + 1] : null;
const fails = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);
if (!existsSync(DIST)) { console.error('gate: dist/ missing, run pnpm build first'); process.exit(1); }

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) walk(p, out); else if (f.endsWith('.html')) out.push(p); }
  return out;
}
const sitemapXml = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f)).map((f) => readFileSync(join(DIST, f), 'utf8')).join('');
const sitemapLocs = new Set([...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]));
if (!sitemapLocs.size) fail('sitemap', 'no sitemap locs found');
for (const f of ['robots.txt', 'ads.txt', 'llms.txt', 'rss.xml', 'sitemap-index.xml', `${site.indexNowKey}.txt`]) if (!existsSync(join(DIST, f))) fail('site', `missing /${f}`);
if (existsSync(join(DIST, 'ads.txt')) && !readFileSync(join(DIST, 'ads.txt'), 'utf8').includes('pub-4490818204529253')) fail('ads.txt', 'wrong publisher');
if (existsSync(join(DIST, 'robots.txt')) && /Disallow:\s*\/\s*$/m.test(readFileSync(join(DIST, 'robots.txt'), 'utf8'))) fail('robots.txt', 'blocks crawling');

const pages = walk(DIST);
let checked = 0;
for (const file of pages) {
  const rel = relative(DIST, file).split(sep).join('/');
  const is404 = rel === '404.html';
  const route = is404 ? '/404/' : '/' + rel.replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const doc = parse(html);
  const where = route;
  checked++;
  const title = doc.querySelector('title')?.text ?? '';
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if ([...title].length < 50 || [...title].length > 60) fail(where, `title length ${[...title].length} (50-60): ${title}`);
  if ([...desc].length < 150 || [...desc].length > 160) fail(where, `description length ${[...desc].length} (150-160)`);
  const canon = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canon !== `${site.url}${route}`) fail(where, `canonical ${canon} != ${site.url}${route}`);
  if (/noindex/i.test(doc.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '')) fail(where, 'noindex present');
  if (!doc.querySelector('meta[property="og:image"]')) fail(where, 'og:image missing');
  const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
  if (ogImg.startsWith(site.url) && !existsSync(join(DIST, ogImg.slice(site.url.length)))) fail(where, `og:image file missing ${ogImg}`);
  if (!doc.querySelector('meta[name="google-adsense-account"]')) fail(where, 'adsense meta missing');
  if (!is404 && !sitemapLocs.has(`${site.url}${route}`)) fail(where, 'not in sitemap');
  const main = doc.querySelector('main');
  const visible = (main?.text ?? '').replace(/\s+/g, ' ');
  for (const p of PLACEHOLDER) if (p.test(visible)) fail(where, `placeholder text ${p}`);
  const internal = (main?.querySelectorAll('a') ?? []).filter((a) => (a.getAttribute('href') ?? '').startsWith('/'));
  if (internal.length < 2) fail(where, `internal links in main: ${internal.length} (<2)`);
  // JSON-LD valid + matches visible
  const h1 = main?.querySelector('h1')?.text.trim() ?? '';
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    let j; try { j = JSON.parse(s.innerHTML); } catch { fail(where, 'invalid JSON-LD'); continue; }
    for (const n of j['@graph'] ?? [j]) {
      if (['Review', 'AggregateRating', 'Offer', 'Product'].includes(n['@type'])) fail(where, `forbidden LD type ${n['@type']}`);
      if (n['@type'] === 'Article' && n.headline !== h1) fail(where, `LD headline != h1 (${n.headline} / ${h1})`);
      if (n['@type'] === 'FAQPage') for (const q of n.mainEntity) {
        if (!visible.includes(q.name)) fail(where, `FAQ question not visible: ${q.name}`);
        if (!visible.includes(q.acceptedAnswer.text)) fail(where, `FAQ answer not visible: ${q.name}`);
      }
    }
  }
  const isGuide = route.startsWith('/guides/') && route !== '/guides/';
  const isPick = route.startsWith('/picks/') && route !== '/picks/';
  if (isGuide || isPick) {
    const ans = main.querySelector('[data-answer]');
    if (!ans) fail(where, 'direct answer block missing');
    else { const w = words(ans.text); if (w < 20 || w > 75) fail(where, `direct answer ${w} words`); }
    if (!main.querySelector('.sources li a')) fail(where, 'sources missing');
    const art = main.querySelector('article');
    if (art && words(art.text) < 700) fail(where, `article ${words(art.text)} words < 700`);
    const qh = art?.querySelectorAll('h2').filter((h) => h.text.trim().endsWith('?')).length ?? 0;
    if (qh < 4) fail(where, `question-shaped H2s ${qh} < 4`);
  }
  if (isPick && (!onlySlug || route === `/picks/${onlySlug}/`)) {
    const art = main.querySelector('article');
    const first = art?.childNodes.find((n) => n.nodeType === 1);
    if (!first || first.getAttribute('data-disclosure') === undefined) fail(where, 'disclosure is not the first block of the post');
    const links = doc.querySelectorAll('a[data-outbound], a.product-link');
    const hrefs = new Set(links.map((a) => a.getAttribute('href')));
    if (links.length < 3) fail(where, `expected rail/inline/end product links, found ${links.length}`);
    if (hrefs.size !== 1) fail(where, `product hrefs differ: ${[...hrefs].join(' | ')}`);
    for (const a of links) if (a.getAttribute('rel') !== 'sponsored nofollow noopener') fail(where, `rel="${a.getAttribute('rel')}" on product link`);
    const href = [...hrefs][0] ?? '';
    if (isAffiliateMode()) {
      if (!href.includes(`tag=${site.amazonTag}`)) fail(where, 'affiliate mode on but product link has no tag');
      if (!doc.querySelector('footer')?.text.includes(AMAZON_STATEMENT)) fail(where, 'Amazon statement missing in footer');
      if (!(art?.text ?? '').includes(AMAZON_STATEMENT)) fail(where, 'Amazon statement missing near links');
    } else if (/[?&]tag=/.test(href)) fail(where, 'tag present while amazonTag is empty');
    for (const img of art?.querySelectorAll('img') ?? []) {
      const src = img.getAttribute('src') ?? '';
      if (!img.getAttribute('alt')) fail(where, `img without alt ${src}`);
      if (src.startsWith('/') && !existsSync(join(DIST, src))) fail(where, `img file missing ${src}`);
    }
  }
}

// commerce gate on sources (posts); _examples excluded here (see gate-examples.mjs)
const postDir = join(ROOT, 'src/content/posts');
const posts = existsSync(postDir) ? readdirSync(postDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => ({ f, ...splitMd(readFileSync(join(postDir, f), 'utf8')) })) : [];
const log = readLog(join(ROOT, 'ops/publish-log.jsonl'));
for (const p of posts) {
  if (onlySlug && p.fm.slug !== onlySlug) continue;
  const errs = checkPostSource(p.fm, p.body, {
    allowlist: site.providerAllowlist, log, otherPosts: posts.map((o) => ({ slug: o.fm.slug, productUrl: o.fm.product?.url })),
    publicDir: join(ROOT, 'public'), rootDir: ROOT,
  });
  for (const e of errs) fail(`post ${p.f}`, e);
  if (!existsSync(join(DIST, 'picks', String(p.fm.slug), 'index.html'))) fail(`post ${p.f}`, 'not built');
  else {
    const built = readFileSync(join(DIST, 'picks', String(p.fm.slug), 'index.html'), 'utf8');
    if (!built.includes(productHref(p.fm.product.url).replace(/&/g, '&amp;'))) fail(`post ${p.f}`, 'built page lacks exact product href');
  }
}
if (onlySlug && !posts.some((p) => p.fm.slug === onlySlug)) fail('gate', `no post with slug ${onlySlug}`);

if (fails.length) {
  console.error(`GATE FAIL (${fails.length})`);
  for (const f of fails) console.error(' - ' + f);
  process.exit(1);
}
console.log(`GATE PASS: ${checked} pages, ${posts.length} posts, affiliate mode ${isAffiliateMode() ? 'ON' : 'OFF'}`);
