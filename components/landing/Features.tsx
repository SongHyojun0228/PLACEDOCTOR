"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const v1Features = [
  {
    emoji: "📊",
    title: "100점 만점 건강 점수",
    desc: "가게 URL만 넣으면 5초 만에 플레이스 상태를 즉시 진단",
  },
  {
    emoji: "🎯",
    title: "'이것만 고치세요' 맞춤 가이드",
    desc: "사진 몇 장 추가, 어떤 키워드 넣기 — 구체적으로 알려드려요",
  },
  {
    emoji: "🏪",
    title: "동네 경쟁 가게 5곳 비교",
    desc: "같은 동네 같은 업종과 리뷰 수 · 사진 수 · 별점 자동 비교",
  },
  {
    emoji: "✏️",
    title: "AI 소개글 · 메뉴 설명 생성",
    desc: "검색에 잘 잡히는 가게 소개글과 메뉴 설명을 AI가 써드려요",
  },
];

const v2Features = [
  { emoji: "📱", text: "인스타 / 블로그 콘텐츠 AI 자동 생성" },
  { emoji: "📈", text: "네이버 플레이스 순위 변동 실시간 추적" },
  { emoji: "🔔", text: "경쟁 가게 새 리뷰 / 메뉴 변경 알림" },
  { emoji: "💡", text: "AI 키워드 광고 추천" },
  { emoji: "📄", text: "월간 마케팅 리포트 PDF 자동 생성" },
];

export default function Features() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        {/* v1 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-semibold uppercase tracking-widest text-primary-brand"
        >
          첫 출시 기능
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          이런 걸 해드립니다
        </motion.h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {v1Features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group rounded-2xl border border-base-light/80 bg-gradient-to-b from-base-light/20 to-transparent p-6 transition-all hover:border-primary-brand/20 hover:shadow-lg hover:shadow-primary-brand/5"
            >
              <span className="text-4xl">{feat.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-primary-dark">
                {feat.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-primary-dark/60">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* v2-v3 로드맵 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center">
            <Badge className="bg-accent-gold/15 text-accent-gold border-transparent px-4 py-1 text-sm font-semibold">
              업데이트 예정
            </Badge>
            <h3 className="mt-4 font-display text-2xl font-bold text-primary-dark md:text-3xl">
              이것도 준비 중이에요
            </h3>
          </div>

          <div className="mx-auto mt-10 max-w-2xl space-y-4">
            {v2Features.map((feat, i) => (
              <motion.div
                key={feat.text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-xl border border-base-light/60 bg-base-light/20 px-5 py-4 transition-all hover:border-primary-brand/20"
              >
                <span className="text-2xl">{feat.emoji}</span>
                <span className="text-base font-medium text-primary-dark/80">
                  {feat.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
