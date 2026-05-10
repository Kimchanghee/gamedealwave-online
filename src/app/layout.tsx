import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'GameDealWave — 글로벌 게임 할인 + 지역가 비교',
  description: 'Steam·Epic·GOG·PlayStation·Nintendo 글로벌 할인 모니터링. 한국·미국·아르헨티나·터키 지역가 비교.',
  keywords: ['스팀 할인', 'Steam sale', 'Epic Games', 'GOG', '게임 할인', '지역가', 'cdkeys', 'isthereanydeal', 'game deals'],
  metadataBase: new URL('https://gamedealwave.online'),
  alternates: {
    canonical: '/',
    languages: { ko: '/ko', en: '/en', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://gamedealwave.online',
    siteName: 'GameDealWave',
    title: 'GameDealWave — 글로벌 게임 할인',
    description: 'Steam·Epic·GOG 글로벌 할인 모니터링 + 지역가 비교',
  },
  twitter: { card: 'summary_large_image', title: 'GameDealWave', description: '글로벌 게임 할인' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                { '@type': 'Organization', '@id': 'https://gamedealwave.online#org', name: 'GameDealWave', url: 'https://gamedealwave.online' },
                { '@type': 'WebSite', '@id': 'https://gamedealwave.online#site', url: 'https://gamedealwave.online', name: 'GameDealWave', inLanguage: 'ko-KR', publisher: { '@id': 'https://gamedealwave.online#org' } },
                { '@type': 'WebApplication', name: 'GameDealWave', applicationCategory: 'GameApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
              ],
            }),
          }}
        />
        <script
          async
          type="text/javascript"
          src="//pl8b25a8d4114cc5625a03b4c377cf9066.profitableratecpm.com/8b25a8d4114cc5625a03b4c377cf9066/invoke.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
