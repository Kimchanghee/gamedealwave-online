# gamedealwave.io — Steam·PSN·Xbox 게임 할인 추적 (A-1)

> 한국·일본·미국 스토어를 통합 추적. 환율 차익으로 가장 싼 리전 자동 추천.

| 항목 | 값 |
|---|---|
| 도메인 | gamedealwave.io |
| 카테고리 | 게임 (A-1) |
| 지원 언어 | ko, en, ja (3개) |
| AWS 비용 | $5~$10/월 |
| 예상 RPM | $5~$9 |
| Stage 3 월 PV | 약 350K |
| Stage 3 월 수익 | $1,750~$3,150 |

## 데이터 소스

- **Steam Web API** (무료 공식)
- **IsThereAnyDeal API**
- **PSN/Xbox 스토어** (공개 검색 페이지 폴링)
- **환율** (B-2와 데이터 공유)

## 자동화 흐름

1. 30분 단위 가격 폴링 → DynamoDB 저장
2. 역대 최저가 비교 → 알림 트리거
3. 게임별 ISR 페이지 재생성

## SEO 페이지

- 게임별 (×3 언어)
- 시리즈·장르·태그별
- "현재 최저가 Top 100" 일배치 갱신

## 광고 배치

- 게임 상세 Native Banner ×3
- "Steam에서 구매" → Direct Link (어필리에이트 결합)
- Popunder 활성 (게이머 관용도 높음)
