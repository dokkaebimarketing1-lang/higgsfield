import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { D1Database } from "@cloudflare/workers-types";

import { bindings } from "../bindings.server";

/* ── Types ─────────────────────────────────────────────── */
export type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category_id: number | null;
  category_slug?: string | null;
  category_name?: string | null;
  tags: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  status: string;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  post_count?: number;
};

const LIST_SELECT = `
  SELECT p.id, p.slug, p.title, p.excerpt, p.body, p.category_id, p.tags, p.cover_image,
         p.meta_title, p.meta_description,
         p.status, p.reading_minutes, p.published_at, p.created_at, p.updated_at,
         c.slug AS category_slug, c.name AS category_name
  FROM posts p LEFT JOIN categories c ON c.id = p.category_id
`;

function estimateReadingMinutes(body: string): number {
  const chars = body.replace(/\s/g, "").length;
  return Math.max(2, Math.round(chars / 450));
}

async function uniqueSlug(DB: D1Database, base: string, excludeId?: number) {
  let slug = base || `post-${Date.now()}`;
  for (let i = 2; i < 50; i += 1) {
    const row = excludeId
      ? await DB.prepare("SELECT id FROM posts WHERE slug = ? AND id != ?")
          .bind(slug, excludeId)
          .first()
      : await DB.prepare("SELECT id FROM posts WHERE slug = ?").bind(slug).first();
    if (!row) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

function requireAdmin(passcode: string) {
  const { ADMIN_PASSCODE } = bindings();
  if (!ADMIN_PASSCODE || passcode !== ADMIN_PASSCODE) {
    throw new Error("비밀번호가 올바르지 않습니다.");
  }
}

/* ── Public queries ────────────────────────────────────── */
export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ categories: CategoryRow[] }> => {
    const { DB } = bindings();
    if (!DB) return { categories: [] };
    const { results } = await DB.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id AND p.status = 'published') AS post_count
       FROM categories c ORDER BY c.sort_order ASC`,
    ).all<CategoryRow>();
    return { categories: results ?? [] };
  },
);

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({
        category: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .optional(),
  )
  .handler(async ({ data }): Promise<{ posts: PostRow[] }> => {
    const { DB } = bindings();
    if (!DB) return { posts: [] };
    const limit = data?.limit ?? 50;
    if (data?.category) {
      const { results } = await DB.prepare(
        `${LIST_SELECT} WHERE p.status = 'published' AND c.slug = ?
         ORDER BY p.published_at DESC LIMIT ?`,
      )
        .bind(data.category, limit)
        .all<PostRow>();
      return { posts: results ?? [] };
    }
    const { results } = await DB.prepare(
      `${LIST_SELECT} WHERE p.status = 'published' ORDER BY p.published_at DESC LIMIT ?`,
    )
      .bind(limit)
      .all<PostRow>();
    return { posts: results ?? [] };
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ category: z.string().min(1), slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ post: PostRow | null }> => {
    const { DB } = bindings();
    if (!DB) return { post: null };
    const post = await DB.prepare(
      `${LIST_SELECT} WHERE p.status = 'published' AND p.slug = ? AND c.slug = ? LIMIT 1`,
    )
      .bind(data.slug, data.category)
      .first<PostRow>();
    return { post: post ?? null };
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ category: CategoryRow | null }> => {
    const { DB } = bindings();
    if (!DB) return { category: null };
    const category = await DB.prepare(
      "SELECT id, slug, name, description, sort_order FROM categories WHERE slug = ? LIMIT 1",
    )
      .bind(data.slug)
      .first<CategoryRow>();
    return { category: category ?? null };
  });

export const listRelatedPosts = createServerFn({ method: "GET" })
  .inputValidator(z.object({ categoryId: z.number().int(), excludeId: z.number().int() }))
  .handler(async ({ data }): Promise<{ posts: PostRow[] }> => {
    const { DB } = bindings();
    if (!DB) return { posts: [] };
    const { results } = await DB.prepare(
      `${LIST_SELECT} WHERE p.status = 'published' AND p.category_id = ? AND p.id != ?
       ORDER BY p.published_at DESC LIMIT 3`,
    )
      .bind(data.categoryId, data.excludeId)
      .all<PostRow>();
    return { posts: results ?? [] };
  });

export const listSitemapEntries = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    posts: { slug: string; category_slug: string | null; updated_at: string; published_at: string | null }[];
  }> => {
    const { DB } = bindings();
    if (!DB) return { posts: [] };
    const { results } = await DB.prepare(
      `SELECT p.slug, c.slug AS category_slug, p.updated_at, p.published_at
       FROM posts p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'published' ORDER BY p.published_at DESC`,
    ).all<{ slug: string; category_slug: string | null; updated_at: string; published_at: string | null }>();
    return { posts: results ?? [] };
  },
);

/* ── Admin: post CRUD ──────────────────────────────────── */
export const adminListPosts = createServerFn({ method: "POST" })
  .inputValidator(z.object({ passcode: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ posts: PostRow[] }> => {
    requireAdmin(data.passcode);
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const { results } = await DB.prepare(
      `${LIST_SELECT} ORDER BY p.updated_at DESC LIMIT 500`,
    ).all<PostRow>();
    return { posts: results ?? [] };
  });

export const adminGetPost = createServerFn({ method: "POST" })
  .inputValidator(z.object({ passcode: z.string().min(1), id: z.number().int() }))
  .handler(async ({ data }): Promise<{ post: PostRow | null }> => {
    requireAdmin(data.passcode);
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const post = await DB.prepare(`${LIST_SELECT} WHERE p.id = ? LIMIT 1`)
      .bind(data.id)
      .first<PostRow>();
    return { post: post ?? null };
  });

const postInput = z.object({
  passcode: z.string().min(1),
  title: z.string().trim().min(1, "제목을 입력해 주세요").max(200),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9-]*$/, "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다")
    .default(""),
  excerpt: z.string().trim().max(300).default(""),
  body: z.string().min(1, "본문을 입력해 주세요"),
  categoryId: z.number().int().nullable().default(null),
  tags: z.string().trim().max(200).default(""),
  coverImage: z.string().trim().max(500).default(""),
  metaTitle: z.string().trim().max(200).default(""),
  metaDescription: z.string().trim().max(300).default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const createPost = createServerFn({ method: "POST" })
  .inputValidator(postInput)
  .handler(async ({ data }): Promise<{ id: number; slug: string }> => {
    requireAdmin(data.passcode);
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const base = data.slug || `post-${Date.now().toString(36)}`;
    const slug = await uniqueSlug(DB, base);
    const reading = estimateReadingMinutes(data.body);
    const publishedAt = data.status === "published" ? new Date().toISOString() : null;
    const res = await DB.prepare(
      `INSERT INTO posts (slug, title, excerpt, body, category_id, tags, cover_image,
        meta_title, meta_description, status, reading_minutes, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        slug,
        data.title,
        data.excerpt,
        data.body,
        data.categoryId,
        data.tags,
        data.coverImage,
        data.metaTitle,
        data.metaDescription,
        data.status,
        reading,
        publishedAt,
      )
      .run();
    return { id: Number(res.meta.last_row_id), slug };
  });

