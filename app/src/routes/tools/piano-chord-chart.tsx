import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SubPageShell } from "../../components/site/chrome";
import { PageAuthorityRecord } from "../../components/site/page-authority-record";
import { SITE, SITE_URL } from "../../lib/content";
import {
  CHORD_QUALITIES,
  PIANO_ROOTS,
  buildFullChordChart,
  buildFullChordChartCsv,
  buildPianoChord,
  buildProgressionSuggestions,
  type ChordQualityId,
  type PianoChord,
  type PianoRootId,
  type ProgressionMode,
} from "../../lib/piano-tools";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/tools/piano-chord-chart")!;
const fullChordChart = buildFullChordChart();

const CHORD_FAQ = [
  {
    question: "피아노 코드의 구성음은 어떻게 찾나요?",
    answer:
      "근음에서 코드 공식에 적힌 음정만큼 이동합니다. 예를 들어 메이저 코드는 1–3–5, 마이너 코드는 1–♭3–5입니다. 이 코드표는 음정 공식과 실제 구성음을 함께 표시합니다.",
  },
  {
    question: "코드 전위는 왜 연습하나요?",
    answer:
      "같은 구성음의 순서를 바꾸면 코드 이름은 유지하면서 베이스음과 손의 위치가 달라집니다. 가까운 전위를 선택하면 코드 진행에서 손의 이동을 줄이고 공통음을 유지하기 쉽습니다.",
  },
  {
    question: "D♭과 C♯처럼 같은 건반의 이름이 다른 이유는 무엇인가요?",
    answer:
      "피아노에서는 같은 소리가 나지만 조성과 화음 안에서 맡는 음계 역할에 따라 표기가 달라집니다. 이 표는 12개 소리를 빠짐없이 다루되, 코드 철자는 대표 근음 표기를 기준으로 계산합니다.",
  },
  {
    question: "코드 진행 제안은 모든 곡에 그대로 사용할 수 있나요?",
    answer:
      "아닙니다. 대표적인 장조·단조 진행을 조옮김한 연습 예시입니다. 실제 곡에서는 멜로디, 조성, 장르와 앞뒤 화음에 맞춰 코드 종류와 전위를 선택해야 합니다.",
  },
] as const;

