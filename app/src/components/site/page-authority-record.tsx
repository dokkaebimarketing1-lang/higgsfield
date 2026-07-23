type PageAuthorityRecordProps = {
  title: string;
  answer: string;
  scope: string;
  boundary: string;
  lastModified: string;
  audience?: string;
  className?: string;
  authorLabel?: string;
  authorName?: string;
  authorHref?: string;
  dateLabel?: string;
  reviewStatus?: string;
};

function formatReviewDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export function PageAuthorityRecord({
  title,
  answer,
  scope,
  boundary,
  lastModified,
  audience,
  className = "",
  authorLabel = "작성·운영",
  authorName = "이화 피아노 과외 사이트 운영팀",
  authorHref = "/editorial-policy",
  dateLabel = "최종 수정일",
  reviewStatus = "외부·전문가 독립 검토 전",
}: PageAuthorityRecordProps) {
  return (
    <section
      data-page-authority
      className={`border border-line bg-ebony-2 p-7 md:p-9 ${className}`.trim()}
      aria-labelledby="page-authority-heading"
    >
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-xs font-medium tracking-[0.16em] text-brass">{authorLabel} 기록</p>
          <h2
            id="page-authority-heading"
            className="mt-3 break-keep font-serif-kr text-2xl font-semibold leading-tight md:text-3xl"
          >
            {title}
          </h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-faint">{authorLabel}</dt>
              <dd className="mt-1">
                <a
                  href={authorHref}
                  className="text-brass underline underline-offset-4 transition-colors hover:text-ivory"
                >
                  {authorName}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-faint">{dateLabel}</dt>
              <dd className="mt-1 text-ivory">
                <time dateTime={lastModified}>{formatReviewDate(lastModified)}</time>
              </dd>
            </div>
            {reviewStatus && (
              <div>
                <dt className="text-faint">검토 상태</dt>
                <dd className="mt-1 text-ivory">{reviewStatus}</dd>
              </div>
            )}
          </dl>
        </div>

        <dl className="grid gap-6 md:col-span-7 md:col-start-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-brass">이 페이지의 답</dt>
            <dd className="mt-2 font-serif-kr text-lg leading-relaxed text-ivory">{answer}</dd>
          </div>
          {audience && (
            <div>
              <dt className="text-sm font-medium text-brass">읽는 대상</dt>
              <dd className="mt-2 text-sm leading-relaxed text-mute">{audience}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-brass">담당 범위</dt>
            <dd className="mt-2 text-sm leading-relaxed text-mute">{scope}</dd>
          </div>
          <div className={audience ? "md:col-span-2" : ""}>
            <dt className="text-sm font-medium text-brass">구분·한계</dt>
            <dd className="mt-2 text-sm leading-relaxed text-mute">{boundary}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-faint">
        수업 조건이나 문서 내용이 달라졌다면{" "}
        <a
          href="/#contact"
          className="text-brass underline underline-offset-4 transition-colors hover:text-ivory"
        >
          수정이 필요한 내용을 알려 주세요
        </a>
        . 확인 후 검토일과 내용을 함께 갱신합니다.
      </p>
    </section>
  );
}
