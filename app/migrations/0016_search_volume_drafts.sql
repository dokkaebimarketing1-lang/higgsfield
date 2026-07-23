-- 최종 키워드 조사표의 검색량과 기존 페이지의 대표 키워드를 비교해
-- 6개 CMS 카테고리마다 겹치지 않는 다음 글 1편을 비공개 초안으로 준비한다.
-- 조사표: 피아노_키워드_최종완전판.xlsx / 전체 키워드 / 2026-07-23 확인

CREATE TABLE IF NOT EXISTS post_keyword_evidence (
  post_id INTEGER PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  source_file TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  source_row INTEGER NOT NULL CHECK (source_row >= 2),
  total_monthly_searches INTEGER NOT NULL CHECK (total_monthly_searches >= 0),
  naver_monthly_searches INTEGER NOT NULL CHECK (naver_monthly_searches >= 0),
  naver_mobile_searches INTEGER NOT NULL CHECK (naver_mobile_searches >= 0),
  naver_pc_searches INTEGER NOT NULL CHECK (naver_pc_searches >= 0),
  google_monthly_searches INTEGER NOT NULL CHECK (google_monthly_searches >= 0),
  naver_competition TEXT NOT NULL,
  google_competition TEXT NOT NULL,
  selection_note TEXT NOT NULL,
  researched_at TEXT NOT NULL
);

INSERT INTO posts (
  slug,
  title,
  excerpt,
  body,
  category_id,
  tags,
  cover_image,
  cover_alt,
  keyword_role,
  search_intent,
  keyword_cluster,
  meta_title,
  meta_description,
  status,
  reading_minutes,
  published_at
)
SELECT
  'adult-piano-academy-price',
  '성인 피아노 학원 가격, 등록 전 비교할 6가지',
  '성인 피아노 학원 가격을 월 수강료만으로 비교하면 실제 수업 가치를 놓치기 쉽습니다. 횟수, 시간, 수업 형태와 보강 규정까지 확인할 기준을 정리했습니다.',
  '성인 피아노 학원 가격을 알아볼 때 가장 먼저 보이는 숫자는 월 수강료입니다. 하지만 같은 금액도 한 달 수업 횟수, 회당 시간, 개인 또는 그룹 수업 여부와 연습 공간 제공에 따라 의미가 달라집니다. 등록 전에는 총액보다 **내 목표에 맞는 수업을 꾸준히 받을 수 있는지**를 먼저 확인하세요.

## 1. 월 수강료를 회당 수업으로 다시 보기

월 금액만 비교하지 말고 한 달 수업 횟수와 회당 시간을 함께 적어 보세요. 주 1회인지 주 2회인지, 45분인지 60분인지에 따라 실제 피드백 시간은 달라집니다. 등록비, 교재비, 연습실 사용료처럼 별도로 붙는 항목이 있는지도 확인해야 합니다.

비용표에 포함된 내용을 한 줄씩 확인하면 예상하지 못한 추가 지출을 줄일 수 있습니다. 이 사이트의 수업별 금액과 포함 항목은 [피아노 레슨비 안내](/pricing)에서 최신 내용을 확인할 수 있습니다.

## 2. 개인 수업과 그룹 수업의 차이 확인하기

개인 수업은 현재 연주를 듣고 손 모양, 리듬과 악보 읽기 중 필요한 부분을 바로 조정하기 좋습니다. 그룹 수업은 함께 배우는 분위기와 정해진 진도를 선호하는 분에게 맞을 수 있습니다. 어느 쪽이 무조건 낫다기보다 원하는 피드백 방식과 예산을 함께 비교해야 합니다.

상담할 때는 한 반의 인원, 실제 개인 피드백 시간, 결석 시 보강 방식과 담당 선생님이 바뀌는 조건을 물어보세요. 광고에 적힌 수업 시간과 내가 직접 지도받는 시간이 같은지도 확인하는 편이 좋습니다.

## 3. 목표에 맞는 커리큘럼인지 살펴보기

왕초보, 다시 시작하는 취미, 원하는 한 곡 완성과 입시 준비는 수업의 우선순위가 다릅니다. 교재 진도만 설명하는 곳보다 첫 상담에서 현재 수준, 연습 가능한 시간과 연주하고 싶은 곡을 묻는 곳이 계획을 세우기 쉽습니다.

성인 취미라면 퇴근 후 실제로 확보할 수 있는 연습 시간을 기준으로 과제량을 조정할 수 있는지 확인하세요. [성인 피아노 레슨 방식](/lessons/adult)을 보면 1:1 수업에서 시작점을 정하는 기준을 미리 살펴볼 수 있습니다.

## 4. 연습 환경과 이동 시간을 비용에 포함하기

수업료가 낮아도 이동 시간이 길거나 집에서 연습할 악기가 없으면 지속하기 어렵습니다. 반대로 가까운 연습 공간을 자유롭게 쓸 수 있다면 별도의 연습실 비용을 줄일 수도 있습니다. 학원 방문, 선생님 방문과 온라인 수업을 실제 주간 일정에 넣어 비교하세요.

## 5. 보강과 중도 변경 규정을 먼저 묻기

