import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 86400;

// Same-origin proxy for Carl-Ras (Digizuite) product images.
//
//   50391 = PNG, transparent background, 800px  ← preferred
//   50384 = JPG 800px · 50383 = JPG 1600px · 50388 = 280px
//
// Some assets' 50391 rendition is NOT actually transparent (white or dark studio
// background baked in), and a handful of assets only exist as white-studio JPGs.
// Those used to rely on a client-side canvas knockout, which proved fragile on
// iOS Safari (raw white boxes on phones). So the knockout now happens HERE,
// once, with sharp: if the corners read as a white studio backdrop we flood-fill
// the background away and serve a true transparent PNG. sharp is loaded lazily
// and guarded — if it isn't available (e.g. some local dev setups) we serve the
// image untouched, which is exactly the previous behaviour.
const TRANSPARENT = '50391';
const JPG_800 = '50384';
const SRC = (id: string, f: string) =>
  `https://images.carl-ras.dk/digizuitecore/LegacyService/api/assetstream/${id}/${f}`;
const HEADERS = { Referer: 'https://www.carl-ras.dk/', 'User-Agent': 'Mozilla/5.0 STROXX-brandsite' };

// 1x1 transparent PNG fallback.
const BLANK = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
const CORS = { 'Access-Control-Allow-Origin': '*' };
const CACHE_LONG = 'public, max-age=86400, s-maxage=86400';
const CACHE_SHORT = 'public, max-age=0, s-maxage=3600'; // fallback states — let them heal
const CACHE_BLANK = 'public, max-age=0, s-maxage=60';   // upstream failure — heal fast

let sharpMod: any | null = null;
let sharpTried = false;
async function getSharp() {
  if (!sharpTried) {
    sharpTried = true;
    try { sharpMod = (await import('sharp')).default; } catch { sharpMod = null; }
  }
  return sharpMod;
}

/** Flood-fill white-studio knockout on raw RGBA. Mutates alpha in place.
 *  Returns false (and leaves pixels untouched) unless this clearly is a light
 *  studio shot and the fill removed a sane amount of background. */
function knockoutRaw(d: Uint8Array, W: number, H: number): boolean {
  const N = W * H;
  const patch = (x0: number, y0: number) => {
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let y = y0; y < y0 + 5 && y < H; y++)
      for (let x = x0; x < x0 + 5 && x < W; x++) {
        const i = (y * W + x) * 4;
        r += d[i]; g += d[i + 1]; b += d[i + 2]; a += d[i + 3]; n++;
      }
    return [r / n, g / n, b / n, a / n];
  };
  const corners = [patch(0, 0), patch(W - 5, 0), patch(0, H - 5), patch(W - 5, H - 5)];
  const lum = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  const sat = (c: number[]) => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
  const light = corners.filter((c) => c[3] > 200 && lum(c) > 196 && sat(c) < 0.14);
  if (light.length < 3) return false; // not a white-studio backdrop → leave intact

  const bg = [0, 1, 2].map((k) => light.reduce((s, c) => s + c[k], 0) / light.length);
  const dist = (i: number) => Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
  const NEAR = 68, STEP = 34;

  const removed = new Uint8Array(N);
  const stack: number[] = [];
  const seed = (p: number) => { if (!removed[p] && dist(p * 4) < NEAR) { removed[p] = 1; stack.push(p); } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (stack.length) {
    const p = stack.pop()!;
    const px = p % W, py = (p / W) | 0, pi = p * 4;
    const tryN = (q: number, qi: number) => {
      if (removed[q]) return;
      if (dist(qi) < NEAR ||
        (Math.abs(d[qi] - d[pi]) + Math.abs(d[qi + 1] - d[pi + 1]) + Math.abs(d[qi + 2] - d[pi + 2])) < STEP) {
        removed[q] = 1; stack.push(q);
      }
    };
    if (px > 0) tryN(p - 1, pi - 4);
    if (px < W - 1) tryN(p + 1, pi + 4);
    if (py > 0) tryN(p - W, pi - W * 4);
    if (py < H - 1) tryN(p + W, pi + W * 4);
  }

  let removedCount = 0;
  for (let p = 0; p < N; p++) if (removed[p]) removedCount++;
  if (removedCount < N * 0.03 || removedCount > N * 0.97) {
    // Degenerate flood — either a tiny product in a huge white field (fill
    // removed "too much") or a pale product the fill bridged into. Fall back to
    // a CONSERVATIVE distance-only clear: only pixels close to the backdrop
    // colour go transparent, so a pale product keeps its body and a tiny
    // product still loses its white field.
    const FAR = NEAR + 40;
    let cleared = 0;
    for (let p = 0; p < N; p++) {
      const i = p * 4;
      const dd = dist(i);
      if (dd >= FAR) continue;
      const f = Math.min(1, Math.max(0, (FAR - dd) / 46)); // 1 = looks like backdrop
      d[i] = Math.max(0, Math.min(255, (d[i] - bg[0] * f) / (1 - f * 0.85)));
      d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bg[1] * f) / (1 - f * 0.85)));
      d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bg[2] * f) / (1 - f * 0.85)));
      d[i + 3] = Math.round(d[i + 3] * (1 - f));
      if (d[i + 3] < 12) cleared++;
    }
    return cleared >= N * 0.02; // nothing meaningful cleared → leave intact
  }

  // apply + soften the rim so the silhouette has no bright fringe
  for (let p = 0; p < N; p++) {
    const i = p * 4;
    if (removed[p]) { d[i + 3] = 0; continue; }
    const px = p % W, py = (p / W) | 0;
    const edge =
      (px > 0 && removed[p - 1]) || (px < W - 1 && removed[p + 1]) ||
      (py > 0 && removed[p - W]) || (py < H - 1 && removed[p + W]);
    if (edge) {
      const dd = dist(i);
      if (dd < NEAR * 1.7) {
        const f = 1 - dd / (NEAR * 1.7); // 1 = looks like background → pull it out
        d[i] = Math.max(0, Math.min(255, (d[i] - bg[0] * f) / (1 - f * 0.85)));
        d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - bg[1] * f) / (1 - f * 0.85)));
        d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - bg[2] * f) / (1 - f * 0.85)));
        d[i + 3] = Math.round(d[i + 3] * (1 - f * 0.6));
      }
    }
  }
  return true;
}

