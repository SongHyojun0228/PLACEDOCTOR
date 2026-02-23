/**
 * 네이버 플레이스 크롤러
 * GraphQL API 직접 호출 방식
 */

import type { PlaceData, Review, Menu, Feed } from "@/types";

/* ─────────── 상수 ─────────── */

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/place/graphql";

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const PLACE_DETAIL_QUERY = `
query getPlaceDetail($input: PlaceDetailInput!) {
  placeDetail(input: $input) {
    base {
      name
      category
      address
      roadAddress
      phone
      virtualPhone
      microReviews
      visitorReviewsTotal
      visitorReviewsScore
      coordinate { x y }
    }
    newBusinessHours {
      name
      businessHours {
        day
        description
        businessHours {
          start
          end
        }
      }
    }
    menus {
      name
      price
      images
      description
      recommend
      priority
    }
    baemin {
      menuGroups {
        name
        isRepresentative
        menus {
          name
          price
          desc
          images
          isRepresentative
        }
      }
    }
    images {
      totalImages
    }
    hasFeed {
      feedExist
    }
    keywords
    visitorReviews(input: { display: 30 }) {
      items {
        id
        rating
        body
        nickname
        visitCount
        created
        visited
        media { type thumbnail }
        reply { body }
        votedKeywords { name }
      }
      total
    }
    visitorReviewStats {
      analysis {
        themes { label count }
      }
    }
  }
}`;

/* ─────────── 유틸 ─────────── */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
 * 네이버 플레이스 URL에서 place ID와 카테고리를 추출합니다.
 */
export function parsePlaceUrl(input: string): {
  placeId: string;
  category: string;
} {
  if (/^\d+$/.test(input.trim())) {
    return { placeId: input.trim(), category: "place" };
  }

  const url = new URL(input);
  const match = url.pathname.match(
    /\/(restaurant|place|hairshop|hospital|beauty|cafe)\/(\d+)/
  );
  if (match) {
    return { placeId: match[2], category: match[1] };
  }

  throw new Error(`유효하지 않은 네이버 플레이스 URL입니다: ${input}`);
}

/* ─────────── GraphQL 호출 ─────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchGraphQL(placeId: string): Promise<any> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": MOBILE_UA,
      "Accept-Language": "ko-KR,ko;q=0.9",
      Referer: "https://m.place.naver.com/",
      "x-apollo-operation-name": "getPlaceDetail",
      "apollo-require-preflight": "true",
    },
    body: JSON.stringify({
      operationName: "getPlaceDetail",
      variables: {
        input: { id: placeId, isNx: false, deviceType: "mobile" },
      },
      query: PLACE_DETAIL_QUERY,
    }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL 요청 실패: HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json.errors?.length > 0) {
    const msg = json.errors[0].message ?? "알 수 없는 오류";
    // 404 = place not found
    if (msg.includes("404") || msg.includes("no result")) {
      return null;
    }
    throw new Error(`GraphQL 오류: ${msg}`);
  }

  const detail = json.data?.placeDetail;
  if (!detail?.base?.name) return null;

  return detail;
}

/* ─────────── 네이버 검색으로 place ID 찾기 ─────────── */

export async function searchPlaceId(query: string): Promise<string | null> {
  const searchUrl = `https://m.search.naver.com/search.naver?query=${encodeURIComponent(query)}`;

  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": MOBILE_UA,
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) return null;

  const html = await res.text();
  const placeMatch = html.match(
    /place\.naver\.com\/(restaurant|place|hairshop|hospital|beauty|cafe)\/(\d+)/
  );

  return placeMatch ? placeMatch[2] : null;
}

