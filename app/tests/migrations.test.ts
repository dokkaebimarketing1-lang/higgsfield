import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getPrimaryKeyword } from "../src/lib/seo";
import { normalizeKeyword } from "../src/lib/keyword-taxonomy";
import {
  BLOG_CATEGORY_SLUGS,
  CATEGORY_SEO,
  getBlogCategoryTaxonomyIssues,
} from "../src/lib/content";
import { PUBLIC_PAGES } from "../src/lib/seo-pages";
import { getBlogPublicationIssues } from "../src/lib/blog-quality";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");
const migrationNames = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b, "en"));

function applyMigration(db: Database, name: string) {
  const sql = readFileSync(join(migrationsDir, name), "utf8");
  const executableSql = sql.replace(/^\s*--.*$/gm, "").trim();
  if (executableSql) db.exec(sql);
}

function databaseBeforeKeywordMigration() {
  const db = new Database(":memory:");
  for (const name of migrationNames.filter((name) => name < "0011_keyword_clusters.sql")) {
    applyMigration(db, name);
  }
  return db;
}

function databaseAfterAllMigrations() {
  const db = new Database(":memory:");
  for (const name of migrationNames) applyMigration(db, name);
  return db;
}

function databaseBeforeKeywordContentLinksMigration() {
  const db = new Database(":memory:");
  for (const name of migrationNames.filter((name) => name < "0013_keyword_content_links.sql")) {
    applyMigration(db, name);
  }
  return db;
}

const retargetedSlugs = [
  "piano-start-age",
  "elementary-piano-tutoring",
  "sight-reading",
  "adult-piano-tutoring",
  "academy-vs-tutoring",
  "home-lesson-prep",
  "practice-parent-role",
] as const;

describe("keyword cluster migration", () => {
  test("classifies all published posts and preserves keyword alignment", () => {
    const db = databaseBeforeKeywordMigration();
    const beforeUpdatedAt = new Map(
      db
        .query<{ slug: string; updated_at: string }, []>(
          "SELECT slug, updated_at FROM posts WHERE status = 'published'",
        )
        .all()
        .map((post) => [post.slug, post.updated_at]),
    );

    applyMigration(db, "0011_keyword_clusters.sql");

    const posts = db
      .query<
        {
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          tags: string;
          meta_title: string;
          meta_description: string;
          keyword_role: string;
          search_intent: string;
          keyword_cluster: string;
          updated_at: string;
        },
        []
      >("SELECT * FROM posts WHERE status = 'published' ORDER BY slug")
      .all();

    expect(posts).toHaveLength(32);
    expect(posts.filter((post) => post.keyword_cluster === "general")).toHaveLength(0);

    const primaryKeywords = posts.map((post) => normalizeKeyword(getPrimaryKeyword(post.tags)));
    expect(new Set(primaryKeywords).size).toBe(primaryKeywords.length);

    const allCanonicalKeywords = [
      ...PUBLIC_PAGES.map((page) => normalizeKeyword(page.primaryKeyword)),
      ...Object.values(CATEGORY_SEO).map((category) => normalizeKeyword(category.primaryKeyword)),
      ...primaryKeywords,
    ];
    expect(new Set(allCanonicalKeywords).size).toBe(allCanonicalKeywords.length);

    for (const post of posts) {
      const keyword = normalizeKeyword(getPrimaryKeyword(post.tags));
      expect(normalizeKeyword(post.title)).toContain(keyword);
      expect(normalizeKeyword(post.excerpt)).toContain(keyword);
      expect(normalizeKeyword(post.meta_description)).toContain(keyword);
      if (post.meta_title) expect(normalizeKeyword(post.meta_title)).toContain(keyword);
    }

    const retargeted = new Set<string>([...retargetedSlugs, "piano-self-study"]);
    for (const post of posts) {
      if (!retargeted.has(post.slug)) {
        expect(post.updated_at).toBe(beforeUpdatedAt.get(post.slug));
      }
    }

    const selfStudy = posts.find((post) => post.slug === "piano-self-study");
    expect(getPrimaryKeyword(selfStudy?.tags ?? "")).toBe("피아노 독학");
    expect(selfStudy?.keyword_role).toBe("informational");
    expect(selfStudy?.search_intent).toBe("informational");
    expect(selfStudy?.keyword_cluster).toBe("practice");
    expect(selfStudy?.body).toContain("/lessons/private");
    db.close();
  });

  test("does not overwrite administrator-edited post copy", () => {
    const db = databaseBeforeKeywordMigration();
    const placeholders = retargetedSlugs.map(() => "?").join(", ");
    db.query(
      `UPDATE posts SET title = '[관리자 수정] ' || title WHERE slug IN (${placeholders})`,
    ).run(...retargetedSlugs);

    applyMigration(db, "0011_keyword_clusters.sql");

    const protectedPosts = db
      .query<{ slug: string; title: string }, []>("SELECT slug, title FROM posts ORDER BY slug")
      .all()
      .filter((post) => retargetedSlugs.includes(post.slug as (typeof retargetedSlugs)[number]));
    expect(protectedPosts).toHaveLength(retargetedSlugs.length);
    for (const post of protectedPosts) expect(post.title.startsWith("[관리자 수정] ")).toBeTrue();
    expect(
      db
        .query<{ count: number }, []>(
          "SELECT COUNT(*) AS count FROM posts WHERE keyword_cluster = 'general'",
        )
        .get()?.count,
    ).toBe(0);
    db.close();
  });
});

