import { resolveResearchReferences, type ResearchReferenceId } from "../../lib/research-links";

type ResearchReferencePanelProps = {
  references: readonly ResearchReferenceId[];
  heading?: string;
  description?: string;
  className?: string;
};

export function ResearchReferencePanel({
  references,
  heading = "판단 전에 확인할 공식 데이터",
  description = "교육 조사와 행정 통계는 시장 배경을 확인하는 참고 자료입니다. 아래 수치는 이 사이트의 레슨 가격, 수업 품질, 학습 결과를 입증하지 않습니다.",
  className = "",
}: ResearchReferencePanelProps) {
  const items = resolveResearchReferences(references);
  if (items.length === 0) return null;

  return (
    <aside
      className={`border border-line bg-ebony-2 p-7 md:p-9 ${className}`.trim()}
      aria-label={heading}
    >
      <p className="font-latin text-sm italic text-brass">Research reference</p>
      <h2 className="mt-2 font-serif-kr text-2xl font-semibold tracking-tight md:text-3xl">
        {heading}
      </h2>
      <p className="mt-4 max-w-[72ch] text-sm leading-relaxed text-mute md:text-base">
        {description}
      </p>
      <div
        className={`mt-7 grid gap-px border border-line bg-line ${
          items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {items.map((item) => (
          <article key={item.id} className="bg-ebony p-6">
            <p className="text-xs font-medium tracking-wide text-faint">{item.label}</p>
            <h3 className="mt-3 font-serif-kr text-lg font-semibold leading-snug text-ivory">
              <a
                href={item.href}
                className="text-brass underline underline-offset-4 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
              >
                {item.anchor}
              </a>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mute">{item.description}</p>
            <p className="mt-4 border-l border-brass/50 pl-3 text-xs leading-relaxed text-faint">
              해석 범위: {item.limitation}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}
