import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string; appid: string }>;
}

interface SteamPriceData {
  name: string;
  short_description?: string;
  header_image?: string;
  developers?: string[];
  publishers?: string[];
  release_date?: { date: string };
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  is_free?: boolean;
}

const REGIONS = [
  { cc: 'us', name: 'US', flag: '🇺🇸' },
  { cc: 'kr', name: 'Korea', flag: '🇰🇷' },
  { cc: 'jp', name: 'Japan', flag: '🇯🇵' },
  { cc: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { cc: 'tr', name: 'Turkey', flag: '🇹🇷' },
];

async function fetchSteamPriceForRegion(appId: string, cc: string): Promise<SteamPriceData | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${cc}&filters=price_overview,basic`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    return data[appId]?.success ? data[appId].data : null;
  } catch {
    return null;
  }
}

async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.rates || {};
  } catch {
    return { KRW: 1400, JPY: 148, ARS: 1000, TRY: 38 };
  }
}

const CURRENCY_TO_USD: Record<string, string> = {
  KRW: 'KRW', JPY: 'JPY', USD: 'USD', ARS: 'ARS', TRY: 'TRY', EUR: 'EUR',
};

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { appid } = await params;
  const data = await fetchSteamPriceForRegion(appid, 'us').catch(() => null);
  if (!data) return {};
  return {
    title: `${data.name} — Best regional price | GameDealWave`,
    description: `Compare ${data.name} prices across Steam regions (US, KR, JP, AR, TR) and find the cheapest with auto currency conversion.`,
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { locale, appid } = await params;
  setRequestLocale(locale);

  const [usData, ...regional] = await Promise.all([
    fetchSteamPriceForRegion(appid, 'us'),
    ...REGIONS.slice(1).map((r) => fetchSteamPriceForRegion(appid, r.cc)),
  ]);
  const allRegional = [usData, ...regional];

  if (!usData) notFound();

  const rates = await fetchExchangeRates();

  // 환율로 환산해서 가장 싼 리전 찾기
  const enriched = REGIONS.map((r, i) => {
    const data = allRegional[i];
    const price = data?.price_overview;
    if (!price) return null;
    const finalCents = price.final;
    const localCurrency = price.currency;
    const localFinal = finalCents / 100;
    // USD 환산: USD/local rate inverse
    const rateToUsd = localCurrency === 'USD' ? 1 : 1 / (rates[CURRENCY_TO_USD[localCurrency] || localCurrency] || 1);
    const usdFinal = localFinal * rateToUsd;
    const krwFinal = usdFinal * (rates['KRW'] || 1400);
    return {
      ...r,
      data,
      price,
      localFinal,
      usdFinal,
      krwFinal,
    };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const cheapest = enriched.reduce((best, cur) => (cur.usdFinal < best.usdFinal ? cur : best), enriched[0]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href={`/${locale}`} className="text-2xl font-bold">
            <span className="text-blue-400">GameDeal</span>Wave
          </Link>
        </div>
      </header>

      <section className="container mx-auto max-w-6xl px-4 py-8">
        {usData.header_image && (
          <img src={usData.header_image} alt={usData.name} className="w-full max-w-2xl rounded-xl shadow-2xl" />
        )}
        <h1 className="mt-6 text-3xl font-bold">{usData.name}</h1>
        <div className="mt-2 text-sm text-slate-400">
          {usData.developers?.join(', ')} · {usData.release_date?.date}
        </div>
        <p className="mt-4 max-w-3xl text-slate-300">{usData.short_description}</p>

        <h2 className="mt-10 mb-4 text-xl font-semibold">🌍 리전별 가격 비교</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-3 text-left">Region</th>
                <th className="p-3 text-right">현지 가격</th>
                <th className="p-3 text-right">≈ USD</th>
                <th className="p-3 text-right">≈ KRW</th>
                <th className="p-3 text-right">할인</th>
                <th className="p-3 text-center">최저가</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((r) => (
                <tr key={r.cc} className={`border-t border-slate-800 ${r.cc === cheapest.cc ? 'bg-emerald-900/20' : ''}`}>
                  <td className="p-3 font-medium">{r.flag} {r.name}</td>
                  <td className="p-3 text-right font-mono">{r.price.final_formatted}</td>
                  <td className="p-3 text-right font-mono text-slate-400">${r.usdFinal.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-slate-400">₩{Math.round(r.krwFinal).toLocaleString('ko-KR')}</td>
                  <td className="p-3 text-right">
                    {r.price.discount_percent > 0 && (
                      <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold">-{r.price.discount_percent}%</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {r.cc === cheapest.cc && <span className="text-emerald-400 font-bold">★ Cheapest</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl bg-emerald-900/30 border border-emerald-700 p-5">
          <h3 className="text-emerald-400 font-semibold">💰 가성비 추천</h3>
          <p className="mt-1 text-slate-300">
            <strong>{cheapest.flag} {cheapest.name}</strong> 리전이 가장 저렴합니다. <br />
            현지 가격: <strong>{cheapest.price.final_formatted}</strong> (≈ ₩{Math.round(cheapest.krwFinal).toLocaleString('ko-KR')})
          </p>
          <p className="mt-2 text-xs text-slate-500">
            ※ 일부 리전은 VPN 우회 시 Steam 약관 위반 가능. 본인 책임 하에.
          </p>
        </div>

        <a
          href={`https://store.steampowered.com/app/${appid}/`}
          target="_blank"
          rel="noopener noreferrer sponsored nofollow"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 hover:bg-blue-700 font-medium"
         data-affiliate-link>
          Steam에서 보기
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </section>
    </main>
  );
}
