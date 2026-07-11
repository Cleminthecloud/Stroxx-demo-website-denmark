import { describe, expect, it } from 'vitest';
import { MARKET_CODE_RE, markets, referenceMarket, resolveOpsMarket, type Market } from '@/lib/markets';

/* Per-market OPERATIONS contract (Phase 2 ownership split, 2026-07-11):
 * /api/newsletter and /api/newsletter/status resolve which market's tracking
 * and newsletter provider config a request belongs to via resolveOpsMarket,
 * from a CLIENT-SENT market code (same pattern as /api/chat). The lock:
 * anything that is not a well-formed, registered code resolves to the
 * REFERENCE market (which normally carries no credentials), NEVER to another
 * dealer market, so a bad code can never reach another market's keys. */

describe('MARKET_CODE_RE', () => {
  it('accepts the registered code shapes (2 to 5 lowercase letters)', () => {
    for (const c of ['dk', 'de', 'fr', 'be', 'int']) expect(MARKET_CODE_RE.test(c)).toBe(true);
  });

  it('rejects malformed input', () => {
    for (const c of ['', 'D', 'DK', 'd1', 'dk ', ' dk', 'danmark', 'dk/de', '../dk', 'dk"']) {
      expect(MARKET_CODE_RE.test(c)).toBe(false);
    }
  });
});

describe('resolveOpsMarket', () => {
  it('resolves each registered market by its own code', () => {
    for (const m of markets) expect(resolveOpsMarket(m.code)).toBe(m);
  });

  it('the reference market resolves to itself', () => {
    expect(resolveOpsMarket('int')).toBe(referenceMarket());
    expect(resolveOpsMarket('int')?.isReference).toBe(true);
  });

  it('a missing code falls back to the reference market', () => {
    expect(resolveOpsMarket(undefined)).toBe(referenceMarket());
    expect(resolveOpsMarket(null)).toBe(referenceMarket());
    expect(resolveOpsMarket('')).toBe(referenceMarket());
  });

  it('a well-formed but unregistered code falls back to the reference market', () => {
    expect(resolveOpsMarket('se')).toBe(referenceMarket());
    expect(resolveOpsMarket('nl')).toBe(referenceMarket());
  });

  it('malformed and non-string input falls back to the reference market', () => {
    for (const bad of ['DK', 'd', 'denmark', 'dk;de', '../be', 42, {}, [], true]) {
      expect(resolveOpsMarket(bad)).toBe(referenceMarket());
    }
  });

  it('never leaks a dealer market on fallback: no invalid input resolves to a non-reference market', () => {
    const probes: unknown[] = [undefined, null, '', 'xx', 'zz', 'DK', 'bee!', 'abcdef', 0, false];
    for (const p of probes) {
      const m = resolveOpsMarket(p);
      expect(m?.isReference).toBe(true);
    }
  });

  it('works against a CMS-shaped list, falling back to that list\'s reference', () => {
    const cms: Market[] = [
      { _id: 'a', code: 'int', isReference: true },
      { _id: 'b', code: 'dk', isReference: false, newsletterProvider: 'mailchimp', newsletterListId: 'list-dk' },
    ];
    expect(resolveOpsMarket('dk', cms)?._id).toBe('b');
    expect(resolveOpsMarket('se', cms)?._id).toBe('a');
    expect(resolveOpsMarket(undefined, cms)?._id).toBe('a');
  });

  it('a list without a flagged reference falls back to its first entry, never a code-guessed match', () => {
    const list: Market[] = [
      { _id: 'first', code: 'aa' },
      { _id: 'second', code: 'bb' },
    ];
    expect(resolveOpsMarket('zz', list)?._id).toBe('first');
  });
});
