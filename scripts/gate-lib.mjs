// Shared publish-gate logic: CONTRACT §4 page gate + SHOPPING commerce gate.
// Source-level checks (frontmatter/body) are pure so gate-examples.mjs can prove pass/fail without a build.
import { readFileSync, existsSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

export const BANNED = [
  /\bI tested\b/i, /\bwe tested\b/i, /\bin my experience\b/i, /\bin our testing\b/i, /\bI(?:'ve| have) (?:used|owned|been using)\b/i,
  /\bhands-on\b/i, /\bmy (?:own )?(?:unit|copy|review unit)\b/i, /\bour (?:review|test) unit\b/i, /\b\d(?:\.\d)?\s*(?:\/|out of)\s*(?:5|10)\s*stars?\b/i,
  /★/, /\b(?:customer|buyer) reviews? say\b/i, /직접 써보니/, /제가 사용해보니/,
];
export const PLACEHOLDER = [/lorem ipsum/i, /\bTODO\b/, /\bTBD\b/, /\bXXX\b/, /\[placeholder\]/i, /\{\{.*?\}\}/, /REPLACE_ME/i];
const PRICE = /(?:\$|USD\s?)\d|\b\d+(?:\.\d\d)?\s?(?:dollars|USD)\b|\bin stock\b|\bout of stock\b|\bonly \d+ left\b/i;

export function splitMd(raw) {
  const parts = raw.split(/^---\s*$/m);
  return { fm: parseYaml(parts[1] ?? '') ?? {}, body: parts.slice(2).join('---') };
}
export function words(text) {
  return (String(text).replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, ' ').replace(/[#>*_`\[\]()|-]/g, ' ').match(/[A-Za-z0-9'’]+/g) ?? []).length;
}
const len = (s) => [...String(s ?? '')].length;

/** Commerce checks on a post source. ctx: { siteDomain, allowlist, log: [{slug, productUrl, publishedAt}], now, otherPosts: [{slug, productUrl}], publicDir } */
export function checkPostSource(fm, body, ctx) {
  const e = [];
  const req = ['title', 'slug', 'question', 'answer', 'published', 'updated', 'category', 'primaryKeyword', 'product', 'images', 'sources'];
  for (const k of req) if (fm[k] === undefined || fm[k] === '' || fm[k] === null) e.push(`missing frontmatter: ${k}`);
  if (e.length) return e;
  const t = fm.seoTitle ?? fm.title;
  if (len(t) < 50 || len(t) > 60) e.push(`title length ${len(t)} not in 50-60: "${t}"`);
  if (fm.description && (len(fm.description) < 150 || len(fm.description) > 160)) e.push(`description length ${len(fm.description)} not in 150-160`);
  for (const k of ['published', 'updated']) if (!/T.*(Z|[+-]\d{2}:\d{2})$/.test(String(fm[k]))) e.push(`${k} must be ISO with explicit offset`);
  const aw = words(fm.answer);
  if (aw < 20 || aw > 70) e.push(`answer should be a direct ~40-word answer (got ${aw} words)`);
  // product
  const p = fm.product;
  for (const k of ['name', 'optionDetail', 'provider', 'url', 'landingHost', 'verifiedAt', 'evidence']) if (!p[k]) e.push(`product.${k} missing`);
  let host = '';
  try { host = new URL(p.url).hostname; } catch { e.push('product.url is not a valid URL'); }
  const allow = ctx.allowlist[p.provider] ?? [];
  if (host && !allow.includes(host)) e.push(`product host ${host} not on ${p.provider} allowlist`);
  if (p.landingHost && host && p.landingHost !== host && !(host === 'amzn.to' && allow.includes(p.landingHost))) e.push(`landingHost ${p.landingHost} != url host ${host}`);
  if (p.provider === 'amazon' && host && host !== 'amzn.to' && !/\/(?:dp|gp\/product)\/[A-Z0-9]{10}/.test(new URL(p.url).pathname)) e.push('amazon url must be an exact product page (/dp/ASIN)');
  if (p.evidence && ctx.rootDir && !existsSync(`${ctx.rootDir}/${p.evidence}`)) e.push(`product.evidence file not found: ${p.evidence}`);
  // in-text product links must equal product.url (rehype then rewrites all of them identically)
  const mdLinks = [...body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  for (const l of mdLinks) {
    try { const h = new URL(l).hostname; if (allow.includes(h) && l !== p.url) e.push(`in-text product link differs from product.url: ${l}`); } catch {}
  }
  // images
  const imgs = fm.images ?? [];
  if (!imgs.some((i) => i.role === 'cover')) e.push('needs at least one cover image');
  for (const i of imgs) {
    if (!i.src || !i.alt || len(i.alt) < 8) e.push(`image missing src/alt: ${i.src}`);
    if (!['cover', 'context', 'detail', 'comparison', 'use'].includes(i.role)) e.push(`image role invalid: ${i.role}`);
    if (!['generated', 'provider-api', 'own'].includes(i.rights)) e.push(`image rights invalid: ${i.rights}`);
    if (p.provider === 'amazon' && i.rights !== 'provider-api' && /amazon|media-amazon|ssl-images-amazon/i.test(i.src)) e.push('Amazon product images only via SiteStripe/API (rights provider-api)');
    if (ctx.publicDir && i.src?.startsWith('/') && !existsSync(`${ctx.publicDir}${i.src}`)) e.push(`image file not found: public${i.src}`);
  }
  // body
  const bw = words(body);
  if (bw < 700) e.push(`body ${bw} words < 700`);
  const qh2 = (body.match(/^##\s+.+\?\s*$/gm) ?? []).length;
  if (qh2 < 4) e.push(`needs >=4 question-shaped H2s (got ${qh2})`);
  const internal = (body.match(/\]\(\/[^)\s]*\)/g) ?? []).length;
  if (internal < 2) e.push(`needs >=2 internal links in body (got ${internal})`);
  const all = [fm.title, fm.answer, fm.description, body, ...(fm.faq ?? []).flatMap((f) => [f.q, f.a])].join('\n');
  for (const b of BANNED) if (b.test(all)) e.push(`banned first-hand/rating phrase: ${b}`);
  for (const b of PLACEHOLDER) if (b.test(all)) e.push(`placeholder text: ${b}`);
  if (p.provider === 'amazon' && PRICE.test(all)) e.push('Amazon posts must not show prices/availability');
  if (/\b(?:cheapest|lowest price|best price|on sale|discount(?:ed)?)\b/i.test(mdLinks.length ? body.match(/\[([^\]]+)\]\(https?:/g)?.join(' ') ?? '' : '')) e.push('link text must not imply price');
  if (!(fm.sources ?? []).length) e.push('sources required');
  // duplicates (last 30 days in publish log + other live posts)
  const now = ctx.now ?? Date.now();
  for (const r of ctx.log ?? []) {
    const age = (now - Date.parse(r.publishedAt)) / 864e5;
    if (r.slug !== fm.slug && age <= 30 && r.productUrl === p.url) e.push(`duplicate product URL within 30 days (log: ${r.slug})`);
  }
  for (const o of ctx.otherPosts ?? []) {
    if (o.slug === fm.slug) continue;
    if (o.productUrl === p.url) e.push(`duplicate product URL with post ${o.slug}`);
  }
  return e;
}

export function readLog(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => { const j = JSON.parse(l); return { slug: j.slug, productUrl: j['product.url'] ?? j.productUrl, publishedAt: j.publishedAt }; });
}
