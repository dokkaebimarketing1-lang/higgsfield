import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import {
  DownloadCard,
  EvidenceBadge,
  LimitationNotice,
  ResearchBreadcrumb,
  ResearchFaq,
  StatCard,
} from "../../components/site/research-ui";
import { SITE_URL } from "../../lib/content";
import {
  PIANO_SEARCH_DEMAND,
  RESEARCH_DOWNLOADS,
  SEARCH_DEMAND_DATASET_CITATION,
  formatBytes,
  formatNumber,
} from "../../lib/research-data";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/research/piano-search-demand-report-2026")!;
const canonical = `${SITE_URL}${page.path}`;
const datasetPublishedAt = PIANO_SEARCH_DEMAND.datasetPublishedAt ?? PIANO_SEARCH_DEMAND.lookupDate;
const datasetModifiedAt = PIANO_SEARCH_DEMAND.modifiedAt ?? datasetPublishedAt;
const datasetVersion = PIANO_SEARCH_DEMAND.datasetVersion ?? "1.0.0";
const GOOGLE_KEYWORD_PLANNER_URL = "https://business.google.com/en-all/ad-tools/keyword-planner/";
const NAVER_KEYWORD_TOOL_URL = "https://ads.naver.com/help/faq/1406";

const targetPages: Record<string, { href: string; label: string; ownership: string }> = {
  "피아노 학원": {
    href: "/research/2026-seoul-piano-academy-fees",
    label: "학원비 비교 데이터",
    ownership: "비교·데이터만 · 학원 서비스 목표 아님",
  },
  "피아노 코드": {
    href: "/tools/piano-chord-chart",
    label: "코드표 도구",
    ownership: "독립 도구 대표 키워드",
  },
  "어린이 피아노": {
    href: "/lessons/children",
    label: "어린이 레슨",
    ownership: "어린이 레슨 보조 키워드",
  },
  "성인 피아노": {
    href: "/lessons/adult",
    label: "성인 레슨",
    ownership: "성인 레슨 보조 키워드",
  },
  "피아노 레슨": {
    href: "/",
    label: "피아노 레슨 메인",
    ownership: "홈페이지 핵심 키워드",
  },
  "피아노 연습": {
    href: "/blog/practice",
    label: "피아노 연습 정보",
    ownership: "연습 카테고리 대표 키워드",
  },
  "피아노 과외": {
    href: "/lessons/private",
    label: "피아노 과외",
    ownership: "홈·개인 레슨 보조 키워드",
  },
};

const directFitKeywords = new Set(["피아노 학원"]);
const partialFitKeywords = new Set(["피아노", "피아노 악보", "쉬운 피아노 악보", "피아노 연습실"]);

function topKeywordFit(keyword: string) {
  if (directFitKeywords.has(keyword)) {
    return {
      label: "직접 관련",
      detail: "레슨·학원 비교 의도가 있어 사이트의 교육 주제와 직접 맞습니다.",
      className: "text-brass",
    };
  }
  if (partialFitKeywords.has(keyword)) {
    return {
      label: "부분 관련",
      detail: "정보 콘텐츠로 다룰 수 있지만 검색 의도가 넓거나 저작권·대여 의도를 분리해야 합니다.",
      className: "text-ivory",
    };
  }
  return {
    label: "비대상",
    detail: "높은 검색량만으로 레슨 사이트의 목표 키워드나 새 페이지로 삼지 않습니다.",
    className: "text-faint",
  };
}

