/**
 * AI 분석 코멘트 생성
 * Claude Sonnet — 분석 1건당 예상 비용 $0.01~0.03
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PlaceData, ScoreResult, ScoreDetail } from "@/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `당신은 네이버 플레이스 최적화 전문가입니다.
소상공인 사장님(평균 53세)에게 말하듯 쉬운 한국어로 답변하세요.

규칙:
- IT 용어 금지. "SEO"→"검색 노출", "CTR"→"클릭률"
- 주어진 데이터의 숫자만 사용. 없는 숫자를 만들지 마세요
- 공포 유발 금지. 응원하는 톤으로
- 이모지는 섹션당 1개만

출력 형식 (반드시 지켜주세요):

📊 종합
(총점 기반 1~2문장 요약. 잘하는 점 언급)

[점수가 낮은 항목만 아래 형식으로 작성. 양호한 항목은 생략]

🔧 [항목명] (점수)
- 현재 상태 1줄
- 구체적 개선 방법 1~2줄 (행동 단위로)

💪 마무리
(응원 1문장)`;

const CATEGORY_NAMES: Record<string, string> = {
  basicInfo: "기본 정보",
  photos: "사진",
  reviews: "리뷰",
  menu: "메뉴",
  keywords: "키워드",
  activity: "활성도",
};

function formatDetail(key: string, d: ScoreDetail, extra: string): string {
  const lines = [`${CATEGORY_NAMES[key]}: ${d.score}/${d.max}점 (${d.status === "good" ? "양호" : d.status === "warning" ? "보통" : "부족"})${extra ? " " + extra : ""}`];
  if (d.improvements.length > 0) {
    lines.push(`  개선필요: ${d.improvements.join(" / ")}`);
  }
  if (d.strengths.length > 0) {
    lines.push(`  강점: ${d.strengths.join(" / ")}`);
  }
  return lines.join("\n");
}

function buildUserPrompt(data: PlaceData, score: ScoreResult): string {
  const { details } = score;

  const sections = [
    formatDetail("basicInfo", details.basicInfo, ""),
    formatDetail("photos", details.photos, `업체${data.photos.business}장`),
    formatDetail("reviews", details.reviews, `총${data.reviews.total}개 답변률${Math.round(data.reviews.ownerReplyRate * 100)}%`),
    formatDetail("menu", details.menu, `${data.menus.length}개 등록`),
    formatDetail("keywords", details.keywords, `키워드${data.keywords.length}개`),
    formatDetail("activity", details.activity, ""),
  ];

  return `가게: ${data.name} (${data.category})
주소: ${data.address}
총점: ${score.total}/100점

${sections.join("\n\n")}

위 데이터를 바탕으로 분석 코멘트를 작성해주세요.
- "부족"이나 "보통" 항목 위주로 개선 방법을 알려주세요
- "양호" 항목은 종합에서 짧게 칭찬만 해주세요
- 개선 방법은 사장님이 바로 실행할 수 있는 구체적 행동이어야 합니다`;
}

/**
 * 크롤링 데이터 + 점수를 기반으로 AI 분석 코멘트를 생성합니다.
 * 실패 시 null을 반환합니다 (non-blocking).
 */
export async function generateComment(
  data: PlaceData,
  score: ScoreResult
): Promise<string | null> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(data, score) },
      ],
    });

    const text = response.content[0];
    if (text.type === "text") {
      return text.text;
    }
    return null;
  } catch (err) {
    console.error("[AI] 분석 코멘트 생성 실패:", err);
    return null;
  }
}
