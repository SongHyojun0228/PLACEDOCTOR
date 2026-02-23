"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlaceData, ScoreResult, Plan } from "@/types";
import { PLAN_LIMITS } from "@/types";
import type { KeywordRecommendation, RecommendedKeyword } from "@/lib/analyzer/keywordAnalyzer";

/* ─────────── 현재 키워드 체크리스트 ─────────── */

function KeywordChecklist({ placeData }: { placeData: PlaceData }) {
  const category = (placeData.category || "").toLowerCase();
  const intro = (placeData.introduction || placeData.description || "").toLowerCase();
  const catKeywords = category.split(/[,\/\s]+/).filter((k) => k.length >= 2);
  const locMatch = placeData.address.match(/(\S+[구군])\s*(\S+[동읍면리])?/);
  const locName = locMatch ? locMatch[1] : "";

  const introHasCat = intro && catKeywords.some((k) => intro.includes(k));
  const introHasLoc = locName ? intro.includes(locName.toLowerCase()) : false;

  const checks = [
    { label: "소개글에 업종 키워드 포함", example: catKeywords.slice(0, 2).join(", "), pass: introHasCat, pts: "5점" },
    { label: "소개글에 지역명 포함", example: locName || "-", pass: introHasLoc, pts: "5점" },
  ];

  return (
    <div className="space-y-2 border-t border-gray-100 pt-3">
      <p className="mb-1.5 text-xs text-gray-400">점수 기준 체크</p>
      {checks.map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className={c.pass ? "text-primary-brand" : "text-gray-300"}>
            {c.pass ? "\u2713" : "\u2717"}
          </span>
          <span className={c.pass ? "text-gray-700" : "text-gray-400"}>
            {c.label}
          </span>
          <span className="text-gray-300">({c.example})</span>
          <span className={`ml-auto ${c.pass ? "text-primary-brand" : "text-gray-300"}`}>
            {c.pts}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────── 추천 키워드 태그 (펼침) ─────────── */

function RecommendedTag({
  rec,
  isBlurred,
}: {
  rec: RecommendedKeyword;
  isBlurred: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={isBlurred ? "pointer-events-none select-none blur-sm" : ""}>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="cursor-pointer rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
      >
        + {rec.keyword}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 rounded-lg bg-amber-50/50 px-3 py-2 text-xs">
              <p className="text-amber-800">{rec.reason}</p>
              <p className="mt-1 text-gray-600">{rec.guide}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── 소개글 팁 ─────────── */

function IntroductionTip({ tip }: { tip: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사 실패 무시
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-sky-800">소개글 개선 예시</p>
        <button
          onClick={handleCopy}
          className="cursor-pointer rounded-md bg-sky-100 px-2 py-0.5 text-xs text-sky-700 transition-colors hover:bg-sky-200"
        >
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{tip}</p>
    </div>
  );
}

/* ─────────── 로딩 ─────────── */

function LoadingState() {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-8">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2 w-2 rounded-full bg-amber-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500">
        AI가 키워드를 분석하고 있어요...
      </p>
    </div>
  );
}

/* ─────────── 메인 컴포넌트 ─────────── */

interface KeywordSectionProps {
  placeData: PlaceData;
  scoreResult: ScoreResult;
  plan: Plan;
  competitors?: { name: string; keywords: string[] }[];
}

export default function KeywordSection({
  placeData,
  scoreResult,
  plan,
  competitors,
}: KeywordSectionProps) {
  const [recommendation, setRecommendation] = useState<KeywordRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const keywordLimit = PLAN_LIMITS[plan].keywordCount;
  const isFree = keywordLimit <= 3;

  async function handleRecommend() {
    if (loading) return;
    setStarted(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/keywords/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeData,
          scoreResult,
          competitors,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "키워드 추천에 실패했습니다.");
        return;
      }

      setRecommendation(data.recommendation);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentKeywords = placeData.keywords;
  const recommended = recommendation?.recommended ?? [];
  const visibleRecommended = isFree ? recommended.slice(0, 3) : recommended.slice(0, keywordLimit);
  const blurredCount = isFree ? Math.max(0, recommended.length - 3) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      {/* 헤더 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            <span className="mr-1">&#128270;</span>키워드 분석
          </h2>
          {currentKeywords.length > 0 && (
            <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
              현재 {currentKeywords.length}개
            </Badge>
          )}
          {recommendation && recommended.length > 0 && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              추천 {recommended.length}개
            </Badge>
          )}
        </div>
        {!started && (
          <Button
            size="sm"
            onClick={handleRecommend}
            className="cursor-pointer rounded-lg bg-amber-500 px-4 text-xs text-white hover:bg-amber-500/80"
          >
            키워드 추천받기
          </Button>
        )}
      </div>

      {/* 현재 키워드 태그 */}
      {currentKeywords.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-gray-400">리뷰에서 추출된 키워드</p>
          <div className="flex flex-wrap gap-1.5">
            {currentKeywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-primary-brand"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 키워드 체크리스트 */}
      <KeywordChecklist placeData={placeData} />

      {/* 로딩 */}
      {loading && <LoadingState />}

      {/* 에러 */}
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button
            onClick={handleRecommend}
            className="ml-2 cursor-pointer text-xs font-medium text-red-700 underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 추천 키워드 */}
      <AnimatePresence>
        {recommendation && recommended.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs text-gray-400">
                AI 추천 키워드 (클릭하면 가이드를 볼 수 있어요)
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleRecommended.map((rec, i) => (
                  <RecommendedTag key={i} rec={rec} isBlurred={false} />
                ))}
                {/* 블러 처리된 키워드 (free 플랜) */}
                {blurredCount > 0 &&
                  recommended.slice(3, 6).map((rec, i) => (
                    <RecommendedTag key={`blur-${i}`} rec={rec} isBlurred={true} />
                  ))}
              </div>

              {/* free 플랜 업그레이드 안내 */}
              {isFree && blurredCount > 0 && (
                <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">
                  나머지 {blurredCount}개 키워드는 베이직 플랜에서 확인할 수 있어요
                </div>
              )}

              {/* 소개글 개선 팁 */}
              {recommendation.introductionTip && (
                <IntroductionTip tip={recommendation.introductionTip} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
