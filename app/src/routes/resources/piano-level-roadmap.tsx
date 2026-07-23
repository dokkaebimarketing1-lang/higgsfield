import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../../components/site/chrome";
import { PageAuthorityRecord } from "../../components/site/page-authority-record";
import {
  EvidenceBadge,
  LimitationNotice,
  ResearchBreadcrumb,
  ResearchFaq,
} from "../../components/site/research-ui";
import { SITE, SITE_URL } from "../../lib/content";
import { LEVEL_ROADMAP_FAQ, PIANO_LEVELS, RESOURCE_UPDATED_AT } from "../../lib/piano-resources";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../../lib/seo-pages";
import { safeJsonLd } from "../../lib/structured-data";

const page = PUBLIC_PAGE_BY_PATH.get("/resources/piano-level-roadmap")!;
const canonical = `${SITE_URL}${page.path}`;

export const Route = createFileRoute("/resources/piano-level-roadmap")({
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
              {
                "@type": "WebPage",
                "@id": `${canonical}#webpage`,
                url: canonical,
                name: page.title,
                description: page.description,
                inLanguage: "ko",
                datePublished: RESOURCE_UPDATED_AT,
                dateModified: RESOURCE_UPDATED_AT,
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                isPartOf: { "@id": `${SITE_URL}/#website` },
                breadcrumb: { "@id": `${canonical}#breadcrumb` },
                mainEntity: { "@id": `${canonical}#article` },
              },
              {
                "@type": "Article",
                "@id": `${canonical}#article`,
                headline: page.title,
                description: page.description,
                url: canonical,
                inLanguage: "ko",
                datePublished: RESOURCE_UPDATED_AT,
                dateModified: RESOURCE_UPDATED_AT,
                author: { "@id": `${SITE_URL}/#business` },
                publisher: { "@id": `${SITE_URL}/#business` },
                mainEntityOfPage: { "@id": `${canonical}#webpage` },
                about: ["피아노 수준", "피아노 학습 단계", "피아노 연습 계획"],
                hasPart: {
                  "@type": "ItemList",
                  numberOfItems: PIANO_LEVELS.length,
                  itemListOrder: "https://schema.org/ItemListOrderAscending",
                  itemListElement: PIANO_LEVELS.map((level, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: `${level.stage} ${level.label}`,
                    url: `${canonical}#${level.id}`,
                  })),
                },
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${canonical}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "피아노 학습 자료",
                    item: `${SITE_URL}/resources`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "피아노 수준별 학습 로드맵",
                    item: canonical,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": `${canonical}#faq`,
                mainEntity: LEVEL_ROADMAP_FAQ.map((item) => ({
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
  component: PianoLevelRoadmapPage,
});

function printRoadmap() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

function PianoLevelRoadmapPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <ResearchBreadcrumb
          items={[
            { label: "피아노 학습 자료", href: "/resources" },
            { label: "피아노 수준별 학습 로드맵" },
          ]}
        />

        <header className="mt-10 max-w-4xl">
          <EvidenceBadge>교재 진도보다 수행 능력을 확인합니다</EvidenceBadge>
          <h1 className="mt-6 font-serif-kr text-4xl font-bold tracking-tight md:text-6xl">
            피아노 수준별 학습 로드맵
          </h1>
          <p className="mt-6 max-w-[74ch] text-lg leading-relaxed text-mute">
            피아노 수준을 입문부터 상급 준비까지 다섯 단계로 나누고, 각 단계에서 직접 확인할 수 있는
            읽기·리듬·양손 협응·이론·연습 독립성 기준을 정리했습니다. 교재 이름은 참고일 뿐, 다음
            단계는 실제로 수행할 수 있는 항목을 기준으로 판단합니다.
          </p>
          <div
            className="mt-8 flex flex-wrap gap-3 print:hidden"
            aria-label="로드맵 파일과 인쇄 기능"
          >
            <a
              href="/data/resources/piano-level-roadmap.csv"
              download
              className="inline-flex min-h-12 items-center justify-center bg-brass px-5 py-3 text-sm font-semibold text-ebony transition-colors hover:bg-[#cdb07a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              로드맵 CSV 내려받기
            </a>
            <button
              type="button"
              onClick={printRoadmap}
              className="inline-flex min-h-12 items-center justify-center border border-line px-5 py-3 text-sm font-medium text-ivory transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              인쇄·PDF 저장
            </button>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-faint">
            발행·운영{" "}
            <a href="/editorial-policy" className="text-brass underline underline-offset-4">
              {SITE.brand} 사이트 운영팀
            </a>{" "}
            · 최종 수정일 <time dateTime={RESOURCE_UPDATED_AT}>{RESOURCE_UPDATED_AT}</time> ·
            외부·전문가 독립 검토 전 · CSV 인코딩 UTF-8
          </p>
        </header>

        <section className="mt-16" aria-labelledby="roadmap-use-title">
          <h2 id="roadmap-use-title" className="font-serif-kr text-3xl font-bold">
            로드맵을 사용하는 순서
          </h2>
          <ol className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
            {[
              [
                "1. 현재 수행 확인",
                "예시곡의 제목보다 기준·기술·이론 목록에서 도움 없이 할 수 있는 항목을 먼저 찾습니다.",
              ],
              [
                "2. 가장 작은 공백 선택",
                "한 단계의 모든 항목을 한꺼번에 채우지 말고 지금 곡에 필요한 한두 가지를 주간 목표로 정합니다.",
              ],
              [
                "3. 소리와 기록으로 재검토",
                "느린 연주와 녹음을 남겨 체크한 항목이 다른 곡과 상황에서도 반복되는지 확인합니다.",
              ],
            ].map(([title, body]) => (
              <li key={title} className="bg-ebony p-7">
                <h3 className="font-serif-kr text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16" aria-labelledby="roadmap-boundary-title">
          <h2 id="roadmap-boundary-title" className="sr-only">
            로드맵 해석 한계
          </h2>
          <LimitationNotice>
            이 로드맵은 특정 교재의 공식 등급, 시험 기준, 의학적 평가가 아닙니다. 각 단계의 완료
            기간이나 실력 향상·입시·콩쿠르 결과를 보장하지 않으며, 손의 통증이나 지속적인 긴장은
            연습을 중단하고 적절한 전문가에게 확인해야 합니다.
          </LimitationNotice>
        </section>

        <section className="mt-20 space-y-10" aria-labelledby="level-list-title">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Five-level framework</p>
            <h2 id="level-list-title" className="mt-3 font-serif-kr text-3xl font-bold md:text-4xl">
              다섯 단계 확인표
            </h2>
          </div>

          {PIANO_LEVELS.map((level) => (
            <article
              key={level.id}
              id={level.id}
              className="scroll-mt-28 border border-line bg-ebony-2 p-6 md:p-9"
              aria-labelledby={`${level.id}-title`}
            >
              <header className="border-b border-line pb-7">
                <p className="font-latin text-sm italic tracking-wide text-brass">{level.stage}</p>
                <h3
                  id={`${level.id}-title`}
                  className="mt-2 font-serif-kr text-2xl font-bold md:text-3xl"
                >
                  {level.label}
                </h3>
                <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">{level.summary}</p>
              </header>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <LevelList title="현재 수준 확인 기준" items={level.criteria} />
                <LevelList title="연주 기술" items={level.skills} />
                <LevelList title="이론·읽기" items={level.theory} />
                <LevelList
                  title="예시 레퍼토리"
                  items={level.repertoireExamples}
                  note="난도와 학습 요소를 설명하는 예시이며 필수·시험 목록이 아닙니다."
                />
              </div>

              <fieldset className="mt-9 border-t border-line pt-7">
                <legend className="px-2 font-serif-kr text-xl font-semibold text-ivory">
                  다음 단계 준비 체크
                </legend>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {level.readiness.map((item, index) => {
                    const id = `${level.id}-ready-${index}`;
                    return (
                      <label
                        key={item}
                        htmlFor={id}
                        className="flex cursor-pointer items-start gap-3 border border-line bg-ebony p-4 text-sm leading-relaxed text-mute"
                      >
                        <input
                          id={id}
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 accent-[#b99b66]"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </article>
          ))}
        </section>

        <section className="mt-20 border-y border-line py-12" aria-labelledby="roadmap-next-title">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs tracking-[0.18em] text-brass uppercase">Put it into practice</p>
              <h2 id="roadmap-next-title" className="mt-3 font-serif-kr text-3xl font-bold">
                확인한 공백을 주간 계획으로
              </h2>
            </div>
            <div>
              <p className="leading-relaxed text-mute">
                체크하지 못한 항목 중 현재 곡에 가장 필요한 하나를 고르고, 몸풀기·테크닉·곡
                연습·초견과 이론으로 시간을 나눠 기록해 보세요.
              </p>
              <a
                href="/resources/piano-practice-planner"
                className="mt-5 inline-block text-sm font-medium text-brass underline underline-offset-4"
              >
                주간 피아노 연습 플래너 열기 →
              </a>
            </div>
          </div>
        </section>

        <PageAuthorityRecord
          className="mt-20"
          title="수준별 로드맵 작성·운영 기준"
          answer="교재 번호 하나로 수준을 단정하지 않고 악보 읽기, 리듬, 양손 협응, 이론, 연습 독립성을 다섯 단계의 관찰 가능한 기준으로 나눕니다."
          audience="현재 피아노 학습 단계를 점검하고 다음 연습 목표를 정하려는 학습자·보호자"
          scope="입문부터 상급 준비까지의 수행 기준, 예시 기술·이론·레퍼토리와 다음 단계 준비 체크리스트를 제공합니다."
          boundary="자가 체크 결과는 교사의 개별 진단이나 입시 적합성 평가가 아니며 단계별 소요 기간과 학습 성과를 보장하지 않습니다."
          lastModified={RESOURCE_UPDATED_AT}
          authorLabel="작성·운영"
          authorName={`${SITE.brand} 사이트 운영팀`}
          authorHref="/editorial-policy"
          dateLabel="최종 수정일"
          reviewStatus="외부·전문가 독립 검토 전"
        />

        <ResearchFaq
          id="level-roadmap-faq-title"
          title="피아노 수준별 로드맵 자주 묻는 질문"
          items={LEVEL_ROADMAP_FAQ}
        />

        <aside className="mt-16 border-l-2 border-brass pl-5 text-sm leading-relaxed text-faint">
          오류 또는 난도 기준에 대한 제안은{" "}
          <a href="/#contact" className="text-brass underline underline-offset-4">
            사이트 상담 창구
          </a>
          로 보내 주세요. 검토 후 기준일과 수정 내용을 갱신합니다.
        </aside>
      </div>
    </SubPageShell>
  );
}

function LevelList({
  title,
  items,
  note,
}: {
  title: string;
  items: readonly string[];
  note?: string;
}) {
  return (
    <section>
      <h4 className="font-serif-kr text-lg font-semibold text-ivory">{title}</h4>
      {note && <p className="mt-2 text-xs leading-relaxed text-faint">{note}</p>}
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-mute">
            <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-brass" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
