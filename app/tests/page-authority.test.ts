import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { CATEGORY_SEO } from "../src/lib/content";
import { getLatestContentDate } from "../src/lib/content-dates";
import { SERVICE_PAGES } from "../src/lib/seo-pages";

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("page-level authority signals", () => {
  test("derives a stable visible review date from published content", () => {
    expect(
      getLatestContentDate(
        [
          { published_at: "2026-07-20 09:00:00", updated_at: "2026-07-21 10:00:00" },
          { published_at: "2026-07-22T08:00:00.000Z", updated_at: null },
        ],
        "2026-07-01",
      ),
    ).toBe("2026-07-22");
    expect(getLatestContentDate([], "2026-07-01")).toBe("2026-07-01");
  });

  test("keeps every commercial landing's answer, scope, and boundary explicit", () => {
    for (const page of Object.values(SERVICE_PAGES)) {
      expect(page.authority.answer.length).toBeGreaterThan(25);
      expect(page.authority.scope.length).toBeGreaterThan(25);
      expect(page.authority.boundary.length).toBeGreaterThan(25);
    }

    expect(new Set(Object.values(SERVICE_PAGES).map((page) => page.authority.answer)).size).toBe(
      Object.values(SERVICE_PAGES).length,
    );
  });

  test("keeps category ownership rules distinct and visible in the hub route", () => {
    for (const category of Object.values(CATEGORY_SEO)) {
      expect(category.audience).toBeTruthy();
      expect(category.editorialRule).toBeTruthy();
      expect(category.exclusionRule).toBeTruthy();
    }

    const categoryRoute = source("../src/routes/blog/$category/index.tsx");
    expect(categoryRoute).toContain("audience={seo.audience}");
    expect(categoryRoute).toContain("scope={seo.editorialRule}");
    expect(categoryRoute).toContain("boundary={seo.exclusionRule}");
  });

  test("renders authorship on service and collection hubs and relates posts to services", () => {
    const record = source("../src/components/site/page-authority-record.tsx");
    const landing = source("../src/components/site/lesson-landing.tsx");
    const blogHub = source("../src/routes/blog/index.tsx");
    const categoryHub = source("../src/routes/blog/$category/index.tsx");
    const article = source("../src/routes/blog/$category/$slug.tsx");

    expect(record).toContain("data-page-authority");
    expect(record).toContain('href="/about#person"');
    expect(landing).toContain("<PageAuthorityRecord");
    expect(blogHub).toContain("<PageAuthorityRecord");
    expect(categoryHub).toContain("<PageAuthorityRecord");
    expect(article).toContain("about: servicePages.map");
    expect(article).toContain("getServicePagesForPost");
  });
});
