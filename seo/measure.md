# Measurement plan — gamedealwave.online

Baseline (2026-10-16 KST): the domain returns HTTP 402 `DEPLOYMENT_DISABLED` from Vercel on every path
(`seo/before-curl.txt`). Impressions, clicks, indexed pages and AI citations are treated as 0 / not measurable.

## Day 0 (parent, after deploy)
- Search Console: add the domain property, submit `https://gamedealwave.online/sitemap-index.xml`, URL-inspect
  `/`, `/guides/`, and two guides. Record indexed count = 0 as the baseline row.
- Bing Webmaster: import from GSC; IndexNow key file is `/ca4c78e1dd12f2678364a05ecfa37e33.txt`.
- GA4: set `PUBLIC_GA4_ID`, rebuild, confirm one `page_view` and one `outbound_affiliate_click` in DebugView.
- AI citation baseline: ask these 8 questions in ChatGPT search, Perplexity and Google AI Overviews; record O/X
  whether gamedealwave.online is cited:
  1. Will any M.2 SSD work in a PS5?  2. Xbox Series expansion card vs USB drive?  3. Does Switch 2 need microSD Express?
  4. PS5 disc or digital edition?  5. What is in a game's deluxe edition?  6. Do PlayStation gift cards work in other regions?
  7. How to spot a gift card scam?  8. Will a PS4 controller work on PS5?

## Day +14 (re-measure; exclude the last 3 days)
- GSC: impressions, clicks, average position by group (`/guides/`, `/picks/`, `/category/`), indexed pages,
  "Crawled - currently not indexed" list.
- Top queries with impressions but no dedicated page -> add to `content/backlog.md`.
- Cloudflare: bot traffic breakdown for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot (leading indicator).
- AI citation O/X for the same 8 questions.
- Per post: share of `/picks/` posts with >0 impressions (target metric, not post count).
- Outbound: `outbound_affiliate_click` events by `destination_host` and page.

## Decision rules
- Impressions up, CTR flat -> rewrite titles/descriptions of the top 5 pages by impressions.
- A page with 0 impressions after 28 days -> check index status, then merge into a stronger guide (301) or improve.
- Watch the date of each metric, not just its value: a metric whose source has not updated in 7 days is not reported.

Report line format: `[Baseline] ... [Change] ... [Re-measure] 2026-10-30 ... [Result] ...`
