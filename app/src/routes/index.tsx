import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { SiteFooter, SiteNav } from "../components/site/chrome";
import { HeroScrub } from "../components/site/hero-scrub";
import { Monogram } from "../components/site/monogram";
import { submitInquiry } from "../lib/api/inquiries.functions";
import { listPublishedPosts, type PostRow } from "../lib/api/posts.functions";
import { SITE } from "../lib/content";
import { useSiteMotion } from "../lib/use-motion";

const HERO_FRAME_COUNT = 101;
const heroFrame = (i: number) =>
  `/frames/hero/frame_${String(i + 1).padStart(4, "0")}.jpg`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": "https://ewha-piano.higgsfield.app/#business",
      name: SITE.brand,
      description: SITE.description,
      url: "https://ewha-piano.higgsfield.app/",
      serviceType: "1:1 피아노 레슨",
      image:
        "https://d2ol7oe51mr4n9.cloudfront.net/user_34g8tGWyYG4JUcCJYEK7ikRiSGl/3ac1a2a4-c77e-49fc-ac0b-b721b1430517.png",
      areaServed: ["서울특별시", "서울특별시 서대문구", "서울특별시 마포구"],
      priceRange: "₩₩",
      founder: { "@id": "https://ewha-piano.higgsfield.app/about#person" },
    },
    {
      "@type": "WebSite",
      "@id": "https://ewha-piano.higgsfield.app/#website",
      name: SITE.brand,
      url: "https://ewha-piano.higgsfield.app/",
      publisher: { "@id": "https://ewha-piano.higgsfield.app/#business" },
      inLanguage: "ko",
    },
    {
      "@type": "FAQPage",
      "@id": "https://ewha-piano.higgsfield.app/#faq",
      mainEntity: SITE.faq.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const { posts } = await listPublishedPosts({ data: { limit: 3 } });
    return { latest: posts };
  },
  head: () => ({
    links: [
      { rel: "canonical", href: "https://ewha-piano.higgsfield.app/" },
      {
        rel: "preload",
        as: "image",
        href: "/assets/hero-still.jpg",
        fetchPriority: "high",
      },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: Index,
});

function Index() {
  const rootRef = useRef<HTMLElement | null>(null);
  useSiteMotion(rootRef);
  const { latest } = Route.useLoaderData();

  return (
    <main ref={rootRef} className="bg-ebony text-ivory antialiased">
      <SiteNav />
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <ProcessSection />
      <StoriesSection />
      <FaqSection />
      <PricingSection />
      <LatestPostsSection posts={latest} />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}

/* ── 최신 칼럼 (낸드 링크에서 유입되는 SEO 낸드게이션) ── */
function LatestPostsSection({ posts }: { posts: PostRow[] }) {
  if (!posts || posts.length === 0) return null;
  return (
    <section id="latest" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            data-build
            className="font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
          >
            피아노 이야기
          </h2>
          <a
            href="/blog"
            className="text-sm text-brass underline underline-offset-8 transition-colors hover:text-ivory"
          >
            모든 글 보기
          </a>
        </div>
        <div className="mt-12">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.category_slug}/${post.slug}`}
              data-settle
              className="group grid gap-2 border-b border-line py-7 first:border-t md:grid-cols-12 md:items-baseline md:gap-8"
            >
              <span className="text-sm text-faint md:col-span-2">
                {post.category_name ?? "칼럼"}
              </span>
              <span className="font-serif-kr text-xl font-semibold transition-colors group-hover:text-brass md:col-span-7 md:text-2xl">
                {post.title}
              </span>
              <span className="text-sm text-mute md:col-span-3 md:text-right">
                {post.reading_minutes}분 읽기 · {formatDate(post.published_at)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/* ── Tempo marking (악장 라벨) ──────────────────────────── */
function HeroSection() {
  return (
    <section id="top" className="relative">
      <HeroScrub
        frameCount={HERO_FRAME_COUNT}
        frameSrc={heroFrame}
        poster="/assets/hero-still.jpg"
      >
        <div className="pointer-events-none absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-6 pb-24 md:px-10 md:pb-28">
            <p className="pointer-events-auto text-[11px] font-medium uppercase tracking-[0.35em] text-brass">
              {SITE.hero.eyebrow}
            </p>
            <h1
              data-build
              data-delay="0.2"
              className="mt-5 max-w-3xl font-serif-kr text-5xl font-bold leading-[1.08] tracking-tight text-ivory md:text-7xl"
            >
              {SITE.hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg">
              {SITE.hero.sub}
            </p>
            <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="group relative overflow-hidden bg-brass px-7 py-3.5 font-serif-kr text-lg font-semibold text-ebony transition-transform active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full bg-ivory/25 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                <span className="relative">{SITE.hero.primary}</span>
              </a>
              <a
                href="#programs"
                className="border border-line px-7 py-3.5 font-serif-kr text-lg text-ivory transition-colors hover:border-brass hover:text-brass"
              >
                {SITE.hero.secondary}
              </a>
            </div>
          </div>
        </div>
      </HeroScrub>
    </section>
  );
}

/* ── Tempo marking (악장 라벨) ──────────────────────────── */
function Tempo({ children }: { children: string }) {
  return (
    <p className="font-latin text-xl italic text-brass md:text-2xl">{children}</p>
  );
}

/* ── About ──────────────────────────────────────────────── */
function AboutSection() {
  const a = SITE.about;
  return (
    <section id="about" className="py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5" data-wipe>
          <img
            src="/assets/portrait.jpg"
            alt="그랜드 피아노 앞에 앉은 선생님의 뒷모습"
            className="aspect-[3/4] w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Tempo>{a.tempo}</Tempo>
          <h2
            data-build
            className="mt-3 font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
          >
            {a.headline}
          </h2>
          <p className="mt-7 font-serif-kr text-2xl text-ivory">{a.name}</p>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-mute">{a.intro}</p>
          <div className="mt-10">
            {a.credentials.map((c) => (
              <div
                key={c.label}
                data-settle
                className="flex items-baseline justify-between gap-6 border-b border-line py-4 first:border-t"
              >
                <span className="shrink-0 text-sm text-faint">{c.label}</span>
                <span className="text-right font-serif-kr text-lg">{c.value}</span>
              </div>
            ))}
          </div>
          <a
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 font-serif-kr text-lg text-brass underline underline-offset-8 transition-colors hover:text-ivory"
          >
            선생님 소개 더 보기
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
        <div className="md:col-span-12">
          <div className="mt-6 grid grid-cols-2 border border-line md:grid-cols-4">
            {a.facts.map((f) => (
              <div
                key={f.label}
                data-settle
                className="border-line p-5 [&:nth-child(odd)]:border-r md:border-r md:[&:last-child]:border-r-0"
              >
                <p className="text-xs text-faint">{f.label}</p>
                <p className="mt-2 font-serif-kr text-base md:text-lg">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Programs ───────────────────────────────────────────── */
function ProgramsSection() {
  const p = SITE.programs;
  return (
    <section id="programs" className="py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Tempo>{p.tempo}</Tempo>
        <h2
          data-build
          className="mt-3 font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
        >
          {p.headline}
        </h2>

        <div className="relative mt-12 overflow-hidden" data-wipe>
          <img
            src="/assets/program-child.jpg"
            alt="아이에게 피아노를 가르치는 선생님의 뒷모습"
            className="h-[52vh] min-h-[360px] w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ebony/85 via-ebony/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 flex max-w-md flex-col justify-end p-8 text-right md:p-12">
            <img
              src="/assets/icons/sprout.png"
              alt=""
              className="ml-auto h-11 w-11 mix-blend-screen"
            />
            <h3 className="mt-4 font-serif-kr text-3xl font-semibold md:text-4xl">
              {p.featured.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory/75 md:text-base">
              {p.featured.body}
            </p>
          </div>
        </div>

        <div>
          {p.rows.map((r, i) => (
            <div
              key={r.num}
              data-settle
              className="grid items-center gap-6 border-b border-line py-10 first:border-t md:grid-cols-12 md:gap-8"
            >
              {i % 2 === 0 ? (
                <>
                  <div className="md:col-span-2">
                    <span className="font-latin text-6xl italic text-brass md:text-7xl">
                      {r.num}
                    </span>
                  </div>
                  <div className="md:col-span-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={`/assets/icons/${i === 0 ? "cap" : "person"}.png`}
                        alt=""
                        className="h-9 w-9 mix-blend-screen"
                      />
                      <h3 className="font-serif-kr text-2xl font-semibold md:text-3xl">
                        {r.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-mute md:text-base">
                      {r.body}
                    </p>
                  </div>
                  <div className="md:col-span-4" data-wipe>
                    <img
                      src="/assets/program-exam.jpg"
                      alt="악보에 표시하며 공부하는 입시 준비"
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-4" data-wipe>
                    <img
                      src="/assets/program-adult.jpg"
                      alt="저녁에 집에서 피아노를 치는 성인 수강생"
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="md:col-span-6 md:text-right">
                    <div className="flex items-center gap-4 md:justify-end">
                      <img
                        src="/assets/icons/person.png"
                        alt=""
                        className="h-9 w-9 mix-blend-screen"
                      />
                      <h3 className="font-serif-kr text-2xl font-semibold md:text-3xl">
                        {r.title}
                      </h3>
                    </div>
                    <p className="mt-3 ml-auto max-w-[52ch] text-sm leading-relaxed text-mute md:text-base">
                      {r.body}
                    </p>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <span className="font-latin text-6xl italic text-brass md:text-7xl">
                      {r.num}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Process ────────────────────────────────────────────── */
function ProcessSection() {
  const p = SITE.process;
  return (
    <section id="process" className="relative py-24 md:py-36">
      <img
        src="/assets/plate-score.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-ebony/80" />
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <h2
          data-build
          className="text-center font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
        >
          {p.headline}
        </h2>
        <div className="mx-auto mt-16 max-w-4xl">
          {p.steps.map((s, i) => (
            <div key={s.num}>
              {i > 0 && <div data-rule className="h-px w-full bg-line" />}
              <div data-settle className="flex items-start gap-6 py-8 md:gap-12 md:py-10">
                <span className="w-20 shrink-0 font-latin text-5xl italic leading-none text-brass md:w-28 md:text-7xl">
                  {s.num}
                </span>
                <div>
                  <h3 className="font-serif-kr text-2xl font-semibold md:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute md:text-base">
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ───────────────────────────────────────── */
function StoriesSection() {
  const s = SITE.stories;
  return (
    <section id="stories" className="py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2
          data-build
          className="text-center font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
        >
          {s.headline}
        </h2>
        <div className="mt-14 grid border border-line md:grid-cols-2">
          {s.items.map((t, i) => (
            <figure
              key={t.by}
              data-settle
              className={`border-line p-8 md:p-12 ${
                i < 2 ? "border-b" : i === 2 ? "border-b md:border-b-0" : ""
              } ${i % 2 === 0 ? "md:border-r" : ""}`}
            >
              <span aria-hidden="true" className="font-latin text-6xl leading-none text-brass">
                &ldquo;
              </span>
              <blockquote className="mt-4 font-serif-kr text-lg leading-relaxed md:text-xl">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 text-sm text-faint">{t.by}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ (GEO: AI 검색 인용 대상, FAQPage 스키마와 내용 일치) ── */
function FaqSection() {
  const f = SITE.faq;
  return (
    <section id="faq" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <h2
          data-build
          className="text-center font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
        >
          {f.headline}
        </h2>
        <div className="mt-14">
          {f.items.map((item, i) => (
            <details
              key={item.q}
              className="group border-b border-line first:border-t"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="font-serif-kr text-xl font-semibold md:text-2xl">
                  {item.q}
                </h3>
                <span
                  aria-hidden="true"
                  className="shrink-0 font-latin text-2xl italic text-brass transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-7 leading-relaxed text-mute">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ────────────────────────────────────────────── */
function PricingSection() {
  const p = SITE.pricing;
  return (
    <section id="pricing" className="py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2
          data-build
          className="text-center font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
        >
          {p.headline}
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {p.tiers.map((t) => (
            <article
              key={t.name}
              data-settle
              className={`relative flex flex-col bg-ebony-2 p-8 md:p-10 ${
                t.featured ? "ring-1 ring-brass" : "border border-line"
              }`}
            >
              {t.featured && t.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brass px-3 py-1 text-xs font-semibold tracking-wide text-ebony">
                  {t.badge}
                </span>
              )}
              <h3 className="text-center font-serif-kr text-2xl font-semibold">
                {t.name}
              </h3>
              <p className="mt-8 text-center">
                <span className="align-top text-sm text-mute">{t.per}</span>{" "}
                <span
                  data-count={t.price.replace(",", "")}
                  className="font-serif-kr text-5xl font-bold tracking-tight"
                >
                  {t.price}
                </span>
                <span className="text-lg text-mute">{t.unit}</span>
              </p>
              <div className="my-8 h-px bg-line" />
              <ul className="space-y-0">
                {t.lines.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-3 border-b border-line py-3 text-sm text-mute last:border-0 md:text-base"
                  >
                    <span className="h-1 w-1 shrink-0 bg-brass" />
                    {line}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-auto pt-8 text-center font-serif-kr text-lg text-brass underline underline-offset-8 transition-colors hover:text-ivory"
              >
                상담 신청하기
              </a>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-faint">{p.note}</p>
      </div>
    </section>
  );
}

/* ── Contact + 상담 신청 폼 ─────────────────────────────── */
const ICON_SRC: Record<string, string> = {
  chat: "/assets/icons/chat.png",
  mail: "/assets/icons/mail.png",
  pin: "/assets/icons/pin.png",
};

type FormState = {
  name: string;
  phone: string;
  studentType: string;
  goal: string;
  preferredDays: string;
  message: string;
};

function ContactSection() {
  const c = SITE.contact;
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    studentType: "자녀",
    goal: c.form.goals[0],
    preferredDays: "",
    message: "",
  });
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string }
  >({ kind: "idle" });

  const update =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      await submitInquiry({ data: form });
      setStatus({ kind: "done" });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  };

  return (
    <section id="contact" className="py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:px-10">
        <div>
          <Tempo>{c.tempo}</Tempo>
          <h2
            data-build
            className="mt-3 font-serif-kr text-4xl font-bold tracking-tight md:text-5xl"
          >
            {c.headline}
          </h2>
          <p className="mt-5 max-w-[54ch] leading-relaxed text-mute">{c.body}</p>
          <div className="mt-10">
            {c.rows.map((r) => (
              <div
                key={r.label}
                data-settle
                className="flex items-center gap-5 border-b border-line py-4 first:border-t"
              >
                <img src={ICON_SRC[r.icon]} alt="" className="h-9 w-9 mix-blend-screen" />
                <div>
                  <p className="text-xs text-faint">{r.label}</p>
                  <p className="mt-1 font-serif-kr text-lg">{r.value}</p>
                </div>
              </div>
            ))}
            <p className="mt-4 text-sm text-faint">{c.hours}</p>
          </div>
          <div className="mt-10" data-wipe>
            <img
              src="/assets/hero-detail.jpg"
              alt="건반을 연주하는 손 클로즈업"
              className="aspect-[16/9] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          <div className="border border-line bg-ebony-2 p-7 md:p-10">
            {status.kind === "done" ? (
              <div className="py-16 text-center">
                <Monogram className="mx-auto h-10 w-10 text-brass" />
                <p className="mt-6 font-serif-kr text-2xl font-semibold">접수되었습니다</p>
                <p className="mt-3 leading-relaxed text-mute">{c.form.success}</p>
                <p className="mt-6 text-sm text-faint">
                  빠른 상담은 카카오톡 채널로도 가능합니다.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <Field label="이름" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="이름을 입력해 주세요"
                    className="w-full border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors placeholder:text-faint focus:border-brass"
                  />
                </Field>
                <Field label="연락처" required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="010-0000-0000"
                    className="w-full border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors placeholder:text-faint focus:border-brass"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="수강 대상">
                    <select
                      value={form.studentType}
                      onChange={update("studentType")}
                      className="w-full border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors focus:border-brass"
                    >
                      <option value="자녀">자녀</option>
                      <option value="본인">본인</option>
                    </select>
                  </Field>
                  <Field label="학습 목표">
                    <select
                      value={form.goal}
                      onChange={update("goal")}
                      className="w-full border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors focus:border-brass"
                    >
                      {c.form.goals.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="희망 요일 · 시간">
                  <input
                    type="text"
                    value={form.preferredDays}
                    onChange={update("preferredDays")}
                    placeholder="예: 화·목 저녁 7시 이후"
                    className="w-full border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors placeholder:text-faint focus:border-brass"
                  />
                </Field>
                <Field label="메시지">
                  <textarea
                    value={form.message}
                    onChange={update("message")}
                    rows={4}
                    placeholder="궁금하신 점이나 요청 사항을 자유롭게 작성해 주세요"
                    className="w-full resize-none border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors placeholder:text-faint focus:border-brass"
                  />
                </Field>
                {status.kind === "error" && (
                  <p className="mt-4 text-sm text-[#d98a8a]">{status.message}</p>
                )}
                <button
                  type="submit"
                  disabled={status.kind === "sending"}
                  className="mt-7 w-full bg-brass py-4 font-serif-kr text-lg font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99] disabled:opacity-60"
                >
                  {status.kind === "sending" ? "접수 중..." : c.form.submit}
                </button>
                <p className="mt-4 text-center text-xs text-faint">
                  첫 상담과 30분 체험 레슨은 무료입니다.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm text-mute">
        {label}
        {required && <span className="ml-1 text-brass">*</span>}
      </span>
      {children}
    </label>
  );
}
