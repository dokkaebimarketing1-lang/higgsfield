import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import {
  ABOUT_RESEARCH_REFERENCE_IDS,
  ARTICLE_RESEARCH_REFERENCE_IDS,
  CATEGORY_RESEARCH_REFERENCE_IDS,
  getArticleResearchReferenceIds,
  getCategoryResearchReferenceIds,
  getServiceResearchReferenceIds,
  HOME_RESEARCH_REFERENCE_IDS,
  RESEARCH_REFERENCE_IDS,
  RESEARCH_REFERENCES,
  SERVICE_RESEARCH_REFERENCE_IDS,
  type ResearchDatasetReferenceId,
  type ResearchReferenceId,
} from "../src/lib/research-links";
import { PUBLIC_PAGE_BY_PATH } from "../src/lib/seo-pages";

describe("research contextual links", () => {
  test("uses valid public targets, concrete anchors, and explicit interpretation limits", () => {
    const anchorRules: Record<ResearchReferenceId, RegExp> = {
      hub: /피아노 교육 데이터와 원자료/,
      national: /2025 전국 음악 사교육비 원자료와 가공 CSV/,
      seoul: /2026 서울 피아노 교습비 행정자료와 가공 통계/,
      methodology: /원자료 가공 방법, 한계와 수정 이력/,
    };

    for (const id of RESEARCH_REFERENCE_IDS) {
      const reference = RESEARCH_REFERENCES[id];
      expect(PUBLIC_PAGE_BY_PATH.has(reference.href)).toBe(true);
      expect(reference.anchor).toMatch(anchorRules[id]);
      expect(reference.description.length).toBeGreaterThanOrEqual(45);
      expect(reference.limitation.length).toBeGreaterThanOrEqual(45);
      expect(reference.limitation).not.toMatch(/[–—]/);
    }

    expect(RESEARCH_REFERENCES.national.limitation).toContain("피아노 단독");
    expect(RESEARCH_REFERENCES.seoul.limitation).toContain("실제 결제액");
    expect(RESEARCH_REFERENCES.seoul.limitation).toContain("개인 레슨비");
    expect(RESEARCH_REFERENCES.methodology.limitation).toContain("알려진 한계");
  });

  test("maps home, lesson, category, article, and about contexts deliberately", () => {
    expect(HOME_RESEARCH_REFERENCE_IDS).toEqual(["national", "seoul", "methodology"]);
    expect(ABOUT_RESEARCH_REFERENCE_IDS).toEqual(["hub", "methodology"]);

    expect(getServiceResearchReferenceIds("/pricing")).toEqual(["seoul"]);
    expect(getServiceResearchReferenceIds("/lessons/private")).toEqual(["seoul"]);
    expect(getServiceResearchReferenceIds("/lessons/adult")).toEqual(["seoul"]);
    expect(getServiceResearchReferenceIds("/lessons/children")).toEqual(["national"]);
    expect(getServiceResearchReferenceIds("/lessons/admission")).toEqual([]);

    expect(getCategoryResearchReferenceIds("lesson-guide")).toEqual(["seoul"]);
    expect(getCategoryResearchReferenceIds("local")).toEqual(["seoul"]);
    expect(getCategoryResearchReferenceIds("parents")).toEqual(["national"]);
    expect(getCategoryResearchReferenceIds("practice")).toEqual([]);

    for (const slug of [
      "piano-tutoring-cost",
      "academy-vs-tutoring",
      "adult-piano-academy-price",
      "seodaemun-piano",
      "mapo-piano",
      "ewha-area-lesson",
      "hongdae-piano-guide",
    ]) {
      expect(getArticleResearchReferenceIds(slug)).toEqual(["seoul"]);
    }
    expect(getArticleResearchReferenceIds("hanon-practice")).toEqual([]);
  });

  test("gives each dataset at least three distinct inbound starting points", () => {
    const origins: Array<{ path: string; references: readonly ResearchReferenceId[] }> = [
      { path: "/", references: HOME_RESEARCH_REFERENCE_IDS },
      ...Object.entries(SERVICE_RESEARCH_REFERENCE_IDS).map(([path, references]) => ({
        path,
        references,
      })),
      ...Object.entries(CATEGORY_RESEARCH_REFERENCE_IDS).map(([slug, references]) => ({
        path: `/blog/${slug}`,
        references,
      })),
      ...Object.entries(ARTICLE_RESEARCH_REFERENCE_IDS).map(([slug, references]) => ({
        path: `/blog/article/${slug}`,
        references,
      })),
    ];

    for (const datasetId of ["national", "seoul"] satisfies ResearchDatasetReferenceId[]) {
      const inboundOrigins = new Set(
        origins
          .filter((origin) => origin.references.includes(datasetId))
          .map((origin) => origin.path),
      );
      expect(inboundOrigins.size).toBeGreaterThanOrEqual(3);
    }
  });

  test("renders the shared panel at every configured page layer", () => {
    const sourceFiles = [
      "../src/routes/index.tsx",
      "../src/components/site/lesson-landing.tsx",
      "../src/routes/blog/$category/index.tsx",
      "../src/routes/blog/$category/$slug.tsx",
      "../src/routes/about.tsx",
    ];

    for (const path of sourceFiles) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      expect(source).toContain("ResearchReferencePanel");
    }
  });
});
