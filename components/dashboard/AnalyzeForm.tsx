"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnalyzeFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function AnalyzeForm({ onSubmit, isLoading, disabled }: AnalyzeFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setError("URL 또는 가게명을 입력해주세요.");
      return;
    }

    setError("");
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="네이버 플레이스 URL 또는 가게명 입력"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          disabled={isLoading || disabled}
          className="h-12 flex-1 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary-brand"
        />
        <Button
          type="submit"
          disabled={isLoading || disabled}
          className="h-12 cursor-pointer rounded-xl bg-primary-brand px-8 text-base font-semibold text-white transition-colors hover:bg-primary-brand/80 disabled:opacity-50"
        >
          {isLoading ? "분석 중..." : "진단하기"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-accent-hot">{error}</p>}
    </form>
  );
}
