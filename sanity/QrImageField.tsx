'use client';

import type { CSSProperties } from 'react';
import { useFormValue } from 'sanity';
import { SITE_URL } from '../lib/site';

/** Studio field rendered under a QR code's Code: shows the printable QR image
 *  and download links (SVG for print, PNG for screens). Stores nothing. The
 *  image is served by /api/qr-image/<code> and encodes the canonical
 *  stroxx.eu/qr/<code>, so what Meena downloads is always print-correct even
 *  while editing in dev. Change the Target above and the same printed code
 *  follows along, no reprint. */

export default function QrImageField() {
  const code = (useFormValue(['code']) as { current?: string } | undefined)?.current;

  if (!code) {
    return (
      <div style={{ fontSize: 12.5, opacity: 0.7 }}>
        Enter a code above and save, then the printable QR appears here.
      </div>
    );
  }

  // image loads from the current origin (works in local Studio + prod); the
  // encoded URL inside it is always SITE_URL/qr/<code> (see the API route).
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  const img = `${origin}/api/qr-image/${code}`;
  const printUrl = `${SITE_URL}/qr/${code}`;

  const btn: CSSProperties = {
    fontSize: 12.5,
    fontWeight: 600,
    textDecoration: 'none',
    padding: '7px 12px',
    borderRadius: 6,
    border: '1px solid #d0d3d8',
    color: '#1a1a1a',
    background: '#fff',
  };

  return (
    <div style={{ display: 'grid', gap: 12, fontFamily: 'inherit' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Studio-only admin
          preview of a dynamic /api/qr-image route; next/image's optimizer adds
          no value for a 168px field and would need remote-loader config. */}
      <img
        src={`${img}?format=png`}
        alt={`QR code for ${code}`}
        width={168}
        height={168}
        style={{ background: '#fff', padding: 10, borderRadius: 10, border: '1px solid #e4e6ea' }}
      />
      <div style={{ fontSize: 12.5, opacity: 0.8 }}>
        Encodes <code>{printUrl}</code>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a style={btn} href={`${img}?format=svg`} download={`qr-${code}.svg`}>
          Download SVG (print)
        </a>
        <a style={btn} href={`${img}?format=png`} download={`qr-${code}.png`}>
          Download PNG
        </a>
      </div>
      <div style={{ fontSize: 12, opacity: 0.65 }}>
        Put this QR on packaging. Its destination is set by <b>Target</b> above and can be changed any
        time without reprinting.
      </div>
    </div>
  );
}
