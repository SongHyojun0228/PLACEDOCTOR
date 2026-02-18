"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categoryOptions = [
  "카페",
  "음식점",
  "미용실",
  "병원",
  "학원",
  "숙소",
  "기타",
];

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setErrorMsg("올바른 이메일 주소를 입력해주세요.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category, difficulty }),
      });

      const data = (await res.json()) as { success: boolean; message: string };

      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.message);
        setStatus("error");
      }
    } catch {
      setErrorMsg("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setStatus("error");
    }
  };

  return (
    <section className="relative overflow-hidden bg-primary-dark py-20 md:py-28">
      {/* 도트 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e0e1dd 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative mx-auto max-w-xl px-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center font-display text-3xl font-bold text-white md:text-4xl"
        >
          출시되면 가장 먼저 알려드릴게요
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="mt-4 text-center text-lg text-base-light/70"
        >
          지금 등록하시면 1개월 무료 체험을 드립니다
        </motion.p>

        {/* 성공 메시지 */}
        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-2xl bg-white/10 px-6 py-10 text-center backdrop-blur-sm"
          >
            <p className="text-2xl font-bold text-white">
              등록 완료!
            </p>
            <p className="mt-2 text-lg text-base-light/80">
              출시되면 가장 먼저 연락드릴게요
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="mt-10 space-y-4"
          >
            {/* 이메일 */}
            <Input
              type="email"
              required
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-13 rounded-xl border-white/20 bg-white/10 px-5 text-base text-white placeholder:text-base-light/40 focus-visible:border-primary-brand focus-visible:ring-primary-brand/30"
            />

            {/* 업종 선택 */}
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                    category === cat
                      ? "bg-primary-brand text-white"
                      : "bg-white/10 text-base-light/60 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 가장 어려운 점 */}
            <Input
              type="text"
              placeholder="가장 어려운 점 (선택) 예: 사진을 어떻게 올려야 할지 모르겠어요"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-13 rounded-xl border-white/20 bg-white/10 px-5 text-base text-white placeholder:text-base-light/40 focus-visible:border-primary-brand focus-visible:ring-primary-brand/30"
            />

            {/* 에러 메시지 */}
            {status === "error" && errorMsg && (
              <p className="text-sm text-accent-hot">{errorMsg}</p>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              disabled={status === "submitting"}
              className="h-14 w-full cursor-pointer rounded-xl bg-accent-hot px-8 text-lg font-semibold text-white transition-colors hover:bg-accent-hot/90 disabled:opacity-60"
            >
              {status === "submitting" ? "등록 중..." : "출시 알림 받기"}
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
