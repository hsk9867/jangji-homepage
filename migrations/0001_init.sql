-- 배웅 홈페이지 D1 스키마
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,   -- 'content' (관리자 저장 콘텐츠), 'auth' (비밀번호 해시), 'lock' (로그인 잠금)
  value      TEXT NOT NULL,      -- JSON
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id          TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT '신규',
  admin_note  TEXT,
  ip_hash     TEXT,
  data        TEXT NOT NULL,     -- JSON (type, region, when, name, phone, facility, memo, page ...)
  updated_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_inquiries_received ON inquiries (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_ip ON inquiries (ip_hash, received_at);

-- 방문 통계 (추후 /t.js 연동용)
CREATE TABLE IF NOT EXISTS hits (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       TEXT NOT NULL DEFAULT (datetime('now')),
  path     TEXT,
  referrer TEXT,
  source   TEXT,
  ua_hash  TEXT
);
CREATE INDEX IF NOT EXISTS idx_hits_ts ON hits (ts);
