import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  POST_REDIRECT_LOOKUP_SQL,
  type PostRedirectTarget,
} from "../src/lib/api/post-redirects.functions";
import { getPostRedirectPath, getPostRedirectSource } from "../src/lib/post-redirects";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

function migratedDatabase() {
  const db = new Database(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const name of readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    const sql = readFileSync(join(migrationsDir, name), "utf8");
    if (sql.replace(/^\s*--.*$/gm, "").trim()) db.exec(sql);
  }
  return db;
}

function lookupRedirect(db: Database, category: string, slug: string) {
  return db
    .query<PostRedirectTarget, [string, string]>(POST_REDIRECT_LOOKUP_SQL)
    .get(category, slug);
}

describe("post redirect migration", () => {
  test("creates a unique redirect key, target index, and cascading post reference", () => {
    const db = migratedDatabase();
    const columns = db
      .query<{ name: string; notnull: number; pk: number }, []>("PRAGMA table_info(post_redirects)")
      .all();
    const byName = new Map(columns.map((column) => [column.name, column]));

    expect(byName.get("old_category_slug")?.notnull).toBe(1);
    expect(byName.get("old_post_slug")?.notnull).toBe(1);
    expect(byName.get("post_id")?.notnull).toBe(1);
    expect(byName.get("old_category_slug")?.pk).toBe(1);
    expect(byName.get("old_post_slug")?.pk).toBe(2);
    expect(
      db
        .query<{ name: string }, []>("PRAGMA index_list(post_redirects)")
        .all()
        .map((index) => index.name),
    ).toContain("idx_post_redirects_post_id");

    const post = db.query<{ id: number }, []>("SELECT id FROM posts LIMIT 1").get();
    expect(post).not.toBeNull();
    db.query(
      "INSERT INTO post_redirects (old_category_slug, old_post_slug, post_id) VALUES (?, ?, ?)",
    ).run("old-category", "old-post", post!.id);
    db.query("DELETE FROM posts WHERE id = ?").run(post!.id);
    expect(
      db
        .query<{ count: number }, []>(
          `SELECT COUNT(*) AS count FROM post_redirects
           WHERE old_category_slug = 'old-category' AND old_post_slug = 'old-post'`,
        )
        .get()?.count,
    ).toBe(0);

    expect(() =>
      db
        .query(
          "INSERT INTO post_redirects (old_category_slug, old_post_slug, post_id) VALUES ('', 'x', 1)",
        )
        .run(),
    ).toThrow();
    db.close();
  });
});

describe("post redirect resolution", () => {
  test("resolves an old URL directly to the current published canonical path", () => {
    const db = migratedDatabase();
    const post = db
      .query<{ id: number; slug: string; category_slug: string }, []>(
        `SELECT p.id, p.slug, c.slug AS category_slug
         FROM posts p INNER JOIN categories c ON c.id = p.category_id
         WHERE p.status = 'published' LIMIT 1`,
      )
      .get();
    expect(post).not.toBeNull();

    db.query(
      "INSERT INTO post_redirects (old_category_slug, old_post_slug, post_id) VALUES (?, ?, ?)",
    ).run("former-category", "former-post", post!.id);

    const target = lookupRedirect(db, "former-category", "former-post");
    expect(target).toEqual({ category_slug: post!.category_slug, post_slug: post!.slug });
    expect(
      getPostRedirectPath(
        target ? { categorySlug: target.category_slug, postSlug: target.post_slug } : null,
      ),
    ).toBe(`/blog/${post!.category_slug}/${post!.slug}`);
    db.close();
  });

  test("does not expose draft or deleted posts and rejects self-redirects", () => {
    const db = migratedDatabase();
    const post = db
      .query<{ id: number; slug: string; category_slug: string }, []>(
        `SELECT p.id, p.slug, c.slug AS category_slug
         FROM posts p INNER JOIN categories c ON c.id = p.category_id
         WHERE p.status = 'published' LIMIT 1`,
      )
      .get();
    expect(post).not.toBeNull();

    const insert = db.query(
      "INSERT INTO post_redirects (old_category_slug, old_post_slug, post_id) VALUES (?, ?, ?)",
    );
    insert.run("former-category", "former-post", post!.id);
    insert.run(post!.category_slug, post!.slug, post!.id);

    expect(lookupRedirect(db, post!.category_slug, post!.slug)).toBeNull();
    db.query("UPDATE posts SET status = 'draft' WHERE id = ?").run(post!.id);
    expect(lookupRedirect(db, "former-category", "former-post")).toBeNull();

    db.query("DELETE FROM posts WHERE id = ?").run(post!.id);
    expect(lookupRedirect(db, "former-category", "former-post")).toBeNull();
    expect(getPostRedirectPath(null)).toBeNull();
    db.close();
  });

  test("records only URL moves from content that has already been published", () => {
    expect(
      getPostRedirectSource(
        { categorySlug: "practice", postSlug: "old", publishedAt: "2026-01-01" },
        { categorySlug: "practice", postSlug: "new" },
      ),
    ).toEqual({ categorySlug: "practice", postSlug: "old" });
    expect(
      getPostRedirectSource(
        { categorySlug: "practice", postSlug: "same", publishedAt: "2026-01-01" },
        { categorySlug: "practice", postSlug: "same" },
      ),
    ).toBeNull();
    expect(
      getPostRedirectSource(
        { categorySlug: "practice", postSlug: "draft", publishedAt: null },
        { categorySlug: "practice", postSlug: "draft-2" },
      ),
    ).toBeNull();
  });
});
