"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code") ?? "UNKNOWN";
  const message = searchParams.get("message") ?? "결제가 취소되었거나 오류가 발생했습니다.";

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
          <svg className="h-10 w-10 text-accent-hot" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-gray-900">
          결제 실패
        </h1>
        <p className="mt-3 text-gray-500">{message}</p>
        <p className="mt-1 text-xs text-gray-400">오류 코드: {code}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={() => router.push("/dashboard/plan")}
            className="h-12 w-full rounded-xl bg-primary-brand text-base font-semibold text-white hover:bg-primary-brand/90"
          >
            다시 시도하기
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
