/**
 * 점수 계산 엔진 테스트 스크립트
 *
 * 사용법:
 *   npx tsx scripts/test-score.ts [URL 또는 가게명]
 *
 * 예시:
 *   npx tsx scripts/test-score.ts "강남불백 신촌점"
 *   npx tsx scripts/test-score.ts https://m.place.naver.com/restaurant/1292541602/home
 */

/* eslint-disable no-console */

import { scrapePlaceData, searchAndScrape } from "../lib/scraper/naverPlace";
import { calculateScore } from "../lib/analyzer/scoreCalculator";
import type { ScoreDetail } from "../types";

function statusEmoji(status: string): string {
  if (status === "good") return "🟢";
  if (status === "warning") return "🟡";
  return "🔴";
}

function printDetail(label: string, detail: ScoreDetail) {
  const emoji = statusEmoji(detail.status);
  const bar = "█".repeat(Math.round((detail.score / detail.max) * 20));
  const empty = "░".repeat(20 - Math.round((detail.score / detail.max) * 20));
  console.log(
    `\n${emoji} ${label}: ${detail.score}/${detail.max}점  ${bar}${empty}`
  );

  if (detail.strengths.length > 0) {
    for (const s of detail.strengths) {
      console.log(`   ✅ ${s}`);
    }
  }
  if (detail.improvements.length > 0) {
    for (const i of detail.improvements) {
      console.log(`   💡 ${i}`);
    }
  }
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.log("사용법: npx tsx scripts/test-score.ts [URL 또는 가게명]");
    process.exit(1);
  }

  console.log(`\n🔍 입력: ${input}\n`);
  console.log("⏳ 크롤링 중...\n");

  const isUrl = input.startsWith("http") || /^\d+$/.test(input);
  const placeData = isUrl
    ? await scrapePlaceData(input)
    : await searchAndScrape(input);

  console.log(`✅ ${placeData.name} 크롤링 완료\n`);
  console.log("⏳ 점수 계산 중...\n");

  const result = calculateScore(placeData);

  // 결과 출력
  console.log("═".repeat(50));
  console.log(
    `  📊 ${placeData.name} — 총점: ${result.total}/100점`
  );
  console.log("═".repeat(50));

  printDetail("기본 정보", result.details.basicInfo);
  printDetail("사진", result.details.photos);
  printDetail("리뷰", result.details.reviews);
  printDetail("메뉴", result.details.menu);
  printDetail("키워드", result.details.keywords);
  printDetail("활성도", result.details.activity);

  console.log("\n" + "─".repeat(50));

  // 종합 요약
  const allImprovements = [
    ...result.details.basicInfo.improvements,
    ...result.details.photos.improvements,
    ...result.details.reviews.improvements,
    ...result.details.menu.improvements,
    ...result.details.keywords.improvements,
    ...result.details.activity.improvements,
  ];

  if (allImprovements.length > 0) {
    console.log("\n📋 개선 우선순위 (상위 5개):\n");
    for (const [idx, tip] of allImprovements.slice(0, 5).entries()) {
      console.log(`  ${idx + 1}. ${tip}`);
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log("\n📦 점수 JSON:\n");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("❌ 에러:", err);
  process.exit(1);
});
