-- 정보 글의 일반 상담 앵커를 검색 의도에 맞는 서비스 랜딩 앵커로 구체화한다.
-- 정확한 기존 마크다운이 남아 있을 때만 치환해 CMS에서 수정한 본문은 보존한다.

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[성인 피아노 레슨 안내](/lessons/adult)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'adult-piano-tutoring'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/adult') = 0;

UPDATE posts
SET body = replace(body, '[레슨](/#contact)', '[어린이 피아노 레슨](/lessons/children)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'buying-first-piano'
  AND instr(body, '[레슨](/#contact)') > 0
  AND instr(body, '/lessons/children') = 0;

UPDATE posts
SET body = replace(body, '[상담](/#contact)', '[어린이 피아노 레슨 상담](/lessons/children)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'child-hates-practice'
  AND instr(body, '[상담](/#contact)') > 0
  AND instr(body, '/lessons/children') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[초등학생 피아노 레슨 안내](/lessons/children)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'elementary-piano-tutoring'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/children') = 0;

UPDATE posts
SET body = replace(body, '[첫 상담](/#contact)', '[유아·어린이 피아노 레슨 안내](/lessons/children)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'piano-start-age'
  AND instr(body, '[첫 상담](/#contact)') > 0
  AND instr(body, '/lessons/children') = 0;

UPDATE posts
SET body = replace(body, '[상담](/#contact)', '[어린이 피아노 레슨 상담](/lessons/children)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'practice-parent-role'
  AND instr(body, '[상담](/#contact)') > 0
  AND instr(body, '/lessons/children') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[피아노 방문 레슨 상담](/lessons/home-visit)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'home-lesson-prep'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/home-visit') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[서대문구 피아노 방문 레슨](/lessons/home-visit)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'seodaemun-piano'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/home-visit') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[마포구 피아노 방문 레슨](/lessons/home-visit)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'mapo-piano'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/home-visit') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[이대·서대문구 피아노 방문 레슨](/lessons/home-visit)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'ewha-area-lesson'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/home-visit') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[서울 피아노 방문 레슨](/lessons/home-visit)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'seoul-piano-tutoring'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/home-visit') = 0;

UPDATE posts
SET body = replace(body, '[상담](/#contact)', '[피아노 개인 레슨 비교 상담](/lessons/private)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'academy-vs-tutoring'
  AND instr(body, '[상담](/#contact)') > 0
  AND instr(body, '/lessons/private') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[피아노 개인 레슨 상담](/lessons/private)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'choosing-piano-tutor'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/private') = 0;

UPDATE posts
SET body = replace(body, '[상담 신청](/#contact)', '[피아노 개인 레슨 시간 상담](/lessons/private)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tutoring-time-guide'
  AND instr(body, '[상담 신청](/#contact)') > 0
  AND instr(body, '/lessons/private') = 0;

UPDATE posts
SET body = replace(body, '[레슨 상담](/#contact)', '[피아노 개인 레슨 상담](/lessons/private)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sight-reading'
  AND instr(body, '[레슨 상담](/#contact)') > 0
  AND instr(body, '/lessons/private') = 0;

UPDATE posts
SET body = replace(body, '[레슨](/#contact)', '[성인 피아노 레슨](/lessons/adult)'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'new-age-piano'
  AND instr(body, '[레슨](/#contact)') > 0
  AND instr(body, '/lessons/adult') = 0;

-- 비용 정보 글은 비교 기준을 설명하고, 실제 과정별 가격표는 상업 랜딩 한 곳으로 모은다.
UPDATE posts
SET excerpt = '피아노 과외 비용은 월 횟수, 회당 시간, 지도 범위와 방문 여부에 따라 달라집니다. 최신 레슨비 확인 경로와 상담 전에 비교할 항목을 정리했습니다.',
    meta_description = '피아노 과외 비용을 월 횟수, 45분·60분 수업, 방문·온라인 방식과 피드백 범위별로 비교하세요. 비교 기준과 최신 피아노 레슨비 확인 경로를 안내합니다.',
    body = replace(
      body,
      '## 이 사이트에 공개된 수업료

현재 이화 피아노 과외의 월 4회 수업료는 다음과 같습니다.

- **취미 스타터**: 주 1회 45분, 월 160,000원
- **정규 집중**: 주 1회 60분, 월 240,000원
- **입시·콩쿠르**: 주 1회 60분, 월 320,000원

과정별 포함 항목과 최신 금액은 [피아노 레슨비 안내](/pricing)에서 확인할 수 있습니다. 일정, 이동 거리와 현재 수준에 따라 실제 진행 가능 여부는 첫 상담에서 확인합니다.',
      '## 실제 수업료는 전용 페이지에서 확인하세요

이 글은 특정 과정의 가격표를 반복하기보다 피아노 과외 비용을 비교할 때 필요한 기준을 설명합니다. 과정별 최신 금액, 회당 시간과 포함 항목은 [피아노 레슨비와 과정별 포함 항목](/pricing)에서 한 번에 확인하세요. 일정, 이동 거리와 현재 수준에 따라 실제 진행 가능 여부는 첫 상담에서 확인합니다.'
    ),
    search_intent = 'comparison',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'piano-tutoring-cost'
  AND excerpt = '피아노 과외 비용은 월 횟수, 회당 시간, 지도 범위와 방문 여부에 따라 달라집니다. 공개된 수업료와 상담 전에 비교할 항목을 함께 정리했습니다.'
  AND meta_description = '피아노 과외 비용을 월 횟수, 45분·60분 수업, 방문·온라인 방식과 피드백 범위별로 비교하세요. 공개 수업료와 상담 전 확인 항목을 안내합니다.'
  AND instr(body, '## 이 사이트에 공개된 수업료') > 0
  AND instr(body, '- **취미 스타터**: 주 1회 45분, 월 160,000원') > 0;

-- 기존 관련 문단 안에서 고립된 정보 글로 향하는 설명형 링크를 한 개씩 보강한다.
UPDATE posts
SET body = replace(
      body,
      '[피아노 입시·콩쿠르 가이드](/blog/exam)에서 곡 선택과 무대 준비 글을 함께 확인하고, 현재 곡의 준비 계획은 [피아노 입시 레슨](/lessons/admission)을 참고하세요.',
      '[콩쿠르 곡 선택 기준](/blog/repertoire/competition-pieces)을 먼저 확인하고, [피아노 입시·콩쿠르 가이드](/blog/exam)에서 무대 준비 글을 함께 살펴보세요. 현재 곡의 준비 계획은 [피아노 입시 레슨](/lessons/admission)을 참고하세요.'
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'competition-prep'
  AND instr(body, '[피아노 입시·콩쿠르 가이드](/blog/exam)에서 곡 선택과 무대 준비 글을 함께 확인하고') > 0
  AND instr(body, '/blog/repertoire/competition-pieces') = 0;

UPDATE posts
SET body = replace(
      body,
      '[주 1회 레슨](/lessons/private)에서 선생님은 이 루틴을 아이의 수준에 맞게 조정해 줍니다. 연습 일지를 병행하면 다음 레슨 때 무엇을 봐야 할지가 명확해집니다.',
      '혼자 연습 순서를 세우고 싶다면 [피아노 독학 8주 연습 순서](/blog/practice/piano-self-study)를 먼저 확인하세요. [피아노 개인 레슨](/lessons/private)에서는 선생님이 이 루틴을 학습자의 수준에 맞게 조정합니다. 연습 일지를 병행하면 다음 레슨 때 무엇을 봐야 할지가 명확해집니다.'
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'piano-practice-method'
  AND instr(body, '[주 1회 레슨](/lessons/private)에서 선생님은 이 루틴을 아이의 수준에 맞게 조정해 줍니다.') > 0
  AND instr(body, '/blog/practice/piano-self-study') = 0;
