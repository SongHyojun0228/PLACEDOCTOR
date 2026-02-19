"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          href="#"
          className={`font-logo text-xl tracking-wide transition-colors ${
            scrolled ? "text-primary-dark" : "text-white"
          }`}
        >
          플레이스닥터
          <span className="ml-1 inline-block animate-bounce text-sm">🩺</span>
        </a>

        <Button
          asChild
          className="h-11 cursor-pointer rounded-lg bg-primary-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hot"
        >
          <a href="#cta">무료 진단받기</a>
        </Button>
      </div>
    </nav>
  );
}
