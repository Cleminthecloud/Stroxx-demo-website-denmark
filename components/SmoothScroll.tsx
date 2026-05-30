'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

/** Global smooth scroll + publishes scroll progress on window for the 3D scene. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onScroll = ({ progress }: { progress: number }) => {
      (window as any).__scrollProgress = progress;
      const ST = (window as any).ScrollTrigger;
      if (ST) ST.update();
      window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: progress }));
    };
    lenis.on('scroll', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}
