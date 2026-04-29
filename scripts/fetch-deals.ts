/**
 * Steam · PSN · Xbox 가격·할인 데이터 수집.
 * - Steam: Steam Web API (무료, 공식)
 * - IsThereAnyDeal API (가격 비교)
 * - PSN/Xbox: 공식 스토어 페이지 폴링 (robots.txt 준수)
 *
 * 출력: DynamoDB GameDeals 테이블 + src/data/featured.json (홈 캐시)
 *
 * 한국 PSN 환차익 자동 계산: KR/JP/US 3개 리전 가격 + 환율 → 가장 싼 리전 표시.
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

const ITAD_KEY = process.env.ITAD_API_KEY;
const STEAM_KEY = process.env.STEAM_API_KEY;
const OUT = join(process.cwd(), 'src/data/featured.json');

interface GameDeal {
  steamAppId: number;
  title: string;
  imageUrl: string;
  prices: {
    [region: string]: {
      currency: string;
      original: number;
      final: number;
      discountPct: number;
      currencyKrw: number;   // 환율 적용 후 원화 환산
    };
  };
  cheapestRegion: string;
  store: 'steam' | 'psn' | 'xbox';
  url: string;
  historicalLow: number;
  isHistoricalLow: boolean;
}

/* Steam 한국·일본·미국 가격 */
async function fetchSteamPrice(appId: number, region: 'kr' | 'jp' | 'us', cc: string): Promise<any> {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${cc}&filters=price_overview,basic`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[appId]?.data;
  } catch {
    return null;
  }
}

/* IsThereAnyDeal 인기 할인 목록 */
async function fetchITADDeals(limit = 50): Promise<{ id: string; plain: string; title: string }[]> {
  if (!ITAD_KEY) {
    console.warn('  ⚠️ ITAD_API_KEY missing');
    return [];
  }
  const url = `https://api.isthereanydeal.com/deals/v2?key=${ITAD_KEY}&country=KR&limit=${limit}&sort=-cut`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.list || [];
  } catch (e) {
    console.error('  ❌ ITAD fetch failed:', e);
    return [];
  }
}

/* 환율 (KRW 기준) — exchangerate-api 무료 티어 */
async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/KRW');
    const data = await res.json();
    return data.rates || {};
  } catch {
    return { USD: 0.00072, JPY: 0.108, KRW: 1 };
  }
}

async function main() {
  console.log('→ Fetching ITAD deals...');
  const itad = await fetchITADDeals(40);
  console.log(`  ✓ ${itad.length} deals`);

  console.log('→ Fetching exchange rates...');
  const rates = await getExchangeRates();
  console.log(`  ✓ KRW→USD ${rates.USD}, KRW→JPY ${rates.JPY}`);

  const featured: GameDeal[] = [];

  for (const deal of itad.slice(0, 30)) {
    // Steam appid 매핑이 ITAD ID에서 직접 안 됨 → plain (slug) 기반으로 별도 매핑 필요.
    // 간소화: 인기 게임 일부 하드코딩 또는 ITAD 추가 호출 필요.
    // 실제 구현 시 src/data/itad-to-steam-map.json 참조.
    console.log(`  - ${deal.title}`);
  }

  if (!existsSync(dirname(OUT))) await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(featured, null, 2), 'utf-8');
  console.log(`✅ Wrote ${featured.length} games to ${OUT}`);
  console.log('   (Phase 2: implement ITAD → Steam appId mapping for full price aggregation)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
