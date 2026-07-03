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
import { HOME_DEFAULTS } from '../lib/home-copy';
import { specialists } from '../lib/data';
import { testimonials } from '../lib/testimonials';
import { videos } from '../lib/videos';

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


const slugify = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const specialistDocs = specialists.map((sp) => ({
  _id: `specialist-${slugify(sp.name)}`,
  _type: 'specialist',
  name: sp.name,
  role: sp.role,
  location: sp.location,
  photoUrl: sp.photo,
  phone: sp.phone,
  email: sp.email,
  quote: sp.quote,
  ...(sp.quoteTopic ? { quoteTopic: sp.quoteTopic } : {}),
  consentGiven: true, // demo data was already public
  active: true,
}));

const testimonialDocs = testimonials.map((t, i) => ({
  _id: `testimonial-${slugify(t.name)}-${i}`,
  _type: 'testimonial',
  quote: t.quote,
  name: t.name,
  role: t.role,
  ...(t.productCode ? { productCode: t.productCode } : {}),
  trades: t.trades,
  active: true,
}));

const videoDocs = videos.map((v, i) => ({
  _id: `video-${v.id}`,
  _type: 'video',
  youtubeId: v.id,
  title: v.title,
  by: v.by,
  featured: i === 0,
  active: true,
}));

const legalBlock = (text: string) => [
  {
    _type: 'block',
    _key: 'seed-1',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'seed-1a', text, marks: [] }],
  },
];
const legalDocs = [
  { slug: 'privatliv', title: 'Privacy policy' },
  { slug: 'cookies', title: 'Cookie policy' },
  { slug: 'handelsbetingelser', title: 'Terms of sale' },
].map((l) => ({
  _id: `legal-${l.slug}`,
  _type: 'legalPage',
  title: l.title,
  slug: l.slug,
  body: legalBlock(
    'PLACEHOLDER: this text is awaiting sign-off from the legal team. Replace this paragraph with the approved policy before launch.'
  ),
}));

async function run() {
  const tx = client.transaction();
  tx.createOrReplace(homePage as any);
  for (const d of storeDocs) tx.createOrReplace(d as any);
  for (const d of specialistDocs) tx.createOrReplace(d as any);
  for (const d of testimonialDocs) tx.createOrReplace(d as any);
  for (const d of videoDocs) tx.createOrReplace(d as any);
  for (const d of legalDocs) tx.createOrReplace(d as any);
  const res = await tx.commit();
  // eslint-disable-next-line no-console
  console.log(`Seeded ${res.results.length} documents (homePage, ${storeDocs.length} stores, ${specialistDocs.length} specialists, ${testimonialDocs.length} testimonials, ${videoDocs.length} films, ${legalDocs.length} legal pages)`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
