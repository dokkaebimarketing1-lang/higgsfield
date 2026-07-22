-- 각 글의 tags 첫 항목을 대표 목표 키워드로 사용합니다.
-- 기존 값과 일치할 때만 갱신해 배포 전 관리자 수정 내용을 덮어쓰지 않습니다.

UPDATE posts
SET excerpt = '성인 피아노 과외는 왕초보도 늦지 않습니다. 성인이 더 빠르게 이해할 수 있는 이유와 직장인이 현실적으로 수업과 연습을 이어가는 방법을 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'adult-piano-tutoring'
  AND excerpt = '성인이 피아노를 시작하기에 늦은 때는 없습니다. 어릴 때보다 오히려 빠르게 배우는 이유와, 직장인이 현실적으로 계속하는 방법을 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 초보 추천곡을 첫 3개월 로드맵으로 정리했습니다. 악보 읽기와 손 모양을 해치지 않으면서 월별로 도전하기 좋은 곡과 교재를 안내합니다.',
    meta_description = '피아노 초보 추천곡을 첫 3개월 로드맵으로 정리했습니다. 악보 읽기와 손 모양을 해치지 않으면서 월별로 도전하기 좋은 곡과 교재, 난이도 선택 기준을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'beginner-pieces'
  AND excerpt = '피아노를 시작한 첫 3개월에는 읽기와 손 모양을 해치지 않는 곡이 중요합니다. 월별로 치기 좋은 곡과 교재를 순서대로 정리했습니다.'
  AND meta_description = '피아노를 시작한 첫 3개월에는 읽기와 손 모양을 해치지 않는 곡이 중요합니다. 월별로 치기 좋은 곡과 교재를 순서대로 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 구입 전 디지털과 어쿠스틱의 차이를 비교해 보세요. 예산, 공간, 소음과 건반 감촉을 기준으로 첫 악기를 고르는 방법을 정리했습니다.',
    meta_description = '피아노 구입 전 디지털과 어쿠스틱의 차이를 비교해 보세요. 예산·공간·소음·건반 감촉을 기준으로 첫 악기를 고르는 방법과 구매 전 확인할 사항을 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'buying-first-piano'
  AND excerpt = '첫 피아노는 예산과 공간에 따라 디지털이 현실적인 선택인 경우가 많습니다. 디지털과 어쿠스틱의 차이와, 구입 전 확인할 것을 정리했습니다.'
  AND meta_description = '첫 피아노는 예산과 공간에 따라 디지털이 현실적인 선택인 경우가 많습니다. 디지털과 어쿠스틱의 차이와, 구입 전 확인할 것을 정리했습니다.';

UPDATE posts
SET title = '“피아노 연습 싫어해요” 아이의 원인별 부모 대응법',
    excerpt = '“피아노 연습 싫어해요”라고 말하는 아이에게는 의지보다 구조를 먼저 살펴야 합니다. 원인별 대응법과 부모가 피해야 할 행동을 정리했습니다.',
    meta_description = '“피아노 연습 싫어해요”라고 말하는 아이에게는 의지보다 구조를 먼저 살펴야 합니다. 흥미·난이도·환경별 대응법과 부모가 피해야 할 행동을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'child-hates-practice'
  AND title = '피아노 연습 싫어하는 아이, 부모 대응법'
  AND excerpt = '아이가 피아노 연습을 싫어하는 이유는 대부분 재미가 아니라 구조의 문제입니다. 원인별 대응법과 절대 하지 말아야 할 것을 정리했습니다.'
  AND meta_description = '아이가 피아노 연습을 싫어하는 이유는 대부분 재미가 아니라 구조의 문제입니다. 원인별 대응법과 절대 하지 말아야 할 것을 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 콩쿠르 첫 도전은 수상보다 무대 경험을 목표로 삼는 편이 좋습니다. 대회 선택, 준비 일정과 당일 관리 기준을 정리했습니다.',
    meta_description = '피아노 콩쿠르 첫 도전을 준비한다면 대회 선택부터 일정과 당일 관리까지 확인하세요. 수상보다 무대 경험을 쌓는 현실적인 준비 기준을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'competition-prep'
  AND excerpt = '첫 콩쿠르는 수상이 아니라 무대 경험이 목표입니다. 콩쿠르 고르는 법, 준비 타임라인, 당일 관리까지 첫 도전자를 위한 안내를 정리했습니다.'
  AND meta_description = '첫 콩쿠르는 수상이 아니라 무대 경험이 목표입니다. 콩쿠르 고르는 법, 준비 타임라인, 당일 관리까지 첫 도전자를 위한 안내를 정리했습니다.';

