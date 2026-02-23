import { NextResponse } from "next/server";
import { analyzeKeywords } from "@/lib/analyzer/keywordAnalyzer";
import type { PlaceData, ScoreResult } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placeData, scoreResult, competitors } = body as {
      placeData?: PlaceData;
      scoreResult?: ScoreResult;
      competitors?: { name: string; keywords: string[] }[];
    };

    if (!placeData || !scoreResult) {
      return NextResponse.json(
        { error: "가게 데이터와 점수 결과가 필요합니다." },
        { status: 400 },
      );
    }

    const recommendation = await analyzeKeywords({
      placeData,
      scoreResult,
      competitors,
    });

    return NextResponse.json({ recommendation });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "키워드 추천 중 오류가 발생했습니다.";
    console.error("[Keywords API]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
