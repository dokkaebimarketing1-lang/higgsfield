# 이화 피아노 과외 — Design Brief

## Addendum (2026-07) — SEO 콘텐츠 사이트 확장
- 홈 섹션 9개로 확장: 기존 7 + FAQ(아코디언, FAQPage 스키마) + 최신 칼럼 밴드(룰드 로우).
- CMS: D1 posts/categories + R2 이미지 업로드, /admin 탭(상담/글 관리/에디터, 마크다운).
- URL 클러스터 구조: /blog(허브) → /blog/[category](랜딩) → /blog/[category]/[slug](글).
- /about (선생님 Person 엔티티 페이지), /sitemap (HTML), 동적 sitemap.xml, rss.xml.
- 카테고리 6개(과외 가이드/연습/입시·콩쿠르/곡 추천/학부모/지역), 커버 이미지 카테고리당 1종.
- 시드 글 30편은 키워드 맵 기준 GEO 템플릿(직답 리드, 질문형 H2, 낸드 링크)으로 작성.

## Design read
서울에서 "피아노 과외"를 검색하는 학부모와 성인 학습자를 위한 1:1 레슨 사이트. 이화여대 피아노과 재학생이라는 신뢰와, 한 사람만을 위한 리사이틀 같은 정갈한 우아함을 전달한다.

## Concept spine
**"한 편의 프라이빗 리사이틀"** — 사이트 전체가 하나의 리사이틀 프로그램북이다. 각 섹션은 악장이고, 스크롤은 연주의 진행이다. 오선지(5선) 헤어라인 모티프가 전 섹션의 리듬을 잡고, 템포 마킹(Adagio, Allegro, Finale)이 악장 이름으로 쓰인다.

## Delivery tier
`cinema` — Lenis + GSAP ScrollTrigger, Tier-1 히어로 스크럽, 스크롤 챕터 리빌.

## Locked palette (그랜드 피아노의 물질 세계에서 도출: 에보니 케이스 + 아이보리 건판 + 황동 프레임)
- Ground: `#0E130F` (stage ebony, 녹조 언더톤의 래커 블랙. 순수 #000 금지 규칙 충족)
- Surface alt: `#16201A` / hairline: `rgba(237,230,214,0.14)`
- Ink: `#EDE6D6` (warm key ivory) / muted ink: `#A8A191`
- ONE accent: `#C0A062` (satin brass, 피아노 캐스트아이언 프레임의 뮤티드 골드)
- 밴 패밀리 회피 근거: 그래파이트+비비드 오렌지(#F97316류) 아님(채도 낮은 브라스), 라이트 베이지+브라스 아님(다크 테마), 네온/퍼플 아님. Black & Tan 계열의 다크 콘서트홀 팔레트.
- 한 페이지 한 테마: 전 섹션 다크. 틴트 시프트만 사용.

## Locked type
- Display (KR): **Noto Serif KR** — 세리프 정당성: 리사이틀 프로그램북·악보 각본(engraving)이라는 실제 에디토리얼 유산을 계승하는 브랜드.
- Display (Latin/숫자): **Cormorant Garamond** — 템포 마킹·이탤릭 액센트 전용.
- Body/UI: **Noto Sans KR**.

## Tier-1 technique: A1 — Single-shot hero scrub
승인된 히어로 스틸(그랜드 피아노 건반 위 손, 스테이지 라이트)에서 시작하는 ~5초 Seedance 클립: 느린 푸시인 + 랙 포커스(soft→sharp) + 빛 스윕. 시작≠끝. ffmpeg 20fps 1280px 프레임 → 고정 핀 히어로의 캔버스에 스크롤 바인딩.
Defense: 방문자의 스크롤이 곧 연주의 시작이다. 스크롤이 필름을 "연주"하는 것이 리사이틀 스파인의 직접적 구현. 모바일: 핀 단축(150vh), 커서 효과 없음.

## Anti-convergence ledger
채팅 내 첫 빌드. 6축 모두 브리프의 물질 세계(에보니/아이보리/황동/오선지)에서 도출: 팔레트 Black&Tan 다크 / 세리프+산스 페어 / image-first 히어로 / A1 스크럽 / CTA 가먼트 4종 / 헤어라인 룰드 코너 언어(샤프).

## Combinatorial pick
- Theme paradigm: Deep Dark + twist(스테이지 스폿라이트가 만드는 웜 풀)
- Background character: full-bleed cinematic imagery(히어로) + solid with soft ambient depth(섹션)
- Typography character: editorial serif + sans pairing
- Hero architecture: massive image-first, restrained text (bottom-left headline overlay)
- Section system: asymmetric premium flow
- Signature components 4: 오선(5선) 헤어라인 리듬 / off-grid editorial / split testimonial wall / oversized metrics strip
- Narrative spine: stage/spotlight (리사이틀)
- Second-read moment: oversized italic tempo numeral as structure (진행 섹션 01–04)

## Section plan (7섹션, 7개 레이아웃 패밀리, eyebrow 3개)
1. Hero — film-scrub 캔버스 + 하단 좌측 헤드라인 (eyebrow: 이화여자대학교 피아노과)
2. 선생님 소개 [Adagio] — portrait-left editorial offset split
3. 레슨 프로그램 [Allegro] — wide featured image band + ruled text rows
4. 수업 진행 — oversized italic numerals ruled list (01–04)
5. 후기 — split testimonial wall (2×2, hairline divide)
6. 요금 — pricing tiers 3 (중앙 featured, brass border)
7. 상담 신청 [Finale] — contact rows + form split → D1 저장
푸터: 워드마크, 연락처, 관리자 링크(discreet).

## Asset plan
- 히어로 스틸 2 candidates → 1 pick (필름 start_image + 포스터)
- 히어로 필름: seedance_2_0 5s → frames (~100, 1280px, 20fps)
- 선생님 포트레이트 1, 프로그램 이미지 3(유아/입시/성인), 플레이트 2(악보 매크로, 스테이지 벨벳)
- 아이콘 시트 1(3×2: 새싹·졸업모·사람·채팅·핀·캘린더) → 슬라이스 + 배경제거
- 모노그램: 인라인 SVG (오선+건반 3바) / OG·파비콘: generate_app_branding
- 백엔드: D1 inquiries 테이블 + 상담 신청/관리자 조회 server fns (passcode는 secret)

## CTA inventory (인텐트당 라벨 1개)
- "상담 신청하기" — 낸드: 헤어라인 언더라인 링크(낸브) / 골드 필드 세리프 버튼(히어로, 스윕 호버) / 대형 텍스트 화살표 링크(푸터) / 폼 서브밋(골드 필드, active scale) — 각기 자체 컴포넌트
- "레슨 프로그램" — 히어로 세컨더리: 고스트 버튼(헤어라인 스트로크)
- 모바일 접힘: 프로그램 행·후기 그리드·요금 3열·신청 스플릿 모두 단일 컬럼 스택
