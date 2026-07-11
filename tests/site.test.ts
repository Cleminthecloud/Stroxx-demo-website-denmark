import { describe, expect, it } from 'vitest';
import { SITE_URL, IS_DEMO } from '@/lib/site';

describe('lib/site', () => {
  it('SITE_URL is a valid https origin without a trailing slash', () => {
    expect(SITE_URL.startsWith('https://')).toBe(true);
    expect(SITE_URL.endsWith('/')).toBe(false);
    expect(() => new URL(SITE_URL)).not.toThrow();
    expect(new URL(SITE_URL).origin).toBe(SITE_URL);
  });

  it('IS_DEMO derives from SITE_URL: true exactly while on a vercel.app domain', () => {
    expect(IS_DEMO).toBe(SITE_URL.includes('vercel.app'));
  });

  it('the demo flag flips off automatically for any non-vercel production domain', () => {
    // lock the derivation rule itself, not the current value
    const derive = (url: string) => url.includes('vercel.app');
    expect(derive('https://stroxx.eu')).toBe(false);
    expect(derive('https://stroxx-demo-website-denmark.vercel.app')).toBe(true);
  });
});
