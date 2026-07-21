import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../components/site/chrome";
import { SITE, SITE_URL } from "../lib/content";

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#person`,
  name: "김서연",
  jobTitle: "피아노 레슨 강사",
  description:
    "이화여자대학교 피아노과 재학생. 유아·초등 취미부터 입시·콩쿠르, 성인 취미까지 지도하는 1:1 피아노 레슨 강사.",
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/assets/portrait.jpg`,
  alumniOf: { "@type": "CollegeOrUniversity", name: "이화여자대학교" },
  award: "국내 피아노 콩쿠르 입상 및 수상 다수",
  knowsAbout: ["피아노", "피아노 교육", "음대 입시", "콩쿠르 지도", "클래식 음악"],
  worksFor: { "@id": `${SITE_URL}/#business` },
  nationality: "대한민국",
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `선생님 소개 | ${SITE.brand}` },
      {
        name: "description",
        content:
          "이화여자대학교 피아노과 재학생 김서연의 소개. 콩쿠르 수상 경력과 1:1 레슨 철학, 지도 연력을 안내합니다.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(personLd) }],
  }),
  component: AboutPage,
});

const MILESTONES = [
  { year: "입시", text: "피아노 실기 수석 입학, 이화여자대학교 피아노과 재학" },
  { year: "수상", text: "국내 피아노 콩쿠르 입상 및 수상 다수" },
  { year: "지도", text: "유아부터 성인까지 1:1 개인 레슨 3년" },
  { year: "연주", text: "학부 정기 연주회 및 지역 초청 연주 다수" },
];

const PHILOSOPHY = [
  {
    title: "속도는 사람마다 다릅니다",
    body: "같은 곡을 배워도 이해하는 순서와 속도는 모두 다릅니다. 정해진 진도표가 아니라, 그 주의 학생 상태가 레슨의 기준입니다.",
  },
  {
    title: "기초는 짧게, 정확하게",
    body: "손 모양과 읽기 습관은 처음 한 번 제대로 잡으면 평생 갑니다. 초반의 몇 주를 정확히 쌓는 것을 가장 중요하게 생각합니다.",
  },
  {
    title: "음악을 좋아하는 마음이 먼저",
    body: "기술은 마음이 따라올 때 완성됩니다. 학생이 치고 싶은 곡을 레슨에 함께 넣어, 연습이 기다려지는 시간이 되도록 합니다.",
  },
];

function AboutPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">홈</a>
          <span className="mx-2">/</span>
          <span className="text-mute">선생님 소개</span>
        </nav>

        <div className="mt-10 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <img
              src="/assets/portrait.jpg"
              alt="그랜드 피아노 앞에 앉은 김서연의 뒷모습"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="font-latin text-xl italic text-brass md:text-2xl">Adagio</p>
            <h1 className="mt-3 font-serif-kr text-4xl font-bold tracking-tight md:text-5xl">
              김서연
            </h1>
            <p className="mt-3 text-lg text-mute">이화여자대학교 피아노과 재학</p>
            <p className="mt-7 max-w-[58ch] leading-relaxed text-mute">
              다섯 살에 피아노를 시작해 지금까지 건반 위에서 살고 있습니다. 입시를
              거치며 배운 정확한 기초와, 음악을 사랑하는 마음을 1:1 레슨에 그대로
              전하고 있습니다. 어린이의 첫 건반부터 성인의 오랜 꿈, 입시생의 목표까지
              한 사람의 속도에 맞춥니다.
            </p>
            <div className="mt-10">
              {MILESTONES.map((m) => (
                <div
                  key={m.year}
                  className="flex items-baseline gap-6 border-b border-line py-4 first:border-t"
                >
                  <span className="w-14 shrink-0 font-latin text-lg italic text-brass">
                    {m.year}
                  </span>
                  <span className="font-serif-kr text-base md:text-lg">{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="font-serif-kr text-3xl font-bold md:text-4xl">레슨 철학</h2>
          <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {PHILOSOPHY.map((p) => (
              <div key={p.title} className="bg-ebony p-8">
                <h3 className="font-serif-kr text-xl font-semibold">{p.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mute">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 border border-brass/40 bg-ebony-2 p-8 text-center md:p-12">
          <p className="font-serif-kr text-2xl font-semibold md:text-3xl">
            첫 상담과 30분 체험 레슨은 무료입니다
          </p>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-mute md:text-base">
            아이의 성향, 목표, 궁금한 점을 편하게 이야기해 주세요. 서울
            서대문구·마포구 방문 레슨, 그 외 지역은 온라인으로 만납니다.
          </p>
          <a
            href="/#contact"
            className="mt-7 inline-block bg-brass px-7 py-3.5 font-serif-kr text-lg font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99]"
          >
            상담 신청하기
          </a>
        </div>
      </div>
    </SubPageShell>
  );
}
