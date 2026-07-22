import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../components/site/chrome";
import { SITE_URL } from "../lib/content";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../lib/seo-pages";

const aboutPage = PUBLIC_PAGE_BY_PATH.get("/about")!;

const personLd = {
  "@type": "Person",
  "@id": `${SITE_URL}/about#person`,
  name: "김서연",
  jobTitle: "피아노 레슨 강사",
  description:
    "이화여자대학교 피아노과 재학생 김서연은 어린이 취미부터 입시·콩쿠르, 성인 취미까지 지도하는 1:1 피아노 선생님입니다.",
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/assets/portrait.jpg`,
  mainEntityOfPage: `${SITE_URL}/about`,
  affiliation: { "@type": "CollegeOrUniversity", name: "이화여자대학교" },
  award: "국내 피아노 콩쿠르 입상 및 수상 다수",
  knowsAbout: ["피아노", "피아노 교육", "음대 입시", "콩쿠르 지도", "클래식 음악"],
  worksFor: { "@id": `${SITE_URL}/#business` },
};

const ABOUT_FAQ = [
  {
    question: "피아노 선생님을 고를 때 무엇을 확인해야 하나요?",
    answer:
      "전공 배경과 수업 대상, 설명과 피드백 방식, 레슨비·일정·운영 기준을 함께 확인하세요. 상담할 때 배우는 사람의 목표와 현재 수준을 먼저 설명하고, 어떤 방식으로 수업을 진행하는지 구체적으로 묻는 것이 좋습니다.",
  },
  {
    question: "김서연 선생님은 어떤 피아노 레슨을 진행하나요?",
    answer:
      "어린이의 첫 피아노와 성인 취미, 입시·콩쿠르 준비를 위한 1:1 레슨을 진행합니다. 정해진 진도보다 학생의 현재 수준과 목표에 맞춰 기초, 곡 해석, 연습 방향을 조정합니다.",
  },
  {
    question: "방문과 온라인 피아노 레슨이 모두 가능한가요?",
    answer:
      "서울 서대문구·마포구는 방문 레슨을 안내하며, 그 외 지역은 온라인 화상 수업으로 만날 수 있습니다. 실제 가능 시간과 수업 방식은 상담에서 확인합니다.",
  },
] as const;

const aboutLd = {
  "@context": "https://schema.org",
  "@graph": [
    personLd,
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "피아노 선생님", item: `${SITE_URL}/about` },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/about#faq`,
      mainEntity: ABOUT_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export const Route = createFileRoute("/about")({
  head: () => ({
    ...buildPublicPageHead(aboutPage),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(aboutLd) }],
  }),
  component: AboutPage,
});

