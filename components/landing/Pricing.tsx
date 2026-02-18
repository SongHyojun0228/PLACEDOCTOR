"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  price: string;
  unit: string;
  features: PlanFeature[];
  cta: string;
  style: "outline" | "highlight" | "dark";
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "무료",
    price: "0",
    unit: "원",
    features: [
      { text: "첫 진단 1회 무료" },
      { text: "건강 점수 확인" },
      { text: "개선 포인트 3개" },
    ],
    cta: "무료로 시작하기",
    style: "outline",
  },
  {
    name: "베이직",
    price: "9,900",
    unit: "원 / 월",
    features: [
      { text: "무제한 진단" },
      { text: "주간 성적표" },
      { text: "경쟁 가게 비교" },
      { text: "키워드 추천" },
    ],
    cta: "출시 알림 받기",
    style: "highlight",
    badge: "추천",
  },
  {
    name: "프로",
    price: "19,900",
    unit: "원 / 월",
    features: [
      { text: "베이직 전부 포함" },
      { text: "AI 소개글 생성" },
      { text: "메뉴 설명 생성" },
      { text: "키워드 추적" },
      { text: "콘텐츠 생성" },
    ],
    cta: "출시 알림 받기",
    style: "dark",
  },
];

function getCardClass(style: Plan["style"]) {
  switch (style) {
    case "outline":
      return "border-border bg-white";
    case "highlight":
      return "border-2 border-primary-brand bg-white shadow-lg shadow-primary-brand/10";
    case "dark":
      return "border-transparent bg-primary-dark text-white";
  }
}

export default function Pricing() {
  return (
    <section className="bg-base-light py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          대행사에 월 50만원?
          <br className="md:hidden" /> AI가 대신합니다
        </motion.h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isDark = plan.style === "dark";
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.12 }}
              >
                <Card
                  className={`relative h-full overflow-visible ${getCardClass(plan.style)}`}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-gold px-4 py-1 text-xs font-bold text-primary-dark">
                      {plan.badge}
                    </Badge>
                  )}

                  <CardContent className="flex flex-col items-center gap-6 pt-2">
                    {/* 플랜 이름 */}
                    <p
                      className={`text-lg font-semibold ${isDark ? "text-base-light/80" : "text-primary-dark/60"}`}
                    >
                      {plan.name}
                    </p>

                    {/* 가격 */}
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${isDark ? "text-white" : "text-primary-dark"}`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-base ${isDark ? "text-base-light/60" : "text-primary-dark/50"}`}
                      >
                        {plan.unit}
                      </span>
                    </div>

                    {/* 기능 리스트 */}
                    <ul className="w-full space-y-3">
                      {plan.features.map((feat) => (
                        <li
                          key={feat.text}
                          className={`flex items-center gap-2 text-sm ${isDark ? "text-base-light/80" : "text-primary-dark/70"}`}
                        >
                          <span
                            className={isDark ? "text-primary-brand" : "text-primary-brand"}
                          >
                            ✓
                          </span>
                          {feat.text}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      asChild
                      className={`mt-auto h-12 w-full cursor-pointer rounded-xl text-base font-semibold transition-colors ${
                        plan.style === "highlight"
                          ? "bg-primary-brand text-white hover:bg-accent-hot"
                          : isDark
                            ? "bg-white text-primary-dark hover:bg-base-light"
                            : "bg-primary-dark/10 text-primary-dark hover:bg-primary-dark/20"
                      }`}
                    >
                      <a href="#cta">{plan.cta}</a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-center text-sm text-primary-dark/50"
        >
          * 출시 후 첫 달 무료 체험 가능
        </motion.p>
      </div>
    </section>
  );
}
