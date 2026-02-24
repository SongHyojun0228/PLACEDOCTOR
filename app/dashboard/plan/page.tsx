"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EarlybirdModal from "@/components/dashboard/EarlybirdModal";
import type { Plan, DBPayment } from "@/types";

/* ────── 플랜 데이터 ────── */

interface PlanCard {
  key: Plan;
  name: string;
  price: number;
  priceLabel: string;
  unit: string;
  desc: string;
  features: string[];
  style: "outline" | "highlight" | "dark";
  badge?: string;
}

const plans: PlanCard[] = [
  {
    key: "free",
    name: "무료",
    price: 0,
    priceLabel: "0",
    unit: "원",
    desc: "부담 없이 시작하세요",
    features: ["첫 진단 1회", "건강 점수 확인", "개선 포인트 확인"],
    style: "outline",
  },
  {
    key: "basic",
    name: "베이직",
    price: 9900,
    priceLabel: "9,900",
    unit: "원 / 월",
    desc: "대부분의 사장님께 추천",
    features: [
      "무제한 진단",
      "주간 성적표",
      "경쟁 가게 비교 분석",
      "AI 소개글 생성",
      "키워드 추천",
    ],
    style: "highlight",
    badge: "추천",
  },
  {
    key: "pro",
    name: "프로",
    price: 19900,
    priceLabel: "19,900",
    unit: "원 / 월",
    desc: "적극적으로 관리하시는 분",
    features: [
      "베이직 전부 포함",
      "키워드 순위 추적",
      "콘텐츠 자동 생성",
      "경쟁 가게 변동 알림",
      "월간 리포트 PDF",
    ],
    style: "dark",
  },
];

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

/* ────── 컴포넌트 ────── */

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [payments, setPayments] = useState<DBPayment[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [earlybirdOpen, setEarlybirdOpen] = useState(false);

  // 유저 정보 + 결제 내역 로드
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserEmail(user.email ?? "");

      // users 테이블에서 플랜 정보 (행이 없을 수도 있으므로 maybeSingle)
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
  }, []);

  const planRank: Record<Plan, number> = { free: 0, basic: 1, pro: 2 };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      {/* A. 현재 플랜 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
          요금제 관리
        </h1>
        <div className="mt-4 flex items-center gap-3">
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
                month: "long",
                day: "numeric",
              })}
              까지 이용 가능
            </span>
          )}
          {currentPlan === "free" && (
            <span className="text-sm text-gray-500">
              무료 플랜을 사용 중이에요
            </span>
          )}
        </div>
      </motion.div>

      {/* B. 요금제 카드 */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const isDark = plan.style === "dark";
          const isHighlight = plan.style === "highlight";
          const isCurrent = currentPlan === plan.key;
          const isUpgrade = planRank[plan.key] > planRank[currentPlan];

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative overflow-visible rounded-2xl p-[1px] ${
                isHighlight
                  ? "bg-gradient-to-b from-primary-brand to-primary-brand/40"
                  : ""
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 bg-accent-gold px-4 py-1 text-xs font-bold text-primary-dark">
                  {plan.badge}
                </Badge>
              )}
              <div
                className={`flex h-full flex-col rounded-2xl p-7 ${
                  isDark
                    ? "bg-primary-dark text-white"
                    : isHighlight
                      ? "bg-white shadow-xl shadow-primary-brand/10"
                      : "border border-gray-200 bg-white"
                }`}
              >
                <p
                  className={`text-sm font-medium ${isDark ? "text-base-light/60" : "text-primary-dark/50"}`}
                >
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${isDark ? "text-white" : "text-primary-dark"}`}
                  >
                    {plan.priceLabel}
                  </span>
                  <span
                    className={`text-sm ${isDark ? "text-base-light/50" : "text-primary-dark/40"}`}
                  >
                    {plan.unit}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${isDark ? "text-base-light/50" : "text-primary-dark/50"}`}
                >
                  {plan.desc}
                </p>

                <div
                  className={`my-5 h-px ${isDark ? "bg-white/10" : "bg-gray-100"}`}
                />

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className={`flex items-start gap-2.5 text-sm ${isDark ? "text-base-light/80" : "text-primary-dark/70"}`}
                    >
                      <span className="mt-0.5 text-primary-brand">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  disabled={isCurrent}
                  onClick={() => {
                    if (isUpgrade) setEarlybirdOpen(true);
                  }}
                  className={`mt-7 h-12 w-full cursor-pointer rounded-xl text-base font-semibold transition-all ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : isHighlight
                        ? "bg-primary-brand text-white shadow-lg shadow-primary-brand/20 hover:bg-accent-hot hover:shadow-accent-hot/20"
                        : isDark
                          ? "bg-white text-primary-dark hover:bg-base-light"
                          : "bg-primary-dark/5 text-primary-dark hover:bg-primary-dark/10"
                  }`}
                >
                  {isCurrent
                    ? "사용 중"
                    : isUpgrade
                      ? "업그레이드"
                      : "다운그레이드"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* C. 결제 내역 */}
      {payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-14"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            결제 내역
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
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
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(p.paid_at || p.created_at).toLocaleDateString(
                        "ko-KR",
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-900 font-medium">
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
        </motion.div>
      )}

      {/* 하단 안내 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-sm text-gray-400"
      >
        * 현재 무료 테스트 기간입니다 · 정식 출시 시 별도 안내 예정
      </motion.p>

      {/* 얼리버드 모달 */}
      <EarlybirdModal
        open={earlybirdOpen}
        defaultEmail={userEmail}
        onClose={() => setEarlybirdOpen(false)}
      />
    </div>
  );
}