describe("Webflow SEO hardening migration", () => {
  test("removes unsupported numeric claims and strengthens contextual links", () => {
    const migrationSql = readFileSync(
      join(migrationsDir, "0012_webflow_seo_hardening.sql"),
      "utf8",
    );
    expect(migrationSql).not.toMatch(/\bLIKE\b/i);
    expect(migrationSql).toContain("instr(body");

    const db = databaseAfterAllMigrations();
    const posts = db
      .query<
        { slug: string; title: string; excerpt: string; body: string; updated_at: string },
        []
      >(
        `SELECT slug, title, excerpt, body, updated_at FROM posts
         WHERE slug IN (
           'piano-tutoring-cost', 'online-piano-lesson', 'music-college-entrance',
           'ewha-piano-exam', 'hanon-practice', 'metronome-use',
           'competition-prep', 'stage-fright'
         )`,
      )
      .all();
    const bySlug = new Map(posts.map((post) => [post.slug, post]));

    expect(bySlug.get("piano-tutoring-cost")?.body).not.toContain("월 12만 원에서 40만 원");
    expect(bySlug.get("piano-tutoring-cost")?.body).toContain("/pricing");
    expect(bySlug.get("online-piano-lesson")?.excerpt).not.toContain("80~90%");
    expect(bySlug.get("music-college-entrance")?.body).toContain("https://admission.ewha.ac.kr/");
    expect(bySlug.get("ewha-piano-exam")?.body).toContain("https://admission.ewha.ac.kr/");
    const now = Date.now();
    for (const post of posts) {
      expect(Date.parse(post.updated_at)).toBeLessThanOrEqual(now);
    }
    for (const slug of ["hanon-practice", "metronome-use", "competition-prep", "stage-fright"]) {
      expect(bySlug.get(slug)?.body).toMatch(/\/blog\/(practice|exam)/);
      expect(bySlug.get(slug)?.body).toMatch(/\/lessons\/(private|admission)/);
    }
    db.close();
  });
});

