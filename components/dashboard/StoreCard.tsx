"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ScoreGauge from "./ScoreGauge";
import { getScoreBg, getScoreBorderColor } from "@/lib/scoreUtils";
import type { StoredStore } from "@/lib/store";

interface StoreCardProps {
  store: StoredStore;
  index?: number;
  onDelete?: (placeId: string) => void;
}

export default function StoreCard({ store, index = 0, onDelete }: StoreCardProps) {
  const date = new Date(store.analyzedAt);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  const borderColor = getScoreBorderColor(store.totalScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative"
    >
      <Link
        href={`/dashboard/${store.placeId}`}
        className={`group flex items-center gap-4 overflow-hidden rounded-2xl border border-gray-100 ${getScoreBg(store.totalScore)} p-4 transition-all hover:shadow-md`}
      >
        {/* 왼쪽 컬러 바 */}
        <div
          className="hidden h-12 w-1 shrink-0 rounded-full sm:block"
          style={{ backgroundColor: borderColor }}
        />

        {/* 게이지 */}
        <div className="shrink-0">
          <ScoreGauge score={store.totalScore} size={56} />
        </div>

        {/* 정보 */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-gray-900">{store.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span>{store.category}</span>
            <span>·</span>
            <span>{dateStr}</span>
          </div>
        </div>

        {/* 화살표 */}
        <svg
          className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* 삭제 버튼 */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(store.placeId);
          }}
          className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-500 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-500 group-hover:opacity-100 [div:hover>&]:opacity-100"
          aria-label="삭제"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
