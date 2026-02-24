"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const v1Features = [
  {
    emoji: "📊",
    title: "100점 만점 진단 · 무제한",
    desc: "가게 URL만 넣으면 5초 만에 사진·메뉴·리뷰·키워드·활동성을 종합 진단",
  },
  {
    emoji: "🤖",
    title: "AI 상권 데이터 분석",
    desc: "네이버 알고리즘 감점 요인, 상권 입지, 맞춤 검색어까지 전문가급 리포트 제공",
  },
  {
    emoji: "💬",
    title: "AI 리뷰 답변 생성 (월 50회)",
    desc: "미답변 리뷰를 톤(친근·정중·유머) 선택 후 원클릭으로 답변 생성 · 복사",
  },
  {
    emoji: "🏪",
    title: "동네 경쟁 가게 비교",
    desc: "같은 동네 같은 업종 최대 3곳과 리뷰 수·사진 수·별점 자동 비교",
  },
  {
    emoji: "🔑",
    title: "키워드 분석 (10개)",
    desc: "가게에 설정된 키워드를 분석하고, 검색 노출에 유리한 키워드 전략 제안",
  },
  {
    emoji: "📋",
    title: "'이것만 고치세요' 맞춤 가이드",
    desc: "항목별 점수와 구체적 개선 포인트를 한눈에 확인",
  },
];

const v2Features = [
  { emoji: "📈", text: "네이버 플레이스 검색 순위 변동 실시간 추적" },
  { emoji: "🔔", text: "주간 성적표 알림 (내 가게 점수 변화 리포트)" },
  { emoji: "🏆", text: "경쟁 가게 새 리뷰 · 메뉴 변경 · 순위 변동 알림" },
  { emoji: "✏️", text: "AI 소개글 · 메뉴 설명 자동 생성 (검색 최적화)" },
  { emoji: "📱", text: "인스타 / 블로그용 마케팅 콘텐츠 AI 생성" },
  { emoji: "📄", text: "월간 마케팅 리포트 PDF 자동 발행" },
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
          지금 무료로 사용 가능
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          지금 바로 쓸 수 있어요
        </motion.h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
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
