"use client";

import Link from "next/link";

interface UpgradeOverlayProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function UpgradeOverlay({
  title = "베이직 플랜에서 이용 가능",
  description = "더 많은 분석 기능을 이용해보세요",
  children,
}: UpgradeOverlayProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* 블러 처리된 콘텐츠 */}
      <div className="pointer-events-none select-none blur-sm">
        {children}
      </div>

      {/* 잠금 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60">
        <span className="text-3xl">🔒</span>
        <p className="mt-2 text-sm font-semibold text-gray-700">
          {title}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
        <Link
          href="/dashboard/plan"
          className="mt-3 rounded-lg bg-primary-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-brand/80"
        >
          요금제 살펴보기
        </Link>
      </div>
    </div>
  );
}
