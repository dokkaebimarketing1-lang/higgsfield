import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SubPageShell } from "../../components/site/chrome";
import { PageAuthorityRecord } from "../../components/site/page-authority-record";
import { SITE, SITE_URL } from "../../lib/content";
import {
  SITE_LESSON_PRESETS,
  calculateLessonCost,
  type LessonCostInput,
} from "../../lib/piano-tools";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/tools/piano-lesson-cost-calculator")!;
const defaultPreset = SITE_LESSON_PRESETS[0]!;

const COST_FAQ = [
  {
    question: "피아노 레슨비는 어떻게 같은 기준으로 비교하나요?",
    answer:
      "월 비용만 보지 말고 월 수업 횟수와 회당 수업 시간을 함께 입력하세요. 계산기는 월 총비용을 총 수업 시간으로 나눠 회당, 분당, 60분 환산 비용을 같은 기준으로 보여줍니다.",
  },
  {
    question: "월 추가 비용에는 무엇을 입력하나요?",
    answer:
      "매월 반복되는 교재비, 이동비, 시설비처럼 비교에 포함하려는 비용을 합산해 입력합니다. 콩쿠르 참가비처럼 매월 발생하지 않는 비용은 발생 주기에 맞춰 별도로 판단해야 합니다.",
  },
  {
    question: "계산 결과가 서울 피아노 학원비 평균인가요?",
    answer:
      "아닙니다. 입력값을 정해진 공식으로 환산한 결과입니다. 연결된 서울시 행정자료 페이지의 값도 등록 교습비 분석이며 실제 결제액이나 개인과외 시장 평균을 뜻하지 않습니다.",
  },
  {
    question: "60분 환산 비용과 실제 60분 레슨비는 같은가요?",
    answer:
      "같다고 단정할 수 없습니다. 60분 환산은 비교를 위한 산술값입니다. 수업 시간이 길어질 때 요금이 정확히 비례한다는 뜻이 아니며, 피드백 범위와 수업 방식도 함께 비교해야 합니다.",
  },
] as const;

