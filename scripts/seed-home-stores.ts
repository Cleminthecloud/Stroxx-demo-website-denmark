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
import { trades } from '../lib/trades';
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
  country: s.country,
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
  ...(s.specialist
    ? {
        specialist: {
          name: s.specialist.name,
          ...(s.specialist.role ? { role: s.specialist.role } : {}),
          ...(s.specialist.email ? { email: s.specialist.email } : {}),
          ...(s.specialist.phone ? { phone: s.specialist.phone } : {}),
          ...(s.specialist.photo ? { photo: s.specialist.photo } : {}),
          consent: true, // snapshot data was already public on the dealer site
        },
      }
    : {}),
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

const tradeDocs = trades.map((t, i) => ({
  _id: `trade-${t.slug}`,
  _type: 'trade',
  name: t.name,
  slug: { _type: 'slug', current: t.slug },
  title: t.title,
  accent: t.accent,
  blurb: t.blurb,
  categories: t.categories,
  faq: t.faq.map((f, j) => ({ _type: 'object', _key: `seed-${j}`, q: f.q, a: f.a })),
  order: (i + 1) * 10,
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
    lk('Trades', '/fag', 5),
    lk('Try It', '/proev-det', 6),
    lk('Service and Support', '/service', 7),
  ],
  footerPageLinks: [
    lk('Tool of the Month', '/maanedens', 1),
    lk('Products', '/produkter', 2),
    lk('News', '/nyheder', 8),
    lk('Trades', '/fag', 3),
    lk('Stores', '/butikker', 4),
    lk('Campaign: Try It', '/proev-det', 5),
    lk('Service and Support', '/service', 7),
  ],
  footerBuyLinks: [
    lk('Buy STROXX', 'https://www.carl-ras.dk/maerker/stroxx/?utm_source=cr-byg&utm_medium=brandsite_link&utm_campaign=stroxx', 1),
    lk('Find a store', '/butikker', 2),
    lk('Satisfaction guarantee (PDF)', '/STROXX-tilfredshedsgaranti.pdf', 3),
  ],
  footerAbout:
    'STROXX is available exclusively at Carl Ras in Denmark. The brand is developed together with strong partners in Germany, France and Belgium, and is also stocked through chains like Meesenburg, Foussier and Lecot.',
  chatFabLabel: 'Talk to a specialist',
  chatPanelHeadline: 'Talk to a specialist.',
  chatPanelText: 'Our store managers are tradespeople themselves. Call direct, no phone queue, no switchboard.',
  chatGreeting: 'Hi! I am the STROXX AI assistant. Ask me about products, the guarantee or the stores, or ask for a human any time.',
  chatFallback: 'I would rather not guess on that, it deserves a real answer. Want me to put you through to a specialist? Type "yes" and I will sort it.',
  proClubHeadline: 'Know it before everyone else',
  proClubText: 'Early access and specialist tips, straight to your inbox. A couple of emails a month, tops. No spam.',
  newsHeadline: "What's happening.",
  newsIntro: 'Tips, specialist know-how and news from the trades. Filter by what you work with.',
  newsEmpty: 'Nothing published yet. The first stories are on their way.',
  newsletterSuccess: 'Check your inbox to confirm. Welcome aboard.',
  produkterHeadline: 'Find your STROXX tool',
  produkterIntro:
    'Filter the range and jump straight to the buy at Carl Ras. A selection of the 1,400+ item numbers. The purchase always happens on the partner platform.',
  butikkerHeadlineStores: 'Get the tool in your hand before you buy it.',
  serviceHeadline: 'Help is as straightforward *as the tools.*',
  serviceIntro:
    "No ten-step forms and no hold music. Here's the guarantee, the returns, the documents and the people, all in one place.",
  serviceGuaranteeHeading: '30-day satisfaction guarantee',
  serviceGuaranteeBody:
    "Try STROXX on real work for 30 days. If you're not happy, you get your money back. No need for faults, your judgment is enough. Applies to all STROXX products except access control, for business customers with an account at Carl Ras.",
  serviceReturnsHeading: 'How to return',
  serviceReturnSteps: [
    { _key: 'step1', _type: 'step', title: 'Find your invoice or delivery note', body: "The guarantee applies to business customers with an account at Carl Ras. Your proof of purchase is enough, the item doesn't need to be faulty." },
    { _key: 'step2', _type: 'step', title: 'Go to your Carl Ras store', body: 'Hand the item in at one of the 26 stores. If you bought online, call customer service on 44 85 55 11 instead.' },
    { _key: 'step3', _type: 'step', title: 'Money back', body: 'No discussion and no need for faults. Your judgment is enough. For bulk purchases, the guarantee applies to the first item bought.' },
  ],
  serviceDocsHeading: 'Documents',
  serviceDocs: [
    { _key: 'd1', _type: 'doc', label: 'Satisfaction guarantee, full terms (PDF)', href: '/STROXX-tilfredshedsgaranti.pdf' },
    { _key: 'd2', _type: 'doc', label: 'Terms of sale and delivery (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/salgs-og-leveringsbetingelser/' },
    { _key: 'd3', _type: 'doc', label: 'Privacy policy (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/persondatapolitik/' },
    { _key: 'd4', _type: 'doc', label: 'Cookie policy (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/cookiepolitik/' },
  ],
  serviceDocsPending: 'Product catalogues and safety data sheets for chemicals will appear here once the DAM integration is in place.',
  serviceContactHeading: 'Talk to a human',
  serviceContactBody: 'Carl Ras customer service is ready on 44 85 55 11 (Mon-Thu 07-16, Fri 07-15). Or skip the queue and call a specialist directly at your nearest store.',
  serviceFaqEyebrow: 'Questions and answers',
  serviceFaqHeading: 'The practical stuff, *in brief.*',
  serviceFaq: [
    { _key: 'q1', _type: 'qa', question: 'Who can use the satisfaction guarantee?', answer: "Business customers with an account at Carl Ras. If you don't have an account yet, you set one up at Carl Ras under \"Become a customer\", and then the 30 days apply to you too.", linkText: 'Become a customer at Carl Ras', linkUrl: 'https://www.carl-ras.dk/kundeservice/bliv-kunde/' },
    { _key: 'q2', _type: 'qa', question: 'Does the item have to be unused when I return it?', answer: "No, that's the whole point. The guarantee is for 30 days on real work, not five minutes in the driveway. Bring the item to your Carl Ras store along with the invoice or delivery note. For bulk purchases, the guarantee applies to the first item bought." },
    { _key: 'q3', _type: 'qa', question: 'What do I do if the item is defective?', answer: 'Faults and defects are not a guarantee matter but a complaint, and Carl Ras handles that under their terms of sale and delivery. Bring the item to the store or call customer service on 44 85 55 11.', linkText: 'Terms of sale and delivery', linkUrl: 'https://www.carl-ras.dk/kundeservice/salgs-og-leveringsbetingelser/' },
    { _key: 'q4', _type: 'qa', question: 'How do delivery and shipping work?', answer: 'Every purchase is made at Carl Ras, in store or at carl-ras.dk, and delivery options and prices are shown at checkout. The full terms are in the Carl Ras terms of sale and delivery.' },
    { _key: 'q5', _type: 'qa', question: 'Where do I find safety data sheets for chemical products?', answer: "They're on their way to this page. Until then, Carl Ras customer service provides them on 44 85 55 11 or in your local store." },
  ],
  supportIndexHeadline: 'Manuals & downloads.',
  supportIndexIntro: 'User instructions, software guides and product documentation, in your language. Scan the code on the box and you land here.',
  fagHeadline: 'Your trade. *Your tools.*',
  fagIntro:
    "Skip the catalog and start with what you do. We've pulled together the workhorses for every trade, without the brand markup and backed by a 30-day satisfaction guarantee.",
  notFoundHeadline: 'This page took\nthe *day off.*',
  notFoundText: "The address doesn't exist (anymore). The tools do, though, and they're this way.",
  seoTitle: 'STROXX | Premium tools, beastly low prices',
  seoDescription:
    'STROXX is exactly like all your expensive tools and good gear. It just does not cost nearly as much. Real value for money.',
  ogImage: '/brand/og.jpg',
  llmsTxt: LLMS_FALLBACK,
  chatEnabled: true,
  aiChatEnabled: false,
  newsletterEnabled: false,
  newsletterProvider: 'mailchimp',
  newsletterHeadline: 'Sharp offers, no spam.',
  newsletterText: 'The monthly lineup and the sharpest prices, straight to your inbox.',
  newsletterButtonLabel: 'Sign up',
  newsletterDisclaimer: 'Unsubscribe anytime. We only write when it is worth your time.',
  newsletterBandEnabled: true,
  newsletterPopupEnabled: false,
  newsletterPopupDelay: 8,
  newsletterPopupScroll: 50,
  newsletterPopupFrequencyDays: 14,
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
  for (const d of tradeDocs) tx.createOrReplace(d as any);
  for (const d of videoDocs) tx.createOrReplace(d as any);
  for (const d of legalDocs) tx.createOrReplace(d as any);
  const res = await tx.commit();
  // eslint-disable-next-line no-console
  console.log(`Seeded ${res.results.length} documents (siteSettings, homePage, ${storeDocs.length} stores, ${specialistDocs.length} specialists, ${testimonialDocs.length} testimonials, ${tradeDocs.length} trades, ${videoDocs.length} films, ${legalDocs.length} legal pages)`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
