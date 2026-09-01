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
        <g id="mm-mark" transform="translate(50,23.3) scale(0.5394)">
          <path d="M72.07,51.93h-13.06v-2.65c0-2.69-.7-5.01-2.11-6.97-1.41-1.96-3.78-2.94-7.1-2.94-1.79,0-3.26.31-4.42.92-1.15.62-2.05,1.4-2.69,2.36-.64.96-1.09,2.07-1.34,3.34-.26,1.27-.38,2.59-.38,3.97,0,1.61.06,2.98.19,4.09.13,1.11.45,2.07.96,2.88.51.81,1.26,1.52,2.24,2.13.98.62,2.32,1.23,4.03,1.84l9.98,3.57c2.9,1,5.25,2.17,7.04,3.51,1.79,1.35,3.18,2.92,4.16,4.72.98,1.81,1.64,3.88,1.98,6.22.34,2.34.51,5.01.51,8.01,0,3.46-.38,6.66-1.15,9.62-.77,2.96-2.03,5.49-3.78,7.6-1.75,2.11-4.08,3.78-6.98,5.01-2.9,1.23-6.44,1.84-10.62,1.84-3.16,0-6.1-.5-8.83-1.5-2.73-1-5.08-2.36-7.04-4.09-1.96-1.73-3.52-3.78-4.67-6.16-1.15-2.38-1.73-4.95-1.73-7.72v-4.38h13.06v3.69c0,2.15.7,4.09,2.11,5.82,1.41,1.73,3.78,2.59,7.1,2.59,2.22,0,3.95-.29,5.18-.86,1.24-.58,2.18-1.38,2.82-2.42.64-1.04,1.04-2.32,1.22-3.86.17-1.54.26-3.23.26-5.07,0-2.15-.09-3.92-.26-5.3-.17-1.38-.53-2.5-1.09-3.34-.56-.84-1.32-1.54-2.3-2.07-.98-.54-2.28-1.11-3.9-1.73l-9.34-3.46c-5.63-2.07-9.41-4.82-11.33-8.24-1.92-3.42-2.88-7.7-2.88-12.84,0-3.07.47-5.99,1.41-8.75.94-2.76,2.32-5.14,4.16-7.14,1.83-2,4.16-3.59,6.98-4.78,2.82-1.19,6.1-1.79,9.86-1.79,3.24,0,6.21.54,8.9,1.61,2.69,1.08,4.99,2.5,6.91,4.26,1.92,1.77,3.39,3.74,4.42,5.93,1.02,2.19,1.54,4.43,1.54,6.74v5.76ZM115.97,39.37h-15.1v-11.06h43.26v11.06h-15.1v70.96h-13.06V39.37ZM175.49,28.31h20.99c15.36,0,23.04,8.03,23.04,24.08,0,4.76-.83,8.85-2.5,12.27-1.66,3.42-4.59,6.16-8.77,8.24l14.08,37.44h-13.82l-12.16-35.02h-7.81v35.02h-13.06V28.31ZM188.54,64.94h7.42c2.3,0,4.14-.29,5.5-.86,1.36-.58,2.41-1.4,3.14-2.48.72-1.08,1.22-2.4,1.47-3.97.26-1.57.38-3.4.38-5.47s-.13-3.9-.38-5.47c-.26-1.57-.79-2.92-1.6-4.03-.81-1.11-1.94-1.94-3.39-2.48-1.45-.54-3.37-.81-5.76-.81h-6.78v25.57ZM254.85,47.66c0-3.3.64-6.22,1.92-8.75s2.96-4.63,5.06-6.28c2.09-1.65,4.44-2.9,7.04-3.74,2.6-.84,5.23-1.27,7.87-1.27s5.27.42,7.87,1.27c2.6.85,4.95,2.09,7.04,3.74,2.09,1.65,3.78,3.74,5.06,6.28,1.28,2.53,1.92,5.45,1.92,8.75v43.32c0,3.38-.64,6.32-1.92,8.81-1.28,2.5-2.97,4.57-5.06,6.22-2.09,1.65-4.44,2.9-7.04,3.74-2.6.84-5.23,1.27-7.87,1.27s-5.27-.42-7.87-1.27c-2.6-.84-4.95-2.09-7.04-3.74-2.09-1.65-3.78-3.72-5.06-6.22-1.28-2.49-1.92-5.43-1.92-8.81v-43.32ZM267.9,90.98c0,2.84.87,4.94,2.62,6.28,1.75,1.34,3.82,2.02,6.21,2.02s4.46-.67,6.21-2.02c1.75-1.34,2.62-3.44,2.62-6.28v-43.32c0-2.84-.88-4.93-2.62-6.28-1.75-1.34-3.82-2.02-6.21-2.02s-4.46.67-6.21,2.02c-1.75,1.34-2.62,3.44-2.62,6.28v43.32ZM347.77,67.36l-17.02-39.05h13.82l9.86,24.31,9.98-24.31h13.82l-17.41,39.05,18.82,42.97h-13.82l-11.39-27.65-11.26,27.65h-13.82l18.43-42.97ZM423.16,67.36l-17.02-39.05h13.82l9.86,24.31,9.98-24.31h13.82l-17.41,39.05,18.82,42.97h-13.82l-11.39-27.65-11.26,27.65h-13.82l18.43-42.97Z" />
          <path d="M475,7v122H7V7h468M482,0H0v136h482V0h0Z" />
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
