# PROGRESS — gamedealwave.online v2 (branch v2-cloudflare-static)

Resume rule: read this file first; continue from the first unchecked milestone. Commit + push after each.
Authoring note: run `node scripts/quote-fm.mjs` after writing content (quotes YAML values containing ": ").
Build note: `pnpm build` runs scripts/prebuild.mjs (clears Astro content-layer cache + regenerates OG), so staged/deleted posts and the Amazon tag never leak between builds.

- [x] M0 clone fresh, branch v2-cloudflare-static, old Next.js/Steam tracker tree removed (incl. .env.local/.env.production)
- [x] M1 scaffold: Astro 5 static, config, wrangler.jsonc, layouts, design system (receipt/price-tag wall), pages (home, guides, picks, category hubs, [doc] legal pages, 404, rss, llms.txt) — build passes
- [x] M2 pipeline: gate.mjs (+commerce gate), gate-examples.mjs (pass 0 errors / fail 17 errors / dup-URL guard), publish.ps1 (+ -DryRun), verify-post.mjs, refresh.mjs (source reachability snapshot src/data/source-check.json 20/20), refresh-build.ps1, prebuild.mjs, og (guides + picks), qa-staged.ps1 (dry run passes tag OFF and ON; fixed: in-text link lacked tag in tag-ON mode)
- [ ] M3 content: 8 guides DONE (ps5-m2-ssd, xbox-series-storage, switch-microsd, ps5-disc-vs-digital, game-editions, gift-card-region, gift-card-scam, controller-compatibility); docs DONE; TODO content/backlog.md, ops/POSTING-RULES.md (+ post template)
- [ ] M4 SEO: seo/scorecard.md before/after, seo/measure.md, DESIGN_REFERENCES.md
- [ ] M5 QA: astro check, tests/, curl checks vs preview, screenshots 1440/390 (qa/)
- [ ] M6 final push + report
