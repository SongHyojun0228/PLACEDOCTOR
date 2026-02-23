import { NextResponse } from "next/server";
import { scrapePlaceDataWithId, searchAndScrape } from "@/lib/scraper/naverPlace";
import { calculateScore } from "@/lib/analyzer/scoreCalculator";
import { generateComment } from "@/lib/ai/placeAnalyzer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json(
        { error: "네이버 플레이스 URL을 입력해주세요." },
        { status: 400 }
      );
    }

    const trimmed = url.trim();

    let placeId: string;
    let placeData;

    // URL 형식이면 직접 크롤링, 아니면 가게명 검색
    const isUrl =
      trimmed.includes("place.naver.com") ||
      trimmed.includes("naver.me") ||
      /^\d+$/.test(trimmed);

    if (isUrl) {
      try {
        const result = await scrapePlaceDataWithId(trimmed);
        placeId = result.placeId;
        placeData = result.placeData;
      } catch (scrapeErr) {
        const msg =
          scrapeErr instanceof Error
            ? scrapeErr.message
            : "가게 정보를 가져올 수 없습니다.";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    } else {
      // 가게명 검색 폴백
      try {
        placeData = await searchAndScrape(trimmed);
        placeId = `search_${Date.now()}`;
      } catch (searchErr) {
        const msg =
          searchErr instanceof Error
            ? searchErr.message
            : "가게 정보를 찾을 수 없습니다.";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    let scoreResult;
    try {
      scoreResult = calculateScore(placeData);
    } catch (scoreErr) {
      console.error("[analyze] calculateScore error:", scoreErr);
      return NextResponse.json(
        { error: "점수 계산 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // AI 분석 코멘트 (실패해도 진단 결과는 반환)
    const aiComment = await generateComment(placeData, scoreResult);

    return NextResponse.json({
      placeId,
      placeData,
      scoreResult,
      aiComment,
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
