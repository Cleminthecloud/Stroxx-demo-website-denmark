import { describe, expect, it } from 'vitest';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/* Without UPSTASH_* env vars (unset in tests and CI) rateLimit is the pure
 * in-memory sliding window, so it can be exercised directly. */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('rateLimit, in-memory window', () => {
  it('allows up to the limit and blocks the next request', async () => {
    const key = 'test-limit-basic';
    expect(await rateLimit(key, 3, 60_000)).toBe(true);
    expect(await rateLimit(key, 3, 60_000)).toBe(true);
    expect(await rateLimit(key, 3, 60_000)).toBe(true);
    expect(await rateLimit(key, 3, 60_000)).toBe(false);
    expect(await rateLimit(key, 3, 60_000)).toBe(false);
  });

  it('keys are independent buckets', async () => {
    expect(await rateLimit('test-key-a', 1, 60_000)).toBe(true);
    expect(await rateLimit('test-key-a', 1, 60_000)).toBe(false);
    expect(await rateLimit('test-key-b', 1, 60_000)).toBe(true);
  });

  it('a limit of zero blocks immediately', async () => {
    expect(await rateLimit('test-zero', 0, 60_000)).toBe(false);
  });

  it('the window slides: old hits expire and requests pass again', async () => {
    const key = 'test-window-expiry';
    expect(await rateLimit(key, 1, 50)).toBe(true);
    expect(await rateLimit(key, 1, 50)).toBe(false);
    await sleep(70);
    expect(await rateLimit(key, 1, 50)).toBe(true);
  });
});

describe('clientIp', () => {
  it('prefers the platform-set x-real-ip', () => {
    const h = new Headers({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1, 203.0.113.7' });
    expect(clientIp(h)).toBe('203.0.113.7');
  });

  it('trims whitespace around x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '  203.0.113.7  ' }))).toBe('203.0.113.7');
  });

  it('falls back to the RIGHTMOST x-forwarded-for entry, never the spoofable leftmost', () => {
    const h = new Headers({ 'x-forwarded-for': 'attacker-spoofed, 198.51.100.9, 203.0.113.50' });
    expect(clientIp(h)).toBe('203.0.113.50');
  });

  it('handles a single-entry x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.50' }))).toBe('203.0.113.50');
  });

  it('ignores empty x-forwarded-for entries from trailing commas', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.50, ' }))).toBe('203.0.113.50');
  });

  it('returns unknown when no ip headers are present or they are empty', () => {
    expect(clientIp(new Headers())).toBe('unknown');
    expect(clientIp(new Headers({ 'x-forwarded-for': '' }))).toBe('unknown');
    expect(clientIp(new Headers({ 'x-real-ip': '' }))).toBe('unknown');
  });
});