export const updatePost = createServerFn({ method: "POST" })
  .inputValidator(postInput.extend({ id: z.number().int() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    requireAdmin(data.passcode);
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const existing = await DB.prepare("SELECT status, published_at FROM posts WHERE id = ?")
      .bind(data.id)
      .first<{ status: string; published_at: string | null }>();
    if (!existing) throw new Error("글을 찾을 수 없습니다.");
    const slug = data.slug
      ? await uniqueSlug(DB, data.slug, data.id)
      : (await DB.prepare("SELECT slug FROM posts WHERE id = ?").bind(data.id).first<{ slug: string }>())!.slug;
    const reading = estimateReadingMinutes(data.body);
    const publishedAt =
      data.status === "published"
        ? existing.published_at ?? new Date().toISOString()
        : null;
    await DB.prepare(
      `UPDATE posts SET slug = ?, title = ?, excerpt = ?, body = ?, category_id = ?,
        tags = ?, cover_image = ?, meta_title = ?, meta_description = ?, status = ?,
        reading_minutes = ?, published_at = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(
        slug,
        data.title,
        data.excerpt,
        data.body,
        data.categoryId,
        data.tags,
        data.coverImage,
        data.metaTitle,
        data.metaDescription,
        data.status,
        reading,
        publishedAt,
        data.id,
      )
      .run();
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .inputValidator(z.object({ passcode: z.string().min(1), id: z.number().int() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    requireAdmin(data.passcode);
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    await DB.prepare("DELETE FROM posts WHERE id = ?").bind(data.id).run();
    return { ok: true };
  });

/* ── Admin: image upload to R2 ─────────────────────────── */
export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      passcode: z.string().min(1),
      filename: z.string().min(1).max(200),
      contentType: z
        .string()
        .regex(/^image\/(png|jpeg|webp|gif)$/, "PNG, JPG, WebP, GIF 이미지만 업로드할 수 있습니다"),
      dataBase64: z.string().max(14_000_000, "이미지는 10MB 이하여야 합니다"),
    }),
  )
  .handler(async ({ data }): Promise<{ url: string }> => {
    requireAdmin(data.passcode);
    const { STORAGE } = bindings();
    if (!STORAGE) throw new Error("이미지 저장소가 연결되어 있지 않습니다.");
    const ext = data.filename.split(".").pop()?.toLowerCase() ?? "bin";
    const key = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    await STORAGE.put(key, bytes, {
      httpMetadata: { contentType: data.contentType },
    });
    return { url: `/media/${key}` };
  });
