/**
 * AI 경쟁 분석 코멘트 생성
 * Claude Sonnet — 경쟁 비교 분석
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PlaceData, ScoreResult } from "@/types";

const client = new Anthropic();

export interface CompetitorInsight {
  perCompetitor: { name: string; reason: string }[];
  myAdvantages: string[];
  actionItems: string[];
}

const SYSTEM_PROMPT = `당신은 네이버 플레이스 최적화 전문가이며 경쟁 분석 담당입니다.
소상공인 사장님(평균 53세)에게 말하듯 쉬운 한국어로 답변하세요.

규칙:
- IT 용어 금지. "SEO"→"검색 노출", "CTR"→"클릭률"
- 주어진 데이터의 숫자만 사용. 없는 숫자를 만들지 마세요
- 공포 유발 금지. 건설적인 톤으로
- 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 추가하지 마세요.

JSON 형식:
{
  "perCompetitor": [{"name": "가게명", "reason": "이 가게가 검색에서 위에 뜨는 이유 1~2문장"}],
  "myAdvantages": ["내가 이기고 있는 점 1", "내가 이기고 있는 점 2"],
  "actionItems": ["구체적 행동 제안 1", "구체적 행동 제안 2", "구체적 행동 제안 3"]
}`;

interface CompetitorData {
  placeData: PlaceData;
  scoreResult: ScoreResult;
}

function buildComparisonPrompt(
  myData: PlaceData,
  myScore: ScoreResult,
  competitors: CompetitorData[],
): string {
  const myInfo = `[내 가게] ${myData.name}
- 총점: ${myScore.total}/100
- 리뷰: ${myData.reviews.total}개 (평점 ${myData.reviews.avgRating.toFixed(1)})
- 답변률: ${Math.round(myData.reviews.ownerReplyRate * 100)}%
- 사진: 업체 ${myData.photos.business}장
- 소개글: ${myData.description.length}자
- 메뉴: ${myData.menus.length}개
- 키워드: ${myData.keywords.length}개`;

  const compInfos = competitors.map((c, i) => {
    const d = c.placeData;
    const s = c.scoreResult;
    return `[경쟁 ${i + 1}] ${d.name}
- 총점: ${s.total}/100
- 리뷰: ${d.reviews.total}개 (평점 ${d.reviews.avgRating.toFixed(1)})
- 답변률: ${Math.round(d.reviews.ownerReplyRate * 100)}%
- 사진: 업체 ${d.photos.business}장
- 소개글: ${d.description.length}자
- 메뉴: ${d.menus.length}개
- 키워드: ${d.keywords.length}개`;
  });

  return `${myInfo}

${compInfos.join("\n\n")}

위 데이터를 비교 분석해주세요:
1. 각 경쟁 가게가 검색 결과에서 위에 뜨는 이유를 1~2문장으로
2. 내가 이기고 있는 점 (데이터 기반)
3. 따라잡기 위한 구체적 행동 제안 (사장님이 바로 실행 가능한 것) 1~3개`;
}

/**
 * 경쟁 비교 AI 분석 생성
 * 실패 시 null 반환 (non-blocking)
 */
export async function generateCompetitorInsight(
  myData: PlaceData,
  myScore: ScoreResult,
  competitors: CompetitorData[],
): Promise<CompetitorInsight | null> {
  if (competitors.length === 0) return null;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildComparisonPrompt(myData, myScore, competitors) },
      ],
    });

    const text = response.content[0];
    if (text.type !== "text") return null;

    // AI가 ```json ... ``` 로 감싸는 경우 제거
    const raw = text.text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const parsed = JSON.parse(raw) as CompetitorInsight;

    // 최소 검증
    if (!Array.isArray(parsed.perCompetitor) || !Array.isArray(parsed.myAdvantages) || !Array.isArray(parsed.actionItems)) {
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("[AI] 경쟁 분석 생성 실패:", err);
    return null;
  }
}
