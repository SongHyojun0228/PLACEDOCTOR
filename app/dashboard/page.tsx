"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import AnalyzeForm from "@/components/dashboard/AnalyzeForm";
import LoadingProgress from "@/components/dashboard/LoadingProgress";
import StoreCard from "@/components/dashboard/StoreCard";
import DeleteModal from "@/components/dashboard/DeleteModal";
import { createClient } from "@/lib/supabase/client";
import { getStores, saveStore, deleteStore } from "@/lib/store";
import { getFeatureLimit, getUsage, canUse, incrementUsage } from "@/lib/plan";
import type { StoredStore } from "@/lib/store";
import type { PlaceData, ScoreResult, Plan } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoredStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ placeId: string; name: string } | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [analysisExhausted, setAnalysisExhausted] = useState(false);

  useEffect(() => {
    setStores(getStores());

    // 현재 플랜 로드
    async function loadPlan() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      const plan = (data?.plan as Plan) || "free";
      setCurrentPlan(plan);
      const limit = getFeatureLimit(plan, "analysis");
      setAnalysisExhausted(!canUse("analysis", limit));
    }
    loadPlan();
  }, []);

  const handleDeleteRequest = useCallback((placeId: string) => {
    const store = stores.find((s) => s.placeId === placeId);
    if (store) {
      setDeleteTarget({ placeId, name: store.name });
    }
  }, [stores]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteStore(deleteTarget.placeId);
      setStores(getStores());
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleAnalyze = useCallback(
    async (url: string) => {
      const limit = getFeatureLimit(currentPlan, "analysis");
      if (!canUse("analysis", limit)) {
        setAnalysisExhausted(true);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "분석에 실패했습니다.");
          setIsLoading(false);
          return;
        }

        const { placeId, placeData, scoreResult, aiComment } = data as {
          placeId: string;
          placeData: PlaceData;
          scoreResult: ScoreResult;
          aiComment?: string | null;
        };

        const stored: StoredStore = {
          placeId,
          name: placeData.name,
          category: placeData.category,
          totalScore: scoreResult.total,
          analyzedAt: new Date().toISOString(),
          placeData,
          scoreResult,
          aiComment,
        };

        saveStore(stored);
        incrementUsage("analysis");
        setStores(getStores());
        setIsLoading(false);

        // 사용 후 소진 여부 갱신
        const updatedLimit = getFeatureLimit(currentPlan, "analysis");
        setAnalysisExhausted(!canUse("analysis", updatedLimit));

        router.push(`/dashboard/${placeId}`);
      } catch {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        setIsLoading(false);
      }
    },
    [router, currentPlan]
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
            내 가게 진단하기
          </h1>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              currentPlan === "pro"
                ? "bg-primary-dark text-white"
                : currentPlan === "basic"
                  ? "bg-primary-brand text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentPlan === "pro" ? "프로" : currentPlan === "basic" ? "베이직" : "무료"}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-2 text-gray-500">
          네이버 플레이스 URL을 입력하면 AI가 점수를 분석해드려요.
          <Link href="/dashboard/plan" className="text-sm font-medium text-primary-brand hover:underline">
            요금제 관리
          </Link>
        </p>
      </motion.div>

      {/* 분석 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8"
      >
        <AnalyzeForm onSubmit={handleAnalyze} isLoading={isLoading} disabled={analysisExhausted} />
        {analysisExhausted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            이번 달 무료 진단을 사용했어요.{" "}
            <Link href="/dashboard/plan" className="font-semibold text-primary-brand underline hover:no-underline">
              요금제를 업그레이드
            </Link>
            하면 무제한으로 진단할 수 있어요.
          </motion.div>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-accent-hot"
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* 로딩 */}
      <AnimatePresence>
        {isLoading && <LoadingProgress key="loading" />}
      </AnimatePresence>

      {/* 기존 진단 기록 */}
      {!isLoading && stores.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            진단 기록
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {stores.map((store, i) => (
                <StoreCard
                  key={store.placeId}
                  store={store}
                  index={i}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* 빈 상태 */}
      {!isLoading && stores.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-4xl">🏪</p>
          <p className="mt-4 text-gray-500">
            아직 진단한 가게가 없어요.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            위에서 네이버 플레이스 URL을 입력해보세요!
          </p>
        </motion.div>
      )}

      {/* 삭제 확인 모달 */}
      <DeleteModal
        open={deleteTarget !== null}
        storeName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
