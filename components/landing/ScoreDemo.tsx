"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─────────── 타입 ─────────── */

type Status = "bad" | "warning" | "good";
type Category = "카페" | "음식점" | "미용실";
type Phase = "idle" | "loading" | "result";

interface ScoreItem {
  emoji: string;
  label: string;
  value: string;
  avg: string;
  percent: number;
  status: Status;
}

interface ShopData {
  name: string;
  score: number;
  items: ScoreItem[];
  tip: string;
}

/* ─────────── 샘플 데이터 ─────────── */

const sampleData: Record<Category, ShopData> = {
  카페: {
    name: "블루문 카페",
    score: 62,
    items: [
      { emoji: "📸", label: "사진", value: "5장", avg: "18장", percent: 28, status: "bad" },
      { emoji: "📝", label: "메뉴 설명", value: "키워드 없음", avg: "-", percent: 10, status: "bad" },
      { emoji: "⭐", label: "리뷰", value: "12개", avg: "48개", percent: 25, status: "warning" },
      { emoji: "📍", label: "가게 소개", value: "2줄", avg: "8줄", percent: 25, status: "bad" },
      { emoji: "🕐", label: "최근 활동", value: "3개월 전", avg: "-", percent: 40, status: "warning" },
    ],
    tip: "사진 3장 + 키워드 추가만 해도 75점까지 올라갈 수 있어요!",
  },
  음식점: {
    name: "미소 한식당",
    score: 45,
    items: [
      { emoji: "📸", label: "사진", value: "2장", avg: "15장", percent: 13, status: "bad" },
      { emoji: "📝", label: "메뉴 설명", value: "가격만 등록", avg: "-", percent: 15, status: "bad" },
      { emoji: "⭐", label: "리뷰", value: "5개", avg: "35개", percent: 14, status: "bad" },
      { emoji: "📍", label: "가게 소개", value: "1줄", avg: "8줄", percent: 12, status: "bad" },
      { emoji: "🕐", label: "최근 활동", value: "6개월 전", avg: "-", percent: 20, status: "bad" },
    ],
    tip: "메뉴 사진만 5장 올려도 점수가 크게 올라갈 수 있어요!",
  },
  미용실: {
    name: "헤어봄 살롱",
    score: 78,
    items: [
      { emoji: "📸", label: "사진", value: "22장", avg: "18장", percent: 100, status: "good" },
      { emoji: "📝", label: "메뉴 설명", value: "키워드 포함", avg: "-", percent: 80, status: "good" },
      { emoji: "⭐", label: "리뷰", value: "56개", avg: "48개", percent: 100, status: "good" },
      { emoji: "📍", label: "가게 소개", value: "5줄", avg: "8줄", percent: 62, status: "warning" },
      { emoji: "🕐", label: "최근 활동", value: "2주 전", avg: "-", percent: 70, status: "warning" },
    ],
    tip: "가게 소개를 8줄로 보강하면 85점까지 올라갈 수 있어요!",
  },
};

const categories: Category[] = ["카페", "음식점", "미용실"];

/* ─────────── 유틸 ─────────── */

function getScoreColor(score: number) {
  if (score <= 40) return "text-accent-hot";
  if (score <= 70) return "text-accent-gold";
  return "text-primary-brand";
}

function getScoreTrackColor(score: number) {
  if (score <= 40) return "#fb8500";
  if (score <= 70) return "#ffb703";
  return "#219ebc";
}

function getStatusBadge(status: Status) {
  switch (status) {
    case "bad":
      return { text: "부족", className: "bg-accent-hot/10 text-accent-hot border-transparent" };
    case "warning":
      return { text: "보통", className: "bg-accent-gold/10 text-accent-gold border-transparent" };
    case "good":
      return { text: "양호", className: "bg-primary-brand/10 text-primary-brand border-transparent" };
  }
}

function getBarColor(status: Status) {
  switch (status) {
    case "bad":
      return "bg-accent-hot";
    case "warning":
      return "bg-accent-gold";
    case "good":
      return "bg-primary-brand";
  }
}

