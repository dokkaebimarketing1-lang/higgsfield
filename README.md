# 이화 피아노 과외 (ewha-piano)

이화여자대학교 피아노과 재학생의 1:1 피아노 과외 웹사이트와 SEO 콘텐츠 CMS입니다.

- 라이브: https://ewha-piano.higgsfield.app
- 앱 소스: `app/`
- 로컬 개발: [LOCAL-DEV.md](LOCAL-DEV.md)
- 연구 데이터 운영: [RESEARCH-DATA.md](RESEARCH-DATA.md)
- 페이지별 키워드 소유권: [SEO-KEYWORD-MAP.md](SEO-KEYWORD-MAP.md)
- 배포·운영 검증: [DEPLOYMENT.md](DEPLOYMENT.md)

## 기술 구성

- React 19 + TanStack Start SSR
- Vite 7 + Tailwind CSS v4
- Cloudflare Worker
- Cloudflare D1: 상담 신청과 블로그/CMS
- Cloudflare R2: CMS 이미지
- Lenis + GSAP ScrollTrigger: 히어로 스크롤 연출

이 사이트는 Higgsfield SDK를 사용하지 않는 마케팅 사이트입니다. 따라서 private
`@higgsfield/*` 워크스페이스나 Quanta UI 패키지 없이 공개 npm 의존성만으로 설치하고
빌드할 수 있습니다.

## 주요 구조

```text
app/
  src/routes/          홈, 수업, 블로그, 연구, 도구, 자료, 편집 정책, sitemap, RSS, llms.txt
  src/lib/content.ts   사이트 공통 카피와 운영 정보
  src/lib/piano-tools.ts      코드표와 레슨비 계산 로직
  src/lib/piano-resources.ts  수준별 로드맵과 연습 플래너 데이터
  src/lib/api/         상담 및 블로그/CMS 서버 함수
  src/components/site/ 내비게이션, 푸터, 히어로, 모노그램
  public/assets/       브랜드 이미지
  public/data/research/ 재현 가능한 가공 CSV, 메타데이터, 데이터 사전, 원자료 매니페스트
  public/data/resources/ 학습 로드맵과 주간 연습 플래너 CSV
  public/frames/hero/  히어로 스크럽 프레임
  migrations/          D1 스키마와 콘텐츠 시드
  app.manifest.json    Higgsfield가 프로비저닝할 D1/R2 선언
  wrangler.jsonc       로컬 빌드/개발용 Cloudflare 설정
seed/                  블로그 원고
refs/                  디자인 보드와 원본 영상
```

## 로컬 실행

```bash
cd app
bun install --frozen-lockfile
bun run dev
```

검증 명령:

```bash
bun run verify:ci
```

`verify:ci`는 lint, 전체 테스트, typecheck, 새 DB 마이그레이션 검사와 프로덕션 빌드를
차례로 실행합니다. 일반 개발·빌드에는 별도의 데이터 변환이 필요하지 않습니다. 공식
연구 데이터 스냅샷이나 검색수요 원본 통합문서가 바뀔 때만
[RESEARCH-DATA.md](RESEARCH-DATA.md)의 해당 변환 절차를 실행합니다. 로컬 데이터 바인딩
제약과 Design Inspector 빌드는 [LOCAL-DEV.md](LOCAL-DEV.md)를 참고하세요.

## SEO / GEO

- 주제 클러스터 URL: `/blog` → `/blog/[category]` → `/blog/[category]/[slug]`
- 독립 권위 자산: `/research`, `/tools`, `/resources`, `/editorial-policy`
- 연구 투명성: `/research/methodology`, `/research/changelog`
- 글의 `tags` 첫 항목을 대표 목표 키워드로 사용하며 title, H1, 요약, SEO 설명에 자연스럽게 일치
- 카테고리 허브 목표 키워드는 `app/src/lib/content.ts`의 `CATEGORY_SEO`에서 개별 글과 겹치지 않게 관리
- 페이지별 title, description, canonical, Open Graph
- LocalBusiness, WebSite, FAQPage, Person, BlogPosting, BreadcrumbList, Dataset, DataCatalog, WebApplication JSON-LD
- 공식 원자료와 가공본 엔티티 분리, 권장 인용문, 버전·수정일, CSV 해시·데이터 사전 공개
- 검색수요 데이터는 광고 플랫폼 추정치임을 명시하고 공식 통계·실제 트래픽과 구분
- 코드표, 레슨비 계산기, 수준별 로드맵과 연습 플래너를 다운로드·인쇄 가능한 독립 URL로 제공
- 동적 `sitemap.xml`, RSS, HTML 사이트맵, `/llms.txt`

이 구조는 검색엔진과 이용자가 출처, 계산 기준, 수정 이력과 페이지 책임을 확인할 수
있게 하는 토대입니다. 도메인 권위나 특정 검색순위·외부 도구의 DA/PA 점수를 보장하지
않으며, 배포 후 색인·노출·인용·자연 외부 링크를 실제 데이터로 추적해야 합니다.

## 배포

GitHub `main`이 유일한 편집 원본입니다. push 뒤 자동 워크플로가 검증, Higgsfield 내부
미러 동기화, 라이브 배포와 운영 URL 검사를 수행합니다. 실제 D1/R2 리소스와 운영
비밀값은 플랫폼에서 주입하며 저장소에 커밋하지 않습니다. 배포 전에는
`0008_copy_fixes.sql`과 `0009_security.sql`이 적용되는지 확인해야 합니다. 전체 흐름과
권위 자산의 배포 후 확인 항목은 [DEPLOYMENT.md](DEPLOYMENT.md)를 따릅니다.
