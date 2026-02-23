# CLAUDE.md — 플레이스닥터 (PlaceDoctor) 개발 가이드

> 바이브코딩 시 이 파일 + BRAND.md를 항상 함께 제공할 것.
> 프롬프트 목록은 PROMPT.md 참고.

---

## 프로젝트 개요

- **서비스명:** 플레이스닥터 (PlaceDoctor)
- **한 줄 설명:** 네이버 플레이스를 AI가 진단하고, 항목별로 직접 고쳐주는 올인원 관리 도구
- **타겟:** 네이버 플레이스에 등록된 한국 소상공인 (평균 연령 53세, 99% 모바일 접속)
- **핵심 가치:** 진단만 하고 끝이 아니라, 각 항목을 AI가 바로 고쳐준다
- **라이브 URL:** https://placedoctor.vercel.app/
- **개발자:** 송효준 (1인 개발)
- **제약:** 서버비 월 5만원 이내 / 하루 4~5시간 / 사회복무 병행

---

## 핵심 컨셉: "진단 + 5개 도우미"

기존 문제: 진단만 보여주면 한 번 보고 끝 → 구독할 이유 없음
해결: **진단이 입구, 도우미가 본체** → 매달 쓸 이유가 생김

```
가게명 검색 → 원클릭 진단 (100점)
    ↓
5개 항목별 점수 + AI 도우미
    ├── 📋 기본정보 도우미 → 소개글 AI 생성
    ├── ⭐ 리뷰 도우미 → 미답변 리뷰 AI 답변
    ├── 📝 메뉴 도우미 → 메뉴 설명 AI 작성
    ├── 🔍 키워드 도우미 → 추천 키워드 + 소개글 삽입
    └── 📢 소식 도우미 → 소식 글 AI 초안
```

**구독이 유지되는 이유:**

- 새 리뷰 → 리뷰 도우미로 답변
- 메뉴 변경 → 메뉴 도우미로 설명 재작성
- 소식은 매주 올려야 함 → 소식 도우미
- 매달 재진단 → 점수 변화 추적

---

## 투표 검증 결과 (2026.02.20, 네이버 카페 18표)

```
1등 44.4% — 플레이스 관리 자체를 할 시간이 없다
2등 27.8% — 경쟁 가게보다 왜 안 뜨는지 모르겠다
3등 16.7% — 사진/메뉴 정보 업데이트
4등 11.1% — 어떤 키워드로 검색되는지 모름
꼴찌  0%  — 리뷰 답변 쓰는 거
```

**인사이트:** "다 해줘"가 니즈. 리뷰 답변은 킬러가 아니라 부가 기능.

---

## 현재 단계

```
✅ 랜딩페이지 배포 (placedoctor.vercel.app)
✅ 카페 투표 18표 수집
✅ 수동 분석 4곳 완료 (34~80점)
🔄 사장님 반응 체크 + 지불 의향 확인 중
⬜ MVP 개발 (2026.03)
```

---

## 기술 스택

```
프레임워크:    Next.js 14 (App Router) + TypeScript
스타일링:      TailwindCSS + shadcn/ui
애니메이션:    Framer Motion
폰트:         Pretendard (본문) + Noto Sans KR 700 (강조)
DB/Auth:      Supabase (PostgreSQL + Auth)
AI:           Claude API (Sonnet)
결제:         토스페이먼츠
배포:         Vercel
```

### 비용 구조 (월)

| 서비스       | 플랜       | 비용             |
| ------------ | ---------- | ---------------- |
| Vercel       | Pro        | $20 (약 2.8만원) |
| Supabase     | Free → Pro | $0~25            |
| Claude API   | 종량제     | 예상 $30~100     |
| 도메인 (.kr) | 연 2만원   | ~1,700원/월      |
| **합계**     |            | **월 3~15만원**  |

---

## 컬러 시스템

```css
:root {
  --primary: #219ebc; /* CTA, 링크, 양호 */
  --primary-dark: #023047; /* 헤드라인, 배경 */
  --accent: #ffb703; /* 점수, 배지, 보통 */
  --accent-hot: #fb8500; /* 경고, CTA hover, 부족 */
  --bg-dark: #0d1b2a; /* 다크 섹션 */
  --bg-light: #e0e1dd; /* 라이트 섹션 */
}
```

### Tailwind 설정

```typescript
colors: {
  primary: { DEFAULT: '#219EBC', dark: '#023047' },
  accent: { DEFAULT: '#FFB703', hot: '#FB8500' },
  base: { dark: '#0d1b2a', light: '#e0e1dd' },
}
fontFamily: {
  sans: ['Pretendard', 'sans-serif'],
  display: ['"Noto Sans KR"', 'sans-serif'],
}
```

### 점수별 색상 규칙