const searchDemandFaq = [
  {
    question: "이 검색수요 데이터는 정부나 광고 플랫폼의 공식 통계인가요?",
    answer:
      "아닙니다. 이화 피아노 과외가 Google Ads 키워드 플래너와 네이버 검색광고 키워드 도구에서 조회한 추정치를 정규화·분류한 자체 조사입니다. 각 플랫폼은 도구를 운영하지만 이 데이터셋을 발행하거나 보증하지 않았습니다.",
  },
  {
    question: "합산 검색량 1,001,925는 월간 순이용자 수인가요?",
    answer:
      "아닙니다. 관측 기간이 다른 구글 월평균과 네이버 최근 30일 수치를 행별로 더한 참고 합계입니다. 키워드와 이용자가 서로 겹치므로 실제 방문자, 고유 검색자 또는 예상 클릭 수로 해석할 수 없습니다.",
  },
  {
    question: "세그먼트별 검색량을 다시 합산해도 되나요?",
    answer:
      "안 됩니다. 레슨·지역·대상·학부모 등 세그먼트는 전체 키워드의 서로 겹치는 큐레이션 부분집합입니다. 비교용으로만 사용하고 전체 규모를 구할 때는 기준 모수인 전체 키워드 시트만 사용해야 합니다.",
  },
  {
    question: "검색량이 높은 키워드부터 페이지를 만들면 되나요?",
    answer:
      "검색량뿐 아니라 레슨 서비스와의 주제 적합성, 실제 검색 의도, 기존 페이지와의 중복, 저작권과 운영 가능성을 함께 봐야 합니다. 그래서 이 보고서는 상위 검색어와 사이트 목표 키워드를 별도 표로 나눕니다.",
  },
] as const;

const datasetDistributions = PIANO_SEARCH_DEMAND.distributions.map((distribution) => ({
  "@type": "DataDownload",
  name: distribution.title,
  contentUrl: `${SITE_URL}${distribution.contentUrl}`,
  encodingFormat: distribution.encodingFormat,
  contentSize: `${formatNumber(distribution.bytes)} B`,
  sha256: distribution.sha256,
}));