UPDATE posts
SET excerpt = '초등 피아노 과외는 손 습관과 연습 루틴을 함께 잡는 수업입니다. 시작 전에 알아둘 커리큘럼, 연습 시간과 부모의 역할을 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'elementary-piano-tutoring'
  AND excerpt = '초등학생의 피아노 과외는 손 습관과 연습 루틴이 전부입니다. 시작 전에 알아두면 좋을 커리큘럼, 연습 시간, 부모의 역할을 정리했습니다.';

UPDATE posts
SET title = '이대 피아노 레슨, 이화여대 재학생 과외의 장점',
    excerpt = '이대 피아노 레슨을 찾을 때 이화여대 재학생 과외가 가진 장점을 정리했습니다. 최근 입시 경험, 정확한 기초와 편한 소통을 확인해 보세요.',
    meta_description = '이대 피아노 레슨을 찾는다면 이화여대 피아노과 재학생의 1:1 과외를 확인해 보세요. 최근 입시 경험, 정확한 기초, 편한 소통과 첫 상담 방법을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'ewha-area-lesson'
  AND title = '이대 앞 피아노 레슨, 재학생 과외의 장점'
  AND excerpt = '이대 앞에서 피아노 레슨을 찾을 때 재학생 과외가 가진 실제 장점을 정리했습니다. 최신 입시 경험부터 합리적인 비용, 또래 같은 소통까지.'
  AND meta_description = '이대 앞 피아노 레슨, 이화여대 피아노과 재학생 과외가 좋은 이유 세 가지를 자세히 알려드립니다. 가장 최근의 입시 경험, 전공 커리큘럼 그대로의 정확한 기초, 또래에 가까운 편한 소통. 합리적인 비용의 1:1 맞춤 레슨을 신촌·이대 일대에서 직접 만나보세요. 첫 상담은 무료입니다.';

UPDATE posts
SET excerpt = '방문 피아노 과외는 아이가 익숙한 집에서 배울 수 있다는 장점이 있습니다. 첫 수업 전 악기, 공간과 보호자가 준비할 사항을 정리했습니다.',
    meta_description = '방문 피아노 과외를 시작하기 전 악기 상태, 수업 공간, 보호자 역할을 확인하세요. 아이가 익숙한 집에서 집중할 수 있도록 준비할 사항을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'home-lesson-prep'
  AND excerpt = '방문 레슨은 아이가 익숙한 환경에서 배울 수 있다는 장점이 있습니다. 첫 방문 레슨 전에 준비하면 좋을 것들을 정리했습니다.'
  AND meta_description = '방문 레슨은 아이가 익숙한 환경에서 배울 수 있다는 장점이 있습니다. 첫 방문 레슨 전에 준비하면 좋을 것들을 정리했습니다.';

UPDATE posts
SET title = '체르니 30 이후, 다음에 칠 중급 피아노 곡',
    excerpt = '체르니 30 이후에는 소나티나와 소품으로 테크닉과 음악성을 함께 넓힐 수 있습니다. 다음 단계에 맞는 중급 피아노 곡을 정리했습니다.',
    meta_description = '체르니 30 이후 어떤 곡을 칠지 고민된다면 소나티나와 소품을 함께 살펴보세요. 테크닉과 음악성을 키우는 중급 피아노 곡과 선택 기준을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'intermediate-pieces'
  AND title = '체르니 30 졸업 후, 다음에 칠 곡들'
  AND excerpt = '체르니 30을 마치면 선택지가 갑자기 넓어집니다. 테크닉과 음악성을 함께 키워주는 다음 단계 곡들을 소나티나부터 소품까지 정리했습니다.'
  AND meta_description = '체르니 30을 마치면 선택지가 갑자기 넓어집니다. 테크닉과 음악성을 함께 키워주는 다음 단계 곡들을 소나티나부터 소품까지 정리했습니다.';

