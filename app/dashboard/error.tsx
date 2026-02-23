"use client";

import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-5xl">📊</div>
        <h1 className="mb-2 font-display text-xl font-bold text-gray-900">
          대시보드 로딩 중 오류
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          데이터를 불러오는 중 문제가 발생했어요.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-brand/80"
          >
            다시 시도
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
