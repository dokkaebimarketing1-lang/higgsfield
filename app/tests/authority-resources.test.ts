import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import {
  PIANO_LEVELS,
  PRACTICE_DAYS,
  buildPracticePlannerCsv,
  createEmptyPracticeWeek,
  getPracticeWeekTotals,
} from "../src/lib/piano-resources";

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function normalizedCsv(relativePath: string): string {
  return source(relativePath)
    .replace(/^\uFEFF/, "")
    .replaceAll("\r\n", "\n")
    .trimEnd();
}

describe("independent piano authority resources", () => {
  test("publishes five distinct levels with complete diagnostic dimensions", () => {
    expect(PIANO_LEVELS).toHaveLength(5);
    expect(new Set(PIANO_LEVELS.map((level) => level.id)).size).toBe(PIANO_LEVELS.length);

    for (const level of PIANO_LEVELS) {
      expect(level.stage).toMatch(/^Level [1-5]$/);
      expect(level.label.length).toBeGreaterThan(5);
      expect(level.summary.length).toBeGreaterThan(25);
      expect(level.criteria.length).toBeGreaterThanOrEqual(3);
      expect(level.skills.length).toBeGreaterThanOrEqual(3);
      expect(level.theory.length).toBeGreaterThanOrEqual(3);
      expect(level.repertoireExamples.length).toBeGreaterThanOrEqual(3);
      expect(level.readiness.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("creates a deterministic blank week and calculates category and grand totals", () => {
    const entries = createEmptyPracticeWeek();
    expect(entries.map((entry) => entry.day)).toEqual(PRACTICE_DAYS.map((day) => day.label));

    entries[0] = {
      ...entries[0],
      warmupMinutes: 5,
      techniqueMinutes: 10,
      repertoireMinutes: 20,
      readingMinutes: 5,
    };
    entries[1] = {
      ...entries[1],
      warmupMinutes: 10,
      techniqueMinutes: 15,
      repertoireMinutes: 25,
      readingMinutes: 10,
    };

    expect(getPracticeWeekTotals(entries)).toEqual({
      byCategory: {
        warmupMinutes: 15,
        techniqueMinutes: 25,
        repertoireMinutes: 45,
        readingMinutes: 15,
      },
      grandTotal: 100,
    });
  });

  test("exports UTF-8 Excel-friendly CSV and neutralizes spreadsheet formulas", () => {
    const entries = createEmptyPracticeWeek();
    entries[0] = {
      ...entries[0],
      goal: "=1+1",
      reflection: '@HYPERLINK("https://invalid.example")',
      repertoireMinutes: 500,
    };

    const csv = buildPracticePlannerCsv(entries);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"\'@HYPERLINK(""https://invalid.example"")"');
    expect(csv).toContain('"300"');
    expect(csv.replaceAll("\r\n", "\n").trimEnd().split("\n")).toHaveLength(8);
  });

  test("ships reusable static CSV distributions", () => {
    const roadmap = normalizedCsv("../public/data/resources/piano-level-roadmap.csv");
    const planner = normalizedCsv("../public/data/resources/piano-practice-planner-template.csv");

    expect(roadmap.split("\n")).toHaveLength(6);
    expect(roadmap).toContain('"Level 5","상급 준비·레퍼토리 설계"');
    expect(roadmap).toContain("기간 보장");

    expect(planner.split("\n")).toHaveLength(8);
    expect(planner).toContain('"월요일","","0","0","0","0","0",""');
    expect(planner).toContain('"일요일","","0","0","0","0","0",""');
  });

  test("keeps the resource pages indexable, structured, bounded, and SSR-safe", () => {
    const hub = source("../src/routes/resources/index.tsx");
    const roadmap = source("../src/routes/resources/piano-level-roadmap.tsx");
    const planner = source("../src/routes/resources/piano-practice-planner.tsx");
    const combined = `${hub}\n${roadmap}\n${planner}`;

    for (const routeSource of [hub, roadmap, planner]) {
      expect(routeSource).toContain("buildPublicPageHead");
      expect(routeSource).toContain('"@type": "BreadcrumbList"');
      expect(routeSource).toContain('"@type": "FAQPage"');
      expect(routeSource).toContain("<PageAuthorityRecord");
    }

    expect(hub).toContain("/tools/piano-chord-chart");
    expect(hub).toContain("/tools/piano-lesson-cost-calculator");
    expect(roadmap).toContain('"@type": "Article"');
    expect(roadmap).toContain("/data/resources/piano-level-roadmap.csv");
    expect(roadmap).toContain("기간이나 실력 향상·입시·콩쿠르 결과를 보장하지 않");
    expect(planner).toContain('"@type": "WebApplication"');
    expect(planner).toContain("typeof window");
    expect(planner).toContain("서버로");
    expect(planner).toContain("전송하거나");
    expect(planner).not.toContain("localStorage");
    expect(planner).not.toContain("sessionStorage");
    expect(planner).not.toContain("fetch(");
    expect(combined).toContain('reviewStatus="외부·전문가 독립 검토 전"');
    expect(combined).not.toContain('content: "김서연"');
    expect(combined).not.toContain('author: { "@id": `${SITE_URL}/about#person` }');
    expect(combined).not.toContain('"@type": "HowTo"');
    expect(combined).not.toContain("reviewRating");
  });
});
