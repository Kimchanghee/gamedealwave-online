# PROGRESS — gamedealwave.online v2 (branch v2-cloudflare-static)

Resume rule: read this file first; continue from the first unchecked milestone. Commit + push after each.
Authoring note: run `node scripts/quote-fm.mjs` after writing content (quotes YAML values containing ": ").
Build note: `pnpm build` runs scripts/prebuild.mjs (clears Astro content-layer cache + regenerates OG), so staged/deleted posts and the Amazon tag never leak between builds.

- [x] M0 clone fresh, branch v2-cloudflare-static, old Next.js/Steam tracker tree removed (incl. .env.local/.env.production)
- [x] M1 scaffold: Astro 5 static, config, wrangler.jsonc, layouts, design system (receipt/price-tag wall), pages (home, guides, picks, category hubs, [doc] legal pages, 404, rss, llms.txt) — build passes
- [x] M2 pipeline: gate.mjs (+commerce gate), gate-examples.mjs (pass 0 errors / fail 17 errors / dup-URL guard), publish.ps1 (+ -DryRun), verify-post.mjs, refresh.mjs (source reachability snapshot src/data/source-check.json 20/20), refresh-build.ps1, prebuild.mjs, og (guides + picks), qa-staged.ps1 (dry run passes tag OFF and ON; fixed: in-text link lacked tag in tag-ON mode)
- [x] M3 content: 8 guides DONE (ps5-m2-ssd, xbox-series-storage, switch-microsd, ps5-disc-vs-digital, game-editions, gift-card-region, gift-card-scam, controller-compatibility); docs DONE; content/backlog.md (18 questions) and ops/POSTING-RULES.md (+ post template) DONE
- [x] M4 SEO: seo/before-curl.txt (402 DEPLOYMENT_DISABLED), seo/after-curl.txt (scripts/crawler-check.ps1), seo/scorecard.md, seo/measure.md, DESIGN_REFERENCES.md
- [x] M5 QA: astro check 0 errors (typescript pinned ^5.9; TS 7 breaks astro check), pnpm test 6/6, gate PASS 24 pages, gate:examples OK, qa:staged dry run OK tag OFF+ON, screenshots qa/screens (home, guide, category, 404, about, staged pick) at 1440/390: no overflow, CLS <= 0.02, focus 3px visible, 0 small targets. Fixed: invisible receipt (mask), sparse home wall, mobile nav 3 rows
- [x] M6 final verification 2026-10-16 10:00 KST: pnpm build 24 pages, gate PASS (0 posts, affiliate OFF), tree clean, pushed. Publish: `pwsh -File scripts/publish.ps1 -Slug <slug>` (dry: `-DryRun`)
