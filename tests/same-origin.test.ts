import { describe, expect, it } from 'vitest';
import type { NextRequest } from 'next/server';
import { sameOrigin } from '@/lib/same-origin';

/* sameOrigin only reads headers and nextUrl.host, so a minimal stub stands
 * in for NextRequest; no server runtime needed. */

function req(headers: Record<string, string>, host = 'stroxx.eu'): NextRequest {
  return { headers: new Headers(headers), nextUrl: { host } } as unknown as NextRequest;
}

describe('sameOrigin', () => {
  it('allows same-origin browser posts', () => {
    expect(sameOrigin(req({ 'sec-fetch-site': 'same-origin' }))).toBe(true);
    expect(sameOrigin(req({ 'sec-fetch-site': 'same-origin', origin: 'https://stroxx.eu' }))).toBe(true);
  });

  it('allows user-initiated navigations marked none', () => {
    expect(sameOrigin(req({ 'sec-fetch-site': 'none' }))).toBe(true);
  });

  it('allows non-browser clients that send neither header', () => {
    expect(sameOrigin(req({}))).toBe(true);
  });

  it('blocks cross-site and same-site sec-fetch-site values', () => {
    expect(sameOrigin(req({ 'sec-fetch-site': 'cross-site' }))).toBe(false);
    expect(sameOrigin(req({ 'sec-fetch-site': 'same-site' }))).toBe(false);
  });

  it('blocks an origin header from another host', () => {
    expect(sameOrigin(req({ origin: 'https://evil.example' }))).toBe(false);
  });

  it('matches origin against the request host including port', () => {
    expect(sameOrigin(req({ origin: 'http://localhost:3000' }, 'localhost:3000'))).toBe(true);
    expect(sameOrigin(req({ origin: 'http://localhost:4000' }, 'localhost:3000'))).toBe(false);
  });

  it('blocks a malformed origin header', () => {
    expect(sameOrigin(req({ origin: 'not-a-url' }))).toBe(false);
  });
});
