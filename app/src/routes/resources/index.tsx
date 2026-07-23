import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import { PageAuthorityRecord } from "../../components/site/page-authority-record";
import { ResearchBreadcrumb, ResearchFaq } from "../../components/site/research-ui";
import { SITE, SITE_URL } from "../../lib/content";
import { RESOURCE_UPDATED_AT } from "../../lib/piano-resources";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { buildCollectionPageSchema, safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/resources")!;

const resourceItems = [
  {
    path: "/resources/piano-level-roadmap",
    name: "피아노 수준별 학습 로드맵",
    type: "진단·학습 설계",
    description:
      "교재 번호 대신 읽기, 리듬, 양손 협응, 이론, 스스로 연습하는 능력으로 현재 단계를 확인합니다.",
    action: "로드맵과 CSV 보기",
  },
  {
    path: "/resources/piano-practice-planner",
    name: "주간 피아노 연습 플래너",
    type: "브라우저 도구",
    description:
      "요일별 목표와 연습 시간을 입력하고 주간 합계를 확인한 뒤 CSV 또는 인쇄용 PDF로 보관합니다.",
    action: "이번 주 계획 세우기",
  },
  {
    path: "/tools/piano-chord-chart",
    name: "피아노 코드표",
    type: "인터랙티브 코드 사전",
    description: "12개 근음과 11개 코드 종류의 구성음·전위·진행을 확인하고 PNG·CSV로 저장합니다.",
    action: "코드표 사용하기",
  },
  {
    path: "/tools/piano-lesson-cost-calculator",
    name: "피아노 레슨비 계산기",
    type: "비용 비교 도구",
    description:
      "월 비용, 횟수, 수업 시간과 추가 비용을 같은 단위로 바꿔 회당·분당·시간 환산 비용을 확인합니다.",
    action: "레슨비 계산하기",
  },
  {
    path: "/research",
    name: "피아노 통계 자료실",
    type: "공식 데이터·가공 CSV",
    description:
      "공식 원자료, 직접 식별정보를 제외한 가공 CSV, 계산 방법, 한계와 수정 이력을 함께 확인합니다.",
    action: "데이터와 방법론 보기",
  },
] as const;

const resourceFaq = [
  {
    question: "피아노 학습 자료와 도구는 무료인가요?",
    answer:
      "네. 로드맵 CSV, 연습 플래너, 코드표와 레슨비 계산기는 별도 가입 없이 사용할 수 있습니다. 브라우저와 운영체제에 따라 다운로드·인쇄 방식은 다를 수 있습니다.",
  },
  {
    question: "자료실의 체크리스트와 계산 결과가 전문가 진단을 대신하나요?",
    answer:
      "아닙니다. 자료는 현재 상태를 정리하고 질문을 준비하기 위한 도구입니다. 학습 진단, 통증이나 긴장, 입시 적합성, 개별 계약과 비용 판단은 교사 또는 관련 전문가와 직접 확인해야 합니다.",
  },
] as const;

export const Route = createFileRoute("/resources/")({
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
              buildCollectionPageSchema({
                name: page.primaryKeyword,
                description: page.description,
                url: `${SITE_URL}${page.path}`,
                image: page.image,
                items: resourceItems,
                itemListOrder: "unordered",
                dateModified: RESOURCE_UPDATED_AT,
                authorId: `${SITE_URL}/#business`,
                publisherId: `${SITE_URL}/#business`,
              }),
              {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}${page.path}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 학습 자료",
                    item: `${SITE_URL}${page.path}`,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${SITE_URL}${page.path}#faq`,
                mainEntity: resourceFaq.map((item) => ({
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
  component: ResourcesHub,
});

function ResourcesHub() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb items={[{ label: "피아노 학습 자료" }]} />

        <header className="mt-10 max-w-4xl">
          <p className="text-xs font-medium tracking-[0.18em] text-brass uppercase">
            Open learning resources
          </p>
          <h1 className="mt-5 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 학습 자료실
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            읽기만 하는 글을 넘어 직접 확인하고 기록하고 내려받을 수 있는 피아노 학습 자료를
            공개합니다. 수준별 로드맵, 주간 연습 플래너, 코드표, 비용 계산기와 공식 데이터 자료실을
            목적에 맞게 선택하세요.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-faint">
            발행·운영{" "}
            <a
              href="/editorial-policy"
              className="text-brass underline decoration-brass/60 underline-offset-4"
            >
              {SITE.brand} 사이트 운영팀
            </a>{" "}
            · 최종 수정일 <time dateTime={RESOURCE_UPDATED_AT}>{RESOURCE_UPDATED_AT}</time> ·
            외부·전문가 독립 검토 전
          </p>
        </header>

        <section className="mt-16" aria-labelledby="resource-list-title">
          <div className="max-w-3xl">
            <h2 id="resource-list-title" className="font-serif-kr text-3xl font-bold md:text-4xl">
              목적별 공개 자료
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              자료마다 계산 범위, 저장 방식과 해석 한계를 표시했습니다. 도구 전체만 먼저 살펴보려면{" "}
              <a href="/tools" className="text-brass underline underline-offset-4">
                피아노 학습 도구 모음
              </a>
              을 이용하세요.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {resourceItems.map((item) => (
              <article
                key={item.path}
                className="flex min-h-72 flex-col border border-line bg-ebony-2 p-7"
              >
                <p className="text-xs font-medium tracking-[0.14em] text-brass uppercase">
                  {item.type}
                </p>
                <h3 className="mt-4 font-serif-kr text-2xl font-semibold text-ivory">
                  <a
                    href={item.path}
                    className="transition-colors hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                  >
                    {item.name}
                  </a>
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-mute">{item.description}</p>
                <a
                  href={item.path}
                  className="mt-auto pt-8 text-sm font-medium text-ivory underline decoration-brass/60 underline-offset-4 transition-colors hover:text-brass"
                >
                  {item.action} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mt-20 border-y border-line py-12"
          aria-labelledby="resource-policy-title"
        >
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Publication policy</p>
              <h2 id="resource-policy-title" className="mt-3 font-serif-kr text-3xl font-bold">
                공개 자료 운영 원칙
              </h2>
            </div>
            <ul className="space-y-5 text-sm leading-relaxed text-mute">
              <li>
                <strong className="text-ivory">직접 사용:</strong> 가입이나 상담 신청 없이 핵심
                기능과 파일을 사용할 수 있습니다.
              </li>
              <li>
                <strong className="text-ivory">범위 표시:</strong> 교육 참고 자료와 공식 통계,
                사이트 계산값을 구분하고 보장할 수 없는 결과를 밝힙니다.
              </li>
              <li>
                <strong className="text-ivory">개인정보 최소화:</strong> 브라우저 도구의 입력값은
                기능에 필요한 범위에서만 처리하며 각 페이지에 전송·저장 여부를 표시합니다.
              </li>
              <li>
                <strong className="text-ivory">수정 가능성:</strong> 오류 제보를 검토하고 자료의
                기준일과 수정일을 페이지에 남깁니다.
              </li>
            </ul>
          </div>
        </section>

        <PageAuthorityRecord
          className="mt-20"
          title="피아노 학습 자료 작성·운영 기준"
          answer="가입 없이 바로 쓰고 내려받을 수 있는 로드맵·플래너·코드표·비용 계산기를 한곳에 모으고, 각 자료의 계산 범위와 해석 한계를 함께 공개합니다."
          audience="연습 계획, 현재 수준, 코드 구성음이나 레슨비 비교 기준을 스스로 정리하려는 학습자·보호자"
          scope="사이트에서 직접 제공하는 무료 학습 자료와 도구, 공개 데이터의 사용 목적·저장 방식·수정 기준을 안내합니다."
          boundary="체크리스트와 계산값은 개별 실력 진단, 건강·치료 조언, 적정 레슨비 판정이나 학습 성과 보장을 대신하지 않습니다."
          lastModified={RESOURCE_UPDATED_AT}
          authorLabel="작성·운영"
          authorName={`${SITE.brand} 사이트 운영팀`}
          authorHref="/editorial-policy"
          dateLabel="최종 수정일"
          reviewStatus="외부·전문가 독립 검토 전"
        />

        <ResearchFaq
          id="resources-faq-title"
          title="피아노 학습 자료 자주 묻는 질문"
          items={resourceFaq}
        />
      </div>
    </SubPageShell>
  );
}
