import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import {
  listCategories,
  listPublishedPosts,
  type CategoryRow,
  type PostRow,
} from "../../lib/api/posts.functions";
import { SITE, SITE_URL } from "../../lib/content";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const [{ categories }, { posts }] = await Promise.all([
      listCategories(),
      listPublishedPosts({ data: { limit: 50 } }),
    ]);
    return { categories, posts };
  },
  head: () => ({
    meta: [
      { title: `피아노 이야기 | ${SITE.brand}` },
      {
        name: "description",
        content:
          "피아노 과외 선택부터 연습법, 입시, 곡 추천까지. 이화여대 피아노과 선생님이 레슨 현장에서 전하는 피아노 칼럼.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "피아노 이야기",
          url: `${SITE_URL}/blog`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: "ko",
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
          피아노 이야기
        </h1>
        <p className="mt-5 max-w-[56ch] leading-relaxed text-mute">
          {SITE.brand}는 이화여자대학교 피아노과 재학생이 운영하는 1:1 피아노 레슨입니다. 이
          칼럼에는 피아노 과외 선택부터 연습 방법, 입시와 콩쿠르, 곡 추천까지, 레슨 현장에서 나온
          이야기를 정리해 전합니다.
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
                  {c.name}
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
