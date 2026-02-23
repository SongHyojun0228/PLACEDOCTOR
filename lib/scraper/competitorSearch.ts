/**
 * 경쟁 가게 검색 및 크롤링
 * 네이버 검색에서 동일 카테고리+지역의 가게를 찾고
 * 반경 1km 이내의 같은 업종 가게만 필터링
 */

import type { PlaceData } from "@/types";
import { fetchGraphQL, enrichAndConvert } from "./naverPlace";

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const RADIUS_KM = 1; // 반경 1km

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 두 좌표 간 거리 계산 (Haversine, km)
 */
function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 주소에서 구/군, 동 추출
 */
function parseLocation(address: string): { gu: string; dong: string } {
  const match = address.match(/(\S+[구군])\s*(\S+[동읍면리])?/);
  if (!match) return { gu: "", dong: "" };
  return { gu: match[1] || "", dong: match[2] || "" };
}

/**
 * 가게명에서 역 이름 / 지역명 추출 (예: "긴자료코 숙대점" → "숙대")
 */
function extractAreaFromName(name: string): string | null {
  // "OOO 숙대점", "OOO 신촌점" 등에서 지역명 추출
  const match = name.match(/\s+(\S+?)(?:점|역점|역직영점|직영점|본점)$/);
  if (match) return match[1];
  return null;
}

/**
 * 다양한 검색 쿼리 생성
 * 지번주소(동 포함) + 도로명주소(구) + 가게명 지역명을 조합
 */
function buildSearchQueries(
  category: string,
  roadAddress: string,
  storeName: string,
  jibeonAddress?: string,
): string[] {
  const catParts = category.split(/[>,\/]+/).map((s) => s.trim()).filter(Boolean);
  const mainCat = catParts[catParts.length - 1] || catParts[0] || category;

  const queries: string[] = [];

  // 1. 지번주소에서 동 추출 (가장 정확)
  if (jibeonAddress) {
    const { gu, dong } = parseLocation(jibeonAddress);
    if (dong) {
      queries.push(`${dong} ${mainCat}`);
      queries.push(`${dong} ${mainCat} 맛집`);
    }
    if (gu) {
      queries.push(`${gu} ${mainCat}`);
    }
  }

  // 2. 도로명주소에서 구 추출
  const { gu } = parseLocation(roadAddress);
  if (gu && !queries.some((q) => q.startsWith(gu))) {
    queries.push(`${gu} ${mainCat}`);
  }

  // 3. 가게명에서 지역 키워드 추출 (예: "숙대", "신촌")
  const areaHint = extractAreaFromName(storeName);
  if (areaHint) {
    queries.push(`${areaHint} ${mainCat}`);
    queries.push(`${areaHint} ${mainCat} 맛집`);
  }

  // 중복 제거
  return [...new Set(queries)];
}

/**
 * 네이버 검색 HTML에서 place ID 목록 추출
 */
async function searchCompetitorIds(
  category: string,
  address: string,
  storeName: string,
  myPlaceId: string,
  jibeonAddress?: string,
): Promise<string[]> {
  const queries = buildSearchQueries(category, address, storeName, jibeonAddress);
  if (queries.length === 0) return [];

  console.log(`[Competitor] 검색 쿼리: ${queries.join(" | ")}`);

  const foundIds = new Set<string>();

  for (const query of queries) {
    try {
      const searchUrl = `https://m.search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent": MOBILE_UA,
          "Accept-Language": "ko-KR,ko;q=0.9",
        },
        redirect: "follow",
      });

      if (!res.ok) continue;

      const html = await res.text();
      const pattern = /place\.naver\.com\/(?:restaurant|place|hairshop|hospital|beauty|cafe)\/(\d+)/g;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html)) !== null) {
        const id = match[1];
        if (id !== myPlaceId) {
          foundIds.add(id);
        }
      }
    } catch {
      // 검색 실패 시 다음 쿼리 시도
    }

    await delay(1000);
  }

  console.log(`[Competitor] 후보 ${foundIds.size}곳 발견`);
  return Array.from(foundIds);
}

/**
 * 경쟁 가게 목록을 크롤링하여 PlaceData[] 반환
 * 반경 1km 이내 + 같은 카테고리 가게만 필터링, 개수 제한 없음
 */
export async function scrapeCompetitors(
  myPlaceId: string,
  category: string,
  address: string,
  storeName: string,
  myLat: number | null,
  myLng: number | null,
  jibeonAddress?: string,
): Promise<{ placeId: string; placeData: PlaceData; distance: number }[]> {
  const ids = await searchCompetitorIds(category, address, storeName, myPlaceId, jibeonAddress);
  if (ids.length === 0) return [];

  const results: { placeId: string; placeData: PlaceData; distance: number }[] = [];

  for (const id of ids) {
    try {
      const data = await fetchGraphQL(id);
      if (!data) continue;

      const placeData = await enrichAndConvert(id, data, "restaurant");

      // 반경 필터링 (좌표 필수)
      if (myLat && myLng && placeData.lat && placeData.lng) {
        const dist = distanceKm(myLat, myLng, placeData.lat, placeData.lng);
        if (dist > RADIUS_KM) {
          console.log(`[Competitor] ${placeData.name} 제외 (${dist.toFixed(2)}km)`);
          continue;
        }
        console.log(`[Competitor] ${placeData.name} 포함 (${dist.toFixed(2)}km)`);
        results.push({ placeId: id, placeData, distance: dist });
      } else if (!myLat || !myLng) {
        // 내 좌표가 없으면 필터링 불가 → 포함
        results.push({ placeId: id, placeData, distance: 999 });
      } else {
        // 경쟁 가게 좌표가 없으면 제외
        console.log(`[Competitor] ${placeData.name} 제외 (좌표 없음)`);
      }
    } catch (err) {
      console.error(`[Competitor] ${id} 크롤링 실패:`, err);
    }

    await delay(2000);
  }

  // 가까운 순서대로 정렬
  results.sort((a, b) => a.distance - b.distance);

  return results.map(({ placeId, placeData, distance }) => ({ placeId, placeData, distance }));
}