/**
 * URL ID로 GraphQL 호출. 실패 시 검색 폴백으로 올바른 ID를 찾습니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPlaceDetail(input: string): Promise<{ placeId: string; data: any }> {
  const { placeId } = parsePlaceUrl(input);

  // 1차: URL의 ID로 직접 시도
  const direct = await fetchGraphQL(placeId);
  if (direct) {
    return { placeId, data: direct };
  }

  // 2차: 검색으로 올바른 ID 찾기
  // 네이버 플레이스 페이지를 fetch해서 store name 얻기가 안 되므로 (SPA),
  // URL 자체로 검색하거나 placeId로 검색
  const searchQueries = [
    `네이버플레이스 ${placeId}`,
    `naver place ${placeId}`,
  ];

  for (const q of searchQueries) {
    const foundId = await searchPlaceId(q);
    if (foundId && foundId !== placeId) {
      await delay(1000);
      const result = await fetchGraphQL(foundId);
      if (result) {
        return { placeId: foundId, data: result };
      }
    }
  }

  throw new Error(
    "가게 정보를 찾을 수 없습니다. URL을 확인하거나 가게명으로 다시 시도해주세요."
  );
}

/* ─────────── GraphQL → PlaceData 변환 ─────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildMenus(data: any): Menu[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseMenus: any[] = data.menus ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baemin: any = data.baemin;

  // 1. Baemin 메뉴 그룹에서 풍부한 데이터 추출
  const baeminMenuMap = new Map<
    string,
    { price: number | null; desc: string; hasPhoto: boolean; group: string; isRep: boolean }
  >();

  if (baemin?.menuGroups) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const group of baemin.menuGroups as any[]) {
      const groupName: string = group.name ?? "";
      const groupIsRep: boolean = group.isRepresentative === true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const m of (group.menus ?? []) as any[]) {
        const name: string = m.name ?? "";
        if (!name) continue;
        baeminMenuMap.set(name, {
          price: m.price ? parseInt(String(m.price), 10) : null,
          desc: m.desc ?? "",
          hasPhoto: Array.isArray(m.images) && m.images.length > 0,
          group: groupName,
          isRep: m.isRepresentative === true || groupIsRep || groupName.includes("대표"),
        });
      }
    }
  }

  // 2. 기본 메뉴를 베이스로 하되, baemin 데이터로 보강
  const seen = new Set<string>();
  const menus: Menu[] = [];

  // 기본 메뉴 (매장 가격 기준)
  for (const m of baseMenus) {
    const name: string = m.name ?? "";
    if (!name) continue;
    seen.add(name);

    const bm = baeminMenuMap.get(name);
    menus.push({
      name,
      price: m.price ? parseInt(String(m.price), 10) : (bm?.price ?? null),
      description: m.description || bm?.desc || null,
      hasPhoto:
        (Array.isArray(m.images) && m.images.length > 0) ||
        (bm?.hasPhoto ?? false),
      group: bm?.group ?? null,
      isRepresentative: m.recommend === true || (bm?.isRep ?? false),
    });
  }

  // Baemin 전용 메뉴 (기본 메뉴에 없는 것)
  for (const [name, bm] of baeminMenuMap) {
    if (seen.has(name)) continue;
    seen.add(name);
    menus.push({
      name,
      price: bm.price,
      description: bm.desc || null,
      hasPhoto: bm.hasPhoto,
      group: bm.group,
      isRepresentative: bm.isRep,
    });
  }

  return menus;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildReviews(data: any): Review[] {
  const items = data.visitorReviews?.items ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.slice(0, 30).map((r: any) => {
    const keywords = Array.isArray(r.votedKeywords)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? r.votedKeywords.map((k: any) => k.name).join(", ")
      : "";
    return {
      author: r.nickname ?? "익명",
      rating: r.rating ?? 0,
      content: r.body ?? keywords,
      hasPhoto: Array.isArray(r.media) && r.media.length > 0,
      ownerReply: r.reply?.body ?? null,
      date: r.visited ?? r.created ?? "",
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function graphqlToPlaceData(data: any): PlaceData {
  const base = data.base;
  const menus = buildMenus(data);
  const reviews = buildReviews(data);
  const ownerReplyCount = reviews.filter((r) => r.ownerReply).length;

  // 영업시간 (newBusinessHours: top-level field)
  const hours: string[] = [];
  if (Array.isArray(data.newBusinessHours)) {
    const seen = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const group of data.newBusinessHours as any[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const h of (group.businessHours ?? []) as any[]) {
        const day: string = h.day ?? "";
        const time = h.businessHours;
        const start: string = time?.start ?? "";
        const end: string = time?.end ?? "";
        const desc: string = h.description ?? "";
        const timeStr = start && end ? `${start}~${end}` : (start || end);

        // 시간도 설명도 없으면 스킵
        if (!timeStr && !desc) continue;

        let result = day && timeStr ? `${day} ${timeStr}` : (day || timeStr);
        if (desc) result += ` (${desc})`;

        // 중복 제거 (같은 요일+시간 반복 방지)
        if (result && !seen.has(result)) {
          seen.add(result);
          hours.push(result);
        }
      }
    }
  }

  // 사진 통계 (API의 totalImages = 업체 사진 수)
  const businessPhotoCount: number = data.images?.totalImages ?? 0;
  const reviewPhotoCount = reviews.filter((r) => r.hasPhoto).length;

  // 소개글
  const microReviews = base.microReviews ?? [];
  const description = microReviews[0] ?? "";

  // 키워드: API keywords + 리뷰 테마
  let keywords: string[] = data.keywords ?? [];
  if (keywords.length === 0) {
    const themes = data.visitorReviewStats?.analysis?.themes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keywords = themes.slice(0, 10).map((t: any) => t.label).filter(Boolean);
  }

  // 피드/소식 데이터 (외부에서 주입)
  const feedDates: string[] = data._feedDates ?? [];
  const feeds: Feed[] = feedDates.map((date) => ({
    title: "소식",
    description: "",
    category: "feed",
    date,
    hasMedia: false,
  }));

  // feedExist=true인데 날짜 추출 실패 시 플레이스홀더
  if (data.hasFeed?.feedExist === true && feeds.length === 0) {
    feeds.push({
      title: "소식",
      description: "",
      category: "feed",
      date: "",
      hasMedia: false,
    });
  }

  // lastUpdate: 가장 최근 소식 날짜 (없으면 리뷰 날짜)
  const lastUpdate = feedDates[0] || reviews[0]?.date || "";

  return {
    name: base.name ?? "",
    category: base.category ?? "",
    address: base.roadAddress ?? base.address ?? "",
    lat: base.coordinate?.y ? parseFloat(base.coordinate.y) : null,
    lng: base.coordinate?.x ? parseFloat(base.coordinate.x) : null,
    phone: base.virtualPhone ?? base.phone ?? "",
    hours: hours.filter(Boolean),
    description,
    introduction: description,
    photos: {
      business: businessPhotoCount,
      visitor: reviewPhotoCount,
      categories: [],
    },
    reviews: {
      total: base.visitorReviewsTotal ?? 0,
      avgRating: base.visitorReviewsScore ?? 0,
      ownerReplyRate: reviews.length > 0 ? ownerReplyCount / reviews.length : 0,
      recent: reviews,
    },
    menus,
    keywords,
    lastUpdate,
    feeds,
  };
}

/* ─────────── 소식(피드) 날짜 추출 ─────────── */

