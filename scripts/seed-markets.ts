/**
 * Seeds the market registry: the International (English) reference plus the
 * four dealer markets (Denmark, Germany, France, Belgium). Values come from
 * lib/markets.ts. The dealer markets seed as NOT live (active: false); they
 * go live one at a time as each is localised (see the localisation plan).
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:markets
 *
 * MERGE-PRESERVING, not createOrReplace: market docs carry OPERATIONAL fields
 * editors enter in the Studio (gtmId, cookiebotId, the newsletter* provider
 * block incl. encrypted keys) that the code registry does not know about. A
 * replace would wipe them. So: createIfNotExists for new docs, then a patch
 * that sets ONLY the seed-owned registry fields (identity, dealer, footer)
 * and never touches or unsets anything else. Idempotent.
 */
import { getCliClient } from 'sanity/cli';
import { markets } from '../lib/markets';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

async function run() {
  let tx = client.transaction();
  for (const m of markets) {
    /* Seed-owned fields only. Optional registry fields are set only when the
       registry has a value: the seed never unsets anything, so an editor-
       entered value for a field the registry leaves empty also survives. */
    const seedFields = {
      name: m.name,
      code: { _type: 'slug', current: m.code },
      languages: m.languages,
      defaultLanguage: m.defaultLanguage,
      isReference: !!m.isReference,
      active: !!m.active,
      order: m.order ?? 0,
      ...(m.dealerName ? { dealerName: m.dealerName } : {}),
      ...(m.dealerCtaUrl ? { dealerCtaUrl: m.dealerCtaUrl } : {}),
      ...(m.supportPhone ? { supportPhone: m.supportPhone } : {}),
      ...(m.supportHours ? { supportHours: m.supportHours } : {}),
      ...(m.legalLine ? { legalLine: m.legalLine } : {}),
      ...(m.legalLinks ? { legalLinks: m.legalLinks } : {}),
    };
    tx = tx
      .createIfNotExists({ _id: m._id as string, _type: 'market', ...seedFields })
      /* patch.set touches ONLY the keys above: the operational fields editors
         own (gtmId, cookiebotId, newsletter*) are never listed, never unset. */
      .patch(m._id as string, (p) => p.set(seedFields));
  }
  await tx.commit();
  console.log(
    `Seeded ${markets.length} markets, merge-preserving (International reference + Denmark, Germany, France, Belgium). Editor-entered operational fields (gtmId, cookiebotId, newsletter*) untouched.`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