describe("keyword content links migration", () => {
  const serviceLinks = {
    "adult-piano-tutoring": "[성인 피아노 레슨 안내](/lessons/adult)",
    "buying-first-piano": "[어린이 피아노 레슨](/lessons/children)",
    "child-hates-practice": "[어린이 피아노 레슨 상담](/lessons/children)",
    "elementary-piano-tutoring": "[초등학생 피아노 레슨 안내](/lessons/children)",
    "piano-start-age": "[유아·어린이 피아노 레슨 안내](/lessons/children)",
    "practice-parent-role": "[어린이 피아노 레슨 상담](/lessons/children)",
    "home-lesson-prep": "[피아노 방문 레슨 상담](/lessons/home-visit)",
    "seodaemun-piano": "[서대문구 피아노 방문 레슨](/lessons/home-visit)",
    "mapo-piano": "[마포구 피아노 방문 레슨](/lessons/home-visit)",
    "ewha-area-lesson": "[이대·서대문구 피아노 방문 레슨](/lessons/home-visit)",
    "seoul-piano-tutoring": "[서울 피아노 방문 레슨](/lessons/home-visit)",
    "academy-vs-tutoring": "[피아노 개인 레슨 비교 상담](/lessons/private)",
    "choosing-piano-tutor": "[피아노 개인 레슨 상담](/lessons/private)",
    "tutoring-time-guide": "[피아노 개인 레슨 시간 상담](/lessons/private)",
    "sight-reading": "[피아노 개인 레슨 상담](/lessons/private)",
    "new-age-piano": "[성인 피아노 레슨](/lessons/adult)",
  } as const;

  test("replaces 16 generic consultation anchors with descriptive service links", () => {
    const db = databaseAfterAllMigrations();
    const slugs = Object.keys(serviceLinks);
    const placeholders = slugs.map(() => "?").join(", ");
    const posts = db
      .query<{ slug: string; body: string }, string[]>(
        `SELECT slug, body FROM posts WHERE slug IN (${placeholders}) ORDER BY slug`,
      )
      .all(...slugs);

    expect(posts).toHaveLength(slugs.length);
    for (const post of posts) {
      expect(post.body, post.slug).toContain(serviceLinks[post.slug as keyof typeof serviceLinks]);
    }
    db.close();
  });

  test("separates pricing comparison intent, adds contextual inlinks, and is idempotent", () => {
    const db = databaseAfterAllMigrations();
    const cost = db
      .query<
        {
          excerpt: string;
          meta_description: string;
          body: string;
          search_intent: string;
        },
        []
      >(
        `SELECT excerpt, meta_description, body, search_intent
         FROM posts WHERE slug = 'piano-tutoring-cost'`,
      )
      .get();

    expect(cost?.search_intent).toBe("comparison");
    expect(cost?.excerpt).toContain("최신 레슨비 확인 경로");
    expect(cost?.meta_description).toContain("비교 기준");
    expect(cost?.body).toContain("[피아노 레슨비와 과정별 포함 항목](/pricing)");
    expect(cost?.body).not.toContain("취미 스타터");
    expect(cost?.body).not.toContain("월 160,000원");
    expect(cost?.body.match(/\/pricing/g)).toHaveLength(1);

    const competitionPrep = db
      .query<{ body: string }, []>("SELECT body FROM posts WHERE slug = 'competition-prep'")
      .get();
    const practiceMethod = db
      .query<{ body: string }, []>("SELECT body FROM posts WHERE slug = 'piano-practice-method'")
      .get();
    expect(competitionPrep?.body).toContain(
      "[콩쿠르 곡 선택 기준](/blog/repertoire/competition-pieces)",
    );
    expect(practiceMethod?.body).toContain(
      "[피아노 독학 8주 연습 순서](/blog/practice/piano-self-study)",
    );

    db.exec("UPDATE posts SET updated_at = '2000-01-01 00:00:00'");
    const before = db
      .query<{ slug: string; body: string; updated_at: string }, []>(
        "SELECT slug, body, updated_at FROM posts ORDER BY slug",
      )
      .all();
    applyMigration(db, "0013_keyword_content_links.sql");
    const after = db
      .query<{ slug: string; body: string; updated_at: string }, []>(
        "SELECT slug, body, updated_at FROM posts ORDER BY slug",
      )
      .all();
    expect(after).toEqual(before);
    db.close();
  });

  test("does not overwrite an administrator-edited consultation anchor", () => {
    const db = databaseBeforeKeywordContentLinksMigration();
    db.query(
      `UPDATE posts
       SET body = replace(body, '[상담 신청](/#contact)', '[관리자 상담](/#contact)')
       WHERE slug = 'choosing-piano-tutor'`,
    ).run();

    applyMigration(db, "0013_keyword_content_links.sql");

    const post = db
      .query<{ body: string }, []>("SELECT body FROM posts WHERE slug = 'choosing-piano-tutor'")
      .get();
    expect(post?.body).toContain("[관리자 상담](/#contact)");
    expect(post?.body).not.toContain("/lessons/private");
    db.close();
  });
});

