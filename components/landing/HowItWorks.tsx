"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: "🔗",
    title: "가게 URL 입력",
    desc: "네이버 플레이스 링크를 붙여넣기만 하면 끝",
  },
  {
    number: "02",
    icon: "🤖",
    title: "AI가 5초 만에 분석",
    desc: "사진·메뉴·리뷰·키워드를 한번에 진단",
  },
  {
    number: "03",
    icon: "📋",
    title: "맞춤 개선점 확인",
    desc: "'이것만 고치세요' 구체적 가이드 제공",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-base-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-5">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-semibold uppercase tracking-widest text-primary-brand"
        >
          사용 방법
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          딱 3단계면 충분해요
        </motion.h2>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {/* 연결선 (데스크톱) */}
          <div className="absolute top-16 right-[17%] left-[17%] hidden h-px bg-gradient-to-r from-transparent via-primary-brand/30 to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* 원형 아이콘 */}
              <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg shadow-primary-brand/5">
                <span className="text-5xl">{step.icon}</span>
              </div>

              {/* 번호 */}
              <span className="mt-5 text-xs font-bold tracking-widest text-primary-brand">
                STEP {step.number}
              </span>

              <h3 className="mt-2 text-lg font-bold text-primary-dark">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-primary-dark/60">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
