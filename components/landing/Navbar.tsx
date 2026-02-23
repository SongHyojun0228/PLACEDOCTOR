"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, [supabase.auth]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }, [supabase.auth]);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 shadow-sm backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a
          href="/"
          className={`font-logo text-xl tracking-wide transition-colors ${
            scrolled ? "text-primary-dark" : "text-white"
          }`}
        >
          플레이스닥터
          <span className="ml-1 inline-block animate-bounce text-sm">🩺</span>
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                asChild
                className="h-11 cursor-pointer rounded-lg bg-primary-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hot"
              >
                <a href="/dashboard">내 대시보드</a>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={`h-11 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-primary-dark/60 hover:bg-primary-dark/5 hover:text-primary-dark"
                    : "text-base-light/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className={`hidden h-11 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors sm:inline-flex ${
                  scrolled
                    ? "text-primary-dark hover:bg-primary-dark/5"
                    : "text-base-light/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <a href="/login">로그인</a>
              </Button>
              <Button
                asChild
                className="h-11 cursor-pointer rounded-lg bg-primary-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hot"
              >
                <a href="#cta">무료 진단받기</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
