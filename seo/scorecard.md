# Phase 0 scorecard — gamedealwave.online

Evidence: `seo/before-curl.txt` (live domain, curl, 2026-10-16 KST) and `seo/after-curl.txt`
(local `astro preview` of branch `v2-cloudflare-static`, curl, no JS). AFTER is local only; it is not a deployment,
indexing or ranking result.

## BEFORE (live https://gamedealwave.online, 2026-10-16)
Every path (`/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/rss.xml`, `/ads.txt`, a missing page) returns
`HTTP 402 text/plain` from Vercel with body `Payment required DEPLOYMENT_DISABLED`.

| Lane | State | Evidence |
|---|---|---|
| SEO | ❌ | 402 on all URLs; no HTML, title, canonical, sitemap or robots.txt reachable |
| AEO | ❌ | no content, no structured data |
| GEO | ❌ | no llms.txt, no citable pages |
| LLMO | ❌ | no entity description reachable |
| NEO | n/a | English site |
| Content ops | ❌ | no blog/feed reachable; last publish date unknown |

## AFTER (local preview, 2026-10-16)
| Lane | State | Evidence |
|---|---|---|
| SEO | ✅ | 24 pages server-rendered; every page title 50–60 and description 150–160 (gate-enforced); absolute canonicals; `robots: index, follow`; robots.txt `Allow: /` + sitemap; sitemap-index → 23 URLs with lastmod from content `updated`; real 404 status; OG 1200×630 PNG per home/guide/category/pick |
| AEO | ✅ | each guide H1 is the buyer question, `data-answer` 20–75 word direct answer first, ≥4 question H2s, visible FAQ mirrored exactly in FAQPage LD (gate checks text match); Article headline = H1; no Review/Rating/Offer/Product LD |
| GEO | ✅ | `/llms.txt` lists every checklist with its direct answer; guides cite official support pages with "facts checked" date; `/methodology/` explains sourcing; stable `/guides/<slug>/` URLs |
| LLMO | ✅ | one entity description reused in site.config → About, Organization LD, llms.txt |
| NEO | n/a | English site (no Naver meta) |
| Content ops | ⚠️ | content collection with question/answer/data_asof/sources/faq; `content/backlog.md` (18 questions); publish gate + commerce gate + `publish.ps1`; 0 picks live because no product link has been checked yet (owner/Associates pending) |

Re-measure: see `seo/measure.md` (+14 days after the parent deploys).
