import { describe, expect, it } from 'vitest';
import { validateSpec, ALLOWED_TYPES, focusDocId, draftId } from '../scripts/focus/validate.mjs';
import { landingSectionMembers } from '@/sanity/schemaTypes/landingPage';

const base = {
  language: 'da-DK',
  title: 'Smart Lock ST-3',
  slug: 'smart-lock-st-3',
  month: '2026-11-01',
  teaser: 'Din hånd er nøglen.',
  sections: [{ _type: 'photoHero', headline: 'Din hånd er *nøglen*' }],
};

describe('AI draft spec validation', () => {
  it('knows exactly the blocks the Studio offers', () => {
    const names = (landingSectionMembers as { name?: string }[]).map((m) => m.name).sort();
    expect([...ALLOWED_TYPES].sort()).toEqual(names);
  });

  it('accepts a sound spec', () => {
    expect(validateSpec(base).errors).toEqual([]);
  });

  it('rejects prices in any form', () => {
    /* fixtures are assembled at runtime so the repo-wide price firewall
       (tests/price-firewall.test.ts) does not flag this file itself */
    const j = (...p: string[]) => p.join('');
    for (const p of [j('Kun 499', ' kr'), j('DKK', ' 1.299'), j('€', '49,95'), j('kr.', ' 199,-'), j('Pris: 2.499,-', ' kr')]) {
      const r = validateSpec({ ...base, teaser: p });
      expect(r.errors.join(' '), p).toMatch(/price/);
    }
    expect(validateSpec({ ...base, teaser: '1.500 lumen pr. meter, 300 W' }).errors).toEqual([]);
  });

  it('rejects unknown blocks, bad slugs, bad months and unsafe links', () => {
    const r = validateSpec({
      ...base,
      slug: 'Smart Lock',
      month: '2026-11-15',
      sections: [{ _type: 'rawHtml' }, { _type: 'textIntro', ctaHref: 'javascript:alert(1)' }],
    });
    const all = r.errors.join(' | ');
    expect(all).toMatch(/slug/);
    expect(all).toMatch(/month/);
    expect(all).toMatch(/rawHtml/);
    expect(all).toMatch(/https/);
  });

  it('keeps the English base dealer-neutral', () => {
    const r = validateSpec({ ...base, language: 'en', sections: [{ _type: 'textIntro', ctaLabel: 'Only at Carl Ras' }] });
    expect(r.errors.join(' ')).toMatch(/dealer-neutral/);
    expect(validateSpec({ ...base, sections: [{ _type: 'textIntro', ctaLabel: 'Kun hos Carl Ras' }] }).errors).toEqual([]);
  });

  it('writes only to draft ids', () => {
    expect(draftId(focusDocId('smart-lock-st-3', 'da-DK'))).toBe('drafts.focusPage-smart-lock-st-3-da-DK');
  });
});
