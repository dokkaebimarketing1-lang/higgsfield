import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getPrimaryKeyword } from "../src/lib/seo";
import { normalizeKeyword } from "../src/lib/keyword-taxonomy";
import { CATEGORY_SEO } from "../src/lib/content";
import { PUBLIC_PAGES } from "../src/lib/seo-pages";

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
  for (const name of migrationNames.filter((name) => name !== "0011_keyword_clusters.sql")) {
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
