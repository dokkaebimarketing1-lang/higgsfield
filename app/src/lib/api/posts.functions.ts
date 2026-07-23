import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { D1Database } from "@cloudflare/workers-types";

import { requireAdmin } from "../auth.server";
import { bindings } from "../bindings.server";
import { getBlogPublicationIssues } from "../blog-quality";
import {
  PUBLIC_POST_STATE_SQL,
  PUBLIC_POST_WITH_CATEGORY_SQL,
  preserveFirstPublishedAt,
} from "../blog-publication-policy";
import {
  BLOG_CATEGORY_SLUGS,
  BLOG_POST_KEYWORD_ROLES,
  CATEGORY_SEO,
  getBlogCategoryTaxonomyIssues,
  isBlogCategorySlug,
} from "../content";
import {
  KEYWORD_CLUSTERS,
  KEYWORD_ROLES,
  SEARCH_INTENTS,
  normalizeKeyword,
  type KeywordCluster,
  type KeywordRole,
  type SearchIntent,
} from "../keyword-taxonomy";
import { getKeywordAlignmentIssues, getPrimaryKeyword } from "../seo";
import { PUBLIC_PAGES } from "../seo-pages";
import { getPostRedirectSource } from "../post-redirects";

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
  keyword_role: KeywordRole;
  search_intent: SearchIntent;
  keyword_cluster: KeywordCluster;
  cover_image: string;
  cover_alt: string;
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
         p.cover_alt,
         p.keyword_role, p.search_intent, p.keyword_cluster, p.meta_title, p.meta_description,
         p.status, p.reading_minutes, p.published_at, p.created_at, p.updated_at,
         c.slug AS category_slug, c.name AS category_name
  FROM posts p LEFT JOIN categories c ON c.id = p.category_id
`;

function publicDatabase(): D1Database | null {
  const { DB, HF_ENV } = bindings();
  if (!DB && HF_ENV && HF_ENV !== "dev") {
    throw new Error("공개 콘텐츠 데이터베이스를 사용할 수 없습니다.");
  }
  return DB ?? null;
}

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

async function assertUniquePublishedKeyword(
  DB: D1Database,
  tags: string,
  excludeId?: number,
): Promise<void> {
  const primaryKeyword = getPrimaryKeyword(tags);
  const normalizedKeyword = normalizeKeyword(primaryKeyword);
  if (!normalizedKeyword) return;

  const reservedTarget = [
    ...PUBLIC_PAGES.map((page) => ({ path: page.path, keyword: page.primaryKeyword })),
    ...Object.entries(CATEGORY_SEO).map(([slug, category]) => ({
      path: `/blog/${slug}`,
      keyword: category.primaryKeyword,
    })),
  ].find((target) => normalizeKeyword(target.keyword) === normalizedKeyword);
  if (reservedTarget) {
    throw new Error(
      `대표 목표 키워드 “${primaryKeyword}”는 대표 페이지 “${reservedTarget.path}”에서 이미 사용 중입니다. 이 글에는 검색 의도가 더 구체적인 롱테일 키워드를 지정해 주세요.`,
    );
  }

  const query = excludeId
    ? "SELECT id, title, tags FROM posts WHERE status = 'published' AND id != ?"
    : "SELECT id, title, tags FROM posts WHERE status = 'published'";
  const statement = excludeId ? DB.prepare(query).bind(excludeId) : DB.prepare(query);
  const { results } = await statement.all<{ id: number; title: string; tags: string }>();
  const duplicate = (results ?? []).find(
    (post) => normalizeKeyword(getPrimaryKeyword(post.tags)) === normalizedKeyword,
  );

  if (duplicate) {
    throw new Error(
      `대표 목표 키워드 “${primaryKeyword}”는 발행 글 “${duplicate.title}”에서 이미 사용 중입니다. 한 키워드에는 하나의 대표 URL만 지정해 주세요.`,
    );
  }
}

async function assertBlogCategorySelection(
  DB: D1Database,
  input: {
    categoryId: number | null;
    keywordRole: KeywordRole;
    searchIntent: SearchIntent;
    keywordCluster: KeywordCluster;
  },
): Promise<string | null> {
  if (input.categoryId === null) return null;
  const category = await DB.prepare("SELECT slug FROM categories WHERE id = ? LIMIT 1")
    .bind(input.categoryId)
    .first<{ slug: string }>();
  if (!category || !isBlogCategorySlug(category.slug)) {
    throw new Error("CMS에서 확정한 6개 카테고리 중 하나를 선택해 주세요.");
  }

  const issues = getBlogCategoryTaxonomyIssues({
    categorySlug: category.slug,
    keywordRole: input.keywordRole,
    searchIntent: input.searchIntent,
    keywordCluster: input.keywordCluster,
  });
  if (issues.length > 0) throw new Error(issues.join(" "));
  return category.slug;
}

/* ── Public queries ────────────────────────────────────── */
export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ categories: CategoryRow[] }> => {
    const DB = publicDatabase();
    if (!DB) return { categories: [] };
    const placeholders = BLOG_CATEGORY_SLUGS.map(() => "?").join(", ");
    const { results } = await DB.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id AND ${PUBLIC_POST_STATE_SQL}) AS post_count
       FROM categories c WHERE c.slug IN (${placeholders}) ORDER BY c.sort_order ASC`,
    )
      .bind(...BLOG_CATEGORY_SLUGS)
      .all<CategoryRow>();
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
    const DB = publicDatabase();
    if (!DB) return { posts: [] };
    const limit = data?.limit ?? 50;
    if (data?.category) {
      if (!isBlogCategorySlug(data.category)) return { posts: [] };
      const { results } = await DB.prepare(
        `${LIST_SELECT} WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL} AND c.slug = ?
         ORDER BY p.published_at DESC LIMIT ?`,
      )
        .bind(data.category, limit)
        .all<PostRow>();
      return { posts: results ?? [] };
    }
    const { results } = await DB.prepare(
      `${LIST_SELECT} WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL} ORDER BY p.published_at DESC LIMIT ?`,
    )
      .bind(limit)
      .all<PostRow>();
    return { posts: results ?? [] };
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().min(1), slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ post: PostRow | null }> => {
    const DB = publicDatabase();
    if (!DB) return { post: null };
    if (!isBlogCategorySlug(data.category)) return { post: null };
    const post = await DB.prepare(
      `${LIST_SELECT} WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL} AND p.slug = ? AND c.slug = ? LIMIT 1`,
    )
      .bind(data.slug, data.category)
      .first<PostRow>();
    return { post: post ?? null };
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ category: CategoryRow | null }> => {
    const DB = publicDatabase();
    if (!DB) return { category: null };
    if (!isBlogCategorySlug(data.slug)) return { category: null };
    const category = await DB.prepare(
      "SELECT id, slug, name, description, sort_order FROM categories WHERE slug = ? LIMIT 1",
    )
      .bind(data.slug)
      .first<CategoryRow>();
    return { category: category ?? null };
  });

