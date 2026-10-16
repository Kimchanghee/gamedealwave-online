// Single source of site identity + monetization wiring. Erasable TS only (also imported by Node scripts).
// Merge both: astro.config (rehype link rewriting) sees process.env but an import.meta.env without PUBLIC_* values.
const env: Record<string, string | undefined> = {
  ...((globalThis as any).process?.env ?? {}),
  ...(((import.meta as any).env as Record<string, string | undefined>) ?? {}),
};

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
      blurb: "Checklists for buying a PlayStation, Xbox or Nintendo console: model numbers, disc versus digital editions, bundle contents, and what to confirm at checkout." },
    { slug: 'games', name: 'Games & editions', code: 'GAM', seoTitle: 'Game Edition Checklists: Standard, Deluxe and Digital Codes',
      blurb: "How to read game listings before you buy: standard, deluxe and collector editions, codes in a box, Switch 2 game-key cards, and PS4 to PS5 upgrade rules." },
    { slug: 'gift-cards', name: 'Gift cards & wallet funds', code: 'GFT', seoTitle: 'Gaming Gift Card Checklists: Regions, Limits and Scam Signs',
      blurb: "Checklists for PlayStation, Xbox, Nintendo eShop and Steam gift cards: region matching, delivery formats, and the scam patterns the FTC warns shoppers about." },
    { slug: 'storage', name: 'Storage', code: 'STO', seoTitle: 'Console Storage Checklists: PS5 SSDs, Xbox Cards, microSD',
      blurb: "Storage checklists for consoles: PS5 M.2 SSD rules and heatsink limits, Xbox Series expansion cards versus USB drives, and Switch microSD Express cards." },
    { slug: 'controllers', name: 'Controllers', code: 'CTL', seoTitle: 'Controller Checklists: Compatibility, Drift and Batteries',
      blurb: "Controller checklists: platform compatibility, official versus licensed pads, wired or wireless, battery types, stick drift, and what pro controllers add." },
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
