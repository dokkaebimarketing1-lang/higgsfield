import { SITE, SITE_URL } from "./content";
import { escapeXml, toCanonicalUrl, toIsoDate } from "./seo";

export type RssFeedPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string | null;
  category_slug: string;
  category_name: string | null;
  cover_image: string | null;
  cover_alt: string | null;
};

function publicationDate(value: string | null): Date | null {
  const isoDate = toIsoDate(value);
  return isoDate ? new Date(isoDate) : null;
}

function postUrl(post: RssFeedPost): string {
  const category = encodeURIComponent(post.category_slug);
  const slug = encodeURIComponent(post.slug);
  return toCanonicalUrl(`/blog/${category}/${slug}`);
}

export function buildRssXml(posts: readonly RssFeedPost[], generatedAt = new Date()): string {
  const datedPosts = posts
    .map((post) => ({
      post,
      date: publicationDate(post.updated_at) ?? publicationDate(post.published_at),
    }))
    .filter((entry): entry is { post: RssFeedPost; date: Date } => Boolean(entry.date));
  const latestPublication = datedPosts.reduce<Date | null>(
    (latest, entry) => (!latest || entry.date > latest ? entry.date : latest),
    null,
  );
  const lastBuildDate = latestPublication ?? generatedAt;

  const items = posts.map((post) => {
    const url = postUrl(post);
    const publishedAt = publicationDate(post.published_at);
    const imageUrl = post.cover_image ? toCanonicalUrl(post.cover_image) : null;
    const category = post.category_name?.trim();

    return [
      "  <item>",
      `    <title>${escapeXml(post.title)}</title>`,
      `    <link>${escapeXml(url)}</link>`,
      `    <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `    <description>${escapeXml(post.excerpt?.trim() || post.title)}</description>`,
      publishedAt ? `    <pubDate>${publishedAt.toUTCString()}</pubDate>` : null,
      category ? `    <category>${escapeXml(category)}</category>` : null,
      `    <dc:creator>${escapeXml(SITE.about.name)}</dc:creator>`,
      imageUrl ? `    <media:content url="${escapeXml(imageUrl)}" medium="image" />` : null,
      imageUrl ? `    <media:thumbnail url="${escapeXml(imageUrl)}" />` : null,
      imageUrl
        ? `    <media:description>${escapeXml(post.cover_alt?.trim() || post.title)}</media:description>`
        : null,
      "  </item>",
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    "<channel>",
    `  <title>${escapeXml(`${SITE.brand} | 피아노 이야기`)}</title>`,
    `  <link>${escapeXml(`${SITE_URL}/blog`)}</link>`,
    `  <description>${escapeXml(SITE.description)}</description>`,
    "  <language>ko-KR</language>",
    `  <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`,
    `  <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");
}

export function rssUnavailableResponse(): Response {
  return new Response("RSS feed is temporarily unavailable.", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "60",
    },
  });
}
