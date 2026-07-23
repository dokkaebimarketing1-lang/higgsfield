import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SubPageShell } from "../../components/site/chrome";
import { PageAuthorityRecord } from "../../components/site/page-authority-record";
import {
  EvidenceBadge,
  LimitationNotice,
  ResearchBreadcrumb,
  ResearchFaq,
} from "../../components/site/research-ui";
import { SITE, SITE_URL } from "../../lib/content";
import {
  PRACTICE_MINUTE_FIELDS,
  PRACTICE_PLANNER_FAQ,
  RESOURCE_UPDATED_AT,
  buildPracticePlannerCsv,
  createEmptyPracticeWeek,
  getPracticeDayTotal,
  getPracticeWeekTotals,
  normalizePracticeMinutes,
  type PracticeDayEntry,
  type PracticeMinuteField,
} from "../../lib/piano-resources";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/resources/piano-practice-planner")!;
const canonical = `${SITE_URL}${page.path}`;

export const Route = createFileRoute("/resources/piano-practice-planner")({
  head: () => {
    const publicHead = buildPublicPageHead(page);
    return {
      ...publicHead,
      meta: [...publicHead.meta, { name: "author", content: SITE.brand }],
      scripts: [
        {
          type: "application/ld+json",
          children: safeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": `${canonical}#webpage`,
                url: canonical,
                name: page.title,
                description: page.description,
                inLanguage: "ko",
                datePublished: RESOURCE_UPDATED_AT,
                dateModified: RESOURCE_UPDATED_AT,
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                isPartOf: { "@id": `${SITE_URL}/#website` },
                breadcrumb: { "@id": `${canonical}#breadcrumb` },
                mainEntity: { "@id": `${canonical}#application` },
              },
              {
                "@type": "WebApplication",
                "@id": `${canonical}#application`,
                name: "주간 피아노 연습 플래너",
                description:
                  "요일별 피아노 연습 목표와 영역별 시간을 기록하고 주간 합계를 계산해 CSV 또는 인쇄용 PDF로 보관하는 브라우저 도구",
                url: canonical,
                applicationCategory: "EducationalApplication",
                applicationSubCategory: "Practice planner",
                operatingSystem: "Any",
                browserRequirements: "JavaScript를 지원하는 최신 웹 브라우저",
                isAccessibleForFree: true,
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "KRW",
                },
                featureList: [
                  "요일별 목표와 메모",
                  "몸풀기·테크닉·곡·초견 및 이론 시간 기록",
                  "일간·주간 합계 자동 계산",
                  "작성 내용 CSV 다운로드",
                  "인쇄 및 PDF 저장",
                ],
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${canonical}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 학습 자료",
                    item: `${SITE_URL}/resources`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "주간 피아노 연습 플래너",
                    item: canonical,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${canonical}#faq`,
                mainEntity: PRACTICE_PLANNER_FAQ.map((item) => ({
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
  component: PianoPracticePlannerPage,
});

function downloadPlannerCsv(entries: readonly PracticeDayEntry[]) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const blob = new Blob([buildPracticePlannerCsv(entries)], {
    type: "text/csv;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "piano-practice-planner.csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function printPlanner() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

function PianoPracticePlannerPage() {
  const [entries, setEntries] = useState<PracticeDayEntry[]>(createEmptyPracticeWeek);
  const [status, setStatus] = useState(
    "입력 내용은 이 브라우저 탭에만 있으며 새로고침하면 사라질 수 있습니다.",
  );
  const totals = useMemo(() => getPracticeWeekTotals(entries), [entries]);

  const updateText = (index: number, field: "goal" | "reflection", value: string) => {
    setEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const updateMinutes = (index: number, field: PracticeMinuteField, value: string) => {
    setEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: normalizePracticeMinutes(value) } : entry,
      ),
    );
  };

  const resetPlanner = () => {
    setEntries(createEmptyPracticeWeek());
    setStatus("이번 주 입력 내용을 초기화했습니다.");
  };

  const savePlanner = () => {
    downloadPlannerCsv(entries);
    setStatus("현재 입력 내용으로 CSV 다운로드를 요청했습니다.");
  };

  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[
            { label: "피아노 학습 자료", href: "/resources" },
            { label: "주간 피아노 연습 플래너" },
          ]}
        />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>가입 없이 브라우저에서 바로 작성합니다</EvidenceBadge>
          <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            주간 피아노 연습 플래너
          </h1>
          <p className="mt-6 max-w-[74ch] text-lg leading-relaxed text-mute">
            매일 오래 치는 것보다 무엇을 확인할지 먼저 정해 보세요. 요일별 목표와 몸풀기, 테크닉,
            곡, 초견·이론 시간을 입력하면 일간·주간 합계를 계산하고 작성한 내용을 CSV 또는 인쇄용
            PDF로 보관할 수 있습니다.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-faint">
            발행·운영{" "}
            <a href="/editorial-policy" className="text-brass underline underline-offset-4">
              {SITE.brand} 사이트 운영팀
            </a>{" "}
            · 최종 수정일 <time dateTime={RESOURCE_UPDATED_AT}>{RESOURCE_UPDATED_AT}</time> ·
            외부·전문가 독립 검토 전
          </p>
        </header>

        <section className="mt-14" aria-labelledby="privacy-title">
          <h2 id="privacy-title" className="sr-only">
            입력 정보 처리 안내
          </h2>
          <LimitationNotice>
            <strong className="text-ivory">입력 정보 처리:</strong> 이 플래너는 이름·연락처를
            요구하지 않습니다. 입력 내용은 현재 브라우저 탭의 메모리에서만 계산하며 서버로
            전송하거나 쿠키·로컬 저장소에 보관하지 않습니다. 새로고침 또는 탭 종료 전에 필요한
            내용을 CSV나 PDF로 저장하세요.
          </LimitationNotice>
        </section>

        <section className="mt-16" aria-labelledby="planner-title">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Weekly plan</p>
              <h2 id="planner-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
                이번 주 연습 계획
              </h2>
            </div>
            <a
              href="/data/resources/piano-practice-planner-template.csv"
              download
              className="text-sm font-medium text-brass underline underline-offset-4 print:hidden"
            >
              빈 CSV 템플릿 내려받기
            </a>
          </div>

          <div className="mt-8 space-y-5">
            {entries.map((entry, index) => {
              const dayId = `practice-day-${index}`;
              return (
                <fieldset
                  key={entry.day}
                  className="border border-line bg-ebony-2 p-5 md:p-7"
                  aria-describedby={`${dayId}-total`}
                >
                  <legend className="px-2 font-serif-kr text-xl font-semibold text-ivory">
                    {entry.day}
                  </legend>

                  <div className="mt-2 grid gap-5 lg:grid-cols-[1.2fr_2fr]">
                    <label className="block text-sm text-mute" htmlFor={`${dayId}-goal`}>
                      오늘의 한 가지 목표
                      <input
                        id={`${dayId}-goal`}
                        type="text"
                        value={entry.goal}
                        maxLength={80}
                        onChange={(event) => updateText(index, "goal", event.currentTarget.value)}
                        placeholder="예: 왼손 반주를 느린 박으로 연결하기"
                        className="mt-2 min-h-12 w-full border border-line bg-ebony px-4 py-3 text-base text-ivory outline-none placeholder:text-faint focus:border-brass"
                      />
                    </label>

                    <div>
                      <p className="text-sm text-mute">영역별 시간</p>
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {PRACTICE_MINUTE_FIELDS.map((field) => (
                          <label
                            key={field.key}
                            className="block text-xs text-faint"
                            htmlFor={`${dayId}-${field.key}`}
                          >
                            {field.label} (분)
                            <input
                              id={`${dayId}-${field.key}`}
                              type="number"
                              min={0}
                              max={300}
                              step={5}
                              inputMode="numeric"
                              value={entry[field.key]}
                              onChange={(event) =>
                                updateMinutes(index, field.key, event.currentTarget.value)
                              }
                              className="mt-2 min-h-12 w-full border border-line bg-ebony px-3 py-2 text-base text-ivory outline-none focus:border-brass"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="mt-5 block text-sm text-mute" htmlFor={`${dayId}-reflection`}>
                    연습 뒤 메모
                    <textarea
                      id={`${dayId}-reflection`}
                      value={entry.reflection}
                      maxLength={240}
                      rows={2}
                      onChange={(event) =>
                        updateText(index, "reflection", event.currentTarget.value)
                      }
                      placeholder="잘 된 점, 다음에 다시 볼 마디, 몸의 긴장을 짧게 기록하세요."
                      className="mt-2 w-full resize-y border border-line bg-ebony px-4 py-3 text-base leading-relaxed text-ivory outline-none placeholder:text-faint focus:border-brass"
                    />
                  </label>

                  <p id={`${dayId}-total`} className="mt-4 text-right text-sm text-mute">
                    {entry.day} 합계{" "}
                    <strong className="font-serif-kr text-xl text-ivory">
                      {getPracticeDayTotal(entry)}분
                    </strong>
                  </p>
                </fieldset>
              );
            })}
          </div>
        </section>

        <section
          className="mt-10 border border-brass/40 bg-brass/8 p-6 md:p-8"
          aria-labelledby="weekly-total-title"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.16em] text-brass uppercase">Weekly total</p>
              <h2 id="weekly-total-title" className="mt-2 font-serif-kr text-2xl font-bold">
                주간 총 연습 {totals.grandTotal}분
              </h2>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              {PRACTICE_MINUTE_FIELDS.map((field) => (
                <div key={field.key}>
                  <dt className="text-faint">{field.label}</dt>
                  <dd className="mt-1 font-medium text-ivory">{totals.byCategory[field.key]}분</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3 print:hidden" aria-label="플래너 저장과 초기화">
          <button
            type="button"
            onClick={savePlanner}
            className="inline-flex min-h-12 items-center justify-center bg-brass px-5 py-3 text-sm font-semibold text-ebony transition-colors hover:bg-[#cdb07a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            작성 내용 CSV 저장
          </button>
          <button
            type="button"
            onClick={printPlanner}
            className="inline-flex min-h-12 items-center justify-center border border-line px-5 py-3 text-sm font-medium text-ivory transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            인쇄·PDF 저장
          </button>
          <button
            type="button"
            onClick={resetPlanner}
            className="inline-flex min-h-12 items-center justify-center px-5 py-3 text-sm font-medium text-mute underline decoration-line underline-offset-4 transition-colors hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            입력 초기화
          </button>
        </div>
        <p className="mt-3 text-sm text-faint print:hidden" role="status" aria-live="polite">
          {status}
        </p>

        <section className="mt-20 border-y border-line py-12" aria-labelledby="planner-use-title">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Planning notes</p>
              <h2 id="planner-use-title" className="mt-3 font-serif-kr text-3xl font-bold">
                시간보다 확인할 결과를 적습니다
              </h2>
            </div>
            <ul className="space-y-4 text-sm leading-relaxed text-mute">
              <li>
                목표는 “30분 연습”보다 “8마디 왼손을 느린 박에서 세 번 연결”처럼 확인 가능한
                문장으로 씁니다.
              </li>
              <li>
                연습 시간 합계는 노력의 기록이지 실력이나 성과 점수가 아닙니다. 소리와 몸의 상태를
                함께 메모하세요.
              </li>
              <li>
                오래 반복해 통증·저림·과도한 긴장이 생기면 시간을 채우지 말고 중단합니다. 이 도구는
                건강 진단이나 치료 조언을 제공하지 않습니다.
              </li>
            </ul>
          </div>
          <p className="mt-8 text-sm leading-relaxed text-mute">
            현재 단계에서 무엇을 연습할지 정하기 어렵다면{" "}
            <a
              href="/resources/piano-level-roadmap"
              className="text-brass underline underline-offset-4"
            >
              피아노 수준별 학습 로드맵
            </a>
            의 체크리스트를 먼저 확인하세요.
          </p>
        </section>

        <PageAuthorityRecord
          className="mt-20"
          title="주간 연습 플래너 작성·운영 기준"
          answer="요일별 목표와 몸풀기·테크닉·곡·초견 시간을 분리해 주간 합계를 계산하고, 입력 내용을 서버에 보내지 않은 채 CSV나 인쇄본으로 보관하게 합니다."
          audience="피아노 연습 목표와 시간을 주간 단위로 기록하고 직접 점검하려는 학습자·보호자"
          scope="브라우저 메모리에서 입력값을 계산하고 CSV 생성·인쇄·초기화 기능과 기록 방법을 제공합니다."
          boundary="연습 시간 합계는 실력이나 성과 점수가 아니며, 통증·긴장에 대한 건강 진단이나 개인별 연습 처방을 제공하지 않습니다."
          lastModified={RESOURCE_UPDATED_AT}
          authorLabel="작성·운영"
          authorName={`${SITE.brand} 사이트 운영팀`}
          authorHref="/editorial-policy"
          dateLabel="최종 수정일"
          reviewStatus="외부·전문가 독립 검토 전"
        />

        <ResearchFaq
          id="practice-planner-faq-title"
          title="피아노 연습 플래너 자주 묻는 질문"
          items={PRACTICE_PLANNER_FAQ}
        />
      </div>
    </SubPageShell>
  );
}
