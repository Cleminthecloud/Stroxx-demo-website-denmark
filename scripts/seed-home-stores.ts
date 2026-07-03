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
import { LLMS_FALLBACK } from '../lib/llms-fallback';

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


/* Site settings: populate every field with the value the site actually uses,
   so editors see reality instead of empty fields. Existing non-empty values
   are kept (merge happens in run()). */
const lk = (label: string, href: string, i: number) => ({ _type: 'navLink', _key: `seed-${i}`, label, href });
const SETTINGS_DEFAULTS: Record<string, unknown> = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  retailerName: 'Carl Ras',
  supportPhone: '+45 44 85 55 11',
  supportHours: 'Monday to Thursday: 07:00 to 16:00\nFriday: 07:00 to 15:00',
  legalLine: '© Carl Ras A/S | Mileparken 31 | 2730 Herlev | CVR: DK 70 58 71 14',
  navLinks: [
    lk('Tool of the Month', '/maanedens', 1),
    lk('Products', '/produkter', 2),
    lk('Stores', '/butikker', 3),
    lk('Specialists', '/butikker?tab=specialister', 4),
    lk('Trades', '/fag', 5),
    lk('Try It', '/proev-det', 6),
    lk('Service and Support', '/service', 7),
  ],
  footerPageLinks: [
    lk('Tool of the Month', '/maanedens', 1),
    lk('Products', '/produkter', 2),
    lk('Trades', '/fag', 3),
    lk('Stores', '/butikker', 4),
    lk('Campaign: Try It', '/proev-det', 5),
    lk('Specialists', '/butikker?tab=specialister', 6),
    lk('Service and Support', '/service', 7),
  ],
  footerBuyLinks: [
    lk('Buy STROXX', 'https://www.carl-ras.dk/maerker/stroxx/?utm_source=cr-byg&utm_medium=brandsite_link&utm_campaign=stroxx', 1),
    lk('Find a store', '/butikker', 2),
    lk('Satisfaction guarantee (PDF)', '/STROXX-tilfredshedsgaranti.pdf', 3),
  ],
  seoTitle: 'STROXX | Premium tools, beastly low prices',
  seoDescription:
    'STROXX is exactly like all your expensive tools and good gear. It just does not cost nearly as much. Real value for money.',
  ogImage: '/brand/og.jpg',
  llmsTxt: LLMS_FALLBACK,
  chatEnabled: true,
  aiChatEnabled: false,
};

async function run() {
  // settings: defaults fill only the gaps, existing editor values win
  const existing = (await client.getDocument('siteSettings').catch(() => null)) as Record<string, unknown> | null;
  const settingsDoc: Record<string, unknown> = { ...SETTINGS_DEFAULTS };
  for (const [k, v] of Object.entries(existing ?? {})) {
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (!empty) settingsDoc[k] = v;
  }
  const tx = client.transaction();
  tx.createOrReplace(settingsDoc as any);
  tx.createOrReplace(homePage as any);
  for (const d of storeDocs) tx.createOrReplace(d as any);
  for (const d of specialistDocs) tx.createOrReplace(d as any);
  for (const d of testimonialDocs) tx.createOrReplace(d as any);
  for (const d of videoDocs) tx.createOrReplace(d as any);
  for (const d of legalDocs) tx.createOrReplace(d as any);
  const res = await tx.commit();
  // eslint-disable-next-line no-console
  console.log(`Seeded ${res.results.length} documents (siteSettings, homePage, ${storeDocs.length} stores, ${specialistDocs.length} specialists, ${testimonialDocs.length} testimonials, ${videoDocs.length} films, ${legalDocs.length} legal pages)`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
