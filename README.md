# 이화 피아노 과외 (ewha-piano)

이화여자대학교 피아노과 재학생의 1:1 피아노 과외 웹사이트와 SEO 콘텐츠 CMS입니다.

- 라이브: https://ewha-piano.higgsfield.app
- 앱 소스: `app/`
- 로컬 개발: [LOCAL-DEV.md](LOCAL-DEV.md)
- 연구 데이터 운영: [RESEARCH-DATA.md](RESEARCH-DATA.md)

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
  src/routes/          홈, 소개, 블로그, 연구 데이터, 관리자, sitemap, RSS, llms.txt
  src/lib/content.ts   사이트 공통 카피와 운영 정보
  src/lib/api/         상담 및 블로그/CMS 서버 함수
  src/components/site/ 내비게이션, 푸터, 히어로, 모노그램
  public/assets/       브랜드 이미지
  public/data/research/ 직접 식별정보와 원자료 행 위치를 제거한 CSV 및 데이터셋 메타데이터
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
bun run lint
bun run typecheck
bun run build
```

일반 개발·빌드에는 별도의 변환 작업이 필요하지 않습니다. 공식 연구 데이터 스냅샷을
갱신할 때만 [RESEARCH-DATA.md](RESEARCH-DATA.md)의 변환 절차를 실행합니다. 로컬 데이터
바인딩 제약과 Design Inspector 빌드는 [LOCAL-DEV.md](LOCAL-DEV.md)를 참고하세요.

## SEO / GEO

- 주제 클러스터 URL: `/blog` → `/blog/[category]` → `/blog/[category]/[slug]`
- 글의 `tags` 첫 항목을 대표 목표 키워드로 사용하며 title, H1, 요약, SEO 설명에 자연스럽게 일치
- 카테고리 허브 목표 키워드는 `app/src/lib/content.ts`의 `CATEGORY_SEO`에서 개별 글과 겹치지 않게 관리
- 페이지별 title, description, canonical, Open Graph
- LocalBusiness, WebSite, FAQPage, Person, BlogPosting, BreadcrumbList, Dataset JSON-LD
- 동적 `sitemap.xml`, RSS, HTML 사이트맵, `/llms.txt`

## 배포

`app/app.manifest.json`, `app/wrangler.jsonc`, TanStack Worker 엔트리와 Higgsfield
Design Inspector 모듈은 유지됩니다. Git 변경을 Higgsfield 저장소에 반영한 뒤 기존
Higgsfield 웹사이트 배포 흐름으로 미리보기 또는 프로덕션을 배포합니다. 실제 D1/R2
리소스와 운영 비밀값은 플랫폼에서 주입하며 저장소에 커밋하지 않습니다.
배포 전에는 `0008_copy_fixes.sql`과 `0009_security.sql`이 적용되는지 확인해야 합니다.
