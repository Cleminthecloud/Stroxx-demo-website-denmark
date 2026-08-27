import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/* LOCKED READ-PATH CONTRACT.
 *
 * The permission database holds subscriber addresses, IPs and consent wording,
 * so the Sanity dataset has to be PRIVATE. That only works if published reads
 * carry a token, and next-sanity does not add one on its own: `defineLive`
 * attaches its `serverToken` only when the perspective is drafts or stega is
 * on, which an ordinary visitor is neither. The token therefore sits on the
 * shared client in sanity/lib/client.ts, and if it is ever removed the whole
 * site 401s the day the dataset is locked down.
 *
 * The mirror risk is leaking that token to the browser, so this suite also
 * proves the module never reaches client code.
 *
 * sanity/lib/client.ts cannot be imported here (it constructs a live client),
 * so the contract is locked by scanning source, the same approach as
 * tests/cms-lang.test.ts. */

const root = fileURLToPath(new URL('..', import.meta.url));
const clientSrc = readFileSync(join(root, 'sanity/lib/client.ts'), 'utf8');

function sourceFiles(dirs: string[]): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(full)) out.push(full);
    }
  };
  for (const d of dirs) walk(join(root, d));
  return out;
}

describe('sanity/lib/client.ts read token', () => {
  it('carries the read token, so published fetches work on a private dataset', () => {
    expect(clientSrc).toContain('token: process.env.SANITY_API_READ_TOKEN');
  });

  it('uses the non-public env var, so Next never inlines it into client code', () => {
    expect(clientSrc).not.toContain('NEXT_PUBLIC_SANITY_API_READ_TOKEN');
    expect(clientSrc).not.toMatch(/token:\s*['"`]/); // never a literal
  });

  it('is never imported by a client component', () => {
    const offenders = sourceFiles(['app', 'components', 'lib', 'sanity']).filter((f) => {
      const src = readFileSync(f, 'utf8');
      const isClient = /^\s*['"]use client['"]/m.test(src);
      const imports = /from\s+['"](@\/sanity\/lib\/client|\.\.?\/(?:lib\/)?client)['"]/.test(src);
      return isClient && imports;
    });
    expect(offenders.map((f) => f.replace(root, ''))).toEqual([]);
  });
});

describe('lib/permissions.ts refuses a public dataset', () => {
  const src = readFileSync(join(root, 'lib/permissions.ts'), 'utf8');

  it('probes the dataset before writing and has no override flag', () => {
    expect(src).toContain('export async function datasetIsPrivate');
    /* Every write path must be gated. If a new one is added without the gate,
       this count drops and the test fails. */
    const gated = src.match(/if \(!\(await datasetIsPrivate\(\)\)\)/g) ?? [];
    expect(gated.length).toBeGreaterThanOrEqual(4);
  });

  it('treats an unknown answer as public, because guessing wrong publishes personal data', () => {
    expect(src).toMatch(/catch \{\s*publicDataset = true;/);
  });
});
