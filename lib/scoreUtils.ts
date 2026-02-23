/**
 * 점수 관련 공유 유틸 (ScoreDemo + 대시보드)
 */

import type { Status } from "@/types";

export function getScoreColor(score: number): string {
  if (score <= 40) return "text-accent-hot";
  if (score <= 70) return "text-accent-gold";
  return "text-primary-brand";
}

export function getScoreTrackColor(score: number): string {
  if (score <= 40) return "#fb8500";
  if (score <= 70) return "#ffb703";
  return "#219ebc";
}

export function getStatusBadge(status: Status): {
  text: string;
  className: string;
} {
  switch (status) {
    case "bad":
      return { text: "부족", className: "bg-accent-hot/10 text-accent-hot border-transparent" };
    case "warning":
      return { text: "보통", className: "bg-accent-gold/10 text-accent-gold border-transparent" };
    case "good":
      return { text: "양호", className: "bg-primary-brand/10 text-primary-brand border-transparent" };
  }
}

export function getBarColor(status: Status): string {
  switch (status) {
    case "bad":
      return "bg-accent-hot";
    case "warning":
      return "bg-accent-gold";
    case "good":
      return "bg-primary-brand";
  }
}

export function getScoreBg(score: number): string {
  if (score <= 40) return "bg-orange-50";
  if (score <= 70) return "bg-amber-50";
  return "bg-sky-50";
}

export function getScoreBorderColor(score: number): string {
  if (score <= 40) return "#fb8500";
  if (score <= 70) return "#ffb703";
  return "#219ebc";
}
