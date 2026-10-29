-- 시설 고객 리뷰 (사진 + 글 + 키워드, 별점 없음). 관리자가 '게시'로 바꾼 것만 홈페이지에 보입니다.
CREATE TABLE IF NOT EXISTS facility_reviews (
  id          TEXT PRIMARY KEY,
  facility    TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT '대기',   -- 대기 / 게시 / 숨김
  ip_hash     TEXT,
  data        TEXT NOT NULL,                  -- JSON (name, text, keywords[], photos[])
  updated_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_frev_facility ON facility_reviews (facility, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_frev_ip ON facility_reviews (ip_hash, created_at);
