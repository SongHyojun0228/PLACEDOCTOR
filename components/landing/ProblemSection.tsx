"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    emoji: "\uD83D\uDCAC",
    quote: "등록은 했는데 뭐가 바뀐 게 없어요",
  },
  {
    emoji: "\uD83D\uDD0D",
    quote: "옆 가게는 검색하면 바로 뜨는데 우리는 안 보여요",
  },
  {
    emoji: "\uD83D\uDCB8",
    quote: "대행사 맡기자니 월 50만원은 부담되고...",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export default function ProblemSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <motion.h2
          {...fadeInUp}
          className="text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          이런 고민, 사장님만 하는 게 아닙니다
        </motion.h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {problems.map((item, i) => (
            <motion.div
              key={item.emoji}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: i * 0.15,
              }}
            >
              <Card className="h-full border-base-light/60 bg-base-light/30 shadow-none transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4">
                  <span className="shrink-0 text-3xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <p className="text-lg leading-relaxed text-primary-dark/90">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          className="mt-12 text-center text-lg font-semibold text-primary-dark md:text-xl"
        >
          혹시 네이버 플레이스,{" "}
          <span className="text-accent-hot">
            등록만 해두고 방치
          </span>
          하고 계신 건 아닌가요?
        </motion.p>
      </div>
    </section>
  );
}
