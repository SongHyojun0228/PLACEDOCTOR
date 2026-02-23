"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getStores, deleteStore, type StoredStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Plan, DBPayment } from "@/types";

const PLAN_LABEL: Record<Plan, string> = {
  free: "무료",
  basic: "베이직",
  pro: "프로",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "결제 완료",
  cancelled: "취소",
  failed: "실패",
};

export default function MyPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [stores, setStores] = useState<StoredStore[]>([]);
  const [payments, setPayments] = useState<DBPayment[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setDisplayName(user.user_metadata?.name ?? user.email ?? "");
      setEmail(user.email ?? "");

      // 플랜 정보
      const { data: userData } = await supabase
        .from("users")
        .select("plan, plan_expires_at")
        .eq("id", user.id)
        .maybeSingle();

      if (userData) {
        setCurrentPlan((userData.plan as Plan) ?? "free");
        setExpiresAt(userData.plan_expires_at);
      }

      // 결제 내역
      const historyRes = await fetch("/api/payments/history");
      const historyData = await historyRes.json();
      if (historyData.success) {
        setPayments(historyData.payments);
      }
    }
    load();

    // localStorage 가게 목록
    setStores(getStores());
  }, [router]);

  const handleDeleteStore = (placeId: string, name: string) => {
    if (!confirm(`"${name}" 가게를 목록에서 삭제하시겠어요?`)) return;
    deleteStore(placeId);
    setStores(getStores());
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      {/* A. 프로필 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-bold text-gray-900">
          마이페이지
        </h1>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="mt-1 text-sm text-gray-500">{email}</p>
            </div>
            <Badge
              className={`px-3 py-1 text-sm font-semibold ${
                currentPlan === "pro"
                  ? "bg-primary-dark text-white"
                  : currentPlan === "basic"
                    ? "bg-primary-brand text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {PLAN_LABEL[currentPlan]} 플랜
            </Badge>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-9 cursor-pointer text-sm text-gray-500 hover:text-red-500"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </motion.section>

      {/* B. 내 가게 설정 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-10"
      >
        <h2 className="text-lg font-semibold text-gray-800">내 가게</h2>

        {stores.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">
              아직 진단한 가게가 없어요.
            </p>
            <Link
              href="/dashboard"
              className="mt-2 inline-block text-sm font-medium text-primary-brand hover:underline"
            >
              첫 진단 시작하기
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {stores.map((store) => (
              <div
                key={store.placeId}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {store.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {store.category} · 점수 {store.totalScore}점 ·{" "}
                    {new Date(store.analyzedAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 gap-2">
                  <Link href={`/dashboard/${store.placeId}`}>
                    <Button
                      variant="outline"
                      className="h-8 cursor-pointer text-xs"
                    >
                      보기
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDeleteStore(store.placeId, store.name)
                    }
                    className="h-8 cursor-pointer text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* C. 요금제 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10"
      >
        <h2 className="text-lg font-semibold text-gray-800">요금제</h2>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                className={`px-3 py-1 text-sm font-semibold ${
                  currentPlan === "pro"
                    ? "bg-primary-dark text-white"
                    : currentPlan === "basic"
                      ? "bg-primary-brand text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {PLAN_LABEL[currentPlan]} 플랜
              </Badge>
              {currentPlan !== "free" && expiresAt && (
                <span className="text-sm text-gray-500">
                  {new Date(expiresAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  까지
                </span>
              )}
            </div>
            <Link href="/dashboard/plan">
              <Button
                variant="outline"
                className="h-9 cursor-pointer text-sm font-medium text-primary-brand hover:bg-primary-brand/5"
              >
                요금제 변경하기
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* D. 결제 내역 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10"
      >
        <h2 className="text-lg font-semibold text-gray-800">결제 내역</h2>

        {payments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">결제 내역이 없어요.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">날짜</th>
                  <th className="px-5 py-3 font-medium">플랜</th>
                  <th className="px-5 py-3 font-medium">금액</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(
                        p.paid_at || p.created_at,
                      ).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {PLAN_LABEL[(p.plan as Plan) ?? "free"]}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {p.amount.toLocaleString()}원
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.status === "paid"
                            ? "bg-green-50 text-green-600"
                            : p.status === "failed"
                              ? "bg-red-50 text-red-500"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* E. 약관 & 정책 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10"
      >
        <h2 className="text-lg font-semibold text-gray-800">약관 & 정책</h2>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white">
          <Link
            href="/terms"
            className="flex items-center justify-between border-b border-gray-100 px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-sm text-gray-700">이용약관</span>
            <span className="text-gray-300">›</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-sm text-gray-700">개인정보처리방침</span>
            <span className="text-gray-300">›</span>
          </Link>
        </div>
      </motion.section>

      <div className="mt-10" />
    </div>
  );
}
