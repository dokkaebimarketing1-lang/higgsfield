import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";
import { SITE, SITE_URL } from "../lib/content";
import { SERVICE_PAGES } from "../lib/seo-pages";

function markdownText(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replaceAll("[", "(")
    .replaceAll("]", ")")
    .trim();
}

// AI 도구가 읽을 수 있는 보조 사이트 인벤토리입니다. Google 검색 노출 요건은 아닙니다.
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const servicePages = Object.values(SERVICE_PAGES)
          .map((page) => `- [${page.primaryKeyword}](${SITE_URL}${page.path}): ${page.description}`)
          .join("\n");
        const { DB } = bindings();
        let articleSection = "";
        if (DB) {
          const { results } = await DB.prepare(
            `SELECT p.title, p.slug, p.excerpt, p.updated_at, c.slug AS category_slug
             FROM posts p
             JOIN categories c ON c.id = p.category_id
             WHERE p.status = 'published'
             ORDER BY p.updated_at DESC, p.id DESC
             LIMIT 50`,
          ).all<{
            title: string;
            slug: string;
            excerpt: string;
            updated_at: string;
            category_slug: string;
          }>();
          const articles = (results ?? [])
            .map(
              (post) =>
                `- [${markdownText(post.title)}](${SITE_URL}/blog/${post.category_slug}/${post.slug}) (${post.updated_at.slice(0, 10)}): ${markdownText(post.excerpt)}`,
            )
            .join("\n");
          if (articles) articleSection = `\n## 발행된 피아노 칼럼\n\n${articles}\n`;
        }
        const body = `# ${SITE.brand}

> 이화여자대학교 피아노과 재학생 김서연이 운영하는 1:1 피아노 레슨 사이트입니다.
> 서울 서대문구 · 마포구 방문 레슨과 서울 전역 온라인 화상 수업을 제공합니다.
> 유아 · 초등 취미부터 음대 입시 · 콩쿠르, 성인 취미까지 지도합니다.
> 레슨 요금은 월 4회 기준 160,000원부터이며, 첫 상담과 30분 체험 레슨은 무료입니다.

## 주요 페이지

- [홈](${SITE_URL}/): 이화여대 피아노과 재학생의 1:1 피아노 레슨 소개, 프로그램, 요금, FAQ
- [선생님 소개](${SITE_URL}/about): 김서연 프로필, 경력, 레슨 철학
- [레슨 요금 안내](${SITE_URL}/pricing): 반별 월 요금 (160,000원 / 240,000원 / 320,000원)
- [자주 묻는 질문](${SITE_URL}/#faq): 비용, 지역, 시작 나이, 성인 초보, 입시 준비에 대한 답변
- [상담 신청](${SITE_URL}/#contact): 상담 신청 폼과 연락처
- [개인정보 처리 안내](${SITE_URL}/privacy): 상담 정보의 수집 목적, 보관 기간, 이용자 권리
- [피아노 이야기 (칼럼)](${SITE_URL}/blog): 피아노 과외 · 연습 · 입시 · 곡 추천 칼럼 모음

## 목적별 레슨

${servicePages}

## 칼럼 카테고리

- [과외 가이드](${SITE_URL}/blog/lesson-guide): 피아노 과외 비용, 선생님 고르는 법, 학원과 과외 비교
- [연습 방법](${SITE_URL}/blog/practice): 효율적 연습법, 하농, 악보 읽기, 메트로놈, 연습 습관
- [입시 · 콩쿠르](${SITE_URL}/blog/exam): 음대 입시 로드맵, 콩쿠르 준비, 입시곡 선택, 무대 떨림
- [곡 추천](${SITE_URL}/blog/repertoire): 초보 추천곡, 쉬운 곡, 중급 곡, 뉴에이지, 콩쿠르 곡
- [학부모 안내](${SITE_URL}/blog/parents): 시작 나이, 연습 대응법, 피아노 구입, 부모 역할
- [지역 레슨](${SITE_URL}/blog/local): 서울 지역별 피아노 과외 안내
${articleSection}

## 연락 · 지역

- 지역: 서울 서대문구 · 마포구 (방문), 서울 전역 (온라인)
- 운영 시간: 평일 15:00~21:00, 토요일 10:00~18:00
`;
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