export const Route = createFileRoute("/tools/piano-chord-chart")({
  head: () => {
    const publicHead = buildPublicPageHead(page);
    return {
      ...publicHead,
      meta: [...publicHead.meta, { name: "author", content: "이화 피아노 과외" }],
      scripts: [
        {
          type: "application/ld+json",
          children: safeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": `${SITE_URL}${page.path}#webpage`,
                url: `${SITE_URL}${page.path}`,
                name: page.title,
                description: page.description,
                inLanguage: "ko",
                dateModified: page.lastModified,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                breadcrumb: { "@id": `${SITE_URL}${page.path}#breadcrumb` },
                mainEntity: { "@id": `${SITE_URL}${page.path}#application` },
              },
              {
                "@type": "WebApplication",
                "@id": `${SITE_URL}${page.path}#application`,
                name: "피아노 코드표",
                description:
                  "12개 근음과 11개 코드 종류의 구성음, 전위, 코드 진행을 조회하고 PNG·CSV로 저장하는 무료 교육용 웹 도구",
                url: `${SITE_URL}${page.path}`,
                applicationCategory: "EducationalApplication",
                applicationSubCategory: "Music education tool",
                operatingSystem: "Any",
                browserRequirements: "HTML5를 지원하는 웹 브라우저",
                inLanguage: "ko",
                provider: { "@id": `${SITE_URL}/#business` },
                isAccessibleForFree: true,
                offers: {
                  "@type": "Offer",
                  price: 0,
                  priceCurrency: "KRW",
                  availability: "https://schema.org/InStock",
                },
                featureList: [
                  "12개 근음 코드 조회",
                  "11개 코드 종류의 구성음과 전위",
                  "대표 장조·단조 코드 진행",
                  "선택 코드 PNG 저장",
                  "전체 코드표 CSV 다운로드",
                  "인쇄 및 PDF 저장",
                ],
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}${page.path}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 학습 도구",
                    item: `${SITE_URL}/tools`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "피아노 코드표",
                    item: `${SITE_URL}${page.path}`,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${SITE_URL}${page.path}#faq`,
                mainEntity: CHORD_FAQ.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: PianoChordChartPage,
});

function downloadBlob(blob: Blob, filename: string) {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function downloadChordPng(chord: PianoChord, rootId: PianoRootId, qualityId: ChordQualityId) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = "#11100e";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#c8a76a";
  context.font = "600 28px sans-serif";
  context.fillText("EWHA PIANO · CHORD REFERENCE", 120, 105);
  context.fillStyle = "#f4efe5";
  context.font = "700 112px serif";
  context.fillText(chord.symbol, 120, 245);
  context.fillStyle = "#a9a39a";
  context.font = "34px sans-serif";
  context.fillText(
    `${chord.quality.label} · ${chord.quality.formula} · ${chord.notes.join(" – ")}`,
    126,
    310,
  );

  const keyboardX = 120;
  const keyboardY = 395;
  const whiteKeyWidth = 170;
  const whiteKeyHeight = 330;
  const whitePitchClasses = [0, 2, 4, 5, 7, 9, 11];
  const blackKeys = [
    { pitchClass: 1, afterWhiteKey: 0 },
    { pitchClass: 3, afterWhiteKey: 1 },
    { pitchClass: 6, afterWhiteKey: 3 },
    { pitchClass: 8, afterWhiteKey: 4 },
    { pitchClass: 10, afterWhiteKey: 5 },
  ];

  whitePitchClasses.forEach((pitchClass, index) => {
    const selected = chord.pitchClasses.includes(pitchClass);
    context.fillStyle = selected ? "#c8a76a" : "#f4efe5";
    context.strokeStyle = "#282522";
    context.lineWidth = 3;
    context.fillRect(keyboardX + index * whiteKeyWidth, keyboardY, whiteKeyWidth, whiteKeyHeight);
    context.strokeRect(keyboardX + index * whiteKeyWidth, keyboardY, whiteKeyWidth, whiteKeyHeight);
  });

  blackKeys.forEach(({ pitchClass, afterWhiteKey }) => {
    const selected = chord.pitchClasses.includes(pitchClass);
    context.fillStyle = selected ? "#c8a76a" : "#24211e";
    context.fillRect(keyboardX + (afterWhiteKey + 1) * whiteKeyWidth - 52, keyboardY, 104, 205);
  });

  context.fillStyle = "#f4efe5";
  context.font = "600 30px sans-serif";
  context.fillText(`구성음  ${chord.notes.join("  ·  ")}`, 120, 805);
  context.fillStyle = "#817b72";
  context.font = "24px sans-serif";
  context.fillText(`연습 참고용 · ${SITE_URL.replace("https://", "")}`, 120, 850);

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `piano-chord-${rootId}-${qualityId}.png`);
  }, "image/png");
}

