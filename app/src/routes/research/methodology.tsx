import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import {
  DownloadCard,
  EvidenceBadge,
  LimitationNotice,
  ResearchBreadcrumb,
} from "../../components/site/research-ui";
import { SITE, SITE_URL } from "../../lib/content";
import {
  RESEARCH_DOWNLOADS,
  RESEARCH_SOURCE_MANIFEST,
  SEOUL_PIANO_FEES,
  formatNumber,
} from "../../lib/research-data";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/research/methodology")!;

export const Route = createFileRoute("/research/methodology")({
  head: () => ({
    ...buildPublicPageHead(page),
    scripts: [
      {
        type: "application/ld+json",
        children: safeJsonLd({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${SITE_URL}${page.path}#webpage`,
              name: page.title,
              description: page.description,
              url: `${SITE_URL}${page.path}`,
              dateModified: SEOUL_PIANO_FEES.retrievedAt,
              inLanguage: "ko",
              author: { "@type": "Organization", name: SITE.brand, url: SITE_URL },
              isPartOf: { "@id": `${SITE_URL}/#website` },
              about: [
                { "@id": `${SITE_URL}/research/2025-music-private-education-statistics#dataset` },
                { "@id": `${SITE_URL}/research/2026-seoul-piano-academy-fees#dataset` },
              ],
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
                  name: "피아노 데이터 방법론",
                  item: `${SITE_URL}${page.path}`,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: ResearchMethodologyPage,
});

const methodSteps = [
  {
    title: "1. 공식 원문을 고정합니다",
    body: `기준일이 표시된 서울특별시교육청 XLS 11개와 교육부 PDF 1개를 내려받아 파일 크기와 SHA-256을 기록합니다. 현재 매니페스트는 ${RESEARCH_SOURCE_MANIFEST.sources.length}개 원자료를 가리킵니다.`,
  },
  {
    title: "2. 모든 시트와 행을 검사합니다",
    body: `서울 학원·교습소 원자료 ${formatNumber(SEOUL_PIANO_FEES.rawRowsScanned)}행을 읽고 헤더가 확인된 시트만 처리합니다. 특정 교육지원청이나 자치구만 뽑아 표본을 만들지 않습니다.`,
  },
  {
    title: "3. 피아노 교습상품을 고정 규칙으로 찾습니다",
    body: "교습과목·교습과정·교습계열에 ‘피아노’ 또는 ‘piano’가 명시된 행을 우선 포함합니다. 시설명에만 피아노가 있는 경우 바이엘·체르니·초중고급·개인레슨 등 피아노 교육과정 신호가 함께 있어야 하며 다른 악기 과목은 제외합니다.",
  },
  {
    title: "4. 중복과 직접 식별정보를 분리합니다",
    body: `시설·과정·과목·기간·시간·금액이 모두 같은 ${formatNumber(SEOUL_PIANO_FEES.duplicateRowsRemoved)}개 행을 제거했습니다. 공개 CSV에서는 설립자·교습자 성명, 전화번호, 시설명, 정확한 주소와 원자료 파일·시트·행 위치를 제외합니다. 시설 ID는 내부 중복 제거와 시설 수 집계에만 사용합니다.`,
  },
  {
    title: "5. 유효값과 통계를 계산합니다",
    body: "0원·공란 교습비는 무료 수업으로 보지 않고 금액 통계에서 제외합니다. 시간당 교습비는 교습비 ÷ (총 교습시간(분) ÷ 60)으로만 계산하며 횟수는 추정하지 않습니다. 대표값은 중앙값, Q1, Q3를 사용합니다.",
  },
] as const;

const limitations = [
  "등록·신고 교습비이며 할인, 교재비, 콩쿠르비, 추가 레슨비를 반영한 실제 결제금액이 아닙니다.",
  "학원·교습소 자료이므로 프리랜서 개인과외와 방문 레슨은 포함하지 않습니다.",
  "교습기간 표기가 파일과 시설 유형마다 달라 전체 금액을 월평균으로 환산하지 않습니다.",
  "피아노가 구조화 코드가 아닌 텍스트로 입력되어 있어 표현이 다른 행은 빠질 수 있습니다.",
  `시간당 값의 상·하위 1%에 해당하는 ${formatNumber(SEOUL_PIANO_FEES.hourlyExtremeReviewRecords)}개 행은 검토 표식만 붙이고 임의 삭제하지 않았습니다.`,
  `주소에서 자치구를 확정하지 못한 ${formatNumber(SEOUL_PIANO_FEES.missingDistrictRecords)}개 행은 서울 전체에는 포함하되 자치구 통계에서 제외했습니다.`,
  "교육부 음악 사교육비는 음악 전체 과목의 학생 단위 표본조사 결과이며 피아노 단독 통계가 아닙니다.",
  "원자료 기준일 이후 개원·폐원·교습비 변경은 현재 데이터에 반영되지 않습니다.",
  "직접 식별정보와 원자료 행 위치를 뺐지만, 공개 원자료와 속성 조합을 통한 재식별 가능성을 완전히 배제할 수는 없습니다. 개인·시설 식별에 사용하면 안 됩니다.",
] as const;

function ResearchMethodologyPage() {
  return (
    <SubPageShell>
      <main className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[{ label: "피아노 통계", href: "/research" }, { label: "피아노 데이터 방법론" }]}
        />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>재현 가능한 데이터 출판 기준</EvidenceBadge>
          <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 데이터 방법론
          </h1>
          <p className="mt-6 max-w-[72ch] text-lg leading-relaxed text-mute">
            공식 원문과 사이트 계산값을 분리하고, 같은 원자료로 같은 결과를 다시 만들 수 있도록
            수집·필터·직접 식별정보 제거·통계·공개 제한 규칙을 기록합니다.
          </p>
        </header>

        <section className="mt-16" aria-labelledby="method-steps-title">
          <h2 id="method-steps-title" className="font-serif-kr text-3xl font-bold">
            처리 절차
          </h2>
          <ol className="mt-8 divide-y divide-line border-y border-line">
            {methodSteps.map((step) => (
              <li key={step.title} className="grid gap-3 py-7 md:grid-cols-[0.55fr_1.45fr]">
                <h3 className="font-serif-kr text-xl font-semibold text-ivory">{step.title}</h3>
                <p className="leading-relaxed text-mute">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20" aria-labelledby="field-policy-title">
          <h2 id="field-policy-title" className="font-serif-kr text-3xl font-bold">
            원자료 필드와 공개 처리
          </h2>
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-ebony-2 text-sm text-mute">
                <tr>
                  <th className="px-5 py-4 font-medium">원자료</th>
                  <th className="px-5 py-4 font-medium">가공 CSV</th>
                  <th className="px-5 py-4 font-medium">처리 원칙</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["시설명·주소", "district", "시설 ID는 내부 집계에만 사용하고 자치구만 공개"],
                  ["설립자·교습자·전화번호", "미포함", "공개 원자료에 있어도 가공 CSV에서 삭제"],
                  [
                    "교습계열·과정·과목",
                    "series·course·subject",
                    "피아노 필터 근거와 원문 표기를 유지",
                  ],
                  ["교습기간", "registered_period", "원문 문자열 유지, 일괄 월환산 금지"],
                  ["총교습시간(분)", "total_minutes", "0·공란이면 시간당 계산 제외"],
                  [
                    "교습비·총교습비",
                    "tuition_fee_krw·total_fee_krw",
                    "교습비와 기타경비 포함 총액을 분리",
                  ],
                  ["파생값", "hourly_tuition_krw", "교습비와 총교습시간이 모두 양수일 때만 계산"],
                ].map(([raw, output, rule]) => (
                  <tr key={raw} className="border-t border-line">
                    <th className="px-5 py-4 font-medium text-ivory">{raw}</th>
                    <td className="px-5 py-4 font-mono text-xs text-mute">{output}</td>
                    <td className="px-5 py-4 text-sm leading-relaxed text-mute">{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="publication-rules-title">
          <h2 id="publication-rules-title" className="font-serif-kr text-3xl font-bold">
            통계 공개 기준
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["n ≥ 10", "중앙값·Q1·Q3 공개", "일반 공개"],
              ["n = 5~9", "값은 공개하되 ‘표본 적음’ 표시", "제한 공개"],
              ["n < 5", "표본 수만 공개하고 금액은 비공개", "공개 제한"],
            ].map(([range, rule, status]) => (
              <div key={range} className="border border-line bg-ebony-2 p-6">
                <p className="text-xs tracking-[0.14em] text-brass uppercase">{status}</p>
                <h3 className="mt-3 font-serif-kr text-2xl font-semibold">{range}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="limitations-title">
          <h2 id="limitations-title" className="font-serif-kr text-3xl font-bold">
            한계와 금지되는 해석
          </h2>
          <div className="mt-6">
            <LimitationNotice>
              이 데이터로 ‘서울 전체 실제 피아노 레슨 시장 평균’이나 ‘개인과외 평균가격’을 말하면 안
              됩니다. 사용 가능한 표현은 ‘서울특별시교육청 공개자료 기반 등록 교습비
              파생분석’입니다.
            </LimitationNotice>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {limitations.map((limitation) => (
              <li
                key={limitation}
                className="border border-line p-5 text-sm leading-relaxed text-mute"
              >
                {limitation}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="reproduction-title">
          <h2 id="reproduction-title" className="font-serif-kr text-3xl font-bold">
            재생성 방법
          </h2>
          <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">
            Windows PowerShell, Microsoft Excel, Python의 pandas·openpyxl이 필요합니다. 스크립트는
            원자료를 임시 폴더에만 저장하고 공개 CSV·JSON을 다시 생성합니다.
          </p>
          <pre className="mt-6 overflow-x-auto border border-line bg-ebony-2 p-5 text-sm text-mute">
            <code>{`.\\scripts\\refresh-research-data.ps1 -RetrievedAt 2026-07-23`}</code>
          </pre>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <DownloadCard
              href={RESEARCH_DOWNLOADS.sourceManifest}
              title="원자료 매니페스트"
              description="공식 파일 직접 링크, 파일 크기, 수집일과 SHA-256을 확인합니다."
              meta="JSON"
            />
            <DownloadCard
              href={RESEARCH_DOWNLOADS.seoulMetadata}
              title="서울 데이터셋 메타데이터"
              description="파이프라인·필터 버전, 포함·제외 건수, 유형별 표본 규모를 확인합니다."
              meta="JSON"
            />
          </div>
        </section>

        <section
          id="change-log"
          className="mt-20 border-t border-line pt-12"
          aria-labelledby="change-log-title"
        >
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Change log</p>
          <h2 id="change-log-title" className="mt-3 font-serif-kr text-3xl font-bold">
            수정 이력
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-[160px_1fr]">
            <div className="text-sm text-faint">2026-07-23</div>
            <div className="border-l border-line pl-5">
              <h3 className="font-serif-kr text-xl font-semibold text-ivory">
                v{SEOUL_PIANO_FEES.pipelineVersion} 최초 공개
              </h3>
              <p className="mt-2 leading-relaxed text-mute">
                서울시교육청 2026-01-01 스냅샷 11개와 교육부 2025 조사 PDF를 고정했습니다. 피아노
                필터 {SEOUL_PIANO_FEES.filterVersion}, 직접 식별정보를 제거한 교습상품{" "}
                {formatNumber(SEOUL_PIANO_FEES.publishedRecords)}건, 시설{" "}
                {formatNumber(SEOUL_PIANO_FEES.publishedFacilities)}곳을 공개했습니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </SubPageShell>
  );
}
