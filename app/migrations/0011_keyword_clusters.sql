-- 키워드 역할, 검색 의도, 토픽 클러스터를 분리해 관리한다.
-- 분류 백필은 updated_at을 변경하지 않는다.

ALTER TABLE posts
ADD COLUMN keyword_role TEXT NOT NULL DEFAULT 'informational'
CHECK (keyword_role IN ('main', 'expansion', 'informational', 'long-tail', 'utility'));

ALTER TABLE posts
ADD COLUMN search_intent TEXT NOT NULL DEFAULT 'informational'
CHECK (search_intent IN ('commercial', 'comparison', 'informational', 'local', 'navigational'));

ALTER TABLE posts
ADD COLUMN keyword_cluster TEXT NOT NULL DEFAULT 'general'
CHECK (
  length(trim(keyword_cluster)) > 0
  AND keyword_cluster IN (
    'general',
    'lesson',
    'pricing',
    'adult',
    'children',
    'home-visit',
    'admission',
    'practice',
    'repertoire',
    'local'
  )
);

CREATE INDEX IF NOT EXISTS idx_posts_keyword_cluster_status
ON posts (keyword_cluster, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_keyword_role_intent
ON posts (keyword_role, search_intent);

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'commercial',
    keyword_cluster = 'pricing'
WHERE slug = 'piano-tutoring-cost';

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'commercial',
    keyword_cluster = 'lesson'
WHERE slug IN (
  'choosing-piano-tutor',
  'tutoring-time-guide'
);

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'comparison',
    keyword_cluster = 'lesson'
WHERE slug IN (
  'academy-vs-tutoring',
  'online-piano-lesson'
);

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'comparison',
    keyword_cluster = 'adult'
WHERE slug = 'adult-piano-tutoring';

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'informational',
    keyword_cluster = 'children'
WHERE slug IN (
  'elementary-piano-tutoring',
  'practice-habit',
  'piano-start-age',
  'child-hates-practice',
  'practice-parent-role'
);

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'comparison',
    keyword_cluster = 'children'
WHERE slug = 'buying-first-piano';

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'informational',
    keyword_cluster = 'home-visit'
WHERE slug = 'home-lesson-prep';

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'informational',
    keyword_cluster = 'admission'
WHERE slug IN (
  'music-college-entrance',
  'competition-prep',
  'exam-piece-selection',
  'stage-fright',
  'competition-pieces'
);

UPDATE posts
SET keyword_role = 'long-tail',
    search_intent = 'informational',
    keyword_cluster = 'admission'
WHERE slug = 'ewha-piano-exam';

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'informational',
    keyword_cluster = 'practice'
WHERE slug IN (
  'piano-practice-method',
  'hanon-practice',
  'sight-reading',
  'metronome-use'
);

UPDATE posts
SET keyword_role = 'informational',
    search_intent = 'informational',
    keyword_cluster = 'repertoire'
WHERE slug IN (
  'beginner-pieces',
  'easy-piano-songs',
  'intermediate-pieces',
  'new-age-piano'
);

UPDATE posts
SET keyword_role = 'long-tail',
    search_intent = 'local',
    keyword_cluster = 'local'
WHERE slug IN (
  'seodaemun-piano',
  'mapo-piano',
  'ewha-area-lesson',
  'seoul-piano-tutoring'
);

-- 아래 7개 글은 0010 적용 후의 전체 필드와 본문 첫 문단이 일치할 때만 재타기팅한다.
-- 관리자가 한 필드라도 수정했거나 첫 문단을 바꿘다면 해당 UPDATE는 실행되지 않는다.

UPDATE posts
SET title = '유아 피아노, 몇 살부터 시작하면 좋을까?',
    excerpt = '유아 피아노를 시작할 때는 나이보다 준비 신호를 먼저 확인해야 합니다. 수업을 시작하기 전 살펴볼 세 가지 기준과 너무 이른 시작의 주의점을 정리했습니다.',
    tags = '유아 피아노, 피아노 시작 나이, 아이 피아노, 피아노 교육',
    meta_title = '유아 피아노, 몇 살부터 시작할까? | 이화 피아노 과외',
    meta_description = '유아 피아노는 몇 살부터 시작하면 좋을까요? 나이보다 중요한 준비 신호, 첫 수업 전 확인할 기준과 너무 이른 시작의 주의점을 안내합니다.',
    body = '유아 피아노를 시작할 시점은 **나이 하나로 결정하기 어렵습니다.** 숫자보다 아이가 짧은 설명을 듣고 따라 하는지, 건반 활동에 흥미를 보이는지 같은 준비 신호를 먼저 살펴야 합니다.' || substr(body, length('피아노 시작 적정 연령은 **보통 5세에서 7세 사이**입니다. 다만 나이 숫자보다 중요한 것은 아이의 준비 상태입니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'piano-start-age'
  AND title = '아이 피아노 시작 나이, 몇 살이 적당할까?'
  AND excerpt = '아이 피아노 시작 나이는 보통 5~7세지만 나이보다 준비 신호가 더 중요합니다. 시작 전 확인할 세 가지 기준과 주의점을 정리했습니다.'
  AND tags = '아이 피아노, 피아노 시작 나이, 유아 피아노, 피아노 교육'
  AND meta_title = ''
  AND meta_description = '아이 피아노 시작 나이는 보통 5~7세입니다. 나이보다 중요한 세 가지 준비 신호, 너무 일찍 시작했을 때의 주의점과 첫 수업 기준을 안내합니다.'
  AND status = 'published'
  AND substr(body, 1, length('피아노 시작 적정 연령은 **보통 5세에서 7세 사이**입니다. 다만 나이 숫자보다 중요한 것은 아이의 준비 상태입니다.')) = '피아노 시작 적정 연령은 **보통 5세에서 7세 사이**입니다. 다만 나이 숫자보다 중요한 것은 아이의 준비 상태입니다.';

UPDATE posts
SET title = '초등학생 피아노, 시작 전 부모가 알아둘 연습 기준',
    excerpt = '초등학생 피아노 학습은 손 습관과 짧고 꾸준한 연습 루틴이 핵심입니다. 시작 전에 알아둘 학습 순서, 연습 환경과 부모의 역할을 정리했습니다.',
    tags = '초등학생 피아노, 초등 피아노 연습, 어린이 피아노, 피아노 교육',
    meta_title = '초등학생 피아노 시작 전 연습 기준 | 이화 피아노 과외',
    meta_description = '초등학생 피아노 학습을 시작하기 전 손 습관, 연습 루틴, 학습 순서와 부모의 역할을 확인하세요. 수업 선택 전에 알아둘 기준을 안내합니다.',
    body = '초등학생 피아노 학습에서 먼저 잡아야 할 것은 **올바른 손 습관과 짧고 꾸준한 연습 루틴**입니다. 이 글은 특정 레슨을 소개하기보다 수업을 고르기 전에 부모가 확인할 학습 기준을 정리합니다.' || substr(body, length('초등학생의 피아노 과외에서 가장 중요한 것은 **올바른 손 습관과 매일의 연습 루틴**입니다. 이 두 가지가 잡히면 진도는 자연스럽게 따라옵니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'elementary-piano-tutoring'
  AND title = '초등 피아노 과외, 시작 전 부모가 알아야 할 것'
  AND excerpt = '초등 피아노 과외는 손 습관과 연습 루틴을 함께 잡는 수업입니다. 시작 전에 알아둘 커리큘럼, 연습 시간과 부모의 역할을 정리했습니다.'
  AND tags = '초등 피아노 과외, 어린이 피아노, 피아노 과외'
  AND meta_title = ''
  AND meta_description = '초등 피아노 과외를 시작하기 전 부모가 알아야 할 모든 것입니다. 손 습관과 연습 루틴이 전부인 이 시기, 배우는 순서와 커리큘럼, 하루 적정 연습 시간, 부모는 어디까지 도와야 하는지, 방문 레슨 준비물까지. 초등 아이의 피아노 첫걸음을 실제 레슨 경험으로 안내합니다.'
  AND status = 'published'
  AND substr(body, 1, length('초등학생의 피아노 과외에서 가장 중요한 것은 **올바른 손 습관과 매일의 연습 루틴**입니다. 이 두 가지가 잡히면 진도는 자연스럽게 따라옵니다.')) = '초등학생의 피아노 과외에서 가장 중요한 것은 **올바른 손 습관과 매일의 연습 루틴**입니다. 이 두 가지가 잡히면 진도는 자연스럽게 따라옵니다.';

UPDATE posts
SET title = '피아노 악보 읽는 법, 초시가 늘지 않을 때 점검할 것',
    excerpt = '피아노 악보 읽는 법은 음을 외우기보다 패턴을 읽는 훈련이 핵심입니다. 초시가 늘지 않는 원인과 바로 적용할 연습 순서를 정리했습니다.',
    tags = '피아노 악보 읽는 법, 초시 연습, 악보 읽기, 피아노 초견',
    meta_title = '피아노 악보 읽는 법과 초시 연습 | 이화 피아노 과외',
    meta_description = '피아노 악보 읽는 법은 음을 하나씩 외우기보다 패턴으로 읽는 훈련이 핵심입니다. 초시가 늘지 않는 원인과 단계별 연습 순서를 안내합니다.',
    body = '피아노 악보 읽는 법의 핵심은 **음을 하나씩 외우는 것이 아니라 흐름과 패턴을 함께 읽는 것**입니다. 초시가 늘지 않는다면 음이름 암기보다 음정 간격과 리듬 덩어리를 보는 순서부터 점검해야 합니다.' || substr(body, length('악보 초시(처음 보는 악보를 바로 치는 것)는 **음을 하나씩 읽는 능력이 아니라, 묶음의 패턴으로 읽는 능력**입니다. 초시가 늘지 않는 사람은 대개 음을 낱글자처럼 읽고 있습니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'sight-reading'
  AND title = '악보 읽는 법, 초시가 늘지 않을 때 점검할 것'
  AND excerpt = '악보 읽는 법은 음을 외우기보다 패턴을 읽는 훈련이 핵심입니다. 초시가 늘지 않는 원인과 바로 적용할 수 있는 연습법을 정리했습니다.'
  AND tags = '악보 읽는 법, 초시, 악보 읽기, 피아노 독학'
  AND meta_title = ''
  AND meta_description = '악보 읽는 법은 음을 하나씩 외우기보다 패턴으로 읽는 훈련이 핵심입니다. 초시가 늘지 않는 세 가지 원인과 단계별 연습법을 안내합니다.'
  AND status = 'published'
  AND substr(body, 1, length('악보 초시(처음 보는 악보를 바로 치는 것)는 **음을 하나씩 읽는 능력이 아니라, 묶음의 패턴으로 읽는 능력**입니다. 초시가 늘지 않는 사람은 대개 음을 낱글자처럼 읽고 있습니다.')) = '악보 초시(처음 보는 악보를 바로 치는 것)는 **음을 하나씩 읽는 능력이 아니라, 묶음의 패턴으로 읽는 능력**입니다. 초시가 늘지 않는 사람은 대개 음을 낱글자처럼 읽고 있습니다.';

UPDATE posts
SET title = '성인 피아노 학원 vs 개인 레슨, 어떤 방식이 맞을까?',
    excerpt = '성인 피아노 학원 vs 개인 레슨은 일정, 피드백, 비용 확인 방식과 연습 환경이 다릅니다. 왕초보와 직장인이 선택 전에 점검할 항목을 정리했습니다.',
    tags = '성인 피아노 학원 vs 개인 레슨, 성인 피아노 학원, 성인 피아노 개인 레슨, 성인 피아노 레슨',
    meta_title = '성인 피아노 학원 vs 개인 레슨 비교 | 이화 피아노 과외',
    meta_description = '성인 피아노 학원 vs 개인 레슨 비교를 일정, 피드백, 비용 확인 방식과 연습 환경 기준으로 정리했습니다. 신청 전에 자신에게 맞는 수업 형태를 확인하세요.',
    body = '성인 피아노 학원 vs 개인 레슨을 고를 때는 **일정, 피드백 방식, 혼자 연습할 환경**을 함께 봐야 합니다. 이 글은 레슨 신청 페이지가 아니라 두 수업 형태의 차이를 비교하는 선택 가이드입니다.' || substr(body, length('성인이 피아노를 시작하기에 **늦은 나이는 없습니다.** 오히려 성인은 이해력과 목표 의식 덕분에 입문 속도가 아이보다 빠른 경우가 많습니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'adult-piano-tutoring'
  AND title = '성인 피아노 과외, 왕초보도 늦지 않은 이유'
  AND excerpt = '성인 피아노 과외는 왕초보도 늦지 않습니다. 성인이 더 빠르게 이해할 수 있는 이유와 직장인이 현실적으로 수업과 연습을 이어가는 방법을 정리했습니다.'
  AND tags = '성인 피아노 과외, 성인 피아노 레슨, 피아노 배우기, 직장인 피아노'
  AND meta_title = ''
  AND meta_description = '성인 피아노 과외, 왕초보여도 늦지 않은 이유를 알려드립니다. 악보를 처음 읽는 분도 기초부터 차근차근 배워 평균 3개월이면 간단한 곡 한 곡을 완성합니다. 이해력 덕분에 아이보다 빠른 입문 속도, 직장인이 퇴근 후 현실적으로 계속하는 연습법과 레슨 활용법까지 정리했습니다.'
  AND status = 'published'
  AND substr(body, 1, length('성인이 피아노를 시작하기에 **늦은 나이는 없습니다.** 오히려 성인은 이해력과 목표 의식 덕분에 입문 속도가 아이보다 빠른 경우가 많습니다.')) = '성인이 피아노를 시작하기에 **늦은 나이는 없습니다.** 오히려 성인은 이해력과 목표 의식 덕분에 입문 속도가 아이보다 빠른 경우가 많습니다.';

UPDATE posts
SET title = '피아노 학원 vs 과외, 아이에게 맞는 선택 기준',
    excerpt = '피아노 학원 vs 과외를 수업 구조, 피드백, 일정과 아이 성향으로 비교했습니다. 특정 방식을 권하기보다 선택 전에 확인할 기준을 정리했습니다.',
    tags = '피아노 학원 vs 과외, 피아노 학원, 피아노 과외, 피아노 교육 비교',
    meta_title = '피아노 학원 vs 과외 선택 기준 | 이화 피아노 과외',
    meta_description = '피아노 학원 vs 과외를 수업 구조, 피드백, 일정과 아이 성향으로 비교했습니다. 특정 방식을 권하기보다 가정에 맞는 선택 기준을 안내합니다.',
    body = '피아노 학원 vs 과외는 **어느 한쪽이 항상 낫다고 결론낼 수 없는 선택**입니다. 수업 구조, 피드백 밀도, 이동 일정과 아이의 성향을 함께 비교해야 하며, 이 글은 특정 서비스보다 선택 기준을 정리합니다.' || substr(body, length('정답부터 말하면, **입문 초기와 입시 준비에는 과외가, 사회성과 꾸준한 습관 형성에는 학원이** 맞는 경우가 많습니다. 다만 아이의 성향이 먼저입니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'academy-vs-tutoring'
  AND title = '피아노 학원 vs 과외, 우리 아이에게 맞는 선택은?'
  AND excerpt = '피아노 학원은 시스템과 또래가, 과외는 맞춤 속도와 밀착 관리가 강점입니다. 아이의 성향과 목표에 따라 어떤 선택이 맞는지 기준을 정리했습니다.'
  AND tags = '피아노 학원, 피아노 과외, 학원 vs 과외, 피아노 교육'
  AND meta_title = ''
  AND meta_description = '피아노 학원 vs 과외, 우리 아이에게 맞는 선택은 무엇일까요. 체계적 시스템과 또래 활동이 강점인 학원, 맞춤 속도와 1:1 밀착 관리가 강점인 과외. 아이의 성향과 목표에 따른 선택 기준, 비용 비교, 두 가지를 함께 활용하는 현실적인 방법까지 실제 사례로 정리했습니다.'
  AND status = 'published'
  AND substr(body, 1, length('정답부터 말하면, **입문 초기와 입시 준비에는 과외가, 사회성과 꾸준한 습관 형성에는 학원이** 맞는 경우가 많습니다. 다만 아이의 성향이 먼저입니다.')) = '정답부터 말하면, **입문 초기와 입시 준비에는 과외가, 사회성과 꾸준한 습관 형성에는 학원이** 맞는 경우가 많습니다. 다만 아이의 성향이 먼저입니다.';

UPDATE posts
SET title = '방문 레슨 준비, 첫 수업 전 확인할 체크리스트',
    excerpt = '방문 레슨 준비는 악기 상태, 수업 공간과 보호자 동선을 확인하는 것에서 시작합니다. 첫 수업 전에 가정에서 준비할 항목을 정리했습니다.',
    tags = '방문 레슨 준비, 방문 피아노 레슨, 홈 레슨, 피아노 수업 준비',
    meta_title = '방문 레슨 준비 체크리스트 | 이화 피아노 과외',
    meta_description = '방문 레슨 준비는 악기 상태, 수업 공간, 조명과 보호자 동선을 확인하는 것에서 시작합니다. 첫 수업 전에 확인할 체크리스트를 안내합니다.',
    body = '방문 레슨 준비는 **악기 상태, 수업 공간, 보호자 동선을 미리 확인하는 것**에서 시작합니다. 이 글은 방문 레슨 서비스 소개보다 첫 수업 전에 가정에서 점검할 체크리스트에 집중합니다.' || substr(body, length('방문 레슨은 **아이가 가장 편한 환경에서 배운다**는 것이 가장 큰 장점입니다. 준비물은 많지 않습니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'home-lesson-prep'
  AND title = '방문 피아노 과외, 집에서 준비할 것들'
  AND excerpt = '방문 피아노 과외는 아이가 익숙한 집에서 배울 수 있다는 장점이 있습니다. 첫 수업 전 악기, 공간과 보호자가 준비할 사항을 정리했습니다.'
  AND tags = '방문 피아노 과외, 홈 레슨, 피아노 과외, 출강 레슨'
  AND meta_title = ''
  AND meta_description = '방문 피아노 과외를 시작하기 전 악기 상태, 수업 공간, 보호자 역할을 확인하세요. 아이가 익숙한 집에서 집중할 수 있도록 준비할 사항을 안내합니다.'
  AND status = 'published'
  AND substr(body, 1, length('방문 레슨은 **아이가 가장 편한 환경에서 배운다**는 것이 가장 큰 장점입니다. 준비물은 많지 않습니다.')) = '방문 레슨은 **아이가 가장 편한 환경에서 배운다**는 것이 가장 큰 장점입니다. 준비물은 많지 않습니다.';

UPDATE posts
SET title = '피아노 연습 부모 역할, 어디까지 도와야 할까?',
    excerpt = '피아노 연습 부모 역할은 감독보다 환경을 설계하고 꾸준한 습관을 돕는 일에 가깝습니다. 연령별로 도울 일과 피해야 할 말을 정리했습니다.',
    tags = '피아노 연습 부모 역할, 아이 피아노 연습, 부모 역할, 연습 지도',
    meta_title = '피아노 연습 부모 역할과 연령별 도움법 | 이화 피아노 과외',
    meta_description = '피아노 연습 부모 역할은 감독보다 환경을 만드는 일입니다. 연령별로 도울 일, 피해야 할 말과 아이가 스스로 연습하도록 돕는 방법을 안내합니다.',
    body = '피아노 연습 부모 역할은 **감독이 아니라 환경 설계자**에 가깝습니다. 아이가 지시를 기다리게 하기보다 스스로 건반 앞에 앉고 연습을 마무리하는 구조를 만드는 것이 목표입니다.' || substr(body, length('피아노 연습에서 부모의 역할은 **감독이 아니라 환경 설계자**입니다. 아이가 스스로 치는 구조를 만드는 것이 목표입니다.') + 1),
    updated_at = datetime('now')
WHERE slug = 'practice-parent-role'
  AND title = '피아노 연습, 부모는 어디까지 도와야 할까'
  AND excerpt = '피아노 연습에서 부모의 역할은 감독이 아니라 환경 설계입니다. 연령별로 도울 일과 피해야 할 말을 실제 상황에 맞춰 정리했습니다.'
  AND tags = '피아노 연습, 부모 역할, 피아노 교육, 연습 지도'
  AND meta_title = ''
  AND meta_description = '피아노 연습에서 부모의 역할은 감독이 아니라 환경 설계입니다. 연령별로 도울 일, 피해야 할 말과 아이가 스스로 연습하도록 돕는 방법을 안내합니다.'
  AND status = 'published'
  AND substr(body, 1, length('피아노 연습에서 부모의 역할은 **감독이 아니라 환경 설계자**입니다. 아이가 스스로 치는 구조를 만드는 것이 목표입니다.')) = '피아노 연습에서 부모의 역할은 **감독이 아니라 환경 설계자**입니다. 아이가 스스로 치는 구조를 만드는 것이 목표입니다.';

-- 피아노 독학 키워드는 신청 페이지가 아닌 실전 정보 글로 담당한다.
INSERT INTO posts (
  slug,
  title,
  excerpt,
  body,
  category_id,
  tags,
  cover_image,
  meta_title,
  meta_description,
  status,
  reading_minutes,
  published_at,
  keyword_role,
  search_intent,
  keyword_cluster
)
SELECT
  'piano-self-study',
  '피아노 독학, 처음 8주를 위한 현실적인 연습 순서',
  '피아노 독학을 시작할 때 악보 읽기, 손 모양, 리듬과 곡 연습을 어떤 순서로 진행할지 8주 점검 루틴으로 정리했습니다.',
  '피아노 독학은 자유롭게 배울 수 있지만, 연습 순서와 자가 피드백 기준이 없으면 같은 구간을 반복하기 쉽습니다. 이 가이드의 목표는 8주 안에 특정 곡을 완성한다고 약속하는 것이 아니라, **혼자서도 계속 점검할 수 있는 연습 구조**를 만드는 데 있습니다.

## 시작 전에 준비할 것

악기는 음정이 안정적이고 건반이 불편하지 않으면 됩니다. 디지털 피아노라면 소리를 지나치게 키우지 않고, 의자 높이를 조절해 팔꿈치와 건반이 무리 없이 연결되게 합니다. 악보를 놓을 곳, 연필, 메트로놈과 연습 기록장도 한 자리에 두세요. 시작 전에 준비물을 찾는 시간을 줄이면 짧은 연습을 이어가기 쉬워집니다.

첫 곡은 좋아하는 곡 중에서 리듬이 단순하고, 양손의 음이 한꺼번에 많이 바뀌지 않는 편곡을 고릅니다. 너무 어려운 곡 하나만 붙들면 악보 읽기와 손 모양을 동시에 점검하기 어렵습니다.

## 1주차와 2주차: 건반 위치와 리듬을 분리하기

처음에는 도 위치, 손가락 번호, 기본 음표의 길이를 따로 익힙니다. 악보를 보면서 바로 양손을 치려고 하지 말고, 리듬은 박수로 먼저 읽어 봅니다. 그 다음 한 손으로 매우 느리게 음을 확인합니다.

연습 중에 손목이 굳거나 어깨가 올라가면 속도를 더 낮춥니다. 잘못된 음을 빠르게 반복하는 것보다 맞은 음과 편한 자세를 느리게 재현하는 편이 다음 연습을 위해 낫습니다.

## 3주차와 4주차: 양손을 붙이기 전에 구간을 나누기

곡을 한 번에 처음부터 끝까지 치지 말고, 한 번에 확인할 수 있는 짧은 마디로 나눕니다. 오른손과 왼손을 각각 안정적으로 친 뒤, 양손으로 합칠 때는 원래 속도보다 훨씬 느리게 시작합니다. 틀리면 곡의 처음으로 돌아가지 말고, 틀린 음 바로 앞의 짧은 구간만 다시 확인합니다.

연습 기록에는 참은 시간보다 막힌 위치와 원인을 적습니다. 예를 들어 왼손 도약이 늦음, 점음에서 손목이 올라감, 셀 수 없는 리듬처럼 기록하면 다음 날의 첫 과제가 명확해집니다.

## 5주차와 6주차: 속도보다 일정한 흐름 만들기

메트로놈은 시작부터 오랜 시간 틀어 두는 기계가 아니라, 현재 흐름을 점검하는 도구로 사용합니다. 먼저 혼자 셀 수 있는 속도로 친 뒤, 메트로놈을 켜고 박이 앞서거나 뒤처지는 구간을 찾습니다. 이후에는 다시 꺼고 표현과 소리를 듣습니다.

연속으로 속도를 올리기보다, 여러 번 편안하게 재현되는 속도를 기준으로 삼습니다. 실수가 늘거나 자세가 무너지면 속도를 낮추고 원인을 적습니다. 속도 숫자 자체가 성과는 아닙니다.

## 7주차와 8주차: 녹음으로 자가 피드백하기

연습 중에는 손을 움직이느라 소리의 흐름을 놓치기 쉽습니다. 짧은 구간을 휴대전화로 녹음하고, 악보를 보며 들어 봅니다. 음의 정확성, 리듬, 끊기는 위치, 소리의 균형 중 하나만 골라 다음 연습의 목표로 삼습니다. 한 번에 모든 문제를 고치려고 하면 연습 기준이 흐려집니다.

8주가 끝날 때는 완곡 여부보다 다음을 확인하세요.

- 악보에서 리듬을 먼저 분리해 읽을 수 있는가
- 어려운 구간을 짧게 나눌 수 있는가
- 틀린 원인을 기록하고 다음 연습에 반영하는가
- 녹음을 듣고 하나의 수정 목표를 정할 수 있는가

## 독학을 잠시 멈추고 피드백을 받아야 할 때

통증이 반복되거나, 같은 음과 리듬을 계속 틀리는데 원인을 찾지 못하거나, 손에 힘을 빼는 방법을 스스로 확인하기 어렵다면 외부 피드백이 필요할 수 있습니다. 통증은 참고 반복하지 말고 연습을 멈추세요. 필요할 때는 [1:1 피아노 개인 레슨](/lessons/private)에서 수업 방식을 확인할 수 있습니다.

## 독학 루틴을 유지하는 마지막 기준

피아노 독학은 많이 치는 것보다 내가 무엇을 확인하고 있는지 알면서 치는 것이 중요합니다. 매일의 목표를 한 문장으로 적고, 끝난 뒤에는 다음에 확인할 한 가지만 남기세요. 이 기록이 쌓이면 곡이 바뀌어도 사용할 수 있는 자신만의 연습 순서가 만들어집니다.',
  (SELECT id FROM categories WHERE slug = 'practice'),
  '피아노 독학, 피아노 독학 순서, 피아노 초보 연습, 피아노 연습 루틴',
  '',
  '피아노 독학 8주 연습 순서 | 이화 피아노 과외',
  '피아노 독학을 시작할 때 악보 읽기, 손 모양, 리듬과 곡 연습을 어떤 순서로 진행할지 8주 점검 루틴으로 안내합니다.',
  'published',
  9,
  '2026-07-23T00:00:00.000Z',
  'informational',
  'informational',
  'practice'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE slug = 'piano-self-study'
)
  AND EXISTS (
    SELECT 1 FROM categories WHERE slug = 'practice'
  );
