-- 발행된 글의 슬러그나 카테고리가 바뀌어도 기존 검색 URL을 보존합니다.
CREATE TABLE IF NOT EXISTS post_redirects (
  old_category_slug TEXT NOT NULL CHECK (length(trim(old_category_slug)) > 0),
  old_post_slug TEXT NOT NULL CHECK (length(trim(old_post_slug)) > 0),
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (old_category_slug, old_post_slug)
);

CREATE INDEX IF NOT EXISTS idx_post_redirects_post_id
ON post_redirects (post_id);
