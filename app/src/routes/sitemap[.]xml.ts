import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";
import {
  PUBLIC_POST_STATE_SQL,
  PUBLIC_POST_WITH_CATEGORY_SQL,
} from "../lib/blog-publication-policy";
import { CATEGORY_SEO } from "../lib/content";
import { buildSitemapXml, toCanonicalUrl, type SitemapUrlEntry } from "../lib/seo";
import { PUBLIC_PAGES } from "../lib/seo-pages";

function sitemapDate(value: string | null | undefined): string | undefined {
  const date = value?.slice(0, 10);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

function latestDate(
  posts: { updated_at: string }[],
  limit: number = posts.length,
): string | undefined {
  return posts
    .slice(0, limit)
    .map((post) => sitemapDate(post.updated_at))
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
}

function sitemapUnavailableResponse(): Response {
  return new Response("Sitemap is temporarily unavailable.", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "60",
    },
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { DB } = bindings();
        if (!DB) return sitemapUnavailableResponse();

        const entries: SitemapUrlEntry[] = PUBLIC_PAGES.map((page) => ({
          path: page.path,
          lastmod: page.lastModified,
          images: [page.image],
        }));

        try {
          const { results: categories } = await DB.prepare(
            `SELECT c.slug, MAX(p.updated_at) AS updated_at
             FROM categories c
             LEFT JOIN posts p ON p.category_id = c.id AND ${PUBLIC_POST_STATE_SQL}
             GROUP BY c.id, c.slug, c.sort_order
             HAVING COUNT(p.id) > 0
             ORDER BY c.sort_order ASC`,
          ).all<{ slug: string; updated_at: string | null }>();
          for (const c of categories ?? []) {
            const categoryImage = CATEGORY_SEO[c.slug]
              ? toCanonicalUrl(`/assets/cat-${c.slug}.jpg`)
              : undefined;
            entries.push({
              path: `/blog/${c.slug}`,
              lastmod: sitemapDate(c.updated_at),
              images: categoryImage ? [categoryImage] : undefined,
            });
          }
          const { results: posts } = await DB.prepare(
            `SELECT p.slug, c.slug AS category_slug, p.updated_at, p.cover_image
             FROM posts p LEFT JOIN categories c ON c.id = p.category_id
             WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL}
             ORDER BY p.published_at DESC`,
          ).all<{
            slug: string;
            category_slug: string;
            updated_at: string;
            cover_image: string | null;
          }>();
          for (const p of posts ?? []) {
            entries.push({
              path: `/blog/${p.category_slug}/${p.slug}`,
              lastmod: sitemapDate(p.updated_at),
              images: p.cover_image ? [toCanonicalUrl(p.cover_image)] : undefined,
            });
          }

          const homeLastmod = latestDate(posts ?? [], 3);
          const blogLastmod = latestDate(posts ?? [], 50);
          const sitemapLastmod = latestDate(posts ?? [], 100);
          for (const entry of entries) {
            if (entry.path === "/") entry.lastmod = homeLastmod;
            if (entry.path === "/blog") entry.lastmod = blogLastmod;
            if (entry.path === "/sitemap") entry.lastmod = sitemapLastmod;
          }
        } catch (error) {
          console.error("[sitemap] Failed to load published content", error);
          return sitemapUnavailableResponse();
        }

        const xml = buildSitemapXml(entries);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
