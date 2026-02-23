/**
 * 점수 계산 엔진
 * 규칙 기반 — AI 호출 없이 계산 (비용 절약)
 */

import type { PlaceData, ScoreResult, ScoreDetail, Status } from "@/types";

/* ─────────── 유틸 ─────────── */

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toStatus(score: number, max: number): Status {
  const ratio = score / max;
  if (ratio >= 0.7) return "good";
  if (ratio >= 0.4) return "warning";
  return "bad";
}

/** "25.3.21.금", "1.22.목", "2026.01.31." 등의 날짜 문자열을 Date로 변환 */
function parseRelativeDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // "2026.01.31." → 2026-01-31 (4자리 연도)
  const fullYearMatch = dateStr.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (fullYearMatch) {
    const year = parseInt(fullYearMatch[1], 10);
    const month = parseInt(fullYearMatch[2], 10) - 1;
    const day = parseInt(fullYearMatch[3], 10);
    return new Date(year, month, day);
  }

  // "25.3.21.금" → 2025-03-21 (2자리 연도)
  const shortYearMatch = dateStr.match(/^(\d{2})\.(\d{1,2})\.(\d{1,2})/);
  if (shortYearMatch) {
    const year = 2000 + parseInt(shortYearMatch[1], 10);
    const month = parseInt(shortYearMatch[2], 10) - 1;
    const day = parseInt(shortYearMatch[3], 10);
    return new Date(year, month, day);
  }

  // "1.22.목" → 올해 1월 22일
  const shortMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})/);
  if (shortMatch) {
    const month = parseInt(shortMatch[1], 10) - 1;
    const day = parseInt(shortMatch[2], 10);
    return new Date(new Date().getFullYear(), month, day);
  }

  return null;
}

