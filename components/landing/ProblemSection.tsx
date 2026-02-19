"use client";

import { motion } from "framer-motion";

const problems = [
  {
    emoji: "😶",
    title: "등록만 하고 방치 중",
    quote: "네이버 플레이스 등록은 했는데… 그 다음 뭘 해야 하는지 모르겠어요.",
  },
  {
    emoji: "😤",
    title: "옆 가게만 잘 뜸",
    quote: "같은 동네 같은 업종인데 검색하면 옆 가게만 나와요. 왜죠?",
  },
  {
    emoji: "💸",
    title: "대행사는 너무 비쌈",
    quote: "상담받아봤는데 월 50만원이래요. 작은 가게한테 그게 돼요?",
  },
];

export default function ProblemSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-5">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-semibold uppercase tracking-widest text-primary-brand"
        >
          사장님들의 진짜 고민
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mt-3 text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          혹시 이런 상황 아니세요?
        </motion.h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.12 }}
              className="group relative rounded-2xl border border-base-light/80 bg-gradient-to-b from-base-light/20 to-transparent p-6 transition-all hover:border-primary-brand/20 hover:shadow-lg hover:shadow-primary-brand/5"
            >
              <span className="text-4xl">{item.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-primary-dark">
                {item.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-primary-dark/60">
                &ldquo;{item.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-14 max-w-lg rounded-2xl bg-gradient-to-r from-primary-dark to-base-dark px-6 py-5 text-center"
        >
          <p className="text-lg font-semibold leading-relaxed text-white">
            그래서 만들고 있습니다.
            <br />
            <span className="text-primary-brand">AI가 5초 만에 진단</span>하고,{" "}
            <span className="text-accent-gold">뭘 고쳐야 하는지</span> 알려주는 도구.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
