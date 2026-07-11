/**
 * ONE-TIME migration for the English-slug sweep (2026-07-11): the English
 * base site dropped every Danish slug (routes, categories, trades, legal
 * pages, the proev-det campaign) and the guarantee PDF link became the
 * editable /satisfaction-guarantee CMS page.
 *
 * The app-side redirects (lib/redirects.ts danishTarget) keep every OLD URL
 * working, so this script is about the CMS side of the same rename:
 *
 *  1. legalPage docs: slug privatliv→privacy, handelsbetingelser→terms
 *     (seeded docs also move _id legal-privatliv→legal-privacy etc. so
 *     seed-home-stores re-runs can never create duplicates).
 *  2. Creates the /satisfaction-guarantee legalPage (real English terms,
 *     dealer-neutral) if it does not exist yet.
 *  3. landingPage docs: slug proev-det→try-it (all language versions).
 *  4. trade docs: slug toemrer→carpenter etc. + categories arrays to the
 *     English category slugs (seeded _id trade-<da> moves to trade-<en>).
 *  5. specialist.quoteTopic and testimonial.trades: Danish → English values.
 *  6. Every doc's internal link strings (nav/footer/CTA hrefs, redirect
 *     targets, serviceDocs...): /produkter → /products and friends, incl.
 *     the guarantee PDF → /satisfaction-guarantee.
 *
 * SAFE + idempotent: value translations only apply to known Danish values,
 * path rewrites only to exact old prefixes; a second run finds nothing to do.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run migrate:english-slugs
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const CATEGORY_DA_EN: Record<string, string> = {
  adgangskontrol: 'access-control',
  arbejdstoej: 'workwear',
  batterier: 'batteries',
  belysning: 'lighting',
  'bits-skruetraekkere': 'bits-screwdrivers',
  'bor-borsaet': 'drill-bits',
  fugemasse: 'sealant',
  hulsave: 'hole-saws',
  kabeltromler: 'cable-reels',
  kemi: 'chemicals',
  knive: 'knives',
  lasere: 'lasers',
  malergrej: 'painting-tools',
  multicutterklinger: 'multi-cutter-blades',
  maalevaerktoej: 'measuring-tools',
  rundsavklinger: 'circular-saw-blades',
  sikkerhed: 'safety',
  skurvognsartikler: 'site-hut-supplies',
  topnoegler: 'socket-sets',
};
const TRADE_DA_EN: Record<string, string> = {
  toemrer: 'carpenter',
  elektriker: 'electrician',
  vvs: 'plumber',
  maler: 'painter',
  murer: 'bricklayer',
};
const LEGAL_DA_EN: Record<string, string> = {
  privatliv: 'privacy',
  handelsbetingelser: 'terms',
};

/** Old path (exact or prefix) → new path. Longest keys first so /produkt/
 *  never wins over /produkter. Only used on strings that START with the key
 *  followed by end, '/', '?' or '#', so prose is never touched. */
const PATHS: [string, string][] = [
  ['/STROXX-tilfredshedsgaranti.pdf', '/satisfaction-guarantee'],
  ['/handelsbetingelser', '/terms'],
  ['/kampagne/proev-det', '/campaign/try-it'],
  ['/kampagne', '/campaign'],
  ['/kategori', '/products'],
  ['/komponenter', '/components'],
  ['/maanedens', '/monthly'],
  ['/nyheder', '/news'],
  ['/privatliv', '/privacy'],
  ['/produkter', '/products'],
  ['/produkt', '/product'],
  ['/proev-det', '/try-it'],
  ['/butikker', '/stores'],
  ['/fag', '/trades'],
];

function mapPath(v: string): string {
  for (const [oldP, newP] of PATHS) {
    if (v === oldP) return newP;
    if (v.startsWith(oldP + '/') || v.startsWith(oldP + '?') || v.startsWith(oldP + '#')) {
      let rest = v.slice(oldP.length);
      if (oldP === '/fag') {
        const m = rest.match(/^\/([a-z0-9-]+)(.*)$/);
        if (m && TRADE_DA_EN[m[1]]) rest = `/${TRADE_DA_EN[m[1]]}${m[2]}`;
      }
      return newP + rest;
    }
  }
  // old Danish ?cat= values on any path
  const cat = v.match(/^([^?#]*\?(?:.*&)?cat=)([a-z0-9-]+)(.*)$/);
  if (cat && CATEGORY_DA_EN[cat[2]]) return `${cat[1]}${CATEGORY_DA_EN[cat[2]]}${cat[3]}`;
  return v;
}

/** Recursively rewrite internal-path strings; returns null when unchanged. */
function rewrite(value: unknown): unknown | null {
  if (typeof value === 'string') {
    if (!value.startsWith('/')) return null;
    const next = mapPath(value);
    return next !== value ? next : null;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((v) => {
      const n = rewrite(v);
      if (n !== null) changed = true;
      return n !== null ? n : v;
    });
    return changed ? out : null;
  }
  if (value && typeof value === 'object') {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith('_') && k !== '_key' && k !== '_type') { out[k] = v; continue; }
      const n = rewrite(v);
      if (n !== null) changed = true;
      out[k] = n !== null ? n : v;
    }
    return changed ? out : null;
  }
  return null;
}

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
    gBlock('normal', 'Hand the product back at your dealer’s store together with the invoice or delivery note. If you bought online, contact the dealer’s customer service instead. Your dealer’s service phone number is in the footer of this site.'),
    gBlock('h2', 'Faults and defects'),
    gBlock('normal', 'Faults and defects are handled as a complaint under the dealer’s terms of sale and delivery, separately from this guarantee.'),
  ],
};