/** If the buffer is a light-studio shot, return it as a knocked-out PNG. */
async function tryKnockout(buf: Buffer): Promise<Buffer | null> {
  const sharp = await getSharp();
  if (!sharp) return null;
  try {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (info.channels !== 4 || info.width < 8 || info.height < 8) return null;
    if (!knockoutRaw(data, info.width, info.height)) return null;
    return await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png({ compressionLevel: 8 }).toBuffer();
  } catch {
    return null;
  }
}

async function grab(id: string, f: string): Promise<{ buf: Buffer; ct: string } | null> {
  try {
    const res = await fetch(SRC(id, f), { headers: HEADERS, cache: 'force-cache' });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.startsWith('image/')) {
      const buf = Buffer.from(await res.arrayBuffer());
      // ignore the ~1x1 placeholder the CDN returns when a rendition is missing
      if (buf.byteLength > 800) return { buf, ct };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id.replace(/[^0-9]/g, '');
  if (!id) return new Response(BLANK, { headers: { ...CORS, 'Cache-Control': CACHE_BLANK, 'Content-Type': 'image/png' } });

  const reqF = (req.nextUrl.searchParams.get('f') || '').replace(/[^0-9]/g, '');
  // transparent PNG first, then whatever was explicitly asked for, then JPG 800.
  const order = [...new Set([TRANSPARENT, reqF, JPG_800].filter(Boolean))];

  for (const f of order) {
    const r = await grab(id, f);
    if (!r) continue;
    // If it's secretly a white-studio shot (an opaque "transparent" rendition,
    // or a JPG fallback), knock the background out here so every device gets a
    // clean cut-out with zero client-side canvas work.
    const knocked = await tryKnockout(r.buf);
    if (knocked) {
      return new Response(knocked, { headers: { ...CORS, 'Cache-Control': CACHE_LONG, 'Content-Type': 'image/png' } });
    }
    // Untouched pass-through. Genuinely transparent PNGs are the stable happy
    // path (long cache); a raw JPG fallback gets a short cache so a transient
    // upstream failure can't pin a white image at the edge for a day.
    const isPng = r.ct.includes('png');
    return new Response(r.buf, {
      headers: { ...CORS, 'Cache-Control': isPng ? CACHE_LONG : CACHE_SHORT, 'Content-Type': r.ct },
    });
  }
  return new Response(BLANK, { headers: { ...CORS, 'Cache-Control': CACHE_BLANK, 'Content-Type': 'image/png' } });
}
