/**
 * REPO-WIDE price firewall.
 *
 * tests/catalog.test.ts already guards the RUNTIME seam: assertNoPriceLikeKeys
 * walks the objects lib/catalog emits and throws on a price-shaped key. But it
 * only ever sees objects that reach it, so a price table sitting in a source
 * file that nothing imports is invisible to it.
 *
 * That is not hypothetical. lib/compare.ts shipped for months holding hardcoded
 * A-brand reference prices in DKK (595, 149, 259, 229, 4495) plus "save 41-50%"
 * figures, imported by nothing, caught by nothing. Deleted 2026-08-13. This test
 * exists so the next one cannot happen.
 *
 * WHAT IT CHECKS: source text, not runtime values.
 *   1. No currency amounts anywhere (123 kr, DKK 99, 49,95 EUR, $12, €8).
 *   2. No price-shaped identifiers (listPrice, savePct, msrp, kostpris, ...).
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK: the WORD "price" in prose. The brand
 * talks about price as an idea ("price doesn't measure quality"), and that is
 * both allowed and on-strategy. Actual numbers are what is banned. Tone is a
 * human judgement, see docs/STROXX-positioning-change-plan.md.
 *
 * WHY IT MATTERS: pricing is the dealer's job in every market, and STROXX sits
 * at price index 80 to 90 against category leaders. A stale number on the brand
 * site is both a commercial leak and a promise we cannot keep.
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..');
const SCAN_DIRS = ['lib', 'app', 'components', 'scripts', 'sanity'];
const EXTENSIONS = ['.ts', '.tsx'];

/** Files exempt from the scan, with the reason. Keep this list SHORT and
 *  argued: every entry is a hole in the firewall. */
const ALLOWLIST: Record<string, string> = {
  'tests/price-firewall.test.ts': 'this file, which necessarily names the patterns',
  'tests/catalog.test.ts':
    "the runtime firewall's own negative fixtures: it feeds assertNoPriceLikeKeys a listPrice to prove it throws",
};

/** A number next to a currency, in either order. Covers "1.234,50 kr.",
 *  "DKK 99", "€8", "49 EUR", "12,50 €".
 *
 *  Note on "$": it is NOT treated as a trailing currency mark, because in .tsx
 *  a digit followed by "$" is nearly always Tailwind template interpolation
 *  ("gap-5 ${cardCols(n)}"). Leading "$12" is still caught. We do not sell in
 *  USD, so the loss of coverage is theoretical and the false positives were
 *  not. */
const CURRENCY_AMOUNT =
  /(?:\b\d[\d.,]*\s*(?:kr\.?|dkk|eur|usd|sek|nok)\b)|(?:\b(?:kr\.?|dkk|eur|usd|sek|nok)\s*\d)|(?:[€£]\s?\d)|(?:\$\d)|(?:\d\s?[€£])/gi;

/** Identifiers that only exist to carry a price. Word-boundary matched so
 *  "priceless" or a sentence containing "price" does not trip it. */
const PRICE_IDENTIFIER =
  /\b(?:listPrice|refPrice|unitPrice|priceFrom|fromPrice|compareRef|compareRefPrice|compareLabel|savePct|savingsPct|discountPct|msrp|rrp|vejlPris|vejledendePris|udsalgspris|salgspris|kostpris|nettopris|prisIndeks|priceIndex)\b/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => {
  const full = join(ROOT, d);
  try {
    return statSync(full).isDirectory() ? walk(full) : [];
  } catch {
    return [];
  }
}).concat(walk(join(ROOT, 'tests')));

type Hit = { file: string; line: number; text: string; match: string };

function scan(pattern: RegExp): Hit[] {
  const hits: Hit[] = [];
  for (const file of files) {
    const rel = relative(ROOT, file).split('\\').join('/');
    if (ALLOWLIST[rel]) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((text, i) => {
      const found = text.match(new RegExp(pattern.source, pattern.flags));
      if (found) hits.push({ file: rel, line: i + 1, text: text.trim(), match: found[0] });
    });
  }
  return hits;
}

const report = (hits: Hit[]) =>
  hits.map((h) => `  ${h.file}:${h.line}  matched "${h.match}"\n    ${h.text.slice(0, 140)}`).join('\n');

describe('the repo-wide price firewall', () => {
  it('finds source files to scan (guards against a broken glob silently passing)', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('has no currency amounts in any source file', () => {
    const hits = scan(CURRENCY_AMOUNT);
    expect(
      hits.length,
      `Currency amounts found. The brand site never carries prices: pricing is the dealer's job in every market.\n${report(hits)}\n`
    ).toBe(0);
  });

  it('has no price-carrying identifiers in any source file', () => {
    const hits = scan(PRICE_IDENTIFIER);
    expect(
      hits.length,
      `Price-shaped identifiers found. If a feature seems to need one, it belongs on the dealer's platform.\n${report(hits)}\n`
    ).toBe(0);
  });

  it('detects the patterns it claims to (self-test against the deleted compare.ts)', () => {
    const fixture = [
      "const COMPARE = { '34011573': { ref: 595, savePct: 43 } };",
      'A-mærke klinge fra 595 kr.',
      'listPrice: 1299',
      'EUR 49,95',
      '$12.00',
    ].join('\n');
    expect(fixture.match(new RegExp(CURRENCY_AMOUNT.source, CURRENCY_AMOUNT.flags))).not.toBeNull();
    expect(fixture.match(new RegExp(PRICE_IDENTIFIER.source, PRICE_IDENTIFIER.flags))).not.toBeNull();
  });

  it('does not trip on the brand talking about price as an idea', () => {
    const allowed = [
      "But price doesn't measure quality. Tolerances, materials and durability do.",
      'Open with price, or talk price on the brand side. That is the dealers’ job.',
      'let quality carry the price',
    ].join('\n');
    expect(allowed.match(new RegExp(CURRENCY_AMOUNT.source, CURRENCY_AMOUNT.flags))).toBeNull();
    expect(allowed.match(new RegExp(PRICE_IDENTIFIER.source, PRICE_IDENTIFIER.flags))).toBeNull();
  });
});
