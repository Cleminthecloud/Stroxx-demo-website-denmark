import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 86400;

// Same-origin proxy for Carl-Ras product images so they can be read on a canvas
// (the cross-origin CDN blocks canvas reads). Knockout happens client-side in
// KnockoutImage / ParticleImage. The Digizuite "format" id controls resolution:
// 50388 = 280px, 50384 = 800px, 50383 = 1600px. Default 800.
const FORMATS: Record<string, string> = { '50388': '50388', '50384': '50384', '50383': '50383' };
const SRC = (id: string, f: string) =>
  `https://images.carl-ras.dk/digizuitecore/LegacyService/api/assetstream/${id}/${f}`;

// 1x1 transparent PNG fallback so the loader always gets a decodable image.
const BLANK = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
};

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
      return new Response(buf, { headers: { ...CORS, 'Content-Type': ct } });
    }
  } catch {
    /* fall through */
  }
  return new Response(BLANK, { headers: { ...CORS, 'Content-Type': 'image/png' } });
}
