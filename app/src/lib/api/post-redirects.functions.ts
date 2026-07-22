import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { PUBLIC_POST_STATE_SQL } from "../blog-publication-policy";
import { getPostRedirectPath } from "../post-redirects";

export { getPostRedirectPath } from "../post-redirects";

export type PostRedirectTarget = {
  category_slug: string;
  post_slug: string;
};

export const POST_REDIRECT_LOOKUP_SQL = `
  SELECT c.slug AS category_slug, p.slug AS post_slug
  FROM post_redirects r
  INNER JOIN posts p ON p.id = r.post_id
  INNER JOIN categories c ON c.id = p.category_id
  WHERE r.old_category_slug = ?
    AND r.old_post_slug = ?
    AND ${PUBLIC_POST_STATE_SQL}
    AND NOT (c.slug = r.old_category_slug AND p.slug = r.old_post_slug)
  LIMIT 1
`;

export const resolvePostRedirect = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().min(1), slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ path: string | null }> => {
    const { DB } = bindings();
    if (!DB) return { path: null };

    const target = await DB.prepare(POST_REDIRECT_LOOKUP_SQL)
      .bind(data.category, data.slug)
      .first<PostRedirectTarget>();

    return {
      path: getPostRedirectPath(
        target ? { categorySlug: target.category_slug, postSlug: target.post_slug } : null,
      ),
    };
  });
