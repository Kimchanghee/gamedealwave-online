import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const deals = await loadFeatured();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-blue-400">GameDeal</span>Wave
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href={`/${locale}/steam`} className="hover:text-blue-400">Steam</Link>
            <Link href={`/${locale}/psn`} className="hover:text-blue-400">PSN</Link>
            <Link href={`/${locale}/xbox`} className="hover:text-blue-400">Xbox</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-950 to-slate-950 py-10">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Steam·PSN·Xbox 통합 할인 + 환차익</h1>
          <p className="mt-3 text-slate-400">한국·일본·미국 리전 가격을 자동 비교. 환율 적용 후 가장 싼 리전 추천.</p>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-semibold">🔥 오늘의 최저가</h2>
        {deals.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-slate-500">
            데이터 로딩 중... (build 시 fetch-deals 실행)
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {deals.slice(0, 20).map((d) => (
              <Link
                key={d.steamAppId}
                href={`/${locale}/game/${d.steamAppId}`}
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
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
