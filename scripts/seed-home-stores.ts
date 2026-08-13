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

const homePage: Record<string, unknown> = {
  _id: 'homePage',
  _type: 'homePage',
  language: 'en', // English base tag — a re-run must never strip it
  ...HOME_DEFAULTS,
  stats: HOME_DEFAULTS.stats.map((s, i) => ({ _type: 'stat', _key: `seed-${i}`, ...s })),
};
/* campaignHref is COMPUTED by getHomePage from the campaignLink reference —
   not a schema field, so never seed it */
delete homePage.campaignHref;


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
  ...(s.phone ? { storePhone: s.phone } : {}),
  ...(s.email ? { storeEmail: s.email } : {}),
  ...(s.manager
    ? {
        managerName: s.manager.name,
        managerEmail: s.manager.email,
        managerPhone: s.manager.phone,
        managerPhoto: s.manager.photo,
        managerConsent: true, // snapshot data was already public on carl-ras.dk
      }
    : {}),
  ...(s.monThu ? { openMonThu: s.monThu[0], closeMonThu: s.monThu[1] } : {}),
  ...(s.fri ? { openFri: s.fri[0], closeFri: s.fri[1] } : {}),
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
  language: 'en', // English base tag, a re-run must never strip it
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
  language: 'en', // English base tag, a re-run must never strip it
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
  blurb: t.blurb,
  categories: t.categories,
  faq: t.faq.map((f, j) => ({ _type: 'object', _key: `seed-${j}`, q: f.q, a: f.a })),
  order: (i + 1) * 10,
  active: true,
}));

const videoDocs = videos.map((v, i) => ({
  _id: `video-${v.id}`,
  _type: 'video',
  language: 'en', // English base tag, a re-run must never strip it
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
  { slug: 'privacy', title: 'Privacy policy' },
  { slug: 'cookies', title: 'Cookie policy' },
  { slug: 'terms', title: 'Terms of sale' },
].map((l) => ({
  _id: `legal-${l.slug}`,
  _type: 'legalPage',
  title: l.title,
  slug: l.slug,
  body: legalBlock(
    'PLACEHOLDER: this text is awaiting sign-off from the legal team. Replace this paragraph with the approved policy before launch.'
  ),
}));

/* The guarantee terms page (/satisfaction-guarantee): unlike the three legal
   placeholders above, this ships with the REAL English-base terms (from the
   official guarantee document), dealer-neutral so every market can start
   from it. Seeded with createIfNotExists so an editor-refined version is
   never clobbered; scripts/migrate-english-slugs.ts creates the same doc
   (same _id), so either script can run first. */
let gKey = 0;
const gBlock = (style: string, text: string) => ({
  _type: 'block',
  _key: `seed-g${++gKey}`,
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: `seed-g${gKey}a`, text, marks: [] }],
});
const guaranteeDoc = {
  _id: 'legal-satisfaction-guarantee',
  _type: 'legalPage',
  language: 'en',
  title: '30-day satisfaction guarantee',
  slug: 'satisfaction-guarantee',
  body: [
    gBlock('normal', 'STROXX tools are built for professional use, and we stand behind them. If you are not satisfied with a STROXX product, you get your money back. Not satisfied is your own judgment: there is no requirement that the product is faulty or defective.'),
    gBlock('h2', 'Who is covered'),
    gBlock('normal', 'The guarantee applies to business customers with an account at their STROXX dealer. It runs for 30 days from the date of purchase, so you can put the product to work on real jobs before you decide.'),
    gBlock('h2', 'What is covered'),
    gBlock('normal', 'The guarantee covers all STROXX products with one exception: access control products are not covered. When buying multiple identical items, the guarantee applies to the first item purchased, so test the product before you stock up.'),
    gBlock('h2', 'How to return'),
    gBlock('normal', 'Hand the product back at your dealer\u2019s store together with the invoice or delivery note. If you bought online, contact the dealer\u2019s customer service instead. Your dealer\u2019s service phone number is in the footer of this site.'),
    gBlock('h2', 'Faults and defects'),
    gBlock('normal', 'Faults and defects are handled as a complaint under the dealer\u2019s terms of sale and delivery, separately from this guarantee.'),
  ],
};


/* Site settings: populate every field with the value the site actually uses,
   so editors see reality instead of empty fields. Existing non-empty values
   are kept (merge happens in run()). */
