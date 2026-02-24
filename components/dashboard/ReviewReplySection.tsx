"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getUsage,
  canUse,
  incrementUsage,
  getFeatureLimit,
} from "@/lib/plan";
import type { Review, ReviewReply, ReviewTone, Plan } from "@/types";

const TONE_OPTIONS: { value: ReviewTone; label: string; emoji: string }[] = [
  { value: "friendly", label: "친근", emoji: "\uD83D\uDE42" },
  { value: "professional", label: "정중", emoji: "\uD83E\uDD1D" },
  { value: "humorous", label: "유머", emoji: "\uD83D\uDE04" },
];

interface ReviewReplyCardProps {
  review: Review;
  storeName: string;
  usageExhausted: boolean;
  replyLimit: number;
  onGenerated: () => void;
}

function ReviewReplyCard({
  review,
  storeName,
  usageExhausted,
  replyLimit,
  onGenerated,
}: ReviewReplyCardProps) {
  const [tone, setTone] = useState<ReviewTone>("friendly");
  const [replies, setReplies] = useState<ReviewReply[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const hasContent = review.content && review.content.trim().length > 0;

  async function handleGenerate() {
    if (!canUse("reviewReply", replyLimit) || !hasContent) return;

    setLoading(true);
    setError(null);
    setReplies(null);

    try {
      const res = await fetch("/api/reviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, storeName, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "답변 생성에 실패했습니다.");
        return;
      }

      setReplies(data.replies);
      incrementUsage("reviewReply");
      onGenerated();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  const stars = "\u2605".repeat(review.rating) + "\u2606".repeat(5 - review.rating);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Review Header */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {review.author}
        </span>
        <span className="text-sm text-yellow-500">{stars}</span>
        {review.date && (
          <span className="text-xs text-gray-400">{review.date}</span>
        )}
      </div>

      {/* Review Content */}
      <p className="mb-3 text-sm leading-relaxed text-gray-600">
        {review.content || "(내용 없음)"}
      </p>

      {/* Tone Selection + Generate Button */}
      {hasContent && (
        <div className="flex flex-wrap items-center gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTone(opt.value);
                setReplies(null);
              }}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tone === opt.value
                  ? "bg-primary-brand text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}

          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={loading || usageExhausted}
            className="ml-auto cursor-pointer rounded-lg bg-primary-brand px-4 text-xs text-white hover:bg-primary-brand/80 disabled:opacity-50"
          >
            {loading ? "생성 중..." : "답변 생성"}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}

      {/* Generated Replies */}
      <AnimatePresence>
        {replies && replies.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {replies.map((reply, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-sky-50/50 px-3 py-2.5"
                >
                  <p className="flex-1 text-sm leading-relaxed text-gray-700">
                    {reply.content}
                  </p>
                  <button
                    onClick={() => handleCopy(reply.content, i)}
                    className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-primary-brand transition-colors hover:bg-primary-brand/10"
                  >
                    {copiedIdx === i ? "\u2705 \uBCF5\uC0AC\uB428!" : "\uBCF5\uC0AC"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ReviewReplySectionProps {
  reviews: Review[];
  storeName: string;
  plan: Plan;
}

export default function ReviewReplySection({
  reviews,
  storeName,
  plan,
}: ReviewReplySectionProps) {
  const PAGE_SIZE = 10;
  const replyLimit = getFeatureLimit(plan, "reviewReply");
  const [usage, setUsage] = useState({ used: 0, remaining: replyLimit === -1 ? Infinity : replyLimit, limit: replyLimit });
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setUsage(getUsage("reviewReply", replyLimit));
  }, [replyLimit]);

  // 정렬 바뀌면 1페이지로 리셋
  useEffect(() => {
    setPage(1);
  }, [sortOrder]);

  function refreshUsage() {
    setUsage(getUsage("reviewReply", replyLimit));
  }

  // "2025.01.14." / "2025-01-14" / "3주 전" 등 다양한 날짜 형식 파싱
  function parseDate(dateStr: string): number {
    if (!dateStr) return 0;
    // "2025.01.14." → "2025-01-14"
    const normalized = dateStr.replace(/\.$/, "").replace(/\./g, "-");
    const ts = new Date(normalized).getTime();
    if (!isNaN(ts)) return ts;
    // 상대 시간 ("3일 전", "1주 전", "2달 전" 등)
    const relMatch = dateStr.match(/(\d+)\s*(분|시간|일|주|달|개월|년)\s*전/);
    if (relMatch) {
      const n = parseInt(relMatch[1], 10);
      const unit = relMatch[2];
      const now = Date.now();
      const ms: Record<string, number> = { "분": 60000, "시간": 3600000, "일": 86400000, "주": 604800000, "달": 2592000000, "개월": 2592000000, "년": 31536000000 };
      return now - n * (ms[unit] || 86400000);
    }
    return 0;
  }

  // Filter unreplied reviews, sort by selected order
  const unreplied = useMemo(() => {
    return [...reviews]
      .filter((r) => r.ownerReply === null)
      .sort((a, b) => {
        const ta = parseDate(a.date);
        const tb = parseDate(b.date);
        if (!ta && !tb) return 0;
        if (!ta) return 1;
        if (!tb) return -1;
        return sortOrder === "newest" ? tb - ta : ta - tb;
      });
  }, [reviews, sortOrder]);

  if (unreplied.length === 0) return null;

  const totalPages = Math.ceil(unreplied.length / PAGE_SIZE);
  const paged = unreplied.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isUnlimited = replyLimit === -1;
  const usageExhausted = !isUnlimited && usage.remaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.3 }}
      className="mt-8"
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{"\uD83D\uDCAC"}</span>
          <h2 className="text-sm font-semibold text-gray-900">
            리뷰 답변
          </h2>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            미답변 {unreplied.length}개
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setSortOrder("newest")}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                sortOrder === "newest"
                  ? "bg-primary-brand text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortOrder("oldest")}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                sortOrder === "oldest"
                  ? "bg-primary-brand text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              오래된순
            </button>
          </div>
          {isUnlimited ? (
            <span className="text-xs font-semibold text-primary-brand">무제한</span>
          ) : (
            <span className="text-xs text-gray-400">
              남은 횟수:{" "}
              <span className={usageExhausted ? "font-semibold text-red-500" : "font-semibold text-primary-brand"}>
                {usage.remaining}/{usage.limit}회
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Usage Exhausted Warning */}
      {usageExhausted && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          이번 달 횟수를 모두 사용했어요. 더 많은 답변이 필요하다면 요금제를 업그레이드해보세요.
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-3">
        {paged.map((review, i) => (
          <ReviewReplyCard
            key={`${review.author}-${review.date}-${(page - 1) * PAGE_SIZE + i}`}
            review={review}
            storeName={storeName}
            usageExhausted={usageExhausted}
            replyLimit={replyLimit}
            onGenerated={refreshUsage}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-default disabled:opacity-30"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                p === page
                  ? "bg-primary-brand text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-default disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </motion.div>
  );
}
