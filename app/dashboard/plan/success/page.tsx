"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    async function confirmPayment() {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setStatus("error");
        setMessage("결제 정보가 누락되었습니다.");
        return;
      }

      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setPlan(data.plan === "basic" ? "베이직" : "프로");
        } else {
          setStatus("error");
          setMessage(data.message || "결제 승인에 실패했습니다.");
        }
      } catch {
        setStatus("error");
        setMessage("결제 승인 중 오류가 발생했습니다.");
      }
    }

    confirmPayment();
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      {status === "loading" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-brand" />
          <p className="mt-6 text-gray-600">결제를 확인하고 있어요...</p>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-gray-900">
            결제 완료!
          </h1>
          <p className="mt-3 text-gray-500">
            <span className="font-semibold text-primary-brand">{plan}</span> 플랜이
            활성화되었어요.
          </p>
          <Button
            onClick={() => router.push("/dashboard/plan")}
            className="mt-8 h-12 w-full rounded-xl bg-primary-brand text-base font-semibold text-white hover:bg-primary-brand/90"
          >
            요금제 관리로 이동
          </Button>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-gray-900">
            결제 승인 실패
          </h1>
          <p className="mt-3 text-gray-500">{message}</p>
          <Button
            onClick={() => router.push("/dashboard/plan")}
            className="mt-8 h-12 w-full rounded-xl bg-primary-dark text-base font-semibold text-white hover:bg-primary-dark/90"
          >
            다시 시도하기
          </Button>
        </motion.div>
      )}
    </div>
  );
}