/**
 * 네이버 플레이스 피드 페이지 HTML에서 소식 날짜를 추출합니다.
 * GraphQL API에서 소식 날짜를 제공하지 않아 피드 페이지의 Apollo 캐시에서 직접 파싱합니다.
 */
async function fetchFeedDates(placeId: string, category: string): Promise<string[]> {
  try {
    const url = `https://m.place.naver.com/${category}/${placeId}/feed`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": MOBILE_UA,
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const dates: string[] = [];
    const pattern = new RegExp(
      `"Feed:${placeId}_\\d+".*?"relativeCreated":"([^"]+)"`,
      "g"
    );
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) {
      dates.push(m[1]);
    }
    return dates;
  } catch {
    return [];
  }
}

/* ─────────── 메인 함수 ─────────── */

/** GraphQL 데이터에 피드 날짜를 주입 후 PlaceData 변환 */
export async function enrichAndConvert(
  placeId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  category: string,
): Promise<PlaceData> {
  const feedDates = await fetchFeedDates(placeId, category);
  data._feedDates = feedDates;
  return graphqlToPlaceData(data);
}

/**
 * 네이버 플레이스 URL에서 가게 데이터를 크롤링합니다.
 */
export async function scrapePlaceData(input: string): Promise<PlaceData> {
  const { category } = parsePlaceUrl(input);
  const { placeId, data } = await fetchPlaceDetail(input);
  return enrichAndConvert(placeId, data, category);
}

/**
 * 가게명으로 검색하여 첫 번째 결과의 PlaceData를 반환합니다.
 */
export async function searchAndScrape(storeName: string): Promise<PlaceData> {
  const foundId = await searchPlaceId(storeName);
  if (!foundId) {
    throw new Error(
      `"${storeName}" 검색 결과에서 네이버 플레이스를 찾을 수 없습니다. 정확한 가게명을 입력해주세요.`
    );
  }

  await delay(1000);
  const data = await fetchGraphQL(foundId);
  if (!data) {
    throw new Error("가게 정보를 가져오는 데 실패했습니다.");
  }

  return enrichAndConvert(foundId, data, "restaurant");
}

/**
 * 네이버 플레이스 URL에서 가게 데이터를 크롤링하고, placeId도 함께 반환합니다.
 */
export async function scrapePlaceDataWithId(
  input: string
): Promise<{ placeId: string; placeData: PlaceData }> {
  const { category } = parsePlaceUrl(input);
  const { placeId, data } = await fetchPlaceDetail(input);
  return { placeId, placeData: await enrichAndConvert(placeId, data, category) };
}
