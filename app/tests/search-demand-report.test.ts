import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

import { PIANO_SEARCH_DEMAND, RESEARCH_DOWNLOADS } from "../src/lib/research-data";

const routeSource = readFileSync(
  new URL("../src/routes/research/piano-search-demand-report-2026.tsx", import.meta.url),
  "utf8",
);

function readPublic(path: string): Buffer {
  return readFileSync(new URL(`../public${path}`, import.meta.url));
}

describe("2026 piano search-demand authority report", () => {
  test("publishes the answer-first headline and reconciled headline figures", () => {
    expect(routeSource).toContain("2026 피아노 키워드 검색수요 조사");
    expect(routeSource).toContain("Answer first");
    expect(PIANO_SEARCH_DEMAND.uniqueKeywords).toBe(4_545);
    expect(PIANO_SEARCH_DEMAND.totalSearchVolumeSum).toBe(1_001_925);
    expect(PIANO_SEARCH_DEMAND.naverMeasuredKeywords).toBe(4_522);

    const pianoCode = PIANO_SEARCH_DEMAND.targetKeywordRows.find(
      (row) => row.keyword === "피아노 코드",
    );
    expect(pianoCode?.totalSearchVolume).toBe(4_230);
    expect(routeSource).toContain("검색량보다 레슨·학습 주제와의 적합성");
    expect(routeSource).toContain("Volume is not site fit");
    expect(routeSource).toContain('"피아노 레슨": {');
    expect(routeSource).toContain('href: "/"');
    expect(routeSource).toContain('"피아노 연습": {');
    expect(routeSource).toContain('href: "/blog/practice"');
    expect(routeSource).toContain("비교·데이터만 · 학원 서비스 목표 아님");
    expect(routeSource).toContain("우선 검토 키워드와 처리 원칙");
  });

  test("shows every segment and every published interpretation limit", () => {
    expect(PIANO_SEARCH_DEMAND.segments).toHaveLength(7);
    expect(routeSource).toContain("PIANO_SEARCH_DEMAND.segments.map");
    expect(routeSource).toContain("PIANO_SEARCH_DEMAND.limitations.map");
    expect(routeSource).toContain("최근 12개월");
    expect(routeSource).toContain("최근 30일");
    expect(routeSource).toContain("#NAME?");
    expect(routeSource).toContain("겹치는");

    expect(PIANO_SEARCH_DEMAND.limitations.some((item) => item.includes("12개월"))).toBe(true);
    expect(PIANO_SEARCH_DEMAND.limitations.some((item) => item.includes("30일"))).toBe(true);
    expect(PIANO_SEARCH_DEMAND.limitations.some((item) => item.includes("#NAME?"))).toBe(true);
    expect(PIANO_SEARCH_DEMAND.limitations.some((item) => item.includes("중복"))).toBe(true);
  });

  test("links all five public reproducibility downloads and verifies CSV bytes and hashes", () => {
    const requiredDownloads = [
      ["searchDemandCsv", RESEARCH_DOWNLOADS.searchDemandCsv],
      ["searchDemandSummaryCsv", RESEARCH_DOWNLOADS.searchDemandSummaryCsv],
      ["searchDemandMetadata", RESEARCH_DOWNLOADS.searchDemandMetadata],
      ["searchDemandSchema", RESEARCH_DOWNLOADS.searchDemandSchema],
      ["searchDemandManifest", RESEARCH_DOWNLOADS.searchDemandManifest],
    ] as const;

    for (const [constantName, path] of requiredDownloads) {
      expect(routeSource).toContain(`RESEARCH_DOWNLOADS.${constantName}`);
      expect(readPublic(path).byteLength).toBeGreaterThan(0);
    }

    for (const distribution of PIANO_SEARCH_DEMAND.distributions) {
      const bytes = readPublic(distribution.contentUrl);
      expect(bytes.byteLength).toBe(distribution.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(distribution.sha256);
      expect(routeSource).toContain("sha256: distribution.sha256");
      expect(routeSource).toContain("contentSize:");
    }
  });

  test("documents derived fields and search-volume units accurately", () => {
    const dictionary = JSON.parse(readPublic(RESEARCH_DOWNLOADS.searchDemandSchema).toString()) as {
      tables: {
        name: string;
        fields: {
          name: string;
          unit: string | null;
          derivation: string;
        }[];
      }[];
    };
    const keywordFields = new Map(
      dictionary.tables
        .find((table) => table.name === "keyword_search_demand")!
        .fields.map((field) => [field.name, field]),
    );
    const summaryFields = new Map(
      dictionary.tables
        .find((table) => table.name === "segment_summary")!
        .fields.map((field) => [field.name, field]),
    );

    expect(keywordFields.get("source_coverage")?.derivation).toContain("값 존재 여부");
    expect(keywordFields.get("naver_mobile")?.unit).toBe("monthly search estimate");
    expect(keywordFields.get("naver_pc")?.unit).toBe("monthly search estimate");
    expect(summaryFields.get("google_monthly_average_sum")?.unit).toBe("monthly search estimate");
  });

  test("emits five honest schema entities with stable publisher IDs and no fabricated review", () => {
    for (const type of ["WebPage", "Dataset", "Article", "BreadcrumbList", "FAQPage"]) {
      expect(routeSource).toContain(`"@type": "${type}"`);
    }

    expect(routeSource).toContain('publisher: { "@id": `${SITE_URL}/#business` }');
    expect(routeSource).toContain('"@type": "DataDownload"');
    expect(routeSource).toContain("Google Ads Keyword Planner 공식 도구 안내");
    expect(routeSource).toContain("네이버 광고주센터 키워드 도구 공식 도움말");
    expect(routeSource).toContain("data-research-authorship");
    expect(routeSource).toContain("data-research-citation");
    expect(routeSource).toContain("공식 통계 아님");
    expect(routeSource).not.toContain("reviewRating");
    expect(routeSource).not.toContain("aggregateRating");
  });

  test("keeps tables accessible and the source distinction visible", () => {
    expect(routeSource.match(/<caption/g)?.length).toBeGreaterThanOrEqual(3);
    expect(routeSource).toContain('scope="col"');
    expect(routeSource).toContain('scope="row"');
    expect(routeSource).toContain("두 플랫폼이나 정부가 공표한 공식 통계가 아닌");
    expect(routeSource).toContain("이 데이터셋의 발행자나 검토자가 아닙니다");
  });
});
