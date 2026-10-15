// Single source of site identity + monetization wiring. Erasable TS only (also imported by Node scripts).
const env: Record<string, string | undefined> =
  ((import.meta as any).env as Record<string, string | undefined>) ?? (globalThis as any).process?.env ?? {};

export const site = {
  domain: 'gamedealwave.online',
  url: 'https://gamedealwave.online',
  name: 'GameDealWave',
  tagline: 'Read the fine print before the checkout.',
  description:
    'GameDealWave writes buying checklists for consoles, games, gift cards, storage and controllers, so you can tell whether a listing fits your console before you pay.',
  locale: 'en-US',
  ga4Id: env.PUBLIC_GA4_ID ?? '',
  gscVerification: env.PUBLIC_GSC_VERIFICATION ?? '',
  naverVerification: '',
  adsenseClient: 'ca-pub-4490818204529253',
  contactEmail: 'contact@gamedealwave.online',
  // Amazon Associates (US). Not issued yet: '' => plain amazon.com product links, no tag, no Associates statement.
  amazonTag: env.PUBLIC_AMAZON_TAG ?? '',
  affiliate: { amazonStoreUrl: '' },
  indexNowKey: 'ca4c78e1dd12f2678364a05ecfa37e33',
  siteUpdated: '2026-10-15',
  providerAllowlist: { amazon: ['www.amazon.com', 'amazon.com', 'amzn.to'] } as Record<string, string[]>,
  categories: [
    { slug: 'consoles', name: 'Consoles', code: 'CON', seoTitle: 'Console Buying Checklists: Models, Bundles and Region Checks',
      blurb: 'Checklists for buying a PlayStation, Xbox or Nintendo console: model revisions, disc versus digital editions, bundle contents, refurbished listings and what to confirm before checkout.' },
    { slug: 'games', name: 'Games & editions', code: 'GAM', seoTitle: 'Game Edition Checklists: Standard, Deluxe and Digital Codes',
      blurb: 'How to read game listings before you buy: standard versus deluxe and collector editions, digital code platforms and regions, physical versions that still need downloads, and upgrade paths.' },
    { slug: 'gift-cards', name: 'Gift cards & wallet funds', code: 'GFT', seoTitle: 'Gaming Gift Card Checklists: Regions, Limits and Scam Signs',
      blurb: 'Checklists for PlayStation Store, Xbox, Nintendo eShop and Steam gift cards: region matching, wallet limits, delivery formats, and the scam patterns that official support pages warn about.' },
    { slug: 'storage', name: 'Storage', code: 'STO', seoTitle: 'Console Storage Checklists: PS5 SSDs, Xbox Cards, microSD',
      blurb: 'Storage checklists for consoles: PS5 M.2 SSD requirements and heatsinks, Xbox Series expansion cards versus USB drives, and Nintendo Switch microSD card types and speeds.' },
    { slug: 'controllers', name: 'Controllers', code: 'CTL', seoTitle: 'Controller Buying Checklists: Compatibility, Drift, Batteries',
      blurb: 'Controller checklists: platform compatibility, official versus licensed pads, wired versus wireless latency, battery types, drift and repair options, and what a pro-style controller adds.' },
  ],
};

export const AMAZON_STATEMENT = 'As an Amazon Associate I earn from qualifying purchases.';
export const NO_TAG_STATEMENT =
  'Product links go to Amazon product pages without an affiliate tag. We earn nothing from them today; if that changes, this notice changes first.';

export function isAffiliateMode(): boolean {
  return site.amazonTag.trim().length > 0;
}

export function disclosureFor(provider: string): string {
  if (provider === 'amazon') return isAffiliateMode() ? AMAZON_STATEMENT : NO_TAG_STATEMENT;
  return 'This post contains links to a retailer. We may earn a commission if that link is an affiliate link.';
}

// Always the full set: harmless on untagged links, mandatory once the Associates tag is on (commerce gate checks it).
export function productRel(): string {
  return 'sponsored nofollow noopener';
}

export function productHref(raw: string): string {
  const u = new URL(raw);
  const amazon = site.providerAllowlist.amazon;
  if (isAffiliateMode() && amazon.includes(u.hostname) && u.hostname !== 'amzn.to') {
    u.searchParams.set('tag', site.amazonTag.trim());
  }
  return u.toString();
}
