import { SITE } from "./content";

export const PIANO_ROOTS = [
  { id: "C", label: "C", preferredName: "C", pitchClass: 0 },
  { id: "Db", label: "D♭ / C♯", preferredName: "D♭", pitchClass: 1 },
  { id: "D", label: "D", preferredName: "D", pitchClass: 2 },
  { id: "Eb", label: "E♭ / D♯", preferredName: "E♭", pitchClass: 3 },
  { id: "E", label: "E", preferredName: "E", pitchClass: 4 },
  { id: "F", label: "F", preferredName: "F", pitchClass: 5 },
  { id: "Gb", label: "G♭ / F♯", preferredName: "G♭", pitchClass: 6 },
  { id: "G", label: "G", preferredName: "G", pitchClass: 7 },
  { id: "Ab", label: "A♭ / G♯", preferredName: "A♭", pitchClass: 8 },
  { id: "A", label: "A", preferredName: "A", pitchClass: 9 },
  { id: "Bb", label: "B♭ / A♯", preferredName: "B♭", pitchClass: 10 },
  { id: "B", label: "B", preferredName: "B", pitchClass: 11 },
] as const;

export type PianoRootId = (typeof PIANO_ROOTS)[number]["id"];

export const CHORD_QUALITIES = [
  {
    id: "major",
    label: "메이저",
    suffix: "",
    formula: "1–3–5",
    intervals: [0, 4, 7],
    degreeOffsets: [0, 2, 4],
  },
  {
    id: "minor",
    label: "마이너",
    suffix: "m",
    formula: "1–♭3–5",
    intervals: [0, 3, 7],
    degreeOffsets: [0, 2, 4],
  },
  {
    id: "diminished",
    label: "디미니시드",
    suffix: "dim",
    formula: "1–♭3–♭5",
    intervals: [0, 3, 6],
    degreeOffsets: [0, 2, 4],
  },
  {
    id: "augmented",
    label: "어그먼티드",
    suffix: "aug",
    formula: "1–3–♯5",
    intervals: [0, 4, 8],
    degreeOffsets: [0, 2, 4],
  },
  {
    id: "sus2",
    label: "서스2",
    suffix: "sus2",
    formula: "1–2–5",
    intervals: [0, 2, 7],
    degreeOffsets: [0, 1, 4],
  },
  {
    id: "sus4",
    label: "서스4",
    suffix: "sus4",
    formula: "1–4–5",
    intervals: [0, 5, 7],
    degreeOffsets: [0, 3, 4],
  },
  {
    id: "dominant7",
    label: "도미넌트 7",
    suffix: "7",
    formula: "1–3–5–♭7",
    intervals: [0, 4, 7, 10],
    degreeOffsets: [0, 2, 4, 6],
  },
  {
    id: "major7",
    label: "메이저 7",
    suffix: "maj7",
    formula: "1–3–5–7",
    intervals: [0, 4, 7, 11],
    degreeOffsets: [0, 2, 4, 6],
  },
  {
    id: "minor7",
    label: "마이너 7",
    suffix: "m7",
    formula: "1–♭3–5–♭7",
    intervals: [0, 3, 7, 10],
    degreeOffsets: [0, 2, 4, 6],
  },
  {
    id: "halfDiminished7",
    label: "하프 디미니시드 7",
    suffix: "m7♭5",
    formula: "1–♭3–♭5–♭7",
    intervals: [0, 3, 6, 10],
    degreeOffsets: [0, 2, 4, 6],
  },
  {
    id: "diminished7",
    label: "디미니시드 7",
    suffix: "dim7",
    formula: "1–♭3–♭5–♭♭7",
    intervals: [0, 3, 6, 9],
    degreeOffsets: [0, 2, 4, 6],
  },
] as const;

export type ChordQualityId = (typeof CHORD_QUALITIES)[number]["id"];

const NATURAL_PITCH_CLASS = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
} as const;

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function accidentalForDifference(difference: number) {
  const accidentals: Record<number, string> = {
    [-2]: "♭♭",
    [-1]: "♭",
    0: "",
    1: "♯",
    2: "♯♯",
  };
  return (
    accidentals[difference] ?? (difference < 0 ? "♭".repeat(-difference) : "♯".repeat(difference))
  );
}

function spellChordTone(
  root: (typeof PIANO_ROOTS)[number],
  semitoneInterval: number,
  degreeOffset: number,
) {
  const rootLetter = root.preferredName[0] as keyof typeof NATURAL_PITCH_CLASS;
  const rootLetterIndex = LETTERS.indexOf(rootLetter);
  const targetLetter = LETTERS[modulo(rootLetterIndex + degreeOffset, LETTERS.length)];
  const targetPitchClass = modulo(root.pitchClass + semitoneInterval, 12);
  const naturalPitchClass = NATURAL_PITCH_CLASS[targetLetter];
  let difference = modulo(targetPitchClass - naturalPitchClass, 12);
  if (difference > 6) difference -= 12;
  return `${targetLetter}${accidentalForDifference(difference)}`;
}

