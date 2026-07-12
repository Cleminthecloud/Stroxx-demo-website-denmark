'use client';

import { useEffect, useRef } from 'react';

/** The metallic STROXX mark, live version for the brand guide. Same artwork
 *  and layer stack as /brand/motion/stroxx-logo-metallic.svg (the downloadable
 *  ambient loop), plus the pointer half of the effect a static file cannot do:
 *  the light follows the cursor over the mark (lerped, house style), and when
 *  the pointer leaves it hands back to the slow left-to-right pass. A single
 *  rAF loop runs only while the card is on screen, and prefers-reduced-motion
 *  collapses everything to a static glint parked mid-mark. */

const VB_W = 360;
const SWEEP_S = 7; // matches the downloadable loop
const FROM = -165; // shine center start (off canvas left)
const TO = 525; // shine center end (off canvas right)

/* the light crosses in the first half of the cycle, then rests (as the file does) */
function idleCenter(tSec: number): number {
  const p = (tSec % SWEEP_S) / SWEEP_S;
  if (p >= 0.5) return TO;
  const x = p / 0.5;
  const eased = x * x * (3 - 2 * x); // smoothstep, close to the file's spline
  return FROM + eased * (TO - FROM);
}

export default function MetallicMark() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gradRef = useRef<SVGLinearGradientElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const grad = gradRef.current;
    if (!svg || !grad) return;

    const setCenter = (c: number) => {
      grad.setAttribute('x1', String(c - 95));
      grad.setAttribute('x2', String(c + 95));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCenter(180); // static glint, no motion, no listeners
      return;
    }

    let raf = 0;
    let running = false;
    let hovering = false;
    let target = FROM;
    let current = FROM;
    const t0 = performance.now();

    const frame = (now: number) => {
      if (!hovering) target = idleCenter((now - t0) / 1000);
      /* the pointer leads, the light follows: responsive but never snapping */
      current += (target - current) * (hovering ? 0.18 : 0.1);
      setCenter(current);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* run only while the mark is actually on screen */
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.1 });
    io.observe(svg);

    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      hovering = true;
      target = ((e.clientX - r.left) / r.width) * VB_W;
    };
    const onLeave = () => {
      hovering = false; // frame() hands back to the idle sweep, lerped
    };
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerleave', onLeave);

    return () => {
      stop();
      io.disconnect();
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 360 120"
      role="img"
      aria-label="STROXX metallic logo, the light follows your cursor"
      className="w-full block"
      style={{ touchAction: 'pan-y' }}
    >
      <defs>
        <g id="mm-mark" transform="translate(58,26) scale(2.44)">
          <polygon points="21 8.2 24.14 8.2 24.14 22.97 26.86 22.97 26.86 8.2 30 8.2 30 5.89 21 5.89 21 8.2" />
          <path d="M45.18,13.46c.35-.71.52-1.56.52-2.55,0-3.34-1.6-5.01-4.8-5.01h-4.37v17.07h2.72v-7.29h1.63l2.53,7.29h2.88l-2.93-7.79c.87-.43,1.48-1,1.83-1.71ZM42.9,12c-.05.33-.16.6-.31.83-.15.22-.37.4-.65.52-.28.12-.67.18-1.15.18h-1.55v-5.32h1.41c.5,0,.9.06,1.2.17.3.11.54.28.71.52.17.23.28.51.33.84.05.33.08.71.08,1.14s-.03.81-.08,1.14Z" />
          <path d="M13.76,6.97c-.4-.37-.88-.66-1.44-.89-.56-.22-1.18-.34-1.85-.34-.78,0-1.47.12-2.05.37-.59.25-1.07.58-1.45,1-.38.42-.67.91-.87,1.49-.2.58-.29,1.18-.29,1.82,0,1.07.2,1.96.6,2.67.4.71,1.19,1.28,2.36,1.71l1.95.72c.34.13.61.25.81.36.2.11.36.26.48.43.12.18.19.41.23.7.04.29.05.66.05,1.1,0,.38-.02.74-.05,1.06-.04.32-.12.59-.25.8-.13.22-.33.38-.59.5-.26.12-.62.18-1.08.18-.69,0-1.19-.18-1.48-.54-.29-.36-.44-.76-.44-1.21v-.77h-2.72v.91c0,.58.12,1.11.36,1.61.24.5.56.92.97,1.28.41.36.9.64,1.47.85.57.21,1.18.31,1.84.31.87,0,1.61-.13,2.21-.38.6-.26,1.09-.6,1.45-1.04.36-.44.63-.97.79-1.58.16-.62.24-1.28.24-2,0-.62-.04-1.18-.11-1.67-.07-.49-.21-.92-.41-1.3-.2-.38-.49-.7-.87-.98-.37-.28-.86-.52-1.47-.73l-2.08-.74c-.36-.13-.64-.26-.84-.38-.2-.13-.36-.28-.47-.44-.11-.17-.17-.37-.2-.6-.03-.23-.04-.52-.04-.85,0-.29.03-.56.08-.83.05-.26.15-.5.28-.7.13-.2.32-.36.56-.49.24-.13.55-.19.92-.19.69,0,1.19.2,1.48.61.29.41.44.89.44,1.45v.55h2.72v-1.2c0-.48-.11-.95-.32-1.4-.21-.46-.52-.87-.92-1.24Z" />
          <polygon points="78.74 5.89 75.86 5.89 73.78 10.95 71.73 5.89 68.85 5.89 72.4 14.02 68.56 22.97 71.44 22.97 73.78 17.21 76.15 22.97 79.03 22.97 75.11 14.02 78.74 5.89" />
          <path d="M60.71,6.79c-.44-.34-.92-.6-1.47-.78-.54-.18-1.09-.26-1.64-.26s-1.1.09-1.64.26c-.54.18-1.03.44-1.47.78-.44.34-.79.78-1.05,1.31-.27.53-.4,1.14-.4,1.82v9.02c0,.7.13,1.32.4,1.83.27.52.62.95,1.05,1.29.44.34.92.6,1.47.78.54.18,1.09.26,1.64.26s1.1-.09,1.64-.26c.54-.18,1.03-.44,1.47-.78.43-.34.79-.78,1.05-1.29.27-.52.4-1.13.4-1.83v-9.02c0-.69-.13-1.29-.4-1.82-.27-.53-.62-.96-1.05-1.31ZM59.45,18.94c0,.59-.18,1.03-.55,1.31-.36.28-.8.42-1.29.42s-.93-.14-1.29-.42c-.36-.28-.55-.72-.55-1.31v-9.02c0-.59.18-1.03.55-1.31.36-.28.79-.42,1.29-.42s.93.14,1.29.42c.36.28.55.72.55,1.31v9.02Z" />
          <polygon points="94.43 5.89 91.55 5.89 89.48 10.95 87.42 5.89 84.55 5.89 88.09 14.02 84.25 22.97 87.13 22.97 89.48 17.21 91.85 22.97 94.72 22.97 90.81 14.02 94.43 5.89" />
          <path d="M0,0v28.31h100.34V0H0ZM98.88,26.85H1.46V1.46h97.42v25.4Z" />
        </g>
        <linearGradient id="mm-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1f4" />
          <stop offset="0.45" stopColor="#9aa0a6" />
          <stop offset="0.58" stopColor="#686e74" />
          <stop offset="1" stopColor="#cdd2d8" />
        </linearGradient>
        <linearGradient ref={gradRef} id="mm-shine" gradientUnits="userSpaceOnUse" x1="-260" y1="120" x2="-70" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="360" height="120" fill="#0B0C0E" />
      {/* solid brushed-steel letterforms, then the light passes over the fill */}
      <use href="#mm-mark" fill="url(#mm-steel)" />
      <use href="#mm-mark" fill="url(#mm-shine)" />
    </svg>
  );
}
