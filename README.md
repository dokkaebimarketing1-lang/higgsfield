# 이화 피아노 과외 (ewha-piano)

이화여자대학교 피아노과 재학생의 1:1 피아노 과외 웹사이트 + SEO 콘텐츠 CMS.
라이브: https://ewha-piano.higgsfield.app

## 스택

- React 19 + TanStack Start (SSR, Cloudflare Worker 단일 배포)
- Tailwind CSS v4 (커스텀 브랜드 토큰)
- Cloudflare D1 (상담 신청, 블로그 글/카테고리) + R2 (CMS 이미지 업로드)
- Lenis + GSAP ScrollTrigger (스크롤 스크럽 히어로 필름)

## 구조

```
app/
  src/routes/          페이지 (홈 / about / blog 허브·카테고리·글 / admin CMS / sitemap / rss / llms.txt)
  src/lib/content.ts   사이트 전체 카피 (문구는 여기만 수정)
  src/lib/api/         서버 함수 (상담 신청, 글 CRUD, 이미지 업로드)
  src/components/site/ 낸드·푸터, 히어로 스크러버, 모노그램
  public/assets/       생성 이미지 (AI 생성 브랜드 에셋)
  public/frames/hero/  히어로 스크럽 필름 프레임 (101장, 모바일은 51장 로드)
  migrations/          D1 마이그레이션 (카테고리 6 + 칼럼 시드 31편)
  design-brief.md      디자인 설계 문서
seed/                  칼럼 원고 (마크다운 소스)
refs/                  디자인 보드, 원본 필름
```

## SEO / GEO 기능

- 주제 클러스터 URL: /blog → /blog/[category] → /blog/[category]/[slug]
- 페이지별 고유 title/description/canonical/OG, JSON-LD 6종 (LocalBusiness, WebSite, FAQPage, Person, BlogPosting, BreadcrumbList)
- 동적 sitemap.xml, RSS, HTML 사이트맵, /llms.txt
- 홈 FAQ(FAQPage), 글 상단 "한눈에 보기" 요약, 글별 FAQ 자동 스키마

## 관리자

- /admin: 상담 신청 내역 + 글 작성/수정/발행 CMS (마크다운 에디터, 이미지 업로드)

## 배포

이 저장소는 소스 백업(미러)입니다. 실제 빌드·배포·DB/R2 프로비저닝은
Higgsfield 웹사이트 빌더 플랫폼에서 수행합니다 (플랫폼 남부 packages/ 등은 제외됨).
