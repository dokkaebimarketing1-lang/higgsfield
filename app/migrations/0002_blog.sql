CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  tags TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  reading_minutes INTEGER NOT NULL DEFAULT 4,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category_id);

INSERT OR IGNORE INTO categories (slug, name, description, sort_order) VALUES
  ('lesson-guide', '과외 가이드', '피아노 과외 선택, 비용, 준비에 관한 모든 것', 1),
  ('practice', '연습 방법', '효율적인 피아노 연습법과 습관 만들기', 2),
  ('exam', '입시·콩쿠르', '음대 입시와 콩쿠르 준비 전략', 3),
  ('repertoire', '곡 추천', '수준별, 장르별 피아노 레퍼토리', 4),
  ('parents', '학부모 안내', '아이 피아노 교육, 부모가 알아야 할 것들', 5),
  ('local', '지역 레슨', '서대문구 · 마포구 피아노 레슨 안내', 6);
