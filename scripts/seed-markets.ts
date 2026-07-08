/**
 * Seeds the market registry: the International (English) reference plus the
 * four dealer markets (Denmark, Germany, France, Belgium). Values come from
 * lib/markets.ts. The dealer markets seed as NOT live (active: false); they
 * go live one at a time as each is localised (see the localisation plan).
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:markets
 *
 * Idempotent: createOrReplace with fixed _ids.
 */
import { getCliClient } from 'sanity/cli';
import { markets } from '../lib/markets';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

async function run() {
  let tx = client.transaction();
  for (const m of markets) {
    tx = tx.createOrReplace({
      _id: m._id as string,
      _type: 'market',
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
      ...(m.legalLinks ? { legalLinks: m.legalLinks } : {}),
    });
  }
  await tx.commit();
  console.log(`Seeded ${markets.length} markets (International reference + Denmark, Germany, France, Belgium).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
