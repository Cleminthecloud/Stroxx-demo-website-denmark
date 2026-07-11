/**
 * One-time (but idempotent) migration for the Phase 2 ownership split: copies
 * the per-market OPERATIONS from the English base siteSettings document onto
 * ALL market documents, so every market keeps the tracking + newsletter setup
 * the site effectively has today (each locale inherited the English base's
 * values through the language fallback before the split).
 *
 * Fields copied: gtmId, cookiebotId, newsletterEnabled, newsletterProvider,
 * mailchimpApiKey, klaviyoApiKey, marketoBaseUrl, marketoClientId,
 * marketoClientSecret, newsletterWebhookUrl, newsletterListId.
 * The encrypted secret fields are plain RSA-OAEP ciphertext with no document
 * binding (see sanity/EncryptedSecretField.tsx + lib/newsletter-secrets.ts),
 * so the ciphertext copies verbatim and decrypts unchanged on the market doc;
 * no key re-entry is needed.
 *
 * ADDITIVE ONLY: every write is setIfMissing, so a value an editor has already
 * entered on a market doc is never overwritten, and nothing is ever unset or
 * removed from siteSettings by this script (seed:more cleans the old fields
 * off siteSettings AFTER this has run). Safe to run repeatedly.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run migrate:market-ops
 *
 * Order at cutover: deploy the split, run this, verify per-market, then run
 * npm run seed:more to clean the retired fields off siteSettings.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const OPS_FIELDS = [
  'gtmId',
  'cookiebotId',
  'newsletterEnabled',
  'newsletterProvider',
  'mailchimpApiKey',
  'klaviyoApiKey',
  'marketoBaseUrl',
  'marketoClientId',
  'marketoClientSecret',
  'newsletterWebhookUrl',
  'newsletterListId',
] as const;

type Doc = Record<string, unknown> & { _id: string; name?: string };

const present = (v: unknown) => v !== undefined && v !== null && v !== '';

async function run() {
  /* The English base settings doc: same tolerant rule as lib/cms.ts
     (no language field counts as the English base). */
  const base = (await client.fetch(
    '*[_type == "siteSettings" && (language == "en" || !defined(language))][0]'
  )) as Doc | null;
  if (!base) {
    console.log('No English base siteSettings document found. Nothing to migrate.');
    return;
  }

  const values: Record<string, unknown> = {};
  for (const f of OPS_FIELDS) if (present(base[f])) values[f] = base[f];

  const marketDocs = (await client.fetch(
    `*[_type == "market"] | order(order asc){ _id, name, "code": code.current, ${OPS_FIELDS.join(', ')} }`
  )) as Doc[];
  if (!marketDocs.length) {
    console.log('No market documents found. Run npm run seed:markets first, then re-run this.');
    process.exit(1);
  }

  const copiedKeys = Object.keys(values);
  if (!copiedKeys.length) {
    console.log('English base carries none of the operational fields; market docs are left exactly as they are.');
    for (const m of marketDocs) {
      const owned = OPS_FIELDS.filter((k) => present(m[k]));
      console.log(`${m.name ?? m._id}: ${owned.length ? `already has ${owned.join(', ')}` : 'no operational fields set'}`);
    }
    return;
  }
  console.log(`English base carries: ${copiedKeys.join(', ')}`);

  let tx = client.transaction();
  for (const m of marketDocs) {
    /* setIfMissing = additive: only fills fields the market doc does not have. */
    tx = tx.patch(m._id, (p) => p.setIfMissing(values));
  }
  await tx.commit();

  /* Per-market report: which fields were filled by this run vs already owned. */
  for (const m of marketDocs) {
    const filled = copiedKeys.filter((k) => !present(m[k]));
    const kept = copiedKeys.filter((k) => present(m[k]));
    const label = `${m.name ?? m._id} (/${(m as { code?: string }).code ?? '?'})`;
    console.log(
      `${label}: ${filled.length ? `copied ${filled.join(', ')}` : 'nothing to copy'}${
        kept.length ? `; kept existing ${kept.join(', ')}` : ''
      }`
    );
  }
  console.log(
    'Done. Verify in the Studio (Settings, then Markets), then run npm run seed:more to clean the retired fields off Site settings.'
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
