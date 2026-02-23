/**
 * 네이버 플레이스 크롤러 테스트 스크립트
 *
 * 사용법:
 *   npx tsx scripts/test-scraper.ts [URL 또는 place ID]
 *
 * 예시:
 *   npx tsx scripts/test-scraper.ts https://m.place.naver.com/restaurant/1612703330/home
 *   npx tsx scripts/test-scraper.ts 1612703330
 */

/* eslint-disable no-console */

// 상대 경로 import (tsx에서 @/ alias 미지원)
import { scrapePlaceData, searchAndScrape } from "../lib/scraper/naverPlace";

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.log("사용법: npx tsx scripts/test-scraper.ts [URL 또는 가게명]");
    console.log("");
    console.log("예시:");
    console.log(
      "  npx tsx scripts/test-scraper.ts https://m.place.naver.com/restaurant/1612703330/home"
    );
    console.log("  npx tsx scripts/test-scraper.ts 1612703330");
    process.exit(1);
  }

  console.log(`\n🔍 입력: ${input}\n`);
  console.log("⏳ 크롤링 시작...\n");

  const startTime = Date.now();

  try {
    let result;

    // URL이나 숫자가 아니면 검색 모드
    const isUrl = input.startsWith("http") || /^\d+$/.test(input);

    if (isUrl) {
      result = await scrapePlaceData(input);
    } else {
      console.log(`📡 "${input}" 검색 중...\n`);
      result = await searchAndScrape(input);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("✅ 크롤링 완료! (%s초)\n", elapsed);
    console.log("─".repeat(50));

    // 기본 정보
    console.log(`🏪 가게명: ${result.name}`);
    console.log(`📂 카테고리: ${result.category}`);
    console.log(`📍 주소: ${result.address}`);
    console.log(`📞 전화: ${result.phone}`);
    console.log(
      `📝 소개: ${result.description ? result.description.substring(0, 80) + "..." : "(없음)"}`
    );

    // 영업시간
    if (result.hours.length > 0) {
      console.log(`\n⏰ 영업시간:`);
      for (const h of result.hours.slice(0, 5)) {
        console.log(`   ${h}`);
      }
    }

    // 사진
    console.log(
      `\n📸 사진: 업체 ${result.photos.business}장 / 방문자 ${result.photos.visitor}장`
    );
    if (result.photos.categories.length > 0) {
      console.log(
        `   카테고리: ${result.photos.categories.join(", ")}`
      );
    }

    // 리뷰
    console.log(
      `\n⭐ 리뷰: ${result.reviews.total}개 (평균 ${result.reviews.avgRating.toFixed(2)}점)`
    );
    console.log(
      `   사장님 답변율: ${(result.reviews.ownerReplyRate * 100).toFixed(0)}%`
    );
    if (result.reviews.recent.length > 0) {
      console.log(`   최근 리뷰 ${result.reviews.recent.length}개:`);
      for (const r of result.reviews.recent.slice(0, 3)) {
        const photo = r.hasPhoto ? "📷" : "  ";
        const reply = r.ownerReply ? "💬" : "  ";
        console.log(
          `   ${photo}${reply} [${r.rating || "-"}점] ${r.content?.substring(0, 50) || "(키워드 리뷰)"}...`
        );
      }
    }

    // 소개
    if (result.introduction) {
      console.log(`\n📋 소개: ${result.introduction.substring(0, 100)}`);
    }

    // 메뉴
    if (result.menus.length > 0) {
      console.log(`\n🍽️  메뉴: ${result.menus.length}개`);
      for (const m of result.menus.slice(0, 5)) {
        const price = m.price
          ? `${m.price.toLocaleString()}원`
          : "가격 없음";
        const photo = m.hasPhoto ? "📷" : "  ";
        const desc = m.description ? ` (${m.description.substring(0, 40)})` : "";
        console.log(`   ${photo} ${m.name} — ${price}${desc}`);
      }
      if (result.menus.length > 5) {
        console.log(`   ... 외 ${result.menus.length - 5}개`);
      }
    }

    // 소식
    if (result.feeds.length > 0) {
      console.log(`\n📰 소식: ${result.feeds.length}개`);
      for (const f of result.feeds.slice(0, 3)) {
        const media = f.hasMedia ? "📷" : "  ";
        console.log(`   ${media} [${f.category}] ${f.title || f.description.substring(0, 50)}`);
      }
    }

    // 키워드
    if (result.keywords.length > 0) {
      console.log(
        `\n🏷️  키워드: ${result.keywords.join(", ")}`
      );
    }

    // 최근 업데이트
    if (result.lastUpdate) {
      console.log(`\n🕐 최근 업데이트: ${result.lastUpdate}`);
    }

    console.log("\n" + "─".repeat(50));
    console.log("\n📦 전체 JSON:\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n❌ 크롤링 실패 (${elapsed}초):`, err);
    process.exit(1);
  }
}

main();