export const listRelatedPosts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      categoryId: z.number().int(),
      keywordCluster: z.enum(KEYWORD_CLUSTERS),
      excludeId: z.number().int(),
    }),
  )
  .handler(async ({ data }): Promise<{ posts: PostRow[] }> => {
    const DB = publicDatabase();
    if (!DB) return { posts: [] };
    const { results } = await DB.prepare(
      `${LIST_SELECT} WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL} AND p.id != ?
       AND (p.keyword_cluster = ? OR p.category_id = ?)
       ORDER BY CASE WHEN p.keyword_cluster = ? THEN 0 ELSE 1 END,
                CASE WHEN p.category_id = ? THEN 0 ELSE 1 END,
                ABS(p.id - ?) ASC, p.published_at DESC LIMIT 3`,
    )
      .bind(
        data.excludeId,
        data.keywordCluster,
        data.categoryId,
        data.keywordCluster,
        data.categoryId,
        data.excludeId,
      )
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
    const DB = publicDatabase();
    if (!DB) return { posts: [] };
    const { results } = await DB.prepare(
      `SELECT p.slug, c.slug AS category_slug, p.updated_at, p.published_at
       FROM posts p LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${PUBLIC_POST_WITH_CATEGORY_SQL} ORDER BY p.published_at DESC`,
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
    keywordRole: z.enum(KEYWORD_ROLES).default("informational"),
    searchIntent: z.enum(SEARCH_INTENTS).default("informational"),
    keywordCluster: z.enum(KEYWORD_CLUSTERS).default("general"),
    coverImage: z.string().trim().max(500).default(""),
    coverAlt: z.string().trim().max(300).default(""),
    metaTitle: z.string().trim().max(200).default(""),
    metaDescription: z.string().trim().max(300).default(""),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .superRefine((data, ctx) => {
    for (const issue of getBlogPublicationIssues(data)) {
      ctx.addIssue({ code: "custom", path: [issue.field], message: issue.message });
    }
    if (data.status !== "published") return;
    if (data.keywordCluster === "general") {
      ctx.addIssue({
        code: "custom",
        path: ["keywordCluster"],
        message: "발행 글은 미분류가 아닌 키워드 클러스터를 선택해 주세요.",
      });
    }
    if (!(BLOG_POST_KEYWORD_ROLES as readonly KeywordRole[]).includes(data.keywordRole)) {
      ctx.addIssue({
        code: "custom",
        path: ["keywordRole"],
        message:
          "발행 블로그 글은 정보 키워드 또는 대상·지역 롱테일 역할만 사용할 수 있습니다. 메인·전환형 확장 키워드는 고정 서비스 페이지에서 운영합니다.",
      });
    }
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
    await assertBlogCategorySelection(DB, data);
    if (data.status === "published") {
      await assertUniquePublishedKeyword(DB, data.tags);
    }
    const res = await DB.prepare(
      `INSERT INTO posts (slug, title, excerpt, body, category_id, tags, cover_image, cover_alt,
        keyword_role, search_intent, keyword_cluster, meta_title, meta_description, status,
        reading_minutes, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        slug,
        data.title,
        data.excerpt,
        data.body,
        data.categoryId,
        data.tags,
        data.coverImage,
        data.coverAlt,
        data.keywordRole,
        data.searchIntent,
        data.keywordCluster,
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
    const existing = await DB.prepare(
      `SELECT p.published_at, p.slug, c.slug AS category_slug
       FROM posts p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
    )
      .bind(data.id)
      .first<{
        published_at: string | null;
        slug: string;
        category_slug: string | null;
      }>();
    if (!existing) throw new Error("글을 찾을 수 없습니다.");
    const slug = data.slug ? await uniqueSlug(DB, data.slug, data.id) : existing.slug;
    const reading = estimateReadingMinutes(data.body);
    const nextCategorySlug = await assertBlogCategorySelection(DB, data);
    // Keep the original publication date when a post is temporarily returned to draft.
    const publishedAt = preserveFirstPublishedAt(
      existing.published_at,
      data.status,
      new Date().toISOString(),
    );
    if (data.status === "published") {
      await assertUniquePublishedKeyword(DB, data.tags, data.id);
    }
    const updateStatement = DB.prepare(
      `UPDATE posts SET slug = ?, title = ?, excerpt = ?, body = ?, category_id = ?,
        tags = ?, cover_image = ?, cover_alt = ?, keyword_role = ?, search_intent = ?,
        keyword_cluster = ?,
        meta_title = ?, meta_description = ?, status = ?, reading_minutes = ?, published_at = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
    ).bind(
      slug,
      data.title,
      data.excerpt,
      data.body,
      data.categoryId,
      data.tags,
      data.coverImage,
      data.coverAlt,
      data.keywordRole,
      data.searchIntent,
      data.keywordCluster,
      data.metaTitle,
      data.metaDescription,
      data.status,
      reading,
      publishedAt,
      data.id,
    );

    const statements = [updateStatement];
    if (nextCategorySlug) {
      statements.push(
        DB.prepare(
          `DELETE FROM post_redirects
           WHERE old_category_slug = ? AND old_post_slug = ? AND post_id = ?`,
        ).bind(nextCategorySlug, slug, data.id),
      );
    }

    const redirectSource = getPostRedirectSource(
      {
        categorySlug: existing.category_slug,
        postSlug: existing.slug,
        publishedAt: existing.published_at,
      },
      { categorySlug: nextCategorySlug, postSlug: slug },
    );
    if (redirectSource) {
      statements.push(
        DB.prepare(
          `INSERT INTO post_redirects (old_category_slug, old_post_slug, post_id)
           VALUES (?, ?, ?)
           ON CONFLICT(old_category_slug, old_post_slug) DO UPDATE SET
             post_id = excluded.post_id,
             created_at = datetime('now')`,
        ).bind(redirectSource.categorySlug, redirectSource.postSlug, data.id),
      );
    }

    await DB.batch(statements);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    await DB.batch([
      DB.prepare("DELETE FROM post_redirects WHERE post_id = ?").bind(data.id),
      DB.prepare("DELETE FROM posts WHERE id = ?").bind(data.id),
    ]);
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
