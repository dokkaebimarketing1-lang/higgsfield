import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(appDir, "migrations");
const migrationNamePattern = /^\d{4}_[a-z0-9_]+\.sql$/;
const destructiveSqlPattern =
  /\b(?:DROP\s+(?:TABLE|COLUMN)|TRUNCATE(?:\s+TABLE)?|DELETE\s+FROM|ALTER\s+TABLE[\s\S]*?DROP\s+COLUMN)\b/i;

const migrationNames = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b, "en"));

if (migrationNames.length === 0) throw new Error("적용할 SQL 마이그레이션이 없습니다.");

const invalidNames = migrationNames.filter((name) => !migrationNamePattern.test(name));
if (invalidNames.length > 0) {
  throw new Error(`마이그레이션 파일명 형식이 잘못되었습니다: ${invalidNames.join(", ")}`);
}

const db = new Database(":memory:");
db.exec("PRAGMA foreign_keys = ON");

try {
  for (const name of migrationNames) {
    const sql = readFileSync(join(migrationsDir, name), "utf8");
    const executableSql = sql.replace(/^\s*--.*$/gm, "").trim();
    if (!executableSql) continue;
    if (destructiveSqlPattern.test(executableSql)) {
      throw new Error(`${name}에 운영 데이터 파괴 가능성이 있는 SQL이 포함되어 있습니다.`);
    }

    try {
      db.exec("BEGIN");
      db.exec(sql);
      db.exec("COMMIT");
    } catch (error) {
      if (db.inTransaction) db.exec("ROLLBACK");
      throw new Error(`${name} 적용 실패`, { cause: error });
    }
  }

  const integrity = db.query<{ integrity_check: string }, []>("PRAGMA integrity_check").get();
  if (integrity?.integrity_check !== "ok") {
    throw new Error(`SQLite 무결성 검사 실패: ${integrity?.integrity_check ?? "결과 없음"}`);
  }

  const foreignKeyIssues = db.query<Record<string, unknown>, []>("PRAGMA foreign_key_check").all();
  if (foreignKeyIssues.length > 0) {
    throw new Error(`외래 키 오류 ${foreignKeyIssues.length}건이 발견되었습니다.`);
  }

  const requiredTables = [
    "admin_sessions",
    "categories",
    "inquiries",
    "inquiry_completions",
    "post_keyword_evidence",
    "post_redirects",
    "posts",
    "rate_limits",
  ];
  const tables = new Set(
    db
      .query<{ name: string }, []>(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
      )
      .all()
      .map((table) => table.name),
  );
  const missingTables = requiredTables.filter((table) => !tables.has(table));
  if (missingTables.length > 0) {
    throw new Error(`필수 테이블이 없습니다: ${missingTables.join(", ")}`);
  }

  const invalidPublicPosts = db
    .query<{ count: number }, []>(
      `SELECT COUNT(*) AS count
       FROM posts
       WHERE status = 'published'
         AND (published_at IS NULL OR category_id IS NULL OR trim(slug) = '')`,
    )
    .get()?.count;
  if (invalidPublicPosts !== 0) {
    throw new Error(`공개 상태가 불완전한 글이 ${invalidPublicPosts ?? "알 수 없음"}건 있습니다.`);
  }

  const postCount = db.query<{ count: number }, []>("SELECT COUNT(*) AS count FROM posts").get();
  console.log(
    JSON.stringify({
      migrations: migrationNames.length,
      tables: requiredTables.length,
      posts: postCount?.count ?? 0,
      integrity: "ok",
      foreignKeys: "ok",
      destructiveSql: "none",
    }),
  );
} finally {
  db.close();
}
