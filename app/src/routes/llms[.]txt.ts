import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";
import {
  PUBLIC_POST_STATE_SQL,
  PUBLIC_POST_WITH_CATEGORY_SQL,
} from "../lib/blog-publication-policy";
import { CATEGORY_SEO, SITE, SITE_URL } from "../lib/content";
import { PUBLIC_PAGES, SERVICE_PAGES } from "../lib/seo-pages";

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
        const authorityPages = PUBLIC_PAGES.filter((page) =>
          ["tools", "resources", "trust"].includes(page.cluster),
        )
          .map((page) => `- [${page.primaryKeyword}](${SITE_URL}${page.path}): ${page.description}`)
          .join("\n");
        const { DB } = bindings();
        if (!DB) {
          return new Response("Content inventory is temporarily unavailable.", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
              "Retry-After": "60",
            },
          });
        }

        let articleSection = "";
        let categorySection = "";
        try {
          const { results: categories } = await DB.prepare(
            `SELECT c.slug, c.name
             FROM categories c
             WHERE EXISTS (
               SELECT 1 FROM posts p
               WHERE p.category_id = c.id AND ${PUBLIC_POST_STATE_SQL}
             )
             ORDER BY c.sort_order ASC`,
          ).all<{ slug: string; name: string }>();
          categorySection = (categories ?? [])
            .map((category) => {
              const seo = CATEGORY_SEO[category.slug];
              const label = seo?.primaryKeyword ?? category.name;
              const description = seo?.metaDescription ?? `${category.name} 피아노 칼럼 모음`;
              return `- [${markdownText(label)}](${SITE_URL}/blog/${category.slug}): ${markdownText(description)}`;
            })
            .join("\n");

          const { results } = await DB.prepare(
            `SELECT p.title, p.slug, p.excerpt, p.updated_at, c.slug AS category_slug
             FROM posts p
             JOIN categories c ON c.id = p.category_id
             WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL}
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
        } catch (error) {
          console.error("[llms] Failed to load published posts", error);
          return new Response("Content inventory is temporarily unavailable.", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
              "Retry-After": "60",
            },
          });
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
- [피아노 통계 자료실](${SITE_URL}/research): 공식 원자료, 직접 식별정보와 원자료 행 위치를 제거한 가공 CSV, 방법론과 한계
- [2025 음악 사교육비 통계](${SITE_URL}/research/2025-music-private-education-statistics): 교육부·국가데이터처 공식 통계 정리
- [2026 서울 피아노 학원비](${SITE_URL}/research/2026-seoul-piano-academy-fees): 서울특별시교육청 등록 교습비 파생분석
- [2026 피아노 키워드 검색수요 조사](${SITE_URL}/research/piano-search-demand-report-2026): 구글·네이버 광고 도구 기반 4,545개 키워드 자체 조사
- [피아노 데이터 방법론](${SITE_URL}/research/methodology): 필터, 통계 기준, 한계와 수정 이력
- [피아노 데이터 수정 이력](${SITE_URL}/research/changelog): 데이터셋 버전, 무결성 정정과 검증 기록

## 무료 도구와 학습 자료

${authorityPages}

## 목적별 레슨

${servicePages}

## 칼럼 카테고리

${categorySection}
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