직장인은 야근과 출장으로 일정이 바뀔 수 있습니다. 수업 전 몇 시간까지 변경할 수 있는지, 월을 넘겨 보강할 수 있는지, 선생님 사정으로 취소될 때 어떻게 처리하는지 확인하세요. 규정이 글로 안내되는 곳은 나중에 서로 다르게 이해할 가능성이 줄어듭니다.

## 6. 체험 뒤에는 설명 방식으로 결정하기

짧은 상담이나 첫 수업에서 선생님이 어려운 내용을 이해할 수 있는 말로 설명하는지, 틀린 이유와 다음 연습 방법을 구체적으로 알려 주는지 살펴보세요. 단기간 완곡이나 실력 향상을 단정하는 말보다 현재 상태와 필요한 시간을 솔직하게 설명하는 편이 안전합니다.

성인 피아노 학원 가격의 최종 비교표에는 월 금액, 회당 시간, 수업 횟수, 개인 피드백, 연습 공간, 보강 규정과 이동 시간을 함께 적으세요. 같은 조건으로 맞춰 본 뒤 나에게 중요한 두 가지를 우선하면 가격만 보고 결정했을 때보다 오래 이어가기 쉽습니다. 1:1 수업과 학원을 더 자세히 비교하려면 [성인 피아노 학원과 개인 레슨 차이](/blog/lesson-guide/adult-piano-tutoring)을 함께 확인하세요.',
  (SELECT id FROM categories WHERE slug = 'lesson-guide'),
  '성인 피아노 학원 가격, 성인 피아노 비용, 피아노 학원 비교, 성인 피아노 레슨',
  '/assets/cat-lesson-guide.jpg',
  '성인 피아노 학원 가격을 비교하는 상담 자료와 피아노 건반',
  'informational',
  'comparison',
  'pricing',
  '성인 피아노 학원 가격 비교 기준 6가지 | 이화 피아노 과외',
  '성인 피아노 학원 가격을 수업 횟수, 회당 시간, 개인 피드백, 연습 공간과 보강 규정까지 같은 조건으로 비교하는 방법을 안내합니다.',
  'draft',
  6,
  NULL
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'lesson-guide')
  AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'adult-piano-academy-price');

INSERT INTO posts (
  slug, title, excerpt, body, category_id, tags, cover_image, cover_alt,
  keyword_role, search_intent, keyword_cluster, meta_title, meta_description,
  status, reading_minutes, published_at
)
SELECT
  'piano-chords-basics',
  '피아노 코드, 초보가 먼저 익힐 7개와 연습 순서',
  '피아노 코드를 처음 익히는 초보자를 위해 C장조에서 자주 만나는 7개 기본 코드, 자리바꿈과 양손 반주로 이어지는 연습 순서를 정리했습니다.',
  '피아노 코드는 여러 음을 동시에 누르는 모양을 외우는 데서 끝나지 않습니다. 코드의 구성음을 알고 가까운 자리로 연결해야 반주 중에 손이 덜 흔들립니다. 처음에는 모든 조를 한꺼번에 외우기보다 **C장조의 일곱 기본 코드**를 소리와 손 모양으로 익혀 보세요.

## 피아노 코드의 가장 작은 단위 이해하기

기본 3화음은 세 음을 3도 간격으로 쌓아 만듭니다. C코드는 도·미·솔, F코드는 파·라·도, G코드는 솔·시·레입니다. 장3화음은 밝게, 단3화음은 상대적으로 어둡게 들릴 수 있지만 느낌만 외우지 말고 실제 구성음을 말하면서 누르는 편이 오래 기억됩니다.

코드 기호의 알파벳은 밑음의 이름입니다. 뒤에 m이 붙으면 단3화음, dim이 붙으면 감3화음을 뜻합니다. 처음부터 복잡한 확장 코드를 외우기보다 기본 3화음의 소리를 구분하는 데 집중하세요.

## C장조에서 먼저 익힐 7개 코드

- C: 도·미·솔
- Dm: 레·파·라
- Em: 미·솔·시
- F: 파·라·도
- G: 솔·시·레
- Am: 라·도·미
- Bdim: 시·레·파

한 번에 일곱 개를 모두 연주하지 말고 C, F, G, Am 네 개부터 시작합니다. 각 코드를 누른 뒤 음 이름을 말하고, 소리가 고르게 나는지 듣습니다. 손목이 굳거나 손가락 끝이 무너지면 속도를 올리지 말고 손을 편하게 다시 놓으세요.

## 코드 이동은 공통음을 남겨 연습하기

C에서 Am으로 갈 때 도와 미는 그대로 두고 솔만 라로 옮길 수 있습니다. C에서 F로 갈 때도 가까운 자리바꿈을 사용하면 손 전체를 크게 뛰지 않아도 됩니다. 이런 방식으로 공통음을 찾으면 반주가 부드러워지고 다음 코드를 볼 여유가 생깁니다.

먼저 C-Am-F-G 순서를 네 박씩 누르고, 익숙해지면 두 박씩 바꿉니다. 메트로놈은 아주 느린 속도로 시작하고 코드가 바뀌는 순간에 박이 밀리지 않는지 확인하세요. 속도보다 끊기지 않는 연결이 우선입니다.

