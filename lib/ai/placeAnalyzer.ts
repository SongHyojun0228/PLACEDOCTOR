/**
 * AI 분석 코멘트 생성
 * Claude Sonnet 4.0 — 분석 1건당 예상 비용 $0.01~0.03
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PlaceData, ScoreResult, ScoreDetail } from "@/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `당신은 네이버 플레이스 검색 알고리즘과 지역 상권 데이터 분석에 정통한 최고 수준의 데이터 컨설턴트입니다.
주 고객은 50대 자영업자입니다. 과장된 표현, 감정적인 자극(예: 손님이 불친절하게 느낀다 등), 외부 기관 인용(예: 서울대 연구 등)을 절대 배제하고, 차분하고 논리적인 '데이터 기반의 초전문가' 톤을 유지하세요.

[핵심 규칙]
1. 네이버 알고리즘의 원리(체류시간, 활동성 지수, 연관도 등)와 소비자 행동 데이터를 논리적으로 설명하세요.
2. "불친절해 보인다" 같은 주관적 감정 대신 "네이버 알고리즘은 답글률을 매장 운영 활성도로 평가합니다", "신규 유입 고객의 72%는 최근 3주 내의 리뷰를 확인합니다" 같은 객관적 수치와 논리를 사용하세요.
3. 분석 대상 가게의 '지역명'과 '업종명'을 반드시 언급하며, "해당 지역 동종 업계 상위 10% 매장의 평균치"라는 개념을 가상으로 적절히 활용하여 비교 기준을 제시하세요.
4. 문체는 정중하고 전문적이며, 즉각적으로 실행 가능한 구체적인 솔루션을 제공하세요.

[출력 포맷 (아래 구조와 이모지를 정확히 지켜주세요)]

📊 [지역명] [업종] 상권 데이터 분석
(가게의 긍정적인 지표 1가지를 수치로 칭찬 + 전체 총점을 바탕으로 현재 이 매장이 상권 내에서 알고리즘상 어떤 위치에 있는지 1~2문장 객관적 진단)

🚨 네이버 검색 노출 감점 요인 분석 (가장 점수가 낮은 1~2개 항목만)
- [항목명]: (현재 수치 상태) → (이것이 네이버 알고리즘이나 고객 체류 시간에 어떤 부정적 수치 영향을 미치는지 논리적/객관적으로 설명)

💡 최우선 개선 액션 플랜
- [오늘의 할 일 1]: (매우 구체적인 행동 지침)
- [데이터 기대 효과]: (이 행동이 '활동성 지수 상승', '체류 시간 증가' 등 수치적으로 어떤 결과를 가져오는지 1문장 설명)

📍 상권 입지 분석
(아래 정보를 종합하여 이 가게의 상권 특성을 분석해주세요.)
- 주변 지하철역/주요 랜드마크 기반으로, 이 입지에서 소비자가 실제로 검색할 법한 키워드 패턴을 분석 (예: "홍대입구역 삼겹살", "망원동 브런치 카페")
- "OO동 맛집", "OO역 근처 OO" 같은 지역 기반 검색어에서 이 가게가 노출되려면 소개글/키워드에 어떤 지역명 조합이 들어가야 하는지 구체적으로 제시
- 해당 동네의 유동인구 특성(직장인 점심, 대학생 모임, 주거지 저녁 등)을 추정하여 시간대별 공략 포인트 1가지 제안

🎁 타겟 지역 맞춤 검색어 팁
(위 상권 분석을 바탕으로, 경쟁도는 낮지만 실제 전환율(예약/방문)이 높은 롱테일 키워드 2~3개 추천. 각 키워드를 소개글·메뉴 설명·소식 중 어디에 넣으면 효과적인지 구체적으로 안내)`;

const CATEGORY_NAMES: Record<string, string> = {
  basicInfo: "기본 정보",
  photos: "업체 사진",
  reviews: "리뷰 및 답글",
  menu: "메뉴 정보",
  keywords: "검색 연관도(키워드)",
  activity: "최근 활동성",
};

function formatDetail(key: string, d: ScoreDetail, extra: string): string {
  const lines = [`[${CATEGORY_NAMES[key]}] 점수: ${d.score}/${d.max}점 (상태: ${d.status === "good" ? "상위권" : d.status === "warning" ? "평균" : "개선요망"})${extra ? " | " + extra : ""}`];
  if (d.improvements.length > 0) {
    lines.push(`  - 알고리즘 감점 요인: ${d.improvements.join(" / ")}`);
  }
  if (d.strengths.length > 0) {
    lines.push(`  - 긍정적 지표: ${d.strengths.join(" / ")}`);
  }
  return lines.join("\n");
}

/** 주소에서 시/구/동/도로명 등 상권 분석에 필요한 지역 정보를 추출 */
function parseLocation(address: string): {
  city: string;
  gu: string;
  dong: string;
  road: string;
  full: string;
} {
  const words = address.split(/\s+/);
  const city = words.find((w) => w.endsWith("시") || w.endsWith("도")) || "";
  const gu = words.find((w) => w.endsWith("구") || w.endsWith("군")) || "";
  const dong = words.find((w) => w.endsWith("동") || w.endsWith("읍") || w.endsWith("면") || w.endsWith("리")) || "";
  // 도로명 (XX로, XX길)
  const road = words.find((w) => w.endsWith("로") || w.endsWith("길")) || "";
  return { city, gu, dong, road, full: address };
}

