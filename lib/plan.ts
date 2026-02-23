/**
 * 플랜별 기능 사용량 추적 (localStorage)
 * lib/reviewUsage.ts를 일반화한 통합 모듈
 */

import type { Plan } from "@/types";
import { PLAN_LIMITS } from "@/types";

export type Feature = "analysis" | "reviewReply";

interface UsageData {
  month: string; // "2026-02"
  count: number;
}

function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function storageKey(feature: Feature): string {
  return `placedoctor_usage_${feature}`;
}

function readUsage(feature: Feature): UsageData {
  try {
    if (typeof window === "undefined") return { month: getCurrentMonth(), count: 0 };
    const raw = localStorage.getItem(storageKey(feature));
    if (!raw) return { month: getCurrentMonth(), count: 0 };
    const data = JSON.parse(raw) as UsageData;
    if (data.month !== getCurrentMonth()) {
      return { month: getCurrentMonth(), count: 0 };
    }
    return data;
  } catch {
    return { month: getCurrentMonth(), count: 0 };
  }
}

function writeUsage(feature: Feature, data: UsageData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey(feature), JSON.stringify(data));
  } catch {
    // quota 초과 등 무시
  }
}

export function getFeatureLimit(plan: Plan, feature: Feature): number {
  const limits = PLAN_LIMITS[plan];
  switch (feature) {
    case "analysis":
      return limits.monthlyAnalyses;
    case "reviewReply":
      return limits.monthlyReviewReplies;
  }
}

export function getUsage(
  feature: Feature,
  limit: number
): { used: number; remaining: number; limit: number } {
  const data = readUsage(feature);
  // -1 = 무제한
  if (limit === -1) {
    return { used: data.count, remaining: Infinity, limit: -1 };
  }
  const remaining = Math.max(0, limit - data.count);
  return { used: data.count, remaining, limit };
}

export function canUse(feature: Feature, limit: number): boolean {
  if (limit === -1) return true;
  return getUsage(feature, limit).remaining > 0;
}

export function incrementUsage(feature: Feature): void {
  const data = readUsage(feature);
  data.count += 1;
  writeUsage(feature, data);
}

export function isFeatureAvailable(plan: Plan, feature: Feature): boolean {
  switch (feature) {
    case "analysis":
      return PLAN_LIMITS[plan].monthlyAnalyses !== 0;
    case "reviewReply":
      return PLAN_LIMITS[plan].monthlyReviewReplies !== 0;
    default:
      return true;
  }
}
