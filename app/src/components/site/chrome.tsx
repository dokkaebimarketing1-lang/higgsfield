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
        <nav className="hidden items-center gap-6 lg:flex">
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
        <div className="flex items-center gap-4">
          <details className="group relative lg:hidden">
            <summary className="cursor-pointer list-none text-sm text-mute transition-colors hover:text-ivory [&::-webkit-details-marker]:hidden">
              메뉴
            </summary>
            <nav className="absolute right-0 top-9 z-50 min-w-48 border border-line bg-ebony-2 p-2 shadow-2xl">
              {SITE.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-sm text-mute transition-colors hover:bg-ebony-3 hover:text-ivory"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/sitemap"
                className="block border-t border-line px-4 py-3 text-sm text-mute transition-colors hover:bg-ebony-3 hover:text-ivory"
              >
                전체 사이트맵
              </a>
            </nav>
          </details>
          <a
            href="/#contact"
            className="text-sm font-medium whitespace-nowrap text-ivory underline decoration-brass decoration-2 underline-offset-8 transition-colors hover:text-brass"
          >
            상담 신청
          </a>
        </div>
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
            <p className="mt-2 max-w-md text-xs leading-relaxed text-faint">
              본 사이트는 이화여자대학교 공식 사이트가 아닌 개인 피아노 레슨 안내 사이트입니다.
            </p>
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
          <nav className="flex flex-col gap-3" aria-label="무료 피아노 도구와 자료">
            <span className="text-xs tracking-[0.14em] text-faint uppercase">무료 도구·자료</span>
            {SITE.authorityNav.map((item) => (
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
            <a href="/editorial-policy" className="transition-colors hover:text-mute">
              편집 정책
            </a>
            <a href="/admin" rel="nofollow" className="transition-colors hover:text-mute">
              {SITE.footer.admin}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// 고정 헤더 여백을 보상하면서 페이지당 main 랜드마크를 하나만 제공합니다.
export function SubPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ebony text-ivory antialiased">
      <SiteNav />
      <main className="pt-16 md:pt-[72px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
