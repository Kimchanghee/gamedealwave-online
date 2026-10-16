// QA: screenshots at 1440/390 + horizontal overflow, CLS, focus visibility, ad-slot/product-card position.
// Usage: node scripts/qa-shots.cjs <baseUrl> <path,path,...>   -> qa/screens/*.png + qa/shots.json
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join('D:/웹 수익 자동화/rebuild-202610/_qa-tools/node_modules/playwright'));
const base = process.argv[2] || 'http://127.0.0.1:4331';
const pages = (process.argv[3] || '/').split(',');
const outDir = path.join(process.cwd(), 'qa', 'screens');
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const exe = process.env.QA_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe, headless: true } : { headless: true });
  const results = [];
  for (const w of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, deviceScaleFactor: 1 });
    for (const p of pages) {
      const page = await ctx.newPage();
      await page.route(/googlesyndication|googletagmanager/, (r) => r.abort());
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      });
      const res = await page.goto(base + p, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => {
        const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY) }; };
        return {
          sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, cls: +window.__cls.toFixed(4),
          h1: document.querySelector('h1')?.textContent?.trim(),
          disclosure: r('[data-disclosure]'), answer: r('[data-answer]'), card: r('.ptag--inline, .spec--inline, [data-card="inline"]'),
          smallTargets: [...document.querySelectorAll('main a, main button, header a, header button')].filter((a) => { const b = a.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 24 && getComputedStyle(a).display !== 'inline'; }).length,
        };
      });
      await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { tag: a.tagName, text: (a.textContent || '').trim().slice(0, 30), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` }; });
      const name = `${(p.replace(/\//g, '_').replace(/^_+|_+$/g, '') || 'home')}-${w}`;
      await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
      await page.screenshot({ path: path.join(outDir, `${name}-full.png`), fullPage: true });
      results.push({ path: p, width: w, status: res.status(), overflowX: m.sw > m.cw, ...m, focus });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(process.cwd(), 'qa', 'shots.json'), JSON.stringify(results, null, 2));
  for (const r of results) console.log(`${r.width} ${r.path} status=${r.status} overflowX=${r.overflowX} cls=${r.cls} smallTargets=${r.smallTargets} focus=${r.focus.tag}:${r.focus.outline}`);
})().catch((e) => { console.error(e); process.exit(1); });