export type PianoChord = {
  root: (typeof PIANO_ROOTS)[number];
  quality: (typeof CHORD_QUALITIES)[number];
  symbol: string;
  notes: readonly string[];
  pitchClasses: readonly number[];
  inversions: readonly {
    name: string;
    notes: readonly string[];
    bass: string;
  }[];
};

export function getPianoRoot(rootId: PianoRootId) {
  const root = PIANO_ROOTS.find((item) => item.id === rootId);
  if (!root) throw new Error(`Unknown piano root: ${rootId}`);
  return root;
}

export function getChordQuality(qualityId: ChordQualityId) {
  const quality = CHORD_QUALITIES.find((item) => item.id === qualityId);
  if (!quality) throw new Error(`Unknown chord quality: ${qualityId}`);
  return quality;
}

export function buildPianoChord(rootId: PianoRootId, qualityId: ChordQualityId): PianoChord {
  const root = getPianoRoot(rootId);
  const quality = getChordQuality(qualityId);
  const notes = quality.intervals.map((interval, index) =>
    spellChordTone(root, interval, quality.degreeOffsets[index]),
  );
  const pitchClasses = quality.intervals.map((interval) => modulo(root.pitchClass + interval, 12));
  const inversions = notes.map((_, index) => {
    const inversionNotes = [...notes.slice(index), ...notes.slice(0, index)];
    return {
      name: index === 0 ? "기본 위치" : `제${index}전위`,
      notes: inversionNotes,
      bass: inversionNotes[0],
    };
  });

  return {
    root,
    quality,
    symbol: `${root.preferredName}${quality.suffix}`,
    notes,
    pitchClasses,
    inversions,
  };
}

export type ProgressionSuggestion = {
  name: string;
  romanNumerals: string;
  chords: readonly string[];
  practiceNote: string;
};

export type ProgressionMode = "major" | "minor";

function symbolAtScaleDegree(
  rootId: PianoRootId,
  semitoneOffset: number,
  degreeOffset: number,
  qualityId: ChordQualityId,
) {
  const root = getPianoRoot(rootId);
  const quality = getChordQuality(qualityId);
  return `${spellChordTone(root, semitoneOffset, degreeOffset)}${quality.suffix}`;
}

export function buildProgressionSuggestions(
  rootId: PianoRootId,
  mode: ProgressionMode,
): readonly ProgressionSuggestion[] {
  if (mode === "minor") {
    return [
      {
        name: "팝·발라드 순환",
        romanNumerals: "i–VI–III–VII",
        chords: [
          symbolAtScaleDegree(rootId, 0, 0, "minor"),
          symbolAtScaleDegree(rootId, 8, 5, "major"),
          symbolAtScaleDegree(rootId, 3, 2, "major"),
          symbolAtScaleDegree(rootId, 10, 6, "major"),
        ],
        practiceNote: "각 코드를 가장 가까운 전위로 연결해 공통음을 유지해 보세요.",
      },
      {
        name: "단조 기본 종지",
        romanNumerals: "i–iv–V7–i",
        chords: [
          symbolAtScaleDegree(rootId, 0, 0, "minor"),
          symbolAtScaleDegree(rootId, 5, 3, "minor"),
          symbolAtScaleDegree(rootId, 7, 4, "dominant7"),
          symbolAtScaleDegree(rootId, 0, 0, "minor"),
        ],
        practiceNote: "V7의 이끔음을 반음 위 으뜸음으로 해결해 보세요.",
      },
      {
        name: "단조 2–5–1",
        romanNumerals: "iiø7–V7–i",
        chords: [
          symbolAtScaleDegree(rootId, 2, 1, "halfDiminished7"),
          symbolAtScaleDegree(rootId, 7, 4, "dominant7"),
          symbolAtScaleDegree(rootId, 0, 0, "minor"),
        ],
        practiceNote: "왼손은 근음, 오른손은 3·7음을 중심으로 천천히 연결해 보세요.",
      },
    ];
  }

  return [
    {
      name: "팝 기본 순환",
      romanNumerals: "I–V–vi–IV",
      chords: [
        symbolAtScaleDegree(rootId, 0, 0, "major"),
        symbolAtScaleDegree(rootId, 7, 4, "major"),
        symbolAtScaleDegree(rootId, 9, 5, "minor"),
        symbolAtScaleDegree(rootId, 5, 3, "major"),
      ],
      practiceNote: "오른손 전위를 바꿔 손의 이동 거리를 최소화해 보세요.",
    },
    {
      name: "정격종지 연습",
      romanNumerals: "I–IV–V7–I",
      chords: [
        symbolAtScaleDegree(rootId, 0, 0, "major"),
        symbolAtScaleDegree(rootId, 5, 3, "major"),
        symbolAtScaleDegree(rootId, 7, 4, "dominant7"),
        symbolAtScaleDegree(rootId, 0, 0, "major"),
      ],
      practiceNote: "V7의 7음은 아래로, 3음은 위 으뜸음으로 해결되는 소리를 들어 보세요.",
    },
    {
      name: "장조 2–5–1",
      romanNumerals: "ii7–V7–Imaj7",
      chords: [
        symbolAtScaleDegree(rootId, 2, 1, "minor7"),
        symbolAtScaleDegree(rootId, 7, 4, "dominant7"),
        symbolAtScaleDegree(rootId, 0, 0, "major7"),
      ],
      practiceNote: "3음과 7음을 반음 또는 온음으로 부드럽게 연결해 보세요.",
    },
  ];
}

