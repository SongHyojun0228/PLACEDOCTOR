"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const scoreItems = [
  { label: "📸 사진", ours: "5장", avg: "18장", status: "부족", color: "text-accent-hot" },
  { label: "📝 메뉴 설명", ours: "키워드 없음", avg: "-", status: "부족", color: "text-accent-hot" },
  { label: "⭐ 리뷰", ours: "12개", avg: "48개", status: "보통", color: "text-accent-gold" },
  { label: "📍 가게 소개", ours: "2줄", avg: "8줄", status: "부족", color: "text-accent-hot" },
];

function ScoreCardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
      className="w-full max-w-md"
      style={{ perspective: "1000px" }}
    >
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-2xl shadow-primary-brand/5 backdrop-blur-md">
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-brand">
              AI 진단 결과
            </p>
            <p className="mt-1 text-lg font-bold text-white">블루문 카페</p>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
              className="text-5xl font-bold text-accent-gold"
            >
              62
            </motion.span>
            <span className="text-sm text-base-light/40">/100</span>
          </div>
        </div>

        {/* 항목 */}
        <div className="space-y-3">
          {scoreItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-base-light/70">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-base-light/50">{item.ours}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  item.status === "부족"
                    ? "bg-accent-hot/15 text-accent-hot"
                    : "bg-accent-gold/15 text-accent-gold"
                }`}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 팁 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-4 rounded-lg bg-primary-brand/10 px-4 py-2.5"
        >
          <p className="text-xs font-medium leading-relaxed text-primary-brand">
            💡 사진 3장 + 키워드 추가만 해도 75점까지 올라갈 수 있어요!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-base-dark">
      {/* 애니메이션 그라디언트 배경 */}
      <div className="absolute inset-0">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary-brand/[0.07] blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-accent-gold/[0.05] blur-[100px]" />
      </div>

      {/* 도트 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #e0e1dd 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 pt-32 pb-20 md:flex-row md:gap-16 md:pt-40 md:pb-28 lg:pt-44 lg:pb-36">
        {/* 텍스트 */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-brand/20 bg-primary-brand/10 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary-brand animate-pulse" />
            <span className="text-sm font-medium text-primary-brand">현재 개발 중 — 곧 출시</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-6 font-display text-[2.5rem] font-bold leading-[1.15] text-white md:text-5xl lg:text-[3.5rem]"
          >
            옆 가게는 왜
            <br />
            <span className="bg-gradient-to-r from-primary-brand to-accent-gold bg-clip-text text-transparent">
              나보다 위에
            </span>{" "}
            뜰까?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-base-light/70 md:text-xl"
          >
            가게 URL만 넣으면 <strong className="text-white">5초 만에</strong> AI가 진단합니다.
            <br />
            뭘 고쳐야 하는지, 구체적으로 알려드려요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
            className="mt-8 flex w-full flex-col gap-3 sm:flex-row md:w-auto"
          >
            <Button
              asChild
              className="h-14 w-full cursor-pointer rounded-xl bg-primary-brand px-10 text-lg font-semibold text-white shadow-lg shadow-primary-brand/25 transition-all hover:bg-accent-hot hover:shadow-accent-hot/25 sm:w-auto"
            >
              <a href="#cta">출시 알림 받기</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-14 w-full cursor-pointer rounded-xl border border-white/10 px-8 text-base font-medium text-base-light/70 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white sm:w-auto"
            >
              <a href="#demo">데모 체험하기 ↓</a>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-5 text-sm text-base-light/40"
          >
            가입 없이 무료 · 출시 시 1개월 무료 체험
          </motion.p>
        </div>

        {/* 카드 */}
        <div className="flex flex-1 justify-center">
          <ScoreCardPreview />
        </div>
      </div>
    </section>
  );
}
