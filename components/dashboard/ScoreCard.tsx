"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge, getBarColor } from "@/lib/scoreUtils";
import type { ScoreDetail } from "@/types";

const CATEGORY_META: Record<
  string,
  { emoji: string; label: string }
> = {
  basicInfo: { emoji: "📋", label: "기본 정보" },
  photos: { emoji: "📸", label: "사진" },
  reviews: { emoji: "⭐", label: "리뷰" },
  menu: { emoji: "🍽️", label: "메뉴" },
  keywords: { emoji: "🔍", label: "키워드" },
  activity: { emoji: "📢", label: "활성도" },
};

interface ScoreCardProps {
  categoryKey: string;
  detail: ScoreDetail;
  delay?: number;
}

export default function ScoreCard({
  categoryKey,
  detail,
  delay = 0,
}: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[categoryKey] ?? {
    emoji: "📊",
    label: categoryKey,
  };
  const badge = getStatusBadge(detail.status);
  const percent = Math.round((detail.score / detail.max) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer flex-col gap-3"
      >
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">
              {meta.emoji}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums text-gray-500">
              {detail.score}/{detail.max}점
            </span>
            <Badge variant="outline" className={badge.className}>
              {badge.text}
            </Badge>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, delay: delay + 0.2, ease: "easeOut" }}
            className={`h-full rounded-full ${getBarColor(detail.status)}`}
          />
        </div>
      </button>

      {/* 확장 영역 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {detail.strengths.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-primary-brand">
                    잘하고 있는 점
                  </p>
                  <ul className="space-y-1">
                    {detail.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-xs leading-relaxed text-gray-600"
                      >
                        ✓ {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.improvements.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-accent-gold">
                    개선이 필요한 점
                  </p>
                  <ul className="space-y-1">
                    {detail.improvements.map((s, i) => (
                      <li
                        key={i}
                        className="text-xs leading-relaxed text-gray-600"
                      >
                        → {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
