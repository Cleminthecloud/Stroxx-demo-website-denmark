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
      if (!w || !h || w < 8 || h < 8) return false; // BLANK/1x1 proxy fallback → retry
      const cap = maxSize;
      const sc = Math.min(1, cap / Math.max(w, h));
      const cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
      cv.width = cw; cv.height = ch;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      let data: ImageData;
      try { data = ctx.getImageData(0, 0, cw, ch); } catch { return false; }
      const d = data.data;
      const N = cw * ch;

      // ——— sample the studio background colour from the four corners ———
      const patch = (x0: number, y0: number) => {
        let r = 0, g = 0, b = 0, n = 0;
        for (let y = y0; y < y0 + 6 && y < ch; y++)
          for (let x = x0; x < x0 + 6 && x < cw; x++) {
            const i = (y * cw + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
          }
        return n ? [r / n, g / n, b / n] : [255, 255, 255];
      };
      const corners = [patch(0, 0), patch(cw - 6, 0), patch(0, ch - 6), patch(cw - 6, ch - 6)];
      const lumOf = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
      const satOf = (c: number[]) => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
      // Decide "is this a light studio shot?" from the LIGHT corners only — a soft
      // drop-shadow darkening one or two corners must NOT veto the knockout. We
      // sample the background from the clean (light, neutral) corners and let the
      // flood-fill walk into the shadow gradient from there.
      const light = corners.filter((c) => lumOf(c) > 172 && satOf(c) < 0.2);
      if (light.length < 2) { return true; } // genuinely dark/colour bg → leave intact
      const bg = [0, 1, 2].map((k) => light.reduce((s, c) => s + c[k], 0) / light.length);

      const dist = (i: number) => Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
      const NEAR = 68;   // L1 colour distance counted as "this is background"
      const STEP = 34;   // gradient-following tolerance vs. an already-filled neighbour

      // ——— flood-fill the background inward from every border pixel ———
      const removed = new Uint8Array(N);
      const stack: number[] = [];
      const seed = (p: number) => { if (!removed[p] && dist(p * 4) < NEAR) { removed[p] = 1; stack.push(p); } };
      for (let x = 0; x < cw; x++) { seed(x); seed((ch - 1) * cw + x); }
      for (let y = 0; y < ch; y++) { seed(y * cw); seed(y * cw + cw - 1); }
      while (stack.length) {
        const p = stack.pop()!;
        const px = p % cw, py = (p / cw) | 0, pi = p * 4;
        const tryN = (q: number, qi: number) => {
          if (removed[q]) return;
          // background if close to the global bg colour, or a small step from a
          // filled neighbour (so soft gradients keep getting eaten)
          if (dist(qi) < NEAR || (Math.abs(d[qi] - d[pi]) + Math.abs(d[qi + 1] - d[pi + 1]) + Math.abs(d[qi + 2] - d[pi + 2])) < STEP) {
            removed[q] = 1; stack.push(q);
          }
        };
        if (px > 0) tryN(p - 1, pi - 4);
        if (px < cw - 1) tryN(p + 1, pi + 4);
        if (py > 0) tryN(p - cw, pi - cw * 4);
        if (py < ch - 1) tryN(p + cw, pi + cw * 4);
      }

      let removedCount = 0;
      for (let p = 0; p < N; p++) if (removed[p]) removedCount++;

      // If the flood-fill is degenerate — it removed almost nothing, or it
      // bridged a shadow gradient into a pale product and ate (almost) the whole
      // frame — fall back to a CONSERVATIVE background-distance removal. That
      // only clears pixels close to the sampled backdrop colour, so a light /
      // silver / white product is preserved (it just keeps a soft shadow) — far
      // better than leaving a white box.
      if (removedCount < N * 0.03 || removedCount > N * 0.95) {
        const FAR = NEAR + 40;
        let cleared = 0;
        for (let p = 0; p < N; p++) {
          const i = p * 4;
          const dd = dist(i);
          if (dd >= FAR) continue;
          const f = Math.min(1, Math.max(0, (FAR - dd) / 46)); // 1 = looks like bg
          // un-matte the partial pixels so there's no white fringe
          d[i] = Math.max(0, Math.min(255, (d[i] - bg[0] * f) / (1 - f * 0.85)));
          d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bg[1] * f) / (1 - f * 0.85)));
          d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bg[2] * f) / (1 - f * 0.85)));
          d[i + 3] = Math.round(d[i + 3] * (1 - f));
          if (d[i + 3] < 12) cleared++;
        }
        if (cleared < N * 0.02) return false; // truly nothing to do (e.g. BLANK) → retry
        ctx.putImageData(data, 0, 0);
        return true;
      }

      // apply: removed → transparent; un-matte + soften the kept rim so the
      // silhouette has no bright background fringe
      for (let p = 0; p < N; p++) {
        const i = p * 4;
        if (removed[p]) { d[i + 3] = 0; continue; }
        // is this kept pixel touching a removed one? then it's a rim pixel
        const px = p % cw, py = (p / cw) | 0;
        const edge =
          (px > 0 && removed[p - 1]) || (px < cw - 1 && removed[p + 1]) ||
          (py > 0 && removed[p - cw]) || (py < ch - 1 && removed[p + cw]);
        if (edge) {
          const dd = dist(i);
          if (dd < NEAR * 1.7) {
            const f = 1 - dd / (NEAR * 1.7);   // 1 = looks like bg → pull it out
            d[i] = Math.max(0, Math.min(255, (d[i] - bg[0] * f) / (1 - f * 0.85)));
            d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bg[1] * f) / (1 - f * 0.85)));
            d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bg[2] * f) / (1 - f * 0.85)));
            d[i + 3] = Math.round(d[i + 3] * (1 - f * 0.6));
          }
        }
      }

      // feather: soften any remaining pixel that borders transparency
      const aSrc = new Uint8ClampedArray(N);
      for (let p = 0, q = 3; p < N; p++, q += 4) aSrc[p] = d[q];
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const idx = y * cw + x;
          const av = aSrc[idx];
          if (av < 30) continue;
          const up = y > 0 ? aSrc[idx - cw] : 0, dn = y < ch - 1 ? aSrc[idx + cw] : 0;
          const lf = x > 0 ? aSrc[idx - 1] : 0, rt = x < cw - 1 ? aSrc[idx + 1] : 0;
          if (Math.min(up, dn, lf, rt) < 24) d[idx * 4 + 3] = Math.round(av * 0.55);
        }
      }
      ctx.putImageData(data, 0, 0);
      return true;
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () => { tries++; img.src = src + (src.includes('?') ? '&' : '?') + 'ko=' + tries; };
    img.onload = () => { done = process(); if (!done && tries < 6) timer = setTimeout(load, 350); };
    img.onerror = () => { if (tries < 6) timer = setTimeout(load, 350); };
    load();

    return () => { clearTimeout(timer); img.onload = null; img.onerror = null; };
  }, [src, maxSize]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={alt}
      // drop-shadow only on desktop: iOS Safari rasterises large filtered
      // layers as opaque white rectangles when GPU memory runs out.
      className={`${className} lg:drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]`}
      style={{ objectFit: 'contain' }}
    />
  );
}
