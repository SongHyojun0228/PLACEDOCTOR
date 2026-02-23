"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target, count, rounded]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 200,
    suffix: "만+",
    label: "네이버 플레이스 등록 업소",
  },
  {
    value: 85,
    suffix: "%",
    label: "제대로 관리 안 되는 비율",
  },
  {
    value: 22,
    suffix: "%",
    label: "디지털 전환 시 평균 매출 증가",
  },
];

export default function SocialProof() {
  return (
    <section className="bg-primary-dark py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-5">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-accent-gold md:text-5xl">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm text-base-light/50">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
