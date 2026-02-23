/**
 * 키워드 분석 + AI 추천
 * 3단계: 현재 키워드 정리 → 규칙 기반 추천 → AI 추천
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PlaceData, ScoreResult } from "@/types";

const client = new Anthropic();

/* ─────────── 타입 ─────────── */

export interface RecommendedKeyword {
  keyword: string;
  reason: string;
  guide: string;
}

export interface KeywordRecommendation {
  current: string[];
  recommended: RecommendedKeyword[];
  introductionTip: string;
}

/* ─────────── 유틸 ─────────── */

/** 가게명에서 "OO점" 패턴으로 지역명 추출 */
function extractAreaFromName(name: string): string | null {
  const match = name.match(/\s+(\S+?)(?:점|역점|역직영점|직영점|본점)$/);
  if (match) return match[1];
  return null;
}

/** 주소에서 구/동 추출 */
function extractLocationParts(address: string): {
  gu: string | null;
  dong: string | null;
} {
  const match = address.match(/(\S+[구군])\s*(\S+[동읍면리])?/);
  return {
    gu: match?.[1] ?? null,
    dong: match?.[2] ?? null,
  };
}

/** 카테고리에서 핵심 업종명 추출 */
function extractCategoryKeywords(category: string): string[] {
  return category
    .split(/[>,\/\s]+/)
    .map((s) => s.trim())
    .filter((k) => k.length >= 2);
}

/* ─────────── 1단계: 현재 키워드 정리 ─────────── */

function extractCurrentKeywords(data: PlaceData): string[] {
  const keywords = [...data.keywords];

  // 소개글에서 핵심 단어 추출 (카테고리 관련)
  const intro = data.introduction || data.description || "";
  if (intro) {
    const catKeywords = extractCategoryKeywords(data.category);
    for (const kw of catKeywords) {
      if (intro.toLowerCase().includes(kw.toLowerCase()) && !keywords.includes(kw)) {
        keywords.push(kw);
      }
    }
  }

  return keywords;
}

/* ─────────── 2단계: 규칙 기반 추천 키워드 ─────────── */

function generateRuleBasedKeywords(data: PlaceData): RecommendedKeyword[] {
  const results: RecommendedKeyword[] = [];
  const { gu, dong } = extractLocationParts(data.address);
  const catKeywords = extractCategoryKeywords(data.category);
  const mainCat = catKeywords[catKeywords.length - 1] || catKeywords[0] || data.category;
  const areaHint = extractAreaFromName(data.name);

  // 지역 + 업종 조합
  const locations = [dong, gu, areaHint].filter(Boolean) as string[];
  for (const loc of locations) {
    const kw = `${loc} ${mainCat}`;
    results.push({
      keyword: kw,
      reason: "지역명 + 업종 조합은 검색량이 많은 핵심 키워드입니다",
      guide: `소개글에 "${loc}에서 만나는 ${mainCat}" 같은 문구를 넣어보세요`,
    });
  }

  // 지역 + 맛집/맛집 추천
  if (locations.length > 0) {
    const loc = locations[0];
    results.push({
      keyword: `${loc} 맛집`,
      reason: "'지역 맛집'은 가장 검색량이 많은 키워드 중 하나입니다",
      guide: `소개글에 "${loc} 맛집"이라는 표현을 자연스럽게 넣어보세요`,
    });
  }

  // 카테고리 세분화
  for (const kw of catKeywords) {
    if (kw !== mainCat) {
      results.push({
        keyword: kw,
        reason: `'${kw}'은 세부 카테고리 키워드로, 정확한 검색에 노출됩니다`,
        guide: `소개글이나 메뉴 설명에 "${kw}" 표현을 추가해보세요`,
      });
    }
  }

  return results;
}

/* ─────────── 3단계: AI 추천 ─────────── */

interface CompetitorKeywordData {
  name: string;
  keywords: string[];
}

const SYSTEM_PROMPT = `당신은 네이버 플레이스 키워드 최적화 전문가입니다.
소상공인 사장님(평균 53세)에게 말하듯 쉬운 한국어로 답변하세요.

규칙:
- "합정 카페"보다 "합정 작업하기 좋은 카페"처럼 구체적인 롱테일 키워드를 추천
- 실제 고객이 네이버에서 검색할 만한 자연스러운 키워드
- 각 키워드마다 "소개글에 이렇게 넣으세요" 가이드 1문장 필수
- IT 용어 금지. "SEO"→"검색 노출", "CTR"→"클릭률"
- 반드시 아래 JSON 형식으로만 응답. 다른 텍스트 금지.

JSON 형식:
{
  "recommended": [
    {
      "keyword": "추천 키워드",
      "reason": "이 키워드를 추천하는 이유 1문장",
      "guide": "소개글에 이렇게 넣어보세요: '예시 문구'"
    }
  ],
  "introductionTip": "개선된 소개글 예시 (200자 이내)"
}`;

