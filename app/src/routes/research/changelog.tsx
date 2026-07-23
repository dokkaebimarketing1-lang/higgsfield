import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import {
  EvidenceBadge,
  ResearchBreadcrumb,
  ResearchEditorialRecord,
} from "../../components/site/research-ui";
import { SITE, SITE_URL } from "../../lib/content";
import {
  NATIONAL_DATASET_MODIFIED_AT,
  NATIONAL_DATASET_PUBLISHED_AT,
  NATIONAL_DATASET_VERSION,
  NATIONAL_MUSIC_EDUCATION,
  NATIONAL_PDF_SOURCE,
  PIANO_SEARCH_DEMAND,
  RESEARCH_DOWNLOADS,
  SEARCH_DEMAND_DATASET_MODIFIED_AT,
  SEARCH_DEMAND_DATASET_PUBLISHED_AT,
  SEARCH_DEMAND_DATASET_VERSION,
  SEOUL_DATASET_MODIFIED_AT,
  SEOUL_DATASET_PUBLISHED_AT,
  SEOUL_DATASET_VERSION,
  SEOUL_PIANO_FEES,
  formatNumber,
} from "../../lib/research-data";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/research/changelog")!;
const CHANGELOG_PUBLISHED_AT = "2026-07-23";
const CHANGELOG_MODIFIED_AT = [
  NATIONAL_DATASET_MODIFIED_AT,
  SEOUL_DATASET_MODIFIED_AT,
  SEARCH_DEMAND_DATASET_MODIFIED_AT,
]
  .sort()
  .at(-1)!;

const researchEvents = [
  {
    date: "2026-07-23",
    type: "자체 조사 공개",
    title: "구글·네이버 피아노 키워드 검색수요 데이터셋 발행",
    version: `v${SEARCH_DEMAND_DATASET_VERSION}`,
    body: `Google Ads 키워드 플래너와 네이버 검색광고 키워드도구의 관측 기간을 분리해 ${formatNumber(PIANO_SEARCH_DEMAND.uniqueKeywords)}개 고유 키워드와 7개 중복 가능 세그먼트를 공개했습니다. 전체 CSV·세그먼트 요약·데이터 사전·메타데이터·비공개 원본 XLSX의 SHA-256 매니페스트를 함께 발행하고, 검색량이 실제 트래픽이나 순이용자 수가 아님을 명시했습니다.`,
  },
  {
    date: "2026-07-23",
    type: "무결성 정정",
    title: "CSV 줄바꿈을 LF로 고정하고 배포 파일 해시를 다시 기록",
    version: "v1.0.0 유지",
    body: "운영체제에 따라 CSV 줄바꿈이 달라져 파일 크기와 SHA-256 검증이 어긋날 수 있는 문제를 수정했습니다. 공개 CSV를 LF로 고정하고 메타데이터의 바이트 수와 해시를 현재 배포 파일에 맞췄습니다. 행 수, 필드 수, 통계값과 필터 결과는 바뀌지 않았습니다.",
  },
  {
    date: "2026-07-23",
    type: "메타데이터 보강",
    title: "버전·데이터 사전·인용·재사용·개인정보 경계를 공개",
    version: "v1.0.0 유지",
    body: "두 데이터셋에 발행자와 가공본 공개일·수정일·버전을 명시하고, CSV 데이터 사전과 배포 파일 메타데이터를 추가했습니다. 공식 원자료의 이용조건과 사이트 가공본의 인용 안내를 분리하고, 원자료 위치와 직접 식별정보를 공개 CSV에서 제외하는 기준을 문서화했습니다.",
  },
  {
    date: "2026-07-23",
    type: "최초 공개",
    title: "공식 원자료 기반 피아노 연구 데이터셋 2종 발행",
    version: "v1.0.0",
    body: `교육부·국가데이터처의 2025년 음악 사교육비 표를 옮긴 4행 데이터셋과 서울특별시교육청 2026-01-01 기준 원자료 ${formatNumber(SEOUL_PIANO_FEES.rawRowsScanned)}행을 검사해 만든 피아노 등록 교습비 ${formatNumber(SEOUL_PIANO_FEES.publishedRecords)}건 데이터셋을 공개했습니다. 원자료 12개의 수집일·파일 크기·SHA-256도 함께 고정했습니다.`,
  },
] as const;