```
0~40점:   #FB8500 (오렌지) — 위험 🔴
41~70점:  #FFB703 (골드)   — 보통 🟡
71~100점: #219EBC (청록)   — 양호 🟢
```

---

## 가게 검색 UX (URL 입력 X → 가게명 검색 O)

사장님(53세)이 플레이스 URL을 모름. 가게명으로 검색해야 한다.

```
사장님이 "효창동 떡갈비" 입력
  → 네이버 검색 API로 후보 2~3개 표시
  → "이 가게 맞으세요?" 선택
  → 분석 시작
```

```typescript
// lib/scraper/searchPlace.ts
interface PlaceSearchResult {
  placeId: string;
  name: string;
  category: string;
  address: string;
  thumbnail?: string;
}

async function searchPlace(query: string): Promise<PlaceSearchResult[]> {
  // 네이버 지도 검색 API로 후보 가게 목록 반환
  // 최대 5개
}
```

---

## MVP 기능: 진단 + 5개 도우미

### 1. 진단 리포트 (무료)

가게명 검색 → 5초 분석 → 100점 만점 리포트

**5개 항목:**

| 항목        | 배점 | 분석 내용                                         |
| ----------- | ---- | ------------------------------------------------- |
| 📋 기본정보 | 15점 | 영업시간, 주소, 전화번호, 소개글                  |
| 📸 사진     | 20점 | 업체 사진 수 + 카테고리 다양성 (방문자 사진 제외) |
| ⭐ 리뷰     | 25점 | 리뷰 수, 답변률, 최근 답변 시기                   |
| 📝 메뉴     | 15점 | 메뉴 등록 + 가격 + 사진 + 설명 유무               |
| 🔍 키워드   | 15점 | 소개글 내 지역+업종+차별화 키워드                 |
| 📢 활성도   | 10점 | 최근 소식 업로드 주기                             |

### 2. 📋 기본정보 도우미 (유료)

- 소개글 분석: 현재 몇 줄인지, 키워드 포함 여부
- **AI 소개글 생성:** 가게 정보 기반으로 6줄+ 소개글 작성
- 영업시간/전화번호 누락 알림
- "복사하기" → 스마트플레이스에 붙여넣기

### 3. ⭐ 리뷰 도우미 (유료)

- 미답변 리뷰 목록 표시
- **AI 답변 생성:** 톤 선택 (🙂친근 / 🤝정중 / 😄유머) → 답변 3개 생성
- 원클릭 복사
- 부정 리뷰: 사과 + 개선 의지 + 재방문 유도 자동 포함

### 4. 📝 메뉴 도우미 (유료)

- 현재 메뉴 등록 상태 분석 (이름만/가격/사진/설명)
- **AI 메뉴 설명 작성:** 메뉴명 + 카테고리 기반으로 검색 잘 되는 설명 생성
- 대표 메뉴 사진 없으면 알림
- "복사하기" → 스마트플레이스에 붙여넣기

### 5. 🔍 키워드 도우미 (유료)

- 현재 소개글에서 키워드 추출
- 경쟁 가게 상위 노출 키워드 분석
- **추천 키워드 생성:** 지역+업종+차별화 조합
- "이 키워드를 소개글에 넣으세요" 가이드
- 키워드 포함된 소개글 AI 재작성

### 6. 📢 소식 도우미 (유료)

- 마지막 소식 업로드 시기 표시
- **AI 소식 글 초안 작성:** 가게 정보 + 계절/시기 반영
- 신메뉴, 이벤트, 계절 인사 등 템플릿 제공
- "복사하기" → 스마트플레이스 소식에 붙여넣기

---

## 수익 모델

|                 | 🆓 무료     | 💎 베이직 (월 9,900원) | 👑 프로 (월 19,900원) |
| --------------- | ----------- | ---------------------- | --------------------- |
| 진단 리포트     | 월 1회      | 무제한                 | 무제한                |
| 기본정보 도우미 | 소개글 1회  | 무제한                 | 무제한                |
| 리뷰 도우미     | 답변 3회/월 | 50회/월                | 무제한                |
| 메뉴 도우미     | ❌          | 무제한                 | 무제한                |
| 키워드 도우미   | 추천 3개    | 10개 + 소개글 재작성   | 20개 + 소개글 재작성  |
| 소식 도우미     | ❌          | 월 4편                 | 무제한                |
| 가게 수         | 1개         | 1개                    | 3개                   |
| 경쟁 비교       | ❌          | 3곳                    | 5곳                   |
| 주간 카톡 알림  | ❌          | ❌                     | ✅                    |

**무료 → 유료 전환 퍼널:**

```
무료 진단 (점수 충격)
  → 소개글 도우미 1회 체험 ("오 이거 좋네")
  → 리뷰 답변 3회 체험 ("편하다")
  → 메뉴 도우미 잠금 / 소식 도우미 잠금
  → "전부 쓰려면 월 9,900원" → 결제
```