## 왼손과 오른손의 역할 나누기

초보 반주에서는 왼손이 코드의 밑음을 한 음 또는 옥타브로 연주하고, 오른손이 3화음을 맡는 방식이 단순합니다. 처음에는 양손을 동시에 누른 뒤 충분히 소리를 듣습니다. 그 다음 왼손 한 번, 오른손 세 번처럼 일정한 패턴을 만들어 보세요.

리듬이 흔들리면 음을 줄입니다. 왼손 밑음과 오른손 코드만 정확히 맞춘 뒤, 분산화음이나 꾸밈음을 추가하는 편이 좋습니다. 코드와 리듬을 동시에 어렵게 만들면 무엇 때문에 멈췄는지 알기 어렵습니다.

## 악보와 코드 기호를 함께 읽는 방법

코드 기호만 보고 치는 연습과 오선 악보를 읽는 연습은 서로 보완합니다. 코드가 바뀌는 마디에 표시를 하고, 구성음을 악보에서 찾아보세요. 음을 하나씩 읽는 단계가 어렵다면 [피아노 악보 읽는 법](/blog/practice/sight-reading)으로 기본 패턴부터 점검할 수 있습니다.

## 하루 15분 피아노 코드 루틴

3분은 C, F, G, Am의 구성음을 말하며 누르고, 4분은 가까운 자리바꿈으로 연결합니다. 다음 4분은 왼손 밑음과 오른손 코드를 붙이고, 마지막 4분은 좋아하는 쉬운 곡의 네 마디에 적용합니다. 연습 뒤에는 가장 늦게 바뀐 코드 하나만 기록하세요.

피아노 코드를 외웠는데도 반주가 끊긴다면 코드 수를 늘리기 전에 연결과 리듬을 다시 살펴야 합니다. 손 모양과 진행을 직접 점검받고 싶다면 [1:1 피아노 개인 레슨](/lessons/private)의 수업 방식을 확인하세요.',
  (SELECT id FROM categories WHERE slug = 'practice'),
  '피아노 코드, 피아노 코드 연습, 피아노 반주법, 초보 피아노',
  '/assets/cat-practice.jpg',
  '피아노 건반에서 기본 코드를 연습하는 두 손',
  'informational',
  'informational',
  'practice',
  '피아노 코드 7개와 초보 연습 순서 | 이화 피아노 과외',
  '피아노 코드를 처음 배우는 초보자를 위해 C장조 7개 기본 코드의 구성음, 자리바꿈, 양손 반주와 하루 15분 연습 순서를 안내합니다.',
  'draft',
  7,
  NULL
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'practice')
  AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'piano-chords-basics');

INSERT INTO posts (
  slug, title, excerpt, body, category_id, tags, cover_image, cover_alt,
  keyword_role, search_intent, keyword_cluster, meta_title, meta_description,
  status, reading_minutes, published_at
)
SELECT
  'arts-high-school-admission',
  '예고 입시, 피아노 전공 준비 순서와 점검표',
  '예고 입시 피아노 전공을 준비할 때 모집요강 확인부터 현재 실력 진단, 실기곡 계획, 모의 연주와 학교생활 관리까지 필요한 순서를 정리했습니다.',
  '예고 입시는 연주곡만 오래 붙드는 준비가 아닙니다. 지원 학교와 학년별 모집요강을 확인하고, 현재 연주의 강점과 약점을 진단한 뒤, 실기 완성도와 학교생활을 함께 관리해야 합니다. 학교마다 전형 요소와 지정곡이 달라질 수 있으므로 **지원 연도의 공식 모집요강**을 가장 먼저 확인하세요.

## 지원 학교의 공식 모집요강부터 표로 만들기

학교명, 전형 일정, 지원 자격, 실기 과목, 지정곡, 제출 서류와 반영 항목을 한 표에 적습니다. 전년도 자료는 준비 방향을 가늠하는 참고 자료일 뿐이며, 실제 지원에는 해당 연도 학교 공식 홈페이지의 공고를 사용해야 합니다. 학원이나 커뮤니티 요약만 보고 곡을 정하지 마세요.

여러 학교를 함께 고려한다면 공통으로 준비할 수 있는 영역과 학교별로 다른 영역을 나눕니다. 일정이 겹치거나 곡 조건이 다를 수 있으므로 원서 접수 직전에 확인하기보다 공고가 나올 때마다 표를 갱신하는 편이 안전합니다.

## 현재 실력을 녹음으로 진단하기

처음에는 완벽한 연주보다 현재 상태를 객관적으로 남기는 것이 중요합니다. 곡 전체를 한 번 녹음하고 음정, 리듬, 템포 유지, 페달, 프레이즈와 암보 안정성을 따로 점검합니다. 모든 문제를 동시에 고치지 말고 시험 결과에 영향을 크게 줄 수 있는 항목부터 순서를 정하세요.

진단할 때는 잘 되는 부분도 기록합니다. 강점이 분명해야 곡의 해석과 무대 표현을 발전시킬 방향을 잡을 수 있습니다. 손이나 팔에 통증이 있다면 반복을 멈추고 자세와 연습량을 먼저 점검해야 합니다.

