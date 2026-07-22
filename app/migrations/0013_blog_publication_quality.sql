-- 발행 품질 게이트를 위한 명시적 커버 이미지 대체 텍스트.
-- 기존 글은 현재 제목을 안전한 초기값으로 사용하되, 이후 새 발행 글은 CMS에서 직접 입력한다.
ALTER TABLE posts ADD COLUMN cover_alt TEXT NOT NULL DEFAULT '';

UPDATE posts
SET cover_alt = title
WHERE trim(cover_alt) = '';

-- 기존 발행 글 가운데 커버가 없던 연습 클러스터 글은 해당 카테고리 자산을 사용한다.
UPDATE posts
SET cover_image = '/assets/cat-practice.jpg',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'piano-self-study'
  AND trim(cover_image) = '';