function buildUserPrompt(data: PlaceData, score: ScoreResult): string {
  const { details } = score;
  const loc = parseLocation(data.address);
  const regionLabel = [loc.gu, loc.dong].filter(Boolean).join(" ") || "해당 지역";

  const sections = [
    formatDetail("basicInfo", details.basicInfo, ""),
    formatDetail("photos", details.photos, `현재 등록된 업체 사진 ${data.photos.business}장`),
    formatDetail("reviews", details.reviews, `총 리뷰 ${data.reviews.total}개, 사장님 답글률 ${Math.round(data.reviews.ownerReplyRate * 100)}%`),
    formatDetail("menu", details.menu, `등록된 메뉴 ${data.menus.length}개`),
    formatDetail("keywords", details.keywords, `현재 세팅된 키워드 ${data.keywords.length}개`),
    formatDetail("activity", details.activity, ""),
  ];

  // 현재 소개글에 지역명이 포함되어 있는지 체크
  const intro = (data.introduction || data.description || "").toLowerCase();
  const hasGuInIntro = loc.gu && intro.includes(loc.gu.toLowerCase());
  const hasDongInIntro = loc.dong && intro.includes(loc.dong.toLowerCase());

  return `가게 이름: ${data.name}
전체 주소: ${data.address}
지역 정보: ${loc.city} ${loc.gu} ${loc.dong}${loc.road ? ` (${loc.road})` : ""}
대표 지역명: ${regionLabel}
업종: ${data.category}
진단 총점: ${score.total}/100점

[소개글 지역 키워드 포함 여부]
- 구 이름(${loc.gu || "없음"}) 포함: ${hasGuInIntro ? "O" : "X"}
- 동 이름(${loc.dong || "없음"}) 포함: ${hasDongInIntro ? "O" : "X"}
- 현재 소개글: "${data.description || "(없음)"}"

[현재 등록된 키워드]
${data.keywords.length > 0 ? data.keywords.join(", ") : "(없음)"}

[상세 진단 데이터]
${sections.join("\n\n")}

위 데이터를 바탕으로, 감정적인 표현이나 뻔한 소리 없이 네이버 플레이스 알고리즘과 상권 데이터에 기반한 최고 수준의 분석 리포트를 작성해 주세요.
특히 📍 상권 입지 분석에서는 이 가게의 주소(${regionLabel})를 기반으로 주변 지하철역, "${loc.dong || loc.gu} 맛집" 같은 실제 소비자 검색 패턴, 동네 유동인구 특성까지 구체적으로 분석해주세요.
사장님이 데이터를 보고 객관적인 원인을 납득할 수 있어야 합니다.`;
}

export async function generateComment(
  data: PlaceData,
  score: ScoreResult
): Promise<string | null> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(data, score) },
      ],
      temperature: 0.3,
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
