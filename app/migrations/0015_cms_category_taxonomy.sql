-- CMS 공개 카테고리를 6개 검색 의도 허브로 고정한다.
-- 기존 카테고리 URL은 유지하고, 실제 의미가 달랐던 온라인 레슨 글만 이전한다.

UPDATE categories
SET name = '레슨 선택·비용',
    description = '비용, 수업 방식, 선생님과 대상별 레슨 선택 기준',
    sort_order = 1
WHERE slug = 'lesson-guide';

UPDATE categories
SET name = '연습·독학',
    description = '연습 순서, 악보 읽기, 리듬, 테크닉과 독학 습관',
    sort_order = 2
WHERE slug = 'practice';

UPDATE categories
SET name = '입시·콩쿠르',
    description = '음대 입시, 콩쿠르, 실기와 무대 준비 전략',
    sort_order = 3
WHERE slug = 'exam';

UPDATE categories
SET name = '연주곡·레퍼토리',
    description = '수준, 목적과 장르별 피아노 연주곡 선택 가이드',
    sort_order = 4
WHERE slug = 'repertoire';

UPDATE categories
SET name = '아이·학부모',
    description = '아이의 시작 시기, 악기, 연습 환경과 부모 역할',
    sort_order = 5
WHERE slug = 'parents';

UPDATE categories
SET name = '서울 지역 레슨',
    description = '서대문구, 마포구와 이대 인근 방문 레슨 지역 안내',
    sort_order = 6
WHERE slug = 'local';

INSERT INTO post_redirects (old_category_slug, old_post_slug, post_id)
SELECT 'local', 'online-piano-lesson', p.id
FROM posts p
INNER JOIN categories c ON c.id = p.category_id
WHERE p.slug = 'online-piano-lesson'
  AND c.slug = 'local'
ON CONFLICT(old_category_slug, old_post_slug) DO UPDATE SET
  post_id = excluded.post_id,
  created_at = datetime('now');

UPDATE posts
SET category_id = (SELECT id FROM categories WHERE slug = 'lesson-guide' LIMIT 1),
    updated_at = datetime('now')
WHERE slug = 'online-piano-lesson'
  AND category_id = (SELECT id FROM categories WHERE slug = 'local' LIMIT 1);
