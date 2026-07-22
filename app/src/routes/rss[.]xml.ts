import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";
import { PUBLIC_POST_WITH_CATEGORY_SQL } from "../lib/blog-publication-policy";
import { buildRssXml, rssUnavailableResponse, type RssFeedPost } from "../lib/feed";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { DB } = bindings();
        if (!DB) return rssUnavailableResponse();

        try {
          const { results } = await DB.prepare(
            `SELECT p.title, p.slug, p.excerpt, p.published_at, p.updated_at, p.cover_image,
                    p.cover_alt,
                    c.slug AS category_slug, c.name AS category_name
             FROM posts p LEFT JOIN categories c ON c.id = p.category_id
             WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL}
             ORDER BY p.published_at DESC LIMIT 50`,
          ).all<RssFeedPost>();
          const xml = buildRssXml(results ?? []);

          return new Response(xml, {
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
              "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
            },
          });
        } catch (error) {
          console.error("[rss] Failed to load published posts", error);
          return rssUnavailableResponse();
        }
      },
    },
  },
});
