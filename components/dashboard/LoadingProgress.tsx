"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "가게 페이지에 접속하고 있어요", icon: "🌐" },
  { label: "정보를 수집하고 있어요", icon: "📥" },
  { label: "점수를 계산하고 있어요", icon: "🧮" },
  { label: "리포트를 생성하고 있어요", icon: "📊" },
];

const STEP_INTERVAL = 5000;

export default function LoadingProgress() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, STEP_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center gap-6 py-16"
    >
      {/* 스피너 */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-3 w-3 rounded-full bg-primary-brand"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 단계 표시 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <span className="text-xl">{STEPS[step].icon}</span>
          <p className="text-lg text-gray-700">{STEPS[step].label}</p>
        </motion.div>
      </AnimatePresence>

      {/* 진행률 바 */}
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-primary-brand"
          initial={{ width: "5%" }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-gray-400">
        최대 30초 정도 걸릴 수 있어요
      </p>
    </motion.div>
  );
}
