import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import {
  NATIONAL_MUSIC_EDUCATION,
  RESEARCH_SOURCE_MANIFEST,
  SEOUL_ADMINISTRATIVE_SOURCES,
  SEOUL_PIANO_FEES,
  RESEARCH_CATALOG_ID,
  buildNationalDatasetPageSchema,
  buildNationalMusicDatasetSchema,
  buildResearchDataCatalogSchema,
  buildSeoulDatasetPageSchema,
  buildSeoulPianoFeesDatasetSchema,
} from "../src/lib/research-data";

const readPublic = (name: string) =>
  readFileSync(new URL(`../public/data/research/${name}`, import.meta.url), "utf8");

describe("research datasets", () => {
  test("reconciles the official national music spending total", () => {
    const total = NATIONAL_MUSIC_EDUCATION.rows.find((row) => row.schoolLevel === "전체")!;
    const schoolLevelSum = NATIONAL_MUSIC_EDUCATION.rows
      .filter((row) => row.schoolLevel !== "전체")
      .reduce((sum, row) => sum + row.musicPrivateEducationSpending100mKrw, 0);

    expect(total.musicPrivateEducationSpending100mKrw).toBe(18_876);
    expect(schoolLevelSum).toBe(total.musicPrivateEducationSpending100mKrw);
    expect(NATIONAL_MUSIC_EDUCATION.unit).toBe("억원");
    expect(NATIONAL_MUSIC_EDUCATION.source.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test("keeps a complete, immutable official-source manifest", () => {
    expect(RESEARCH_SOURCE_MANIFEST.sources).toHaveLength(12);
    expect(SEOUL_ADMINISTRATIVE_SOURCES).toHaveLength(11);
    expect(new Set(RESEARCH_SOURCE_MANIFEST.sources.map((source) => source.sourceId)).size).toBe(
      12,
    );

    for (const source of RESEARCH_SOURCE_MANIFEST.sources) {
      expect(source.sourcePage.startsWith("https://")).toBe(true);
      expect(source.downloadUrl.startsWith("https://")).toBe(true);
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(source.bytes).toBeGreaterThan(0);
      expect(source.retrievedAt).toBe(SEOUL_PIANO_FEES.retrievedAt);
    }
    expect(RESEARCH_SOURCE_MANIFEST.retrievedAt).toBe(SEOUL_PIANO_FEES.retrievedAt);
    expect(SEOUL_PIANO_FEES.sourceManifestPath).toBe(
      `/data/research/source-manifest-${SEOUL_PIANO_FEES.retrievedAt}.json`,
    );
  });

  test("reconciles Seoul row, facility, validity, and district counts", () => {
    const typeRecords = Object.values(SEOUL_PIANO_FEES.byFacilityType).reduce(
      (sum, item) => sum + item.records,
      0,
    );
    const validRows =
      SEOUL_PIANO_FEES.validTuitionRecords + SEOUL_PIANO_FEES.excludedZeroOrMissingTuitionRecords;

    expect(SEOUL_PIANO_FEES.rawRowsScanned).toBeGreaterThan(SEOUL_PIANO_FEES.publishedRecords);
    expect(typeRecords).toBe(SEOUL_PIANO_FEES.publishedRecords);
    expect(validRows).toBe(SEOUL_PIANO_FEES.publishedRecords);
    expect(SEOUL_PIANO_FEES.seoulSummary).toHaveLength(2);
    expect(new Set(SEOUL_PIANO_FEES.districtSummary.map((row) => row.area)).size).toBe(25);
    expect(SEOUL_PIANO_FEES.districtSummary).toHaveLength(50);

    for (const row of [...SEOUL_PIANO_FEES.seoulSummary, ...SEOUL_PIANO_FEES.districtSummary]) {
      if (row.valid_tuition_records < 5) {
        expect(row.registered_tuition_median_krw).toBeNull();
        expect(row.registered_tuition_note).toContain("n<5");
      } else {
        expect(row.registered_tuition_median_krw).toBeGreaterThan(0);
      }
    }
  });

  test("publishes direct-identifier-free CSVs with metadata-consistent row counts", () => {
    const records = readPublic("seoul-piano-fee-records-2026-01-01.csv");
    const summary = readPublic("seoul-piano-fee-summary-2026-01-01.csv");
    const header = records.split(/\r?\n/, 1)[0].replace(/^\uFEFF/, "");

    expect(header).toContain("tuition_fee_krw");
    expect(header).not.toMatch(/전화|주소|성명|학원명|교습소명/);
    expect(header).not.toMatch(/source_file_id|source_sheet|source_row|facility_id/);
    expect(records).not.toMatch(/(?:^|,)(?:010|02)[-. ]?\d{3,4}[-. ]?\d{4}(?:,|$)/m);
    expect(records).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    expect(records).not.toMatch(/(?:서울(?:특별시)?\s*)?[가-힣]+구\s+[가-힣0-9]+(?:로|길)\s*\d+/);
    expect(records.trimEnd().split(/\r?\n/)).toHaveLength(SEOUL_PIANO_FEES.publishedRecords + 1);
    expect(summary.trimEnd().split(/\r?\n/)).toHaveLength(
      SEOUL_PIANO_FEES.seoulSummary.length + SEOUL_PIANO_FEES.districtSummary.length + 1,
    );
  });

  test("emits Google-compatible Dataset distributions", () => {
    const national = buildNationalMusicDatasetSchema();
    const seoul = buildSeoulPianoFeesDatasetSchema();
    const catalog = buildResearchDataCatalogSchema();

    for (const schema of [national, seoul]) {
      expect(schema["@type"]).toBe("Dataset");
      expect(schema.name.length).toBeGreaterThan(0);
      expect(schema.description.length).toBeGreaterThanOrEqual(50);
      expect(schema.url.startsWith("https://")).toBe(true);
      expect(schema.distribution.length).toBeGreaterThan(0);
      expect(schema.isAccessibleForFree).toBe(true);
      expect(schema.keywords.length).toBeGreaterThan(0);
      expect(schema.version).toBe("1.0.0");
      expect(schema.creator).toEqual({ "@id": "https://ewha-piano.higgsfield.app/#business" });
      expect(schema.publisher).toEqual({ "@id": "https://ewha-piano.higgsfield.app/#business" });
      expect(schema.includedInDataCatalog).toEqual({ "@id": RESEARCH_CATALOG_ID });
      expect(schema.mainEntityOfPage["@id"]).toEndWith("#webpage");
      expect(schema.creditText).toContain(schema.url);
      expect(schema.publishingPrinciples).toBe(
        "https://ewha-piano.higgsfield.app/research/methodology",
      );
      expect(schema.usageInfo).toBe(
        "https://ewha-piano.higgsfield.app/research/methodology#reuse-policy",
      );
      expect(new Date(schema.datePublished).getTime()).toBeLessThanOrEqual(
        new Date(schema.dateModified).getTime(),
      );
      for (const distribution of schema.distribution) {
        expect(distribution["@type"]).toBe("DataDownload");
        expect(distribution.contentUrl.startsWith("https://")).toBe(true);
        expect(distribution.encodingFormat.length).toBeGreaterThan(0);
        expect(distribution.contentSize).toMatch(/^[\d,]+ B$/);
        expect(distribution.sha256).toMatch(/^[a-f0-9]{64}$/);
      }
    }

    expect(national.distribution).toHaveLength(1);
    expect(national.distribution[0].contentUrl).toEndWith(
      "/data/research/national-music-private-education-2025.csv",
    );
    expect(JSON.stringify(national.distribution)).not.toContain(".pdf");
    expect(national.isBasedOn["@type"]).toBe("Report");
    expect(national.isBasedOn.license).toBe(NATIONAL_MUSIC_EDUCATION.source.sourcePage);
    expect(national.citation).toHaveLength(2);

    expect(seoul.distribution).toHaveLength(2);
    expect(JSON.stringify(seoul.distribution)).not.toContain("source-manifest");
    expect(seoul.isBasedOn["@type"]).toBe("Dataset");
    expect(seoul.isBasedOn.license).toBe("https://www.data.go.kr/data/3044370/fileData.do");
    expect(seoul.citation).toHaveLength(1);

    expect(catalog["@type"]).toBe("DataCatalog");
    expect(catalog["@id"]).toBe(RESEARCH_CATALOG_ID);
    expect(catalog.dataset).toEqual([
      {
        "@id":
          "https://ewha-piano.higgsfield.app/research/2025-music-private-education-statistics#dataset",
      },
      {
        "@id": "https://ewha-piano.higgsfield.app/research/2026-seoul-piano-academy-fees#dataset",
      },
    ]);

    for (const pageSchema of [buildNationalDatasetPageSchema(), buildSeoulDatasetPageSchema()]) {
      expect(pageSchema["@type"]).toBe("WebPage");
      expect(pageSchema.author).toEqual({
        "@id": "https://ewha-piano.higgsfield.app/#business",
      });
      expect(pageSchema.mainEntity["@id"]).toEndWith("#dataset");
    }
  });

  test("keeps visible research authorship, citations, and table semantics in source", () => {
    const nationalRoute = readFileSync(
      new URL(
        "../src/routes/research/2025-music-private-education-statistics.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    const seoulRoute = readFileSync(
      new URL("../src/routes/research/2026-seoul-piano-academy-fees.tsx", import.meta.url),
      "utf8",
    );
    const methodologyRoute = readFileSync(
      new URL("../src/routes/research/methodology.tsx", import.meta.url),
      "utf8",
    );
    const researchHubRoute = readFileSync(
      new URL("../src/routes/research/index.tsx", import.meta.url),
      "utf8",
    );
    const researchUi = readFileSync(
      new URL("../src/components/site/research-ui.tsx", import.meta.url),
      "utf8",
    );

    expect(researchUi).toContain("data-research-authorship");
    expect(researchUi).toContain("data-research-citation");
    expect(researchUi).toContain("data-research-source");
    expect(researchUi).toContain("<cite");
    for (const route of [nationalRoute, seoulRoute, methodologyRoute]) {
      expect(route).toContain("<caption");
      expect(route).toContain('scope="col"');
      expect(route).toContain('scope="row"');
    }
    expect(nationalRoute).toContain("NATIONAL_DATASET_CITATION");
    expect(seoulRoute).toContain("SEOUL_DATASET_CITATION");
    expect(researchHubRoute).toContain("NATIONAL_PDF_SOURCE.sourcePage");
    expect(researchHubRoute).toContain("https://www.data.go.kr/data/3044370/fileData.do");
    expect(researchHubRoute).toContain('dateLabel: "원자료 공표일"');
    expect(researchHubRoute).toContain('dateLabel: "원자료 기준일"');
    expect(methodologyRoute).toContain('id="reuse-policy"');
    expect(methodologyRoute).toContain('<time dateTime="2026-07-23"');
  });
});
