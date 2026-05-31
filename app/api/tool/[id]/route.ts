import { NextRequest } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const revalidate = 86400;

// Same-origin proxy for Carl-Ras product images that ALSO knocks the white
// studio background out server-side, at full resolution, so cards / hero /
// particle sampler all receive a clean transparent PNG (no teal panels, no
// rectangular particle clouds). The Digizuite "format" id controls resolution:
// 50388 = 280px, 50384 = 800px, 50383 = 1600px.
const FORMATS: Record<string, string> = { '50388': '50388', '50384': '50384', '50383': '50383' };
const SRC = (id: string, f: string) =>
  `https://images.carl-ras.dk/digizuitecore/LegacyService/api/assetstream/${id}/${f}`;

const BLANK = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
};

// ——— flood-fill background knockout on a raw RGBA buffer (mutates d) ———
// Returns true if it produced a usable cut-out, false if it bailed (caller then
// serves the original untouched, so an image is never broken).
function knockout(d: Buffer | Uint8ClampedArray, W: number, H: number): boolean {
  const N = W * H;
  const patch = (x0: number, y0: number) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y0 + 6 && y < H; y++)
      for (let x = x0; x < x0 + 6 && x < W; x++) { const i = (y * W + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    return n ? [r / n, g / n, b / n] : [255, 255, 255];
  };
  const corners = [patch(0, 0), patch(W - 6, 0), patch(0, H - 6), patch(W - 6, H - 6)];
  const lum = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  const sat = (c: number[]) => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
  const light = corners.filter((c) => lum(c) > 172 && sat(c) < 0.2);
  if (light.length < 2) return false; // not a light studio bg → leave intact
  const bg = [0, 1, 2].map((k) => light.reduce((s, c) => s + c[k], 0) / light.length);
  const dist = (i: number) => Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
  const NEAR = 68, STEP = 34;

  const removed = new Uint8Array(N);
  const stack = new Int32Array(N);
  let sp = 0;
  const seed = (p: number) => { if (!removed[p] && dist(p * 4) < NEAR) { removed[p] = 1; stack[sp++] = p; } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (sp) {
    const p = stack[--sp], px = p % W, py = (p / W) | 0, pi = p * 4;
    const tryN = (q: number, qi: number) => {
      if (removed[q]) return;
      if (dist(qi) < NEAR || (Math.abs(d[qi] - d[pi]) + Math.abs(d[qi + 1] - d[pi + 1]) + Math.abs(d[qi + 2] - d[pi + 2])) < STEP) { removed[q] = 1; stack[sp++] = q; }
    };
    if (px > 0) tryN(p - 1, pi - 4);
    if (px < W - 1) tryN(p + 1, pi + 4);
    if (py > 0) tryN(p - W, pi - W * 4);
    if (py < H - 1) tryN(p + W, pi + W * 4);
  }
  let rc = 0;
  for (let p = 0; p < N; p++) if (removed[p]) rc++;

  if (rc < N * 0.03 || rc > N * 0.95) {
    // degenerate (e.g. silver product the fill bridged into) → conservative
    // distance removal that keeps the product and only clears clear background
    const FAR = NEAR + 40; let cleared = 0;
    for (let p = 0; p < N; p++) {
      const i = p * 4, dd = dist(i);
      if (dd >= FAR) continue;
      const f = Math.min(1, Math.max(0, (FAR - dd) / 46));
      d[i] = Math.max(0, Math.min(255, (d[i] - bg[0] * f) / (1 - f * 0.85)));
      d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bg[1] * f) / (1 - f * 0.85)));
      d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bg[2] * f) / (1 - f * 0.85)));
      d[i + 3] = Math.round(d[i + 3] * (1 - f));
      if (d[i + 3] < 12) cleared++;
    }
    return cleared >= N * 0.02;
  }

  // apply flood result + un-matte the kept rim + feather
  for (let p = 0; p < N; p++) {
    const i = p * 4;
    if (removed[p]) { d[i + 3] = 0; continue; }
    const px = p % W, py = (p / W) | 0;
    const edge = (px > 0 && removed[p - 1]) || (px < W - 1 && removed[p + 1]) || (py > 0 && removed[p - W]) || (py < H - 1 && removed[p + W]);
    if (edge) {
      const dd = dist(i);
      if (dd < NEAR * 1.7) {
        const f = 1 - dd / (NEAR * 1.7);
        d[i] = Math.max(0, Math.min(255, (d[i] - bg[0] * f) / (1 - f * 0.85)));
        d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bg[1] * f) / (1 - f * 0.85)));
        d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bg[2] * f) / (1 - f * 0.85)));
        d[i + 3] = Math.round(d[i + 3] * (1 - f * 0.6));
      }
    }
  }
  const aSrc = new Uint8ClampedArray(N);
  for (let p = 0, q = 3; p < N; p++, q += 4) aSrc[p] = d[q];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const idx = y * W + x, av = aSrc[idx];
      if (av < 30) continue;
      const up = y > 0 ? aSrc[idx - W] : 0, dn = y < H - 1 ? aSrc[idx + W] : 0, lf = x > 0 ? aSrc[idx - 1] : 0, rt = x < W - 1 ? aSrc[idx + 1] : 0;
      if (Math.min(up, dn, lf, rt) < 24) d[idx * 4 + 3] = Math.round(av * 0.55);
    }
  return true;
}

async function cutout(buf: Buffer): Promise<Buffer | null> {
  try {
    const base = sharp(buf, { failOn: 'none' }).resize(1200, null, { withoutEnlargement: true }).ensureAlpha();
    const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
    if (info.channels !== 4) return null;
    const ok = knockout(data, info.width, info.height);
    if (!ok) return null;
    return await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id.replace(/[^0-9]/g, '');
  const f = FORMATS[req.nextUrl.searchParams.get('f') || ''] || '50384';
  if (!id) return new Response(BLANK, { headers: { ...CORS, 'Content-Type': 'image/png' } });

  try {
    const res = await fetch(SRC(id, f), {
      headers: { Referer: 'https://www.carl-ras.dk/', 'User-Agent': 'Mozilla/5.0 STROXX-brandsite' },
      cache: 'force-cache',
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.startsWith('image/')) {
      const buf = Buffer.from(await res.arrayBuffer());
      const cut = await cutout(buf); // transparent PNG, or null if it bailed
      if (cut) return new Response(cut, { headers: { ...CORS, 'Content-Type': 'image/png' } });
      return new Response(buf, { headers: { ...CORS, 'Content-Type': ct } });
    }
  } catch {
    /* fall through */
  }
  return new Response(BLANK, { headers: { ...CORS, 'Content-Type': 'image/png' } });
}