export const Route = createFileRoute("/research/changelog")({
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
                datePublished: CHANGELOG_PUBLISHED_AT,
                dateModified: CHANGELOG_MODIFIED_AT,
                inLanguage: "ko",
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                isPartOf: { "@id": `${SITE_URL}/#website` },
                mainEntity: { "@id": `${pageUrl}#article` },
                about: [
                  { "@id": `${SITE_URL}/research/2025-music-private-education-statistics#dataset` },
                  { "@id": `${SITE_URL}/research/2026-seoul-piano-academy-fees#dataset` },
                  { "@id": `${SITE_URL}/research/piano-search-demand-report-2026#dataset` },
                ],
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
                datePublished: CHANGELOG_PUBLISHED_AT,
                dateModified: CHANGELOG_MODIFIED_AT,
                inLanguage: "ko",
                articleSection: "연구 데이터 수정 이력",
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${pageUrl}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 통계",
                    item: `${SITE_URL}/research`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "연구 데이터 수정 이력",
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
  component: ResearchChangelogPage,
});

function ResearchChangelogPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[{ label: "피아노 통계", href: "/research" }, { label: "연구 데이터 수정 이력" }]}
        />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>공개 데이터의 변경만 기록합니다</EvidenceBadge>
          <h1 className="mt-6 break-keep font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            연구 데이터 수정 이력
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            데이터셋의 최초 공개, 수치·필터·스키마·배포 파일과 인용 조건에 영향을 준 변경을
            기록합니다. 아래 이력은 현재 저장소의 연구 메타데이터와 실제 변경 기록으로 확인되는
            사건만 포함합니다.
          </p>
        </header>

        <section className="mt-16" aria-labelledby="current-releases-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.16em] text-brass uppercase">Current releases</p>
              <h2 id="current-releases-title" className="mt-3 font-serif-kr text-3xl font-bold">
                현재 공개 버전
              </h2>
            </div>
            <a
              href="/research/methodology"
              className="text-sm text-brass underline underline-offset-4"
            >
              수집·필터·통계 방법 확인 →
            </a>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article className="border border-line bg-ebony-2 p-7">
              <p className="font-mono text-xs text-brass">{NATIONAL_MUSIC_EDUCATION.datasetId}</p>
              <h3 className="mt-4 font-serif-kr text-2xl font-semibold">2025 음악 사교육비 통계</h3>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-faint">데이터셋 버전</dt>
                  <dd className="mt-1 font-mono text-ivory">v{NATIONAL_DATASET_VERSION}</dd>
                </div>
                <div>
                  <dt className="text-faint">가공본 공개일</dt>
                  <dd className="mt-1 text-ivory">
                    <time dateTime={NATIONAL_DATASET_PUBLISHED_AT}>
                      {NATIONAL_DATASET_PUBLISHED_AT}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">공식 원자료 공표일</dt>
                  <dd className="mt-1 text-ivory">
                    <time dateTime={NATIONAL_MUSIC_EDUCATION.sourcePublishedAt}>
                      {NATIONAL_MUSIC_EDUCATION.sourcePublishedAt}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">공개 분포</dt>
                  <dd className="mt-1 text-ivory">CSV 4행 · 7필드</dd>
                </div>
              </dl>
              <a
                href="/research/2025-music-private-education-statistics"
                className="mt-7 inline-block text-sm text-brass underline underline-offset-4"
              >
                데이터셋 페이지와 다운로드 →
              </a>
            </article>

            <article className="border border-line bg-ebony-2 p-7">
              <p className="font-mono text-xs text-brass">{SEOUL_PIANO_FEES.datasetId}</p>
              <h3 className="mt-4 font-serif-kr text-2xl font-semibold">
                2026 서울 피아노 등록 교습비
              </h3>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-faint">데이터셋 버전</dt>
                  <dd className="mt-1 font-mono text-ivory">v{SEOUL_DATASET_VERSION}</dd>
                </div>
                <div>
                  <dt className="text-faint">필터 버전</dt>
                  <dd className="mt-1 font-mono text-ivory">{SEOUL_PIANO_FEES.filterVersion}</dd>
                </div>
                <div>
                  <dt className="text-faint">원자료 기준일</dt>
                  <dd className="mt-1 text-ivory">
                    <time dateTime={SEOUL_PIANO_FEES.referenceDate}>
                      {SEOUL_PIANO_FEES.referenceDate}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">공개 분포</dt>
                  <dd className="mt-1 text-ivory">
                    레코드 {formatNumber(SEOUL_PIANO_FEES.publishedRecords)}행 · 요약 52행
                  </dd>
                </div>
              </dl>
              <a
                href="/research/2026-seoul-piano-academy-fees"
                className="mt-7 inline-block text-sm text-brass underline underline-offset-4"
              >
                데이터셋 페이지와 다운로드 →
              </a>
            </article>

            <article className="border border-line bg-ebony-2 p-7">
              <p className="font-mono text-xs text-brass">{PIANO_SEARCH_DEMAND.datasetId}</p>
              <h3 className="mt-4 font-serif-kr text-2xl font-semibold">
                2026 피아노 키워드 검색수요
              </h3>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-faint">데이터셋 버전</dt>
                  <dd className="mt-1 font-mono text-ivory">v{SEARCH_DEMAND_DATASET_VERSION}</dd>
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
                  <dt className="text-faint">고유 키워드</dt>
                  <dd className="mt-1 text-ivory">
                    {formatNumber(PIANO_SEARCH_DEMAND.uniqueKeywords)}개
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">공개 분포</dt>
                  <dd className="mt-1 text-ivory">전체 4,545행 · 세그먼트 요약 7행</dd>
                </div>
              </dl>
              <a
                href="/research/piano-search-demand-report-2026"
                className="mt-7 inline-block text-sm text-brass underline underline-offset-4"
              >
                데이터셋 페이지와 다운로드 →
              </a>
            </article>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="history-title">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.16em] text-brass uppercase">Publication history</p>
            <h2 id="history-title" className="mt-3 font-serif-kr text-3xl font-bold">
              공개·수정 기록
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              같은 날 이뤄진 변경도 공개 결과에 미친 영향에 따라 나눠 기록합니다. 저장소에서
              확인되지 않는 과거 버전이나 검토 이력은 만들지 않습니다.
            </p>
          </div>

          <ol className="mt-10 border-t border-line">
            {researchEvents.map((event) => (
              <li
                key={`${event.type}-${event.title}`}
                className="grid gap-5 border-b border-line py-9 md:grid-cols-[170px_1fr]"
              >
                <div>
                  <time dateTime={event.date} className="block text-sm text-faint">
                    {event.date}
                  </time>
                  <span className="mt-2 inline-block border border-brass/40 bg-brass/10 px-2.5 py-1 text-xs text-brass">
                    {event.type}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3 className="font-serif-kr text-xl font-semibold text-ivory md:text-2xl">
                      {event.title}
                    </h3>
                    <span className="font-mono text-xs text-faint">{event.version}</span>
                  </div>
                  <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">{event.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mt-20 grid gap-8 md:grid-cols-[0.72fr_1.28fr]"
          aria-labelledby="version-rules-title"
        >
          <div>
            <p className="text-xs tracking-[0.16em] text-brass uppercase">Version rules</p>
            <h2 id="version-rules-title" className="mt-3 font-serif-kr text-3xl font-bold">
              다음 버전을 올리는 기준
            </h2>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {[
              [
                "주 버전",
                "필드 의미, 핵심 필터나 계산법이 바뀌어 이전 결과와 그대로 비교하기 어려운 변경",
              ],
              ["부 버전", "새 기준 시점·지역·분포나 호환 가능한 필드를 추가하는 변경"],
              ["수정 버전", "공개 수치, 누락 행, 계산 또는 데이터 내용의 오류를 바로잡는 변경"],
              [
                "버전 유지",
                "수치와 필드 의미를 바꾸지 않는 설명 보강·표시 수정·배포 직렬화 정정. 이 경우에도 검증이나 인용에 영향을 주면 이 페이지에 기록",
              ],
            ].map(([term, definition]) => (
              <div key={term} className="grid gap-2 py-5 sm:grid-cols-[120px_1fr]">
                <dt className="font-serif-kr font-semibold text-ivory">{term}</dt>
                <dd className="text-sm leading-relaxed text-mute">{definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="mt-20 border border-line bg-ebony-2 p-7 md:p-9"
          aria-labelledby="verify-downloads-title"
        >
          <h2 id="verify-downloads-title" className="font-serif-kr text-2xl font-bold">
            현재 파일을 직접 검증하기
          </h2>
          <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">
            매니페스트와 메타데이터에는 현재 공개 파일의 크기·SHA-256·행 수·필드 수가 들어 있습니다.
            이전 해시는 현재 파일의 검증값으로 사용하지 마세요.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <li>
              <a
                href={RESEARCH_DOWNLOADS.sourceManifest}
                className="text-brass underline underline-offset-4"
                download
              >
                원자료 매니페스트 JSON
              </a>
            </li>
            <li>
              <a
                href={RESEARCH_DOWNLOADS.nationalMetadata}
                className="text-brass underline underline-offset-4"
                download
              >
                국가통계 메타데이터 JSON
              </a>
            </li>
            <li>
              <a
                href={RESEARCH_DOWNLOADS.seoulMetadata}
                className="text-brass underline underline-offset-4"
                download
              >
                서울 교습비 메타데이터 JSON
              </a>
            </li>
            <li>
              <a
                href={RESEARCH_DOWNLOADS.searchDemandMetadata}
                className="text-brass underline underline-offset-4"
                download
              >
                검색수요 메타데이터 JSON
              </a>
            </li>
            <li>
              <a
                href={RESEARCH_DOWNLOADS.searchDemandManifest}
                className="text-brass underline underline-offset-4"
                download
              >
                검색수요 원본 해시 매니페스트 JSON
              </a>
            </li>
          </ul>
        </section>

        <ResearchEditorialRecord
          id="research-changelog-editorial-record"
          title="수정 이력 작성·검증 정보"
          publisherName={SITE.brand}
          publisherHref="/"
          sources={[
            {
              name: "교육부·국가데이터처 2025년 초중고 사교육비 조사",
              href: NATIONAL_PDF_SOURCE.sourcePage,
              dateLabel: "원자료 공표일",
              dateValue: NATIONAL_MUSIC_EDUCATION.sourcePublishedAt,
            },
            {
              name: "서울특별시교육청 학원·교습소 공개자료",
              href: "https://www.data.go.kr/data/3044370/fileData.do",
              dateLabel: "원자료 기준일",
              dateValue: SEOUL_PIANO_FEES.referenceDate,
            },
            {
              name: "Google Ads Keyword Planner 공식 도구 안내",
              href: "https://business.google.com/en-all/ad-tools/keyword-planner/",
              dateLabel: "자체 조사 조회일",
              dateValue: PIANO_SEARCH_DEMAND.lookupDate,
            },
            {
              name: "네이버 검색광고 키워드도구 공식 도움말",
              href: "https://ads.naver.com/help/faq/1406",
              dateLabel: "자체 조사 조회일",
              dateValue: PIANO_SEARCH_DEMAND.lookupDate,
            },
          ]}
          referenceLabel="2025년 국가조사·2026-01-01 행정자료·2026-07-23 자체 검색수요 조사"
          datasetPublishedAt={CHANGELOG_PUBLISHED_AT}
          modifiedAt={CHANGELOG_MODIFIED_AT}
          version={NATIONAL_DATASET_VERSION}
          verification="3개 데이터셋의 버전·날짜·행 수·필드 수·파일 해시와 저장소의 공개·보강·무결성 정정 기록을 대조"
          licenseName="데이터셋별 원자료 이용조건과 재사용 기준"
          licenseHref="/research/methodology#reuse-policy"
          reuseNote="이력은 현재 공개 데이터셋의 변경 범위를 설명합니다. 수치를 재사용할 때는 각 데이터셋 페이지의 버전·인용문과 현재 메타데이터를 함께 확인합니다."
        />

        <section className="mt-12 text-sm leading-relaxed text-faint" aria-label="수정 요청">
          빠진 변경이나 잘못 기록된 내용이 있다면 페이지 URL과 확인 근거를{" "}
          <a href="/#contact" className="text-brass underline underline-offset-4">
            오류·수정 요청 창구
          </a>
          로 보내 주세요.
        </section>
      </div>
    </SubPageShell>
  );
}
