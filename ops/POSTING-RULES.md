# POSTING RULES — gamedealwave.online hourly picks

Who uses this: the AI writer that produces one `/picks/` post per hour. Follow the steps in order.
If any step fails, skip the slot. Never publish filler to keep the cadence.

Lane: consoles, games & editions, gift cards & wallet funds, console storage, controllers (US Amazon).
Out of lane: headsets, mice, keyboards, monitors, chairs, capture (gamebeat.online); home/kitchen/toys; clothing.

## 1. Research the buyer question (10 min)
1. Pick a question from `content/backlog.md` (`queued`/`idea`, type `pick`) or a new lane question.
2. Search it on Google (US English). Open and read 3–5 ranking original pages (maker support pages, retailer
   help pages, reputable outlets). Do not copy text. Write a 5-line brief at the top of your evidence note:
   question · direct answer · evidence (official URLs) · sub-questions buyers ask · 2+ internal links to use.
3. Check `/guides/` and `/picks/` and `ops/publish-log.jsonl`: no existing post on the same question, and no
   product URL or slug used in the last 30 days.

## 2. Pick the product and check the link (5 min)
1. Choose one product that answers the question. Use the exact Amazon product page `https://www.amazon.com/dp/<ASIN>`.
   Strip tracking parameters. The site adds the Associates tag itself when `PUBLIC_AMAZON_TAG` is set;
   never paste a tagged link and never create links in Associates yourself unless the owner asks.
2. Open the link. Confirm it lands on the exact product and the option you will name (capacity, color, edition,
   platform, region). Save `ops/evidence/<slug>.md` with: opened-at (ISO + offset), final URL, page title,
   option text exactly as shown, model number, maker page URL used for specs.
3. Do NOT copy price, discount, stock, star rating, review count or Amazon images. Those need the Amazon API.

## 3. Collect specs only from the product page or the maker's official page
Every spec in the post must appear on one of those pages. Compatibility claims (PS5 slot, Xbox, Switch 2)
must match the platform holder's support page; cite it in `sources`.

## 4. Write (20 min)
- File: `src/content/posts/<slug>.md` using the template below. English, plain, short paragraphs.
- Title 50–60 chars (use `seoTitle` if `title` is shorter), description 150–160 chars.
- `answer`: a direct 20–70 word answer to `question` (shown first, under the disclosure).
- Body ≥ 700 words, ≥ 4 H2s phrased as questions, each answered in its first sentence.
- ≥ 2 internal links to `/guides/...` or `/category/...` pages. Optionally one in-text link to the exact same
  product URL as `product.url` (any other Amazon URL fails the gate).
- Include limitations and who should skip it. Link text must not mention price ("cheapest", "deal", "on sale").
- Banned: first-hand claims ("I tested", "in my experience", "hands-on", "my unit"), invented ratings,
  "customers say", prices, stock. You have not used the product; write from specs and official rules.
- Run `node scripts/quote-fm.mjs` after writing (quotes YAML values containing ": ").

## 5. Images
- At least one `cover` image in `public/picks-img/<slug>/`, made by the site (diagram/illustration, `rights: generated`)
  or `rights: own`. Amazon product photos only via SiteStripe/API (`rights: provider-api`), not available now.
- Every image: real file, descriptive `alt` (≥ 8 chars, says what is shown), `role`, `credit`.
- Illustrations must not pretend to be product photos.

## 6. Gate, publish, verify
```powershell
pnpm build; node scripts/gate.mjs --slug <slug>        # must print GATE PASS
pwsh -File scripts/publish.ps1 -Slug <slug> -DryRun     # rehearsal
pwsh -File scripts/publish.ps1 -Slug <slug>             # deploy + live verify + IndexNow + log
```
`publish.ps1` refuses a slug already in `ops/publish-log.jsonl`. If live verification fails, the page may be
deployed but is NOT logged: fix and re-run, do not create a second slug.
Commit the post, its images, evidence note and the log line.

## Post template
```markdown
---
title: "<Question-shaped or answer-shaped title, 50-60 chars>"
description: "<150-160 chars: what the post checks and for whom>"
slug: <kebab-case-slug>
question: "<the buyer question>"
answer: "<20-70 word direct answer naming the product and the deciding spec>"
published: "2026-10-15T14:00:00+09:00"
updated: "2026-10-15T14:00:00+09:00"
category: storage            # consoles | games | gift-cards | storage | controllers
primaryKeyword: "<main query>"
product:
  name: "<exact product name as listed>"
  optionDetail: "<capacity/color/edition/platform exactly as selected>"
  provider: amazon
  url: "https://www.amazon.com/dp/<ASIN>"
  landingHost: www.amazon.com
  verifiedAt: "2026-10-15T13:40:00+09:00"
  evidence: ops/evidence/<slug>.md
images:
  - src: /picks-img/<slug>/cover.png
    alt: "<what the image shows>"
    role: cover
    credit: GameDealWave illustration
    rights: generated
sources:
  - title: "<official page title>"
    url: https://...
faq:
  - q: "<question that is answered visibly in the FAQ block>"
    a: "<answer>"
---
<Opening paragraph: the situation and what this post checks.>

## <Question 1?>
...
## <Question 2?>
...
## <Question 3?>
...
## Who should skip this?
...
```
A complete marked example lives at `src/content/posts/_examples/pass-example.md`; `pnpm gate:examples`
proves the gate accepts it and rejects `fail-example.md`.
