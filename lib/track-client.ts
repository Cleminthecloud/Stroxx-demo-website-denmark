/** Client-side beacon to the first-party collector (/api/track). Shared by
 *  the Analytics pageview beacon and interactive events like shares. Fire
 *  and forget: analytics must never affect the user experience. */
export function sendTrack(payload: Record<string, string>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch {}
}
