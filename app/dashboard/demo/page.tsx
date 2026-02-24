"use client";

/**
 * 블로그 캡처용 데모 페이지
 * /dashboard/demo 접속 시 가상의 가게 데이터로 리포트 화면을 렌더링합니다.
 * 캡처 후 이 파일을 삭제하거나 배포에서 제외하세요.
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import ScoreCard from "@/components/dashboard/ScoreCard";
import type { PlaceData, ScoreResult } from "@/types";

/* ────── 가상 PlaceData ────── */

const MOCK_PLACE_DATA: PlaceData = {
  name: "마포 꿀돼지 삼겹살",
  category: "삼겹살,고기,맛집",
  address: "서울 마포구 와우산로 112",
  lat: 37.5536,
  lng: 126.9265,
  phone: "02-1234-5678",
  hours: [
    "매일 11:30 - 22:00",
    "브레이크타임 15:00 - 17:00",
    "일요일 정기휴무",
  ],
  description:
    "마포에서 20년째 운영 중인 삼겹살 전문점입니다.",
  introduction:
    "마포에서 20년째 운영 중인 삼겹살 전문점입니다.",
  photos: {
    business: 8,
    visitor: 142,
    categories: ["음식", "내부", "메뉴판"],
  },
  reviews: {
    total: 287,
    avgRating: 4.2,
    ownerReplyRate: 0.12,
    recent: [
      {
        author: "맛집탐험가",
        rating: 5,
        content:
          "삼겹살이 정말 두툼하고 맛있어요! 직원분들도 친절하시고 분위기도 좋습니다. 다음에 또 올게요!",
        hasPhoto: true,
        ownerReply: null,
        date: "2025-01-15",
      },
      {
        author: "마포주민",
        rating: 4,
        content:
          "고기 질은 좋은데 대기 시간이 좀 길어요. 예약 시스템이 있으면 좋겠어요.",
        hasPhoto: false,
        ownerReply: null,
        date: "2025-01-10",
      },
      {
        author: "직장인A",
        rating: 3,
        content:
          "점심에 갔는데 반찬 리필이 느려서 아쉬웠어요. 고기 자체는 괜찮습니다.",
        hasPhoto: false,
        ownerReply: null,
        date: "2025-01-05",
      },
    ],
  },
  menus: [
    {
      name: "생삼겹살",
      price: 16000,
      description: "국내산 냉장 삼겹살 200g",
      hasPhoto: true,
      group: "대표메뉴",
      isRepresentative: true,
    },
    {
      name: "양념갈비",
      price: 18000,
      description: "특제 양념 돼지갈비 200g",
      hasPhoto: true,
      group: "대표메뉴",
      isRepresentative: true,
    },
    {
      name: "된장찌개",
      price: 8000,
      description: null,
      hasPhoto: false,
      group: "사이드",
      isRepresentative: false,
    },
    {
      name: "냉면",
      price: 7000,
      description: null,
      hasPhoto: false,
      group: "사이드",
      isRepresentative: false,
    },
  ],
  keywords: ["삼겹살", "마포맛집", "고기맛집", "두꺼운삼겹살", "회식장소"],
  lastUpdate: "2025-01-18T10:30:00Z",
  feeds: [
    {
      title: "신년 이벤트",
      description: "1월 한 달 생맥주 무료",
      category: "이벤트",
      date: "2025-01-02",
      hasMedia: true,
    },
  ],
};

/* ────── 가상 ScoreResult (총 62점) ────── */

