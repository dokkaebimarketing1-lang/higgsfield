import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../components/site/chrome";
import {
  listCategories,
  listPublishedPosts,
  type CategoryRow,
  type PostRow,
} from "../lib/api/posts.functions";
import { SITE, SITE_URL } from "../lib/content";

export const Route = createFileRoute("/sitemap")({
  loader: async () => {
    const [{ categories }, { posts }] = await Promise.all([
      listCategories(),
      listPublishedPosts({ data: { limit: 100 } }),
    ]);
    return { categories, posts };
  },
  head: () => ({
    meta: [
      { title: `사이트맵 | ${SITE.brand}` },
      { name: "description", content: "이화 피아노 과외 사이트의 전체 페이지와 글 목록입니다." },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/sitemap` }],
  }),
  component: SitemapPage,
});

function SitemapPage() {
  const { categories, posts } = Route.useLoaderData() as {
    categories: CategoryRow[];
    posts: PostRow[];
  };

  const MAIN_PAGES = [
    { href: "/", label: "홈 | 이화여대 피아노과 1:1 피아노 레슨" },
    { href: "/about", label: "선생님 소개" },
    { href: "/blog", label: "피아노 이야기 (칼럼)" },
    { href: "/#programs", label: "레슨 프로그램" },
    { href: "/#pricing", label: "레슨 요금 안내" },
    { href: "/#faq", label: "자주 묻는 질문" },
    { href: "/#contact", label: "상담 신청" },
    { href: "/privacy", label: "개인정보 처리 안내" },
  ];

  return (
    <SubPageShell>
      <div className="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
        <h1 className="font-serif-kr text-4xl font-bold tracking-tight md:text-5xl">사이트맵</h1>
        <p className="mt-4 text-mute">이화 피아노 과외의 전체 페이지와 글 목록입니다.</p>

        <h2 className="mt-14 font-serif-kr text-2xl font-bold">주요 페이지</h2>
        <ul className="mt-5">
          {MAIN_PAGES.map((p) => (
            <li key={p.href} className="border-b border-line first:border-t">
              <a href={p.href} className="block py-4 text-ivory transition-colors hover:text-brass">
                {p.label}
              </a>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif-kr text-2xl font-bold">피아노 이야기</h2>
        {categories.map((c) => {
          const catPosts = posts.filter((p) => p.category_slug === c.slug);
          return (
            <div key={c.id} className="mt-8">
              <a
                href={`/blog/${c.slug}`}
                className="font-serif-kr text-xl font-semibold text-ivory transition-colors hover:text-brass"
              >
                {c.name}
                <span className="ml-3 text-sm font-normal text-faint">{catPosts.length}편</span>
              </a>
              {catPosts.length > 0 && (
                <ul className="mt-3">
                  {catPosts.map((p) => (
                    <li key={p.id} className="border-b border-line">
                      <a
                        href={`/blog/${c.slug}/${p.slug}`}
                        className="block py-3 text-sm text-mute transition-colors hover:text-ivory"
                      >
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </SubPageShell>
  );
}
