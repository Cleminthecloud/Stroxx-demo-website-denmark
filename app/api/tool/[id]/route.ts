import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 86400;

// Same-origin proxy for Carl-Ras product images so they can be used as WebGL
// textures (cross-origin CDN blocks canvas/texture reads). No native deps —
// the white-background knockout happens on the GPU in the shader.
const SRC = (id: string) =>
  `https://images.carl-ras.dk/digizuitecore/LegacyService/api/assetstream/${id}/50388`;

// 1x1 transparent PNG — guarantees the loader always gets a decodable image.
const BLANK = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id.replace(/[^0-9]/g, '');
  if (!id) return new Response(BLANK, { headers: { ...CORS, 'Content-Type': 'image/png' } });

  try {
    const res = await fetch(SRC(id), {
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
