import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../components/site/chrome";
import { PageAuthorityRecord } from "../components/site/page-authority-record";
import { SITE, SITE_URL } from "../lib/content";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../lib/seo-pages";
import { safeJsonLd } from "../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/editorial-policy")!;
const POLICY_PUBLISHED_AT = "2026-07-23";
const POLICY_MODIFIED_AT = "2026-07-23";
const POLICY_VERSION = "1.0.0";

const sourceHierarchy = [
  {
    rank: "1",
    title: "공식 원문과 원자료",
    body: "정부·공공기관의 공식 게시 페이지, 원문 보고서, 행정자료와 원파일을 가장 먼저 확인합니다. 숫자를 인용할 때는 기준 시점·단위·모집단을 함께 기록하고, 사이트가 계산한 값과 공식 발표값을 구분합니다.",
  },
  {
    rank: "2",
    title: "검증 가능한 연구·교육기관 자료",
    body: "논문, 대학·교육기관의 공개 자료처럼 작성 주체와 방법을 확인할 수 있는 자료를 사용합니다. 출처가 서로 다르면 정의와 조사 범위가 같은지 먼저 비교합니다.",
  },
  {
    rank: "3",
    title: "사이트의 파생 데이터와 수업 경험",
    body: "원자료를 필터·집계한 값에는 가공 사실, 방법론, 버전과 한계를 표시합니다. 강사의 수업 경험을 바탕으로 한 조언은 통계나 보편적 성과처럼 표현하지 않습니다.",
  },
  {
    rank: "4",
    title: "보조 참고자료",
    body: "언론 기사, 플랫폼 안내, 검색 결과와 일반 웹문서는 배경 확인에만 사용합니다. 작성자·원출처·기준일을 확인할 수 없는 홍보성 문구는 핵심 근거로 사용하지 않습니다.",
  },
] as const;

const policySections = [
  {
    id: "authors-review",
    title: "작성자와 검토 책임",
    paragraphs: [
      "피아노 레슨 안내의 인물·수업 정보는 강사 소개 페이지의 공개 프로필을 기준으로 사이트 운영자가 편집합니다. 특정 콘텐츠를 김서연이 직접 작성·검토했다는 확인 기록이 있을 때만 개인 저자·검토자로 표시합니다.",
      "데이터 페이지는 원자료 링크, 파일 해시, 행 수, 공개 필드와 계산 결과를 자동 검사합니다. 현재 통계전문가나 외부 기관의 독립 감사를 받은 것으로 표현하지 않으며, 외부 검토가 이뤄진 경우에만 검토자와 범위를 별도로 표시합니다.",
    ],
  },
  {
    id: "ai-use",
    title: "AI 활용 원칙",
    paragraphs: [
      "생성형 AI는 개요 정리, 문장 교정, 코드 작성 보조, 반복적인 분류 작업에 사용할 수 있습니다. 공개 여부와 최종 문장에 대한 책임은 사람에게 있으며, AI의 답변 자체를 사실의 출처로 인용하지 않습니다.",
      "통계·가격·날짜·경력·기관명·인용은 공식 원문이나 확인 가능한 기록과 대조합니다. 존재하지 않는 후기, 수강 성과, 경력, 인용문, 출처와 통계를 생성하지 않으며, 합성 이미지가 사실 기록으로 오해될 수 있는 경우에는 그 성격을 표시합니다.",
    ],
  },
  {
    id: "keyword-research",
    title: "키워드 조사와 검색 최적화",
    paragraphs: [
      "검색량과 검색 의도 조사는 사람들이 실제로 묻는 질문을 찾고 페이지 구조를 정하는 참고자료입니다. 검색량은 플랫폼·지역·기간에 따라 달라지므로 공식 통계로 취급하지 않으며, 수치로 공개할 때는 조사 도구와 기준일을 함께 적습니다.",
      "한 페이지는 하나의 주된 검색 의도에 답하도록 설계합니다. 키워드 반복, 숨김 문구, 지역명만 바꾼 문서, 근거 없는 비교·최상급 표현, 검색 유입만 노린 얇은 페이지는 발행 기준에 맞지 않습니다.",
    ],
  },
  {
    id: "dates-versions",
    title: "날짜와 버전 표시",
    paragraphs: [
      "원자료 공표일, 데이터 기준일, 파일 수집일, 사이트 가공본 공개일과 최종 수정일은 서로 다른 값으로 관리합니다. 페이지를 다시 배포했다는 이유만으로 수정일을 새 날짜로 바꾸거나 오래된 자료를 최신 자료처럼 표현하지 않습니다.",
      "데이터셋은 공개 버전을 표시하고, 수치·필터·공개 필드·해석에 영향을 주는 변경은 연구 수정 이력에 남깁니다. 맞춤법이나 레이아웃처럼 의미를 바꾸지 않는 수정은 별도 데이터 버전을 만들지 않을 수 있습니다.",
    ],
  },
  {
    id: "conflicts",
    title: "이해관계와 상업적 목적",
    paragraphs: [
      "이 사이트는 피아노 레슨 상담을 제공하는 사업자의 사이트이므로, 레슨 선택·가격·교육 정보를 설명하는 데 상업적 이해관계가 있습니다. 연구자료와 정보성 콘텐츠가 상담 페이지로 연결될 수 있다는 점을 숨기지 않습니다.",
      "상담 전환, 제휴 또는 광고 대가를 자료의 정확성을 뒷받침하는 근거로 사용하지 않습니다. 향후 협찬·제휴·유료 게재가 있는 콘텐츠는 독자가 알아볼 수 있도록 해당 페이지에 관계와 범위를 표시합니다.",
    ],
  },
  {
    id: "privacy",
    title: "개인정보와 데이터 최소화",
    paragraphs: [
      "연구자료는 분석에 필요한 최소 필드만 공개합니다. 서울 피아노 교습비 가공 CSV에서는 성명, 전화번호, 시설명, 정확한 주소, 원자료 파일·시트·행 위치와 내부 시설 ID를 제외하며 개인이나 시설을 재식별하는 용도로 사용해서는 안 됩니다.",
      "상담 정보의 처리 목적·항목·보유 기간과 권리 행사 방법은 개인정보 처리 안내에 따릅니다. 공개 원자료에 포함된 정보라고 해도 이 사이트에서 다시 공개할 필요가 있는지 별도로 판단합니다.",
    ],
  },
  {
    id: "no-guarantees",
    title: "보장하지 않는 사항",
    paragraphs: [
      "교육 콘텐츠는 일반적인 정보이며 개인별 학습 결과, 입시·콩쿠르 성과, 특정 기간 안의 실력 향상을 보장하지 않습니다. 공개 교습비는 등록·신고 자료의 파생 분석으로 실제 결제금액이나 개인과외 시장 전체를 대표하지 않습니다.",
      "검색 노출, 검색 순위, 도메인 권위 지표와 외부 인용도 보장하지 않습니다. 공식 원자료가 정정되거나 수업 조건이 달라질 수 있으므로 중요한 결정 전에는 해당 기관과 상담 창구에서 최신 조건을 다시 확인해야 합니다.",
    ],
  },
] as const;

