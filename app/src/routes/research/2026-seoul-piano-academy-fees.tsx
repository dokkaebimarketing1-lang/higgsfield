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
  RESEARCH_DOWNLOADS,
  SEOUL_ADMINISTRATIVE_SOURCES,
  SEOUL_PIANO_FEES,
  buildSeoulPianoFeesDatasetSchema,
  facilityTypeLabel,
  formatBytes,
  formatKrw,
  formatNumber,
  type ResearchSummaryRow,
} from "../../lib/research-data";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/research/2026-seoul-piano-academy-fees")!;
const academy = SEOUL_PIANO_FEES.seoulSummary.find((row) => row.facility_type === "academy")!;
const teachingCenter = SEOUL_PIANO_FEES.seoulSummary.find(
  (row) => row.facility_type === "teaching_center",
)!;
const districtNames = Array.from(
  new Set(SEOUL_PIANO_FEES.districtSummary.map((row) => row.area)),
).sort((a, b) => a.localeCompare(b, "ko"));
const seoulFaq = [
  {
    question: "서울 피아노 학원비 수치는 실제 결제금액인가요?",
    answer:
      "아닙니다. 서울특별시교육청에 등록·신고된 교습비를 분석한 값이며 할인, 교재비, 콩쿠르비, 추가 레슨비를 반영한 실제 결제금액이나 시장 평균이 아닙니다.",
  },
  {
    question: "피아노 학원과 교습소 통계를 왜 나누나요?",
    answer:
      "학원과 교습소는 시설 규모와 운영 구조가 달라 가격 분포도 다를 수 있습니다. 서로 다른 집단을 한 평균으로 섞지 않도록 표본 수, 중앙값, Q1, Q3를 시설 유형별로 따로 제공합니다.",
  },
  {
    question: "개인과외와 방문 피아노 레슨도 포함되나요?",
    answer:
      "포함되지 않습니다. 이 데이터는 서울특별시교육청이 공개한 학원·교습소 행정자료만 대상으로 하므로 프리랜서 개인과외와 방문 레슨 가격을 설명하지 않습니다.",
  },
] as const;

