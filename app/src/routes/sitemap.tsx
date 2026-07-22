import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../components/site/chrome";
import {
  listCategories,
  listPublishedPosts,
  type CategoryRow,
  type PostRow,
} from "../lib/api/posts.functions";
import { CATEGORY_SEO } from "../lib/content";
import {
  buildPublicPageHead,
  PUBLIC_PAGE_BY_PATH,
  PUBLIC_PAGES,
  SERVICE_PAGES,
} from "../lib/seo-pages";

const sitemapPage = PUBLIC_PAGE_BY_PATH.get("/sitemap")!;

export const Route = createFileRoute("/sitemap")({
  loader: async () => {
    const [{ categories }, { posts }] = await Promise.all([
      listCategories(),
      listPublishedPosts({ data: { limit: 100 } }),
    ]);
    return { categories, posts };
  },
  head: () => buildPublicPageHead(sitemapPage),
  component: SitemapPage,
});

function SitemapPage() {
  const { categories, posts } = Route.useLoaderData() as {
    categories: CategoryRow[];
    posts: PostRow[];
  };

  const lessonPages = Object.values(SERVICE_PAGES);
  const lessonPaths = new Set<string>(lessonPages.map((page) => page.path));
  const mainPages = PUBLIC_PAGES.filter((page) => !lessonPaths.has(page.path));
  const publicCategories = categories.filter((category) => Number(category.post_count ?? 0) > 0);

  return (
    <SubPageShell>
      <div className="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
        <h1 className="font-serif-kr text-4xl font-bold tracking-tight md:text-5xl">사이트맵</h1>
        <p className="mt-4 text-mute">이화 피아노 과외의 전체 페이지와 글 목록입니다.</p>

        <h2 className="mt-14 font-serif-kr text-2xl font-bold">주요 페이지</h2>
        <ul className="mt-5">
          {mainPages.map((p) => (
            <li key={p.path} className="border-b border-line first:border-t">
              <a href={p.path} className="block py-4 text-ivory transition-colors hover:text-brass">
                {p.label}
              </a>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif-kr text-2xl font-bold">목적별 레슨 안내</h2>
        <ul className="mt-5">
          {lessonPages.map((p) => (
            <li key={p.path} className="border-b border-line first:border-t">
              <a href={p.path} className="block py-4 text-ivory transition-colors hover:text-brass">
                {p.primaryKeyword}
              </a>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif-kr text-2xl font-bold">피아노 이야기</h2>
        {publicCategories.map((c) => {
          const catPosts = posts.filter((p) => p.category_slug === c.slug);
          return (
            <div key={c.id} className="mt-8">
              <a
                href={`/blog/${c.slug}`}
                className="font-serif-kr text-xl font-semibold text-ivory transition-colors hover:text-brass"
              >
                {CATEGORY_SEO[c.slug]?.primaryKeyword ?? c.name}
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
