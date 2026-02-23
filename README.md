# 플레이스닥터

네이버 플레이스 AI 진단 서비스. 소상공인의 네이버 플레이스 프로필을 분석하고 검색 순위 개선 방법을 알려줍니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + TypeScript
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **애니메이션**: framer-motion v12
- **인증**: Supabase Auth (카카오 로그인)
- **데이터**: localStorage (MVP) / Supabase PostgreSQL (Phase 2)

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 (한글 경로 Turbopack 버그로 --webpack 사용)
npm run dev

# 빌드
npm run build
```

`.env.local` 필요:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 프로젝트 구조

```
app/
  page.tsx                    # 랜딩 페이지
  dashboard/
    layout.tsx                # 대시보드 레이아웃 (로고+유저명)
    page.tsx                  # 메인 대시보드 (진단 폼 + 기록 리스트)
    [storeId]/page.tsx        # 상세 리포트 (ScoreGauge + 6개 ScoreCard)
  api/
    analyze/route.ts          # POST: 크롤링 + 점수 계산

components/
  landing/                    # 랜딩 페이지 섹션들
  dashboard/
    AnalyzeForm.tsx           # URL 입력 + 진단 버튼
    LoadingProgress.tsx       # 4단계 로딩 애니메이션
    ScoreGauge.tsx            # 원형 SVG 게이지
    ScoreCard.tsx             # 항목별 점수 카드 (확장형)
    StoreCard.tsx             # 가게 요약 카드

lib/
  scraper/naverPlace.ts       # 네이버 플레이스 GraphQL API 크롤러
  analyzer/scoreCalculator.ts # 100점 만점 점수 계산 엔진
  scoreUtils.ts               # 점수 색상/배지 유틸
  store.ts                    # localStorage CRUD 헬퍼

types/index.ts                # PlaceData, ScoreResult, Menu 등 타입 정의
```

## 점수 채점 기준 (100점 만점)

| 항목 | 배점 | 주요 기준 |
|------|------|-----------|
| 기본 정보 | 15점 | 영업시간, 주소, 전화번호, 소개글 |
| 사진 | 20점 | 업체 사진 장수 + 카테고리 다양성 |
| 리뷰 | 25점 | 리뷰 수 + 별점 + 사장님 답변률 |
| 메뉴 | 15점 | 등록수 + 가격 + 사진 + 설명 + 대표메뉴 설정 |
| 키워드 | 15점 | 리뷰 키워드 + 소개글 내 업종/지역 키워드 |
| 활성도 | 10점 | 소식 등록 + 최근 활동 시점 |

## 네이버 플레이스 크롤러 — GraphQL API 사용 이유

### 배경

초기 구현은 네이버 플레이스 모바일 페이지의 SSR HTML에서 `window.__APOLLO_STATE__`를 추출하는 방식이었습니다. 그러나 네이버가 SSR에서 CSR(Client-Side Rendering)로 전환하면서 HTML에 가게 데이터가 더 이상 포함되지 않게 되었습니다.

### GraphQL API 직접 호출로 전환

네이버 플레이스 내부 GraphQL API (`pcmap-api.place.naver.com/place/graphql`)를 직접 호출하는 방식으로 전환했습니다.

**장점:**
- **안정성**: HTML 파싱에 의존하지 않아 네이버 프론트엔드 변경에 영향받지 않음
- **속도**: 단일 GraphQL 요청으로 모든 데이터 획득 (기존: 5개 페이지 순차 크롤링, 총 10~25초 → 현재: 1회 요청, 1~2초)
- **정확도**: 메뉴 그룹(대표메뉴/메인메뉴/세트메뉴), 대표 뱃지, 배달 메뉴 사진 등 HTML 파싱으로 놓치던 데이터를 정확히 추출
- **비용 효율**: 네이버 서버에 대한 요청 수 감소 (5회 → 1회)

**API 스키마 (역공학):**
```graphql
PlaceDetail {
  base { name, category, address, roadAddress, phone, virtualPhone,
         microReviews, visitorReviewsTotal, visitorReviewsScore,
         businessHours { day, isDayOff, startTime, endTime, description } }
  menus { name, price, images, description, recommend, priority }
  baemin { menuGroups { name, isRepresentative,
           menus { name, price, desc, images, isRepresentative } } }
  keywords
  visitorReviews { items { id, rating, body, nickname, created, visited,
                   media { type, thumbnail }, reply { body },
                   votedKeywords { name } }, total }
  visitorReviewStats { analysis { themes { label, count } } }
}
```

**ID 매핑 이슈:**
네이버 플레이스 URL ID와 GraphQL API ID가 다를 수 있습니다. URL ID로 API 호출 실패 시 네이버 검색을 통해 올바른 API ID를 자동 매핑합니다.
