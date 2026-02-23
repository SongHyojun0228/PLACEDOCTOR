# GEMINI.md — 플레이스닥터 디자인 가이드 (Gemini CLI용)

> Gemini는 디자인·애니메이션·UI 컴포넌트 담당.
> 기능 로직·API·DB는 CLAUDE.md 참고 (Claude 담당).
> 브랜드 톤·카피는 BRAND.md 참고.

---

## 역할 분담

```
Gemini: 디자인, 애니메이션, 버튼, 카드, 트랜지션, 마이크로인터랙션, 레이아웃
Claude: 기능 로직, API, DB, 크롤러, AI 연동, 결제
```

---

## 서비스 개요

- **서비스명:** 플레이스닥터 (PlaceDoctor)
- **한 줄:** 네이버 플레이스를 AI가 진단하고 직접 고쳐주는 올인원 관리 도구
- **타겟:** 한국 소상공인 사장님 (평균 53세, 99% 모바일)
- **라이브:** https://placedoctor.vercel.app/
- **핵심 구조:** 가게명 검색 → 진단 (100점) → 5개 도우미 (AI가 고쳐줌)

---

## 기술 스택 (디자인 관련)

```
프레임워크:   Next.js 14 (App Router) + TypeScript
스타일링:     TailwindCSS + shadcn/ui
애니메이션:   Framer Motion
폰트:        Pretendard (본문) + Noto Sans KR 700 (헤드라인)
아이콘:      Lucide React
```

---

## 컬러 시스템

```css
:root {
  /* 메인 — 신뢰 + 전문성 */
  --primary:       #219EBC;   /* 밝은 청록 — CTA, 링크, 양호 상태 */
  --primary-dark:  #023047;   /* 딥 네이비 — 헤드라인, 다크 배경 */

  /* 서브 — 에너지 + 액센트 */
  --accent:        #FFB703;   /* 골드 — 점수, 배지, 보통 상태 */
  --accent-hot:    #FB8500;   /* 오렌지 — 경고, CTA hover, 위험 상태 */

  /* 베이스 */
  --bg-dark:       #0d1b2a;   /* 다크 섹션 배경 */
  --bg-light:      #e0e1dd;   /* 라이트 섹션 배경 */
}
```

### 점수별 색상

```
0~40점:   #FB8500 (오렌지) — 위험 🔴
41~70점:  #FFB703 (골드)   — 보통 🟡
71~100점: #219EBC (청록)   — 양호 🟢
```

### 감정 매핑

| 컬러 | 감정 | 용도 |
|------|------|------|
| #219EBC 청록 | 신뢰, 안심 | CTA, 양호 배지, 프로그레스 바 |
| #023047 네이비 | 권위, 안정 | 헤드라인, 다크 배경 |
| #FFB703 골드 | 성과, 기대 | 점수 숫자, 보통 배지 |
| #FB8500 오렌지 | 긴급, 주목 | 위험 배지, hover, 경고 |

---

## 타이포그래피

| 용도 | 폰트 | 크기 | 비고 |
|------|------|------|------|
| 헤드라인 | Noto Sans KR 700 | 40~48px (2.5~3rem) | |
| 서브헤드 | Pretendard SemiBold | 24~32px (1.5~2rem) | |
| 본문 | Pretendard Regular | 16~18px (1~1.125rem) | 최소 16px 필수 |
| 캡션 | Pretendard Regular | 14px (0.875rem) | |
| 점수 숫자 | Pretendard Bold | 64~80px (4~5rem) | 큰 임팩트 |

---

## UI 원칙

1. **모바일 퍼스트.** 사장님들은 폰으로 본다.
2. **카드 기반.** 한 덩어리씩 스캔 가능.
3. **여백 충분히.** 빽빽한 텍스트 금지.
4. **색으로 직관.** 숫자 안 읽어도 상태가 보여야.
5. **CTA 항상 접근 가능.** 스크롤 어디서든.
6. **터치 타겟 44px 이상.** 버튼, 링크 전부.
7. **로딩은 스켈레톤.** 빈 화면 금지.

---

## 컴포넌트 디자인 가이드

### 버튼 (CTA)

