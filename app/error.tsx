"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="mb-2 font-display text-xl font-bold text-gray-900">
          문제가 발생했습니다
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-brand/80"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
