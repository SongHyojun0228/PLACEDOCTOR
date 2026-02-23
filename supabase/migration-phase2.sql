-- ============================================
-- PlaceDoctor Phase 2 — DB 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  kakao_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 가게
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  naver_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  naver_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 진단 리포트
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  total_score INT,
  scores JSONB,
  analysis JSONB,
  competitors JSONB,
  raw_data JSONB,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 리뷰
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  naver_review_id TEXT,
  author TEXT,
  rating INT,
  content TEXT,
  has_photo BOOLEAN DEFAULT false,
  owner_reply TEXT,
  ai_reply_suggestions JSONB,
  is_replied BOOLEAN DEFAULT false,
  review_date TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- 키워드
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  source TEXT CHECK (source IN ('current', 'recommended')),
  search_volume TEXT,
  competition TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 결제
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  toss_payment_key TEXT,
  amount INT,
  plan TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 인덱스
-- ============================================

CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_reports_store_id ON reports(store_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reviews_store_id ON reviews(store_id);
CREATE INDEX idx_reviews_is_replied ON reviews(is_replied) WHERE is_replied = false;
CREATE INDEX idx_keywords_store_id ON keywords(store_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- users: 본인만 읽기/수정
CREATE POLICY "Users read own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- stores: 본인 가게만
CREATE POLICY "Stores owner select" ON stores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Stores owner insert" ON stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Stores owner delete" ON stores
  FOR DELETE USING (auth.uid() = user_id);

-- reports: 본인 가게 리포트만
CREATE POLICY "Reports owner only" ON reports
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- reviews: 본인 가게 리뷰만
CREATE POLICY "Reviews owner only" ON reviews
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- keywords: 본인 가게 키워드만
CREATE POLICY "Keywords owner only" ON keywords
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- payments: 본인 결제만
CREATE POLICY "Payments owner only" ON payments
  FOR SELECT USING (auth.uid() = user_id);