## 실기곡을 세 단계로 나눠 완성하기

첫 단계에서는 운지, 음정과 리듬을 정확히 읽고 어려운 구간을 표시합니다. 두 번째 단계에서는 목표 템포, 소리의 균형과 프레이즈를 다듬습니다. 마지막 단계에서는 처음부터 끝까지 끊지 않는 연주, 암보 확인과 돌발 상황 대응을 연습합니다.

곡 전체만 반복하면 실수가 굳어질 수 있습니다. 매주 한두 개의 핵심 구간을 정하고, 느린 연습과 리듬 변형, 손 분리, 녹음을 목적에 맞게 사용하세요. 입시곡을 고르는 기본 기준은 [피아노 입시곡 선택 가이드](/blog/exam/entrance-repertoire)에서 이어서 확인할 수 있습니다.

## 주간 계획은 결과가 아니라 행동으로 적기

이번 주에 잘 치기 같은 목표보다 첫 페이지 왼손 운지 확정, 전개부를 느린 속도로 세 번 연속 재현, 일요일 전체 녹음처럼 확인 가능한 행동으로 적습니다. 레슨 과제, 개인 연습, 이론 학습과 휴식 시간을 한 주 달력에 함께 넣으세요.

연습 시간이 부족한 날에는 곡 전체를 억지로 반복하지 말고 악보 분석, 손가락 번호 확인이나 짧은 구간 점검으로 전환할 수 있습니다. 누적된 피로는 정확성과 집중력을 떨어뜨릴 수 있으므로 휴식도 계획의 일부로 봅니다.

## 모의 실기로 무대 변수를 줄이기

시험이 가까워지면 낯선 사람 앞에서 입장, 인사, 연주, 퇴장까지 한 번에 연습합니다. 한 번의 실수 뒤 다시 흐름을 찾는 연습도 필요합니다. 촬영한 영상을 보며 자세, 시작 전 호흡과 곡 사이의 간격을 확인하세요.

실전 연습은 자주 하는 것보다 피드백을 남기는 것이 중요합니다. 매회 가장 먼저 고칠 항목 하나와 유지할 강점 하나를 기록하면 다음 모의 연주의 목적이 분명해집니다.

## 보호자와 학생이 함께 확인할 점

보호자는 연습 시간을 감시하기보다 일정, 이동, 건강과 필요한 자료를 정리하는 역할을 맡는 편이 좋습니다. 학생은 매주 막힌 구간과 질문을 기록하고 레슨에서 해결해야 합니다. 진학 결과를 단정하는 말보다 현재 수준, 남은 기간과 보완 과제를 구체적으로 설명하는 지도를 선택하세요.

예고 입시 준비는 학교별 최신 요강 확인, 현재 실력 진단, 단계별 실기곡 완성, 모의 연주와 생활 관리가 연결될 때 안정적입니다. 개인별 일정과 곡 계획이 필요하다면 [피아노 입시 레슨](/lessons/admission)의 진행 방식을 확인하세요.',
  (SELECT id FROM categories WHERE slug = 'exam'),
  '예고 입시, 피아노 예고 입시, 예고 실기 준비, 피아노 입시',
  '/assets/cat-exam.jpg',
  '예고 입시 피아노 실기를 준비하는 악보와 건반',
  'informational',
  'informational',
  'admission',
  '예고 입시 피아노 전공 준비 순서 | 이화 피아노 과외',
  '예고 입시 피아노 전공 준비를 위해 공식 모집요강 확인, 실력 진단, 실기곡 계획, 주간 연습과 모의 실기 점검표를 안내합니다.',
  'draft',
  7,
  NULL
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'exam')
  AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'arts-high-school-admission');

INSERT INTO posts (
  slug, title, excerpt, body, category_id, tags, cover_image, cover_alt,
  keyword_role, search_intent, keyword_cluster, meta_title, meta_description,
  status, reading_minutes, published_at
)
SELECT
  'classical-piano-guide',
  '클래식 피아노, 초보·중급이 곡을 고르는 기준',
  '클래식 피아노 곡을 초보와 중급 수준에서 고를 때 악보 읽기, 손의 이동, 리듬, 길이와 음악적 목표를 비교하는 방법을 정리했습니다.',
  '클래식 피아노 곡을 고를 때 유명한 곡부터 찾으면 현재 수준보다 어려운 편곡을 만나기 쉽습니다. 같은 제목도 판본과 편곡에 따라 난이도가 달라지므로, 곡의 이름보다 **악보를 읽는 부담과 완성까지 필요한 기술**을 먼저 살펴보세요.

## 첫 곡은 손에 맞는 길이와 패턴으로 고르기

초보자는 음역이 넓지 않고, 양손이 동시에 복잡하게 움직이지 않으며, 반복되는 리듬이 있는 곡이 좋습니다. 첫 페이지를 천천히 읽었을 때 손이 자주 멈추는지, 임시표와 화음이 한꺼번에 많이 나오는지 확인하세요. 한 번의 연습에서 짧은 구간을 완성할 수 있어야 다음 날 다시 시작하기 쉽습니다.

