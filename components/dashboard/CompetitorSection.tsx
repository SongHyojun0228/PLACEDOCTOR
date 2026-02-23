"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UpgradeOverlay from "@/components/dashboard/UpgradeOverlay";
import type { PlaceData, ScoreResult, Plan } from "@/types";
import { PLAN_LIMITS } from "@/types";
import type { CompetitorData } from "@/app/api/competitors/route";
import type { CompetitorInsight } from "@/lib/ai/competitorAnalyzer";

/* ─────────── 비교 지표 ─────────── */

interface MetricRow {
  label: string;
  getValue: (d: PlaceData, s: ScoreResult) => number;
  format: (v: number) => string;
  higherIsBetter: boolean;
}

const METRICS: MetricRow[] = [
  {
    label: "총점",
    getValue: (_d, s) => s.total,
    format: (v) => `${v}점`,
    higherIsBetter: true,
  },
  {
    label: "리뷰 수",
    getValue: (d) => d.reviews.total,
    format: (v) => `${v}개`,
    higherIsBetter: true,
  },
  {
    label: "평점",
    getValue: (d) => d.reviews.avgRating,
    format: (v) => v.toFixed(1),
    higherIsBetter: true,
  },
  {
    label: "답변률",
    getValue: (d) => Math.round(d.reviews.ownerReplyRate * 100),
    format: (v) => `${v}%`,
    higherIsBetter: true,
  },
  {
    label: "사진 수",
    getValue: (d) => d.photos.business,
    format: (v) => `${v}장`,
    higherIsBetter: true,
  },
  {
    label: "소개글",
    getValue: (d) => d.description.length,
    format: (v) => `${v}자`,
    higherIsBetter: true,
  },
];

function CompareIndicator({ myVal, theirVal, higherIsBetter }: { myVal: number; theirVal: number; higherIsBetter: boolean }) {
  if (myVal === theirVal) return null;
  const iWin = higherIsBetter ? myVal > theirVal : myVal < theirVal;
  return (
    <span className={`ml-1 text-xs ${iWin ? "text-emerald-500" : "text-red-500"}`}>
      {iWin ? "\u{1F7E2}" : "\u{1F534}"}
    </span>
  );
}

/* ─────────── 블러 프리뷰 (free 플랜) ─────────── */

function LockedPreview() {
  return (
    <UpgradeOverlay
      title="베이직 플랜에서 이용 가능"
      description="경쟁 가게와 비교 분석을 받아보세요"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="py-2 text-left font-medium text-gray-500">항목</th>
            <th className="py-2 text-center font-medium text-gray-500">내 가게</th>
            <th className="py-2 text-center font-medium text-gray-500">경쟁 A</th>
            <th className="py-2 text-center font-medium text-gray-500">경쟁 B</th>
          </tr>
        </thead>
        <tbody>
          {["총점", "리뷰 수", "평점", "답변률"].map((label) => (
            <tr key={label} className="border-b border-gray-50">
              <td className="py-2 text-gray-600">{label}</td>
              <td className="py-2 text-center text-gray-700">72점</td>
              <td className="py-2 text-center text-gray-700">85점</td>
              <td className="py-2 text-center text-gray-700">68점</td>
            </tr>
          ))}
        </tbody>
      </table>
    </UpgradeOverlay>
  );
}

/* ─────────── 비교 테이블 ─────────── */

