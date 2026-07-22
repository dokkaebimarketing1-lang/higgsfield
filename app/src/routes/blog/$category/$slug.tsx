import { createFileRoute, notFound } from "@tanstack/react-router";

import { SubPageShell } from "../../../components/site/chrome";
import { getPostBySlug, listRelatedPosts, type PostRow } from "../../../lib/api/posts.functions";
import { SITE, SITE_URL } from "../../../lib/content";
import { extractFaq } from "../../../lib/faq";
import { renderMarkdown } from "../../../lib/markdown";
import { extractExternalLinks, toCanonicalUrl, toIsoDate } from "../../../lib/seo";
import { getServicePageForPost } from "../../../lib/seo-pages";

const FALLBACK_OG =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_34g8tGWyYG4JUcCJYEK7ikRiSGl/3ac1a2a4-c77e-49fc-ac0b-b721b1430517.png";

export const Route = createFileRoute("/blog/$category/$slug")({
  loader: async ({ params }) => {
    const { post } = await getPostBySlug({
      data: { category: params.category, slug: params.slug },
    });
    if (!post) throw notFound();
    const related = post?.category_id
      ? (
          await listRelatedPosts({
            data: {
              categoryId: post.category_id,
              keywordCluster: post.keyword_cluster,
              excludeId: post.id,
            },
          })
        ).posts
      : [];
    return { post, related };
  },
  head: ({ loaderData }) => {
    const data = loaderData as { post: PostRow | null } | undefined;
    const post = data?.post ?? null;
    if (!post) {
      return {
        meta: [{ title: `글을 찾을 수 없습니다 | ${SITE.brand}` }],
      };
    }
    const title = post.meta_title || `${post.title} | ${SITE.brand}`;
    const description = post.meta_description || post.excerpt || SITE.description;
    const url = `${SITE_URL}/blog/${post.category_slug}/${post.slug}`;
    const image = post.cover_image ? toCanonicalUrl(post.cover_image) : FALLBACK_OG;
    const faqItems = extractFaq(post.body);
    const citations = extractExternalLinks(post.body);
    const datePublished = toIsoDate(post.published_at);
    const rawModified = toIsoDate(post.updated_at);
    const dateModified =
      datePublished && rawModified && rawModified < datePublished
        ? datePublished
        : (rawModified ?? datePublished);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "author", content: "김서연" },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: post.title },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        ...(datePublished ? [{ property: "article:published_time", content: datePublished }] : []),
        ...(dateModified ? [{ property: "article:modified_time", content: dateModified }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                "@id": `${url}#article`,
                headline: post.title,
                description,
                ...(post.excerpt ? { abstract: post.excerpt } : {}),
                url,
                mainEntityOfPage: url,
                image,
                inLanguage: "ko",
                ...(datePublished ? { datePublished } : {}),
                ...(dateModified ? { dateModified } : {}),
                author: { "@id": `${SITE_URL}/about#person` },
                publisher: { "@id": `${SITE_URL}/#business` },
                isPartOf: { "@id": `${SITE_URL}/#website` },
                ...(post.category_name ? { articleSection: post.category_name } : {}),
                ...(citations.length > 0 ? { citation: citations } : {}),
                ...(post.tags
                  ? {
                      keywords: post.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .join(", "),
                    }
                  : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "홈",
                    item: `${SITE_URL}/`,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 이야기",
                    item: `${SITE_URL}/blog`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: post.category_name ?? "칼럼",
                    item: `${SITE_URL}/blog/${post.category_slug}`,
                  },
                  { "@type": "ListItem", position: 4, name: post.title, item: url },
                ],
              },
              ...(faqItems.length > 0
                ? [
                    {
                      "@type": "FAQPage",
                      "@id": `${url}#faq`,
                      mainEntity: faqItems.map((f) => ({
                        "@type": "Question",
                        name: f.q,
                        acceptedAnswer: { "@type": "Answer", text: f.a },
                      })),
                    },
                  ]
                : []),
            ],
          }),
        },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, related } = Route.useLoaderData() as {
    post: PostRow | null;
    related: PostRow[];
  };

  if (!post) {
    return (
      <SubPageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-serif-kr text-3xl font-bold">글을 찾을 수 없습니다</h1>
          <p className="mt-4 text-mute">삭제되었거나 아직 발행되지 않은 글입니다.</p>
          <a href="/blog" className="mt-6 inline-block text-brass underline underline-offset-8">
            피아노 이야기로 돌아가기
          </a>
        </div>
      </SubPageShell>
    );
  }

  const html = renderMarkdown(post.body);
  const servicePage = getServicePageForPost(post.keyword_cluster, post.slug);

  return (
    <SubPageShell>
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">
            홈
          </a>
          <span className="mx-2">/</span>
          <a href="/blog" className="hover:text-mute">
            피아노 이야기
          </a>
          <span className="mx-2">/</span>
          <a href={`/blog/${post.category_slug}`} className="hover:text-mute">
            {post.category_name}
          </a>
        </nav>

        <h1 className="mt-8 font-serif-kr text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-faint">
          <span>{post.category_name}</span>
          {post.published_at && (
            <time dateTime={toIsoDate(post.published_at)}>
              {post.published_at.slice(0, 10)} 발행
            </time>
          )}
          {post.updated_at && post.updated_at.slice(0, 10) !== post.published_at?.slice(0, 10) && (
            <time dateTime={toIsoDate(post.updated_at)}>{post.updated_at.slice(0, 10)} 수정</time>
          )}
          <span>{post.reading_minutes}분 읽기</span>
        </p>

        {post.excerpt && (
          <div className="mt-8 border-l-2 border-brass bg-ebony-2 p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-brass">한눈에 보기</p>
            <p className="mt-2 font-serif-kr text-lg leading-relaxed text-ivory">{post.excerpt}</p>
          </div>
        )}

        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            width={1600}
            height={900}
            className="mt-10 aspect-[16/9] w-full object-cover"
          />
        )}

        <div className="prose-ewha mt-12" dangerouslySetInnerHTML={{ __html: html }} />

        {servicePage && (
          <section
            className="mt-14 border border-line bg-ebony-2 p-7 md:p-9"
            aria-labelledby="related-lesson-title"
          >
            <h2 id="related-lesson-title" className="font-serif-kr text-2xl font-semibold">
              {servicePage.primaryKeyword} 안내
            </h2>
            <p className="mt-3 max-w-[58ch] leading-relaxed text-mute">
              이 글의 내용을 실제 수업 목표에 맞춰 적용하고 싶다면 수업 방식, 대상과 진행 과정을
              먼저 확인해 보세요.
            </p>
            <a
              href={servicePage.path}
              className="mt-5 inline-block text-brass underline underline-offset-8 transition-colors hover:text-ivory"
            >
              {servicePage.primaryKeyword} 자세히 보기
            </a>
          </section>
        )}

        <div className="mt-16 flex items-center gap-5 border border-line bg-ebony-2 p-6">
          <img
            src="/assets/portrait.jpg"
            alt="피아노 앞에 앉은 피아노 연주자"
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <p className="text-xs text-faint">글쓴이</p>
            <a
              href="/about"
              className="mt-1 block font-serif-kr text-lg font-semibold transition-colors hover:text-brass"
            >
              김서연
            </a>
            <p className="mt-1 text-sm text-mute">
              이화여자대학교 피아노과 재학. 1:1 맞춤 레슨을 하고 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-14 border border-brass/40 bg-ebony-2 p-8 text-center md:p-10">
          <p className="font-serif-kr text-2xl font-semibold md:text-3xl">피아노, 시작해 볼까요?</p>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-mute md:text-base">
            첫 상담과 30분 체험 레슨은 무료입니다. 서울 서대문구·마포구 방문 레슨, 그 외 지역은
            온라인으로 만나요.
          </p>
          <a
            href="/#contact"
            className="mt-6 inline-block bg-brass px-7 py-3.5 font-serif-kr text-lg font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99]"
          >
            상담 신청하기
          </a>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif-kr text-2xl font-bold">함께 읽으면 좋은 글</h2>
            <div className="mt-6">
              {related.map((r) => (
                <a
                  key={r.id}
                  href={`/blog/${r.category_slug}/${r.slug}`}
                  className="group flex items-baseline justify-between gap-6 border-b border-line py-5 first:border-t"
                >
                  <span className="font-serif-kr text-lg font-semibold transition-colors group-hover:text-brass">
                    {r.title}
                  </span>
                  <span className="shrink-0 text-sm text-faint">{r.reading_minutes}분</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </SubPageShell>
  );
}