export const Route = createFileRoute("/tools/piano-lesson-cost-calculator")({
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
                name: "피아노 레슨비 계산기",
                description:
                  "월 레슨비, 월 수업 횟수, 회당 수업 시간과 월 추가 비용을 회당·분당·60분 기준으로 환산하는 무료 계산기",
                url: `${SITE_URL}${page.path}`,
                applicationCategory: "FinanceApplication",
                applicationSubCategory: "Lesson cost comparison calculator",
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
                  "월 총비용 계산",
                  "회당 레슨비 계산",
                  "분당 비용 계산",
                  "60분 환산 비용 계산",
                  "현재 공개 레슨 과정 불러오기",
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
                    name: "피아노 레슨비 계산기",
                    item: `${SITE_URL}${page.path}`,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${SITE_URL}${page.path}#faq`,
                mainEntity: COST_FAQ.map((item) => ({
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
  component: PianoLessonCostCalculatorPage,
});

function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatDecimalKrw(value: number) {
  return `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value)}원`;
}

function parseNumericInput(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function PianoLessonCostCalculatorPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>(defaultPreset.name);
  const [monthlyFee, setMonthlyFee] = useState(String(defaultPreset.monthlyFee));
  const [sessionsPerMonth, setSessionsPerMonth] = useState(String(defaultPreset.sessionsPerMonth));
  const [minutesPerSession, setMinutesPerSession] = useState(
    String(defaultPreset.minutesPerSession),
  );
  const [monthlyExtraCost, setMonthlyExtraCost] = useState(String(defaultPreset.monthlyExtraCost));

  const numericInput = useMemo<LessonCostInput>(
    () => ({
      monthlyFee: parseNumericInput(monthlyFee),
      sessionsPerMonth: parseNumericInput(sessionsPerMonth),
      minutesPerSession: parseNumericInput(minutesPerSession),
      monthlyExtraCost: parseNumericInput(monthlyExtraCost),
    }),
    [monthlyFee, sessionsPerMonth, minutesPerSession, monthlyExtraCost],
  );
  const result = useMemo(() => calculateLessonCost(numericInput), [numericInput]);

  const selectPreset = (name: string) => {
    setSelectedPreset(name);
    const preset = SITE_LESSON_PRESETS.find((item) => item.name === name);
    if (!preset) return;
    setMonthlyFee(String(preset.monthlyFee));
    setSessionsPerMonth(String(preset.sessionsPerMonth));
    setMinutesPerSession(String(preset.minutesPerSession));
    setMonthlyExtraCost(String(preset.monthlyExtraCost));
  };

  const markCustom = (setter: (value: string) => void, value: string) => {
    setSelectedPreset("직접 입력");
    setter(value);
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
          <span className="text-mute">피아노 레슨비 계산기</span>
        </nav>

        <header className="mt-10 max-w-4xl">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Lesson cost calculator</p>
          <h1 className="mt-4 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 레슨비 계산기
          </h1>
          <p className="mt-6 max-w-[74ch] text-lg leading-relaxed text-mute">
            월 레슨비만 비교하면 수업 횟수와 시간이 가려집니다. 월 비용, 수업 횟수, 회당 시간,
            반복되는 추가 비용을 입력해 월 총비용과 회당·분당·60분 환산 비용을 같은 기준으로
            확인하세요.
          </p>
        </header>

        <section
          className="mt-14 grid gap-8 border border-line bg-ebony-2 p-6 md:p-9 lg:grid-cols-[0.9fr_1.1fr]"
          aria-labelledby="calculator-title"
        >
          <div>
            <p className="text-xs tracking-[0.16em] text-brass uppercase">Your inputs</p>
            <h2 id="calculator-title" className="mt-2 font-serif-kr text-3xl font-bold">
              비교 조건 입력
            </h2>

            <label className="mt-7 block">
              <span className="mb-2 block text-sm font-semibold text-ivory">
                공개 과정 불러오기
              </span>
              <select
                value={selectedPreset}
                onChange={(event) => selectPreset(event.target.value)}
                className="w-full border border-line bg-ebony px-4 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
              >
                <option value="직접 입력">직접 입력</option>
                {SITE_LESSON_PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name} · {formatKrw(preset.monthlyFee)} · {preset.minutesPerSession}분
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-relaxed text-faint">
                이 사이트의{" "}
                <a
                  href="/pricing"
                  className="text-brass underline underline-offset-4 hover:text-ivory"
                >
                  피아노 레슨비 페이지
                </a>
                에 공개된 월 4회 과정을 불러옵니다.
              </span>
            </label>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ivory">월 레슨비</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="decimal"
                    value={monthlyFee}
                    onChange={(event) => markCustom(setMonthlyFee, event.target.value)}
                    aria-describedby="monthly-fee-help"
                    className="w-full border border-line bg-ebony px-4 py-3 pr-10 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-faint">
                    원
                  </span>
                </div>
                <span id="monthly-fee-help" className="mt-2 block text-xs text-faint">
                  추가 비용을 제외한 월 기본 금액
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ivory">월 수업 횟수</span>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={sessionsPerMonth}
                    onChange={(event) => markCustom(setSessionsPerMonth, event.target.value)}
                    className="w-full border border-line bg-ebony px-4 py-3 pr-10 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-faint">
                    회
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ivory">회당 수업 시간</span>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="5"
                    inputMode="numeric"
                    value={minutesPerSession}
                    onChange={(event) => markCustom(setMinutesPerSession, event.target.value)}
                    className="w-full border border-line bg-ebony px-4 py-3 pr-10 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-faint">
                    분
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ivory">월 추가 비용</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="decimal"
                    value={monthlyExtraCost}
                    onChange={(event) => markCustom(setMonthlyExtraCost, event.target.value)}
                    aria-describedby="extra-cost-help"
                    className="w-full border border-line bg-ebony px-4 py-3 pr-10 text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-faint">
                    원
                  </span>
                </div>
                <span id="extra-cost-help" className="mt-2 block text-xs text-faint">
                  매월 반복해 비교할 비용의 합계
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="text-xs tracking-[0.16em] text-brass uppercase">Calculated result</p>
            <h2 className="mt-2 font-serif-kr text-3xl font-bold">환산 결과</h2>

            {result ? (
              <div className="mt-7" aria-live="polite">
                <div className="border border-brass/50 bg-ebony p-6">
                  <p className="text-sm text-faint">월 총비용</p>
                  <p className="mt-2 font-latin text-4xl font-semibold text-brass md:text-5xl">
                    {formatKrw(result.monthlyTotal)}
                  </p>
                  <p className="mt-3 text-sm text-mute">
                    기본 {formatKrw(result.monthlyFee)} + 추가 {formatKrw(result.monthlyExtraCost)}
                  </p>
                </div>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="border border-line p-5">
                    <dt className="text-sm text-faint">회당 총비용</dt>
                    <dd className="mt-2 font-serif-kr text-2xl font-semibold text-ivory">
                      {formatKrw(result.allInPerSession)}
                    </dd>
                    <p className="mt-2 text-xs text-mute">
                      기본 레슨비만 {formatKrw(result.tuitionPerSession)}
                    </p>
                  </div>
                  <div className="border border-line p-5">
                    <dt className="text-sm text-faint">분당 총비용</dt>
                    <dd className="mt-2 font-serif-kr text-2xl font-semibold text-ivory">
                      {formatDecimalKrw(result.allInPerMinute)}
                    </dd>
                    <p className="mt-2 text-xs text-mute">
                      월 총 {new Intl.NumberFormat("ko-KR").format(result.totalMinutesPerMonth)}분
                    </p>
                  </div>
                  <div className="border border-line p-5 sm:col-span-2">
                    <dt className="text-sm text-faint">60분 환산 총비용</dt>
                    <dd className="mt-2 font-serif-kr text-2xl font-semibold text-ivory">
                      {formatKrw(result.allInHourlyEquivalent)}
                    </dd>
                    <p className="mt-2 text-xs leading-relaxed text-mute">
                      분당 총비용 × 60의 비교용 산술값이며, 실제 60분 상품 가격을 뜻하지 않습니다.
                    </p>
                  </div>
                </dl>

                <div className="mt-5 border-l-2 border-brass pl-5 text-sm leading-relaxed text-mute">
                  <p>
                    <strong className="text-ivory">계산식:</strong> 월 총비용 = 월 레슨비 + 월 추가
                    비용
                  </p>
                  <p className="mt-1">
                    회당 = 월 총비용 ÷ 월 횟수 · 분당 = 월 총비용 ÷ (월 횟수 × 회당 분)
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    화면 표시는 회당·60분 환산은 가장 가까운 1원, 분당은 소수 첫째 자리에서
                    반올림합니다.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="mt-7 border border-line bg-ebony p-6 text-sm leading-relaxed text-mute"
                role="alert"
              >
                월 레슨비와 추가 비용은 0원 이상, 월 횟수와 회당 시간은 0보다 큰 숫자로 입력해
                주세요.
              </div>
            )}
          </div>
        </section>

        <section
          className="mt-16 border-l-2 border-brass bg-ebony-2 p-6 md:p-8"
          aria-labelledby="interpretation-boundary-title"
        >
          <p className="text-xs tracking-[0.16em] text-brass uppercase">Interpretation boundary</p>
          <h2
            id="interpretation-boundary-title"
            className="mt-3 font-serif-kr text-2xl font-bold md:text-3xl"
          >
            계산값과 시장 통계를 구분합니다
          </h2>
          <p className="mt-4 max-w-[76ch] leading-relaxed text-mute">
            이 결과는 사용자가 입력한 비용을 나눈 값이며 피아노 학원·개인과외 시장 평균이나 적정가격
            판정이 아닙니다. 수업 형태, 강사 경력, 이동, 피드백, 교재와 시설 조건도 숫자에 포함되지
            않습니다.
          </p>
          <p className="mt-4 max-w-[76ch] leading-relaxed text-mute">
            별도로 공개한{" "}
            <a
              href="/research/2026-seoul-piano-academy-fees"
              className="font-semibold text-brass underline underline-offset-4 hover:text-ivory"
            >
              2026 서울 피아노 학원·교습소 등록 교습비 분석
            </a>
            은 서울특별시교육청 행정자료에 등록된 교습상품을 집계한 것입니다. 할인·교재비가 반영된
            실제 결제액, 개인과외 가격, 전체 시장 평균으로 해석하지 않습니다.
          </p>
        </section>

        <section
          className="mt-20 grid gap-8 md:grid-cols-3"
          aria-labelledby="comparison-guide-title"
        >
          <div className="md:col-span-3">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Comparison guide</p>
            <h2
              id="comparison-guide-title"
              className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl"
            >
              레슨비 외에 함께 확인할 기준
            </h2>
          </div>
          {[
            {
              title: "수업에 포함된 피드백",
              body: "영상 피드백, 온라인 질문, 교재 안내가 월 비용에 포함되는지 확인합니다.",
            },
            {
              title: "결석·보강 기준",
              body: "월 횟수뿐 아니라 일정 변경, 보강, 휴강 기준을 등록 전에 확인합니다.",
            },
            {
              title: "목표와 수업 방식",
              body: "취미·입시 목표, 1:1·그룹 여부, 방문·온라인 방식이 같은 조건인지 비교합니다.",
            },
          ].map((item) => (
            <article key={item.title} className="border-t border-line pt-6">
              <h3 className="font-serif-kr text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mute">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 max-w-4xl" aria-labelledby="cost-faq-title">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">FAQ</p>
          <h2 id="cost-faq-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
            피아노 레슨비 계산 자주 묻는 질문
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {COST_FAQ.map((item) => (
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
          title="레슨비 계산기 작성·운영 기준"
          answer="월 레슨비와 추가 비용을 월 횟수·회당 시간으로 나눠 월 총액, 회당, 분당, 60분 환산값을 같은 공식으로 계산합니다."
          audience="피아노 레슨의 가격표와 실제 수업 조건을 같은 단위로 비교하려는 학습자·보호자"
          scope="사용자 입력과 현재 사이트 공개 요금제를 산술 환산하며 계산식과 입력값을 함께 표시합니다."
          boundary="계산 결과는 시장 평균·적정 가격·수업 품질을 판정하지 않습니다. 서울 행정자료도 학원·교습소 등록값이며 개인과외 실제 결제액이 아닙니다."
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