곡이 짧다고 항상 쉬운 것은 아닙니다. 빠른 장식음, 넓은 도약이나 섬세한 페달이 핵심이면 짧아도 많은 시간이 필요할 수 있습니다. 악보의 페이지 수와 함께 가장 어려운 두 마디를 먼저 시험해 보세요.

## 초보 단계에서 살펴볼 클래식 피아노 곡

페촐트의 미뉴에트 사장조, 슈만의 어린이를 위한 앨범 중 일부와 부르크뮐러 25개의 쉬운 연습곡 중 현재 수준에 맞는 곡은 리듬과 프레이즈를 익히는 출발점이 될 수 있습니다. 다만 판본과 템포, 학생의 악보 읽기 경험에 따라 체감 난이도는 달라집니다.

곡을 고를 때는 한 곡에서 배울 목표를 하나 정하세요. 레가토 연결, 왼손 반주, 셈여림이나 일정한 박처럼 목표가 분명하면 단순히 끝까지 치는 것보다 성장 지점을 확인하기 쉽습니다.

## 중급 단계에서는 음악 시대와 기술을 넓히기

중급자는 바흐 인벤션, 고전 소나티나와 소나타의 일부 악장, 낭만 소품처럼 서로 다른 양식으로 범위를 넓힐 수 있습니다. 대위적인 성부 듣기, 고전적인 아티큘레이션, 낭만적인 페달과 긴 호흡은 필요한 연습 방법이 서로 다릅니다.

익숙한 작곡가만 반복하기보다 현재 부족한 기술과 연결되는 곡을 한 곡씩 넣어 보세요. 체르니 진도만으로 다음 곡을 결정하지 말고 악보 읽기 속도, 손의 크기, 옥타브와 화음 경험도 함께 봅니다. 중급 전환기의 곡은 [체르니 30 이후 중급 피아노 곡](/blog/repertoire/intermediate-pieces)에서도 비교할 수 있습니다.

## 듣기 좋은 곡과 연습하기 좋은 곡 나누기

좋아하는 곡은 동기를 높이지만 한 곡에 필요한 기술이 너무 많으면 완성 과정이 길어집니다. 원하는 곡 하나와 현재 기술을 정리할 학습곡 하나를 병행하면 흥미와 기초를 함께 가져갈 수 있습니다. 두 곡 모두 어렵게 잡지 않는 것이 중요합니다.

영상의 빠른 연주를 목표 속도로 삼지 마세요. 처음에는 프레이즈와 리듬이 무너지지 않는 속도로 연주하고, 여러 번 편안하게 재현된 뒤 조금씩 올립니다. 녹음을 들으며 음의 정확성보다 흐름과 소리의 균형을 따로 확인해 보세요.

## 악보를 구할 때 확인할 사항

같은 작품도 원전판, 교육용 판본과 쉬운 편곡이 다릅니다. 작곡가, 작품 번호, 악장과 편곡 여부를 확인해야 원하는 곡과 같은 악보인지 알 수 있습니다. 악보는 권리와 배포 조건이 명확한 공식 판매처나 합법적인 공개 자료를 이용하세요.

## 나에게 맞는 곡인지 확인하는 5분 테스트

첫 여덟 마디를 보고 조표와 리듬을 설명할 수 있는지, 한 손씩 느리게 읽을 수 있는지, 가장 넓은 화음이 손에 무리 없는지 확인합니다. 어려운 요소가 한두 개라면 배울 곡이 될 수 있지만 여러 요소가 동시에 막히면 더 쉬운 곡으로 단계를 나누는 편이 좋습니다.

클래식 피아노 레퍼토리는 유명도보다 현재 수준, 배우고 싶은 기술과 끝까지 이어 갈 수 있는 길이로 선택해야 합니다. 첫 3개월의 입문곡이 필요하면 [피아노 초보 추천곡 로드맵](/blog/repertoire/beginner-pieces)을 함께 살펴보세요.',
  (SELECT id FROM categories WHERE slug = 'repertoire'),
  '클래식 피아노, 클래식 피아노 곡, 피아노 곡 추천, 피아노 레퍼토리',
  '/assets/cat-repertoire.jpg',
  '클래식 피아노 연주곡 악보와 피아노 건반',
  'informational',
  'informational',
  'repertoire',
  '클래식 피아노 곡 고르는 기준 | 이화 피아노 과외',
  '클래식 피아노 곡을 초보와 중급 수준에서 고를 때 악보 읽기, 손의 이동, 기술 목표, 판본과 완성 기간을 비교하는 방법을 안내합니다.',
  'draft',
  7,
  NULL
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'repertoire')
  AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'classical-piano-guide');

INSERT INTO posts (
  slug, title, excerpt, body, category_id, tags, cover_image, cover_alt,
  keyword_role, search_intent, keyword_cluster, meta_title, meta_description,
  status, reading_minutes, published_at
)
SELECT
  'preschool-piano-book',
  '유아 피아노 교재, 첫 책을 고르는 7가지 기준',
  '유아 피아노 교재를 고를 때 글자와 악보 크기, 한 단원의 길이, 리듬 활동, 건반 탐색과 보호자 안내까지 확인할 기준을 정리했습니다.',
  '유아 피아노 교재는 유명한 책보다 아이가 한 번의 수업과 짧은 가정 연습에서 이해할 수 있는 구조인지가 중요합니다. 같은 나이라도 손의 크기, 숫자와 방향 개념, 집중 시간과 노래 경험이 다르므로 **아이의 준비 상태**를 먼저 보고 선택하세요.

