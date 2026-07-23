import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

type Distribution = {
  contentUrl: string;
  bytes: number;
  sha256: string;
  rowCount: number;
  fieldCount: number;
};

type Metadata = {
  datasetId: string;
  datasetVersion: string;
  datasetPublishedAt: string;
  modifiedAt: string;
  sourcePublishedAt?: string;
  publisher: { name: string; url: string; role: string };
  officialSource: { publisher: string | string[] };
  sourceLicense: { scope: string; status: string; termsUrls: string[]; notice: string };
  derivedReuse: { attribution: string; notice: string; privacyCondition: string };
  dataDictionaryPath: string;
  distributions: Distribution[];
};

type FieldDefinition = {
  name: string;
  description: string;
  dataType: string;
  unit: string | null;
  nullable: boolean;
  derivation: string;
  publicRestriction: string;
};

type Dictionary = {
  schemaVersion: string;
  datasetId: string;
  datasetVersion: string;
  publishedAt: string;
  tables: Array<{
    name: string;
    csvPath: string;
    fieldCount: number;
    fields: FieldDefinition[];
  }>;
};

const publicAsset = (name: string) => new URL(`../public/data/research/${name}`, import.meta.url);
const sourceAsset = (name: string) => new URL(`../src/data/research/${name}`, import.meta.url);
const readJson = <T>(url: URL) => JSON.parse(readFileSync(url, "utf8")) as T;

const DATASETS = [
  {
    metadataFile: "national-music-private-education-metadata.json",
    sourceFile: "national-music-private-education.json",
    dictionaryFile: "national-music-private-education-schema.json",
  },
  {
    metadataFile: "seoul-piano-fees-metadata.json",
    sourceFile: "seoul-piano-fees.json",
    dictionaryFile: "seoul-piano-fees-schema.json",
  },
] as const;

describe("research metadata assets", () => {
  test("separates official-source provenance from the derived dataset publication", () => {
    const national = readJson<Metadata>(
      publicAsset("national-music-private-education-metadata.json"),
    );
    const seoul = readJson<Metadata>(publicAsset("seoul-piano-fees-metadata.json"));

    for (const metadata of [national, seoul]) {
      expect(metadata.datasetVersion).toBe("1.0.0");
      expect(metadata.datasetPublishedAt).toBe("2026-07-23");
      expect(metadata.modifiedAt).toBe("2026-07-23");
      expect(metadata.publisher.name).toBe("이화 피아노 과외");
      expect(metadata.publisher.url.startsWith("https://")).toBe(true);
      expect(metadata.publisher.role).toContain("파생 데이터셋");
      expect(metadata.officialSource.publisher).toBeTruthy();
      expect(metadata.sourceLicense.scope).toBe("공식 원자료");
      expect(metadata.sourceLicense.status).toContain("공식 제공기관");
      expect(metadata.sourceLicense.termsUrls.length).toBeGreaterThan(0);
      expect(metadata.sourceLicense.notice).toContain("추가 권리");
      expect(metadata.derivedReuse.attribution).toContain(`v${metadata.datasetVersion}`);
      expect(metadata.derivedReuse.notice).toContain("원자료 제공기관");
      expect(metadata.derivedReuse.privacyCondition).toContain("재식별");
    }

    expect(national.sourcePublishedAt).toBe("2026-03-12");
    expect(national.officialSource.publisher).toEqual(["교육부", "국가데이터처"]);
    expect(national.derivedReuse.attribution).toContain(
      "/research/2025-music-private-education-statistics",
    );
    expect(seoul.officialSource.publisher).toBe("서울특별시교육청");
    expect(seoul.derivedReuse.attribution).toContain("/research/2026-seoul-piano-academy-fees");
  });

  test("keeps public metadata byte-for-byte equivalent in the application source", () => {
    for (const dataset of DATASETS) {
      const publicMetadata = readJson<unknown>(publicAsset(dataset.metadataFile));
      const sourceMetadata = readJson<unknown>(sourceAsset(dataset.sourceFile));
      expect(publicMetadata).toEqual(sourceMetadata);
    }
  });

  test("verifies every CSV distribution against its bytes, SHA-256, rows, and dictionary", () => {
    for (const dataset of DATASETS) {
      const metadata = readJson<Metadata>(publicAsset(dataset.metadataFile));
      const dictionary = readJson<Dictionary>(publicAsset(dataset.dictionaryFile));

      expect(metadata.dataDictionaryPath).toBe(`/data/research/${dataset.dictionaryFile}`);
      expect(dictionary.schemaVersion).toBe("1.0.0");
      expect(dictionary.datasetId).toBe(metadata.datasetId);
      expect(dictionary.datasetVersion).toBe(metadata.datasetVersion);
      expect(dictionary.publishedAt).toBe(metadata.datasetPublishedAt);
      expect(metadata.distributions).toHaveLength(dictionary.tables.length);

      for (const distribution of metadata.distributions) {
        expect(distribution.contentUrl.endsWith(".csv")).toBe(true);
        const csvName = distribution.contentUrl.split("/").at(-1);
        expect(csvName).toBeTruthy();
        const csvBytes = readFileSync(publicAsset(csvName!));
        const csvText = csvBytes.toString("utf8");
        expect(csvText).not.toContain("\r\n");
        const header = csvText
          .split(/\r?\n/, 1)[0]
          .replace(/^\uFEFF/, "")
          .split(",");
        const rowCount = csvText.trimEnd().split(/\r?\n/).length - 1;
        const table = dictionary.tables.find(
          (candidate) => candidate.csvPath === distribution.contentUrl,
        );

        expect(table).toBeDefined();
        expect(distribution.bytes).toBe(csvBytes.byteLength);
        expect(distribution.sha256).toBe(createHash("sha256").update(csvBytes).digest("hex"));
        expect(distribution.sha256).toMatch(/^[a-f0-9]{64}$/);
        expect(distribution.rowCount).toBe(rowCount);
        expect(distribution.fieldCount).toBe(header.length);
        expect(table?.fieldCount).toBe(header.length);
        expect(table?.fields.map((field) => field.name)).toEqual(header);

        for (const field of table?.fields ?? []) {
          expect(field.description.length).toBeGreaterThan(0);
          expect(field.dataType).toMatch(/^(string|integer|number|boolean)$/);
          expect(Object.hasOwn(field, "unit")).toBe(true);
          expect(typeof field.nullable).toBe("boolean");
          expect(field.derivation.length).toBeGreaterThan(0);
          expect(field.publicRestriction.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("does not expose direct identifiers or raw-file row locators as public fields", () => {
    const forbiddenFields = new Set([
      "name",
      "phone",
      "address",
      "facility_name",
      "facility_id",
      "source_file_id",
      "source_sheet",
      "source_row",
    ]);

    for (const dataset of DATASETS) {
      const dictionary = readJson<Dictionary>(publicAsset(dataset.dictionaryFile));
      const fieldNames = dictionary.tables.flatMap((table) =>
        table.fields.map((field) => field.name),
      );
      expect(fieldNames.filter((field) => forbiddenFields.has(field))).toEqual([]);
    }
  });
});
