// 이화 피아노 과외 — 인벤티드 모노그램 (건반 5개 막대 추상화)
export function Monogram({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10 21V11M13.5 21V8.5M17 21v-9.5M20.5 21V10M23.5 21v-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.5 23.5h15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