export const Route = createFileRoute("/research/2026-seoul-piano-academy-fees")({
  head: () => ({
    ...buildPublicPageHead(page),
    scripts: [
      {
        type: "application/ld+json",
        children: safeJsonLd({
          "@context": "https://schema.org",
          "@graph": [
            buildSeoulPianoFeesDatasetSchema(),
            {
              "@type": "FAQPage",
              "@id": `${SITE_URL}${page.path}#faq`,
              mainEntity: seoulFaq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
            {
              "@type": "BreadcrumbList",
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
                  name: "2026 서울 피아노 학원비",
                  item: `${SITE_URL}${page.path}`,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: SeoulPianoFeesPage,
});

function rangeLabel(row: ResearchSummaryRow, field: "registered" | "hourly") {
  const q1 = field === "registered" ? row.registered_tuition_q1_krw : row.hourly_tuition_q1_krw;
  const q3 = field === "registered" ? row.registered_tuition_q3_krw : row.hourly_tuition_q3_krw;
  return `${formatKrw(q1)}~${formatKrw(q3)}`;
}

function DistrictValue({ row }: { row: ResearchSummaryRow | undefined }) {
  if (!row) return <span className="text-faint">자료 없음</span>;
  return (
    <div>
      <strong className="font-medium text-ivory">
        {formatKrw(row.registered_tuition_median_krw)}
      </strong>
      <span className="mt-1 block text-xs text-faint">
        n={formatNumber(row.valid_tuition_records)} · {formatNumber(row.facility_count)}곳
      </span>
    </div>
  );
}

function SeoulPianoFeesPage() {
  return (
    <SubPageShell>
      <main className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[
            { label: "피아노 통계", href: "/research" },
            { label: "2026 서울 피아노 학원비" },
          ]}
        />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>서울특별시교육청 공식 공개자료 기반 파생분석</EvidenceBadge>
          <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            2026 서울 피아노 학원비·교습소 등록 교습비
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            2026년 1월 1일 기준 서울시 학원·교습소 교습비 원자료의 모든 시트를 검사해 피아노가
            명시된 교습상품만 추출했습니다. 학원과 교습소를 분리하고, 중앙값·사분위수·표본 수와 직접
            식별정보와 원자료 행 위치를 제거한 가공 CSV를 함께 공개합니다.
          </p>
        </header>

        <section
          className="mt-14 grid gap-4 md:grid-cols-3"
          aria-label="서울 피아노 등록 교습비 핵심 통계"
        >
          <StatCard
            label="학원 등록 교습비 중앙값"
            value={formatKrw(academy.registered_tuition_median_krw)}
            detail={`Q1~Q3 ${rangeLabel(academy, "registered")} · ${formatNumber(academy.valid_tuition_records)}개 교습상품`}
          />
          <StatCard
            label="교습소 등록 교습비 중앙값"
            value={formatKrw(teachingCenter.registered_tuition_median_krw)}
            detail={`Q1~Q3 ${rangeLabel(teachingCenter, "registered")} · ${formatNumber(teachingCenter.valid_tuition_records)}개 교습상품`}
          />
          <StatCard
            label="공개 가공 행"
            value={`${formatNumber(SEOUL_PIANO_FEES.publishedRecords)}건`}
            detail={`${formatNumber(SEOUL_PIANO_FEES.publishedFacilities)}개 시설을 내부 집계 · 중복 ${formatNumber(SEOUL_PIANO_FEES.duplicateRowsRemoved)}건 제거`}
          />
        </section>

        <div className="mt-6">
          <LimitationNotice>
            <strong className="text-ivory">가격 의미:</strong> 위 금액은 각 교습상품에 등록된 기간당
            교습비의 중앙값입니다. 기간 표현이 섞여 있어 ‘월평균’으로 부르지 않으며,
            할인·교재비·추가 레슨비가 반영된 실제 결제액이나 개인·방문 피아노 과외 가격도 아닙니다.
          </LimitationNotice>
        </div>

        <section className="mt-20" aria-labelledby="seoul-type-comparison-title">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Separate populations</p>
            <h2 id="seoul-type-comparison-title" className="mt-3 font-serif-kr text-3xl font-bold">
              학원과 교습소를 나눠 봅니다
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              운영 규모와 등록 구조가 다른 두 시설 유형을 합친 단일 평균은 헤드라인으로 사용하지
              않습니다. 평균보다 극단값에 덜 흔들리는 중앙값과 Q1·Q3를 우선합니다.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-ebony-2 text-sm text-mute">
                <tr>
                  <th className="px-5 py-4 font-medium">시설 유형</th>
                  <th className="px-5 py-4 text-right font-medium">교습상품</th>
                  <th className="px-5 py-4 text-right font-medium">시설</th>
                  <th className="px-5 py-4 text-right font-medium">등록 교습비 중앙값</th>
                  <th className="px-5 py-4 text-right font-medium">등록 교습비 Q1~Q3</th>
                  <th className="px-5 py-4 text-right font-medium">시간당 환산 중앙값</th>
                </tr>
              </thead>
              <tbody>
                {[academy, teachingCenter].map((row) => (
                  <tr key={row.facility_type} className="border-t border-line">
                    <th className="px-5 py-4 font-medium text-ivory">
                      {facilityTypeLabel(row.facility_type)}
                    </th>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {formatNumber(row.candidate_records)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {formatNumber(row.facility_count)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {formatKrw(row.registered_tuition_median_krw)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {rangeLabel(row, "registered")}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-mute">
                      {formatKrw(row.hourly_tuition_median_krw)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            시간당 환산은 등록 교습비 ÷ (총 교습시간(분) ÷ 60)입니다. 수업 횟수는 원자료에 명확한
            구조화 필드가 없어 추정하지 않았습니다.
          </p>
        </section>

        <section className="mt-20" aria-labelledby="district-table-title">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">District breakdown</p>
            <h2 id="district-table-title" className="mt-3 font-serif-kr text-3xl font-bold">
              서울 자치구별 등록 교습비 중앙값
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              자치구별로 학원과 교습소를 다시 분리했습니다. 각 칸에 유효 교습상품 수 n과 내부 집계
              시설 수를 함께 표시합니다.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-ebony-2 text-sm text-mute">
                <tr>
                  <th className="px-5 py-4 font-medium">자치구</th>
                  <th className="px-5 py-4 text-right font-medium">학원 중앙값</th>
                  <th className="px-5 py-4 text-right font-medium">교습소 중앙값</th>
                </tr>
              </thead>
              <tbody>
                {districtNames.map((district) => {
                  const academyRow = SEOUL_PIANO_FEES.districtSummary.find(
                    (row) => row.area === district && row.facility_type === "academy",
                  );
                  const centerRow = SEOUL_PIANO_FEES.districtSummary.find(
                    (row) => row.area === district && row.facility_type === "teaching_center",
                  );
                  return (
                    <tr key={district} className="border-t border-line">
                      <th className="px-5 py-4 font-medium text-ivory">{district}</th>
                      <td className="px-5 py-4 text-right text-mute">
                        <DistrictValue row={academyRow} />
                      </td>
                      <td className="px-5 py-4 text-right text-mute">
                        <DistrictValue row={centerRow} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            주소에서 자치구를 확정하지 못한 {formatNumber(SEOUL_PIANO_FEES.missingDistrictRecords)}
            개 행은 서울 전체 통계에는 포함하고 자치구 표에서는 제외했습니다. n&lt;5인 그룹은 금액을
            비공개하는 규칙을 적용합니다.
          </p>
        </section>

        <section className="mt-20" aria-labelledby="seoul-download-title">
          <h2 id="seoul-download-title" className="font-serif-kr text-3xl font-bold">
            가공 CSV와 검증 파일
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <DownloadCard
              href={RESEARCH_DOWNLOADS.seoulRecordsCsv}
              title="직접 식별정보 제거 교습상품 CSV"
              description="시설명·성명·전화번호·정확한 주소를 제거한 교습상품 단위 데이터입니다."
              meta={`CSV · ${formatNumber(SEOUL_PIANO_FEES.publishedRecords)}행`}
            />
            <DownloadCard
              href={RESEARCH_DOWNLOADS.seoulSummaryCsv}
              title="서울·자치구 요약 CSV"
              description="시설 유형별 표본 수, 중앙값, Q1·Q3, 유효률과 공개 제한 메모를 포함합니다."
              meta={`CSV · ${formatNumber(SEOUL_PIANO_FEES.districtSummary.length + SEOUL_PIANO_FEES.seoulSummary.length)}행`}
            />
            <DownloadCard
              href={RESEARCH_DOWNLOADS.sourceManifest}
              title="출처·SHA-256 매니페스트"
              description="공식 원문 12개 파일의 직접 링크, 크기, 수집일과 무결성 해시입니다."
              meta="JSON · 12개 원자료"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a
              href="/research/methodology"
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              방법론·한계·수정 이력 →
            </a>
            <a
              href={RESEARCH_DOWNLOADS.seoulMetadata}
              download
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              데이터셋 메타데이터 JSON ↓
            </a>
            <a
              href="https://www.data.go.kr/data/3044370/fileData.do"
              target="_blank"
              rel="noreferrer"
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              공공데이터포털 설명·이용범위 ↗
            </a>
          </div>
        </section>

        <section className="mt-20 border-t border-line pt-12" aria-labelledby="raw-source-title">
          <details>
            <summary
              id="raw-source-title"
              className="cursor-pointer font-serif-kr text-3xl font-bold marker:text-brass"
            >
              서울시교육청 원자료 11개 직접 다운로드
            </summary>
            <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">
              원자료에는 성명·전화번호·정확한 주소가 포함될 수 있어 이 사이트가 복제해 재배포하지
              않습니다. 아래 링크는 서울특별시교육청 서버의 원본 XLS를 직접 엽니다.
            </p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {SEOUL_ADMINISTRATIVE_SOURCES.map((source) => (
                <li
                  key={source.sourceId}
                  className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <a
                      href={source.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-keep font-medium text-ivory underline decoration-brass/60 underline-offset-4 hover:text-brass"
                    >
                      {source.originalName}
                    </a>
                    <p className="mt-2 break-all font-mono text-[11px] text-faint">
                      SHA-256 {source.sha256}
                    </p>
                  </div>
                  <span className="text-sm whitespace-nowrap text-mute">
                    {source.format} · {formatBytes(source.bytes)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </section>

        <ResearchFaq
          id="seoul-faq-title"
          title="서울 피아노 학원비 자주 묻는 질문"
          items={seoulFaq}
        />
      </main>
    </SubPageShell>
  );
}