const MOCK_SCORE_RESULT: ScoreResult = {
  total: 62,
  breakdown: {
    basicInfo: 11,
    photos: 10,
    reviews: 18,
    menu: 10,
    keywords: 8,
    activity: 5,
  },
  details: {
    basicInfo: {
      score: 11,
      max: 15,
      status: "warning",
      strengths: [
        "전화번호, 주소, 영업시간이 모두 등록되어 있어요",
        "브레이크타임 정보까지 상세하게 작성했어요",
      ],
      improvements: [
        "소개글이 1줄로 너무 짧아요 — 가게 특징, 대표 메뉴, 위치 등을 포함해 3~5줄로 늘려보세요",
        "가게 소개에 '마포 삼겹살' 같은 지역+업종 키워드를 넣으면 검색에 유리해요",
      ],
    },
    photos: {
      score: 10,
      max: 20,
      status: "warning",
      strengths: [
        "방문자 사진이 142장으로 충분해요",
      ],
      improvements: [
        "업체 사진이 8장뿐이에요 — 최소 15장 이상 등록하면 점수가 크게 올라요",
        "음식, 내부, 외부, 메뉴판 카테고리별로 골고루 등록해보세요",
        "메뉴 사진이 없는 항목(된장찌개, 냉면)에도 사진을 추가해보세요",
      ],
    },
    reviews: {
      score: 18,
      max: 25,
      status: "warning",
      strengths: [
        "리뷰 287개로 리뷰 수 자체는 충분해요",
        "평점 4.2로 안정적인 편이에요",
      ],
      improvements: [
        "사장님 답변률이 12%로 동네 평균(60%)보다 많이 낮아요",
        "최근 리뷰 3건 모두 미답변 상태예요 — 24시간 내 답변하면 재방문율이 올라요",
        "부정 리뷰에도 정중하게 답변하면 다른 손님에게 좋은 인상을 줘요",
      ],
    },
    menu: {
      score: 10,
      max: 15,
      status: "warning",
      strengths: [
        "대표 메뉴 2개가 설정되어 있어요",
        "가격 정보가 모두 등록되어 있어요",
      ],
      improvements: [
        "메뉴 설명이 없는 항목이 있어요 — 된장찌개, 냉면에 한 줄 설명을 추가해보세요",
        "사이드 메뉴에도 사진을 등록하면 주문 전환율이 올라요",
      ],
    },
    keywords: {
      score: 8,
      max: 15,
      status: "warning",
      strengths: [
        "리뷰에서 '삼겹살', '마포맛집' 등 핵심 키워드가 자연스럽게 언급되고 있어요",
      ],
      improvements: [
        "소개글에 '마포구 삼겹살' 같은 지역+업종 조합 키워드가 없어요",
        "소개글에 '회식', '모임', '단체석' 같은 상황 키워드를 추가해보세요",
        "경쟁 가게 대비 '숯불삼겹살', '생고기' 같은 차별화 키워드가 부족해요",
      ],
    },
    activity: {
      score: 5,
      max: 10,
      status: "warning",
      strengths: [
        "소식(피드)이 1건 등록되어 있어요",
      ],
      improvements: [
        "소식을 주 1회 이상 올리면 검색 노출이 크게 올라요",
        "마지막 소식이 1월 초예요 — 최신 이벤트나 신메뉴 소식을 올려보세요",
      ],
    },
  },
};

/* ────── AI 종합 분석 코멘트 ────── */

const MOCK_AI_COMMENT = `📊 마포구 삼겹살 상권 데이터 분석
마포 꿀돼지 삼겹살은 리뷰 287개, 평점 4.2로 마포구 삼겹살 업종 내 리뷰 볼륨 기준 상위 30% 수준입니다. 그러나 총점 62점은 해당 지역 동종 업계 상위 10% 매장 평균(78점)과 16점 차이가 있으며, 네이버 알고리즘의 '매장 활성도 지수'에서 감점 요인이 집중되어 있어 검색 노출 순위가 최적 상태 대비 약 40% 낮게 산정되고 있을 것으로 분석됩니다.

🚨 네이버 검색 노출 감점 요인 분석
- **리뷰 답글률 12%**: 네이버 알고리즘은 사장님 답글률을 매장 운영 활성도의 핵심 지표로 평가합니다. 마포구 삼겹살 상위 10% 매장의 평균 답글률은 68%이며, 현재 12%는 알고리즘이 '비활성 매장'으로 분류할 수 있는 임계치(20%) 이하입니다. 이는 동일 검색어 내 노출 순위를 2~5단계 하락시키는 요인입니다.
- **업체 사진 8장**: 네이버 플레이스에서 사진 콘텐츠는 고객 체류 시간과 직결됩니다. 업체 사진이 15장 이상인 매장은 8장 이하 매장 대비 평균 체류 시간이 2.3배 길며, 체류 시간은 알고리즘의 '콘텐츠 품질 점수'에 반영됩니다.

💡 최우선 개선 액션 플랜
- **오늘 할 일**: 미답변 리뷰 3건에 각각 2~3문장의 맞춤 답변을 작성하세요. 리뷰 내용 중 구체적 메뉴명이나 경험을 언급하면 알고리즘이 '고품질 답글'로 인식하여 활성도 가산점이 추가됩니다.
- **이번 주 할 일**: 업체 사진을 최소 7장 추가 등록하세요. 촬영 우선순위는 ①고기 클로즈업(불판 위) ②매장 내부 전경 ③좌석 배치입니다. 이 3가지 카테고리가 고객 체류 시간에 가장 큰 영향을 미칩니다.

📍 상권 입지 분석
마포구 와우산로는 홍대입구역(도보 10분)과 상수역(도보 7분) 사이의 상권으로, 20~30대 유동인구 비율이 높은 지역입니다. 이 입지에서 소비자의 실제 검색 패턴은 "홍대 삼겹살", "상수역 고기집", "와우산로 맛집" 순으로 검색량이 높습니다. 현재 소개글에 지역명이 '마포'만 포함되어 있어 "홍대", "상수역" 관련 검색에서 연관도 점수가 낮습니다. 저녁 시간대(18~21시)에 20대 모임·회식 수요가 집중되므로, 소식(피드)에 "단체석 예약 가능" 콘텐츠를 주 1회 등록하면 해당 시간대 검색 노출이 개선됩니다.

🎁 타겟 지역 맞춤 검색어 팁
- **"홍대 삼겹살 맛집"** → 소개글 첫 줄에 삽입. 월간 검색량 대비 등록 매장 수가 적어 경쟁도가 낮은 키워드입니다.
- **"상수역 고기집 단체석"** → 메뉴 설명 또는 소식에 활용. 4인 이상 모임 검색 시 전환율이 높은 롱테일 키워드입니다.
- **"마포구 회식 장소 추천"** → 소식(피드)에 "회식 코스 안내" 콘텐츠로 등록. 직장인 점심·저녁 수요를 정확히 타겟합니다.`;

