// Public content queries use these fragments so the blog, related links,
// inventories, sitemap, RSS, and llms.txt agree on what is publishable.
// The aliases are intentionally fixed to `posts p` and `categories c`.
export const PUBLIC_POST_STATE_SQL = "p.status = 'published' AND p.published_at IS NOT NULL";

export const PUBLIC_POST_WITH_CATEGORY_SQL = `${PUBLIC_POST_STATE_SQL} AND c.slug IS NOT NULL`;

export function preserveFirstPublishedAt(
  existing: string | null,
  nextStatus: "draft" | "published",
  publishedNow: string,
): string | null {
  return existing ?? (nextStatus === "published" ? publishedNow : null);
}
