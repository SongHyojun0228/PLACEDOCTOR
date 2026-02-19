"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Plan {
  name: string;
  price: string;
  unit: string;
  desc: string;
  features: string[];
  cta: string;
  style: "outline" | "highlight" | "dark";
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "무료",
    price: "0",
    unit: "원",
    desc: "부담 없이 시작하세요",
    features: [
      "첫 진단 무제한",
      "건강 점수 확인",
      "개선 포인트 확인",
    ],
    cta: "무료로 시작하기",
    style: "outline",
  },
  {
    name: "베이직",
    price: "9,900",
    unit: "원 / 월",
    desc: "대부분의 사장님께 추천",
    features: [
      "무제한 진단",
      "주간 성적표",
      "경쟁 가게 비교 분석",
      "AI 소개글 생성",
      "키워드 추천",
    ],
    cta: "출시 알림 받기",
    style: "highlight",
    badge: "추천",
  },
  {
    name: "프로",
    price: "19,900",
    unit: "원 / 월",
    desc: "적극적으로 관리하시는 분",
    features: [
      "베이직 전부 포함",
      "키워드 순위 추적",
      "콘텐츠 자동 생성",
      "경쟁 가게 변동 알림",
      "월간 리포트 PDF",
    ],
    cta: "출시 알림 받기",
    style: "dark",
  },
];

export default function Pricing() {
  return (
    <section className="relative overflow-hidden bg-base-light py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-semibold uppercase tracking-widest text-primary-brand"
        >
          솔직한 가격
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          대행사 월 50만원?
          <br className="md:hidden" />{" "}
          <span className="text-primary-brand">AI가 대신합니다</span>
        </motion.h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isDark = plan.style === "dark";
            const isHighlight = plan.style === "highlight";
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
                        : "border border-base-light bg-white"
                  }`}
                >
                  {/* 이름 + 설명 */}
                  <p className={`text-sm font-medium ${isDark ? "text-base-light/60" : "text-primary-dark/50"}`}>
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isDark ? "text-white" : "text-primary-dark"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${isDark ? "text-base-light/50" : "text-primary-dark/40"}`}>
                      {plan.unit}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${isDark ? "text-base-light/50" : "text-primary-dark/50"}`}>
                    {plan.desc}
                  </p>

                  {/* 구분선 */}
                  <div className={`my-5 h-px ${isDark ? "bg-white/10" : "bg-base-light"}`} />

                  {/* 기능 */}
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

                  {/* CTA */}
                  <Button
                    asChild
                    className={`mt-7 h-12 w-full cursor-pointer rounded-xl text-base font-semibold transition-all ${
                      isHighlight
                        ? "bg-primary-brand text-white shadow-lg shadow-primary-brand/20 hover:bg-accent-hot hover:shadow-accent-hot/20"
                        : isDark
                          ? "bg-white text-primary-dark hover:bg-base-light"
                          : "bg-primary-dark/5 text-primary-dark hover:bg-primary-dark/10"
                    }`}
                  >
                    <a href="#cta">{plan.cta}</a>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center text-sm text-primary-dark/40"
        >
          * 출시 후 첫 달 무료 체험 가능 · 언제든 해지 가능
        </motion.p>
      </div>
    </section>
  );
}
