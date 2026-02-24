"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import ScoreCard from "@/components/dashboard/ScoreCard";
import ReviewReplySection from "@/components/dashboard/ReviewReplySection";
import CompetitorSection from "@/components/dashboard/CompetitorSection";
import KeywordSection from "@/components/dashboard/KeywordSection";
import { getStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { StoredStore } from "@/lib/store";
import type { Plan } from "@/types";

const DETAIL_KEYS = [
  "basicInfo",
  "photos",
  "reviews",
  "menu",
  "keywords",
  "activity",
] as const;

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<StoredStore | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    const data = getStore(storeId);
    if (data) {
      setStore(data);
    } else {
      setNotFound(true);
    }

    async function loadPlan() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.plan) setPlan(data.plan as Plan);
    }
    loadPlan();
  }, [storeId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-4 text-lg text-gray-500">
          진단 데이터를 찾을 수 없습니다.
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="mt-6 cursor-pointer rounded-xl bg-primary-brand px-6 text-white hover:bg-primary-brand/80"
        >
          대시보드로 돌아가기
        </Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-3 w-3 rounded-full bg-primary-brand"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const { scoreResult, placeData } = store;

  const repMenus = placeData.menus.filter((m) => m.isRepresentative);
  const displayMenus = repMenus.length > 0 ? repMenus : placeData.menus.slice(0, 5);

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return price.toLocaleString("ko-KR") + "원";
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
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

      {/* 기본 정보 + 대표 메뉴 + 키워드 */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* 기본 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-900">📋 기본 정보</h2>
          <dl className="space-y-2.5 text-sm">
            {placeData.phone && (
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-gray-400">전화</dt>
                <dd className="text-gray-700">{placeData.phone}</dd>
              </div>
            )}
            {placeData.hours.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-gray-400">영업</dt>
                <dd className="text-gray-700">
                  {placeData.hours.slice(0, 3).map((h, i) => (
                    <p key={i}>{h}</p>
                  ))}
                </dd>
              </div>
            )}
            {placeData.description && (
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-gray-400">소개</dt>
                <dd className="line-clamp-3 text-gray-700">{placeData.description}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">사진</dt>
              <dd className="text-gray-700">
                업체 {placeData.photos.business}장 · 방문자 {placeData.photos.visitor}장
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-gray-400">리뷰</dt>
              <dd className="text-gray-700">
                {placeData.reviews.total}개
                {placeData.reviews.avgRating > 0 && (
                  <span className="ml-1 text-gray-400">
                    (평점 {placeData.reviews.avgRating.toFixed(1)})
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* 대표 메뉴 */}
        {displayMenus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              🍽️ {repMenus.length > 0 ? "대표 메뉴" : "메뉴"}
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
        )}
      </div>

      {/* 키워드 분석 */}
      <KeywordSection
        placeData={placeData}
        scoreResult={scoreResult}
        plan={plan}
      />

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

      {/* AI 분석 코멘트 */}
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
        {store.aiComment ? (
          <div className="space-y-3">
            {store.aiComment.split("\n\n").map((block, i) => {
              const trimmed = block.trim();
              if (!trimmed) return null;
              // 섹션 헤더 (📊, 🚨, 💡, 📍, 🎁 등으로 시작)
              const isHeader = /^[📊🔧💪🔍📸⭐🍽️📢📋🚨💡📍🎁]/.test(trimmed);
              if (isHeader) {
                const [first, ...rest] = trimmed.split("\n");
                return (
                  <div key={i}>
                    <p className="mb-1 text-sm font-semibold text-gray-800">{first}</p>
                    {rest.length > 0 && (
                      <div className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                        {rest.join("\n")}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {trimmed}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            AI 분석 코멘트가 없습니다. 다시 진단하면 생성됩니다.
          </p>
        )}
      </motion.div>

      {/* 리뷰 답변 */}
      <ReviewReplySection
        reviews={placeData.reviews.recent}
        storeName={placeData.name}
        plan={plan}
      />

      {/* 경쟁 가게 비교 */}
      <CompetitorSection
        placeData={placeData}
        scoreResult={scoreResult}
        placeId={store.placeId}
        plan={plan}
      />

      {/* 하단 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="h-12 flex-1 cursor-pointer rounded-xl border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          대시보드로 돌아가기
        </Button>
        <Button
          onClick={() => router.push("/dashboard")}
          className="h-12 flex-1 cursor-pointer rounded-xl bg-primary-brand text-white hover:bg-primary-brand/80"
        >
          다시 진단하기
        </Button>
      </motion.div>
    </div>
  );
}
