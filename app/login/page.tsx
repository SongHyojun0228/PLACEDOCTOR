"use client";

import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function LoginPage() {
  const handleKakaoLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "profile_nickname profile_image",
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-dark px-5">
      {/* 배경 글로우 */}
      <div className="absolute -top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-brand/[0.07] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm text-center"
      >
        {/* 로고 */}
        <p className="font-logo text-2xl tracking-wide text-white">
          플레이스닥터 🩺
        </p>
        <p className="mt-3 text-base text-base-light/60">
          네이버 플레이스 AI 진단 도구
        </p>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          className="mt-10 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#FEE500] text-base font-semibold text-[#191919] transition-all hover:brightness-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 2C5.029 2 1 5.13 1 8.988c0 2.467 1.637 4.632 4.1 5.862l-1.042 3.812c-.092.337.293.607.584.41l4.463-2.954c.29.026.585.04.895.04 4.971 0 9-3.13 9-6.99S14.971 2 10 2Z"
              fill="#191919"
            />
          </svg>
          카카오로 시작하기
        </button>

        <p className="mt-5 text-sm text-base-light/40">
          카카오 계정으로 간편하게 시작하세요
        </p>

        {/* 홈으로 */}
        <a
          href="/"
          className="mt-8 inline-block text-sm text-base-light/30 transition-colors hover:text-base-light/60"
        >
          ← 홈으로 돌아가기
        </a>
      </motion.div>
    </div>
  );
}
