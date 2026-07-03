/**
 * Seeds the homepage copy document and all store documents into the dataset,
 * from the current hardcoded content, so both are editable in the Studio
 * immediately with the real values.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:more
 *
 * Idempotent: createOrReplace with fixed _ids.
 */
import { getCliClient } from 'sanity/cli';
import { stores } from '../lib/stores';
import { HOME_DEFAULTS } from '../lib/cms';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  ...HOME_DEFAULTS,
  stats: HOME_DEFAULTS.stats.map((s, i) => ({ _type: 'stat', _key: `seed-${i}`, ...s })),
};


const storeDocs = stores.map((s) => ({
  _id: `store-${s.id}`,
  _type: 'store',
  name: s.name,
  brand: s.brand,
  region: s.region,
  address: s.address,
  zipCity: s.zipCity,
  lat: s.lat,
  lng: s.lng,
  mapsUrl: s.maps,
  managerName: s.manager.name,
  managerEmail: s.manager.email,
  managerPhone: s.manager.phone,
  managerPhoto: s.manager.photo,
  managerConsent: true, // snapshot data was already public on carl-ras.dk
  openMonThu: s.monThu[0],
  closeMonThu: s.monThu[1],
  openFri: s.fri[0],
  closeFri: s.fri[1],
  weekendClosed: s.weekendClosed,
  festool: s.festool,
  sikring: s.sikring,
  aktive3: s.aktive3,
  active: true,
}));

async function run() {
  const tx = client.transaction();
  tx.createOrReplace(homePage as any);
  for (const d of storeDocs) tx.createOrReplace(d as any);
  const res = await tx.commit();
  // eslint-disable-next-line no-console
  console.log(`Seeded ${res.results.length} documents (homePage + ${storeDocs.length} stores)`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
