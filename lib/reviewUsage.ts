/**
 * 리뷰 답변 생성 사용량 추적 (localStorage)
 * MVP: 클라이언트 사이드 월별 횟수 제한
 */

const STORAGE_KEY = "placedoctor_review_usage";
export const FREE_MONTHLY_LIMIT = 3;

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

function readUsage(): UsageData {
  try {
    if (typeof window === "undefined") return { month: getCurrentMonth(), count: 0 };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { month: getCurrentMonth(), count: 0 };
    const data = JSON.parse(raw) as UsageData;
    // 월 변경 시 자동 리셋
    if (data.month !== getCurrentMonth()) {
      return { month: getCurrentMonth(), count: 0 };
    }
    return data;
  } catch {
    return { month: getCurrentMonth(), count: 0 };
  }
}

function writeUsage(data: UsageData): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota 초과 등 무시
  }
}

export function getUsage(): { used: number; remaining: number; limit: number } {
  const data = readUsage();
  const remaining = Math.max(0, FREE_MONTHLY_LIMIT - data.count);
  return { used: data.count, remaining, limit: FREE_MONTHLY_LIMIT };
}

export function canGenerate(): boolean {
  return getUsage().remaining > 0;
}

export function incrementUsage(): void {
  const data = readUsage();
  data.count += 1;
  writeUsage(data);
}