describe("blog publication quality migration", () => {
  test("backfills explicit image alt text and leaves all 32 published posts releasable", () => {
    const db = databaseAfterAllMigrations();
    const columns = db.query<{ name: string }, []>("PRAGMA table_info(posts)").all();
    expect(columns.map((column) => column.name)).toContain("cover_alt");

    const posts = db
      .query<
        {
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          category_id: number | null;
          tags: string;
          cover_image: string;
          cover_alt: string;
          meta_title: string;
          meta_description: string;
          status: "published";
        },
        []
      >("SELECT * FROM posts WHERE status = 'published' ORDER BY slug")
      .all();

    expect(posts).toHaveLength(32);
    for (const post of posts) {
      expect(
        getBlogPublicationIssues({
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          categoryId: post.category_id,
          tags: post.tags,
          coverImage: post.cover_image,
          coverAlt: post.cover_alt,
          metaTitle: post.meta_title,
          metaDescription: post.meta_description,
          status: post.status,
        }),
        post.slug,
      ).toEqual([]);
    }

    const selfStudy = posts.find((post) => post.slug === "piano-self-study");
    expect(selfStudy?.cover_image).toBe("/assets/cat-practice.jpg");
    expect(selfStudy?.cover_alt).toBe(selfStudy?.title);
    expect(posts.filter((post) => !post.meta_title.trim())).toHaveLength(24);
    db.close();
  });
});

describe("CMS category taxonomy migration", () => {
  test("keeps all 32 posts inside the fixed taxonomy and preserves the moved URL", () => {
    const db = databaseAfterAllMigrations();
    const categories = db
      .query<{ slug: string; name: string; description: string }, []>(
        "SELECT slug, name, description FROM categories ORDER BY sort_order",
      )
      .all();
    expect(categories.map((category) => category.slug)).toEqual([...BLOG_CATEGORY_SLUGS]);
    for (const category of categories) {
      const policy = CATEGORY_SEO[category.slug as keyof typeof CATEGORY_SEO];
      expect(category.name).toBe(policy.name);
      expect(category.description).toBe(policy.description);
    }

    const posts = db
      .query<
        {
          slug: string;
          category_slug: string;
          keyword_role: "informational" | "long-tail";
          search_intent: "commercial" | "comparison" | "informational" | "local" | "navigational";
          keyword_cluster:
            | "general"
            | "lesson"
            | "pricing"
            | "adult"
            | "children"
            | "home-visit"
            | "admission"
            | "practice"
            | "repertoire"
            | "local";
        },
        []
      >(
        `SELECT p.slug, c.slug AS category_slug, p.keyword_role, p.search_intent, p.keyword_cluster
         FROM posts p INNER JOIN categories c ON c.id = p.category_id
         WHERE p.status = 'published' ORDER BY p.slug`,
      )
      .all();
    expect(posts).toHaveLength(32);
    for (const post of posts) {
      expect(
        getBlogCategoryTaxonomyIssues({
          categorySlug: post.category_slug,
          keywordRole: post.keyword_role,
          searchIntent: post.search_intent,
          keywordCluster: post.keyword_cluster,
        }),
        post.slug,
      ).toEqual([]);
    }

    expect(posts.find((post) => post.slug === "online-piano-lesson")?.category_slug).toBe(
      "lesson-guide",
    );
    const redirect = db
      .query<{ category_slug: string; post_slug: string }, []>(
        `SELECT c.slug AS category_slug, p.slug AS post_slug
         FROM post_redirects r
         INNER JOIN posts p ON p.id = r.post_id
         INNER JOIN categories c ON c.id = p.category_id
         WHERE r.old_category_slug = 'local' AND r.old_post_slug = 'online-piano-lesson'`,
      )
      .get();
    expect(redirect).toEqual({
      category_slug: "lesson-guide",
      post_slug: "online-piano-lesson",
    });
    db.close();
  });
});
