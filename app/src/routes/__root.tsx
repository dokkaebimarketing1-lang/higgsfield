import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
// Page metadata (browser <title>/favicon + social og: tags) committed into the
// repo by the marketplace meta API and read at BUILD time — no runtime fetch.
// Editing it via the app settings UI rewrites this file and redeploys the app.
import appMetaJson from "../app-meta.json";

declare const __HF_DESIGN_INSPECTOR__: boolean;

// Built-in defaults for any field that isn't set in app-meta.json.
const DEFAULT_TITLE = "피아노 레슨 | 이화여대 피아노과 1:1 과외";
const DEFAULT_DESCRIPTION =
  "피아노 레슨을 이화여자대학교 피아노과 재학생에게 1:1로 배워 보세요. 어린이·성인 취미부터 입시·콩쿠르까지, 서울 서대문구·마포구 방문과 온라인 수업을 안내합니다.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

// Build the document head (title / description / og: / twitter: / favicon) from
// app-meta.json, falling back to the defaults above for any unset field.
// og_title/og_description double as the browser <title> and meta description;
// og_image_url (when set) also drives the twitter card + image. Built from
// inline tag literals (conditional spreads for the optional image/favicon) so
// it matches the head() shape TanStack expects.
// favicon/og images live in THIS app's own /assets, so the host is never
// inherent. app-meta.json may carry an absolute higgsfield-app URL with a STALE
// host — baked from the app this one was copied/remixed/renamed from — which would
// serve the wrong app's favicon/og. Strip any higgsfield-app host (prod
// higgsfield.app + dev higgsfield-dev.app) down to a root-relative path so it
// always resolves against whoever serves THIS page (preview / prod / custom
// domain). Genuinely external URLs (a CDN image the owner set) are left absolute.
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value; // already root-relative
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some(
      (zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`),
    );
    if (isAppHost) return u.pathname + u.search;
    return value; // external host (CDN, etc.) — keep absolute
  } catch {
    return value; // not a parseable URL — leave as-is
  }
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "김서연" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "이화 피아노 과외" },
      { property: "og:locale", content: "ko_KR" },
      { name: "theme-color", content: "#0e130f" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      // Cover video (og:video) — the animated counterpart of og:image; the
      // Higgsfield feed cards also play it on hover.
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous" as const,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap",
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "이화 피아노 과외 피아노 이야기",
        href: "/rss.xml",
      },
      ...(favicon ? [{ rel: "icon", href: favicon }] : []),
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/assets/icons/favicon-32.png",
      },
      { rel: "apple-touch-icon", href: "/assets/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

function NotFoundComponent() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ebony px-6 text-center text-ivory">
      <p className="font-latin text-7xl italic text-brass">404</p>
      <p className="mt-6 font-serif-kr text-2xl font-semibold">페이지를 찾을 수 없습니다</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
        주소가 변경되었거나 없는 페이지입니다. 아래 주요 페이지에서 원하는 정보를 다시 찾아보세요.
      </p>
      <nav className="mt-10 flex flex-wrap justify-center gap-3" aria-label="404 도움말">
        <a
          href="/"
          className="border border-line px-6 py-3 font-serif-kr text-base text-ivory transition-colors hover:border-brass hover:text-brass"
        >
          홈
        </a>
        <a
          href="/blog"
          className="border border-line px-6 py-3 font-serif-kr text-base text-ivory transition-colors hover:border-brass hover:text-brass"
        >
          피아노 이야기
        </a>
        <a
          href="/sitemap"
          className="border border-line px-6 py-3 font-serif-kr text-base text-ivory transition-colors hover:border-brass hover:text-brass"
        >
          전체 사이트맵
        </a>
      </nav>
      <a href="/#contact" className="mt-7 text-sm text-brass underline underline-offset-4">
        잘못된 주소 알려주기
      </a>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ebony px-6 text-center text-ivory">
      <p className="font-serif-kr text-2xl font-semibold">페이지를 불러오지 못했습니다</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
        일시적인 문제일 수 있습니다. 새로고침하거나 홈으로 돌아가 주세요.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="bg-brass px-7 py-3 font-serif-kr text-lg font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99]"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="border border-line px-7 py-3 font-serif-kr text-lg text-ivory transition-colors hover:border-brass hover:text-brass"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Read the committed page metadata at build time (no runtime fetch).
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" data-theme="default-dark" style={{ colorScheme: "dark" }}>
      {/* Marketplace apps are permanently dark: data-theme is pinned on <html>
          above. Do not add quanta's bootstrapScript/ThemeController, a theme
          toggle, or a light mode. */}
      <head>
        <HeadContent />
      </head>
      <body className="bg-ebony text-ivory">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }

    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          {
            boundary: "higgsfield_design_inspector_import",
          },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
