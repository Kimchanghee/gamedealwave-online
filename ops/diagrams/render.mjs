// Own informational diagrams: mobile-first 1080x1350 portrait PNGs rendered with Edge (Playwright).
// Usage: node ops/diagrams/render.mjs <spec.json> <outDir>
// spec: { images: [{ file, kind: 'columns'|'flow'|'table'|'steps', kicker, title, foot, ... }] }
// Fails (exit 1) if any text would render under 12px on a 390px-wide display (source font < 34px),
// if anything overflows horizontally, or if content runs into the footer / past the canvas.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../../_qa-tools/node_modules/playwright');

const W = 1080, H = 1350, DISPLAY = 390, MIN_DISPLAY_PX = 12;
const MIN_SRC_PX = Math.ceil((MIN_DISPLAY_PX * W) / DISPLAY); // 34
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const css = `*{box-sizing:border-box;margin:0;padding:0}html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:#f4f1ea;color:#241f20;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;padding:56px 60px 48px;display:flex;flex-direction:column;border-top:16px solid #1f4e79}
.k{font-size:34px;font-weight:700;color:#1f4e79;line-height:1.3;word-break:keep-all}
h1{font-size:58px;line-height:1.2;margin:12px 0 28px;letter-spacing:-.02em;word-break:keep-all}
.main{display:flex;flex-direction:column;gap:18px}.main.tbl{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.box{background:#e8e3d6;border:3px solid #241f20;padding:24px 30px}.box.ac{background:#fff;border:5px solid #1f4e79}
.box h2{font-size:44px;line-height:1.25;margin-bottom:12px;word-break:keep-all}.box.ac h2{color:#1f4e79}
.box ul{list-style:none;display:flex;flex-direction:column;gap:6px}
.box li{font-size:38px;line-height:1.35;word-break:keep-all;padding-left:54px;position:relative}
.box li:before{content:'';position:absolute;left:0;top:12px;width:26px;height:26px;border:4px solid currentColor}
.node{background:#e8e3d6;border:3px solid #241f20;padding:22px 30px;text-align:center}.node.ac{background:#fff;border:5px solid #1f4e79}
.node b{display:block;font-size:46px;line-height:1.25;word-break:keep-all}.node span{display:block;font-size:36px;line-height:1.35;color:#5d544b;word-break:keep-all}
.arr{display:flex;align-items:center;justify-content:center;gap:16px;font-size:36px;font-weight:700;color:#1f4e79;line-height:1}.arr i{font-style:normal;font-size:48px}
.note{font-size:36px;line-height:1.4;word-break:keep-all;border-left:8px solid #b8893f;padding-left:20px}
.row{background:#e8e3d6;border:3px solid #241f20;padding:16px 22px}.row h2{font-size:40px;line-height:1.2;margin-bottom:6px;word-break:keep-all;color:#241f20}
.row dl{display:block}.row dt{font-size:34px;line-height:1.3;color:#5d544b;word-break:keep-all;margin-top:6px}
.row dd{font-size:36px;line-height:1.3;word-break:keep-all}.row dd.hl{font-weight:800;color:#1f4e79}
.step{display:grid;grid-template-columns:76px 1fr;gap:2px 22px;background:#e8e3d6;border:3px solid #241f20;padding:16px 24px;align-items:start}
.step em{grid-row:span 2;font-style:normal;width:76px;height:76px;border-radius:50%;background:#1f4e79;color:#fff;font-size:42px;font-weight:800;display:flex;align-items:center;justify-content:center}
.step b{font-size:42px;line-height:1.2;word-break:keep-all}.step span{font-size:36px;line-height:1.32;color:#5d544b;word-break:keep-all}
.foot{margin-top:auto;padding-top:20px;border-top:3px solid #241f20;font-size:34px;line-height:1.4;color:#5d544b;word-break:keep-all}`;

const kinds = {
  columns: (s) => s.columns.map((c) => `<div class="box${c.accent ? ' ac' : ''}"><h2>${esc(c.title)}</h2><ul>${c.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join(''),
  flow: (s) => s.nodes.map((n, i) => `<div class="node${n.accent ? ' ac' : ''}"><b>${esc(n.title)}</b><span>${esc(n.body)}</span></div>` + (i < s.nodes.length - 1 ? `<div class="arr"><i>↓</i>${esc(n.edge || '')}</div>` : '')).join('') + (s.note ? `<p class="note">${esc(s.note)}</p>` : ''),
  table: (s) => s.rows.map((r) => `<div class="row"><h2>${esc(r[0])}</h2><dl>${r.slice(1).map((v, j) => `<dt>${esc(s.header[j + 1])}</dt><dd${j + 1 === s.highlight ? ' class="hl"' : ''}>${esc(v)}</dd>`).join('')}</dl></div>`).join(''),
  steps: (s) => s.steps.map((st, i) => `<div class="step"><em>${i + 1}</em><b>${esc(st.title)}</b><span>${esc(st.body)}</span></div>`).join(''),
};
const html = (d) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body><p class="k">${esc(d.kicker)}</p><h1>${esc(d.title)}</h1><div class="main${d.kind === 'table' ? ' tbl' : ''}">${kinds[d.kind](d)}</div><p class="foot">${esc(d.foot)}</p></body></html>`;

const [specFile, outDir] = process.argv.slice(2);
if (!specFile || !outDir) { console.error('usage: node ops/diagrams/render.mjs <spec.json> <outDir>'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const d of spec.images) {
    if (!kinds[d.kind] || !/^[a-z0-9-]+\.png$/.test(d.file)) throw new Error('bad spec item ' + d.file);
    await page.setContent(html(d));
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const els = [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
      const minFont = Math.min(...els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      const foot = document.querySelector('.foot').getBoundingClientRect();
      const main = document.querySelector('.main').getBoundingClientRect();
      const overflowX = document.documentElement.scrollWidth > innerWidth || els.some((e) => e.getBoundingClientRect().right > innerWidth - 8);
      return { minFont, footBottom: Math.round(foot.bottom), overlap: main.bottom > foot.top - 6, overflowX };
    });
    const ok = m.minFont >= MIN_SRC_PX && m.footBottom <= H - 8 && !m.overlap && !m.overflowX;
    if (!ok) failed = true;
    await page.screenshot({ path: path.join(outDir, d.file) });
    results.push({ file: d.file, width: W, height: H, minSourceFontPx: m.minFont, minDisplayPxAt390: +((m.minFont * DISPLAY) / W).toFixed(1), footBottom: m.footBottom, overlap: m.overlap, overflowX: m.overflowX, ok });
  }
} finally { await browser.close(); }
console.log(JSON.stringify(results, null, 1));
process.exit(failed ? 1 : 0);
