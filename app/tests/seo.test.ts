import { describe, expect, test } from "bun:test";

import appMeta from "../src/app-meta.json";
import { CATEGORY_SEO, SITE, SITE_URL } from "../src/lib/content";
import { normalizeKeyword } from "../src/lib/keyword-taxonomy";
import {
  CATEGORY_SERVICE_PATHS,
  PUBLIC_PAGES,
  SERVICE_PAGES,
  SERVICE_PAGE_BY_PATH,
  buildPublicPageHead,
  getServicePageForPost,
} from "../src/lib/seo-pages";
import {
  buildSitemapXml,
  escapeXml,
  getKeywordAlignmentIssues,
  getPrimaryKeyword,
  toCanonicalUrl,
} from "../src/lib/seo";

describe("SEO helpers", () => {
  test("uses the first non-empty tag as the primary target keyword", () => {
    expect(getPrimaryKeyword(" 피아노 과외 비용, 피아노 레슨 비용 ")).toBe("피아노 과외 비용");
    expect(getPrimaryKeyword(" , 서울 피아노 과외")).toBe("서울 피아노 과외");
  });

  test("builds URLs on the canonical production origin", () => {
    expect(toCanonicalUrl("/")).toBe("https://ewha-piano.higgsfield.app/");
    expect(toCanonicalUrl("/blog/practice")).toBe(
      "https://ewha-piano.higgsfield.app/blog/practice",
    );
  });

  test("escapes XML text values", () => {
    expect(escapeXml(`https://example.com/?a=1&b=<"'`)).toBe(
      "https://example.com/?a=1&amp;b=&lt;&quot;&apos;",
    );
  });

  test("builds canonical sitemap XML without ignored priority hints", () => {
    const xml = buildSitemapXml([
      { path: "/" },
      { path: "/blog?topic=연습&level=초보", lastmod: "2026-07-22" },
    ]);

    expect(xml).toContain("<loc>https://ewha-piano.higgsfield.app/</loc>");
    expect(xml).toContain("topic=%EC%97%B0%EC%8A%B5&amp;level=%EC%B4%88%EB%B3%B4");
    expect(xml).toContain("<lastmod>2026-07-22</lastmod>");
    expect(xml).not.toContain("<priority>");
    expect(xml).not.toContain("<changefreq>");
  });

  test("keeps category target keywords unique and prominent", () => {
    const categories = Object.values(CATEGORY_SEO);
    const keywords = categories.map((category) => category.primaryKeyword);

    expect(categories).toHaveLength(6);
    expect(new Set(keywords).size).toBe(keywords.length);
    for (const category of categories) {
      expect(category.pageTitle).toContain(category.primaryKeyword);
      expect(category.metaDescription).toContain(category.primaryKeyword);
      expect(category.intro).toContain(category.primaryKeyword);
    }
  });

  test("blocks published copy that drops its primary target keyword", () => {
    expect(
      getKeywordAlignmentIssues({
        tags: "피아노 과외 비용, 피아노 레슨 비용",
        title: "피아노 과외 비용 안내",
        excerpt: "피아노 과외 비용을 비교합니다.",
        metaTitle: "",
        metaDescription: "피아노 과외 비용과 수업 시간을 안내합니다.",
      }),
    ).toEqual([]);

    expect(
      getKeywordAlignmentIssues({
        tags: "피아노 과외 비용, 피아노 레슨 비용",
        title: "레슨 가격 안내",
        excerpt: "비용을 비교합니다.",
        metaTitle: "저렴한 레슨",
        metaDescription: "수업 시간과 가격을 안내합니다.",
      }).map((issue) => issue.field),
    ).toEqual(["title", "excerpt", "metaTitle", "metaDescription"]);
  });

  test("normalizes keyword variants before comparison", () => {
    expect(normalizeKeyword("  성인  피아노 Ａ  ")).toBe("성인 피아노 a");
  });

  test("keeps one canonical static URL per target keyword", () => {
    const paths = PUBLIC_PAGES.map((page) => page.path);
    const keywords = PUBLIC_PAGES.map((page) => normalizeKeyword(page.primaryKeyword));

    expect(PUBLIC_PAGES).toHaveLength(11);
    expect(Object.values(SERVICE_PAGES)).toHaveLength(6);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(paths).not.toContain("/lessons");

    for (const page of PUBLIC_PAGES) {
      expect(page.title).toContain(page.primaryKeyword);
      expect(page.description).toContain(page.primaryKeyword);
      expect(page.image.startsWith(`${SITE_URL}/`)).toBe(true);
      expect(page.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test("keeps service landing copy, canonical and schema aligned", () => {
    for (const page of Object.values(SERVICE_PAGES)) {
      expect(page.lede).toContain(page.primaryKeyword);
      const head = buildPublicPageHead(page);
      expect(head.links).toContainEqual({ rel: "canonical", href: `${SITE_URL}${page.path}` });

      const schema = JSON.parse(page.structuredData) as {
        "@graph": Array<{ "@type": string; mainEntity?: unknown[] }>;
      };
      const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
      expect(faq?.mainEntity).toHaveLength(page.faq.length);
    }

    const pricingSchema = JSON.parse(SERVICE_PAGES.pricing.structuredData) as {
      "@graph": Array<{ "@type": string; itemListElement?: unknown[] }>;
    };
    const catalog = pricingSchema["@graph"].find((item) => item["@type"] === "OfferCatalog");
    expect(catalog?.itemListElement).toHaveLength(SITE.pricing.tiers.length);
  });

  test("maps every topic cluster to a valid service landing", () => {
    for (const paths of Object.values(CATEGORY_SERVICE_PATHS)) {
      for (const path of paths) {
        expect(SERVICE_PAGE_BY_PATH.has(path)).toBe(true);
      }
    }

    expect(getServicePageForPost("adult", "adult-piano-tutoring").path).toBe("/lessons/adult");
    expect(getServicePageForPost("lesson", "online-piano-lesson").path).toBe("/lessons/private");
    expect(getServicePageForPost("admission", "competition-prep").path).toBe("/lessons/admission");
  });

  test("keeps homepage metadata synchronized with the main keyword registry", () => {
    const home = PUBLIC_PAGES.find((page) => page.path === "/");
    expect(home).toBeDefined();
    expect(home?.title).toBe(SITE.title);
    expect(home?.description).toBe(SITE.description);
    expect(appMeta.og_title).toBe(SITE.title);
    expect(appMeta.og_description).toBe(SITE.description);
  });

  test("has no visible em dash in the managed SEO registry", () => {
    expect(JSON.stringify({ PUBLIC_PAGES, SERVICE_PAGES })).not.toMatch(/[—–]/);
  });
});