## 1. 악보와 글자가 한눈에 보이는지

첫 교재는 음표와 손가락 번호가 너무 작거나 한 페이지에 정보가 많지 않은 편이 좋습니다. 아이가 그림, 건반 위치와 악보 사이에서 무엇을 봐야 할지 찾을 수 있는지 확인하세요. 화려한 그림이 많더라도 학습할 기호와 구분되지 않으면 집중이 흐려질 수 있습니다.

책을 펼쳤을 때 페이지가 잘 고정되는지도 중요합니다. 악보가 계속 덮이면 손을 건반에 놓은 채 시선을 유지하기 어렵습니다. 집의 악보대 크기와 조명도 함께 살펴보세요.

## 2. 한 단원의 목표가 하나인지

한 페이지에서 음 이름, 손가락, 리듬과 양손 연주를 모두 새로 배우게 하면 무엇이 어려운지 찾기 어렵습니다. 건반의 높고 낮음, 두세 손가락 사용, 짧은 리듬처럼 한 번에 하나의 개념을 소개하고 반복하는 구성이 좋습니다.

아이가 페이지를 빨리 넘기는 것보다 배운 개념을 다른 곡에서도 알아보는지가 더 중요합니다. 진도표보다 지난 단원의 내용을 말이나 놀이로 다시 표현할 수 있는지 확인하세요.

## 3. 건반 탐색과 리듬 활동이 함께 있는지

유아는 오선 악보만 오래 보는 것보다 건반에서 검은건반 두 개와 세 개 묶음을 찾고, 높고 낮은 소리를 듣고, 박수를 치는 활동을 함께 할 때 개념을 연결하기 쉽습니다. 교재에 노래, 걷기, 손뼉치기와 즉흥 활동이 있는지 살펴보세요.

피아노 앞에 앉는 시간은 짧게 나누고 몸으로 리듬을 익히는 시간을 섞을 수 있습니다. 활동이 끝난 뒤 같은 리듬을 건반에서 한두 음으로 연주하면 놀이와 악보가 연결됩니다.

## 4. 손의 모양을 억지로 고정하지 않는지

손이 작은 아이에게 넓은 음정이나 힘든 손가락 독립을 서두르면 긴장이 생길 수 있습니다. 자연스럽게 팔을 옮기고 짧은 패턴을 치는 활동부터 시작하는지 확인하세요. 손가락 모양을 예쁘게 만드는 것보다 통증 없이 편하게 소리를 내는 것이 우선입니다.

## 5. 아이가 좋아하는 소리와 이야기를 담을 수 있는지

짧은 곡에 제목을 붙이거나 소리의 크기와 빠르기를 이야기로 표현하는 활동은 반복할 이유를 만들어 줍니다. 정답 하나만 요구하기보다 아이가 선택하고 들은 느낌을 말할 여지가 있는 교재가 좋습니다. 다만 이야기 활동이 실제 건반과 리듬 학습으로 연결되는지는 확인해야 합니다.

## 6. 보호자가 도울 수 있는 안내가 있는지

가정 연습 페이지에는 무엇을 몇 번 치라는 지시보다 오늘 확인할 한 가지가 분명한 편이 좋습니다. 보호자가 음악 용어를 몰라도 시작 자세, 리듬 세기와 마칠 시점을 이해할 수 있는지 보세요. 아이가 틀릴 때 바로 답을 알려 주기보다 다시 듣고 찾도록 돕는 문장도 유용합니다.

연습은 길게 한 번보다 짧게 자주 이어 가는 편이 현실적입니다. 아이의 연습 환경과 부모 역할은 [피아노 연습 부모 도움법](/blog/parents/practice-parent-role)에서 더 자세히 확인할 수 있습니다.

## 7. 다음 단계로 자연스럽게 이어지는지

첫 책을 마친 뒤 오선 읽기, 양손 사용과 곡 연주로 어떻게 이어지는지 확인하세요. 교재를 자주 바꾸면 기호와 설명 방식이 달라져 아이가 혼란스러울 수 있으므로, 현재 책의 부족한 부분을 보조 활동으로 채울지 다음 단계로 옮길지 선생님과 상의하는 편이 좋습니다.

유아 피아노 교재는 나이만으로 고르지 말고 실제 집중 시간, 손의 편안함, 리듬 반응과 악보를 보는 부담을 함께 살펴야 합니다. 수업을 시작할 준비가 되었는지부터 확인하려면 [어린이 피아노 레슨](/lessons/children)과 [아이 피아노 시작 나이](/blog/parents/piano-start-age)를 함께 살펴보세요.',
  (SELECT id FROM categories WHERE slug = 'parents'),
  '유아 피아노 교재, 유아 피아노, 어린이 피아노 교재, 아이 피아노 교육',
  '/assets/cat-parents.jpg',
  '유아 피아노 교재와 작은 손이 놓인 피아노 건반',
  'informational',
  'informational',
  'children',
  '유아 피아노 교재 고르는 7가지 기준 | 이화 피아노 과외',
  '유아 피아노 교재를 고를 때 악보 크기, 단원 길이, 리듬 활동, 손의 편안함, 보호자 안내와 다음 단계까지 확인하는 기준을 안내합니다.',
  'draft',
  7,
  NULL
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'parents')
  AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'preschool-piano-book');

