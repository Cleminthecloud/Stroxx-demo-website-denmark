'use client';
import { useEffect, useRef } from 'react';

/** Interactive particle image-reveal. Samples a (white-background) product
 *  photo, drops the white, and turns the remaining pixels into a cloud of
 *  blue particles that assemble into the product as the element scrolls into
 *  view. The particles are alive: each has its own spring stiffness and drag
 *  (speed variation), a gentle gravity, and a perpetual idle wander so a few
 *  always drift. The cursor repels nearby particles — they scatter, then
 *  spring back and realign. All particles are STROXX-blue shades, tinted by
 *  the source pixel's luminance. */

// Floor kept bright enough that even near-black product pixels read on the
// dark stage (deep navy disappeared against the background). Brightened so the
// assembled product pops on the page instead of sitting dull.
const BLUES = ['#2C7FC0', '#1E8FD5', '#0098E8', '#4FA8EE', '#8FC6F4', '#D2E8FC'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const GRAV = 0.016;   // gentle downward pull
const MR = 140;       // cursor influence radius (px) — big enough to read on large screens
const MF = 3.1;       // cursor repulsion strength
const BLEED = 120;    // canvas overdraw beyond the host on every side, so scattered /
                      // wandering / repelled particles never clip at an invisible edge

export default function ParticleImage({
  src,
  className = '',
  maxParticles = 8200,
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

    let W = 0, H = 0, n = 0, dot = 1.4;
    let px!: Float32Array, py!: Float32Array, vx!: Float32Array, vy!: Float32Array;
    let ox!: Float32Array, oy!: Float32Array, ix!: Float32Array, iy!: Float32Array;
    let kk!: Float32Array, dr!: Float32Array, wa!: Float32Array, ws!: Float32Array, wp!: Float32Array, sz!: Float32Array;
    let gl!: Uint8Array; // highlight particles that carry a soft glow halo
    let cols: string[] = [];

    const size = () => {
      // canvas covers the host PLUS a bleed ring — W/H are canvas dims
      W = host.clientWidth + BLEED * 2; H = host.clientHeight + BLEED * 2;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    let built = false;
    const build = () => {
      if (!W || !H || !img.complete || !img.naturalWidth) return;
      const ar = img.naturalWidth / img.naturalHeight || 1;
      // finer source sampling → more candidate pixels → denser, sharper product
      // (capped by maxParticles; real detail ceiling rises with image quality)
      const OW = 340, OH = Math.max(1, Math.round(OW / ar));
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
      const total = cand.length / 3;
      if (total === 0) return;
      const stride = total > maxParticles ? Math.ceil(total / maxParticles) : 1;

      const bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
      // product size tracks the HOST box, not the padded canvas
      const scale = Math.min(((W - BLEED * 2) * 0.64) / bw, ((H - BLEED * 2) * 0.64) / bh);
      const bcx = (minX + maxX) / 2, bcy = (minY + maxY) / 2;
      dot = Math.max(1, scale * 0.46);

      const idxs: number[] = [];
      for (let k = 0; k < total; k += stride) idxs.push(k);
      n = idxs.length;
      px = new Float32Array(n); py = new Float32Array(n);
      vx = new Float32Array(n); vy = new Float32Array(n);
      ox = new Float32Array(n); oy = new Float32Array(n);
      ix = new Float32Array(n); iy = new Float32Array(n);
      kk = new Float32Array(n); dr = new Float32Array(n);
      wa = new Float32Array(n); ws = new Float32Array(n); wp = new Float32Array(n); sz = new Float32Array(n);
      gl = new Uint8Array(n);
      cols = new Array(n);

      for (let m = 0; m < n; m++) {
        const idx = idxs[m] * 3;
        const sxp = cand[idx], syp = cand[idx + 1], L = cand[idx + 2] / 255;
        ix[m] = W / 2 + (sxp - bcx) * scale;
        iy[m] = H / 2 + (syp - bcy) * scale;
        // scatter origins spread across the whole frame (never clipped at an edge)
        ox[m] = Math.random() * W;
        oy[m] = Math.random() * H;
        px[m] = ox[m]; py[m] = oy[m];
        const free = Math.random() < 0.26;          // perpetual free-floaters drifting around
        kk[m] = free ? 0.0035 : 0.011 + Math.random() * 0.035;  // spring + speed variation
        dr[m] = 0.80 + Math.random() * 0.10;        // per-particle drag
        wa[m] = free ? 5 + Math.random() * 12 : 0.3 + Math.random() * 1.5; // wander amplitude
        ws[m] = 0.4 + Math.random() * 1.8;          // wander speed
        wp[m] = Math.random() * Math.PI * 2;
        sz[m] = 0.7 + Math.random() * 0.55;
        // gamma lift so midtones land on brighter blues, not the dark floor
        const t = Math.pow(clamp01((L - 0.05) / 0.7), 0.7);
        const ci = Math.min(BLUES.length - 1, Math.floor(t * BLUES.length));
        cols[m] = BLUES[ci];
        // a fraction of the brightest pixels become "light carriers": they get
        // a soft halo so the assembled product reads lit from within
        gl[m] = ci >= 3 && Math.random() < 0.55 ? 1 : 0;
      }
      built = true;
    };

    // cursor tracking (window-level; canvas is pointer-events-none)
    let cliX = -1e5, cliY = -1e5;
    const onPointer = (e: PointerEvent) => { cliX = e.clientX; cliY = e.clientY; };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let progress = 0, target = 0, raf = 0;
    const computeTarget = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      // Assemble FAST and EARLY: starts the moment the frame peeks in, and is
      // fully formed by the time its top reaches the middle of the viewport
      // (~60% of the way through the entry) so the finished product is on
      // screen well before the user scrolls past it.
      const travel = (vh - r.top) / vh;           // 0 = just entering at bottom, 1 = top at top
      target = clamp01((travel - 0.05) / 0.45);   // p=1 when top hits ~0.5·vh
    };

    const t0 = performance.now();
    const draw = (now: number) => {
      // build once, retrying each frame until the element has a real size +
      // the image has decoded (never rebuild after — that would re-scatter)
      if (!built) { size(); build(); computeTarget(); }
      ctx.clearRect(0, 0, W, H);
      if (n === 0) { raf = requestAnimationFrame(draw); return; }
      const t = (now - t0) / 1000;
      progress += (target - progress) * 0.085;
      const p = reduce ? 1 : progress;

      // cursor in canvas-local space (null when far outside the frame)
      const r = host.getBoundingClientRect();
      let mx = cliX - r.left + BLEED, my = cliY - r.top + BLEED;
      const hasM = !reduce && mx > -MR && mx < W + MR && my > -MR && my < H + MR;

      for (let m = 0; m < n; m++) {
        const asx = ox[m] + (ix[m] - ox[m]) * p;
        const asy = oy[m] + (iy[m] - oy[m]) * p;
        let tx = asx, ty = asy;
        if (!reduce) {
          tx += Math.cos(t * ws[m] + wp[m]) * wa[m];
          ty += Math.sin(t * ws[m] * 1.27 + wp[m]) * wa[m];
        }
        let ax = (tx - px[m]) * kk[m];
        let ay = (ty - py[m]) * kk[m];
        if (!reduce) ay += GRAV;
        if (hasM) {
          const ddx = px[m] - mx, ddy = py[m] - my;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < MR * MR) {
            const d = Math.sqrt(d2) + 0.01;
            const f = MF * (1 - d / MR);
            ax += (ddx / d) * f;
            ay += (ddy / d) * f;
          }
        }
        vx[m] = (vx[m] + ax) * dr[m];
        vy[m] = (vy[m] + ay) * dr[m];
        px[m] += vx[m];
        py[m] += vy[m];

        ctx.fillStyle = cols[m];
        const s = dot * sz[m];
        // gentle twinkle: each particle breathes on its own wander clock, so
        // the formed product shimmers like dust in light instead of sitting flat
        const tw = reduce ? 1 : 0.88 + 0.12 * Math.sin(t * ws[m] * 1.9 + wp[m] * 3.1);
        const base = Math.min(1, (0.16 + p * 0.95) * tw);

        // fast particles (scatter, cursor repulsion) leave a brief comet tail —
        // two fading ghosts along the velocity, so movement reads as motion
        const sp2 = vx[m] * vx[m] + vy[m] * vy[m];
        if (sp2 > 5 && !reduce) {
          ctx.globalAlpha = base * 0.32;
          ctx.fillRect(px[m] - vx[m] * 1.6 - s / 2, py[m] - vy[m] * 1.6 - s / 2, s, s);
          ctx.globalAlpha = base * 0.6;
          ctx.fillRect(px[m] - vx[m] * 0.8 - s / 2, py[m] - vy[m] * 0.8 - s / 2, s, s);
        }

        // halo on the light-carrier particles: one larger, faint square under
        // the core — cheap bloom that lets highlights glow on the dark stage
        if (gl[m]) {
          ctx.globalAlpha = base * 0.22;
          const hs = s * 3.4;
          ctx.fillRect(px[m] - hs / 2, py[m] - hs / 2, hs, hs);
        }

        ctx.globalAlpha = base;
        ctx.fillRect(px[m] - s / 2, py[m] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onScroll = () => computeTarget();
    // on a real resize, rebuild ONCE for the new size (built flag gates it)
    const onResize = () => { built = false; size(); computeTarget(); };
    // Load with retries: the image proxy can hand back its 1x1 BLANK fallback
    // on a cold upstream miss, which yields zero product pixels. Each attempt
    // uses a distinct cache key — also keeps the CORS read from colliding with
    // the plain <img> (no-crossorigin) cache entry the product cards create.
    let tries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const load = () => { tries++; img.src = src + (src.includes('?') ? '&' : '?') + 'pr=' + tries; };
    img.onload = () => {
      size(); build(); computeTarget();
      if (!built && tries < 6) retryTimer = setTimeout(load, 350);
    };
    img.onerror = () => { if (tries < 6) retryTimer = setTimeout(load, 350); };
    load();

    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !raf) raf = requestAnimationFrame(draw);
      if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '120px' });
    io.observe(host);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(retryTimer);
      img.onload = null; img.onerror = null;
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [src, maxParticles]);

  return (
    <div ref={wrap} className={`relative ${className}`} aria-hidden>
      <canvas
        ref={canvas}
        className="pointer-events-none absolute"
        style={{ inset: -BLEED, width: `calc(100% + ${BLEED * 2}px)`, height: `calc(100% + ${BLEED * 2}px)` }}
      />
    </div>
  );
}
