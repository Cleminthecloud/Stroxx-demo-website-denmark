import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/* LOCKED: how the live month is chosen, and how a month gets its archive
 * address. lib/cms.ts cannot be imported here (it pulls in the Sanity live
 * client), so this suite locks the GROQ by scanning the source, the same
 * technique tests/cms-lang.test.ts uses for the language predicates. */

const src = readFileSync(fileURLToPath(new URL('../lib/cms.ts', import.meta.url)), 'utf8');

describe('choosing the live monthly lineup', () => {
  /* THE BUG THIS LOCKS (found live 2026-08-31): GROQ sorts an UNDEFINED field
     FIRST in a descending order. A lineup with no "Active from" date therefore
     outranked every dated one and took over /monthly by itself, which is how
     an undated July draft full of placeholder copy ended up live ahead of the
     real month. coalesce() gives undated lineups a floor date so they sort
     LAST, which is what "fall back to" was always meant to mean. */
  it('sorts undated lineups last, never first', () => {
    const orders = src.match(/order\(coalesce\(activeFrom, "0001-01-01"\) desc, _createdAt desc\)/g) ?? [];
    expect(orders.length).toBe(2); // getSka and getLineup
    expect(src).not.toContain('order(activeFrom desc, _createdAt desc)');
  });

  it('still lets an undated lineup render when it is the only one', () => {
    expect(src).toContain('(!defined(activeFrom) || activeFrom <= $today)');
  });

  it('never shows a lineup staged for a future month', () => {
    expect(src).toContain('activeFrom <= $today');
  });
});

describe('the archive address', () => {
  it('accepts only a well-formed YYYY-MM period', () => {
    const re = /^20\d\d-(0[1-9]|1[0-2])$/;
    expect(re.test('2026-09')).toBe(true);
    expect(re.test('2026-13')).toBe(false);
    expect(re.test('2026-00')).toBe(false);
    expect(re.test('26-09')).toBe(false);
    expect(re.test('2026-9')).toBe(false);
  });

  it('falls back to the go-live month when no period is set', () => {
    /* lineupPeriod's contract: explicit period wins, else activeFrom's month,
       else empty (which keeps the month OUT of the archive rather than giving
       it an address that could move under a shared link). */
    expect(src).toContain('export const lineupPeriod');
    expect(src).toContain("a && /^20\\d\\d-\\d\\d/.test(a) ? a.slice(0, 7) : ''");
  });

  it('the archive index drops months with no resolvable address', () => {
    expect(src).toContain('if (!period || seen.has(period)) return null;');
  });
});
