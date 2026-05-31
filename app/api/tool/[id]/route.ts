import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 86400;

// Same-origin proxy for Carl-Ras (Digizuite) product images. Renditions on the
// public CDN (unsigned):
//   50391 = PNG, transparent background, 800px  ← clean cut-out, preferred
//   50384 = JPG 800px · 50383 = JPG 1600px · 50388 = 280px
// We always try the transparent PNG first so cards / hero / particles get a real
// cut-out (no white box, no knockout needed). The handful of assets without a
// transparent rendition fall back to the JPG (client-side KnockoutImage then
// handles those).
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
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
};

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
  if (!id) return new Response(BLANK, { headers: { ...CORS, 'Content-Type': 'image/png' } });

  const reqF = (req.nextUrl.searchParams.get('f') || '').replace(/[^0-9]/g, '');
  // transparent PNG first, then whatever was explicitly asked for, then JPG 800.
  const order = [...new Set([TRANSPARENT, reqF, JPG_800].filter(Boolean))];

  for (const f of order) {
    const r = await grab(id, f);
    if (r) return new Response(r.buf, { headers: { ...CORS, 'Content-Type': r.ct } });
  }
  return new Response(BLANK, { headers: { ...CORS, 'Content-Type': 'image/png' } });
}
