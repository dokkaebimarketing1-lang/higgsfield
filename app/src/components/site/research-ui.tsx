import type { ReactNode } from "react";

export function ResearchBreadcrumb({
  items,
}: {
  items: readonly { label: string; href?: string }[];
}) {
  return (
    <nav className="text-sm text-faint" aria-label="breadcrumb">
      <a href="/" className="transition-colors hover:text-ivory">
        홈
      </a>
      {items.map((item) => (
        <span key={`${item.href ?? "current"}-${item.label}`}>
          <span className="mx-2">/</span>
          {item.href ? (
            <a href={item.href} className="transition-colors hover:text-ivory">
              {item.label}
            </a>
          ) : (
            <span className="text-mute">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function EvidenceBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex border border-brass/45 bg-brass/10 px-3 py-1 text-xs font-medium tracking-wide text-brass">
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-line bg-ebony-2 p-6">
      <p className="text-xs tracking-[0.16em] text-faint uppercase">{label}</p>
      <p className="mt-3 font-serif-kr text-3xl font-semibold text-ivory md:text-4xl">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-mute">{detail}</p>
    </div>
  );
}

export function DownloadCard({
  href,
  title,
  description,
  meta,
  external = false,
}: {
  href: string;
  title: string;
  description: string;
  meta: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : { download: true })}
      className="group flex h-full flex-col border border-line bg-ebony-2 p-6 transition-colors hover:border-brass/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
    >
      <span className="text-xs tracking-[0.14em] text-brass uppercase">{meta}</span>
      <strong className="mt-3 font-serif-kr text-xl font-semibold text-ivory transition-colors group-hover:text-brass">
        {title}
      </strong>
      <span className="mt-3 text-sm leading-relaxed text-mute">{description}</span>
      <span className="mt-auto pt-6 text-sm font-medium text-ivory">
        {external ? "공식 원문 열기 ↗" : "파일 내려받기 ↓"}
      </span>
    </a>
  );
}

export function LimitationNotice({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-2 border-brass bg-brass/8 px-5 py-4 text-sm leading-relaxed text-mute">
      {children}
    </aside>
  );
}

export function ResearchFaq({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <section className="mt-20 border-t border-line pt-12" aria-labelledby={id}>
      <h2 id={id} className="font-serif-kr text-3xl font-bold">
        {title}
      </h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.question} className="group py-6">
            <summary className="cursor-pointer list-none pr-8 font-serif-kr text-xl font-semibold text-ivory marker:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass">
              {item.question}
            </summary>
            <p className="mt-4 max-w-[72ch] leading-relaxed text-mute">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
