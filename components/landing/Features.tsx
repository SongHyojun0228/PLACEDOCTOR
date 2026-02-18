"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    emoji: "📊",
    title: "100점 만점 건강 점수",
    description: "가게 링크만 넣으면 5초 만에 플레이스 상태를 진단합니다",
  },
  {
    emoji: "📸",
    title: "'이것만 고치세요' 맞춤 가이드",
    description: "사진 몇 장 추가, 어떤 키워드 넣기 — 구체적으로 알려드려요",
  },
  {
    emoji: "🏪",
    title: "동네 경쟁 가게 비교",
    description: "같은 동네 같은 업종 가게 5곳과 리뷰·사진·별점 비교",
  },
  {
    emoji: "🔍",
    title: "검색 잘 되는 키워드 추천",
    description: "'합정 카페'보다 '합정 작업하기 좋은 카페'가 효과적입니다",
  },
  {
    emoji: "✏️",
    title: "AI 소개글·메뉴 설명 작성",
    description: "검색에 잘 잡히는 가게 소개글과 메뉴 설명을 AI가 써드려요",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          플레이스닥터가 해드리는 일
        </motion.h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              className={i === features.length - 1 ? "md:col-span-2 md:mx-auto md:w-1/2" : ""}
            >
              <Card className="h-full border-transparent bg-base-light/30 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex flex-col items-start gap-3">
                  <span className="text-4xl" aria-hidden="true">
                    {feat.emoji}
                  </span>
                  <h3 className="text-lg font-bold text-primary-dark">
                    {feat.title}
                  </h3>
                  <p className="text-base leading-relaxed text-primary-dark/70">
                    {feat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