/** 날짜 문자열로부터 오늘까지 경과 일수 */
function daysSince(dateStr: string): number | null {
  const date = parseRelativeDate(dateStr);
  if (!date) return null;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* ─────────── 1. 기본 정보 (15점) ─────────── */

function scoreBasicInfo(data: PlaceData): ScoreDetail {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 영업시간 (4점)
  if (data.hours.length > 0) {
    score += 4;
    strengths.push("영업시간이 등록되어 있습니다");
  } else {
    improvements.push("영업시간을 등록하면 고객이 방문 전 확인할 수 있어요");
  }

  // 주소 (3점)
  if (data.address) {
    score += 3;
    strengths.push("주소가 정확하게 등록되어 있습니다");
  } else {
    improvements.push("주소를 등록해 지도 검색에 노출되게 해주세요");
  }

  // 전화번호 (3점)
  if (data.phone) {
    score += 3;
    strengths.push("전화번호가 등록되어 있습니다");
  } else {
    improvements.push("전화번호를 등록하면 전화 문의가 늘어날 수 있어요");
  }

  // 소개글 (5점) — 길이에 따라 차등
  const intro = data.introduction || data.description;
  if (intro) {
    const len = intro.length;
    if (len >= 50) {
      score += 5;
      strengths.push(`소개글이 충분히 작성되어 있습니다 (${len}자)`);
    } else if (len >= 20) {
      score += 3;
      strengths.push("소개글이 등록되어 있습니다");
      improvements.push(
        `소개글을 좀 더 보강하면 좋아요 (현재 ${len}자 → 50자 이상 권장)`
      );
    } else {
      score += 1;
      improvements.push(
        `소개글이 너무 짧아요 (현재 ${len}자 → 50자 이상으로 늘려보세요)`
      );
    }
  } else {
    improvements.push(
      "소개글을 작성하면 검색 노출에 큰 도움이 됩니다 (50자 이상 권장)"
    );
  }

  return {
    score: clamp(score, 0, 15),
    max: 15,
    status: toStatus(score, 15),
    strengths,
    improvements,
  };
}

/* ─────────── 2. 사진 (20점, 업체 사진만) ─────────── */

function scorePhotos(data: PlaceData): ScoreDetail {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const biz = data.photos.business;

  // 업체 사진 장수별 구간 (15점)
  if (biz >= 25) {
    score += 15;
    strengths.push(`업체 사진이 ${biz}장으로 충분합니다`);
  } else if (biz >= 15) {
    score += 12;
    strengths.push(`업체 사진이 ${biz}장 등록되어 있습니다`);
    improvements.push(`사진을 ${25 - biz}장 더 올리면 만점이에요`);
  } else if (biz >= 5) {
    score += 8;
    improvements.push(
      `업체 사진이 ${biz}장이에요. 15장 이상 올리면 노출이 늘어납니다`
    );
  } else if (biz > 0) {
    score += 4;
    improvements.push(
      `업체 사진이 ${biz}장뿐이에요. 최소 5장 이상 올려주세요`
    );
  } else {
    improvements.push("업체 사진이 없습니다! 대표 사진부터 올려주세요");
  }

  // 카테고리 다양성 (5점)
  const cats = data.photos.categories.length;
  if (cats >= 4) {
    score += 5;
    strengths.push(
      `사진 카테고리가 ${cats}종으로 다양합니다 (${data.photos.categories.join(", ")})`
    );
  } else if (cats >= 2) {
    score += 3;
    improvements.push(
      "메뉴, 매장 내부, 외부 등 다양한 카테고리 사진을 추가해보세요"
    );
  } else if (cats >= 1) {
    score += 1;
    improvements.push(
      "사진 카테고리가 1종뿐이에요. 음식, 매장, 분위기 등 다양하게 올려주세요"
    );
  } else if (biz > 0) {
    // 사진은 있는데 카테고리 정보가 없는 경우 (카테고리 미분류)
    score += 2;
  }

  return {
    score: clamp(score, 0, 20),
    max: 20,
    status: toStatus(score, 20),
    strengths,
    improvements,
  };
}

/* ─────────── 3. 리뷰 (25점) ─────────── */

function scoreReviews(data: PlaceData): ScoreDetail {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const { total, avgRating, ownerReplyRate, recent } = data.reviews;

  // 리뷰 수 (8점)
  if (total >= 100) {
    score += 8;
    strengths.push(`리뷰가 ${total}개로 매우 많습니다`);
  } else if (total >= 50) {
    score += 6;
    strengths.push(`리뷰가 ${total}개 있습니다`);
  } else if (total >= 20) {
    score += 4;
    improvements.push(
      `리뷰가 ${total}개에요. 리뷰 이벤트로 50개 이상 모아보세요`
    );
  } else if (total >= 5) {
    score += 2;
    improvements.push(
      `리뷰가 ${total}개로 부족해요. 방문 고객에게 리뷰를 부탁해보세요`
    );
  } else {
    improvements.push("리뷰가 거의 없습니다. 리뷰 수집이 시급해요");
  }

  // 평균 별점 (5점)
  if (avgRating >= 4.5) {
    score += 5;
    strengths.push(`평균 별점 ${avgRating.toFixed(1)}점으로 우수합니다`);
  } else if (avgRating >= 4.0) {
    score += 4;
    strengths.push(`평균 별점 ${avgRating.toFixed(1)}점으로 양호합니다`);
  } else if (avgRating >= 3.5) {
    score += 2;
    improvements.push(
      `평균 별점 ${avgRating.toFixed(1)}점이에요. 서비스 개선으로 4점 이상을 목표해보세요`
    );
  } else if (avgRating > 0) {
    score += 1;
    improvements.push(
      `평균 별점 ${avgRating.toFixed(1)}점으로 낮은 편이에요. 불만 사항을 파악해보세요`
    );
  }

  // 사장님 답변률 (10점)
  const replyPct = Math.round(ownerReplyRate * 100);
  if (replyPct >= 80) {
    score += 10;
    strengths.push(`사장님 답변률 ${replyPct}%로 훌륭합니다`);
  } else if (replyPct >= 50) {
    score += 7;
    strengths.push(`사장님 답변률 ${replyPct}%입니다`);
    improvements.push("모든 리뷰에 답변하면 재방문율이 올라가요");
  } else if (replyPct >= 20) {
    score += 4;
    improvements.push(
      `사장님 답변률이 ${replyPct}%에요. 50% 이상으로 올려보세요`
    );
  } else if (replyPct > 0) {
    score += 2;
    improvements.push(
      `사장님 답변률이 ${replyPct}%로 매우 낮아요. 리뷰 답변은 검색 순위에 직접 영향을 줍니다`
    );
  } else {
    improvements.push(
      "사장님 답변이 없습니다! 리뷰에 답변하면 검색 순위가 크게 올라가요"
    );
  }

  // 최근 리뷰에 사진 포함 비율 (2점 보너스)
  if (recent.length > 0) {
    const photoRate =
      recent.filter((r) => r.hasPhoto).length / recent.length;
    if (photoRate >= 0.5) {
      score += 2;
      strengths.push(
        `최근 리뷰의 ${Math.round(photoRate * 100)}%가 사진을 포함하고 있습니다`
      );
    }
  }

  return {
    score: clamp(score, 0, 25),
    max: 25,
    status: toStatus(score, 25),
    strengths,
    improvements,
  };
}

/* ─────────── 4. 메뉴 (15점) ─────────── */

function scoreMenu(data: PlaceData): ScoreDetail {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const menus = data.menus;

  if (menus.length === 0) {
    improvements.push("메뉴가 등록되지 않았습니다. 메뉴를 등록해주세요");
    return {
      score: 0,
      max: 15,
      status: "bad",
      strengths,
      improvements,
    };
  }

  // 메뉴 등록 여부 (2점)
  if (menus.length >= 10) {
    score += 2;
    strengths.push(`메뉴 ${menus.length}개가 등록되어 있습니다`);
  } else if (menus.length >= 5) {
    score += 1;
    strengths.push(`메뉴 ${menus.length}개가 등록되어 있습니다`);
    improvements.push("주요 메뉴를 모두 등록해주세요 (10개 이상 권장)");
  } else {
    improvements.push(
      `메뉴가 ${menus.length}개뿐이에요. 모든 메뉴를 등록해주세요`
    );
  }

  // 가격 등록률 (3점)
  const withPrice = menus.filter((m) => m.price !== null).length;
  const priceRate = withPrice / menus.length;
  if (priceRate >= 0.9) {
    score += 3;
    strengths.push("거의 모든 메뉴에 가격이 등록되어 있습니다");
  } else if (priceRate >= 0.5) {
    score += 2;
    improvements.push(
      `메뉴 중 ${menus.length - withPrice}개에 가격이 없어요. 가격을 모두 등록해주세요`
    );
  } else {
    improvements.push(
      "메뉴 가격이 대부분 빠져있어요. 가격을 등록하면 고객 결정이 빨라집니다"
    );
  }

  // 사진 등록률 (4점)
  const withPhoto = menus.filter((m) => m.hasPhoto).length;
  const photoRate = withPhoto / menus.length;
  if (photoRate >= 0.7) {
    score += 4;
    strengths.push(
      `메뉴 ${withPhoto}개에 사진이 있습니다 (${Math.round(photoRate * 100)}%)`
    );
  } else if (photoRate >= 0.3) {
    score += 2;
    improvements.push(
      `메뉴 사진이 ${withPhoto}개뿐이에요. 각 메뉴마다 사진을 올려주세요`
    );
  } else if (withPhoto > 0) {
    score += 1;
    improvements.push(
      `메뉴 사진이 ${withPhoto}개로 부족해요. 사진이 있는 메뉴가 주문율이 높아요`
    );
  } else {
    improvements.push("메뉴 사진이 없습니다! 대표 메뉴부터 사진을 올려주세요");
  }

  // 설명 등록률 (3점)
  const withDesc = menus.filter((m) => m.description).length;
  const descRate = withDesc / menus.length;
  if (descRate >= 0.5) {
    score += 3;
    strengths.push(
      `메뉴 ${withDesc}개에 설명이 있어 고객 이해도를 높여줍니다`
    );
  } else if (descRate >= 0.2) {
    score += 2;
    improvements.push(
      "메뉴 설명을 더 추가해주세요. 재료, 양, 특징을 적으면 좋아요"
    );
  } else if (withDesc > 0) {
    score += 1;
    improvements.push(
      `메뉴 설명이 ${withDesc}개뿐이에요. 인기 메뉴 위주로 설명을 추가해보세요`
    );
  } else {
    improvements.push(
      "메뉴 설명이 없습니다. 맛, 재료, 양 등을 적으면 주문율이 올라가요"
    );
  }

  // 메뉴 카테고리/그룹 분류 (3점)
  const groups = new Set(menus.map((m) => m.group).filter(Boolean));
  const repCount = menus.filter((m) => m.isRepresentative).length;

  if (repCount > 0) {
    score += 3;
    const parts = [`대표메뉴 ${repCount}개가 설정되어 있습니다`];
    if (groups.size >= 2) {
      parts.push(`메뉴가 ${groups.size}개 카테고리로 분류되어 있습니다`);
    }
    strengths.push(parts.join(". "));
  } else {
    improvements.push("대표메뉴를 설정하면 고객이 인기 메뉴를 바로 볼 수 있어요");
  }

  return {
    score: clamp(score, 0, 15),
    max: 15,
    status: toStatus(score, 15),
    strengths,
    improvements,
  };
}

/* ─────────── 5. 키워드 (15점) ─────────── */

function scoreKeywords(data: PlaceData): ScoreDetail {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 리뷰 키워드 존재 여부 (5점)
  if (data.keywords.length >= 8) {
    score += 5;
    strengths.push(
      `리뷰에서 추출된 키워드가 ${data.keywords.length}개로 풍부합니다`
    );
  } else if (data.keywords.length >= 4) {
    score += 3;
    strengths.push(`키워드가 ${data.keywords.length}개 있습니다`);
  } else if (data.keywords.length > 0) {
    score += 1;
    improvements.push(
      "리뷰 키워드가 적어요. 리뷰가 많아지면 자연스럽게 늘어납니다"
    );
  } else {
    improvements.push("리뷰에서 추출된 키워드가 없습니다");
  }

  // 소개글 내 업종 키워드 포함 여부 (5점)
  const intro = (data.introduction || data.description || "").toLowerCase();
  const category = (data.category || "").toLowerCase();

  if (intro && category) {
    // 카테고리에서 키워드 분리 ("백반,가정식" → ["백반", "가정식"])
    const catKeywords = category
      .split(/[,\/\s]+/)
      .filter((k) => k.length >= 2);
    const matchedCatKeywords = catKeywords.filter((k) => intro.includes(k));

    if (matchedCatKeywords.length > 0) {
      score += 5;
      strengths.push(
        `소개글에 업종 키워드가 포함되어 있습니다 (${matchedCatKeywords.join(", ")})`
      );
    } else {
      improvements.push(
        `소개글에 업종 키워드를 넣어주세요 (예: ${catKeywords.slice(0, 3).join(", ")})`
      );
    }

    // 지역 키워드 (주소에서 구/동 추출) (5점)
    const addressMatch = data.address.match(
      /(\S+[시군])\s+(\S+[구군])\s*(\S+[동읍면리])?/
    );
    if (addressMatch) {
      const locationKeywords = [addressMatch[2], addressMatch[3]].filter(
        Boolean
      );
      const matchedLocKeywords = locationKeywords.filter((k) =>
        intro.includes(k)
      );
      if (matchedLocKeywords.length > 0) {
        score += 5;
        strengths.push(
          `소개글에 지역 키워드가 포함되어 있습니다 (${matchedLocKeywords.join(", ")})`
        );
      } else {
        improvements.push(
          `소개글에 지역명을 넣어주세요 (예: ${locationKeywords.join(", ")})`
        );
      }
    }
  } else if (!intro) {
    improvements.push(
      "소개글이 없어 키워드 최적화가 불가능합니다. 소개글부터 작성해주세요"
    );
  }

  return {
    score: clamp(score, 0, 15),
    max: 15,
    status: toStatus(score, 15),
    strengths,
    improvements,
  };
}

/* ─────────── 6. 활성도 (10점) ─────────── */

function scoreActivity(data: PlaceData): ScoreDetail {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 소식 등록 여부 (5점)
  // 날짜가 있는 소식만 실제 카운트 (플레이스홀더 제외)
  const feedsWithDate = data.feeds.filter((f) => f.date);
  const feedCount = feedsWithDate.length;
  const hasFeed = data.feeds.some((f) => f.category === "feed");
  if (feedCount >= 5) {
    score += 5;
    strengths.push(`소식이 ${feedCount}개 등록되어 활발하게 운영 중입니다`);
  } else if (feedCount >= 2) {
    score += 3;
    strengths.push(`소식이 ${feedCount}개 등록되어 있습니다`);
    improvements.push("소식을 주 1회 이상 올리면 검색 순위에 유리해요");
  } else if (feedCount >= 1 || hasFeed) {
    score += 1;
    strengths.push("소식이 등록되어 있습니다");
    improvements.push("소식을 정기적으로 올리면 검색 순위에 유리해요");
  } else {
    improvements.push(
      "소식이 없습니다! 주 1회 소식 올리기가 순위 상승의 핵심이에요"
    );
  }

  // 최근 업데이트 시점 (5점)
  // 리뷰 날짜, 피드 날짜 등에서 가장 최근 날짜 확인
  let mostRecentDays: number | null = null;

  // 피드 날짜
  for (const feed of data.feeds) {
    if (feed.date) {
      const d = daysSince(feed.date);
      if (d !== null && (mostRecentDays === null || d < mostRecentDays)) {
        mostRecentDays = d;
      }
    }
  }

  // lastUpdate
  if (data.lastUpdate) {
    const d = daysSince(data.lastUpdate);
    if (d !== null && (mostRecentDays === null || d < mostRecentDays)) {
      mostRecentDays = d;
    }
  }

  // 최근 리뷰 날짜로 대체 (피드/업데이트 날짜가 없는 경우)
  if (mostRecentDays === null) {
    for (const review of data.reviews.recent) {
      const d = daysSince(review.date);
      if (d !== null && (mostRecentDays === null || d < mostRecentDays)) {
        mostRecentDays = d;
      }
    }
  }

  if (mostRecentDays !== null) {
    if (mostRecentDays <= 7) {
      score += 5;
      strengths.push("최근 1주일 이내에 활동이 있습니다");
    } else if (mostRecentDays <= 14) {
      score += 4;
      strengths.push("최근 2주 이내에 활동이 있습니다");
    } else if (mostRecentDays <= 30) {
      score += 3;
      improvements.push("마지막 활동이 2주 이상 전이에요. 소식을 올려주세요");
    } else if (mostRecentDays <= 90) {
      score += 1;
      improvements.push(
        `마지막 활동이 약 ${Math.round(mostRecentDays / 30)}개월 전이에요. 검색 순위가 떨어질 수 있어요`
      );
    } else {
      improvements.push(
        `마지막 활동이 ${Math.round(mostRecentDays / 30)}개월 이상 전이에요! 빨리 소식을 올려주세요`
      );
    }
  } else {
    improvements.push("최근 활동 이력을 확인할 수 없습니다");
  }

  return {
    score: clamp(score, 0, 10),
    max: 10,
    status: toStatus(score, 10),
    strengths,
    improvements,
  };
}

/* ─────────── 메인 함수 ─────────── */

/**
 * 크롤링 데이터를 기반으로 100점 만점 점수를 계산합니다.
 *
 * 채점 기준:
 * - 기본 정보 (15점): 영업시간, 주소, 전화번호, 소개글
 * - 사진 (20점, 업체 사진만): 장수별 구간 + 카테고리 다양성
 * - 리뷰 (25점): 리뷰 수 + 별점 + 답변률
 * - 메뉴 (15점): 등록 여부 + 가격 + 사진 + 설명
 * - 키워드 (15점): 소개글 내 업종+지역 키워드 포함
 * - 활성도 (10점): 최근 소식 업로드 주기
 */
export function calculateScore(data: PlaceData): ScoreResult {
  const basicInfo = scoreBasicInfo(data);
  const photos = scorePhotos(data);
  const reviews = scoreReviews(data);
  const menu = scoreMenu(data);
  const keywords = scoreKeywords(data);
  const activity = scoreActivity(data);

  const total =
    basicInfo.score +
    photos.score +
    reviews.score +
    menu.score +
    keywords.score +
    activity.score;

  return {
    total,
    breakdown: {
      basicInfo: basicInfo.score,
      photos: photos.score,
      reviews: reviews.score,
      menu: menu.score,
      keywords: keywords.score,
      activity: activity.score,
    },
    details: {
      basicInfo,
      photos,
      reviews,
      menu,
      keywords,
      activity,
    },
  };
}
