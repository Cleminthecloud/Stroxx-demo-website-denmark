import { NextRequest } from 'next/server';
import QRCode from 'qrcode';
import { SITE_URL } from '@/lib/site';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/** Printable QR image for a managed short code. Encodes the CANONICAL
 *  `${SITE_URL}/qr/<code>` (never localhost, so a QR generated in the Studio
 *  during dev still points at the real domain), and returns:
 *    /api/qr-image/<code>            → SVG (vector, best for print)
 *    /api/qr-image/<code>?format=png → 1024px PNG
 *
 *  The image only encodes a URL; where a scan actually lands is controlled by
 *  the qrCode document's Target and stays repointable without reprinting. */

// reads ?format from the query, so it is a dynamic route; cached via headers.
const CODE_RE = /^[a-z0-9-]{2,40}$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  // Generous per-IP cap: QR images are a print/Studio tool, not a hot path.
  if (!(await rateLimit(`qr-image:${clientIp(req.headers)}`, 120, 60_000))) {
    return new Response('Too many requests', { status: 429 });
  }

  const raw = (await params).code.toLowerCase().replace(/\.(svg|png)$/, '');
  if (!CODE_RE.test(raw)) return new Response('Invalid code', { status: 400 });

  const target = `${SITE_URL}/qr/${raw}`;
  const png = new URL(req.url).searchParams.get('format') === 'png';

  try {
    if (png) {
      const buf = await QRCode.toBuffer(target, {
        type: 'png',
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      });
      return new Response(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="qr-${raw}.png"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    const svg = await QRCode.toString(target, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    });
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="qr-${raw}.svg"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('QR generation failed', { status: 500 });
  }
}
