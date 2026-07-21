import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";
import { SITE } from "../lib/content";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { DB } = bindings();
        let items = "";
        if (DB) {
          const { results } = await DB.prepare(
            `SELECT p.title, p.slug, p.excerpt, p.published_at, c.slug AS category_slug
             FROM posts p LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.status = 'published' AND c.slug IS NOT NULL
             ORDER BY p.published_at DESC LIMIT 50`,
          ).all<{
            title: string;
            slug: string;
            excerpt: string;
            published_at: string | null;
            category_slug: string;
          }>();
          items = (results ?? [])
            .map((p) => {
              const link = `${origin}/blog/${p.category_slug}/${p.slug}`;
              return [
                "  <item>",
                `    <title>${escapeXml(p.title)}</title>`,
                `    <link>${link}</link>`,
                `    <guid isPermaLink="true">${link}</guid>`,
                p.published_at
                  ? `    <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>`
                  : null,
                `    <description>${escapeXml(p.excerpt || p.title)}</description>`,
                "  </item>",
              ]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n");
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<rss version="2.0">',
          "<channel>",
          `  <title>${escapeXml(SITE.brand)} | 피아노 이야기</title>`,
          `  <link>${origin}/blog</link>`,
          `  <description>${escapeXml(SITE.description)}</description>`,
          "  <language>ko</language>",
          items,
          "</channel>",
          "</rss>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
