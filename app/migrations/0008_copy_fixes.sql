-- 이미 배포된 카테고리와 글의 한국어 오타를 기존 내용을 보존하며 보정한다.
-- WHERE 조건과 REPLACE를 함께 사용해 반복 적용해도 결과가 같다.
UPDATE categories
SET description = REPLACE(description, '장률별', '장르별')
WHERE slug = 'repertoire'
  AND description LIKE '%장률별%';

UPDATE posts
SET
  excerpt = REPLACE(excerpt, '낸드 박자감', '내적 박자감'),
  body = REPLACE(
    REPLACE(
      REPLACE(body, '낸드 박자감', '내적 박자감'),
      '물냅니다',
      '무너집니다'
    ),
    '싱코페지션',
    '싱코페이션'
  ),
  meta_description = REPLACE(meta_description, '낸드 박자감', '내적 박자감'),
  updated_at = datetime('now')
WHERE slug = 'metronome-use'
  AND (
    excerpt LIKE '%낸드 박자감%'
    OR body LIKE '%낸드 박자감%'
    OR body LIKE '%물냅니다%'
    OR body LIKE '%싱코페지션%'
    OR meta_description LIKE '%낸드 박자감%'
  );

UPDATE posts
SET
  body = REPLACE(body, '손이 물냅니다', '손 모양이 무너집니다'),
  updated_at = datetime('now')
WHERE slug = 'beginner-pieces'
  AND body LIKE '%손이 물냅니다%';
