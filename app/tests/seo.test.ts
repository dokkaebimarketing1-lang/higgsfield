import { describe, expect, test } from "bun:test";

import appMeta from "../src/app-meta.json";
import {
  BLOG_CATEGORY_SLUGS,
  BLOG_POST_KEYWORD_ROLES,
  CATEGORY_SEO,
  SITE,
  SITE_URL,
  getBlogCategoryTaxonomyIssues,
} from "../src/lib/content";
import { normalizeKeyword } from "../src/lib/keyword-taxonomy";
import {
  CATEGORY_SERVICE_PATHS,
  PUBLIC_PAGES,
  SERVICE_PAGES,
  SERVICE_PAGE_BY_PATH,
  buildPublicPageHead,
  getServicePageForPost,
  getServicePagesForPost,
} from "../src/lib/seo-pages";
import {
  buildSitemapXml,
  escapeXml,
  extractExternalLinks,
  getKeywordAlignmentIssues,
  getPrimaryKeyword,
  toCanonicalUrl,
  toIsoDate,
} from "../src/lib/seo";
import { applySeoResponseHeaders } from "../src/lib/seo-response.server";

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
      {
        path: "/blog?topic=연습&level=초보",
        lastmod: "2026-07-22",
        images: ["/assets/piano-practice.jpg?size=large&format=jpg"],
      },
    ]);

    expect(xml).toContain("<loc>https://ewha-piano.higgsfield.app/</loc>");
    expect(xml).toContain("topic=%EC%97%B0%EC%8A%B5&amp;level=%EC%B4%88%EB%B3%B4");
    expect(xml).toContain("<lastmod>2026-07-22</lastmod>");
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain(
      "<image:loc>https://ewha-piano.higgsfield.app/assets/piano-practice.jpg?size=large&amp;format=jpg</image:loc>",
    );
    expect(xml).not.toContain("<priority>");
    expect(xml).not.toContain("<changefreq>");
  });

  test("normalizes article dates and extracts unique valid citation links", () => {
    expect(toIsoDate("2026-07-23 09:30:00")).toBe("2026-07-23T09:30:00.000Z");
    expect(toIsoDate("not-a-date")).toBeUndefined();
    expect(
      extractExternalLinks(
        "[공식 입학처](https://admission.ewha.ac.kr/)와 [같은 링크](https://admission.ewha.ac.kr/) 및 [내부](/about)",
      ),
    ).toEqual(["https://admission.ewha.ac.kr/"]);
  });

  test("noindexes preview HTML and error responses without blocking canonical HTML", () => {
    const htmlHeaders = { "content-type": "text/html; charset=utf-8" };
    const canonical = applySeoResponseHeaders(
      new Response("ok", { headers: htmlHeaders }),
      new Request("https://ewha-piano.higgsfield.app/"),
    );
    const preview = applySeoResponseHeaders(
      new Response("ok", { headers: htmlHeaders }),
      new Request("https://preview.higgsfield-dev.app/"),
    );
    const missing = applySeoResponseHeaders(
      new Response("missing", { status: 404, headers: htmlHeaders }),
      new Request("https://ewha-piano.higgsfield.app/missing"),
    );
    const serverError = applySeoResponseHeaders(
      new Response("error", { status: 500, headers: htmlHeaders }),
      new Request("https://ewha-piano.higgsfield.app/error"),
    );

    expect(canonical.headers.get("x-robots-tag")).toBeNull();
    expect(preview.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(missing.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(serverError.headers.get("x-robots-tag")).toBe("noindex, nofollow");
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

  test("keeps the CMS category taxonomy fixed and rejects cross-category drift", () => {
    expect(BLOG_CATEGORY_SLUGS).toHaveLength(6);
    expect(BLOG_POST_KEYWORD_ROLES).toEqual(["informational", "long-tail"]);
    expect(Object.keys(CATEGORY_SEO)).toEqual([...BLOG_CATEGORY_SLUGS]);

    for (const slug of BLOG_CATEGORY_SLUGS) {
      const category = CATEGORY_SEO[slug];
      expect(category.name.length).toBeGreaterThan(0);
      expect(category.description.length).toBeGreaterThan(0);
      expect(category.audience.length).toBeGreaterThan(0);
      expect(category.editorialRule.length).toBeGreaterThan(0);
      expect(category.exclusionRule.length).toBeGreaterThan(0);
      expect(
        getBlogCategoryTaxonomyIssues({
          categorySlug: slug,
          keywordRole: category.defaultKeywordRole,
          searchIntent: category.defaultSearchIntent,
          keywordCluster: category.defaultKeywordCluster,
        }),
      ).toEqual([]);
    }

    expect(
      getBlogCategoryTaxonomyIssues({
        categorySlug: "local",
        keywordRole: "informational",
        searchIntent: "comparison",
        keywordCluster: "lesson",
      }),
    ).toHaveLength(3);
    expect(
      getBlogCategoryTaxonomyIssues({
        categorySlug: "custom-category",
        keywordRole: "informational",
        searchIntent: "informational",
        keywordCluster: "practice",
      }),
    ).toEqual(["CMS에서 확정한 6개 카테고리 중 하나를 선택해 주세요."]);
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

    expect(PUBLIC_PAGES).toHaveLength(15);
    expect(Object.values(SERVICE_PAGES)).toHaveLength(6);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(paths).not.toContain("/lessons");
    expect(paths).toEqual(
      expect.arrayContaining([
        "/research",
        "/research/2025-music-private-education-statistics",
        "/research/2026-seoul-piano-academy-fees",
        "/research/methodology",
      ]),
    );
    expect(
      PUBLIC_PAGES.filter((page) => page.path.startsWith("/research")).map((page) => page.cluster),
    ).toEqual(["research", "research", "research", "research"]);

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
      const visibleCopy = [
        page.primaryKeyword,
        page.lede,
        page.imageAlt,
        page.authority.answer,
        page.authority.scope,
        page.authority.boundary,
        ...page.sections.flatMap((section) => [
          section.heading,
          section.lead,
          ...section.paragraphs,
          ...(section.points ?? []),
        ]),
        ...page.faq.flatMap((item) => [item.q, item.a]),
        ...page.relatedServices.flatMap((item) => [item.label, item.description]),
        ...page.related.flatMap((item) => [item.label, item.description]),
      ].join(" ");

      for (const keyword of page.supportingKeywords) {
        expect(visibleCopy).toContain(keyword);
      }

      expect(new Set(page.supportingKeywords.map(normalizeKeyword)).size).toBe(
        page.supportingKeywords.length,
      );
      for (const related of page.relatedServices) {
        expect(SERVICE_PAGE_BY_PATH.has(related.href)).toBe(true);
        expect(related.href).not.toBe(page.path);
      }

      const head = buildPublicPageHead(page);
      expect(head.links).toContainEqual({ rel: "canonical", href: `${SITE_URL}${page.path}` });

      const schema = JSON.parse(page.structuredData) as {
        "@graph": Array<Record<string, unknown>>;
      };
      const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
      const webPage = schema["@graph"].find((item) => item["@type"] === "WebPage");
      const service = schema["@graph"].find((item) => item["@type"] === "Service");
      const canonical = `${SITE_URL}${page.path}`;

      expect(faq?.mainEntity).toHaveLength(page.faq.length);
      expect(webPage).toMatchObject({
        "@id": `${canonical}#webpage`,
        url: canonical,
        dateModified: page.lastModified,
        author: { "@id": `${SITE_URL}/about#person` },
        publisher: { "@id": `${SITE_URL}/#business` },
        mainEntity: { "@id": `${canonical}#service` },
      });
      expect(webPage?.relatedLink).toEqual(page.related.map((item) => `${SITE_URL}${item.href}`));
      expect(service).toMatchObject({
        "@id": `${canonical}#service`,
        mainEntityOfPage: { "@id": `${canonical}#webpage` },
      });
      expect(service?.keywords).toEqual([page.primaryKeyword, ...page.supportingKeywords]);
      expect(service?.subjectOf).toHaveLength(page.related.length);
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
    expect(
      getServicePagesForPost("adult", "adult-piano-tutoring").map((page) => page.path),
    ).toEqual(["/lessons/adult", "/pricing"]);
    expect(
      getServicePagesForPost("lesson", "choosing-piano-tutor").map((page) => page.path),
    ).toEqual(["/lessons/private", "/pricing"]);
    expect(getServicePagesForPost("practice", "sight-reading").map((page) => page.path)).toEqual([
      "/lessons/private",
    ]);
    expect(CATEGORY_SERVICE_PATHS).toEqual({
      "lesson-guide": [
        SERVICE_PAGES.private.path,
        SERVICE_PAGES.pricing.path,
        SERVICE_PAGES.adult.path,
        SERVICE_PAGES.children.path,
      ],
      practice: [SERVICE_PAGES.private.path, SERVICE_PAGES.children.path],
      exam: [SERVICE_PAGES.admission.path],
      repertoire: [SERVICE_PAGES.adult.path, SERVICE_PAGES.admission.path],
      parents: [SERVICE_PAGES.children.path, SERVICE_PAGES.homeVisit.path],
      local: [SERVICE_PAGES.homeVisit.path, SERVICE_PAGES.private.path],
    });
  });

  test("keeps homepage metadata synchronized with the main keyword registry", () => {
    const home = PUBLIC_PAGES.find((page) => page.path === "/");
    expect(home).toBeDefined();
    expect(home?.title).toBe(SITE.title);
    expect(home?.description).toBe(SITE.description);
    expect(SITE.hero.headline).toContain("피아노 레슨");
    expect(SITE.hero.sub).toContain("피아노 개인 레슨");
    expect(SITE.hero.primary).toContain("피아노 레슨");
    expect(appMeta.og_title).toBe(SITE.title);
    expect(appMeta.og_description).toBe(SITE.description);
  });

  test("keeps detailed pricing ownership on the pricing landing", () => {
    const homepagePriceFaq = SITE.faq.items.find(
      (item) => item.q === "피아노 과외 비용은 얼마인가요?",
    );

    expect(homepagePriceFaq?.a).toContain("피아노 레슨비 페이지");
    expect(homepagePriceFaq?.a).not.toContain("240,000원");
    expect(homepagePriceFaq?.a).not.toContain("320,000원");
    expect(SERVICE_PAGES.pricing.faq.map((item) => item.a).join(" ")).toContain("320,000원");
  });

  test("has no visible em dash in the managed SEO registry", () => {
    expect(JSON.stringify({ PUBLIC_PAGES, SERVICE_PAGES })).not.toMatch(/[—–]/);
  });
});