function ComparisonTable({
  myData,
  myScore,
  competitors,
}: {
  myData: PlaceData;
  myScore: ScoreResult;
  competitors: CompetitorData[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[360px] text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-500">
              항목
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-primary-brand">
              {myData.name}
            </th>
            {competitors.map((c) => (
              <th
                key={c.placeId}
                className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-600"
              >
                <div>{c.placeData.name}</div>
                {c.distance < 900 && (
                  <div className="text-xs font-normal text-gray-400">
                    {c.distance < 1 ? `${Math.round(c.distance * 1000)}m` : `${c.distance.toFixed(1)}km`}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => {
            const myVal = metric.getValue(myData, myScore);
            return (
              <tr key={metric.label} className="border-b border-gray-50">
                <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                  {metric.label}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-center font-semibold text-gray-900">
                  {metric.format(myVal)}
                </td>
                {competitors.map((c) => {
                  const theirVal = metric.getValue(c.placeData, c.scoreResult);
                  return (
                    <td
                      key={c.placeId}
                      className="whitespace-nowrap px-4 py-2.5 text-center text-gray-700"
                    >
                      {metric.format(theirVal)}
                      <CompareIndicator
                        myVal={myVal}
                        theirVal={theirVal}
                        higherIsBetter={metric.higherIsBetter}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────── AI 인사이트 표시 ─────────── */

function InsightDisplay({ insight }: { insight: CompetitorInsight }) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      {/* 경쟁 가게별 이유 */}
      {insight.perCompetitor.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            🏪 경쟁 가게 분석
          </p>
          <div className="space-y-2">
            {insight.perCompetitor.map((c, i) => (
              <div key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium text-gray-800">{c.name}:</span>{" "}
                <span className="text-gray-600">{c.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 내 강점 */}
      {insight.myAdvantages.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            💪 내가 이기고 있는 점
          </p>
          <ul className="space-y-1">
            {insight.myAdvantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 액션 플랜 */}
      {insight.actionItems.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            📋 따라잡기 액션 플랜
          </p>
          <ol className="space-y-1">
            {insight.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-primary-brand">
                  {i + 1}.
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ─────────── 로딩 상태 ─────────── */

function LoadingState({ progress, total }: { progress: number; total: number }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2.5 w-2.5 rounded-full bg-primary-brand"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500">
        경쟁 가게를 분석하고 있어요...
      </p>
      {total > 0 && (
        <p className="text-xs text-gray-400">
          {progress}/{total} 완료
        </p>
      )}
    </div>
  );
}

/* ─────────── 메인 컴포넌트 ─────────── */

interface CompetitorSectionProps {
  placeData: PlaceData;
  scoreResult: ScoreResult;
  placeId: string;
  plan: Plan;
}

export default function CompetitorSection({
  placeData,
  scoreResult,
  placeId,
  plan,
}: CompetitorSectionProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[] | null>(null);
  const [insight, setInsight] = useState<CompetitorInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const competitorCount = PLAN_LIMITS[plan].competitorCount;

  const isFree = competitorCount === 0;

  async function handleStart() {
    if (loading) return;
    setStarted(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myPlaceId: placeId,
          category: placeData.category,
          address: placeData.address,
          storeName: placeData.name,
          myLat: placeData.lat,
          myLng: placeData.lng,
          myPlaceData: placeData,
          myScoreResult: scoreResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "경쟁 분석에 실패했습니다.");
        return;
      }

      setCompetitors(data.competitors ?? []);
      setInsight(data.insight ?? null);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.35 }}
      className="mt-8"
    >
      {/* 헤더 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h2 className="text-sm font-semibold text-gray-900">경쟁 가게 비교</h2>
          {competitors && competitors.length > 0 && (
            <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
              {competitors.length}곳
            </Badge>
          )}
        </div>
        {!isFree && !started && (
          <Button
            size="sm"
            onClick={handleStart}
            className="cursor-pointer rounded-lg bg-primary-brand px-4 text-xs text-white hover:bg-primary-brand/80"
          >
            비교 분석 시작
          </Button>
        )}
      </div>

      {/* free 플랜: 블러 프리뷰 */}
      {isFree && <LockedPreview />}

      {/* 로딩 */}
      {!isFree && loading && <LoadingState progress={0} total={3} />}

      {/* 에러 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 결과 */}
      <AnimatePresence>
        {!isFree && competitors && competitors.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <ComparisonTable
              myData={placeData}
              myScore={scoreResult}
              competitors={competitors}
            />

            {insight && <InsightDisplay insight={insight} />}
          </motion.div>
        )}

        {!isFree && competitors && competitors.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500"
          >
            주변 경쟁 가게를 찾지 못했어요. 다른 지역이나 카테고리로 다시 시도해보세요.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