INSERT INTO posts (
  slug, title, excerpt, body, category_id, tags, cover_image, cover_alt,
  keyword_role, search_intent, keyword_cluster, meta_title, meta_description,
  status, reading_minutes, published_at
)
SELECT
  'hongdae-piano-guide',
  '홍대 피아노, 학원·방문 레슨 선택 전에 볼 기준',
  '홍대 피아노 수업을 찾을 때 학원 위치, 방문 가능 범위, 이동 시간, 연습 악기와 보강 규정을 비교하는 방법을 지역 이용자의 관점에서 정리했습니다.',
  '홍대 피아노 수업을 찾는다면 검색 결과의 거리만 보고 결정하기보다 실제 이동 동선, 수업 형태와 연습 환경을 함께 확인해야 합니다. 홍대입구역 생활권은 마포구와 서대문구가 맞닿아 있어 같은 홍대 인근이라도 출발 위치에 따라 방문 가능 여부와 이동 시간이 달라질 수 있습니다.

이화 피아노 과외는 홍대에 오프라인 학원이나 연습실을 운영한다고 표시하지 않습니다. 서울 서대문구·마포구의 **협의 가능한 주소로 찾아가는 방문 레슨**과 지역 제한이 적은 온라인 수업을 제공하며, 정확한 방문 가능 여부는 상담에서 확인합니다.

## 홍대 생활권의 실제 이동 시간을 확인하기

지도에서 가까워 보여도 퇴근 시간, 버스 환승과 역 출구에 따라 체감 거리가 달라집니다. 수업을 받을 요일과 시간에 맞춰 집, 학교 또는 직장에서 이동 시간을 계산하세요. 늦은 시간 수업이라면 귀가 동선과 건물 출입 가능 시간도 함께 확인하는 편이 좋습니다.

방문 레슨은 학생이 이동하지 않는 대신 선생님의 이동 가능 범위와 일정이 맞아야 합니다. 주소 전체를 공개 게시물에 남기지 말고 상담 단계에서 동 단위와 가까운 역, 가능한 시간을 전달해 협의하세요.

## 학원과 방문 레슨의 차이를 일정에 넣어 보기

학원은 정해진 장소와 연습 환경을 이용할 수 있다는 장점이 있습니다. 방문 레슨은 익숙한 집의 악기로 배우고 이동 시간을 줄일 수 있습니다. 여러 수업이 함께 진행되는 분위기가 좋은지, 1:1 피드백과 일정 조정을 중요하게 보는지에 따라 선택이 달라집니다.

비용을 비교할 때는 월 수강료뿐 아니라 교통비, 이동 시간, 연습실 이용료와 결석 보강 규정을 함께 적어 보세요. 학원과 과외의 일반적인 차이는 [피아노 학원과 과외 비교](/blog/lesson-guide/academy-vs-tutoring)에서 확인할 수 있습니다.

## 집에서 받을 때 악기와 공간 점검하기

방문 수업을 원한다면 건반 상태, 의자 높이, 악보대와 조명을 확인합니다. 디지털 피아노는 전원과 페달이 안정적으로 연결되는지, 어쿠스틱 피아노는 조율 상태가 지나치게 불안정하지 않은지 살펴보세요. 수업 중 가족의 이동이나 생활 소음이 잦다면 집중할 수 있는 시간대를 먼저 정합니다.

공동주택에서는 연주 가능한 시간과 이웃 소음 문제도 고려해야 합니다. 헤드폰이 필요한 시간과 소리를 내야 하는 수업 시간을 구분하고, 건물 규칙이 있다면 미리 확인하세요.

## 상담에서 꼭 물어볼 네 가지

첫째, 홍대 인근 어느 범위까지 방문 가능한지 확인합니다. 둘째, 45분과 60분 중 가능한 수업 시간과 정기 일정을 묻습니다. 셋째, 결석과 보강 규정을 글로 확인합니다. 넷째, 초보, 성인 취미, 어린이 또는 입시 중 내 목표를 지도할 수 있는지 질문합니다.

선생님의 학력이나 경력만 보지 말고 설명 방식과 과제의 구체성도 확인하세요. 첫 상담에서 현재 수준과 원하는 곡, 한 주 연습 가능 시간을 묻고 현실적인 시작점을 제시하는지가 중요합니다.

## 방문이 어렵다면 온라인 수업과 비교하기

일정이나 주소 때문에 방문이 어렵다면 온라인 수업을 대안으로 볼 수 있습니다. 카메라에서 손과 건반이 보이는 각도, 안정적인 연결과 소리를 들을 수 있는 환경이 필요합니다. 자세를 여러 각도에서 바로 교정받고 싶은지, 이동 없이 규칙적으로 수업받는 것이 중요한지 비교하세요.

