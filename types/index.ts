/* ─────────── 공통 ─────────── */

export type Status = "bad" | "warning" | "good";
export type Plan = "free" | "basic" | "pro";
export type ReportType = "manual" | "weekly";
export type PaymentStatus = "pending" | "paid" | "cancelled" | "failed";
export type KeywordSource = "current" | "recommended";
export type ReviewTone = "friendly" | "professional" | "humorous";

/* ─────────── 크롤링 데이터 ─────────── */

export interface Review {
  author: string;
  rating: number;
  content: string;
  hasPhoto: boolean;
  ownerReply: string | null;
  date: string;
}

export interface Menu {
  name: string;
  price: number | null;
  description: string | null;
  hasPhoto: boolean;
  group: string | null; // 대표메뉴, 메인메뉴, 세트메뉴 등
  isRepresentative: boolean; // "대표" 뱃지 여부
}

export interface Feed {
  title: string;
  description: string;
  category: string;
  date: string;
  hasMedia: boolean;
}

export interface PlaceData {
  name: string;
  category: string;
  address: string;
  lat: number | null; // 위도
  lng: number | null; // 경도
  phone: string;
  hours: string[];
  description: string;
  introduction: string;
  photos: {
    business: number;
    visitor: number;
    categories: string[];
  };
  reviews: {
    total: number;
    avgRating: number;
    ownerReplyRate: number;
    recent: Review[];
  };
  menus: Menu[];
  keywords: string[];
  lastUpdate: string;
  feeds: Feed[];
}

/* ─────────── 점수 계산 ─────────── */

export interface ScoreBreakdown {
  basicInfo: number; // 15점 만점
  photos: number; // 20점 만점
  reviews: number; // 25점 만점
  menu: number; // 15점 만점
  keywords: number; // 15점 만점
  activity: number; // 10점 만점
}

export interface ScoreDetail {
  score: number;
  max: number;
  status: Status;
  strengths: string[];
  improvements: string[];
}

export interface ScoreResult {
  total: number;
  breakdown: ScoreBreakdown;
  details: {
    basicInfo: ScoreDetail;
    photos: ScoreDetail;
    reviews: ScoreDetail;
    menu: ScoreDetail;
    keywords: ScoreDetail;
    activity: ScoreDetail;
  };
}

/* ─────────── AI 분석 ─────────── */

export interface AnalysisResult {
  strengths: string[];
  improvements: string[];
  competitorInsight: string | null;
  weeklyActions: string[];
  summary: string;
}

export interface ReviewReply {
  tone: ReviewTone;
  content: string;
}

/* ─────────── DB 모델 (Supabase) ─────────── */

export interface DBUser {
  id: string;
  email: string;
  name: string | null;
  kakao_id: string | null;
  plan: Plan;
  plan_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBStore {
  id: string;
  user_id: string;
  naver_place_id: string | null;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  naver_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBReport {
  id: string;
  store_id: string;
  total_score: number;
  scores: ScoreBreakdown;
  analysis: AnalysisResult;
  competitors: PlaceData[] | null;
  raw_data: PlaceData;
  type: ReportType;
  created_at: string;
}

export interface DBReview {
  id: string;
  store_id: string;
  naver_review_id: string | null;
  author: string | null;
  rating: number;
  content: string | null;
  has_photo: boolean;
  owner_reply: string | null;
  ai_reply_suggestions: ReviewReply[] | null;
  is_replied: boolean;
  review_date: string | null;
  fetched_at: string;
}

export interface DBKeyword {
  id: string;
  store_id: string;
  keyword: string;
  source: KeywordSource;
  search_volume: string | null;
  competition: string | null;
  created_at: string;
}

export interface DBPayment {
  id: string;
  user_id: string;
  toss_payment_key: string | null;
  amount: number;
  plan: Plan;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

/* ─────────── 플랜 제한 ─────────── */

export interface PlanLimits {
  maxStores: number;
  monthlyAnalyses: number; // -1 = 무제한
  monthlyReviewReplies: number; // -1 = 무제한
  competitorCount: number; // 0 = 비활성
  keywordCount: number;
  weeklyAlert: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxStores: 1,
    monthlyAnalyses: 1,
    monthlyReviewReplies: 3,
    competitorCount: 0,
    keywordCount: 3,
    weeklyAlert: false,
  },
  basic: {
    maxStores: 1,
    monthlyAnalyses: -1,
    monthlyReviewReplies: 50,
    competitorCount: 3,
    keywordCount: 10,
    weeklyAlert: false,
  },
  pro: {
    maxStores: 3,
    monthlyAnalyses: -1,
    monthlyReviewReplies: -1,
    competitorCount: 5,
    keywordCount: 20,
    weeklyAlert: true,
  },
};
