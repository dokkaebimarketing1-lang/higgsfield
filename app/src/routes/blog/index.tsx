import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import {
  listCategories,
  listPublishedPosts,
  type CategoryRow,
  type PostRow,
} from "../../lib/api/posts.functions";
import { CATEGORY_SEO, SITE, SITE_URL } from "../../lib/content";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";

const blogPage = PUBLIC_PAGE_BY_PATH.get("/blog")!;

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const [{ categories }, { posts }] = await Promise.all([
      listCategories(),
      listPublishedPosts({ data: { limit: 50 } }),
    ]);
    return { categories, posts };
  },
  head: () => ({
    ...buildPublicPageHead(blogPage),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: blogPage.primaryKeyword,
              description: blogPage.description,
              url: `${SITE_URL}/blog`,
              image: blogPage.image,
              primaryImageOfPage: blogPage.image,
              isPartOf: { "@id": `${SITE_URL}/#website` },
              inLanguage: "ko",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "피아노 이야기",
                  item: `${SITE_URL}/blog`,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: BlogHub,
});

function BlogHub() {
  const { categories, posts } = Route.useLoaderData() as {
    categories: CategoryRow[];
    posts: PostRow[];
  };

  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <h1 className="font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
          피아노 레슨 정보와 연습 칼럼
        </h1>
        <p className="mt-5 max-w-[56ch] leading-relaxed text-mute">
          피아노 레슨 정보는 과외 선택부터 연습 방법, 입시와 콩쿠르, 곡 추천, 학부모와 지역 안내까지
          검색 목적에 맞춰 나눠 전합니다. {SITE.brand}를 운영하는 이화여자대학교 피아노과 재학생이
          레슨 현장에서 얻은 경험을 정리했습니다.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/blog/${c.slug}`}
              className="group relative overflow-hidden border border-line"
            >
              <img
                src={`/assets/cat-${c.slug}.jpg`}
                alt=""
                className="aspect-[16/9] w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ebony via-ebony/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h2 className="font-serif-kr text-xl font-semibold transition-colors group-hover:text-brass">
                  {CATEGORY_SEO[c.slug]?.primaryKeyword ?? c.name}
                </h2>
                <p className="mt-1 text-xs text-mute">
                  {c.description} · {c.post_count ?? 0}편
                </p>
              </div>
            </a>
          ))}
        </div>

        <h2 className="mt-20 font-serif-kr text-2xl font-bold md:text-3xl">최근 글</h2>
        <div className="mt-8">
          {posts.length === 0 ? (
            <p className="border border-line p-10 text-center text-mute">곧 첫 글이 올라옵니다.</p>
          ) : (
            posts.map((p) => (
              <a
                key={p.id}
                href={`/blog/${p.category_slug}/${p.slug}`}
                className="group grid items-center gap-4 border-b border-line py-6 first:border-t md:grid-cols-12"
              >
                {p.cover_image ? (
                  <img
                    src={p.cover_image}
                    alt=""
                    className="aspect-[16/9] w-full object-cover md:col-span-2 md:aspect-[4/3]"
                    loading="lazy"
                  />
                ) : null}
                <div className={p.cover_image ? "md:col-span-8" : "md:col-span-10"}>
                  <p className="text-xs text-faint">{p.category_name ?? "칼럼"}</p>
                  <h3 className="mt-1 font-serif-kr text-xl font-semibold transition-colors group-hover:text-brass md:text-2xl">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mute">
                      {p.excerpt}
                    </p>
                  )}
                </div>
                <span className="text-sm text-faint md:col-span-2 md:text-right">
                  {p.reading_minutes}분 · {p.published_at?.slice(0, 10)}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </SubPageShell>
  );
}