UPDATE posts
SET excerpt = '마포구 피아노 과외를 찾는 직장인과 학부모를 위한 안내입니다. 성인 저녁 수업부터 아이 방문 레슨까지 가능한 방식을 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'mapo-piano'
  AND excerpt = '마포구에서 피아노 과외를 찾는 직장인과 학부모를 위한 안내입니다. 성인 저녁 레슨부터 아이 방문 레슨까지, 지역별로 가능한 방식을 정리했습니다.';

UPDATE posts
SET excerpt = '음대 입시는 보통 고등학교 1학년 겨울부터 본격적으로 준비합니다. 시기별 피아노과 준비 로드맵과 실기·이론 비중을 정리했습니다.',
    meta_description = '음대 입시는 언제 시작해야 할까요? 피아노과 지원을 기준으로 고등학교 시기별 준비 로드맵, 실기·이론 비중과 자주 하는 실수를 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'music-college-entrance'
  AND excerpt = '음대 피아노과 입시는 보통 고등학교 1학년 겨울부터 본격 준비합니다. 시기별 준비 로드맵과 실기·이론 비중, 가장 많이 하는 실수를 정리했습니다.'
  AND meta_description = '음대 피아노과 입시는 보통 고등학교 1학년 겨울부터 본격 준비합니다. 시기별 준비 로드맵과 실기·이론 비중, 가장 많이 하는 실수를 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 연습 방법은 시간보다 구조가 중요합니다. 워밍업, 구간 나누기와 느린 연습을 묶은 30분 루틴을 실제 레슨 방식으로 소개합니다.',
    meta_description = '피아노 연습 방법은 시간보다 구조가 중요합니다. 워밍업, 구간 나누기, 느린 연습을 묶은 30분 루틴과 효율을 높이는 점검 기준을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'piano-practice-method'
  AND excerpt = '효율적인 피아노 연습은 시간이 아니라 구조입니다. 워밍업, 구간 나누기, 느린 연습의 30분 루틴을 레슨에서 실제 쓰는 방식으로 소개합니다.'
  AND meta_description = '효율적인 피아노 연습은 시간이 아니라 구조입니다. 워밍업, 구간 나누기, 느린 연습의 30분 루틴을 레슨에서 실제 쓰는 방식으로 소개합니다.';

UPDATE posts
SET excerpt = '아이 피아노 시작 나이는 보통 5~7세지만 나이보다 준비 신호가 더 중요합니다. 시작 전 확인할 세 가지 기준과 주의점을 정리했습니다.',
    meta_description = '아이 피아노 시작 나이는 보통 5~7세입니다. 나이보다 중요한 세 가지 준비 신호, 너무 일찍 시작했을 때의 주의점과 첫 수업 기준을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'piano-start-age'
  AND excerpt = '피아노 시작 적정 연령은 보통 5~7세입니다. 하지만 나이보다 중요한 세 가지 준비 신호와, 너무 일찍 시작했을 때의 주의점을 정리했습니다.'
  AND meta_description = '피아노 시작 적정 연령은 보통 5~7세입니다. 하지만 나이보다 중요한 세 가지 준비 신호와, 너무 일찍 시작했을 때의 주의점을 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 연습 습관은 의지보다 환경에서 만들어집니다. 아이가 매일 자연스럽게 건반 앞에 앉도록 돕는 네 가지 장치를 정리했습니다.',
    meta_description = '피아노 연습 습관은 의지보다 환경에서 만들어집니다. 아이가 매일 자연스럽게 건반 앞에 앉도록 돕는 시간·공간·과제·보상 설계를 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'practice-habit'
  AND excerpt = '매일 피아노를 치는 아이는 의지가 강한 것이 아니라 환경이 다릅니다. 연습이 습관이 되게 만드는 네 가지 장치를 레슨 경험에서 정리했습니다.'
  AND meta_description = '매일 피아노를 치는 아이는 의지가 강한 것이 아니라 환경이 다릅니다. 연습이 습관이 되게 만드는 네 가지 장치를 레슨 경험에서 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 연습에서 부모의 역할은 감독이 아니라 환경 설계입니다. 연령별로 도울 일과 피해야 할 말을 실제 상황에 맞춰 정리했습니다.',
    meta_description = '피아노 연습에서 부모의 역할은 감독이 아니라 환경 설계입니다. 연령별로 도울 일, 피해야 할 말과 아이가 스스로 연습하도록 돕는 방법을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'practice-parent-role'
  AND excerpt = '부모의 역할은 감독이 아니라 환경 설계자입니다. 연령별로 부모가 해야 할 일과 하지 말아야 할 일을 정리했습니다.'
  AND meta_description = '부모의 역할은 감독이 아니라 환경 설계자입니다. 연령별로 부모가 해야 할 일과 하지 말아야 할 일을 정리했습니다.';

