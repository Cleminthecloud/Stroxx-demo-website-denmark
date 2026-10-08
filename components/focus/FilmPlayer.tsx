'use client';
import { useEffect, useRef } from 'react';

/** Self-hosted film that plays muted while in view and pauses when it leaves
 *  (saves battery and bandwidth, and never fights the reader for attention).
 *  Native controls are always present, so a visitor can start it by hand when
 *  autoplay is blocked. Respects prefers-reduced-motion: no autoplay then.
 *
 *  Visibility is checked with getBoundingClientRect on scroll, not an
 *  IntersectionObserver: the Studio's Presentation pane and some embedded
 *  previews never fire IO callbacks (see the Webflow notes on the same bug). */
export default function FilmPlayer({
  src,
  poster,
  ratio = '16/9',
  label,
  hero = false,
  sources,
}: {
  src: string;
  poster?: string;
  ratio?: string;
  label?: string;
  hero?: boolean;
  /** responsive cuts: [minWidth, url] pairs, largest first; falls back to src */
  sources?: { min: number; src: string }[];
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* pick the right cut for the viewport (hero: 16:9 / 1:1 / 9:16) */
    let current = '';
    const pick = () => {
      const w = window.innerWidth;
      const url = (sources || []).find((s) => w >= s.min)?.src || src;
      if (url && url !== current) {
        current = url;
        v.src = url;
        v.load();
      }
    };
    pick();

    if (reduce) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = v.getBoundingClientRect();
      const h = window.innerHeight || 800;
      const inView = r.top < h * 0.9 && r.bottom > h * 0.1;
      if (inView && v.paused && !v.dataset.userPaused) {
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else if (!inView && !v.paused) {
        v.pause();
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    /* a pause the visitor makes themselves sticks until they press play */
    const onPause = () => {
      const r = v.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) v.dataset.userPaused = '1';
    };
    const onPlay = () => delete v.dataset.userPaused;
    v.addEventListener('pause', onPause);
    v.addEventListener('play', onPlay);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', pick);
    document.addEventListener('visibilitychange', schedule);
    const t1 = setTimeout(check, 300);
    const t2 = setTimeout(check, 1200);
    return () => {
      v.removeEventListener('pause', onPause);
      v.removeEventListener('play', onPlay);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', pick);
      document.removeEventListener('visibilitychange', schedule);
      clearTimeout(t1);
      clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [src, sources]);

  if (hero) {
    return (
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  const aspect = ratio === '4/5' ? 'aspect-[4/5]' : ratio === '1/1' ? 'aspect-square' : 'aspect-video';
  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={label}
      className={`block w-full rounded-2xl bg-black object-cover ${aspect}`}
    />
  );
}
