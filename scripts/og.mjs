// Build-time OG images (1200x630): a manila hang-tag on a kraft pegboard. SVG -> PNG via resvg.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { parse } from 'yaml';
import { site } from '../src/site.config.ts';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const words = String(text).split(/\s+/); const lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, 4);
}
function svg({ code, title, sub }) {
  const t = wrap(title, 26);
  const holes = [];
  for (let y = 20; y < 630; y += 40) for (let x = 20; x < 1200; x += 40) holes.push(`<circle cx="${x}" cy="${y}" r="3.2" fill="#c9bc9f"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#e6dfd0"/>${holes.join('')}
  <line x1="600" y1="0" x2="600" y2="70" stroke="#4a4539" stroke-width="4"/>
  <g transform="rotate(-2 600 340)">
    <path d="M250 70 H950 L1060 130 V590 H140 V130 Z" fill="#f3e3b5" stroke="#8c826c" stroke-width="3"/>
    <circle cx="600" cy="110" r="16" fill="#e6dfd0" stroke="#8c826c" stroke-width="3"/>
    <text x="190" y="190" font-family="Courier New, monospace" font-size="30" font-weight="700" fill="#b42a17">${esc(code)}</text>
    ${t.map((l, i) => `<text x="190" y="${270 + i * 70}" font-family="Arial Narrow, Arial, sans-serif" font-size="62" font-weight="800" fill="#1d1b17">${esc(l)}</text>`).join('')}
    <line x1="190" y1="540" x2="1010" y2="540" stroke="#8c826c" stroke-width="2" stroke-dasharray="10 8"/>
    <text x="190" y="575" font-family="Courier New, monospace" font-size="26" fill="#4a4539">${esc(sub)}</text>
  </g>
  <rect x="0" y="600" width="1200" height="30" fill="#1d1b17"/><rect x="0" y="596" width="1200" height="4" fill="#b42a17"/>
</svg>`;
}
function out(path, data) {
  mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true });
  const png = new Resvg(svg(data), { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true } }).render().asPng();
  writeFileSync(path, png);
}
out('public/og/home.png', { code: 'GAMEDEALWAVE · PRICE-TAG WALL', title: 'Check the tag before you take it to the register', sub: 'gamedealwave.online · buying checklists, no prices' });
let n = 1;
for (const c of site.categories) { out(`public/og/category/${c.slug}.png`, { code: `AISLE ${c.code} · ${c.name.toUpperCase()}`, title: c.seoTitle.split(':')[0], sub: 'gamedealwave.online · checklists, no prices' }); n++; }
const dir = 'src/content/guides';
if (existsSync(dir)) for (const f of readdirSync(dir)) {
  if (!f.endsWith('.md') || f.startsWith('_')) continue;
  const fm = parse(readFileSync(`${dir}/${f}`, 'utf8').split(/^---\s*$/m)[1]);
  out(`public/og/guides/${fm.slug}.png`, { code: `${String(fm.category).toUpperCase()} · CHECKLIST`, title: fm.title, sub: `gamedealwave.online · facts checked ${fm.data_asof}` });
  n++;
}
const pdir = 'src/content/posts';
if (existsSync(pdir)) for (const f of readdirSync(pdir)) {
  if (!f.endsWith('.md') || f.startsWith('_')) continue;
  const fm = parse(readFileSync(`${pdir}/${f}`, 'utf8').split(/^---\s*$/m)[1]);
  out(`public/og/picks/${fm.slug}.png`, { code: `${String(fm.category).toUpperCase()} · PICK`, title: fm.title, sub: `gamedealwave.online · link checked ${String(fm.product?.verifiedAt ?? '').slice(0, 10)}` });
  n++;
}
console.log(`og: wrote ${n} images`);
