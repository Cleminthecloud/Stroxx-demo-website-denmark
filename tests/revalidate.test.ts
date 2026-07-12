import { describe, expect, it } from 'vitest';
import { isValidSignature, signBody, SIGNATURE_HEADER } from '@/lib/sanity-webhook';

/** Locks the webhook signature contract: /api/revalidate must only act on
 *  deliveries signed with the shared secret (Sanity's t=<ms>,v1=<base64url
 *  hmac-sha256("<t>.<body>")> format). If this suite goes red, the route is
 *  either open to strangers or deaf to Sanity. */

const SECRET = 'test-secret-value';
const BODY = JSON.stringify({ _type: 'siteSettings' });

describe('sanity webhook signature', () => {
  it('accepts a correctly signed body', () => {
    const now = 1_770_000_000_000;
    expect(isValidSignature(BODY, signBody(BODY, SECRET, now), SECRET, now)).toBe(true);
  });

  it('accepts whitespace after the comma (header normalization)', () => {
    const now = 1_770_000_000_000;
    const header = signBody(BODY, SECRET, now).replace(',', ', ');
    expect(isValidSignature(BODY, header, SECRET, now)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const now = 1_770_000_000_000;
    const header = signBody(BODY, SECRET, now);
    expect(isValidSignature(BODY.replace('siteSettings', 'homePage'), header, SECRET, now)).toBe(false);
  });

  it('rejects the wrong secret', () => {
    const now = 1_770_000_000_000;
    expect(isValidSignature(BODY, signBody(BODY, 'other-secret', now), SECRET, now)).toBe(false);
  });

  it('rejects a missing or malformed header and an empty secret', () => {
    const now = 1_770_000_000_000;
    expect(isValidSignature(BODY, null, SECRET, now)).toBe(false);
    expect(isValidSignature(BODY, 'v1=abc', SECRET, now)).toBe(false);
    expect(isValidSignature(BODY, 't=123', SECRET, now)).toBe(false);
    expect(isValidSignature(BODY, signBody(BODY, SECRET, now), '', now)).toBe(false);
  });

  it('rejects a signature older than the 6 hour retry window', () => {
    const now = 1_770_000_000_000;
    const old = now - 7 * 60 * 60 * 1000;
    expect(isValidSignature(BODY, signBody(BODY, SECRET, old), SECRET, now)).toBe(false);
  });

  it('accepts a signature from within the retry window', () => {
    const now = 1_770_000_000_000;
    const recent = now - 5 * 60 * 60 * 1000;
    expect(isValidSignature(BODY, signBody(BODY, SECRET, recent), SECRET, now)).toBe(true);
  });

  it('exports the header name the route reads', () => {
    expect(SIGNATURE_HEADER).toBe('sanity-webhook-signature');
  });
});
