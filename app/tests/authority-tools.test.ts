import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { SITE } from "../src/lib/content";
import {
  CHORD_QUALITIES,
  PIANO_ROOTS,
  SITE_LESSON_PRESETS,
  buildFullChordChart,
  buildFullChordChartCsv,
  buildPianoChord,
  buildProgressionSuggestions,
  calculateLessonCost,
} from "../src/lib/piano-tools";

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("piano authority tools", () => {
  test("covers 12 unique roots and useful triad, suspended, and seventh qualities", () => {
    expect(PIANO_ROOTS).toHaveLength(12);
    expect(new Set(PIANO_ROOTS.map((root) => root.pitchClass)).size).toBe(12);
    expect(CHORD_QUALITIES.map((quality) => quality.id)).toEqual([
      "major",
      "minor",
      "diminished",
      "augmented",
      "sus2",
      "sus4",
      "dominant7",
      "major7",
      "minor7",
      "halfDiminished7",
      "diminished7",
    ]);
  });

  test("spells component tones by harmonic letter and creates every inversion", () => {
    const cMajor = buildPianoChord("C", "major");
    expect(cMajor.symbol).toBe("C");
    expect(cMajor.notes).toEqual(["C", "E", "G"]);
    expect(cMajor.inversions.map((inversion) => inversion.notes)).toEqual([
      ["C", "E", "G"],
      ["E", "G", "C"],
      ["G", "C", "E"],
    ]);

    const bFlatMinor7 = buildPianoChord("Bb", "minor7");
    expect(bFlatMinor7.symbol).toBe("B♭m7");
    expect(bFlatMinor7.notes).toEqual(["B♭", "D♭", "F", "A♭"]);
    expect(bFlatMinor7.inversions).toHaveLength(4);
  });

  test("builds transposed major and minor practice progressions", () => {
    const major = buildProgressionSuggestions("C", "major");
    const minor = buildProgressionSuggestions("A", "minor");
    const chordToolRoute = source("../src/routes/tools/piano-chord-chart.tsx");

    expect(major.map((item) => item.romanNumerals)).toEqual([
      "I–V–vi–IV",
      "I–IV–V7–I",
      "ii7–V7–Imaj7",
    ]);
    expect(major[0].chords).toEqual(["C", "G", "Am", "F"]);
    expect(minor[1].chords).toEqual(["Am", "Dm", "E7", "Am"]);
    expect(buildProgressionSuggestions("Gb", "major")[0].chords).toEqual(["G♭", "D♭", "E♭m", "C♭"]);
    expect(chordToolRoute).toContain("buildProgressionSuggestions(rootId, progressionMode)");
    expect(chordToolRoute).toContain("위의 개별 코드");
    expect(chordToolRoute).not.toContain("buildProgressionSuggestions(rootId, qualityId)");
  });

  test("exports one complete CSV row for every root-quality combination", () => {
    const chart = buildFullChordChart();
    const csv = buildFullChordChartCsv();

    expect(chart).toHaveLength(PIANO_ROOTS.length * CHORD_QUALITIES.length);
    expect(csv.split("\r\n")).toHaveLength(chart.length + 1);
    expect(csv).toContain("근음,동음이명,코드 종류,코드 기호,음정 공식,구성음,전위");
    expect(csv).toContain("B♭m7");
    expect(csv).toContain("제3전위");
  });

  test("calculates transparent all-in lesson cost units and rejects invalid divisors", () => {
    const result = calculateLessonCost({
      monthlyFee: 160_000,
      sessionsPerMonth: 4,
      minutesPerSession: 45,
      monthlyExtraCost: 20_000,
    });

    expect(result).not.toBeNull();
    expect(result?.monthlyTotal).toBe(180_000);
    expect(result?.totalMinutesPerMonth).toBe(180);
    expect(result?.tuitionPerSession).toBe(40_000);
    expect(result?.allInPerSession).toBe(45_000);
    expect(result?.allInPerMinute).toBe(1_000);
    expect(result?.allInHourlyEquivalent).toBe(60_000);
    expect(
      calculateLessonCost({
        monthlyFee: 160_000,
        sessionsPerMonth: 0,
        minutesPerSession: 45,
        monthlyExtraCost: 0,
      }),
    ).toBeNull();
  });

  test("derives calculator presets from every currently published site tier", () => {
    expect(SITE_LESSON_PRESETS).toHaveLength(SITE.pricing.tiers.length);
    expect(SITE_LESSON_PRESETS.map((preset) => preset.name)).toEqual(
      SITE.pricing.tiers.map((tier) => tier.name),
    );
    expect(SITE_LESSON_PRESETS.map((preset) => preset.monthlyFee)).toEqual([
      160_000, 240_000, 320_000,
    ]);
    expect(SITE_LESSON_PRESETS.map((preset) => preset.minutesPerSession)).toEqual([45, 60, 60]);
    expect(SITE_LESSON_PRESETS.every((preset) => preset.sessionsPerMonth === 4)).toBe(true);
  });

  test("keeps downloads client-only and publishes honest application schema and boundaries", () => {
    const hub = source("../src/routes/tools/index.tsx");
    const chord = source("../src/routes/tools/piano-chord-chart.tsx");
    const calculator = source("../src/routes/tools/piano-lesson-cost-calculator.tsx");

    expect(chord).toContain('typeof document === "undefined"');
    expect(chord).toContain("canvas.toBlob");
    expect(chord).toContain("buildFullChordChartCsv");
    expect(chord).toContain("window.print()");
    expect(calculator).toContain("/research/2026-seoul-piano-academy-fees");

    for (const route of [chord, calculator]) {
      expect(route).toContain('"@type": "WebApplication"');
      expect(route).toContain('"@type": "FAQPage"');
      expect(route).toContain('"@type": "BreadcrumbList"');
      expect(route).not.toMatch(/aggregateRating|reviewCount|ratingValue/);
    }
    expect(hub).toContain('"@type": "WebPage"');
    expect(calculator).toContain("시장 평균이나");
    expect(calculator).toContain("실제 결제액");
    expect(`${hub}\n${chord}\n${calculator}`).toContain('reviewStatus="외부·전문가 독립 검토 전"');
  });
});
