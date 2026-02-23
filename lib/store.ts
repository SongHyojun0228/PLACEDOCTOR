/**
 * localStorage 헬퍼 (MVP 저장소)
 * Supabase DB 이전 전까지 클라이언트 사이드 저장
 */

import type { PlaceData, ScoreResult } from "@/types";
import type { CompetitorData } from "@/app/api/competitors/route";
import type { CompetitorInsight } from "@/lib/ai/competitorAnalyzer";

const STORAGE_KEY = "placedoctor_stores";

export interface StoredStore {
  placeId: string;
  name: string;
  category: string;
  totalScore: number;
  analyzedAt: string; // ISO string
  placeData: PlaceData;
  scoreResult: ScoreResult;
  aiComment?: string | null;
  competitors?: CompetitorData[] | null;
  competitorInsight?: CompetitorInsight | null;
}

function readAll(): StoredStore[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredStore[];
  } catch {
    return [];
  }
}

function writeAll(stores: StoredStore[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
  } catch {
    // quota 초과 등 무시
  }
}

export function getStores(): StoredStore[] {
  return readAll().sort(
    (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
  );
}

export function getStore(placeId: string): StoredStore | null {
  return readAll().find((s) => s.placeId === placeId) ?? null;
}

export function saveStore(store: StoredStore): void {
  const stores = readAll();
  const idx = stores.findIndex((s) => s.placeId === store.placeId);
  if (idx >= 0) {
    stores[idx] = store;
  } else {
    stores.push(store);
  }
  writeAll(stores);
}

export function deleteStore(placeId: string): void {
  const stores = readAll().filter((s) => s.placeId !== placeId);
  writeAll(stores);
}
