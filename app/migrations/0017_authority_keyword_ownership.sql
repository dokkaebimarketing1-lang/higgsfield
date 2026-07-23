UPDATE posts
SET
  title = '피아노 코드 연습, 초보가 먼저 익힐 7개와 연결 순서',
  excerpt = '피아노 코드 연습을 처음 시작하는 초보자를 위해 C장조에서 자주 만나는 7개 기본 코드, 자리바꿈과 양손 반주로 이어지는 순서를 정리했습니다.',
  body = REPLACE(
    body,
    '피아노 코드는 여러 음을 동시에 누르는 모양을 외우는 데서 끝나지 않습니다.',
    '피아노 코드 연습은 여러 음을 동시에 누르는 모양을 외우는 데서 끝나지 않습니다.'
  ),
  tags = '피아노 코드 연습, 피아노 코드, 피아노 반주법, 초보 피아노',
  meta_title = '피아노 코드 연습 7개와 초보 연결 순서 | 이화 피아노 과외',
  meta_description = '피아노 코드 연습을 처음 시작하는 초보자를 위해 C장조 7개 기본 코드의 구성음, 자리바꿈, 양손 반주와 하루 15분 연습 순서를 안내합니다.',
  updated_at = datetime('now')
WHERE slug = 'piano-chords-basics'
  AND status = 'draft'
  AND published_at IS NULL
  AND updated_at = created_at
  AND title = '피아노 코드, 초보가 먼저 익힐 7개와 연습 순서'
  AND tags = '피아노 코드, 피아노 코드 연습, 피아노 반주법, 초보 피아노'
  AND meta_title = '피아노 코드 7개와 초보 연습 순서 | 이화 피아노 과외';

UPDATE post_keyword_evidence
SET
  source_row = 1240,
  total_monthly_searches = 80,
  naver_monthly_searches = 40,
  naver_mobile_searches = 30,
  naver_pc_searches = 10,
  google_monthly_searches = 40,
  naver_competition = '높음',
  google_competition = '낮음',
  selection_note = '피아노 코드표 도구가 정확 일치 키워드를 소유하므로 CMS 초안은 연습 의도의 롱테일로 재배정',
  researched_at = '2026-07-23'
WHERE post_id = (
  SELECT id
  FROM posts
  WHERE slug = 'piano-chords-basics'
    AND status = 'draft'
    AND tags = '피아노 코드 연습, 피아노 코드, 피아노 반주법, 초보 피아노'
);