function ChordKeyboard({ chord }: { chord: PianoChord }) {
  return (
    <div>
      <p className="sr-only">
        {chord.symbol} 건반 위치: {chord.notes.join(", ")}
      </p>
      <div
        className="grid grid-cols-12 gap-px overflow-hidden border border-line bg-line"
        aria-hidden="true"
      >
        {PIANO_ROOTS.map((root) => {
          const selected = chord.pitchClasses.includes(root.pitchClass);
          const blackKey = [1, 3, 6, 8, 10].includes(root.pitchClass);
          return (
            <div
              key={root.id}
              className={`flex min-h-32 items-end justify-center px-1 pb-3 text-center text-[0.68rem] font-semibold sm:min-h-44 sm:text-xs ${
                selected
                  ? "bg-brass text-ebony"
                  : blackKey
                    ? "bg-ebony text-faint"
                    : "bg-ivory text-ebony"
              }`}
            >
              {root.preferredName}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-faint">
        한 옥타브의 12개 반음을 같은 폭으로 단순화한 위치 안내입니다. 실제 피아노 건반의
        흰건반·검은건반 너비 비율과는 다릅니다.
      </p>
    </div>
  );
}

function PianoChordChartPage() {
  const [rootId, setRootId] = useState<PianoRootId>("C");
  const [qualityId, setQualityId] = useState<ChordQualityId>("major");
  const [progressionMode, setProgressionMode] = useState<ProgressionMode>("major");
  const chord = useMemo(() => buildPianoChord(rootId, qualityId), [rootId, qualityId]);
  const progressions = useMemo(
    () => buildProgressionSuggestions(rootId, progressionMode),
    [rootId, progressionMode],
  );

  const handleCsvDownload = () => {
    const csv = `\uFEFF${buildFullChordChartCsv()}`;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "piano-chord-chart.csv");
  };

  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">
            홈
          </a>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <a href="/tools" className="hover:text-mute">
            피아노 학습 도구
          </a>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-mute">피아노 코드표</span>
        </nav>

        <header className="mt-10 max-w-4xl">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Interactive chord chart</p>
          <h1 className="mt-4 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 코드표
          </h1>
          <p className="mt-6 max-w-[74ch] text-lg leading-relaxed text-mute">
            12개 근음과 메이저·마이너·7화음·서스 등 11개 코드 종류의 구성음과 전위를 확인하세요.
            선택한 코드는 PNG로, 전체 {fullChordChart.length}개 조합은 CSV로 저장할 수 있습니다.
          </p>
        </header>

        <section
          className="mt-14 border border-line bg-ebony-2 p-6 md:p-9"
          aria-labelledby="chord-finder-title"
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.16em] text-brass uppercase">Chord finder</p>
              <h2 id="chord-finder-title" className="mt-2 font-serif-kr text-3xl font-bold">
                코드 구성음 찾기
              </h2>
            </div>
            <p className="max-w-[48ch] text-sm leading-relaxed text-mute">
              근음 표기는 자주 쓰는 장·단조 조표를 기준으로 선택했습니다. 동음이명은 선택 목록에
              함께 표시합니다.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ivory">근음</span>
              <select
                value={rootId}
                onChange={(event) => setRootId(event.target.value as PianoRootId)}
                className="w-full border border-line bg-ebony px-4 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
              >
                {PIANO_ROOTS.map((root) => (
                  <option key={root.id} value={root.id}>
                    {root.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ivory">코드 종류</span>
              <select
                value={qualityId}
                onChange={(event) => setQualityId(event.target.value as ChordQualityId)}
                className="w-full border border-line bg-ebony px-4 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
              >
                {CHORD_QUALITIES.map((quality) => (
                  <option key={quality.id} value={quality.id}>
                    {quality.label} ({quality.formula})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-10" aria-live="polite">
            <div className="grid gap-6 border-y border-line py-7 md:grid-cols-[0.7fr_1.3fr] md:items-center">
              <div>
                <p className="text-sm text-faint">선택한 코드</p>
                <p className="mt-2 font-latin text-6xl font-semibold text-brass">{chord.symbol}</p>
                <p className="mt-3 text-sm text-mute">
                  {chord.quality.label} · {chord.quality.formula}
                </p>
              </div>
              <div>
                <p className="text-sm text-faint">구성음</p>
                <p className="mt-3 font-serif-kr text-3xl font-semibold text-ivory md:text-4xl">
                  {chord.notes.join(" · ")}
                </p>
              </div>
            </div>
            <div className="mt-8">
              <ChordKeyboard chord={chord} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <button
              type="button"
              onClick={() => downloadChordPng(chord, rootId, qualityId)}
              className="border border-brass bg-brass px-5 py-3 text-sm font-semibold text-ebony transition-colors hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              선택 코드 PNG 저장
            </button>
            <button
              type="button"
              onClick={handleCsvDownload}
              className="border border-line px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              전체 코드표 CSV 다운로드
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="border border-line px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="inversions-title">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Inversions</p>
          <h2 id="inversions-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
            {chord.symbol} 전위와 베이스음
          </h2>
          <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">
            구성음은 같고 가장 낮은 음만 달라집니다. 코드 진행에서는 앞 코드와 가까운 위치를 골라
            손의 이동을 줄여 보세요.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {chord.inversions.map((inversion) => (
              <li key={inversion.name} className="border border-line bg-ebony-2 p-6">
                <span className="text-xs text-brass">{inversion.name}</span>
                <p className="mt-3 font-serif-kr text-xl font-semibold">
                  {inversion.notes.join(" – ")}
                </p>
                <p className="mt-3 text-sm text-mute">베이스음 {inversion.bass}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20" aria-labelledby="progressions-title">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Progression practice</p>
          <h2 id="progressions-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
            {chord.root.preferredName} {progressionMode === "major" ? "장조" : "단조"} 코드 진행
            연습
          </h2>
          <p className="mt-4 max-w-[74ch] leading-relaxed text-mute">
            선택한 근음과 아래 장·단조 기준으로 대표 연습 예시를 제시합니다. 위의 개별 코드 종류와는
            별도이며, 화성 분석의 유일한 정답이나 특정 곡의 반주 악보가 아닙니다.
          </p>
          <label className="mt-7 block max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-ivory">진행 조성</span>
            <select
              value={progressionMode}
              onChange={(event) => setProgressionMode(event.target.value as ProgressionMode)}
              className="w-full border border-line bg-ebony px-4 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            >
              <option value="major">장조</option>
              <option value="minor">단조</option>
            </select>
          </label>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {progressions.map((progression) => (
              <article key={progression.romanNumerals} className="border border-line p-6">
                <p className="text-xs tracking-[0.12em] text-brass uppercase">
                  {progression.romanNumerals}
                </p>
                <h3 className="mt-3 font-serif-kr text-xl font-semibold">{progression.name}</h3>
                <p className="mt-5 text-lg font-semibold text-ivory">
                  {progression.chords.join(" → ")}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-mute">{progression.practiceNote}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="full-chart-title">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Full reference</p>
          <h2 id="full-chart-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
            12근음 전체 피아노 코드표
          </h2>
          <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">
            총 {fullChordChart.length}개 조합입니다. 화면에서는 펼쳐 확인하고, 정렬·필터가 필요하면
            위의 CSV 파일을 내려받아 사용하세요.
          </p>
          <details className="mt-8 border border-line">
            <summary className="cursor-pointer px-6 py-5 font-semibold text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass">
              전체 코드표 펼치기
            </summary>
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                <caption className="sr-only">
                  12개 근음과 11개 코드 종류의 기호, 공식, 구성음, 전위
                </caption>
                <thead className="bg-ebony-2 text-faint">
                  <tr>
                    {["근음", "종류", "기호", "공식", "구성음", "전위"].map((heading) => (
                      <th key={heading} scope="col" className="border-b border-line px-4 py-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fullChordChart.map((row) => (
                    <tr key={`${row.root}-${row.quality}`} className="border-b border-line/70">
                      <th scope="row" className="px-4 py-4 font-semibold text-ivory">
                        {row.enharmonicRoot}
                      </th>
                      <td className="px-4 py-4 text-mute">{row.quality}</td>
                      <td className="px-4 py-4 font-semibold text-brass">{row.symbol}</td>
                      <td className="px-4 py-4 text-mute">{row.formula}</td>
                      <td className="px-4 py-4 text-ivory">{row.tones}</td>
                      <td className="max-w-[34rem] px-4 py-4 leading-relaxed text-mute">
                        {row.inversions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <section className="mt-20 max-w-4xl" aria-labelledby="chord-faq-title">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">FAQ</p>
          <h2 id="chord-faq-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
            피아노 코드표 자주 묻는 질문
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {CHORD_FAQ.map((item) => (
              <details key={item.question} className="py-6">
                <summary className="cursor-pointer list-none pr-8 font-serif-kr text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass">
                  {item.question}
                </summary>
                <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <PageAuthorityRecord
          className="mt-20"
          title="피아노 코드표 작성·운영 기준"
          answer="12개 근음과 11개 코드 종류를 음정 공식으로 계산해 132개 구성음·전위를 제공하며, 선택 결과와 전체 표를 다시 사용할 수 있게 공개합니다."
          audience="피아노 코드의 구성음·전위·대표 진행을 건반과 표로 확인하려는 입문·초중급 학습자"
          scope="12평균율 건반 위치, 대표 화성 철자, 기본 위치·전위와 장·단조 진행 연습 예시를 다룹니다."
          boundary="동음이명 표기와 실제 보이싱은 조성·악곡에 따라 달라질 수 있으며, 제시한 진행은 유일한 정답이나 곡별 반주 처방이 아닙니다."
          lastModified={page.lastModified}
          authorLabel="작성·운영"
          authorName={`${SITE.brand} 사이트 운영팀`}
          authorHref="/editorial-policy"
          dateLabel="최종 수정일"
          reviewStatus="외부·전문가 독립 검토 전"
        />
      </div>
    </SubPageShell>
  );
}
