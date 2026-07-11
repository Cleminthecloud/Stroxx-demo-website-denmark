import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/* LOCKED i18n CONTRACT (AGENT-BRIEF rule 4): the GROQ language predicates in
 * lib/cms.ts are TOLERANT ON PURPOSE, a doc with NO language field counts as
 * the English base. lib/cms.ts cannot be imported here (it pulls in the
 * Sanity live client), so this suite locks the predicate strings and their
 * use by scanning the source file. */

const src = readFileSync(fileURLToPath(new URL('../lib/cms.ts', import.meta.url)), 'utf8');

describe('lib/cms.ts language predicates', () => {
  it('LANG_IS matches the requested language or, for English, docs with no language field', () => {
    expect(src).toContain(
      `const LANG_IS = '(language == $lang || (!defined(language) && $lang == "en"))';`
    );
  });

  it('LANG_IS_EN matches English docs and docs with no language field', () => {
    expect(src).toContain(
      `const LANG_IS_EN = '(language == "en" || !defined(language))';`
    );
  });

  it('both predicates keep the tolerant no-language-field shape', () => {
    expect(src).toContain('!defined(language)');
    const langIs = src.match(/const LANG_IS = '([^']+)'/)?.[1] ?? '';
    const langIsEn = src.match(/const LANG_IS_EN = '([^']+)'/)?.[1] ?? '';
    expect(langIs).toContain('!defined(language)');
    expect(langIsEn).toContain('!defined(language)');
  });

  it('the predicates are interpolated into GROQ queries, not dead code', () => {
    const langIsUses = src.match(/\$\{LANG_IS\}/g) ?? [];
    const langIsEnUses = src.match(/\$\{LANG_IS_EN\}/g) ?? [];
    expect(langIsUses.length).toBeGreaterThan(0);
    expect(langIsEnUses.length).toBeGreaterThan(0);
  });

  it('the tolerant predicates outnumber strict language filters in the file', () => {
    // supportPage queries are the one sanctioned strict-language spot; the
    // shared predicates must remain the dominant filter shape. If this count
    // flips, a fetcher likely regressed to a strict filter that makes
    // untagged English-base docs silently invisible.
    const tolerant = (src.match(/LANG_IS/g) ?? []).length;
    const strictOnly = (src.match(/language == "(?:en|\$\{l\})"/g) ?? []).length;
    expect(tolerant).toBeGreaterThan(strictOnly);
  });
});
