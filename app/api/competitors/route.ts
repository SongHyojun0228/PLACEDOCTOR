import { NextResponse } from "next/server";
import { scrapeCompetitors } from "@/lib/scraper/competitorSearch";
import { fetchGraphQL } from "@/lib/scraper/naverPlace";
import { calculateScore } from "@/lib/analyzer/scoreCalculator";
import { generateCompetitorInsight } from "@/lib/ai/competitorAnalyzer";
import type { PlaceData, ScoreResult } from "@/types";

export interface CompetitorData {
  placeId: string;
  placeData: PlaceData;
  scoreResult: ScoreResult;
  distance: number; // km
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { myPlaceId, category, address, storeName, myLat, myLng } = body as {
      myPlaceId?: string;
      category?: string;
      address?: string;
      storeName?: string;
      myLat?: number | null;
      myLng?: number | null;
    };

    if (!category || !address) {
      return NextResponse.json(
        { error: "카테고리와 주소 정보가 필요합니다." },
        { status: 400 },
      );
    }

    if (!myPlaceId) {
      return NextResponse.json(
        { error: "내 가게 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // 0. 좌표/지번주소가 없으면 (구버전 데이터) GraphQL로 가져오기
    let lat = myLat ?? null;
    let lng = myLng ?? null;
    let jibeonAddress: string | undefined;
    if (!lat || !lng) {
      try {
        const myGql = await fetchGraphQL(myPlaceId);
        if (myGql?.base?.coordinate) {
          lat = parseFloat(myGql.base.coordinate.y) || null;
          lng = parseFloat(myGql.base.coordinate.x) || null;
        }
        if (myGql?.base?.address) {
          jibeonAddress = myGql.base.address;
        }
      } catch {
        // 가져오기 실패해도 계속 진행
      }
    }

    // 1. 경쟁 가게 크롤링 (반경 1km 이내 전부)
    const scraped = await scrapeCompetitors(
      myPlaceId,
      category,
      address,
      storeName || "",
      lat,
      lng,
      jibeonAddress,
    );

    if (scraped.length === 0) {
      return NextResponse.json({
        competitors: [],
        insight: null,
      });
    }

    // 2. 각 경쟁 가게 점수 계산 (이미 거리순 정렬됨)
    const competitors: CompetitorData[] = scraped.map((s) => ({
      placeId: s.placeId,
      placeData: s.placeData,
      scoreResult: calculateScore(s.placeData),
      distance: s.distance,
    }));

    // 3. 내 가게 데이터로 AI 비교 분석
    const { myPlaceData, myScoreResult } = body as {
      myPlaceData?: PlaceData;
      myScoreResult?: ScoreResult;
    };

    let insight = null;
    if (myPlaceData && myScoreResult) {
      insight = await generateCompetitorInsight(
        myPlaceData,
        myScoreResult,
        competitors.map((c) => ({
          placeData: c.placeData,
          scoreResult: c.scoreResult,
        })),
      );
    }

    return NextResponse.json({ competitors, insight });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "경쟁 분석 중 오류가 발생했습니다.";
    console.error("[Competitors API]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
