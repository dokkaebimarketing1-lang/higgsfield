-- GEO: 핵심 글 8편에 '자주 묻는 질문' 섹션 추가 (FAQPage 스키마 자동 연동)

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**재학생 과외와 전문 강사 중 무엇이 나을까요?** 아이의 첫 입문에는 재학생 과외가 충분히 좋은 선택입니다. 입시나 콩쿠르처럼 특별한 목표가 있다면 해당 분야의 경력자를 우선하세요.\n\n**체험 레슨 없이 결정해도 될까요?** 권하지 않습니다. 체험 한 번이면 아이와의 궁합과 설명 방식을 확인할 수 있습니다.', updated_at = datetime('now') WHERE slug = 'choosing-piano-tutor';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**과외 비용이 학원보다 많이 비싼가요?** 월 단위로 볼 때 비슷하거나 1.5배 정도입니다. 다만 과외는 이동 시간이 없고 1:1 집중이라 시간 대비 효율이 다릅니다.\n\n**학원을 다니다가 과외로 바꿔도 되나요?** 언제든 가능합니다. 현재 진도와 습관을 진단한 뒤 이어서 시작합니다.', updated_at = datetime('now') WHERE slug = 'academy-vs-tutoring';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**초등 저학년도 60분 레슨이 가능한가요?** 가능은 하지만 권하지 않습니다. 집중력 기준으로 45분이 적당하고, 질 좋은 45분이 흐트러진 60분보다 낫습니다.\n\n**연습 과제는 얼마나 나오나요?** 아이의 주간 상황에 맞춰 조정합니다. 보통 하루 20~30분 분량입니다.', updated_at = datetime('now') WHERE slug = 'elementary-piano-tutoring';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**몇 개월이면 한 곡을 칠 수 있나요?** 악보를 처음 읽는 분 기준으로 평균 3개월이면 간단한 곡 한 곡을 완성합니다.\n\n**악기가 없어도 시작할 수 있나요?** 레슨 자체는 가능하지만 집에 건반이 있어야 연습이 됩니다. 가중 건반 디지털 피아노면 충분합니다.', updated_at = datetime('now') WHERE slug = 'adult-piano-tutoring';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**고2인데 지금 시작해도 늦지 않았나요?** 현재 수준에 따라 다릅니다. 체르니 30 이상의 기본기가 있다면 가능한 로드맵이 나옵니다. 진단 후 솔직하게 안내드립니다.\n\n**예고 출신이 아니어도 가능한가요?** 가능합니다. 일반고 출신 합격자도 매년 나옵니다. 중요한 것은 실기의 완성도입니다.', updated_at = datetime('now') WHERE slug = 'music-college-entrance';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**4세인데 조기 교육으로 시작하고 싶어요.** 수업 형태의 레슨보다 음악 놀이를 권합니다. 기호 읽기 없이 감각으로 흥미를 먼저 만드는 것이 좋습니다.\n\n**초등 4학년인데 늦은 건 아닌가요?** 아닙니다. 이해력이 좋은 나이라 오히려 진도가 빠릅니다.', updated_at = datetime('now') WHERE slug = 'piano-start-age';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**피아노를 그만두게 해야 할까요?** 그만두기 전에 과제 조정과 두 달 휴식을 먼저 시도해 보세요. 대부분 구조 문제라 방법을 바꾸면 다시 시작합니다.\n\n**학원을 바꾸면 달라질까요?** 환경이 원인일 때만 효과가 있습니다. 선생님과의 궁합, 과제의 양, 이동 거리 중 무엇이 문제인지 먼저 확인하세요.', updated_at = datetime('now') WHERE slug = 'child-hates-practice';

UPDATE posts SET body = body || '\n\n## 자주 묻는 질문\n\n**디지털 피아노로 시작하면 습관이 나빠지나요?** 가중 건반 디지털이면 괜찮습니다. 터치 차이는 있지만 입문 1~2년 차에는 충분한 선택입니다.\n\n**중고 어쿠스틱은 어떻게 골라야 하나요?** 반드시 조율사나 전공자 동반 점검 후 구입하세요. 핀블록과 현의 상태를 봐야 합니다.', updated_at = datetime('now') WHERE slug = 'buying-first-piano';