/* ────── 경쟁 가게 비교 테이블 (하드코딩) ────── */

function MockCompetitorTable() {
  const rows = [
    { label: "총점", my: "62점", a: "78점", b: "55점" },
    { label: "리뷰 수", my: "287개", a: "412개", b: "163개" },
    { label: "평점", my: "4.2", a: "4.5", b: "3.9" },
    { label: "답변률", my: "12%", a: "85%", b: "5%" },
    { label: "사진 수", my: "8장", a: "32장", b: "4장" },
    { label: "소개글", my: "42자", a: "180자", b: "28자" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.35 }}
      className="mt-8"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <h2 className="text-sm font-semibold text-gray-900">경쟁 가게 비교</h2>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
          2곳
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[360px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-500">
                항목
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-primary-brand">
                마포 꿀돼지 삼겹살
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-600">
                <div>A 삼겹살</div>
                <div className="text-xs font-normal text-gray-400">350m</div>
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-600">
                <div>B 식당</div>
                <div className="text-xs font-normal text-gray-400">520m</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-gray-50">
                <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                  {row.label}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-center font-semibold text-gray-900">
                  {row.my}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-center text-gray-700">
                  {row.a}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-center text-gray-700">
                  {row.b}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI 인사이트 */}
      <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            🏪 경쟁 가게 분석
          </p>
          <div className="space-y-2">
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="font-medium text-gray-800">A 삼겹살:</span>{" "}
              <span className="text-gray-600">
                리뷰 답변률 85%로 고객 관리가 뛰어나고, 사진이 32장으로
                시각적으로 매력적인 프로필을 갖추고 있어요.
              </span>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="font-medium text-gray-800">B 식당:</span>{" "}
              <span className="text-gray-600">
                전반적으로 관리가 부족해요. 사장님 가게가 B 식당보다는 확실히
                잘하고 계세요.
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            💪 내가 이기고 있는 점
          </p>
          <ul className="space-y-1">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 text-emerald-500">✓</span>
              B 식당보다 리뷰 수, 평점, 사진 수 모두 앞서고 있어요
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 text-emerald-500">✓</span>
              대표 메뉴 설정과 가격 정보가 A 삼겹살보다 깔끔해요
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            📋 따라잡기 액션 플랜
          </p>
          <ol className="space-y-1">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 shrink-0 text-xs font-bold text-primary-brand">
                1.
              </span>
              A 삼겹살의 답변률(85%)을 벤치마크해서, 이번 주 미답변 리뷰부터
              답변 시작하기
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 shrink-0 text-xs font-bold text-primary-brand">
                2.
              </span>
              업체 사진을 A 삼겹살 수준(32장)까지 늘리기 — 특히 고기 클로즈업,
              불판 위 사진 추가
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 shrink-0 text-xs font-bold text-primary-brand">
                3.
              </span>
              소개글을 180자 이상으로 보강하여 검색 키워드 노출 늘리기
            </li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
}

/* ────── 페이지 본체 ────── */

const DETAIL_KEYS = [
  "basicInfo",
  "photos",
  "reviews",
  "menu",
  "keywords",
  "activity",
] as const;

