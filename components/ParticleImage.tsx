'use client';
import { useEffect, useRef } from 'react';

/** Scroll-driven particle image-reveal. Samples a (white-background) product
 *  photo, drops the white, and turns the remaining pixels into a cloud of
 *  blue particles that scatter in / assemble as the element enters the
 *  viewport — and drift apart again as it leaves. All particles are STROXX
 *  blue shades, tinted by the source pixel's luminance. */

const BLUES = ['#042C53', '#0C447C', '#0082CA', '#378ADD', '#85B7EB', '#BCD8F5'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function ParticleImage({
  src,
  className = '',
  maxParticles = 6500,
}: {
  src: string;
  className?: string;
  maxParticles?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current, host = wrap.current;
    if (!cv || !host) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    let tx: Float32Array = new Float32Array(0);
    let ty: Float32Array = new Float32Array(0);
    let sx: Float32Array = new Float32Array(0);
    let sy: Float32Array = new Float32Array(0);
    let dl: Float32Array = new Float32Array(0);
    let rs: Float32Array = new Float32Array(0);
    let cols: string[] = [];
    let n = 0;
    let psize = 2;

    const size = () => {
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const build = () => {
      const ar = img.naturalWidth / img.naturalHeight || 1;
      const OW = 250, OH = Math.max(1, Math.round(OW / ar));
      const off = document.createElement('canvas');
      off.width = OW; off.height = OH;
      const o = off.getContext('2d');
      if (!o) return;
      o.drawImage(img, 0, 0, OW, OH);
      let data: Uint8ClampedArray;
      try { data = o.getImageData(0, 0, OW, OH).data; } catch { return; }

      const cand: number[] = [];
      let minX = OW, minY = OH, maxX = 0, maxY = 0;
      for (let y = 0; y < OH; y += 2) {
        for (let x = 0; x < OW; x += 2) {
          const i = (y * OW + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 24) continue;
          const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
          if (L > 0.92 && sat < 0.12) continue; // drop white background
          cand.push(x, y, Math.round(L * 255));
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
      let total = cand.length / 3;
      if (total === 0) return;
      const stride = total > maxParticles ? Math.ceil(total / maxParticles) : 1;

      const bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
      const scale = Math.min((W * 0.64) / bw, (H * 0.64) / bh);
      const bcx = (minX + maxX) / 2, bcy = (minY + maxY) / 2;
      psize = Math.max(1.4, scale * 0.9);

      const pts: { x: number; y: number; L: number }[] = [];
      for (let k = 0; k < total; k += stride) {
        const idx = k * 3;
        pts.push({ x: cand[idx], y: cand[idx + 1], L: cand[idx + 2] / 255 });
      }
      n = pts.length;
      tx = new Float32Array(n); ty = new Float32Array(n);
      sx = new Float32Array(n); sy = new Float32Array(n);
      dl = new Float32Array(n); rs = new Float32Array(n); cols = new Array(n);
      const rad = Math.min(W, H) * 0.5;
      for (let k = 0; k < n; k++) {
        const px = W / 2 + (pts[k].x - bcx) * scale;
        const py = H / 2 + (pts[k].y - bcy) * scale;
        tx[k] = px; ty[k] = py;
        const ang = Math.random() * Math.PI * 2;
        const rr = rad * (0.45 + Math.random() * 0.55);
        sx[k] = W / 2 + Math.cos(ang) * rr;
        sy[k] = H / 2 + Math.sin(ang) * rr;
        dl[k] = Math.random() * 0.5;
        rs[k] = 0.6 + Math.random() * 0.8;
        const t = clamp01((pts[k].L - 0.18) / 0.72);
        cols[k] = BLUES[Math.min(BLUES.length - 1, Math.floor(t * BLUES.length))];
      }
    };

    let progress = 0, target = 0, visible = true, raf = 0;
    const computeTarget = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      target = clamp01((vh - r.top) / (vh * 0.72));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (n === 0) { raf = requestAnimationFrame(draw); return; }
      progress += (target - progress) * 0.08;
      const p = reduce ? 1 : progress;
      for (let k = 0; k < n; k++) {
        const lp = clamp01((p - dl[k] * 0.4) / (1 - dl[k] * 0.4));
        const e = ease(lp);
        const x = sx[k] + (tx[k] - sx[k]) * e;
        const y = sy[k] + (ty[k] - sy[k]) * e;
        ctx.globalAlpha = 0.1 + e * 0.9;
        ctx.fillStyle = cols[k];
        const s = psize * rs[k];
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onScroll = () => computeTarget();
    const onResize = () => { size(); build(); computeTarget(); };

    img.onload = () => { size(); build(); computeTarget(); };
    img.src = src;

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
      if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '120px' });
    io.observe(host);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [src, maxParticles]);

  return (
    <div ref={wrap} className={`relative ${className}`} aria-hidden>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
