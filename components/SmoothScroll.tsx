'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/** Global smooth scroll; keeps gsap's ScrollTrigger (used by ScrollText) in sync. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // ScrollText registers gsap's ScrollTrigger on window; Lenis drives the
    // scroll, so we nudge ScrollTrigger each frame it moves. (The old
    // __scrollProgress + 'lenis-scroll' event fed only the removed 3D scene.)
    const onScroll = () => {
      const ST = (window as any).ScrollTrigger;
      if (ST) ST.update();
    };
    lenis.on('scroll', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // On client-side route change, snap to the top. Lenis owns the scroll position,
  // so Next's default scroll-to-top is overridden by Lenis' rAF loop and never
  // sticks — we have to tell Lenis explicitly. (Hash-only links like
  // #specifikationer don't change the pathname, so in-page anchors are unaffected.)
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
