# PROGRESS — gamedealwave.online v2 (branch v2-cloudflare-static)

Resume rule: read this file first; continue from the first unchecked milestone. Commit + push after each.
Authoring note: run `node scripts/quote-fm.mjs` after writing content (quotes YAML values containing ": ").

- [x] M0 clone fresh, branch v2-cloudflare-static, old Next.js/Steam tracker tree removed (incl. .env.local/.env.production)
- [x] M1 scaffold: Astro 5 static, config, wrangler.jsonc, layouts, design system (receipt/price-tag wall), pages (home, guides, picks, category hubs, [doc] legal pages, 404, rss, llms.txt) — build passes
- [ ] M2 pipeline: gate.mjs (+commerce gate), examples pass/fail, publish.ps1 -DryRun, refresh-build.ps1, og (done: scripts/og.mjs)
- [ ] M3 content: 8+ guides (done: ps5-m2-ssd-checklist), docs done (about, methodology, affiliate-disclosure, contact, privacy, terms, disclaimer), content/backlog.md, ops/POSTING-RULES.md
- [ ] M4 SEO: scorecard before/after, measure.md, DESIGN_REFERENCES.md
- [ ] M5 QA: build, gate, curl checks, screenshots 1440/390, tests
- [ ] M6 final push + report