```tsx
// Primary CTA
<button className="
  bg-[#219EBC] text-white font-semibold
  px-8 py-4 rounded-lg
  hover:bg-[#FB8500] 
  active:scale-[0.98]
  transition-all duration-300
  w-full md:w-auto
  min-h-[44px]
">
  무료로 진단받기
</button>

// Secondary
<button className="
  border-2 border-[#219EBC] text-[#219EBC]
  px-6 py-3 rounded-lg
  hover:bg-[#219EBC] hover:text-white
  transition-all duration-300
">
  자세히 보기
</button>

// Ghost (도우미 카드 내)
<button className="
  text-[#219EBC] font-medium
  hover:underline underline-offset-4
  transition-all duration-200
">
  AI로 고치기 →
</button>
```

### 카드

```tsx
// 라이트 배경 위
<div className="
  bg-white rounded-xl shadow-lg
  p-6
  hover:-translate-y-1 hover:shadow-xl
  transition-all duration-300
">

// 다크 배경 위
<div className="
  bg-white/5 border border-white/10 rounded-xl
  p-6
  hover:bg-white/10
  transition-all duration-300
">
```

### 점수 카드 (진단 리포트)

```tsx
// 각 항목 점수 카드
<div className="bg-white rounded-xl p-5 shadow-md">
  <div className="flex justify-between items-center mb-3">
    <span className="text-sm font-medium text-gray-600">📸 사진</span>
    <span className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
      {score}/{max}
    </span>
  </div>
  
  {/* 프로그레스 바 */}
  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{ backgroundColor: getScoreColor(score) }}
      initial={{ width: 0 }}
      animate={{ width: `${(score/max)*100}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
  </div>
  
  {/* 도우미 링크 */}
  <button className="mt-3 text-sm text-[#219EBC] hover:underline">
    AI로 고치기 →
  </button>
</div>
```

### 배지 (상태 표시)

```tsx
// 위험
<span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FB8500]/10 text-[#FB8500] border border-[#FB8500]/20">
  부족
</span>

// 보통
<span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/20">
  보통
</span>

// 양호
<span className="px-3 py-1 rounded-full text-xs font-medium bg-[#219EBC]/10 text-[#219EBC] border border-[#219EBC]/20">
  양호
</span>
```

### 잠금 오버레이 (무료 유저용)

```tsx
<div className="relative">
  {/* 블러 처리된 콘텐츠 */}
  <div className="filter blur-sm pointer-events-none">
    {children}
  </div>
  
  {/* 오버레이 */}
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl">
    <span className="text-lg font-semibold text-[#023047] mb-2">
      베이직 구독하면 사용할 수 있어요
    </span>
    <button className="bg-[#219EBC] text-white px-6 py-3 rounded-lg hover:bg-[#FB8500] transition-colors">
      월 9,900원으로 시작하기
    </button>
  </div>
</div>
```

---

## 애니메이션 시스템 (Framer Motion)

### 기본 진입 애니메이션

```tsx
// 섹션 페이드인 + 올라오기
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

// 카드 stagger (여러 카드가 순차 등장)
const staggerContainer = {
  whileInView: {
    transition: { staggerChildren: 0.15 },
  },
};

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};
```

### 점수 카운트업 애니메이션

```tsx
// 점수 숫자가 0에서 올라가는 효과
import { useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedScore({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [target]);

  return <motion.span>{rounded}</motion.span>;
}
```

### 프로그레스 바 애니메이션

```tsx
<motion.div
  className="h-3 rounded-full"
  style={{ backgroundColor: color }}
  initial={{ width: 0 }}
  whileInView={{ width: `${percentage}%` }}
  viewport={{ once: true }}
  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
/>
```

### 도우미 카드 호버

```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300 }}
>
```

### 로딩 (분석 중)

```tsx
// 분석 중 펄스 애니메이션
<motion.div
  className="w-16 h-16 rounded-full bg-[#219EBC]/20"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

### AI 생성 중 (타이핑 효과)

```tsx
// 도우미가 텍스트 생성할 때 타이핑 느낌
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <motion.span
    animate={{ opacity: [1, 0.3, 1] }}
    transition={{ duration: 0.8, repeat: Infinity }}
  >
    AI가 작성 중...
  </motion.span>
</motion.div>
```

### 복사 완료 피드백

```tsx
// "복사하기" 클릭 후 체크마크 전환
const [copied, setCopied] = useState(false);

<button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); }}>
  <AnimatePresence mode="wait">
    {copied ? (
      <motion.span
        key="check"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        ✅ 복사됨!
      </motion.span>
    ) : (
      <motion.span key="copy">📋 복사하기</motion.span>
    )}
  </AnimatePresence>
</button>
```

