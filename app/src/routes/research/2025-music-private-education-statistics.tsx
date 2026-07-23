import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import {
  DownloadCard,
  EvidenceBadge,
  LimitationNotice,
  ResearchBreadcrumb,
  ResearchEditorialRecord,
  ResearchFaq,
  StatCard,
} from "../../components/site/research-ui";
import { SITE_URL } from "../../lib/content";
import {
  NATIONAL_MUSIC_EDUCATION,
  NATIONAL_DATASET_CITATION,
  NATIONAL_DATASET_MODIFIED_AT,
  NATIONAL_DATASET_PUBLISHED_AT,
  NATIONAL_DATASET_VERSION,
  NATIONAL_PDF_SOURCE,
  RESEARCH_DOWNLOADS,
  buildNationalDatasetPageSchema,
  buildNationalMusicDatasetSchema,
  formatBytes,
  formatEokKrw,
  formatNumber,
} from "../../lib/research-data";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/research/2025-music-private-education-statistics")!;
const total = NATIONAL_MUSIC_EDUCATION.rows.find((row) => row.schoolLevel === "전체")!;
const nationalFaq = [
  {
    question: "2025 음악 사교육비 통계는 피아노만의 통계인가요?",
    answer:
      "아닙니다. 교육부와 국가데이터처의 초중고 사교육비 조사에서 음악 전체 과목을 합산한 추정 총액이며 피아노 단독 지출이나 피아노 레슨 가격으로 해석할 수 없습니다.",
  },
  {
    question: "학교급별 가공 CSV에는 어떤 값이 들어 있나요?",
    answer:
      "전국 전체, 초등학교, 중학교, 고등학교의 음악 사교육비 총액 4개 행과 기준연도, 단위, 원화 환산값, 공식 보고서 표 위치를 담았습니다.",
  },
  {
    question: "공식 원문과 가공값을 어떻게 검증할 수 있나요?",
    answer:
      "교육부 공식 PDF를 직접 내려받고 메타데이터 JSON의 파일 크기와 SHA-256을 대조할 수 있습니다. 가공 CSV는 보고서 22~23쪽의 음악 행을 전사했으며 계산 방법과 수정 이력은 방법론 페이지에 공개합니다.",
  },
] as const;

export const Route = createFileRoute("/research/2025-music-private-education-statistics")({
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
              buildNationalDatasetPageSchema(),
              buildNationalMusicDatasetSchema(),
              {
                "@type": "FAQPage",
                "@id": `${SITE_URL}${page.path}#faq`,
                mainEntity: nationalFaq.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                })),
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}${page.path}#breadcrumb`,
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
                    name: "2025 음악 사교육비 통계",
                    item: `${SITE_URL}${page.path}`,
                  },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: NationalMusicStatisticsPage,
});

function NationalMusicStatisticsPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[{ label: "피아노 통계", href: "/research" }, { label: "2025 음악 사교육비" }]}
        />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>교육부·국가데이터처 공식 국가통계</EvidenceBadge>
          <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            2025 음악 사교육비 통계
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            2025년 초중고 사교육비 조사에서 ‘음악’ 과목의 연간 총액을 학교급별로 정리했습니다. 원문
            표의 단위인 억원을 유지하며, 아래 CSV는 보고서 인쇄면 22~23쪽을 그대로 전사한 4개
            행입니다.
          </p>
        </header>

        <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="음악 사교육비 핵심 통계">
          <StatCard
            label="전국 음악 사교육비"
            value={formatEokKrw(total.musicPrivateEducationSpending100mKrw)}
            detail="초·중·고 전체 음악 과목의 2025년 명목 사교육비 총액입니다."
          />
          <StatCard
            label="조사 기준"
            value="약 3,000학급"
            detail="교육부와 국가데이터처가 공동 실시한 학생 단위 표본조사입니다."
          />
          <StatCard
            label="공표일"
            value="2026.03.12"
            detail="기준연도와 발표연도를 혼동하지 않도록 각각 표시했습니다."
          />
        </section>

        <div className="mt-6">
          <LimitationNotice>
            <strong className="text-ivory">해석 범위:</strong> 이 수치는 피아노만의 지출이나 피아노
            레슨 가격이 아니라 음악 전체 과목의 추정 총액입니다. 개인과외·학원·그룹과외 등 조사에
            포함된 여러 사교육 유형을 합친 값입니다.
          </LimitationNotice>
        </div>

        <section className="mt-16 border-l-2 border-brass pl-6" aria-labelledby="national-answer">
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Answer first</p>
          <h2 id="national-answer" className="mt-3 font-serif-kr text-3xl font-bold">
            2025년 전국 음악 사교육비 총액은 얼마인가요?
          </h2>
          <p className="mt-5 max-w-[72ch] font-serif-kr text-xl leading-relaxed text-ivory">
            교육부·국가데이터처 조사 기준 초·중·고 음악 전체 과목의 연간 총액은{" "}
            {formatEokKrw(total.musicPrivateEducationSpending100mKrw)}입니다. 피아노 단독 금액은
            공개된 표에서 분리할 수 없습니다.
          </p>
          <p className="mt-4 max-w-[76ch] text-sm leading-relaxed text-mute">
            근거는{" "}
            <cite className="not-italic">
              <a
                href={NATIONAL_PDF_SOURCE.sourcePage}
                target="_blank"
                rel="noreferrer"
                className="text-brass underline underline-offset-4 hover:text-ivory"
              >
                교육부 2025년 초중고 사교육비 조사 결과
              </a>
            </cite>
            의 인쇄면 22~23쪽 ‘음악’ 행입니다.
          </p>
        </section>

        <section className="mt-20" aria-labelledby="music-stat-table-title">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Official table</p>
            <h2 id="music-stat-table-title" className="mt-3 font-serif-kr text-3xl font-bold">
              학교급별 음악 사교육비 총액
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              단위는 억원입니다. 전체 값은 초등학교·중학교·고등학교 값의 합계와 일치합니다.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <caption className="sr-only">
                2025년 전국 전체·초등학교·중학교·고등학교 음악 사교육비 총액
              </caption>
              <thead className="bg-ebony-2 text-sm text-mute">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">
                    학교급
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">
                    총액(억원)
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">
                    원화 환산
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">
                    전체 대비
                  </th>
                </tr>
              </thead>
              <tbody>
                {NATIONAL_MUSIC_EDUCATION.rows.map((row) => (
                  <tr key={row.schoolLevel} className="border-t border-line">
                    <th scope="row" className="px-5 py-4 font-medium text-ivory">
                      {row.schoolLevel}
                    </th>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {formatNumber(row.musicPrivateEducationSpending100mKrw)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {formatEokKrw(row.musicPrivateEducationSpending100mKrw)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {(
                        (row.musicPrivateEducationSpending100mKrw /
                          total.musicPrivateEducationSpending100mKrw) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            전체 대비 비율은 본 사이트 계산값입니다. 원문 금액은 각각 반올림되어 세부 합계가 다른
            표와 완전히 일치하지 않을 수 있습니다.
          </p>
        </section>

        <section className="mt-20" aria-labelledby="national-download-title">
          <h2 id="national-download-title" className="font-serif-kr text-3xl font-bold">
            원자료와 가공 데이터 다운로드
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <DownloadCard
              href={RESEARCH_DOWNLOADS.nationalCsv}
              title="학교급별 가공 CSV"
              description="학교급, 음악 과목 총액, 억원·원 환산값과 원문 표 위치를 포함합니다."
              meta="CSV · 4행"
            />
            <DownloadCard
              href={NATIONAL_PDF_SOURCE.downloadUrl}
              title="교육부 공식 원문 PDF"
              description="2025년 초중고 사교육비 조사 전체 표와 조사 유의사항을 확인합니다."
              meta={`PDF · ${formatBytes(NATIONAL_PDF_SOURCE.bytes)}`}
              external
            />
            <DownloadCard
              href={RESEARCH_DOWNLOADS.nationalMetadata}
              title="데이터셋 메타데이터"
              description="출처, SHA-256, 기준연도, 단위, 표 위치와 한계를 기계 판독형으로 제공합니다."
              meta="JSON"
            />
            <DownloadCard
              href={RESEARCH_DOWNLOADS.nationalSchema}
              title="CSV 데이터 사전"
              description="7개 공개 필드의 자료형, 단위, null 허용 여부, 원자료 대응과 계산 규칙입니다."
              meta="JSON · 7필드"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a
              href={NATIONAL_PDF_SOURCE.sourcePage}
              target="_blank"
              rel="noreferrer"
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              교육부 발표 페이지 ↗
            </a>
            <a
              href="https://kosis.kr/statHtml/statHtml.do?conn_path=I2&orgId=101&tblId=DT_1PE003"
              target="_blank"
              rel="noreferrer"
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              KOSIS 공식 통계표 ↗
            </a>
            <a
              href="/research/methodology"
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              방법론·한계·수정 이력 →
            </a>
          </div>
        </section>

        <ResearchEditorialRecord
          id="national-editorial-record"
          publisherName="이화 피아노 과외"
          publisherHref="/"
          sourceName="교육부·국가데이터처 2025년 초중고 사교육비 조사"
          sourceHref={NATIONAL_PDF_SOURCE.sourcePage}
          referenceLabel="2025년"
          sourcePublishedAt={
            NATIONAL_MUSIC_EDUCATION.sourcePublishedAt ?? NATIONAL_MUSIC_EDUCATION.publishedAt
          }
          datasetPublishedAt={NATIONAL_DATASET_PUBLISHED_AT}
          modifiedAt={NATIONAL_DATASET_MODIFIED_AT}
          version={NATIONAL_DATASET_VERSION}
          verification="학교급 합계·전체값 일치, PDF SHA-256, CSV 4행, 공개 링크와 Dataset 구조 검사"
          licenseName="교육부 원문 게시 페이지의 이용조건"
          licenseHref={NATIONAL_PDF_SOURCE.sourcePage}
          reuseNote="원자료 이용조건을 우선 적용합니다. 가공 CSV를 재사용할 때는 교육부·국가데이터처와 이 페이지의 데이터셋명·버전·URL을 함께 표시해 주세요."
          citation={NATIONAL_DATASET_CITATION}
        />

        <ResearchFaq
          id="national-faq-title"
          title="음악 사교육비 통계 자주 묻는 질문"
          items={nationalFaq}
        />
      </div>
    </SubPageShell>
  );
}
