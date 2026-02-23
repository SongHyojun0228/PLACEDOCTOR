/**
 * AI 리뷰 답변 생성
 * Claude Sonnet — 답변 1건당 예상 비용 $0.005~0.01
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Review, ReviewReply, ReviewTone } from "@/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `당신은 네이버 플레이스 리뷰 답변 작성 전문가입니다.
사장님 대신 고객 리뷰에 답변을 작성합니다.

규칙:
- 50~100자 내외 (짧고 진심 있게)
- 이모지 1~2개 자연스럽게 포함
- 리뷰 내용을 구체적으로 언급 (메뉴명, 칭찬 포인트 등)
- 재방문을 자연스럽게 유도
- 부정 리뷰(별점 3점 이하): 반드시 사과 + 개선 의지 포함
- 과도한 광고 금지. 진심이 느껴지는 답변

출력 형식:
답변 3개를 아래 형식으로 작성하세요. 다른 텍스트 없이 답변만 작성합니다.

1. (첫 번째 답변)
2. (두 번째 답변)
3. (세 번째 답변)`;

const TONE_INSTRUCTIONS: Record<ReviewTone, string> = {
  friendly: `톤: 친근한 동네 사장님
예시: "맛있게 드셨다니 정말 기뻐요! 😊 김치찌개는 저희 할머니 레시피예요. 다음에 오시면 된장찌개도 한번 드셔보세요~"`,
  professional: `톤: 정중한 프로페셔널
예시: "소중한 리뷰 감사합니다. 김치찌개를 맛있게 즐겨주셨다니 보람을 느낍니다. 다음 방문 시에도 만족스러운 식사가 되도록 하겠습니다."`,
  humorous: `톤: 센스 있는 유머
예시: "저희 김치찌개가 또 한 분의 마음을 훔쳤군요 🤭 다음엔 된장찌개도 도전해보세요, 후회 없으실 겁니다!"`,
};

function getSentiment(rating: number): string {
  if (rating >= 4) return "긍정";
  if (rating >= 3) return "보통";
  return "부정";
}

function buildUserPrompt(
  review: Review,
  storeName: string,
  tone: ReviewTone
): string {
  const sentiment = getSentiment(review.rating);

  return `가게명: ${storeName}
리뷰 작성자: ${review.author}
별점: ${review.rating}점 (${sentiment})
리뷰 내용: ${review.content}

${TONE_INSTRUCTIONS[tone]}

위 리뷰에 대한 답변 3개를 작성해주세요.${
    review.rating <= 3
      ? "\n(부정적 리뷰이므로 사과와 개선 의지를 반드시 포함해주세요)"
      : ""
  }`;
}

function parseReplies(text: string, tone: ReviewTone): ReviewReply[] {
  // "1. ..." "2. ..." "3. ..." 형식 파싱
  const matches = text.match(/\d+\.\s*[^\n]+(?:\n(?!\d+\.)[^\n]*)*/g);

  if (matches && matches.length >= 2) {
    return matches.slice(0, 3).map((m) => ({
      tone,
      content: m.replace(/^\d+\.\s*/, "").trim(),
    }));
  }

  // fallback: 줄바꿈 기준으로 분리
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 10);

  if (lines.length >= 2) {
    return lines.slice(0, 3).map((l) => ({
      tone,
      content: l.replace(/^\d+[\.\)]\s*/, "").trim(),
    }));
  }

  // 최종 fallback: 전체 텍스트를 하나의 답변으로
  return [{ tone, content: text.trim() }];
}

/**
 * 리뷰에 대한 AI 답변 3가지 버전을 생성합니다.
 * 실패 시 null을 반환합니다 (non-blocking).
 */
export async function generateReviewReplies(
  review: Review,
  storeName: string,
  tone: ReviewTone
): Promise<ReviewReply[] | null> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(review, storeName, tone) },
      ],
    });

    const block = response.content[0];
    if (block.type === "text") {
      return parseReplies(block.text, tone);
    }
    return null;
  } catch (err) {
    console.error("[AI] 리뷰 답변 생성 실패:", err);
    return null;
  }
}