### 페이지 전환

```tsx
// 대시보드 → 도우미 페이지 전환
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.3 }}
>
```

---

## 페이지별 디자인 가이드

### 대시보드 (가게 검색 + 진단)

```
┌─────────────────────────────────┐
│  🏥 플레이스닥터                  │
│                                  │
│  ┌─────────────────────────┐    │
│  │ 🔍 가게명을 검색하세요    │    │  ← 검색창 (큰 사이즈)
│  └─────────────────────────┘    │
│                                  │
│  검색 결과 (카드)                 │
│  ┌──────────┐ ┌──────────┐      │
│  │ 효창동    │ │ 효창동    │      │  ← 후보 가게 카드
│  │ 떡갈비    │ │ 갈비집    │      │
│  │ 용산구... │ │ 용산구... │      │
│  │ [이 가게] │ │ [이 가게] │      │
│  └──────────┘ └──────────┘      │
└─────────────────────────────────┘
```

### 진단 리포트

```
┌─────────────────────────────────┐
│  ← 24시 카페인코너               │
│                                  │
│        ┌──────┐                  │
│        │  80  │                  │  ← 큰 점수 (카운트업)
│        │  점  │                  │
│        └──────┘                  │
│     ████████████░░ 양호 🟢       │  ← 전체 게이지
│                                  │
│  ┌──────────────────────────┐   │
│  │ 📋 기본정보    13/15  🟢  │   │
│  │ ██████████████░░         │   │
│  │ AI로 고치기 →            │   │  ← 도우미 링크
│  ├──────────────────────────┤   │
│  │ 📸 사진       20/20  🟢  │   │
│  │ ████████████████████     │   │
│  ├──────────────────────────┤   │
│  │ ⭐ 리뷰       18/25  🟡  │   │
│  │ ██████████████░░░░░░     │   │
│  │ AI로 고치기 →            │   │
│  ├──────────────────────────┤   │
│  │ 📝 메뉴       15/15  🟢  │   │
│  │ ████████████████████     │   │
│  ├──────────────────────────┤   │
│  │ 🔍 키워드      5/15  🔴  │   │
│  │ ██████░░░░░░░░░░░░░░     │   │
│  │ AI로 고치기 →            │   │
│  ├──────────────────────────┤   │
│  │ 📢 활성도      7/10  🟡  │   │
│  │ ██████████████░░░░░░     │   │
│  │ AI로 고치기 →            │   │
│  └──────────────────────────┘   │
│                                  │
│  💡 이것만 하세요!               │
│  1. 소개글에 '신촌 24시 카페' 추가│
│  2. 미답변 리뷰 19개 답변 달기    │
│  3. 차별화 키워드 '작업하기 좋은'  │
└─────────────────────────────────┘
```

### 도우미 페이지 (예: 리뷰 도우미)

```
┌─────────────────────────────────┐
│  ← 리뷰 도우미                   │
│                                  │
│  미답변 리뷰 19개                 │
│                                  │
│  ┌──────────────────────────┐   │
│  │ ⭐⭐⭐⭐⭐ 김OO            │   │
│  │ "김치찌개 진짜 맛있었어요    │   │
│  │  집밥 느낌이라 좋았습니다"   │   │
│  │                            │   │
│  │ 톤: 🙂친근  🤝정중  😄유머 │   │  ← 톤 선택
│  │                            │   │
│  │ [답변 생성하기]             │   │  ← CTA
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 💬 생성된 답변              │   │
│  │                            │   │
│  │ "맛있게 드셨다니 정말       │   │
│  │  기뻐요! 😊 김치찌개는      │   │
│  │  저희 할머니 레시피예요.    │   │
│  │  다음엔 된장찌개도 한번     │   │
│  │  드셔보세요~"              │   │
│  │                            │   │
│  │        [📋 복사하기]        │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 절대 하지 않는 것 (디자인)

- ❌ 보라색 그라데이션 (AI 서비스 클리셰)
- ❌ 로봇/AI 일러스트 (사장님에게 거리감)
- ❌ 영어 헤드라인
- ❌ 14px 미만 텍스트
- ❌ 빽빽한 텍스트 블록
- ❌ 이모지: 🔥💪🚀💥⚡ (스타트업 감성)
- ❌ 과도한 애니메이션 (3초 이상 지속)
- ❌ 자동 재생 동영상
- ❌ 터치 타겟 44px 미만