---

## DB 스키마 (Supabase)

```sql
-- 이메일 수집 (현재 랜딩페이지)
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  category TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  kakao_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 가게
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  naver_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  naver_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 진단 리포트
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  total_score INT,
  scores JSONB,        -- {basicInfo:15, photos:20, reviews:25, menu:15, keywords:15, activity:10}
  analysis JSONB,      -- AI 분석 코멘트
  raw_data JSONB,      -- 크롤링 원본
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI 생성물 (도우미 결과물 통합)
CREATE TABLE ai_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('intro', 'review_reply', 'menu_desc', 'keyword', 'news')),
  input_data JSONB,    -- 입력 (리뷰 원문, 메뉴명 등)
  output_text TEXT,     -- AI 생성 결과
  tone TEXT,            -- friendly/professional/humorous (리뷰용)
  is_used BOOLEAN DEFAULT false,  -- 사장님이 복사했는지
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 결제
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  toss_payment_key TEXT,
  amount INT,
  plan TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API 설계

```
# 인증
POST   /api/auth/kakao          카카오 로그인
GET    /api/auth/me             현재 유저

# 가게
GET    /api/stores/search?q=    가게명 검색 (후보 목록)
POST   /api/stores              가게 등록 (선택한 가게)
GET    /api/stores              내 가게 목록

# 진단
POST   /api/diagnose            진단 실행 (크롤링 + 점수 계산)
GET    /api/reports/:storeId    리포트 목록

# 도우미 (AI 생성)
POST   /api/helper/intro        소개글 생성
POST   /api/helper/review       리뷰 답변 생성
POST   /api/helper/menu         메뉴 설명 생성
POST   /api/helper/keyword      키워드 추천 + 소개글 재작성
POST   /api/helper/news         소식 글 초안 생성

# 결제
POST   /api/payments/checkout   결제 요청
POST   /api/payments/confirm    토스 웹훅
```

---

## 크롤러 설계

```typescript
// lib/scraper/naverPlace.ts

interface PlaceData {
  name: string;
  category: string;
  address: string;
  phone: string;
  hours: string[];
  description: string; // 소개글 전문
  photos: {
    business: number; // 업체 사진 (채점 대상)
    visitor: number; // 방문자 사진 (참고용)
    categories: string[]; // 업체 사진 카테고리: 음식/내부/외부
  };
  reviews: {
    total: number;
    avgRating: number;
    ownerReplyCount: number;
    ownerReplyRate: number;
    recent: Review[]; // 최근 10개 (답변 생성용)
  };
  menus: {
    name: string;
    price?: number;
    hasPhoto: boolean;
    description?: string;
  }[];
  keywords: string[]; // 소개글에서 추출한 키워드
  lastNewsDate?: string; // 최근 소식 날짜
}
```

**크롤링 방식:** 네이버 내부 JSON API 활용 (HTML 파싱보다 안정적)
**크롤링 규칙:** UA 로테이션 / 2~5초 딜레이 / 24시간 캐싱

---

## 점수 계산 (규칙 기반, AI 불필요)

```typescript
// lib/analyzer/scoreCalculator.ts

// 📸 사진 (20점, 업체 사진만)
// 0장=0 / 1~5=8 / 6~15=14 / 16+=18 / 카테고리 2개+=+2

// ⭐ 리뷰 (25점)
// 답변률 0%=0 / ~30%=10 / ~70%=18 / 70%+=22 / 24h내 답변=+3

// 📝 메뉴 (15점)
// 미등록=0 / 이름만=5 / 가격포함=10 / 사진+설명=15

// 📋 기본정보 (15점)
// 영업시간=5 / 전화번호=5 / 주소정확=5

// 🔍 키워드 (15점)
// 소개글 없음=0 / 1~2줄=5 / 3~5줄+키워드1개=10 / 6줄++키워드2개+=15

// 📢 활성도 (10점)
// 소식없음=0 / 6개월+=2 / 3개월=4 / 1개월=7 / 1주=10
```

---

## AI 모듈

```typescript
// lib/ai/helpers.ts
// 모든 도우미가 공유하는 시스템 프롬프트

const systemPrompt = `
당신은 네이버 플레이스 최적화 전문가입니다.
소상공인 사장님(평균 53세)에게 말하듯 쉬운 한국어로 답변하세요.
IT 용어 사용 금지. 숫자로 구체적으로. 응원 톤.
`;

