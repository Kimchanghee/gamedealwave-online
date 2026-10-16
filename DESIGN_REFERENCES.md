# DESIGN_REFERENCES — gamedealwave.online

## Metaphor
**Arcade price-tag wall / bargain-bin receipts.** The site is the wall of a game shop's clearance aisle:
kraft pegboard background, manila hang-tags on hooks (one tag = one checklist), aisle signs with three-letter
shelf codes (CON, GAM, GFT, STO, CTL), and a thermal checkout slip that lists what to confirm before paying.
The red "clearance" stamp colour marks codes and the single checkout CTA. There are deliberately **no prices**:
the tag carries checks, not dollars, which is both the Amazon rule and the site's point of view.

Component vocabulary (not shared with any other site in this rebuild):
- `PriceTag` hang-tag with peg hook, punched hole, slight tilt (removed under reduced motion), code + No.
- `Receipt` checkout slip (Courier Prime, numbered lines, LINES total, zigzag tear edge via CSS mask).
- `ProductCard` "On the tag" card (rail on desktop ≥1000px, inline right after the answer below that; end CTA).
- Aisle sign rows, "shelf" header with wordmark `Game[Deal]Wave` stamped red, "tally" footer with link notice.
- Home: the five aisles hang side by side as pegboard columns at ≥1100px (2 columns ≥720px, 1 below).

## Tokens
| Token | Value | Use |
|---|---|---|
| --kraft | #e6dfd0 | page (pegboard), dots #c9bc9f radial-gradient 28px grid |
| --paper | #fbfaf5 | article sheet, receipt |
| --manila | #f3e3b5 | hang-tags, product card |
| --ink / --ink-2 | #1d1b17 / #4a4539 | text, header/footer |
| --stamp | #b42a17 | codes, CTA button (text 6.1:1) |
| --focus | #0b57d0 | 3px focus outline |
| Type | Archivo Variable (wdth 70–88) headings/tags; Courier Prime receipts/meta; system UI body |
| Scale | 0.875 / 1.0625 / 1.3 / 1.7 / clamp(1.9–3.1rem) |
| Measure | 68ch article body |

Contrast (WCAG formula, computed): ink on kraft 13.0:1, ink-2 on manila 7.5:1, ink-2 on kraft 7.2:1, stamp on paper 6.1:1, stamp on manila 5.0:1, CTA text #fff8ef on stamp 6.1:1, paper on ink 16.5:1 (all AA).
Touch targets ≥44px for nav, aisle links and CTAs; mobile aisles are one swipeable row.

## Fonts and licences
- Archivo (Omnibus-Type), SIL Open Font License 1.1, self-hosted via `@fontsource-variable/archivo` — https://fonts.google.com/specimen/Archivo
- Courier Prime (Alan Dague-Greene / Quote-Unquote Apps), SIL OFL 1.1, via `@fontsource/courier-prime` — https://quoteunquoteapps.com/courierprime/

## Principles borrowed (no code copied)
- GOV.UK Design System focus and "start with user needs" guidance (MIT/OGL) — https://design-system.service.gov.uk/get-started/focus-states/
- Zigzag edge technique: CSS mask with conic-gradient (common CSS pattern, own implementation).

## Rejected defaults
No gradient hero, glass, neon, pill chips, metric cards, hover-lift, testimonial blocks or star ratings.
Ad slots are fixed-size dashed boxes in the rail/after content so they never move the card or disclosure.
