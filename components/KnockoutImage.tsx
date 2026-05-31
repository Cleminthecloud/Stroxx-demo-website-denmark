'use client';
import { useEffect, useRef } from 'react';

/** Renders a product photo with its white studio background knocked out on a
 *  canvas, so the product floats on the dark glass card (no white box). Soft
 *  alpha on near-white/low-saturation pixels avoids a hard fringe. Loads via a
 *  distinct cache key with retries — the image proxy can hand back a 1x1 BLANK
 *  on a cold miss, and a plain <img> elsewhere can otherwise taint the read. */
export default function KnockoutImage({
  src,
  alt = '',
  className = '',
  maxSize = 640,
}: {
  src: string;
  alt?: string;
  className?: string;
  maxSize?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let tries = 0;
    let done = false;

    const process = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return false;
      const cap = maxSize;
      const sc = Math.min(1, cap / Math.max(w, h));
      const cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
      cv.width = cw; cv.height = ch;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      let data: ImageData;
      try { data = ctx.getImageData(0, 0, cw, ch); } catch { return false; }
      const d = data.data;
      let kept = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const sat = (mx - mn) / 255;
        // 0 = keep, 1 = fully transparent (bright + desaturated = white studio bg)
        const white = Math.max(0, Math.min(1, (lum - 205) / 42)) * (1 - Math.min(1, sat / 0.15));
        let a = d[i + 3] * (1 - white);
        if (a < 105 && white > 0.25) a = 0;         // eat the bright halo/outline ring
        if (white > 0 && a > 0) {                    // un-matte: pull white tint out of the edge
          const wf = white * 0.7;
          d[i] = Math.max(0, Math.min(255, (r - 255 * wf) / (1 - wf)));
          d[i + 1] = Math.max(0, Math.min(255, (g - 255 * wf) / (1 - wf)));
          d[i + 2] = Math.max(0, Math.min(255, (b - 255 * wf) / (1 - wf)));
        }
        a = Math.round(a);
        d[i + 3] = a;
        if (a > 12) kept++;
      }
      if (kept < 40) return false; // degenerate / BLANK fallback
      // feather the silhouette: soften any pixel bordering transparency so the
      // cut-out has no hard marching-ants outline
      const src = new Uint8ClampedArray(cw * ch);
      for (let p = 0, q = 3; p < cw * ch; p++, q += 4) src[p] = d[q];
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const idx = y * cw + x;
          const av = src[idx];
          if (av < 30) continue;
          const up = y > 0 ? src[idx - cw] : 0, dn = y < ch - 1 ? src[idx + cw] : 0;
          const lf = x > 0 ? src[idx - 1] : 0, rt = x < cw - 1 ? src[idx + 1] : 0;
          if (Math.min(up, dn, lf, rt) < 24) d[idx * 4 + 3] = Math.round(av * 0.5);
        }
      }
      ctx.putImageData(data, 0, 0);
      return true;
    };

    const load = () => { tries++; img.src = src + (src.includes('?') ? '&' : '?') + 'ko=' + tries; };
    img.onload = () => { done = process(); if (!done && tries < 6) setTimeout(load, 350); };
    img.onerror = () => { if (tries < 6) setTimeout(load, 350); };
    load();

    return () => { img.onload = null; img.onerror = null; };
  }, [src, maxSize]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={alt}
      className={className}
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.5))' }}
    />
  );
}
