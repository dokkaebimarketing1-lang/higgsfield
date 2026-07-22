import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { D1Database } from "@cloudflare/workers-types";

import { requireAdmin } from "../auth.server";
import { bindings } from "../bindings.server";
import { getKeywordAlignmentIssues } from "../seo";

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
  .validator(
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
  .validator(z.object({ category: z.string().min(1), slug: z.string().min(1) }))
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
  .validator(z.object({ slug: z.string().min(1) }))
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
  .validator(z.object({ categoryId: z.number().int(), excludeId: z.number().int() }))
  .handler(async ({ data }): Promise<{ posts: PostRow[] }> => {
    const { DB } = bindings();
    if (!DB) return { posts: [] };
    const { results } = await DB.prepare(
      `${LIST_SELECT} WHERE p.status = 'published' AND p.category_id = ? AND p.id != ?
       ORDER BY ABS(p.id - ?) ASC, p.published_at DESC LIMIT 3`,
    )
      .bind(data.categoryId, data.excludeId, data.excludeId)
      .all<PostRow>();
    return { posts: results ?? [] };
  });

export const listSitemapEntries = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    posts: {
      slug: string;
      category_slug: string | null;
      updated_at: string;
      published_at: string | null;
    }[];
  }> => {
    const { DB } = bindings();
    if (!DB) return { posts: [] };
    const { results } = await DB.prepare(
      `SELECT p.slug, c.slug AS category_slug, p.updated_at, p.published_at
       FROM posts p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'published' ORDER BY p.published_at DESC`,
    ).all<{
      slug: string;
      category_slug: string | null;
      updated_at: string;
      published_at: string | null;
    }>();
    return { posts: results ?? [] };
  },
);

/* ── Admin: post CRUD ──────────────────────────────────── */
export const adminListPosts = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ posts: PostRow[] }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const { results } = await DB.prepare(
      `${LIST_SELECT} ORDER BY p.updated_at DESC LIMIT 500`,
    ).all<PostRow>();
    return { posts: results ?? [] };
  },
);

export const adminGetPost = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }): Promise<{ post: PostRow | null }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const post = await DB.prepare(`${LIST_SELECT} WHERE p.id = ? LIMIT 1`)
      .bind(data.id)
      .first<PostRow>();
    return { post: post ?? null };
  });

const postInput = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (data.status !== "published") return;
    for (const issue of getKeywordAlignmentIssues(data)) {
      ctx.addIssue({ code: "custom", path: [issue.field], message: issue.message });
    }
  });

export const createPost = createServerFn({ method: "POST" })
  .validator(postInput)
  .handler(async ({ data }): Promise<{ id: number; slug: string }> => {
    await requireAdmin();
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
  .validator(postInput.extend({ id: z.number().int().positive() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    const existing = await DB.prepare("SELECT status, published_at FROM posts WHERE id = ?")
      .bind(data.id)
      .first<{ status: string; published_at: string | null }>();
    if (!existing) throw new Error("글을 찾을 수 없습니다.");
    const slug = data.slug
      ? await uniqueSlug(DB, data.slug, data.id)
      : (await DB.prepare("SELECT slug FROM posts WHERE id = ?")
          .bind(data.id)
          .first<{ slug: string }>())!.slug;
    const reading = estimateReadingMinutes(data.body);
    const publishedAt =
      data.status === "published" ? (existing.published_at ?? new Date().toISOString()) : null;
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
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    await DB.prepare("DELETE FROM posts WHERE id = ?").bind(data.id).run();
    return { ok: true };
  });

/* ── Admin: image upload to R2 ─────────────────────────── */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function hasBytes(bytes: Uint8Array, offset: number, expected: number[]): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function matchesImageSignature(contentType: string, bytes: Uint8Array): boolean {
  switch (contentType) {
    case "image/jpeg":
      return bytes.length >= 3 && hasBytes(bytes, 0, [0xff, 0xd8, 0xff]);
    case "image/png":
      return (
        bytes.length >= 8 && hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
    case "image/webp":
      return (
        bytes.length >= 12 &&
        hasBytes(bytes, 0, [0x52, 0x49, 0x46, 0x46]) &&
        hasBytes(bytes, 8, [0x57, 0x45, 0x42, 0x50])
      );
    case "image/gif":
      return (
        bytes.length >= 6 &&
        (hasBytes(bytes, 0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
          hasBytes(bytes, 0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))
      );
    default:
      return false;
  }
}

export const uploadImage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      contentType: z
        .string()
        .regex(/^image\/(png|jpeg|webp|gif)$/, "PNG, JPG, WebP, GIF 이미지만 업로드할 수 있습니다"),
      dataBase64: z.string().min(1).max(14_000_000, "이미지는 10MB 이하여야 합니다"),
    }),
  )
  .handler(async ({ data }): Promise<{ url: string }> => {
    await requireAdmin();
    const { STORAGE } = bindings();
    if (!STORAGE) throw new Error("이미지 저장소가 연결되어 있지 않습니다.");

    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(atob(data.dataBase64), (character) => character.charCodeAt(0));
    } catch {
      throw new Error("이미지 데이터를 확인해 주세요.");
    }
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw new Error("이미지는 10MB 이하여야 합니다.");
    }
    if (!matchesImageSignature(data.contentType, bytes)) {
      throw new Error("파일 형식과 이미지 내용이 일치하지 않습니다.");
    }

    const extension = imageExtensions[data.contentType];
    if (!extension) throw new Error("지원하지 않는 이미지 형식입니다.");
    const key = `covers/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    await STORAGE.put(key, bytes, {
      httpMetadata: { contentType: data.contentType },
    });
    return { url: `/media/${key}` };
  });