export type ChordChartRow = {
  root: string;
  enharmonicRoot: string;
  quality: string;
  symbol: string;
  formula: string;
  tones: string;
  inversions: string;
};

export function buildFullChordChart(): readonly ChordChartRow[] {
  return PIANO_ROOTS.flatMap((root) =>
    CHORD_QUALITIES.map((quality) => {
      const chord = buildPianoChord(root.id, quality.id);
      return {
        root: root.preferredName,
        enharmonicRoot: root.label,
        quality: quality.label,
        symbol: chord.symbol,
        formula: quality.formula,
        tones: chord.notes.join(" · "),
        inversions: chord.inversions
          .map((inversion) => `${inversion.name}: ${inversion.notes.join("–")}`)
          .join(" / "),
      };
    }),
  );
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function buildFullChordChartCsv() {
  const headers = ["근음", "동음이명", "코드 종류", "코드 기호", "음정 공식", "구성음", "전위"];
  const rows = buildFullChordChart().map((row) => [
    row.root,
    row.enharmonicRoot,
    row.quality,
    row.symbol,
    row.formula,
    row.tones,
    row.inversions,
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export type LessonCostInput = {
  monthlyFee: number;
  sessionsPerMonth: number;
  minutesPerSession: number;
  monthlyExtraCost: number;
};

export type LessonCostResult = LessonCostInput & {
  monthlyTotal: number;
  totalMinutesPerMonth: number;
  tuitionPerSession: number;
  allInPerSession: number;
  allInPerMinute: number;
  allInHourlyEquivalent: number;
};

export function calculateLessonCost(input: LessonCostInput): LessonCostResult | null {
  const values = [
    input.monthlyFee,
    input.sessionsPerMonth,
    input.minutesPerSession,
    input.monthlyExtraCost,
  ];
  if (
    values.some((value) => !Number.isFinite(value)) ||
    input.monthlyFee < 0 ||
    input.monthlyExtraCost < 0 ||
    input.sessionsPerMonth <= 0 ||
    input.minutesPerSession <= 0
  ) {
    return null;
  }

  const monthlyTotal = input.monthlyFee + input.monthlyExtraCost;
  const totalMinutesPerMonth = input.sessionsPerMonth * input.minutesPerSession;

  return {
    ...input,
    monthlyTotal,
    totalMinutesPerMonth,
    tuitionPerSession: input.monthlyFee / input.sessionsPerMonth,
    allInPerSession: monthlyTotal / input.sessionsPerMonth,
    allInPerMinute: monthlyTotal / totalMinutesPerMonth,
    allInHourlyEquivalent: (monthlyTotal / totalMinutesPerMonth) * 60,
  };
}

function parsePublishedPrice(value: string) {
  const parsed = Number(value.replaceAll(",", ""));
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid published lesson price: ${value}`);
  }
  return parsed;
}

function parsePublishedMinutes(lines: readonly string[]) {
  const minuteLine = lines.find((line) => /\d+\s*분/.test(line));
  const minutes = minuteLine?.match(/(\d+)\s*분/)?.[1];
  if (!minutes)
    throw new Error(`Published lesson tier is missing session minutes: ${lines.join(", ")}`);
  return Number(minutes);
}

export const SITE_LESSON_PRESETS = SITE.pricing.tiers.map((tier) => ({
  name: tier.name,
  monthlyFee: parsePublishedPrice(tier.price),
  sessionsPerMonth: 4,
  minutesPerSession: parsePublishedMinutes(tier.lines),
  monthlyExtraCost: 0,
  sourcePath: "/pricing",
}));
