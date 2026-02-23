import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-2 text-6xl font-bold text-primary-brand">404</div>
        <h1 className="mb-2 font-display text-xl font-bold text-gray-900">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었어요.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-brand/80"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
