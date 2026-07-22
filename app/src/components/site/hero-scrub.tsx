import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  frameCount: number;
  frameSrc: (index: number) => string;
  poster: string;
  children?: ReactNode;
};

// Tier-1 A1: 스크롤이 필름을 연주하는 캔버스 스크러버.
// SSR/스크린샷 안전: 포스터 <img>가 첫 페인트를 담당하고 캔버스는 그 위에 그린다.
// 고정은 GSAP pin이 아닌 CSS sticky (pin-spacer 트랩 회피), ScrollTrigger는 진행률만 추적.
export function HeroScrub({ frameCount, frameSrc, poster, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Save-Data: 프레임을 받지 않고 포스터(정적)로 고정
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const saveData = conn?.saveData === true;
    if (reduced || frameCount < 2 || saveData) return;

    // 모바일은 짝수 프레임만 사용하고, 모든 환경에서 현재 스크롤 위치 주변만
    // 요청한다. 이전 구현처럼 101장을 차례로 전부 받지 않아도 된다.
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const frameStep = isMobile ? 2 : 1;

    let cancelled = false;
    let cleanupScroll: (() => void) | undefined;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    const loading = new Map<number, Promise<void>>();
    let current = -1;

    const normalizedIndex = (index: number) => {
      const clamped = Math.max(0, Math.min(frameCount - 1, index));
      if (isMobile && clamped % 2 === 1 && clamped !== frameCount - 1) {
        return clamped - 1;
      }
      return clamped;
    };

    const nearestLoaded = (index: number): HTMLImageElement | null => {
      for (let d = 0; d < frameCount; d += 1) {
        const back = frames[index - d];
        if (back) return back;
        const fwd = frames[index + d];
        if (fwd) return fwd;
      }
      return null;
    };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(current < 0 ? 0 : current);
    };

    const draw = (index: number) => {
      const img = nearestLoaded(index);
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw = cw;
      let dh = ch;
      if (ir > cr) {
        dw = ch * ir;
      } else {
        dh = cw / ir;
      }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const setFrame = (index: number) => {
      const clamped = Math.max(0, Math.min(frameCount - 1, index));
      if (clamped === current) return;
      current = clamped;
      draw(clamped);
      for (const offset of [-2, -1, 0, 1, 2]) {
        void load(clamped + offset * frameStep);
      }
    };

    const load = (requestedIndex: number): Promise<void> => {
      const i = normalizedIndex(requestedIndex);
      if (frames[i]) return Promise.resolve();
      const pending = loading.get(i);
      if (pending) return pending;

      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          frames[i] = img;
          if (i === 0 && !cancelled) {
            setReady(true);
            sizeCanvas();
          }
          if (Math.abs(i - current) <= frameStep * 2) draw(current);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(i);
      });
      loading.set(i, promise);
      void promise.finally(() => loading.delete(i));
      return promise;
    };

    (async () => {
      await load(0);
      if (cancelled) return;
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => setFrame(Math.round(self.progress * (frameCount - 1))),
      });
      cleanupScroll = () => st.kill();
      window.addEventListener("resize", sizeCanvas);

      // 네 구간의 대표 프레임만 미리 데워 빠른 점프에서도 빈 캔버스를 피한다.
      // 나머지 프레임은 setFrame()에서 필요할 때만 받는다.
      for (const progress of [0.25, 0.5, 0.75, 1]) {
        void load(Math.round((frameCount - 1) * progress));
      }
    })();

    return () => {
      cancelled = true;
      cleanupScroll?.();
      window.removeEventListener("resize", sizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount]);

  return (
    <div ref={wrapRef} className="relative h-[160dvh] md:h-[240dvh]">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        <img
          src={poster}
          alt="그랜드 피아노 건반 위 연주하는 손"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        {/* 하단 가독성용 수직 그라디언트 (풋티지가 아닌 UI 레이어) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ebony via-ebony/55 to-transparent"
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
}