const lk = (label: string, href: string, i: number) => ({ _type: 'navLink', _key: `seed-${i}`, label, href });
const SETTINGS_DEFAULTS: Record<string, unknown> = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  /* i18n: this IS the English base doc — seed the tag so a re-run can never
     strip it (locale-aware queries would go blank without it) */
  language: 'en',
  /* No dealer identity/contact here: dealerName, phone and legal line live on
     the MARKET documents (seed:markets). This doc is the ENGLISH BASE and it
     renders on the international site, so it must stay dealer-neutral.
     Localized supportHours is authored per market at translation time. */
  navLinks: [
    lk('Tool of the Month', '/monthly', 1),
    lk('Products', '/products', 2),
    lk('Stores', '/stores', 3),
    lk('Trades', '/trades', 5),
    lk('Try It', '/try-it', 6),
    lk('Service and Support', '/service', 7),
  ],
  footerPageLinks: [
    lk('Tool of the Month', '/monthly', 1),
    lk('Products', '/products', 2),
    lk('News', '/news', 8),
    lk('Trades', '/trades', 3),
    lk('Stores', '/stores', 4),
    lk('Campaign: Try It', '/try-it', 5),
    lk('Service and Support', '/service', 7),
  ],
  footerBuyLinks: [
    /* no dealer link here: the footer renders the market-aware FooterBuyLink
       itself (and filters raw carl-ras links out defensively) */
    lk('Find a store', '/stores', 2),
    lk('Satisfaction guarantee', '/satisfaction-guarantee', 3),
  ],
  footerAbout:
    'STROXX is a European brand for professional tradespeople, developed together with trade experts and sold through one exclusive dealer per market: Carl Ras in Denmark, Meesenburg in Germany, Foussier in France and Lecot in Belgium.',
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
    'Filter the range and jump straight to the buy at your dealer. A selection of the 1,400+ item numbers. The purchase always happens on the dealer platform.',
  butikkerHeadlineStores: 'Get the tool in your hand before you buy it.',
  serviceHeadline: 'Help is as straightforward *as the tools.*',
  serviceIntro:
    "No ten-step forms and no hold music. Here's the guarantee, the returns, the documents and the people, all in one place.",
  serviceGuaranteeHeading: '30-day satisfaction guarantee',
  serviceGuaranteeBody:
    "Try STROXX on real work for 30 days. If you're not happy, you get your money back. No need for faults, your judgment is enough. Applies to all STROXX products except access control, for business customers with a dealer account.",
  serviceReturnsHeading: 'How to return',
  serviceReturnSteps: [
    { _key: 'step1', _type: 'step', title: 'Find your invoice or delivery note', body: "The guarantee applies to business customers with a dealer account. Your proof of purchase is enough, the item doesn't need to be faulty." },
    { _key: 'step2', _type: 'step', title: "Go to your dealer's store", body: "Hand the item in at your STROXX store. If you bought online, call the dealer's customer service instead." },
    { _key: 'step3', _type: 'step', title: 'Money back', body: 'No discussion and no need for faults. Your judgment is enough. For bulk purchases, the guarantee applies to the first item bought.' },
  ],
  serviceDocsHeading: 'Documents',
  serviceDocs: [
    { _key: 'd1', _type: 'doc', label: 'Satisfaction guarantee, full terms', href: '/satisfaction-guarantee' },
    { _key: 'd2', _type: 'doc', label: 'Terms of sale', href: '/terms' },
    { _key: 'd3', _type: 'doc', label: 'Privacy policy', href: '/privacy' },
    { _key: 'd4', _type: 'doc', label: 'Cookie policy', href: '/cookies' },
  ],
  serviceDocsPending: 'Product catalogues and safety data sheets for chemicals will appear here once the DAM integration is in place.',
  serviceContactHeading: 'Talk to a human',
  serviceContactBody: "Your STROXX dealer's customer service is ready to help, and every store has a specialist you can call directly. Find yours on the map.",
  serviceFaqEyebrow: 'Questions and answers',
  serviceFaqHeading: 'The practical stuff, *in brief.*',
  serviceFaq: [
    { _key: 'q1', _type: 'qa', question: 'Who can use the satisfaction guarantee?', answer: "Business customers with an account at your STROXX dealer. If you don't have an account yet, you set one up with the dealer, and then the 30 days apply to you too." },
    { _key: 'q2', _type: 'qa', question: 'Does the item have to be unused when I return it?', answer: "No, that's the whole point. The guarantee is for 30 days on real work, not five minutes in the driveway. Bring the item to your dealer's store along with the invoice or delivery note. For bulk purchases, the guarantee applies to the first item bought." },
    { _key: 'q3', _type: 'qa', question: 'What do I do if the item is defective?', answer: 'Faults and defects are not a guarantee matter but a complaint, and your dealer handles that under their terms of sale and delivery. Bring the item to the store or call their customer service.', linkText: 'Terms of sale', linkUrl: '/terms' },
    { _key: 'q4', _type: 'qa', question: 'How do delivery and shipping work?', answer: "Every purchase is made at your STROXX dealer, in store or online, and delivery options are shown at checkout. The full terms are in the dealer's terms of sale and delivery." },
    { _key: 'q5', _type: 'qa', question: 'Where do I find safety data sheets for chemical products?', answer: "They're on their way to this page. Until then, your dealer's customer service provides them, or ask in your local store." },
  ],
  supportIndexHeadline: 'Manuals & downloads.',
  supportIndexIntro: 'User instructions, software guides and product documentation, in your language. Scan the code on the box and you land here.',
  notFoundHeadline: 'This page took\nthe *day off.*',
  notFoundText: "The address doesn't exist (anymore). The tools do, though, and they're this way.",
  seoTitle: 'STROXX | The smart, reliable alternative in professional tools',
  seoDescription:
    'Professional tools, specified with the trades across Europe and backed by a 30-day satisfaction guarantee. Put them to work, then decide.',
  ogImage: '/brand/og.jpg',
  llmsTxt: LLMS_FALLBACK,
  chatEnabled: true,
  aiChatEnabled: false,
  /* No newsletterEnabled / newsletterProvider here: the newsletter OPERATIONS
     (on/off, provider, keys, list ID) live on the MARKET docs since
     2026-07-11. Only the per-language form words + popup rules stay below. */
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
  /* Retired fields (dealer identity/contact moved to the market docs) + DK
     values that must not sit on the dealer-neutral English base: actively
     dropped so old data can't linger from earlier seeds or editor input.
     The second batch is the per-market OPERATIONS moved to the market docs
     2026-07-11 (tracking + newsletter provider/keys). RUN THE MIGRATION FIRST:
     scripts/migrate-market-ops.ts (npm run migrate:market-ops) copies these
     values onto the market docs; only then may this seed clean them off the
     siteSettings doc, otherwise the live GTM/Cookiebot/newsletter config is
     lost with nothing having inherited it. */
  for (const k of [
    'retailerName', 'retailerLogo', 'retailerLogoHref', 'supportPhone', 'legalLine', 'supportHours',
    'gtmId', 'cookiebotId', 'newsletterStatus', 'newsletterEnabled', 'newsletterProvider',
    'mailchimpApiKey', 'klaviyoApiKey', 'marketoBaseUrl', 'marketoClientId', 'marketoClientSecret',
    'newsletterWebhookUrl', 'newsletterListId',
  ]) {
    delete settingsDoc[k];
  }
  const tx = client.transaction();
  tx.createOrReplace(settingsDoc as any);
  /* the /trades overview page doc: createIfNotExists so an editor-refined
     version is never overwritten by a seed re-run */
  tx.createIfNotExists({
    _id: 'tradesIndex-en',
    _type: 'tradesIndex',
    language: 'en',
    headline: 'Your trade. *Your tools.*',
    intro:
      "Skip the catalog and start with what you do. We've pulled together the workhorses for every trade, without the brand markup and backed by a 30-day satisfaction guarantee.",
  } as any);
  tx.createOrReplace(homePage as any);
  for (const d of storeDocs) tx.createOrReplace(d as any);
  for (const d of specialistDocs) tx.createOrReplace(d as any);
  for (const d of testimonialDocs) tx.createOrReplace(d as any);
  for (const d of tradeDocs) tx.createOrReplace(d as any);
  for (const d of videoDocs) tx.createOrReplace(d as any);
  /* createIfNotExists since 2026-07-12: /terms carries REAL routing content
     in the dataset (purchases happen at the dealer, links to all four dealers'
     terms), and a seed re-run must never reset a legal page to placeholder. */
  for (const d of legalDocs) tx.createIfNotExists(d as any);
  tx.createIfNotExists(guaranteeDoc as any);
  const res = await tx.commit();
  // eslint-disable-next-line no-console
  console.log(`Seeded ${res.results.length} documents (siteSettings, homePage, ${storeDocs.length} stores, ${specialistDocs.length} specialists, ${testimonialDocs.length} testimonials, ${tradeDocs.length} trades, ${videoDocs.length} films, ${legalDocs.length} legal pages)`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