export default function DemoPage() {
  const placeData = MOCK_PLACE_DATA;
  const scoreResult = MOCK_SCORE_RESULT;

  const repMenus = placeData.menus.filter((m) => m.isRepresentative);
  const displayMenus =
    repMenus.length > 0 ? repMenus : placeData.menus.slice(0, 5);

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return price.toLocaleString("ko-KR") + "원";
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      {/* 캡처용 안내 배너 — 캡처 시 브라우저 dev tools로 숨기세요 */}
      <div className="mb-6 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
        블로그 캡처용 데모 페이지입니다 (가상 데이터)
      </div>

      {/* 상단: 가게명 + 대형 게이지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm md:flex-row md:justify-between md:px-10"
      >
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">{placeData.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {placeData.name}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{placeData.address}</p>
        </div>
        <ScoreGauge score={scoreResult.total} size={180} />
      </motion.div>

      {/* 기본 정보 + 대표 메뉴 */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            📋 기본 정보
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">전화</dt>
              <dd className="text-gray-700">{placeData.phone}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">영업</dt>
              <dd className="text-gray-700">
                {placeData.hours.map((h, i) => (
                  <p key={i}>{h}</p>
                ))}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">소개</dt>
              <dd className="line-clamp-3 text-gray-700">
                {placeData.description}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">사진</dt>
              <dd className="text-gray-700">
                업체 {placeData.photos.business}장 · 방문자{" "}
                {placeData.photos.visitor}장
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">리뷰</dt>
              <dd className="text-gray-700">
                {placeData.reviews.total}개
                <span className="ml-1 text-gray-400">
                  (평점 {placeData.reviews.avgRating.toFixed(1)})
                </span>
              </dd>
            </div>
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            🍽️ 대표 메뉴
          </h2>
          <ul className="space-y-2">
            {displayMenus.map((menu, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-800">
                    {menu.name}
                  </span>
                  {menu.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {menu.description}
                    </p>
                  )}
                </div>
                {menu.price && (
                  <span className="shrink-0 text-sm font-semibold text-primary-brand">
                    {formatPrice(menu.price)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* 키워드 태그 (정적) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">🔍 키워드 분석</h2>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
            현재 {placeData.keywords.length}개
          </span>
        </div>
        <p className="mb-2 text-xs text-gray-400">리뷰에서 추출된 키워드</p>
        <div className="flex flex-wrap gap-1.5">
          {placeData.keywords.map((kw, i) => (
            <span
              key={i}
              className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-primary-brand"
            >
              {kw}
            </span>
          ))}
        </div>
      </motion.div>

      {/* 항목별 상세 카드 */}
      <div className="mt-8 space-y-3">
        {DETAIL_KEYS.map((key, i) => (
          <ScoreCard
            key={key}
            categoryKey={key}
            detail={scoreResult.details[key]}
            delay={0.3 + i * 0.1}
          />
        ))}
      </div>

      {/* AI 종합 분석 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h2 className="text-sm font-semibold text-gray-900">AI 종합 분석</h2>
        </div>
        <div className="space-y-3">
          {MOCK_AI_COMMENT.split("\n\n").map((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return null;
            const isHeader = /^[📊🔧💪🔍📸⭐🍽️📢📋🚨💡📍🎁]/.test(trimmed);
            if (isHeader) {
              const [first, ...rest] = trimmed.split("\n");
              return (
                <div key={i}>
                  <p className="mb-1 text-sm font-semibold text-gray-800">
                    {first}
                  </p>
                  {rest.length > 0 && (
                    <div className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {rest.join("\n")}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <p
                key={i}
                className="whitespace-pre-line text-sm leading-relaxed text-gray-600"
              >
                {trimmed}
              </p>
            );
          })}
        </div>
      </motion.div>

      {/* 리뷰 답변 (정적 목업) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-8"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h2 className="text-sm font-semibold text-gray-900">리뷰 답변</h2>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            미답변 3개
          </span>
        </div>
        <div className="space-y-3">
          {placeData.reviews.recent.map((review, i) => {
            const stars =
              "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            return (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {review.author}
                  </span>
                  <span className="text-sm text-yellow-500">{stars}</span>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <p className="mb-3 text-sm leading-relaxed text-gray-600">
                  {review.content}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {["😊 친근", "🤝 정중", "😄 유머"].map((t, j) => (
                    <span
                      key={j}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        j === 0
                          ? "bg-primary-brand text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                  <Button
                    size="sm"
                    className="ml-auto cursor-pointer rounded-lg bg-primary-brand px-4 text-xs text-white hover:bg-primary-brand/80"
                  >
                    답변 생성
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 경쟁 가게 비교 (하드코딩) */}
      <MockCompetitorTable />

      {/* 하단 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Button
          variant="outline"
          className="h-12 flex-1 cursor-pointer rounded-xl border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          대시보드로 돌아가기
        </Button>
        <Button className="h-12 flex-1 cursor-pointer rounded-xl bg-primary-brand text-white hover:bg-primary-brand/80">
          다시 진단하기
        </Button>
      </motion.div>
    </div>
  );
}
