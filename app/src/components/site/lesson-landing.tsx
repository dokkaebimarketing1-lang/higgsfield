import { useRef } from "react";

import { StructuredData } from "../StructuredData";
import { SITE } from "../../lib/content";
import type { LessonLandingDefinition } from "../../lib/seo-pages";
import { useSiteMotion } from "../../lib/use-motion";
import { SubPageShell } from "./chrome";

export function LessonLanding({ page }: { page: LessonLandingDefinition }) {
  const rootRef = useRef<HTMLElement | null>(null);

  useSiteMotion(rootRef);

  return (
    <SubPageShell>
      <StructuredData json={page.structuredData} />
      <article ref={rootRef}>
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(192,160,98,0.11),transparent_42%)]" />
          <div className="relative mx-auto grid min-h-[calc(100dvh-72px)] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20">
            <div className="md:col-span-6">
              <nav className="text-sm text-faint" aria-label="breadcrumb">
                <a
                  href="/"
                  className="transition-colors hover:text-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  홈
                </a>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <span className="text-mute">{page.label}</span>
              </nav>
              <h1
                data-build
                className="mt-7 max-w-[10ch] font-serif-kr text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
              >
                {page.primaryKeyword}
              </h1>
              <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-mute md:text-lg">
                {page.lede}
              </p>
              <a
                href="/#contact"
                className="mt-9 inline-flex min-h-12 items-center justify-center bg-brass px-7 py-3 font-serif-kr text-lg font-semibold whitespace-nowrap text-ebony transition-colors hover:bg-[#cdb07a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory active:translate-y-px"
              >
                상담 신청하기
              </a>
            </div>

            <div className="relative md:col-span-5 md:col-start-8" data-wipe>
              <div className="absolute -inset-3 border border-brass/25" aria-hidden="true" />
              <img
                src={page.image}
                alt={page.imageAlt}
                width={1600}
                height={900}
                fetchPriority="high"
                className="relative aspect-video w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ebony/45 via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        {page.sections.map((section, index) => (
          <section
            key={section.heading}
            className={`border-b border-line py-20 md:py-28 ${index % 2 === 1 ? "bg-ebony-2/45" : ""}`}
          >
            <div className="mx-auto grid max-w-6xl gap-9 px-6 md:grid-cols-12 md:px-10">
              <div className="md:col-span-4">
                <h2
                  data-settle
                  className="font-serif-kr text-3xl font-bold leading-tight tracking-tight md:text-4xl"
                >
                  {section.heading}
                </h2>
                {section.points && (
                  <ul className="mt-8 space-y-4" aria-label={`${section.heading} 핵심 항목`}>
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-3 text-base leading-relaxed text-mute">
                        <span
                          className="mt-[0.7em] h-px w-5 shrink-0 bg-brass"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <p className="font-serif-kr text-xl leading-relaxed text-ivory md:text-2xl">
                  {section.lead}
                </p>
                <div className="mt-7 space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-[1.85] text-mute">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="border-b border-line py-20 md:py-28" aria-labelledby="lesson-pricing">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <div className="max-w-2xl">
              <h2
                id="lesson-pricing"
                data-settle
                className="font-serif-kr text-3xl font-bold tracking-tight md:text-4xl"
              >
                피아노 레슨비와 과정
              </h2>
              <p className="mt-5 text-base leading-relaxed text-mute">{SITE.pricing.note}</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-[1fr_1.15fr_1fr] md:items-start">
              {SITE.pricing.tiers.map((tier) => (
                <article
                  key={tier.name}
                  data-settle
                  className={`border p-7 md:p-8 ${
                    tier.featured
                      ? "border-brass bg-ebony-3 md:-translate-y-4"
                      : "border-line bg-ebony-2"
                  }`}
                >
                  <h3 className="font-serif-kr text-2xl font-semibold">{tier.name}</h3>
                  <p className="mt-6 flex items-baseline gap-1">
                    <span className="text-sm text-faint">{tier.per}</span>
                    <span className="font-serif-kr text-4xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                    <span className="text-base text-mute">{tier.unit}</span>
                  </p>
                  <ul className="mt-7 space-y-3">
                    {tier.lines.map((line) => (
                      <li key={line} className="flex gap-3 text-base leading-relaxed text-mute">
                        <span
                          className="mt-[0.7em] h-px w-4 shrink-0 bg-brass"
                          aria-hidden="true"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-ebony-2/45 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <h2 data-settle className="font-serif-kr text-3xl font-bold tracking-tight md:text-4xl">
              함께 읽으면 좋은 피아노 정보
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {page.related.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  data-settle
                  className="group border border-line bg-ebony p-7 transition-colors hover:border-brass/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass md:p-9"
                >
                  <h3 className="font-serif-kr text-xl font-semibold text-ivory transition-colors group-hover:text-brass md:text-2xl">
                    {item.label}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-mute">{item.description}</p>
                  <span className="mt-7 inline-flex items-center gap-3 text-sm font-medium text-brass">
                    정보 글 보기
                    <span
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 md:py-28" aria-labelledby="lesson-faq">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-12 md:px-10">
            <div className="md:col-span-4">
              <h2
                id="lesson-faq"
                data-settle
                className="font-serif-kr text-3xl font-bold tracking-tight md:text-4xl"
              >
                {page.primaryKeyword} 자주 묻는 질문
              </h2>
              <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-mute">
                상담 전에 많이 확인하는 수업 방식과 준비 사항을 정리했습니다.
              </p>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              {page.faq.map((item) => (
                <details key={item.q} className="group border-b border-line first:border-t">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 font-serif-kr text-lg font-semibold text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass md:text-xl">
                    <span>{item.q}</span>
                    <span
                      className="shrink-0 text-2xl text-brass transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-base leading-relaxed text-mute">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </article>
    </SubPageShell>
  );
}