UPDATE posts
SET excerpt = '서대문구 피아노 과외를 찾는다면 이대 인근 재학생의 방문 레슨을 확인해 보세요. 지역별 수업 방식과 신청 방법을 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'seodaemun-piano'
  AND excerpt = '서대문구에서 피아노 과외를 찾는다면 이대 앞 재학생의 방문 레슨이 있습니다. 지역별 안내와 레슨 방식, 신청 방법을 정리했습니다.';

UPDATE posts
SET excerpt = '서울 피아노 과외를 찾는다면 이화여대 피아노과 재학생의 1:1 레슨을 확인해 보세요. 서대문구·마포구 방문과 서울 전역 온라인 수업을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'seoul-piano-tutoring'
  AND excerpt = '서울에서 피아노 과외를 찾는다면, 이화여대 피아노과 재학생의 1:1 레슨이 있습니다. 서대문구·마포구 방문 레슨과 서울 전역 온라인 수업, 지역별 안내를 정리했습니다.';

UPDATE posts
SET excerpt = '악보 읽는 법은 음을 외우기보다 패턴을 읽는 훈련이 핵심입니다. 초시가 늘지 않는 원인과 바로 적용할 수 있는 연습법을 정리했습니다.',
    meta_description = '악보 읽는 법은 음을 하나씩 외우기보다 패턴으로 읽는 훈련이 핵심입니다. 초시가 늘지 않는 세 가지 원인과 단계별 연습법을 안내합니다.',
    updated_at = datetime('now')
WHERE slug = 'sight-reading'
  AND excerpt = '악보 초시는 음을 많이 아는 것보다 패턴으로 읽는 훈련이 핵심입니다. 초시가 늘지 않는 세 가지 원인과 바로 적용할 수 있는 연습법을 정리했습니다.'
  AND meta_description = '악보 초시는 음을 많이 아는 것보다 패턴으로 읽는 훈련이 핵심입니다. 초시가 늘지 않는 세 가지 원인과 바로 적용할 수 있는 연습법을 정리했습니다.';

UPDATE posts
SET excerpt = '피아노 과외 시간은 보통 주 1회 45분부터 시작합니다. 나이와 목표에 따라 45분·60분, 주 1회·2회 중 맞는 조합을 정리했습니다.',
    updated_at = datetime('now')
WHERE slug = 'tutoring-time-guide'
  AND excerpt = '피아노 과외는 보통 주 1회 45분이 기본입니다. 나이와 목표에 따라 45분과 60분, 주 1회와 주 2회 중 어떤 조합이 맞는지 기준을 정리했습니다.';

UPDATE posts
SET title = '무대 떨림, 실기 시험에서 실력 발휘하는 연습법',
    updated_at = datetime('now')
WHERE slug = 'stage-fright'
  AND title = '실기 시험 떨림, 무대에서 실력 발휘하는 연습법';

UPDATE posts
SET title = '콩쿠르 곡 선택, 좋아하는 곡보다 중요한 것',
    updated_at = datetime('now')
WHERE slug = 'competition-pieces'
  AND title = '콩쿠르에서 좋아하는 곡보다 중요한 것';