export const Route = createFileRoute("/research/piano-search-demand-report-2026")({
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
                "@id": `${canonical}#webpage`,
                url: canonical,
                name: page.title,
                description: page.description,
                inLanguage: "ko",
                datePublished: datasetPublishedAt,
                dateModified: datasetModifiedAt,
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                isPartOf: { "@id": `${SITE_URL}/#website` },
                breadcrumb: { "@id": `${canonical}#breadcrumb` },
                mainEntity: { "@id": `${canonical}#dataset` },
              },
              {
                "@type": "Dataset",
                "@id": `${canonical}#dataset`,
                name: PIANO_SEARCH_DEMAND.name,
                description: PIANO_SEARCH_DEMAND.description,
                url: canonical,
                identifier: PIANO_SEARCH_DEMAND.datasetId,
                version: datasetVersion,
                datePublished: datasetPublishedAt,
                dateModified: datasetModifiedAt,
                inLanguage: "ko",
                isAccessibleForFree: true,
                creator: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                mainEntityOfPage: { "@id": `${canonical}#webpage` },
                includedInDataCatalog: { "@id": `${SITE_URL}/research#catalog` },
                keywords: [
                  "피아노 키워드 검색량",
                  "피아노 검색수요",
                  "피아노 레슨 키워드",
                  "구글 키워드 플래너",
                  "네이버 검색광고 키워드 도구",
                ],
                measurementTechnique: [
                  `Google Ads 키워드 플래너 ${PIANO_SEARCH_DEMAND.googleWindow.start}~${PIANO_SEARCH_DEMAND.googleWindow.end} 월평균`,
                  PIANO_SEARCH_DEMAND.naverWindow.description,
                ],
                temporalCoverage: `${PIANO_SEARCH_DEMAND.googleWindow.start}/${PIANO_SEARCH_DEMAND.googleWindow.end}`,
                variableMeasured: [
                  {
                    "@type": "PropertyValue",
                    name: "고유 키워드 수",
                    value: PIANO_SEARCH_DEMAND.uniqueKeywords,
                  },
                  {
                    "@type": "PropertyValue",
                    name: "네이버 검색량 측정 키워드 수",
                    value: PIANO_SEARCH_DEMAND.naverMeasuredKeywords,
                  },
                  {
                    "@type": "PropertyValue",
                    name: "행별 구글·네이버 참고 합계",
                    value: PIANO_SEARCH_DEMAND.totalSearchVolumeSum,
                  },
                ],
                citation: [GOOGLE_KEYWORD_PLANNER_URL, NAVER_KEYWORD_TOOL_URL],
                creditText: SEARCH_DEMAND_DATASET_CITATION,
                publishingPrinciples: `${SITE_URL}/editorial-policy`,
                usageInfo: `${SITE_URL}/research/methodology#reuse-policy`,
                distribution: datasetDistributions,
              },
              {
                "@type": "Article",
                "@id": `${canonical}#article`,
                headline: "2026 피아노 키워드 검색수요 조사",
                description: page.description,
                url: canonical,
                inLanguage: "ko",
                datePublished: datasetPublishedAt,
                dateModified: datasetModifiedAt,
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                mainEntityOfPage: { "@id": `${canonical}#webpage` },
                about: { "@id": `${canonical}#dataset` },
                citation: [GOOGLE_KEYWORD_PLANNER_URL, NAVER_KEYWORD_TOOL_URL],
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${canonical}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 데이터",
                    item: `${SITE_URL}/research`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "2026 피아노 키워드 검색수요 조사",
                    item: canonical,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${canonical}#faq`,
                mainEntity: searchDemandFaq.map((item) => ({
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
  component: PianoSearchDemandReportPage,
});

function PianoSearchDemandReportPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[
            { label: "피아노 데이터", href: "/research" },
            { label: "2026 피아노 키워드 검색수요 조사" },
          ]}
        />

        <article>
          <header className="mt-10 max-w-4xl">
            <EvidenceBadge>자체 조사 · 광고 도구 추정치 · 공식 통계 아님</EvidenceBadge>
            <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
              2026 피아노 키워드 검색수요 조사
            </h1>
            <p className="mt-6 max-w-[74ch] text-lg leading-relaxed text-mute">
              Google Ads 키워드 플래너 최근 12개월 월평균과 네이버 검색광고 키워드 도구 최근 30일
              월간 검색수를 정규화해 4,545개 피아노 관련 키워드의 수요와 사이트 적합성을 분리해
              살폈습니다. 전체 CSV, 세그먼트 요약, 데이터 사전, 원본 무결성 매니페스트를 함께
              공개합니다.
            </p>
          </header>

          <section
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="피아노 키워드 검색수요 핵심 수치"
          >
            <StatCard
              label="고유 키워드"
              value={`${formatNumber(PIANO_SEARCH_DEMAND.uniqueKeywords)}개`}
              detail="전체 키워드 시트에서 키워드 1개당 1행으로 정리한 기준 모수"
            />
            <StatCard
              label="행별 참고 합계"
              value={formatNumber(PIANO_SEARCH_DEMAND.totalSearchVolumeSum)}
              detail="구글 월평균과 네이버 최근 30일 수치의 합계이며 순이용자 수가 아님"
            />
            <StatCard
              label="네이버 측정 키워드"
              value={`${formatNumber(PIANO_SEARCH_DEMAND.naverMeasuredKeywords)}개`}
              detail={`전체의 ${(
                (PIANO_SEARCH_DEMAND.naverMeasuredKeywords / PIANO_SEARCH_DEMAND.uniqueKeywords) *
                100
              ).toFixed(1)}%에 네이버 월간 검색수 값이 있음`}
            />
            <StatCard
              label="자체 분류 세그먼트"
              value={`${formatNumber(PIANO_SEARCH_DEMAND.segments.length)}개`}
              detail="세그먼트끼리 중복되므로 다시 합산하지 않는 비교용 부분집합"
            />
          </section>

          <div className="mt-6">
            <LimitationNotice>
              <strong className="text-ivory">먼저 읽을 해석 기준:</strong> 1,001,925는 월간 고유
              검색자나 예상 방문자가 아닙니다. 기간이 다른 구글·네이버 광고 도구 추정치를 행별로
              더한 참고값이며, 이 데이터셋은 두 플랫폼이나 정부가 공표한 공식 통계가 아닌 자체
              조사입니다.
            </LimitationNotice>
          </div>

          <section className="mt-16 border-l-2 border-brass pl-6" aria-labelledby="demand-answer">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Answer first</p>
            <h2 id="demand-answer" className="mt-3 font-serif-kr text-3xl font-bold">
              피아노 검색수요에서 먼저 볼 숫자는 무엇인가요?
            </h2>
            <p className="mt-5 max-w-[76ch] font-serif-kr text-xl leading-relaxed text-ivory">
              조사된 고유 키워드는 4,545개이고, 이 가운데 네이버 월간 검색수가 측정된 키워드는
              4,522개입니다. 구글·네이버 행별 참고 합계는 1,001,925지만, 실제 페이지 전략은
              검색량보다 레슨·학습 주제와의 적합성을 먼저 적용해야 합니다.
            </p>
          </section>

          <section className="mt-20" aria-labelledby="target-keyword-title">
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Intent before volume</p>
              <h2 id="target-keyword-title" className="mt-3 font-serif-kr text-3xl font-bold">
                우선 검토 키워드와 처리 원칙
              </h2>
              <p className="mt-4 leading-relaxed text-mute">
                원본 조사에서 따로 확인한 7개 키워드를 모두 사이트 대표 키워드로 삼지 않습니다.
                서비스·도구·정보 탐색 의도와 맞는 기존 페이지를 연결하고, 대표·보조·비목표 키워드를
                구분해 같은 의도의 새 페이지를 중복 생성하지 않습니다.
              </p>
            </div>
            <div className="mt-8 overflow-x-auto border border-line">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <caption className="sr-only">
                  피아노 사이트 우선 검토 키워드별 검색량, 연결 페이지와 소유·제외 원칙
                </caption>
                <thead className="bg-ebony-2 text-sm text-mute">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">
                      검토 키워드
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      행별 합계
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      네이버
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      구글 월평균
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      연결 페이지
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      소유·제외 원칙
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PIANO_SEARCH_DEMAND.targetKeywordRows.map((row) => {
                    const target = targetPages[row.keyword];
                    return (
                      <tr key={row.keyword} className="border-t border-line">
                        <th scope="row" className="px-5 py-4 font-medium text-ivory">
                          {row.keyword}
                        </th>
                        <td className="px-5 py-4 text-right tabular-nums text-mute">
                          {formatNumber(row.totalSearchVolume)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-mute">
                          {formatNumber(row.naverTotal)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-mute">
                          {formatNumber(row.googleMonthlyAverage)}
                        </td>
                        <td className="px-5 py-4">
                          {target ? (
                            <a
                              href={target.href}
                              className="text-brass underline underline-offset-4 hover:text-ivory"
                            >
                              {target.label} →
                            </a>
                          ) : (
                            <span className="text-faint">검토 중</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm leading-relaxed text-mute">
                          {target?.ownership ?? "대표 키워드 지정 전 검색 의도 검토"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-faint">
              예: ‘피아노 코드’는 행별 합계 4,230으로, 레슨 상품 페이지가 아니라 피아노 코드표
              도구가 검색 의도를 담당합니다.
            </p>
          </section>

          <section className="mt-20" aria-labelledby="top-query-title">
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.18em] text-brass uppercase">
                Volume is not site fit
              </p>
              <h2 id="top-query-title" className="mt-3 font-serif-kr text-3xl font-bold">
                상위 검색어와 사이트 적합성은 다릅니다
              </h2>
              <p className="mt-4 leading-relaxed text-mute">
                아래 표는 행별 합계 상위 검색어를 숨김없이 보여 주되, 레슨·피아노 학습 사이트와의
                직접 관련성을 편집 기준으로 따로 표시합니다. 비대상 표시는 검색어의 가치가 낮다는
                뜻이 아니라 이 사이트가 답할 주제가 아니라는 뜻입니다.
              </p>
            </div>
            <div className="mt-8 overflow-x-auto border border-line">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <caption className="sr-only">
                  피아노 관련 상위 검색어의 검색량과 이 사이트 주제 적합성
                </caption>
                <thead className="bg-ebony-2 text-sm text-mute">
                  <tr>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      순위
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      검색어
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      행별 합계
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      네이버
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      구글 월평균
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      사이트 적합성
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PIANO_SEARCH_DEMAND.topKeywords.map((row, index) => {
                    const fit = topKeywordFit(row.keyword);
                    return (
                      <tr key={row.keyword} className="border-t border-line">
                        <td className="px-5 py-4 text-right tabular-nums text-faint">
                          {index + 1}
                        </td>
                        <th scope="row" className="px-5 py-4 font-medium text-ivory">
                          {row.keyword}
                        </th>
                        <td className="px-5 py-4 text-right tabular-nums text-mute">
                          {formatNumber(row.totalSearchVolume)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-mute">
                          {formatNumber(row.naverTotal)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-mute">
                          {formatNumber(row.googleMonthlyAverage)}
                        </td>
                        <td className="max-w-[310px] px-5 py-4">
                          <strong className={`text-sm ${fit.className}`}>{fit.label}</strong>
                          <span className="mt-1 block text-xs leading-relaxed text-faint">
                            {fit.detail}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-20" aria-labelledby="segment-title">
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Overlapping segments</p>
              <h2 id="segment-title" className="mt-3 font-serif-kr text-3xl font-bold">
                세그먼트별 키워드 수와 검색량
              </h2>
              <p className="mt-4 leading-relaxed text-mute">
                전체 키워드가 유일한 기준 모수입니다. 나머지는 특정 의도를 보기 위한 겹치는
                부분집합이며, 네이버 발굴 키워드는 네이버 지표만 있어 구글·네이버 합계와 직접
                비교하지 않습니다.
              </p>
            </div>
            <div className="mt-8 overflow-x-auto border border-line">
              <table className="w-full min-w-[1020px] border-collapse text-left">
                <caption className="sr-only">
                  피아노 검색수요 세그먼트별 행 수, 검색량과 중복 정책
                </caption>
                <thead className="bg-ebony-2 text-sm text-mute">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">
                      세그먼트
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      행 수
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      행별 합계
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      네이버
                    </th>
                    <th scope="col" className="px-5 py-4 text-right font-medium">
                      구글 월평균
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      중복 정책
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PIANO_SEARCH_DEMAND.segments.map((segment) => (
                    <tr key={segment.segmentId} className="border-t border-line align-top">
                      <th scope="row" className="px-5 py-4 font-medium text-ivory">
                        {segment.sheetName}
                        <span className="mt-1 block font-mono text-[11px] font-normal text-faint">
                          {segment.segmentId}
                        </span>
                      </th>
                      <td className="px-5 py-4 text-right tabular-nums text-mute">
                        {formatNumber(segment.dataRows)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-mute">
                        {formatNumber(segment.totalSearchVolumeSum)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-mute">
                        {formatNumber(segment.naverSearchVolumeSum)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-mute">
                        {formatNumber(segment.googleMonthlyAverageSum)}
                      </td>
                      <td className="max-w-[330px] px-5 py-4 text-sm leading-relaxed text-mute">
                        <strong className="font-medium text-ivory">{segment.overlapPolicy}</strong>
                        <span className="mt-1 block text-xs text-faint">{segment.notes}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-20" aria-labelledby="method-summary-title">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs tracking-[0.18em] text-brass uppercase">
                  Reproducible method
                </p>
                <h2 id="method-summary-title" className="mt-3 font-serif-kr text-3xl font-bold">
                  조사·가공 방법
                </h2>
                <p className="mt-4 leading-relaxed text-mute">
                  플랫폼 지표의 시간창을 억지로 동일하게 환산하지 않고 원래 의미를 보존했습니다.
                  전체 처리 규칙과 수정 이력은 별도 방법론 페이지에서 계속 관리합니다.
                </p>
              </div>
              <ol className="space-y-5 border-l border-line pl-6 text-sm leading-relaxed text-mute">
                <li>
                  <strong className="block text-ivory">1. 도구별 지표 보존</strong>
                  구글은 {PIANO_SEARCH_DEMAND.googleWindow.start}~
                  {PIANO_SEARCH_DEMAND.googleWindow.end} 최근 12개월 월평균, 네이버는 조회일{" "}
                  {PIANO_SEARCH_DEMAND.lookupDate} 기준 최근 30일 월간 검색수로 보존했습니다.
                </li>
                <li>
                  <strong className="block text-ivory">2. 전체 키워드 기준 모수 확정</strong>
                  전체 키워드 시트의 비어 있지 않은 4,545개 키워드를 1키워드 1행으로 공개하고, 다른
                  시트는 겹치는 세그먼트로 표시했습니다.
                </li>
                <li>
                  <strong className="block text-ivory">3. 오류 수식 재계산</strong>
                  원본 요약 시트에서 지역·알바 행 수에 나타난 #NAME? 수식을 집계값으로 사용하지
                  않고, 해당 시트의 실제 비어 있지 않은 데이터 행을 다시 계산했습니다.
                </li>
                <li>
                  <strong className="block text-ivory">4. 검색량과 페이지 적합성 분리</strong>
                  상위 검색어는 원값 순으로 공개하되, 목표 페이지는 레슨·학습 의도와 기존 페이지의
                  담당 범위를 기준으로 별도 선정했습니다.
                </li>
              </ol>
            </div>
            <p className="mt-8 text-sm">
              <a
                href="/research/methodology"
                className="text-brass underline underline-offset-4 hover:text-ivory"
              >
                전체 방법론·한계·수정 이력 보기 →
              </a>
            </p>
          </section>

          <section className="mt-20" aria-labelledby="limitations-title">
            <h2 id="limitations-title" className="font-serif-kr text-3xl font-bold">
              해석 한계
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {PIANO_SEARCH_DEMAND.limitations.map((limitation) => (
                <li
                  key={limitation}
                  className="border border-line bg-ebony-2 px-5 py-5 text-sm leading-relaxed text-mute"
                >
                  {limitation}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-20" aria-labelledby="download-title">
            <h2 id="download-title" className="font-serif-kr text-3xl font-bold">
              전체 데이터·메타데이터 다운로드
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <DownloadCard
                href={RESEARCH_DOWNLOADS.searchDemandCsv}
                title="전체 키워드 CSV"
                description="정규화 키워드, 구글·네이버 검색량, 세그먼트 포함 여부 등 30개 공개 필드를 제공합니다."
                meta={`CSV · ${formatNumber(PIANO_SEARCH_DEMAND.uniqueKeywords)}행 · ${formatBytes(PIANO_SEARCH_DEMAND.distributions[0].bytes)}`}
              />
              <DownloadCard
                href={RESEARCH_DOWNLOADS.searchDemandSummaryCsv}
                title="세그먼트 요약 CSV"
                description="7개 세그먼트의 행 수, 검색량 합계, 중복 정책과 해석 메모를 제공합니다."
                meta={`CSV · ${formatNumber(PIANO_SEARCH_DEMAND.segments.length)}행 · ${formatBytes(PIANO_SEARCH_DEMAND.distributions[1].bytes)}`}
              />
              <DownloadCard
                href={RESEARCH_DOWNLOADS.searchDemandMetadata}
                title="데이터셋 메타데이터"
                description="조사 기간, 핵심 수치, 상위·목표 키워드, 배포 파일 해시와 한계를 제공합니다."
                meta="JSON · v1.0.0"
              />
              <DownloadCard
                href={RESEARCH_DOWNLOADS.searchDemandSchema}
                title="CSV 데이터 사전"
                description="공개 필드의 자료형, 단위, null 허용 여부와 가공 규칙을 제공합니다."
                meta="JSON · 스키마"
              />
              <DownloadCard
                href={RESEARCH_DOWNLOADS.searchDemandManifest}
                title="원본 무결성 매니페스트"
                description="원본 조사 워크북의 파일명, 크기, SHA-256, 수집일과 공개 경계를 기록합니다."
                meta="JSON · SHA-256"
              />
            </div>
          </section>

          <section
            id="search-demand-editorial-record"
            data-research-authorship
            className="mt-20 border-y border-line bg-ebony-2/55 py-12"
            aria-labelledby="search-demand-editorial-title"
          >
            <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs tracking-[0.18em] text-brass uppercase">
                  Authorship and sources
                </p>
                <h2
                  id="search-demand-editorial-title"
                  className="mt-3 font-serif-kr text-3xl font-bold"
                >
                  작성·출처·검증 기록
                </h2>
                <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-mute">
                  광고 도구 운영기관과 자체 조사 발행자를 구분합니다. Google과 네이버는 조회 도구를
                  제공하지만 이 데이터셋의 발행자나 검토자가 아닙니다.
                </p>
              </div>
              <dl className="grid gap-x-8 gap-y-5 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-faint">조사·가공·편집·배포</dt>
                  <dd className="mt-1 font-medium text-ivory">
                    <a
                      href="/"
                      className="underline decoration-brass/60 underline-offset-4 hover:text-brass"
                    >
                      이화 피아노 과외
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">데이터셋 버전</dt>
                  <dd className="mt-1 font-mono text-ivory">v{datasetVersion}</dd>
                </div>
                <div>
                  <dt className="text-faint">조회일</dt>
                  <dd className="mt-1 text-ivory">
                    <time dateTime={PIANO_SEARCH_DEMAND.lookupDate}>
                      {PIANO_SEARCH_DEMAND.lookupDate}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">가공본 공개·수정일</dt>
                  <dd className="mt-1 text-ivory">
                    <time dateTime={datasetPublishedAt}>{datasetPublishedAt}</time>
                    {datasetModifiedAt !== datasetPublishedAt && (
                      <>
                        {" "}
                        · <time dateTime={datasetModifiedAt}>{datasetModifiedAt}</time>
                      </>
                    )}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-faint">조회 도구 공식 설명</dt>
                  <dd className="mt-2 space-y-3 text-ivory">
                    <div data-research-source>
                      <cite className="not-italic">
                        <a
                          href={GOOGLE_KEYWORD_PLANNER_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-brass/60 underline-offset-4 hover:text-brass"
                        >
                          Google Ads Keyword Planner 공식 도구 안내 ↗
                        </a>
                      </cite>
                    </div>
                    <div data-research-source>
                      <cite className="not-italic">
                        <a
                          href={NAVER_KEYWORD_TOOL_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-brass/60 underline-offset-4 hover:text-brass"
                        >
                          네이버 광고주센터 키워드 도구 공식 도움말 ↗
                        </a>
                      </cite>
                    </div>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-faint">자동 검증 범위</dt>
                  <dd className="mt-1 leading-relaxed text-ivory">
                    CSV 행·필드 수, 파일 크기·SHA-256, 세그먼트 집계, 데이터 사전 대응, 직접
                    식별정보·원본 행 위치 비공개 여부를 검사합니다.
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-faint">원본 조사 파일</dt>
                  <dd className="mt-1 break-all leading-relaxed text-ivory">
                    {PIANO_SEARCH_DEMAND.sourceWorkbook.originalName} ·{" "}
                    {formatBytes(PIANO_SEARCH_DEMAND.sourceWorkbook.bytes)}
                    <span className="mt-1 block font-mono text-[11px] text-faint">
                      SHA-256 {PIANO_SEARCH_DEMAND.sourceWorkbook.sha256}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            <div
              data-research-citation
              className="mt-10 border border-brass/35 bg-ebony px-6 py-6 md:px-8"
            >
              <h3 className="font-serif-kr text-xl font-semibold">권장 인용문</h3>
              <cite className="mt-4 block select-all not-italic leading-relaxed text-mute">
                {SEARCH_DEMAND_DATASET_CITATION}
              </cite>
              <p className="mt-4 text-xs leading-relaxed text-faint">
                재사용할 때는 서로 다른 관측 기간, 중복 키워드·세그먼트, 공식 통계가 아니라는 한계를
                함께 표시해 주세요.
              </p>
            </div>
          </section>

          <ResearchFaq
            id="search-demand-faq-title"
            title="피아노 검색수요 조사 자주 묻는 질문"
            items={searchDemandFaq}
          />
        </article>
      </div>
    </SubPageShell>
  );
}
