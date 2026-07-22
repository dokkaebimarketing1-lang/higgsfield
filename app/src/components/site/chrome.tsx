import { SITE } from "../../lib/content";
import { Monogram } from "./monogram";

// 공개 페이지가 공유하는 사이트 크롬(헤더 + 푸터).
export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-ebony/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-[72px] md:px-10">
        <a href="/" className="flex items-center gap-3 text-ivory">
          <Monogram className="h-6 w-6 text-brass" />
          <span className="font-serif-kr text-lg font-semibold tracking-tight">{SITE.brand}</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {SITE.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-mute transition-colors hover:text-ivory"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="/#contact"
          className="text-sm font-medium text-ivory underline decoration-brass decoration-2 underline-offset-8 transition-colors hover:text-brass"
        >
          상담 신청하기
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <img
        src="/assets/plate-hall.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-ebony/85" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <div className="flex items-center gap-3">
              <Monogram className="h-7 w-7 text-brass" />
              <span className="font-serif-kr text-xl font-semibold">{SITE.brand}</span>
            </div>
            <p className="mt-4 text-sm text-mute">{SITE.footer.line}</p>
          </div>
          <nav className="flex flex-col gap-3">
            {SITE.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-mute transition-colors hover:text-ivory"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="/#contact"
            className="group flex items-center gap-3 font-serif-kr text-2xl text-ivory transition-colors hover:text-brass"
          >
            상담 신청하기
            <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
          </a>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-faint">
          <span>{SITE.footer.copyright}</span>
          <span className="flex gap-5">
            <a href="/sitemap" className="transition-colors hover:text-mute">
              사이트맵
            </a>
            <a href="/privacy" className="transition-colors hover:text-mute">
              개인정보 처리 안내
            </a>
            <a href="/admin" className="transition-colors hover:text-mute">
              {SITE.footer.admin}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// 서브 페이지 상단 여백 (고정 헤더 높이 보상)
export function SubPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-ebony text-ivory antialiased">
      <SiteNav />
      <div className="pt-16 md:pt-[72px]">{children}</div>
      <SiteFooter />
    </main>
  );
}