function buildKeywordPrompt(
  data: PlaceData,
  currentKeywords: string[],
  competitors?: CompetitorKeywordData[],
): string {
  let prompt = `가게: ${data.name}
카테고리: ${data.category}
주소: ${data.address}
현재 소개글: ${data.introduction || data.description || "(없음)"}
현재 키워드: ${currentKeywords.length > 0 ? currentKeywords.join(", ") : "(없음)"}
메뉴: ${data.menus.slice(0, 5).map((m) => m.name).join(", ") || "(없음)"}`;

  if (competitors && competitors.length > 0) {
    prompt += "\n\n경쟁 가게 키워드:";
    for (const c of competitors) {
      prompt += `\n- ${c.name}: ${c.keywords.join(", ")}`;
    }
  }

  prompt += `\n
위 정보를 바탕으로:
1. 이 가게에 적합한 추천 키워드를 8~12개 생성해주세요
2. 현재 키워드와 겹치지 않는 새로운 키워드 위주로
3. "지역명 + 구체적 특성" 형태의 롱테일 키워드 포함
4. 소개글이 없거나 부실하면 개선된 소개글 예시를 만들어주세요`;

  return prompt;
}

async function getAIRecommendations(
  data: PlaceData,
  currentKeywords: string[],
  competitors?: CompetitorKeywordData[],
): Promise<{ recommended: RecommendedKeyword[]; introductionTip: string } | null> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildKeywordPrompt(data, currentKeywords, competitors) },
      ],
    });

    const text = response.content[0];
    if (text.type !== "text") return null;

    // AI가 ```json ... ``` 로 감싸는 경우 제거
    const raw = text.text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.recommended)) return null;

    return {
      recommended: parsed.recommended,
      introductionTip: parsed.introductionTip || "",
    };
  } catch (err) {
    console.error("[AI] 키워드 추천 생성 실패:", err);
    return null;
  }
}

/* ─────────── 메인 함수 ─────────── */

export interface AnalyzeKeywordsInput {
  placeData: PlaceData;
  scoreResult: ScoreResult;
  competitors?: CompetitorKeywordData[];
}

export async function analyzeKeywords(
  input: AnalyzeKeywordsInput,
): Promise<KeywordRecommendation> {
  const { placeData, competitors } = input;

  // 1단계: 현재 키워드 정리
  const current = extractCurrentKeywords(placeData);

  // 2단계: 규칙 기반 추천
  const ruleBasedKeywords = generateRuleBasedKeywords(placeData);

  // 3단계: AI 추천 (실패해도 규칙 기반은 반환)
  const aiResult = await getAIRecommendations(placeData, current, competitors);

  // AI 추천 + 규칙 기반 병합 (AI 우선, 중복 제거)
  const allRecommended: RecommendedKeyword[] = [];
  const seenKeywords = new Set(current.map((k) => k.toLowerCase()));

  // AI 추천 먼저
  if (aiResult) {
    for (const rec of aiResult.recommended) {
      const lower = rec.keyword.toLowerCase();
      if (!seenKeywords.has(lower)) {
        seenKeywords.add(lower);
        allRecommended.push(rec);
      }
    }
  }

  // 규칙 기반 추가 (AI와 중복 안 되는 것만)
  for (const rec of ruleBasedKeywords) {
    const lower = rec.keyword.toLowerCase();
    if (!seenKeywords.has(lower)) {
      seenKeywords.add(lower);
      allRecommended.push(rec);
    }
  }

  // 소개글 팁
  let introductionTip = aiResult?.introductionTip || "";
  if (!introductionTip) {
    // 규칙 기반 폴백
    const { gu } = extractLocationParts(placeData.address);
    const catKeywords = extractCategoryKeywords(placeData.category);
    const mainCat = catKeywords[catKeywords.length - 1] || placeData.category;
    if (gu) {
      introductionTip = `${gu}에 위치한 ${mainCat} 전문점, ${placeData.name}입니다. 정성스럽게 준비한 메뉴로 여러분을 기다리고 있습니다.`;
    }
  }

  return {
    current,
    recommended: allRecommended,
    introductionTip,
  };
}
