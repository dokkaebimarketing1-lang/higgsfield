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
            <span className="text-mute" aria-current="page">
              {item.label}
            </span>
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
    <dl className="border border-line bg-ebony-2 p-6">
      <dt className="text-xs tracking-[0.16em] text-faint uppercase">{label}</dt>
      <dd className="mt-3 font-serif-kr text-3xl font-semibold text-ivory md:text-4xl">{value}</dd>
      <dd className="mt-3 text-sm leading-relaxed text-mute">{detail}</dd>
    </dl>
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

export function ResearchEditorialRecord({
  id,
  title = "작성·검증·인용 정보",
  publisherName,
  publisherHref,
  sourceName,
  sourceHref,
  sources,
  referenceLabel,
  sourcePublishedAt,
  datasetPublishedAt,
  modifiedAt,
  version,
  verification,
  licenseName,
  licenseHref,
  reuseNote,
  citation,
}: {
  id: string;
  title?: string;
  publisherName: string;
  publisherHref: string;
  sourceName?: string;
  sourceHref?: string;
  sources?: readonly {
    name: string;
    href: string;
    dateLabel?: string;
    dateValue?: string;
  }[];
  referenceLabel: string;
  sourcePublishedAt?: string;
  datasetPublishedAt: string;
  modifiedAt: string;
  version: string;
  verification: string;
  licenseName: string;
  licenseHref: string;
  reuseNote: string;
  citation?: string;
}) {
  const sourceItems =
    sources ??
    (sourceName && sourceHref
      ? [
          {
            name: sourceName,
            href: sourceHref,
          },
        ]
      : []);

  if (sourceItems.length === 0) {
    throw new Error("ResearchEditorialRecord에는 공식 원자료가 한 개 이상 필요합니다.");
  }

  return (
    <section
      id={id}
      data-research-authorship
      className="mt-20 border-y border-line bg-ebony-2/55 py-12"
      aria-labelledby={`${id}-title`}
    >
      <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs tracking-[0.18em] text-brass uppercase">Editorial record</p>
          <h2 id={`${id}-title`} className="mt-3 font-serif-kr text-3xl font-bold">
            {title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-mute">
            원자료 기관과 가공·편집 기관을 분리하고, 공개일·버전·검증 기준을 고정해 같은 수치를 다시
            확인할 수 있게 합니다.
          </p>
        </div>

        <dl className="grid gap-x-8 gap-y-5 text-sm md:grid-cols-2">
          <div>
            <dt className="text-faint">가공·편집·배포</dt>
            <dd className="mt-1 font-medium text-ivory">
              <a
                href={publisherHref}
                className="underline decoration-brass/60 underline-offset-4 hover:text-brass"
              >
                {publisherName}
              </a>
            </dd>
          </div>
          <div className={sources ? "md:col-span-2" : undefined}>
            <dt className="text-faint">공식 원자료</dt>
            <dd className="mt-1 space-y-3 font-medium text-ivory">
              {sourceItems.map((source) => (
                <div key={source.href} data-research-source>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-brass/60 underline-offset-4 hover:text-brass"
                  >
                    {source.name} ↗
                  </a>
                  {source.dateValue && (
                    <span className="mt-1 block text-xs font-normal text-faint">
                      {source.dateLabel ?? "원자료 일자"}:{" "}
                      <time dateTime={source.dateValue}>{source.dateValue}</time>
                    </span>
                  )}
                </div>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-faint">기준 시점</dt>
            <dd className="mt-1 text-ivory">{referenceLabel}</dd>
          </div>
          <div>
            <dt className="text-faint">가공본 버전</dt>
            <dd className="mt-1 font-mono text-ivory">v{version}</dd>
          </div>
          {sourcePublishedAt && !sources && (
            <div>
              <dt className="text-faint">원자료 공표일</dt>
              <dd className="mt-1 text-ivory">
                <time dateTime={sourcePublishedAt}>{sourcePublishedAt}</time>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-faint">가공본 공개일</dt>
            <dd className="mt-1 text-ivory">
              <time dateTime={datasetPublishedAt}>{datasetPublishedAt}</time>
            </dd>
          </div>
          <div>
            <dt className="text-faint">최종 수정일</dt>
            <dd className="mt-1 text-ivory">
              <time dateTime={modifiedAt}>{modifiedAt}</time>
            </dd>
          </div>
          <div>
            <dt className="text-faint">자동 검증</dt>
            <dd className="mt-1 leading-relaxed text-ivory">{verification}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-faint">원자료 이용조건</dt>
            <dd className="mt-1 leading-relaxed text-ivory">
              <a
                href={licenseHref}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-brass/60 underline-offset-4 hover:text-brass"
              >
                {licenseName} ↗
              </a>
              <span className="mt-2 block text-mute">{reuseNote}</span>
            </dd>
          </div>
        </dl>
      </div>

      {citation && (
        <div
          data-research-citation
          className="mt-10 border border-brass/35 bg-ebony px-6 py-6 md:px-8"
        >
          <h3 className="font-serif-kr text-xl font-semibold">권장 인용문</h3>
          <cite className="mt-4 block select-all not-italic leading-relaxed text-mute">
            {citation}
          </cite>
          <p className="mt-4 text-xs leading-relaxed text-faint">
            수치만 복사하지 말고 데이터셋명, 버전, 원자료 기관, 이 페이지의 정식 URL을 함께 표시해
            주세요.{" "}
            <a
              href="/#contact"
              className="text-brass underline underline-offset-4 hover:text-ivory"
            >
              오류 제보와 수정 요청
            </a>
            은 사이트 상담 창구로 받습니다.
          </p>
        </div>
      )}
    </section>
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
