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
      {/* 글로우 */}
      <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-brand/10 blur-[120px]" />

      <div className="relative mx-auto max-w-xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-brand">
            출시 알림
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            완성되면 가장 먼저
            <br />
            알려드릴게요
          </h2>
          <p className="mt-4 text-lg text-base-light/60">
            이메일 남겨주시면 <strong className="text-white">1개월 무료 체험</strong>을 드립니다
          </p>
        </motion.div>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-2xl border border-primary-brand/20 bg-primary-brand/10 px-6 py-10 text-center backdrop-blur-sm"
          >
            <p className="text-4xl">🎉</p>
            <p className="mt-3 text-2xl font-bold text-white">등록 완료!</p>
            <p className="mt-2 text-base text-base-light/70">
              출시되면 가장 먼저 연락드릴게요
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 space-y-4"
          >
            <Input
              type="email"
              required
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl border-white/10 bg-white/[0.07] px-5 text-base text-white placeholder:text-base-light/30 focus-visible:border-primary-brand focus-visible:ring-primary-brand/30"
            />

            <div>
              <p className="mb-2 text-sm text-base-light/40">업종 선택</p>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(category === cat ? "" : cat)}
                    className={`cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      category === cat
                        ? "bg-primary-brand text-white shadow-md shadow-primary-brand/20"
                        : "bg-white/[0.06] text-base-light/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="text"
              placeholder="가장 어려운 점 (선택) 예: 사진을 어떻게 올려야 할지 모르겠어요"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-14 rounded-xl border-white/10 bg-white/[0.07] px-5 text-base text-white placeholder:text-base-light/30 focus-visible:border-primary-brand focus-visible:ring-primary-brand/30"
            />

            {status === "error" && errorMsg && (
              <p className="text-sm text-accent-hot">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={status === "submitting"}
              className="h-14 w-full cursor-pointer rounded-xl bg-accent-hot px-8 text-lg font-semibold text-white shadow-lg shadow-accent-hot/25 transition-all hover:brightness-110 disabled:opacity-60"
            >
              {status === "submitting" ? "등록 중..." : "출시 알림 받기"}
            </Button>

            <p className="text-center text-xs text-base-light/30">
              스팸 없이 출시 소식만 보내드려요
            </p>
          </motion.form>
        )}
      </div>
    </section>
  );
}