홍대 피아노 수업 선택의 핵심은 홍대라는 이름보다 실제 주소에서 가능한 방식, 이동 시간, 악기와 피드백입니다. 마포구 방문 범위와 수업 사례는 [마포구 피아노 과외 안내](/blog/local/mapo-piano), 방문 수업의 전체 방식은 [방문 피아노 레슨](/lessons/home-visit)에서 확인할 수 있습니다.',
  (SELECT id FROM categories WHERE slug = 'local'),
  '홍대 피아노, 홍대 피아노 레슨, 홍대 피아노 과외, 마포 피아노 레슨',
  '/assets/cat-local.jpg',
  '홍대 인근 방문 피아노 레슨을 위한 피아노 건반',
  'long-tail',
  'local',
  'local',
  '홍대 피아노 학원·방문 레슨 선택 기준 | 이화 피아노 과외',
  '홍대 피아노 수업을 찾을 때 학원과 방문 레슨의 이동 시간, 악기, 수업 방식, 보강 규정과 실제 방문 가능 범위를 비교하는 기준을 안내합니다.',
  'draft',
  7,
  NULL
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'local')
  AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'hongdae-piano-guide');

INSERT OR IGNORE INTO post_keyword_evidence (
  post_id, source_file, source_sheet, source_row, total_monthly_searches,
  naver_monthly_searches, naver_mobile_searches, naver_pc_searches,
  google_monthly_searches, naver_competition, google_competition,
  selection_note, researched_at
)
SELECT id, '피아노_키워드_최종완전판.xlsx', '전체 키워드', 132, 960, 940, 820, 120, 20, '높음', '낮음',
       '기존 성인 레슨 및 비용 페이지와 검색 의도를 분리한 가격 비교형 정보 글', '2026-07-23'
FROM posts WHERE slug = 'adult-piano-academy-price';

INSERT OR IGNORE INTO post_keyword_evidence (
  post_id, source_file, source_sheet, source_row, total_monthly_searches,
  naver_monthly_searches, naver_mobile_searches, naver_pc_searches,
  google_monthly_searches, naver_competition, google_competition,
  selection_note, researched_at
)
SELECT id, '피아노_키워드_최종완전판.xlsx', '전체 키워드', 38, 4230, 1830, 1600, 230, 2400, '높음', '낮음',
       '연습 카테고리의 미점유 고검색량 정보 키워드', '2026-07-23'
FROM posts WHERE slug = 'piano-chords-basics';

INSERT OR IGNORE INTO post_keyword_evidence (
  post_id, source_file, source_sheet, source_row, total_monthly_searches,
  naver_monthly_searches, naver_mobile_searches, naver_pc_searches,
  google_monthly_searches, naver_competition, google_competition,
  selection_note, researched_at
)
SELECT id, '피아노_키워드_최종완전판.xlsx', '전체 키워드', 159, 780, 520, 420, 100, 260, '높음', '낮음',
       '학교 브랜드 검색어를 피하고 준비 순서를 다루는 입시 정보 키워드', '2026-07-23'
FROM posts WHERE slug = 'arts-high-school-admission';

INSERT OR IGNORE INTO post_keyword_evidence (
  post_id, source_file, source_sheet, source_row, total_monthly_searches,
  naver_monthly_searches, naver_mobile_searches, naver_pc_searches,
  google_monthly_searches, naver_competition, google_competition,
  selection_note, researched_at
)
SELECT id, '피아노_키워드_최종완전판.xlsx', '전체 키워드', 172, 710, 450, 400, 50, 260, '높음', '낮음',
       '연주곡 허브와 겹치는 추천 목록 대신 장르별 선택 기준을 담당하는 정보 키워드', '2026-07-23'
FROM posts WHERE slug = 'classical-piano-guide';

INSERT OR IGNORE INTO post_keyword_evidence (
  post_id, source_file, source_sheet, source_row, total_monthly_searches,
  naver_monthly_searches, naver_mobile_searches, naver_pc_searches,
  google_monthly_searches, naver_competition, google_competition,
  selection_note, researched_at
)
SELECT id, '피아노_키워드_최종완전판.xlsx', '전체 키워드', 458, 250, 230, 190, 40, 20, '높음', '낮음',
       '어린이 레슨 서비스 페이지와 겹치지 않는 학부모 실무 정보 키워드', '2026-07-23'
FROM posts WHERE slug = 'preschool-piano-book';

INSERT OR IGNORE INTO post_keyword_evidence (
  post_id, source_file, source_sheet, source_row, total_monthly_searches,
  naver_monthly_searches, naver_mobile_searches, naver_pc_searches,
  google_monthly_searches, naver_competition, google_competition,
  selection_note, researched_at
)
SELECT id, '피아노_키워드_최종완전판.xlsx', '전체 키워드', 1667, 55, 35, 30, 5, 20, '높음', '낮음',
       '타 학원명 검색어를 제외하고 실제 방문 권역과 일치하는 홍대 생활권 키워드', '2026-07-23'
FROM posts WHERE slug = 'hongdae-piano-guide';
