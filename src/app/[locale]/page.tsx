import { setRequestLocale } from 'next-intl/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Props {
  params: Promise<{ locale: string }>;
}

interface FeaturedDeal {
  steamAppId: number;
  title: string;
  imageUrl: string;
  prices: Record<
    string,
    { currency: string; original: number; final: number; discountPct: number; currencyKrw: number }
  >;
  cheapestRegion: string;
  store: string;
  url: string;
  isHistoricalLow: boolean;
}

const FALLBACK_DEALS: FeaturedDeal[] = [
  {
    steamAppId: 1174180,
    title: 'Red Dead Redemption 2',
    imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
    prices: { US: { currency: 'USD', original: 59900, final: 19700, discountPct: 67, currencyKrw: 19700 } },
    cheapestRegion: 'US',
    store: 'Steam',
    url: 'https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/',
    isHistoricalLow: false,
  },
  {
    steamAppId: 1086940,
    title: "Baldur's Gate 3",
    imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg',
    prices: { US: { currency: 'USD', original: 66000, final: 52800, discountPct: 20, currencyKrw: 52800 } },
    cheapestRegion: 'US',
    store: 'Steam',
    url: 'https://store.steampowered.com/app/1086940/Baldurs_Gate_3/',
    isHistoricalLow: false,
  },
  {
    steamAppId: 1245620,
    title: 'Elden Ring',
    imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
    prices: { US: { currency: 'USD', original: 64800, final: 42100, discountPct: 35, currencyKrw: 42100 } },
    cheapestRegion: 'US',
    store: 'Steam',
    url: 'https://store.steampowered.com/app/1245620/ELDEN_RING/',
    isHistoricalLow: false,
  },
  {
    steamAppId: 292030,
    title: 'The Witcher 3: Wild Hunt',
    imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
    prices: { US: { currency: 'USD', original: 34800, final: 8700, discountPct: 75, currencyKrw: 8700 } },
    cheapestRegion: 'US',
    store: 'Steam',
    url: 'https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/',
    isHistoricalLow: true,
  },
];

async function loadFeatured(): Promise<FeaturedDeal[]> {
  try {
    const path = join(process.cwd(), 'src/data/featured.json');
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export const revalidate = 1800; // 30분 ISR

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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loadedDeals = await loadFeatured();
  const deals = loadedDeals.length ? loadedDeals : FALLBACK_DEALS;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-blue-400">GameDeal</span>Wave
          </div>
          <nav className="flex gap-3 text-sm">
            <a href="#deals" className="hover:text-blue-400">Steam</a>
            <a href="#guide" className="hover:text-blue-400">구매 기준</a>
            <a href="#partner-picks" className="hover:text-blue-400">장비</a>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-950 to-slate-950 py-10">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Steam·PSN·Xbox 통합 할인 + 환차익</h1>
          <p className="mt-3 text-slate-400">한국·일본·미국 리전 가격을 자동 비교. 환율 적용 후 가장 싼 리전 추천.</p>
        </div>
      </section>

      <section id="deals" className="container mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-semibold">🔥 오늘의 최저가</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {deals.slice(0, 20).map((d) => (
              <a
                key={d.steamAppId}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-lg bg-slate-900 transition hover:scale-105"
              >
                <img src={d.imageUrl} alt={d.title} className="aspect-video w-full object-cover" />
                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-medium">{d.title}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold">
                      -{d.prices[d.cheapestRegion]?.discountPct}%
                    </span>
                    <span className="font-mono text-sm">
                      ₩{d.prices[d.cheapestRegion]?.currencyKrw.toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              </a>
          ))}
        </div>
      </section>

      <section id="guide" className="container mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-2 text-xl font-semibold">구매 전 확인할 것</h2>
          <p className="text-sm leading-6 text-slate-400">
            최저가만 보지 말고 한국어 지원, 환불 정책, DLC 포함 여부, 플랫폼 연동 여부를 함께 확인하세요.
            라이브 할인 데이터가 잠시 비어도 검증된 대표 할인작을 보여주도록 구성했습니다.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <h3 className="font-semibold text-slate-100">리전 가격 읽는 법</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                같은 할인율이라도 원화 환산가, 결제 수수료, 지역 제한 여부가 다릅니다. 표시 가격은
                빠른 비교용으로 보고 최종 결제 전에는 스토어 장바구니에서 실제 통화를 다시 확인하세요.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <h3 className="font-semibold text-slate-100">DLC와 에디션 확인</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                디럭스, 얼티밋, 번들 에디션은 본편 가격보다 할인폭이 커 보여도 필요한 DLC가 빠질 수 있습니다.
                구매 전 구성품, 한국어 지원, 저장 데이터 호환성을 함께 비교하세요.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <h3 className="font-semibold text-slate-100">데이터 지연 대응</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                스토어 API가 늦게 응답할 때는 검증된 대표 할인작을 먼저 보여줍니다. 빈 화면 대신 최근 기준
                후보를 제공해 사용자가 비교 흐름을 잃지 않도록 운영합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-xl font-semibold">오늘 살지, 기다릴지 판단 기준</h2>
          <div className="grid gap-4 text-sm leading-6 text-slate-400 md:grid-cols-2">
            <p>
              역사적 최저가에 가까운 게임은 위시리스트 대기보다 바로 구매가 유리할 수 있습니다. 반대로
              출시 3개월 이내 AAA 게임은 다음 시즌 세일에서 추가 할인이 붙는 경우가 많으니 플레이 일정이
              급하지 않다면 조금 더 기다리는 편이 낫습니다.
            </p>
            <p>
              멀티플레이 게임은 가격보다 현재 접속자, 서버 지역, 친구 플랫폼을 먼저 보세요. 싱글 플레이
              게임은 플레이타임, 모드 지원, DLC 포함 여부를 함께 보면 체감 가성비를 더 정확하게 판단할 수
              있습니다.
            </p>
          </div>
        </div>
      </section>

      <section id="partner-picks" className="container mx-auto max-w-7xl px-4 pb-10">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-2 text-xl font-semibold">장비 보조 링크</h2>
          <p className="mb-4 text-sm text-slate-400">
            게임 구매 전 함께 확인할 수 있는 기프트카드, 컨트롤러, 스토어 크레딧 후보입니다. 최종 가격,
            배송, 환불 조건은 판매처 페이지에서 다시 확인하세요.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <a className="rounded-lg border border-amber-400/40 bg-slate-950 p-4 hover:border-amber-300" href={buildAmazonUrl('steam gift card')} target="_blank" rel="sponsored noopener noreferrer nofollow" data-affiliate-link>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Amazon</p>
              <p className="mt-1 text-sm">Steam Gift Card</p>
            </a>
            <a className="rounded-lg border border-blue-400/40 bg-slate-950 p-4 hover:border-blue-300" href={buildCoupangUrl('플레이스테이션 기프트카드')} target="_blank" rel="sponsored noopener noreferrer nofollow" data-affiliate-link>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Coupang</p>
              <p className="mt-1 text-sm">콘솔 기프트카드</p>
            </a>
            <a className="rounded-lg border border-rose-400/40 bg-slate-950 p-4 hover:border-rose-300" href={buildAliExpressUrl('xbox controller')} target="_blank" rel="sponsored noopener noreferrer nofollow" data-affiliate-link>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">AliExpress</p>
              <p className="mt-1 text-sm">Xbox Controller</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