/* ─────────── 점수 카운터 ─────────── */

function ScoreCounter({ target, color }: { target: number; color: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.2,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target, count, rounded]);

  return <span className={`text-6xl font-bold tabular-nums md:text-7xl ${color}`}>{display}</span>;
}

/* ─────────── 원형 게이지 ─────────── */

function CircleGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeColor = getScoreTrackColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        {/* 트랙 */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
        />
        {/* 진행 */}
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <ScoreCounter target={score} color={getScoreColor(score)} />
        <span className="text-sm text-base-light/60">/ 100점</span>
      </div>
    </div>
  );
}

/* ─────────── 로딩 도트 ─────────── */

function LoadingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center gap-5 py-16"
    >
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
      <p className="text-lg text-base-light/80">AI 분석 중...</p>
    </motion.div>
  );
}

/* ─────────── 결과 카드 ─────────── */

function ResultCard({ data }: { data: ShopData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full overflow-hidden rounded-2xl bg-white shadow-xl"
    >
      {/* 상단: 가게명 + 점수 게이지 */}
      <div className="flex flex-col items-center gap-4 bg-base-dark px-6 py-8 md:flex-row md:justify-between md:px-10">
        <div className="text-center md:text-left">
          <p className="text-sm text-base-light/60">샘플 가게</p>
          <p className="text-2xl font-bold text-white">{data.name}</p>
        </div>
        <CircleGauge score={data.score} />
      </div>

      {/* 항목별 상세 */}
      <div className="px-6 py-6 md:px-10">
        <div className="space-y-4">
          {data.items.map((item, i) => {
            const badge = getStatusBadge(item.status);
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="text-sm font-medium text-primary-dark">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary-dark/70 sm:text-sm">
                      {item.value}
                      {item.avg !== "-" && (
                        <span className="text-primary-dark/40"> / 평균 {item.avg}</span>
                      )}
                    </span>
                    <Badge variant="outline" className={badge.className}>
                      {badge.text}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-base-light">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.6, delay: 1.0 + i * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${getBarColor(item.status)}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 팁 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-6 rounded-xl bg-accent-gold/10 px-5 py-4"
        >
          <p className="text-sm font-medium text-primary-dark">
            💡 {data.tip}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-6"
        >
          <Button
            asChild
            className="h-12 w-full cursor-pointer rounded-xl bg-accent-hot px-8 text-base font-semibold text-white transition-colors hover:bg-accent-hot/90"
          >
            <a href="#cta">정확한 진단 받기 →</a>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────── 메인 섹션 ─────────── */

export default function ScoreDemo() {
  const [selected, setSelected] = useState<Category>("카페");
  const [phase, setPhase] = useState<Phase>("idle");

  const startDiagnosis = useCallback((category: Category) => {
    setSelected(category);
    setPhase("loading");
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("result"), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleTabClick = (category: Category) => {
    if (category === selected && phase === "result") return;
    startDiagnosis(category);
  };

  return (
    <section id="demo" className="bg-base-dark py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5">
        {/* 타이틀 */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center font-display text-3xl font-bold text-white md:text-4xl"
        >
          우리 가게, 몇 점일까?
        </motion.h2>

        {/* 업종 탭 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-8 flex justify-center gap-3"
        >
          {categories.map((cat) => {
            const isActive = selected === cat && phase !== "idle";
            return (
              <button
                key={cat}
                onClick={() => handleTabClick(cat)}
                className={`cursor-pointer rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-brand text-white shadow-lg shadow-primary-brand/20"
                    : "bg-white/10 text-base-light/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* idle 상태: 진단 시작 버튼 */}
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Button
              onClick={() => startDiagnosis(selected)}
              className="h-14 cursor-pointer rounded-xl bg-primary-brand px-12 text-lg font-semibold text-white transition-colors hover:bg-accent-hot"
            >
              진단 시작
            </Button>
          </motion.div>
        )}

        {/* 로딩 / 결과 */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {phase === "loading" && <LoadingDots key="loading" />}
            {phase === "result" && (
              <ResultCard key={`result-${selected}`} data={sampleData[selected]} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
