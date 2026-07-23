import { createFileRoute, notFound } from "@tanstack/react-router";

import { SubPageShell } from "../../../components/site/chrome";
import { PageAuthorityRecord } from "../../../components/site/page-authority-record";
import { ResearchReferencePanel } from "../../../components/site/research-reference-panel";
import {
  getCategoryBySlug,
  listPublishedPosts,
  type CategoryRow,
  type PostRow,
} from "../../../lib/api/posts.functions";
import { CATEGORY_SEO, SITE, SITE_URL } from "../../../lib/content";
import { getLatestContentDate } from "../../../lib/content-dates";
import { getCategoryResearchReferenceIds } from "../../../lib/research-links";
import {
  CATEGORY_SERVICE_PATHS,
  PUBLIC_PAGE_BY_PATH,
  SERVICE_PAGE_BY_PATH,
  type LessonLandingDefinition,
} from "../../../lib/seo-pages";
import { buildCollectionPageSchema, safeJsonLd } from "../../../lib/structured-data";

const CATEGORY_SERVICE_PATHS_BY_SLUG = CATEGORY_SERVICE_PATHS as Record<string, readonly string[]>;
const BLOG_UPDATED_AT = PUBLIC_PAGE_BY_PATH.get("/blog")!.lastModified;

export const Route = createFileRoute("/blog/$category/")({
  loader: async ({ params }) => {
    const [{ category }, { posts }] = await Promise.all([
      getCategoryBySlug({ data: { slug: params.category } }),
      listPublishedPosts({ data: { category: params.category, limit: 100 } }),
    ]);
    if (!category) throw notFound();
    return { category, posts };
  },
  head: ({ loaderData }) => {
    const data = loaderData as { category: CategoryRow | null; posts: PostRow[] } | undefined;
    const category = data?.category;
    const posts = data?.posts ?? [];
    const name = category?.name ?? "피아노 이야기";
    const seo = category ? CATEGORY_SEO[category.slug] : undefined;
    const heading = seo?.primaryKeyword ?? name;
    const description =
      seo?.metaDescription ||
      category?.description ||
      `${name} 카테고리의 피아노 칼럼 모음. 이화여대 피아노과 선생님의 레슨 노하우.`;
    const url = `${SITE_URL}/blog/${category?.slug ?? ""}`;
    const image = `${SITE_URL}/assets/cat-${category?.slug ?? "lesson-guide"}.jpg`;
    const title = seo ? `${seo.pageTitle} | ${SITE.brand}` : `${name} | ${SITE.brand}`;
    const lastModified = getLatestContentDate(posts, BLOG_UPDATED_AT);
    const servicePaths = category ? (CATEGORY_SERVICE_PATHS_BY_SLUG[category.slug] ?? []) : [];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "robots",
          content:
            posts.length > 0
              ? "index, follow, max-image-preview:large"
              : "noindex, follow, max-image-preview:large",
        },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: `${heading} 대표 이미지` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: safeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              buildCollectionPageSchema({
                name: heading,
                description,
                url,
                image,
                items: posts.map((post) => ({
                  name: post.title,
                  path: `/blog/${category?.slug ?? ""}/${post.slug}`,
                  image: post.cover_image,
                })),
                dateModified: lastModified,
                authorId: `${SITE_URL}/about#person`,
                publisherId: `${SITE_URL}/#business`,
                aboutIds: servicePaths.map((path) => `${SITE_URL}${path}#service`),
              }),
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
                  { "@type": "ListItem", position: 3, name: heading, item: url },
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

  const seo = CATEGORY_SEO[category.slug];
  const heading = seo?.primaryKeyword ?? category.name;
  const servicePages = (CATEGORY_SERVICE_PATHS_BY_SLUG[category.slug] ?? [])
    .map((path) => SERVICE_PAGE_BY_PATH.get(path))
    .filter((page): page is LessonLandingDefinition => Boolean(page));
  const researchReferenceIds = getCategoryResearchReferenceIds(category.slug);
  const lastModified = getLatestContentDate(posts, BLOG_UPDATED_AT);

  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">
            홈
          </a>
          <span className="mx-2">/</span>
          <a href="/blog" className="hover:text-mute">
            피아노 이야기
          </a>
          <span className="mx-2">/</span>
          <span className="text-mute">{heading}</span>
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
              {heading}
            </h1>
            <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ivory/80 md:text-base">
              {seo?.intro ?? category.description}
            </p>
          </div>
        </div>

        {seo && (
          <PageAuthorityRecord
            className="mt-10"
            title={`${heading} 허브 편집 기준`}
            answer={`${heading}에 관한 공개 글 ${posts.length}편을 한곳에서 비교하고, 각 글의 실행 기준과 연결된 레슨 안내를 확인할 수 있습니다.`}
            audience={seo.audience}
            scope={seo.editorialRule}
            boundary={seo.exclusionRule}
            lastModified={lastModified}
          />
        )}

        <div className="mt-14">
          {servicePages.length > 0 && (
            <section
              className="mb-12 border border-line bg-ebony-2 p-6 md:p-8"
              aria-labelledby="cluster-service-title"
            >
              <h2 id="cluster-service-title" className="font-serif-kr text-2xl font-semibold">
                이 주제와 연결된 레슨 안내
              </h2>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {servicePages.map((page) => (
                  <a
                    key={page.path}
                    href={page.path}
                    className="text-brass underline underline-offset-8 transition-colors hover:text-ivory"
                  >
                    {page.primaryKeyword}
                  </a>
                ))}
              </div>
            </section>
          )}
          {researchReferenceIds.length > 0 && (
            <ResearchReferencePanel
              references={researchReferenceIds}
              heading={`${heading} 글을 읽을 때 참고할 공식 데이터`}
              className="mb-12"
            />
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
