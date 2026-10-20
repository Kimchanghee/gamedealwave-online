# Question backlog — gamedealwave.online

Lane: game deals (consoles, games & editions, gift cards & wallet funds, console storage, controllers).
Not in this lane: headsets, mice, keyboards, monitors, chairs, capture cards (those belong to gamebeat.online),
household/kitchen/toys (SalimChoice), clothing (FitShot).

Rule (playbook Phase 5): one question = one page. Before writing, check this list and `/guides/` + `/picks/`
for an existing page on the same question; update that page instead of creating a duplicate.
Source of new rows: Search Console queries with impressions but no dedicated page (start after +14 days of data),
"People also ask" boxes seen during the per-post SERP research, and reader email.

Status: `live` (public page returns 200), `queued` (next up), `idea`, `held` (manuscript prepared, not published).
Live statuses checked 2026-10-20 (HTTP 200 on each URL). Type shows page type and category.

| Question | Basis | Type | Status | URL |
|---|---|---|---|---|
| Will this M.2 SSD work in my PS5? | playstation.com (facts checked 2026-10-15) | guide · storage | live | https://gamedealwave.online/guides/ps5-m2-ssd-checklist/ |
| Expansion card or USB drive for Xbox Series X\|S? | support.xbox.com (facts checked 2026-10-15) | guide · storage | live | https://gamedealwave.online/guides/xbox-series-storage-checklist/ |
| Which microSD card works in Switch vs Switch 2? | en-americas-support.nintendo.com (facts checked 2026-10-15) | guide · storage | live | https://gamedealwave.online/guides/switch-microsd-card-checklist/ |
| PS5 disc or digital edition: which should I buy? | playstation.com, direct.playstation.com (facts checked 2026-10-15) | guide · consoles | live | https://gamedealwave.online/guides/ps5-disc-vs-digital-checklist/ |
| Standard, deluxe or collector's edition: what is actually in the box? | nintendo.com support, playstation.com, support.xbox.com (facts checked 2026-10-15) | guide · games | live | https://gamedealwave.online/guides/game-editions-checklist/ |
| Will this gift card work in my account's region? | support.xbox.com, store.playstation.com, consumer.ftc.gov (facts checked 2026-10-15) | guide · gift-cards | live | https://gamedealwave.online/guides/gift-card-region-checklist/ |
| How do I spot a gaming gift card scam? | consumer.ftc.gov, reportfraud.ftc.gov, support.xbox.com (facts checked 2026-10-15) | guide · gift-cards | live | https://gamedealwave.online/guides/gift-card-scam-checklist/ |
| Will this controller work with my console? | playstation.com, nintendo.com support (facts checked 2026-10-15) | guide · controllers | live | https://gamedealwave.online/guides/controller-compatibility-checklist/ |
| Will the Xbox Wireless Controller work with my devices? | xbox.com product page; exact listing check in `ops/link-checks/` | pick · controllers | live | https://gamedealwave.online/picks/xbox-wireless-controller-checklist/ |
| What does a console bundle include, and is the game a code? | Consoles category is live; needs platform-holder/retailer source before writing | guide · consoles | queued | |
| Refurbished vs renewed vs used console: what do the labels mean? | Needs platform-holder/retailer label definitions before writing | guide · consoles | queued | |
| Does a PS4 game upgrade to PS5 for free? | Needs platform-holder source before writing | guide · games | queued | |
| What is a Switch 2 game-key card and does it need a download? | Extends the live game-editions guide; avoid duplicating its game-key section | guide · games | queued | |
| Game Pass, PS Plus, Nintendo Switch Online: which tier covers what? | Needs platform-holder sources | guide · gift-cards | idea | |
| Can I stack wallet funds and is there a balance cap? | Needs platform-holder sources | guide · gift-cards | idea | |
| Which PS5 SSD heatsinks fit under the slot cover? | Samsung/WD official pages returned 404/empty in the last research session (`ops/queue/ready.json`); no exact-variant facts yet | pick · storage | idea | |
| What charging dock fits a DualSense Edge? | Needs maker/official sources | pick · controllers | idea | |
| Which external USB drive is enough for PS4 games on PS5? | Needs platform-holder source | pick · storage | idea | |
| How do I fix or avoid Joy-Con stick drift? | Needs platform-holder source | guide · controllers | idea | |
| Should I buy the DualSense Edge? | playstation.com product page; manuscript in `ops/queue/`; held 2026-10-20 (no new US Sony listing on amazon.com) | pick · controllers | held | |

Picks (hourly commerce posts) are written only from `ops/POSTING-RULES.md` and need a checked product link.

## Refresh and merge policy
- Mark a live page `refresh-needed` when its source facts change or its impressions drop by 30% or more between measurement windows.
- Change `updated` / dateModified only when the page content actually changes.
- Two pages answering the same question: keep the stronger one, 301 the other to it and keep the canonical on the survivor. Use 410 only as a last resort.
