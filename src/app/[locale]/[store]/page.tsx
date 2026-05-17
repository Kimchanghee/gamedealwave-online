import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string; store: string }>;
}

const STORE_INFO = {
  steam: {
    name: 'Steam',
    title: 'Steam 할인 비교',
    description: 'Steam 지역별 가격과 할인율을 확인하고 가장 저렴한 구매 타이밍을 찾으세요.',
    keywords: ['Steam sale', '스팀 할인', 'Steam regional price', 'Steam gift card'],
    picks: ['steam gift card', 'steam deck accessories', 'pc gaming controller'],
    playbook: [
      'Check the 30-day low before buying a headline sale because Steam publisher weekends often repeat the same discount.',
      'Compare regional price movement with wish-list demand; a cheap key is not useful if it activates in the wrong region.',
      'Bundle DLC only when the base game has active players and recent patches.'
    ],
  },
  psn: {
    name: 'PlayStation Store',
    title: 'PSN 할인 비교',
    description: 'PlayStation Store 할인과 기프트카드, 콘솔 게임 특가를 한눈에 확인하세요.',
    keywords: ['PSN sale', 'PlayStation sale', '플레이스테이션 할인', 'psn gift card'],
    picks: ['playstation gift card', 'dual sense controller', 'ps5 accessories'],
    playbook: [
      'Confirm whether the discount is for PS4, PS5, or cross-buy before checkout.',
      'Use gift card pricing only after comparing the official store sale price.',
      'For controller and headset deals, check warranty region and return policy before following a marketplace link.'
    ],
  },
  xbox: {
    name: 'Xbox Store',
    title: 'Xbox 할인 비교',
    description: 'Xbox Store 할인, Game Pass 관련 딜, 컨트롤러 특가를 빠르게 살펴보세요.',
    keywords: ['Xbox sale', 'xbox game pass', '엑스박스 할인', 'xbox controller'],
    picks: ['xbox gift card', 'xbox controller', 'game pass ultimate'],
    playbook: [
      'Compare the game purchase price with Game Pass availability before buying.',
      'Check whether a deal is for console, PC, or Play Anywhere entitlement.',
      'For subscription deals, calculate the monthly equivalent after trial periods and renewal pricing.'
    ],
  },
} as const;

const LOCALES = ['ko', 'en', 'ja'];

function buildAmazonUrl(keyword: string) {
  const url = new URL('https://www.amazon.com/s');
  url.searchParams.set('k', keyword);
  url.searchParams.set('tag', 'amazonfi00681-20');
  url.searchParams.set('linkCode', 'll2');
  return url.toString();
}

function buildCoupangUrl(keyword: string) {
  const custom = process.env.NEXT_PUBLIC_COUPANG_PARTNER_URL;
  if (custom) return custom;
  const url = new URL('https://www.coupang.com/np/search');
  url.searchParams.set('component', '');
  url.searchParams.set('q', keyword);
  return url.toString();
}

function buildAliExpressUrl(keyword: string) {
  const custom = process.env.NEXT_PUBLIC_ALIEXPRESS_PARTNER_URL;
  if (custom) return custom;
  return `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(keyword.replace(/\s+/g, '-'))}.html`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, store } = await params;
  const info = STORE_INFO[store as keyof typeof STORE_INFO];
  if (!info || !LOCALES.includes(locale)) return {};

  return {
    title: `${info.title} | GameDealWave`,
    description: info.description,
    keywords: [...info.keywords],
    alternates: {
      canonical: `/${locale}/${store}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/${store}`])),
    },
    openGraph: {
      title: `${info.title} | GameDealWave`,
      description: info.description,
      url: `https://gamedealwave.online/${locale}/${store}`,
    },
  };
}

export default async function StorePage({ params }: Props) {
  const { locale, store } = await params;
  if (!LOCALES.includes(locale)) notFound();
  const info = STORE_INFO[store as keyof typeof STORE_INFO];
  if (!info) notFound();

  setRequestLocale(locale);

  const relatedStores = Object.entries(STORE_INFO).filter(([slug]) => slug !== store);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-7xl items-center justify-between p-4">
          <Link href={`/${locale}`} className="text-2xl font-bold tracking-tight">
            <span className="text-blue-400">GameDeal</span>Wave
          </Link>
          <nav className="flex gap-3 text-sm">
            {Object.entries(STORE_INFO).map(([slug, item]) => (
              <Link key={slug} href={`/${locale}/${slug}`} className="hover:text-blue-400">
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-950 to-slate-950 py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">{info.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{info.title}</h1>
          <p className="mt-3 max-w-2xl text-slate-400">{info.description}</p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold">Deal decision checklist</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              This page is built as a real shopping checkpoint first, not a wall of outbound links. Use the store-specific notes below to decide whether a deal is worth opening, wish-listing, or skipping.
            </p>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-slate-300">
            {info.playbook.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-4 text-xl font-semibold">Useful searches after the price check</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {info.picks.map((keyword) => (
            <article key={keyword} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold capitalize">{keyword}</h2>
              <p className="mt-2 text-sm text-slate-400">
                가격 변동이 잦은 상품이라 지역가와 공식 스토어 가격을 함께 비교하는 것이 좋습니다.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <a className="rounded-lg border border-amber-400/40 px-3 py-2 text-amber-300 hover:border-amber-300" href={buildAmazonUrl(keyword)} target="_blank" rel="sponsored noopener noreferrer">
                  Amazon
                </a>
                <a className="rounded-lg border border-blue-400/40 px-3 py-2 text-blue-300 hover:border-blue-300" href={buildCoupangUrl(keyword)} target="_blank" rel="sponsored noopener noreferrer">
                  Coupang
                </a>
                <a className="rounded-lg border border-rose-400/40 px-3 py-2 text-rose-300 hover:border-rose-300" href={buildAliExpressUrl(keyword)} target="_blank" rel="sponsored noopener noreferrer">
                  AliExpress
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 pb-10">
        <h2 className="mb-4 text-xl font-semibold">다른 스토어도 보기</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {relatedStores.map(([slug, item]) => (
            <Link key={slug} href={`/${locale}/${slug}`} className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-400">
              <div className="font-semibold">{item.title}</div>
              <p className="mt-1 text-sm text-slate-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
