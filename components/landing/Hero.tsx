"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const scoreItems = [
  { label: "사진", value: 28, color: "bg-accent-hot" },
  { label: "메뉴 설명", value: 15, color: "bg-accent-hot" },
  { label: "리뷰", value: 50, color: "bg-accent-gold" },
  { label: "가게 소개", value: 25, color: "bg-accent-hot" },
  { label: "최근 활동", value: 55, color: "bg-accent-gold" },
];

function ScoreCardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.9 }}
      className="w-full max-w-sm rounded-2xl bg-white/[0.07] p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-base-light/60">샘플 진단 결과</p>
          <p className="text-lg font-semibold text-white">블루문 카페</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-accent-gold">62</p>
          <p className="text-sm text-base-light/60">/ 100점</p>
        </div>
      </div>

      <div className="space-y-3">
        {scoreItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm text-base-light/80">
              {item.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-accent-gold">
        사진 3장 + 키워드 추가만 해도 75점까지 올라갈 수 있어요!
      </p>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-base-dark">
      {/* 도트 패턴 배경 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #e0e1dd 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* 상단 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-brand/5 to-transparent" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 pt-32 pb-20 md:flex-row md:gap-16 md:pt-40 md:pb-28 lg:pt-44 lg:pb-32">
        {/* 텍스트 영역 */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[3.25rem]"
          >
            옆 가게는 왜
            <br />
            나보다 위에 뜰까?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-base-light/80 md:text-xl"
          >
            네이버 플레이스 점수를 5초 만에 확인하세요.
            <br />
            AI가 검색 순위 올리는 방법을 알려드립니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
            className="mt-8 w-full md:w-auto"
          >
            <Button
              asChild
              className="h-14 w-full cursor-pointer rounded-xl bg-primary-brand px-10 text-lg font-semibold text-white transition-colors hover:bg-accent-hot md:w-auto"
            >
              <a href="#cta">무료로 진단받기</a>
            </Button>
          </motion.div>
        </div>

        {/* 점수 카드 미리보기 */}
        <div className="flex flex-1 justify-center">
          <ScoreCardPreview />
        </div>
      </div>
    </section>
  );
}
