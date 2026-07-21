import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";

// 사이트 전체 모션: Lenis 스무스 스크롤 + GSAP 브리지,
// 헤드라인 마운트 빌드(뷰포트 게이트 없음), 스크롤 연동 트랜스폼/클립 리빌,
// 헤어라인 드로우, 가격 카운트업. 모두 prefers-reduced-motion 게이트.
// SSR 안전: 브라우저 전용 코드는 useEffect + dynamic import 안에서만.
export function useSiteMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current;
    if (!root || reduced) return;

    let cancelled = false;
    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, LenisModule, SplitTypeModule] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
          import("split-type"),
        ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // Lenis + GSAP ticker 브리지 (autoRaf: false)
      const LenisCtor = LenisModule.default;
      const instance: Lenis = new LenisCtor({
        autoRaf: false,
        duration: 1.15,
        smoothWheel: true,
      });
      lenis = instance;
      tickerFn = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
      instance.on("scroll", ScrollTrigger.update);

      const SplitType = SplitTypeModule.default;

      // 1) 헤드라인 마운트 빌드 (스크롤 게이트 없이 즉시 실행)
      root.querySelectorAll<HTMLElement>("[data-build]").forEach((el) => {
        const split = new SplitType(el, { types: "chars" });
        const chars = split.chars ?? [];
        gsap.fromTo(
          chars,
          { opacity: 0, yPercent: 28 },
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.028,
            delay: Number(el.dataset.delay ?? 0),
          },
        );
      });

      // 2) 스크롤 리빌: 트랜스폼/클립만 (opacity 숨김 금지, 스크린샷 안전)
      root.querySelectorAll<HTMLElement>("[data-settle]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 36 },
          {
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
      root.querySelectorAll<HTMLElement>("[data-wipe]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)", y: 24 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });

      // 3) 헤어라인 드로우 (scaleX 트랜스폼)
      root.querySelectorAll<HTMLElement>("[data-rule]").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      // 4) 가격 카운트업 (텍스트 값만, 레이아웃/투명도 불변)
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count ?? "0");
        if (!target) return;
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(state.v).toLocaleString("ko-KR");
          },
        });
      });
    })();

    return () => {
      cancelled = true;
      if (tickerFn) {
        import("gsap").then(({ gsap }) => gsap.ticker.remove(tickerFn!));
      }
      lenis?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
