import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../../components/site/chrome";
import {
  getCategoryBySlug,
  listPublishedPosts,
  type CategoryRow,
  type PostRow,
} from "../../../lib/api/posts.functions";
import { CATEGORY_SEO, SITE, SITE_URL } from "../../../lib/content";

export const Route = createFileRoute("/blog/$category/")({
  loader: async ({ params }) => {
    const [{ category }, { posts }] = await Promise.all([
      getCategoryBySlug({ data: { slug: params.category } }),
      listPublishedPosts({ data: { category: params.category, limit: 100 } }),
    ]);
    return { category, posts };
  },
  head: ({ loaderData }) => {
    const category = (loaderData as { category: CategoryRow | null } | undefined)?.category;
    const name = category?.name ?? "피아노 이야기";
    const seo = category ? CATEGORY_SEO[category.slug] : undefined;
    const description =
      seo?.metaDescription ||
      category?.description ||
      `${name} 카테고리의 피아노 칼럼 모음. 이화여대 피아노과 선생님의 레슨 노하우.`;
    const url = `${SITE_URL}/blog/${category?.slug ?? ""}`;
    return {
      meta: [
        { title: `${name} | 피아노 이야기 | ${SITE.brand}` },
        { name: "description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                name,
                description,
                url,
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
                  { "@type": "ListItem", position: 3, name, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, posts } = Route.useLoaderData() as {
    category: CategoryRow | null;
    posts: PostRow[];
  };

  if (!category) {
    return (
      <SubPageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-serif-kr text-3xl font-bold">카테고리를 찾을 수 없습니다</h1>
          <a href="/blog" className="mt-6 inline-block text-brass underline underline-offset-8">
            피아노 이야기로 돌아가기
          </a>
        </div>
      </SubPageShell>
    );
  }

  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">홈</a>
          <span className="mx-2">/</span>
          <a href="/blog" className="hover:text-mute">피아노 이야기</a>
          <span className="mx-2">/</span>
          <span className="text-mute">{category.name}</span>
        </nav>

        <div className="relative mt-8 overflow-hidden border border-line">
          <img
            src={`/assets/cat-${category.slug}.jpg`}
            alt=""
            className="h-56 w-full object-cover opacity-70 md:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ebony via-ebony/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
            <h1 className="font-serif-kr text-4xl font-bold tracking-tight md:text-5xl">
              {category.name}
            </h1>
            <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ivory/80 md:text-base">
              {category.description}
            </p>
          </div>
        </div>

        <div className="mt-14">
          {CATEGORY_SEO[category.slug]?.intro && (
            <p className="mb-10 max-w-[62ch] leading-relaxed text-mute">
              {CATEGORY_SEO[category.slug].intro}
            </p>
          )}
          {posts.length === 0 ? (
            <p className="border border-line p-10 text-center text-mute">
              이 카테고리의 첫 글을 준비하고 있습니다.
            </p>
          ) : (
            posts.map((p) => (
              <a
                key={p.id}
                href={`/blog/${category.slug}/${p.slug}`}
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
                  <h2 className="font-serif-kr text-xl font-semibold transition-colors group-hover:text-brass md:text-2xl">
                    {p.title}
                  </h2>
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