/** Move a seeded doc to its new deterministic _id (create new, delete old). */
async function renameId(doc: Record<string, unknown>, newId: string, patch: Record<string, unknown>) {
  const oldId = doc._id as string;
  const tx = client.transaction();
  tx.createIfNotExists({ ...doc, ...patch, _id: newId } as any);
  tx.delete(oldId);
  await tx.commit({ returnDocuments: false });
  console.log(`  ${oldId} → ${newId}`);
}

async function run() {
  /* 1 + 4: seeded legal + trade docs move _id AND slug; non-seeded ids just
     patch the slug in place */
  for (const [da, en] of Object.entries(LEGAL_DA_EN)) {
    const docs: Record<string, unknown>[] = await client.fetch('*[_type == "legalPage" && slug == $da]', { da });
    for (const d of docs) {
      if (d._id === `legal-${da}`) await renameId(d, `legal-${en}`, { slug: en });
      else { await client.patch(d._id as string).set({ slug: en }).commit({ returnDocuments: false }); console.log(`  ${d._id}: slug ${da} → ${en}`); }
    }
  }
  for (const [da, en] of Object.entries(TRADE_DA_EN)) {
    const docs: Record<string, unknown>[] = await client.fetch('*[_type == "trade" && slug.current == $da]', { da });
    for (const d of docs) {
      const cats = ((d.categories as string[] | undefined) ?? []).map((c) => CATEGORY_DA_EN[c] ?? c);
      const patch = { slug: { _type: 'slug', current: en }, categories: cats };
      if (d._id === `trade-${da}`) await renameId(d, `trade-${en}`, patch);
      else { await client.patch(d._id as string).set(patch).commit({ returnDocuments: false }); console.log(`  ${d._id}: slug ${da} → ${en}`); }
    }
  }

  /* 2: the guarantee page */
  await client.createIfNotExists(guaranteeDoc as any);
  console.log('  legal-satisfaction-guarantee ensured');

  /* 3: the campaign slug (every language version) */
  const landings: { _id: string }[] = await client.fetch('*[_type == "landingPage" && slug.current == "proev-det"]{_id}');
  for (const d of landings) {
    await client.patch(d._id).set({ 'slug.current': 'try-it' }).commit({ returnDocuments: false });
    console.log(`  ${d._id}: slug proev-det → try-it`);
  }

  /* 5: category/trade VALUES on specialists + testimonials */
  const specialists: { _id: string; quoteTopic?: string }[] = await client.fetch('*[_type == "specialist" && defined(quoteTopic)]{_id, quoteTopic}');
  for (const s of specialists) {
    const en = s.quoteTopic && CATEGORY_DA_EN[s.quoteTopic];
    if (en) { await client.patch(s._id).set({ quoteTopic: en }).commit({ returnDocuments: false }); console.log(`  ${s._id}: quoteTopic → ${en}`); }
  }
  const testimonials: { _id: string; trades?: string[] }[] = await client.fetch('*[_type == "testimonial" && defined(trades)]{_id, trades}');
  for (const t of testimonials) {
    const en = (t.trades ?? []).map((x) => TRADE_DA_EN[x] ?? x);
    if (JSON.stringify(en) !== JSON.stringify(t.trades)) {
      await client.patch(t._id).set({ trades: en }).commit({ returnDocuments: false });
      console.log(`  ${t._id}: trades → ${en.join(', ')}`);
    }
  }

  /* 6: internal links everywhere else (nav/footer/CTAs/redirect targets/
     serviceDocs/portable-text link marks). Drafts included. */
  const all: Record<string, unknown>[] = await client.fetch(
    '*[_type in ["siteSettings","homePage","landingPage","supportPage","post","legalPage","monthlyLineup","trade","productAugment","redirect","qrCode","market","store"]]'
  );
  let linkPatches = 0;
  for (const doc of all) {
    const { _id, _type, _rev, _createdAt, _updatedAt, ...fields } = doc as Record<string, unknown> & { _id: string };
    const next = rewrite(fields) as Record<string, unknown> | null;
    if (next) {
      const changedKeys = Object.keys(next).filter((k) => JSON.stringify(next[k]) !== JSON.stringify((fields as Record<string, unknown>)[k]));
      const patch: Record<string, unknown> = {};
      for (const k of changedKeys) patch[k] = next[k];
      if (Object.keys(patch).length) {
        await client.patch(_id as string).set(patch).commit({ returnDocuments: false });
        console.log(`  ${_id}: links updated (${changedKeys.join(', ')})`);
        linkPatches++;
      }
    }
  }
  console.log(`Done. ${linkPatches} documents had internal links rewritten.`);
  console.log('NOTE: prose fields that mention one dealer by name (e.g. serviceFaq answers) are content, not slugs — review those in the Studio per the market plan.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