const MILESTONES = [
  { year: "학력", text: "이화여자대학교 피아노과 재학" },
  { year: "수상", text: "국내 피아노 콩쿠르 입상 및 수상 다수" },
  { year: "레슨", text: "학생 수준과 목표에 맞춘 1:1 수업 운영" },
  { year: "방식", text: "방문 레슨과 온라인 화상 수업" },
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

const TEACHER_SELECTION = [
  {
    title: "전공과 수업 대상",
    body: "전공 배경과 함께 어린이, 성인 취미, 입시·콩쿠르처럼 내가 배우려는 목적을 실제 수업 범위로 다루는지 확인합니다.",
  },
  {
    title: "설명과 피드백 방식",
    body: "현재 수준을 어떻게 진단하고, 수업 뒤 무엇을 연습해야 하는지 구체적으로 설명하는 피아노 선생님인지 상담에서 확인합니다.",
  },
  {
    title: "레슨비·일정·운영 기준",
    body: "수업 시간과 횟수, 레슨비에 포함되는 내용, 가능한 일정과 수업 방식을 비교하면 오래 이어갈 수 있는 선택에 도움이 됩니다.",
  },
] as const;

function AboutPage() {
  return (
    <SubPageShell>
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">
            홈
          </a>
          <span className="mx-2">/</span>
          <span className="text-mute">선생님 소개</span>
        </nav>

        <div className="mt-10 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <img
              src="/assets/portrait.jpg"
              alt="그랜드 피아노 앞에 앉은 피아노 연주자"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="font-latin text-xl italic text-brass md:text-2xl">Adagio</p>
            <h1 className="mt-3 font-serif-kr text-4xl font-bold tracking-tight md:text-5xl">
              피아노 선생님 김서연
            </h1>
            <p className="mt-3 text-lg text-mute">이화여자대학교 피아노과 재학</p>
            <p className="mt-7 max-w-[58ch] leading-relaxed text-mute">
              피아노 선생님 김서연은 전공 과정에서 익힌 정확한 기초와 음악을 사랑하는 마음을 1:1
              레슨에 전하고 있습니다. 어린이의 첫 건반부터 성인의 오랜 꿈, 입시생의 목표까지 한
              사람의 속도에 맞춥니다.
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

        <section className="mt-24" aria-labelledby="teacher-selection-heading">
          <div className="max-w-3xl">
            <p className="font-latin text-lg italic text-brass">Before the first lesson</p>
            <h2
              id="teacher-selection-heading"
              className="mt-2 font-serif-kr text-3xl font-bold md:text-4xl"
            >
              피아노 선생님을 선택할 때 확인할 기준
            </h2>
            <p className="mt-5 leading-relaxed text-mute">
              좋은 피아노 선생님은 화려한 소개보다 배우는 사람의 목표를 듣고, 수업 방식과 비용을
              분명하게 설명할 수 있어야 합니다. 첫 상담에서 아래 세 가지를 차례로 확인해 보세요.
            </p>
          </div>
          <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {TEACHER_SELECTION.map((item, index) => (
              <article key={item.title} className="bg-ebony p-8">
                <p className="font-latin text-sm italic text-brass">0{index + 1}</p>
                <h3 className="mt-3 font-serif-kr text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mute">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="/blog/lesson-guide/choosing-piano-tutor"
              className="text-brass underline underline-offset-4"
            >
              피아노 선생님 선택 가이드 읽기
            </a>
            <a href="/lessons/private" className="text-brass underline underline-offset-4">
              1:1 피아노 개인 레슨 방식 확인
            </a>
            <a href="/pricing" className="text-brass underline underline-offset-4">
              피아노 레슨비와 포함 항목 확인
            </a>
          </p>
        </section>

        <section className="mt-24" aria-labelledby="about-faq-heading">
          <div className="max-w-3xl">
            <p className="font-latin text-lg italic text-brass">Questions &amp; Answers</p>
            <h2
              id="about-faq-heading"
              className="mt-2 font-serif-kr text-3xl font-bold md:text-4xl"
            >
              피아노 선생님 선택 전 자주 묻는 질문
            </h2>
          </div>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {ABOUT_FAQ.map((item) => (
              <details key={item.question} className="group py-6">
                <summary className="cursor-pointer list-none font-serif-kr text-lg font-semibold marker:hidden md:text-xl">
                  <span className="flex items-start justify-between gap-6">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-brass transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pr-10 text-sm leading-relaxed text-mute md:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-24 border border-brass/40 bg-ebony-2 p-8 text-center md:p-12">
          <p className="font-serif-kr text-2xl font-semibold md:text-3xl">
            첫 상담과 30분 체험 레슨은 무료입니다
          </p>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-mute md:text-base">
            아이의 성향, 목표, 궁금한 점을 편하게 이야기해 주세요. 서울 서대문구·마포구 방문 레슨,
            그 외 지역은 온라인으로 만납니다.
          </p>
          <p className="mx-auto mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <a href="/lessons/private" className="text-brass underline underline-offset-4">
              피아노 개인 레슨 안내
            </a>
            <a href="/lessons/home-visit" className="text-brass underline underline-offset-4">
              피아노 방문 레슨 안내
            </a>
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
