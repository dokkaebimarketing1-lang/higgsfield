import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
};

const STATIC_ROUTES: UrlEntry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/blog", changefreq: "daily", priority: "0.9" },
  { loc: "/sitemap", changefreq: "monthly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const entries: UrlEntry[] = [...STATIC_ROUTES];
        const { DB } = bindings();

        if (DB) {
          const { results: categories } = await DB.prepare(
            "SELECT slug FROM categories ORDER BY sort_order ASC",
          ).all<{ slug: string }>();
          for (const c of categories ?? []) {
            entries.push({
              loc: `/blog/${c.slug}`,
              changefreq: "weekly",
              priority: "0.7",
            });
          }
          const { results: posts } = await DB.prepare(
            `SELECT p.slug, c.slug AS category_slug, p.updated_at
             FROM posts p LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.status = 'published' AND c.slug IS NOT NULL
             ORDER BY p.published_at DESC`,
          ).all<{ slug: string; category_slug: string; updated_at: string }>();
          for (const p of posts ?? []) {
            entries.push({
              loc: `/blog/${p.category_slug}/${p.slug}`,
              lastmod: p.updated_at?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries.map((e) =>
            [
              "  <url>",
              `    <loc>${origin}${e.loc}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              "  </url>",
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          "</urlset>",
        ].join("\n");

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