export const Route = createFileRoute("/editorial-policy")({
  head: () => {
    const publicHead = buildPublicPageHead(page);
    const pageUrl = `${SITE_URL}${page.path}`;

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
                "@id": `${pageUrl}#webpage`,
                name: page.title,
                description: page.description,
                url: pageUrl,
                datePublished: POLICY_PUBLISHED_AT,
                dateModified: POLICY_MODIFIED_AT,
                inLanguage: "ko",
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                isPartOf: { "@id": `${SITE_URL}/#website` },
                mainEntity: { "@id": `${pageUrl}#article` },
              },
              {
                "@type": "Article",
                "@id": `${pageUrl}#article`,
                headline: page.title,
                description: page.description,
                url: pageUrl,
                mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                datePublished: POLICY_PUBLISHED_AT,
                dateModified: POLICY_MODIFIED_AT,
                inLanguage: "ko",
                articleSection: "편집 원칙",
                version: POLICY_VERSION,
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "편집·출처·AI 활용 정책",
                    item: pageUrl,
                  },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: EditorialPolicyPage,
});

function EditorialPolicyPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="transition-colors hover:text-ivory">
            홈
          </a>
          <span className="mx-2">/</span>
          <span className="text-mute" aria-current="page">
            편집·출처·AI 활용 정책
          </span>
        </nav>

        <header className="mt-10 max-w-4xl">
          <p className="text-xs font-medium tracking-[0.16em] text-brass uppercase">
            Editorial standards
          </p>
          <h1 className="mt-5 break-keep font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            편집·출처·AI 활용 정책
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            피아노 레슨 안내, 정보성 콘텐츠와 연구 데이터를 어떤 근거로 작성하고 검토·수정하는지
            공개합니다. 검색 유입이나 상담 전환보다 출처의 정확한 범위와 독자가 확인할 수 있는
            기록을 우선합니다.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-5 text-sm">
            <div>
              <dt className="inline text-faint">정책 버전 </dt>
              <dd className="inline font-mono text-ivory">v{POLICY_VERSION}</dd>
            </div>
            <div>
              <dt className="inline text-faint">시행일 </dt>
              <dd className="inline text-ivory">
                <time dateTime={POLICY_PUBLISHED_AT}>{POLICY_PUBLISHED_AT}</time>
              </dd>
            </div>
            <div>
              <dt className="inline text-faint">최종 검토일 </dt>
              <dd className="inline text-ivory">
                <time dateTime={POLICY_MODIFIED_AT}>{POLICY_MODIFIED_AT}</time>
              </dd>
            </div>
          </dl>
        </header>

        <section className="mt-20" aria-labelledby="source-hierarchy-title">
          <div className="max-w-3xl">
            <h2
              id="source-hierarchy-title"
              className="font-serif-kr text-3xl font-bold md:text-4xl"
            >
              출처 우선순위
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              검색 결과의 순서가 아니라 원문 접근성, 작성 주체, 조사 방법과 기준일을 기준으로 근거의
              등급을 정합니다.
            </p>
          </div>
          <ol className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
            {sourceHierarchy.map((source) => (
              <li key={source.rank} className="bg-ebony p-7 md:p-8">
                <span className="font-latin text-lg italic text-brass">0{source.rank}</span>
                <h3 className="mt-3 font-serif-kr text-xl font-semibold text-ivory">
                  {source.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-mute">{source.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-20 divide-y divide-line border-y border-line">
          {policySections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="grid gap-5 py-10 md:grid-cols-[0.65fr_1.35fr]"
              aria-labelledby={`${section.id}-title`}
            >
              <h2
                id={`${section.id}-title`}
                className="break-keep font-serif-kr text-2xl font-bold text-ivory"
              >
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-mute">
                    {paragraph}
                  </p>
                ))}
                {section.id === "authors-review" && (
                  <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <a href="/about#person" className="text-brass underline underline-offset-4">
                      공개 강사 프로필
                    </a>
                    <a
                      href="/research/methodology"
                      className="text-brass underline underline-offset-4"
                    >
                      데이터 검증 방법
                    </a>
                  </p>
                )}
                {section.id === "dates-versions" && (
                  <p className="text-sm">
                    <a
                      href="/research/changelog"
                      className="text-brass underline underline-offset-4"
                    >
                      연구 데이터 수정 이력 확인
                    </a>
                  </p>
                )}
                {section.id === "privacy" && (
                  <p className="text-sm">
                    <a href="/privacy" className="text-brass underline underline-offset-4">
                      개인정보 처리 안내 확인
                    </a>
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>

        <section
          id="corrections"
          className="mt-20 border border-brass/40 bg-ebony-2 p-7 md:p-10"
          aria-labelledby="corrections-title"
        >
          <p className="text-xs tracking-[0.16em] text-brass uppercase">Corrections</p>
          <h2 id="corrections-title" className="mt-3 font-serif-kr text-3xl font-bold">
            오류 제보와 수정 절차
          </h2>
          <ol className="mt-6 grid gap-5 text-sm leading-relaxed text-mute md:grid-cols-3">
            <li>
              <strong className="block text-ivory">1. 근거와 위치 접수</strong>
              페이지 URL, 문제가 되는 문장·수치, 확인 가능한 원문 링크를 상담 폼으로 보내 주세요.
            </li>
            <li>
              <strong className="block text-ivory">2. 원문과 가공 과정 확인</strong>
              공식 원자료, 기준일, 필터와 계산식을 다시 확인합니다. 제보가 곧바로 오류 확정을
              뜻하지는 않습니다.
            </li>
            <li>
              <strong className="block text-ivory">3. 정정과 기록</strong>
              의미·수치·방법이 달라지면 본문, 수정일, 데이터 버전 또는 연구 수정 이력을 함께
              갱신합니다.
            </li>
          </ol>
          <a
            href="/#contact"
            className="mt-7 inline-block bg-brass px-6 py-3 font-serif-kr font-semibold text-ebony transition-colors hover:bg-[#cdb07a]"
          >
            오류·수정 요청 보내기
          </a>
          <p className="mt-4 text-xs leading-relaxed text-faint">
            접수와 검토 완료 시점을 보장하지 않으며, 개인정보나 공개하면 안 되는 원자료는 보내지
            마세요.
          </p>
        </section>

        <PageAuthorityRecord
          className="mt-20"
          title="이 편집 정책의 운영 책임"
          answer="출처와 상업적 이해관계를 드러내고, 확인된 사실과 검토 전 상태를 구분하며, 중요한 수정은 날짜·버전·이력으로 추적합니다."
          audience="피아노 레슨을 비교하는 학습자·보호자와 사이트의 데이터·콘텐츠를 인용하려는 독자"
          scope="레슨 안내, CMS 정보성 콘텐츠, 연구 데이터, 검색 최적화와 AI 보조 작업의 공개 기준"
          boundary="현재 이 정책과 새 도구·학습 자료는 외부·전문가 독립 검토 전입니다. 법률 자문을 의미하지 않으며 개별 학습 성과·검색 순위·공개 데이터의 현재성을 보장하지 않습니다."
          lastModified={POLICY_MODIFIED_AT}
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
