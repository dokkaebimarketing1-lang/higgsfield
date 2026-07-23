import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import { PageAuthorityRecord } from "../../components/site/page-authority-record";
import { SITE, SITE_URL } from "../../lib/content";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/tools")!;

const TOOL_ITEMS = [
  {
    href: "/tools/piano-chord-chart",
    eyebrow: "Harmony reference",
    title: "피아노 코드표",
    description:
      "12개 근음과 11개 코드 종류의 구성음, 전위, 자주 쓰는 진행을 확인하고 선택 코드는 PNG, 전체 표는 CSV로 저장합니다.",
    outputs: ["구성음·음정 공식", "기본 위치·전위", "PNG·CSV·인쇄"],
  },
  {
    href: "/tools/piano-lesson-cost-calculator",
    eyebrow: "Cost comparison",
    title: "피아노 레슨비 계산기",
    description:
      "월 레슨비, 월 수업 횟수, 회당 시간, 월 추가 비용을 같은 기준으로 환산해 회당·분당·시간당 비용을 비교합니다.",
    outputs: ["월 총비용", "회당 총비용", "분당·60분 환산"],
  },
] as const;

const TOOLS_FAQ = [
  {
    question: "피아노 학습 도구는 무료로 사용할 수 있나요?",
    answer:
      "네. 코드표 조회, 선택 코드 PNG 저장, 전체 코드표 CSV 다운로드, 레슨비 환산 계산을 회원가입 없이 사용할 수 있습니다.",
  },
  {
    question: "레슨비 계산 결과가 피아노 레슨 시장 평균인가요?",
    answer:
      "아닙니다. 사용자가 입력한 금액을 수업 횟수와 시간으로 나눈 산술 결과입니다. 별도의 서울 학원·교습소 행정자료 분석도 개인과외 시장 평균을 뜻하지 않습니다.",
  },
  {
    question: "코드표의 진행 예시는 정답으로 정해진 반주인가요?",
    answer:
      "아닙니다. 조성 감각과 보이스 리딩을 연습하기 위한 대표 예시입니다. 곡의 멜로디, 장르, 조성에 따라 다른 화음과 전위를 선택할 수 있습니다.",
  },
] as const;

export const Route = createFileRoute("/tools/")({
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
                "@id": `${SITE_URL}/tools#webpage`,
                url: `${SITE_URL}/tools`,
                name: page.title,
                description: page.description,
                inLanguage: "ko",
                dateModified: page.lastModified,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                breadcrumb: { "@id": `${SITE_URL}/tools#breadcrumb` },
                mainEntity: { "@id": `${SITE_URL}/tools#tool-list` },
              },
              {
                "@type": "ItemList",
                "@id": `${SITE_URL}/tools#tool-list`,
                name: "피아노 학습 도구 목록",
                numberOfItems: TOOL_ITEMS.length,
                itemListElement: TOOL_ITEMS.map((tool, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: tool.title,
                  url: `${SITE_URL}${tool.href}`,
                })),
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}/tools#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 학습 도구",
                    item: `${SITE_URL}/tools`,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${SITE_URL}/tools#faq`,
                mainEntity: TOOLS_FAQ.map((item) => ({
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
  component: ToolsHubPage,
});

function ToolsHubPage() {
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
          <span className="text-mute">피아노 학습 도구</span>
        </nav>

        <header className="mt-10 max-w-4xl">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Practice utilities</p>
          <h1 className="mt-4 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 학습 도구
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            피아노 코드를 찾고 레슨비를 같은 단위로 비교할 때 필요한 계산 과정을 공개합니다. 결과를
            그대로 믿게 만드는 점수나 추천 순위 대신, 입력값·공식·해석 범위를 함께 보여줍니다.
          </p>
        </header>

        <section className="mt-14 grid gap-5 md:grid-cols-2" aria-label="피아노 도구 목록">
          {TOOL_ITEMS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="group flex min-h-[23rem] flex-col border border-line bg-ebony-2 p-7 transition-colors hover:border-brass/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass md:p-9"
            >
              <span className="text-xs tracking-[0.16em] text-brass uppercase">{tool.eyebrow}</span>
              <h2 className="mt-5 font-serif-kr text-3xl font-bold transition-colors group-hover:text-brass">
                {tool.title}
              </h2>
              <p className="mt-5 max-w-[54ch] leading-relaxed text-mute">{tool.description}</p>
              <ul
                className="mt-8 space-y-2 text-sm text-ivory"
                aria-label={`${tool.title} 제공 기능`}
              >
                {tool.outputs.map((output) => (
                  <li key={output} className="flex items-center gap-3">
                    <span className="h-px w-5 bg-brass" aria-hidden="true" />
                    {output}
                  </li>
                ))}
              </ul>
              <span className="mt-auto pt-10 text-sm font-semibold text-brass">
                {tool.title} 사용하기 →
              </span>
            </a>
          ))}
        </section>

        <section className="mt-20 grid gap-8 border-y border-line py-12 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "계산 근거 공개",
              body: "코드의 음정 공식과 비용 환산식을 결과 옆에 표시해 다시 계산할 수 있습니다.",
            },
            {
              number: "02",
              title: "다운로드 가능",
              body: "코드는 PNG와 전체 CSV로 저장하고, 브라우저 인쇄에서 PDF로 보관할 수 있습니다.",
            },
            {
              number: "03",
              title: "해석 경계 표시",
              body: "연습 예시와 시장 통계, 사용자가 입력한 계산 결과를 서로 섞지 않습니다.",
            },
          ].map((item) => (
            <div key={item.number}>
              <span className="font-latin text-sm text-brass">{item.number}</span>
              <h2 className="mt-3 font-serif-kr text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-mute">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 max-w-4xl" aria-labelledby="tools-faq-title">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">FAQ</p>
          <h2 id="tools-faq-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
            도구 사용 전 확인하세요
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {TOOLS_FAQ.map((item) => (
              <details key={item.question} className="group py-6">
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
          title="피아노 도구 작성·운영 기준"
          answer="코드 구성음은 공개된 음정 공식으로 다시 계산할 수 있고, 레슨비 결과는 사용자가 입력한 금액·횟수·시간만 산술 환산합니다."
          audience="피아노 코드를 연습하거나 서로 다른 레슨 조건을 같은 단위로 비교하려는 학습자·보호자"
          scope="무료 코드표·다운로드·비용 계산 기능과 각 결과의 계산 근거를 제공합니다."
          boundary="코드 진행은 연습 예시이며, 계산 결과와 서울 등록 교습비 자료는 개인 레슨 시장 평균·추천·성과 보장을 뜻하지 않습니다."
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
