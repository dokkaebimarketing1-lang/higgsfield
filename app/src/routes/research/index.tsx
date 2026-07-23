import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import { EvidenceBadge, ResearchBreadcrumb, StatCard } from "../../components/site/research-ui";
import { SITE_URL } from "../../lib/content";
import {
  NATIONAL_MUSIC_EDUCATION,
  SEOUL_PIANO_FEES,
  formatEokKrw,
  formatNumber,
} from "../../lib/research-data";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { buildCollectionPageSchema, safeJsonLd } from "../../lib/structured-data";

const researchPage = PUBLIC_PAGE_BY_PATH.get("/research")!;
const nationalTotal = NATIONAL_MUSIC_EDUCATION.rows.find((row) => row.schoolLevel === "전체")!;

const researchItems = [
  {
    name: "2025 음악 사교육비 통계",
    path: "/research/2025-music-private-education-statistics",
    description: "교육부·국가데이터처 공식 통계의 음악 과목 총액",
    evidence: "공식 국가통계",
  },
  {
    name: "2026 서울 피아노 학원비",
    path: "/research/2026-seoul-piano-academy-fees",
    description: "서울특별시교육청 공개자료 기반 학원·교습소 파생분석",
    evidence: "공식 행정자료 기반",
  },
  {
    name: "피아노 데이터 방법론",
    path: "/research/methodology",
    description: "수집·필터·직접 식별정보 제거·통계 기준·한계·수정 이력",
    evidence: "재현성 문서",
  },
] as const;

export const Route = createFileRoute("/research/")({
  head: () => ({
    ...buildPublicPageHead(researchPage),
    scripts: [
      {
        type: "application/ld+json",
        children: safeJsonLd({
          "@context": "https://schema.org",
          "@graph": [
            buildCollectionPageSchema({
              name: researchPage.primaryKeyword,
              description: researchPage.description,
              url: `${SITE_URL}/research`,
              image: researchPage.image,
              items: researchItems.map((item) => ({ name: item.name, path: item.path })),
            }),
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
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: ResearchHub,
});

function ResearchHub() {
  return (
    <SubPageShell>
      <main className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb items={[{ label: "피아노 통계" }]} />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>공식 원문과 파생분석을 분리 공개합니다</EvidenceBadge>
          <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 통계 자료실
          </h1>
          <p className="mt-6 max-w-[70ch] text-lg leading-relaxed text-mute">
            숫자만 인용하지 않습니다. 공식 원자료의 출처와 해시, 직접 식별정보를 제거한 가공 CSV,
            필터와 계산 방법, 해석하면 안 되는 범위와 수정 이력을 같은 페이지에서 제공합니다.
          </p>
        </header>

        <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="핵심 데이터 규모">
          <StatCard
            label="2025 음악 사교육비 총액"
            value={formatEokKrw(nationalTotal.musicPrivateEducationSpending100mKrw)}
            detail="전국 초·중·고 음악 전체 과목 기준이며 피아노 단독 금액은 아닙니다."
          />
          <StatCard
            label="서울 피아노 교습상품"
            value={`${formatNumber(SEOUL_PIANO_FEES.publishedRecords)}건`}
            detail={`2026년 1월 1일 기준 공식 공개자료 ${formatNumber(SEOUL_PIANO_FEES.rawRowsScanned)}행을 검사한 결과입니다.`}
          />
          <StatCard
            label="집계된 시설 수"
            value={`${formatNumber(SEOUL_PIANO_FEES.publishedFacilities)}곳`}
            detail="학원과 교습소를 분리 집계했으며 시설명·전화번호·정확한 주소는 공개하지 않습니다."
          />
        </section>

        <section className="mt-20">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Dataset catalog</p>
            <h2 className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
              데이터셋과 검증 문서
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              국가통계와 행정자료 기반 파생 통계를 섞지 않고 독립 페이지로 관리합니다.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {researchItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="group flex min-h-64 flex-col border border-line bg-ebony-2 p-7 transition-colors hover:border-brass/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
              >
                <span className="text-xs tracking-[0.14em] text-brass uppercase">
                  {item.evidence}
                </span>
                <h2 className="mt-5 font-serif-kr text-2xl font-semibold transition-colors group-hover:text-brass">
                  {item.name}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-mute">{item.description}</p>
                <span className="mt-auto pt-8 text-sm font-medium text-ivory">
                  {item.name} 자세히 보기 →
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-line pt-12">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Evidence policy</p>
              <h2 className="mt-3 font-serif-kr text-3xl font-bold">숫자의 등급을 표시합니다</h2>
            </div>
            <ol className="space-y-6">
              {[
                [
                  "1. 공식 국가통계",
                  "교육부·국가데이터처 등 국가승인 통계의 정의와 단위를 그대로 유지합니다.",
                ],
                [
                  "2. 공식 행정자료 기반 파생통계",
                  "공공기관 원자료를 필터·집계한 값에는 사이트 계산값임을 명시합니다.",
                ],
                [
                  "3. 자체 조사",
                  "검색량·시장조사는 조사기간, 표본, 플랫폼과 제외 기준을 공개합니다.",
                ],
                [
                  "4. 전문가 해설",
                  "통계로 확인되지 않는 레슨 선택 조언은 수치와 분리해 설명합니다.",
                ],
              ].map(([title, body]) => (
                <li key={title} className="border-b border-line pb-6">
                  <h3 className="font-serif-kr text-xl font-semibold text-ivory">{title}</h3>
                  <p className="mt-2 leading-relaxed text-mute">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </SubPageShell>
  );
}
