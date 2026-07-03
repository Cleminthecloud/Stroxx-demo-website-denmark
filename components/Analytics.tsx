'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** First-party stats beacon. Sends anonymous counters to /api/track:
 *  a pageview per route change (with the referrer/utm source) and outbound
 *  clicks to the partner webshops. No cookies, no IDs, nothing personal,
 *  which is why it needs no consent. Skips the Studio preview iframe and
 *  internal pages so editors do not count themselves. */

const SKIP = /^\/(studio|guide|komponenter|api)/;
const PARTNER_RE = /(carl-ras\.dk|meesenburg\.)|(foussier\.)|(lecot\.)/i;

function partnerOf(href: string): string | null {
  const h = href.toLowerCase();
  if (h.includes('carl-ras')) return 'carl-ras';
  if (h.includes('meesenburg')) return 'meesenburg';
  if (h.includes('foussier')) return 'foussier';
  if (h.includes('lecot')) return 'lecot';
  return null;
}

function send(payload: Record<string, string>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch {}
}

export default function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef('');

  /* pageviews on every route change */
  useEffect(() => {
    if (!pathname || SKIP.test(pathname)) return;
    try {
      if (window.self !== window.top) return; // Presentation iframe
    } catch {
      return;
    }
    if (lastPath.current === pathname) return;
    /* source: utm_source wins, then the external referrer, then direct */
    let src = '';
    try {
      const utm = new URLSearchParams(window.location.search).get('utm_source');
      if (utm) src = `utm:${utm}`;
      else if (document.referrer && !document.referrer.includes(window.location.host)) src = document.referrer;
      else if (lastPath.current) src = 'internal';
    } catch {}
    send({ t: 'pv', path: pathname, src });
    lastPath.current = pathname;
  }, [pathname]);

  /* outbound clicks to the partner webshops (capture phase catches them all) */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.href || '';
      if (!PARTNER_RE.test(href)) return;
      const to = partnerOf(href);
      if (to) send({ t: 'out', to });
    };
    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