// 도우미별 프롬프트는 각 API route에서 추가
// 비용: 도우미 1회 호출당 $0.005~0.02
```

---

## 프로젝트 구조

```
placedoctor/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 랜딩페이지
│   ├── login/page.tsx              # 카카오 로그인
│   ├── dashboard/
│   │   ├── page.tsx                # 대시보드 (가게 목록 + 검색)
│   │   └── [storeId]/
│   │       ├── page.tsx            # 진단 리포트
│   │       ├── intro/page.tsx      # 기본정보 도우미
│   │       ├── reviews/page.tsx    # 리뷰 도우미
│   │       ├── menu/page.tsx       # 메뉴 도우미
│   │       ├── keywords/page.tsx   # 키워드 도우미
│   │       └── news/page.tsx       # 소식 도우미
│   └── api/
│       ├── subscribe/route.ts
│       ├── auth/kakao/route.ts
│       ├── stores/
│       │   ├── search/route.ts
│       │   └── route.ts
│       ├── diagnose/route.ts
│       ├── helper/
│       │   ├── intro/route.ts
│       │   ├── review/route.ts
│       │   ├── menu/route.ts
│       │   ├── keyword/route.ts
│       │   └── news/route.ts
│       └── payments/
│           ├── checkout/route.ts
│           └── confirm/route.ts
├── components/
│   ├── landing/                    # 랜딩 섹션 (기존)
│   ├── dashboard/
│   │   ├── StoreSearch.tsx         # 가게명 검색
│   │   ├── ScoreCard.tsx           # 점수 카드
│   │   ├── HelperCard.tsx          # 도우미 카드
│   │   ├── IntroHelper.tsx
│   │   ├── ReviewHelper.tsx
│   │   ├── MenuHelper.tsx
│   │   ├── KeywordHelper.tsx
│   │   └── NewsHelper.tsx
│   └── ui/                         # shadcn/ui
├── lib/
│   ├── supabase.ts
│   ├── scraper/
│   │   ├── searchPlace.ts          # 가게 검색
│   │   └── naverPlace.ts           # 플레이스 크롤링
│   ├── analyzer/
│   │   └── scoreCalculator.ts      # 점수 계산
│   └── ai/
│       └── helpers.ts              # AI 도우미 공통
├── types/index.ts
├── CLAUDE.md
├── BRAND.md
└── PROMPT.md
```

---

## 코딩 컨벤션

- TypeScript `strict: true`, `any` 금지
- 서버 컴포넌트 기본, 클라이언트는 `"use client"` 명시
- shadcn/ui 기반 커스텀
- 모바일 퍼스트 (터치 44px+, 텍스트 16px+, CTA full-width)
- 컴포넌트: PascalCase / 함수: camelCase / 상수: SCREAMING_SNAKE_CASE

### Framer Motion 공통

```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};
```

---

## 랜딩페이지 ScoreDemo (현재 라이브)

```typescript
// 업종별 샘플 데이터 (하드코딩)
const sampleData = {
  "한식집": {
    score: 45,
    items: [
      { label: "기본 정보", score: 13, max: 15 },
      { label: "사진", score: 6, max: 20 },
      { label: "리뷰 관리", score: 8, max: 25 },
      { label: "메뉴 정보", score: 10, max: 15 },
      { label: "키워드", score: 5, max: 15 },
      { label: "활성도", score: 3, max: 10 },
    ],
  },
  "카페": { score: 62, items: [...] },
  "미용실": { score: 38, items: [...] },
};
```

---

## 개발 시작 명령어

```bash
# 이미 완료된 프로젝트 세팅
npx create-next-app@latest placedoctor --typescript --tailwind --app --src-dir=false
cd placedoctor
npx shadcn@latest init
npx shadcn@latest add button input card badge accordion select
npm install framer-motion @supabase/supabase-js
npm run dev

# Phase 2 추가 패키지
npm install @anthropic-ai/sdk cheerio        # 크롤러 + AI
npm install @tosspayments/payment-sdk         # 결제
```

---

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
KAKAO_JAVASCRIPT_KEY=
```

---

## 바이브코딩 순서

### 랜딩페이지 (✅ 완료)

```
✅ 프로젝트 세팅 → Hero → Problem → ScoreDemo → Features → Pricing → FAQ → CTA → Navbar/Footer
```

### MVP (⬜ Phase 2)

```
1. ⬜ Supabase DB 스키마
2. ⬜ 카카오 로그인
3. ⬜ 가게명 검색 (네이버 API)
4. ⬜ 네이버 플레이스 크롤러
5. ⬜ 점수 계산 엔진
6. ⬜ 진단 리포트 UI
7. ⬜ 기본정보 도우미 (소개글 AI 생성)
8. ⬜ 리뷰 도우미 (AI 답변 생성)
9. ⬜ 메뉴 도우미 (메뉴 설명 AI 작성)
10. ⬜ 키워드 도우미 (추천 + 소개글 재작성)
11. ⬜ 소식 도우미 (소식 글 AI 초안)
12. ⬜ 토스페이먼츠 결제
13. ⬜ 무료/유료 기능 분기
14. ⬜ QA + 베타 출시
```
