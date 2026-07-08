/**
 * Populates the base ENGLISH copy for the /service and /support-index pages
 * that became CMS-editable (Site settings, Microcopy). This is the base pass
 * Clem + Tom refine later per the market-localisation plan.
 *
 * SAFE to run on the live dataset: it uses setIfMissing, so it only fills
 * fields that are still empty and never overwrites anything an editor has
 * already changed. It touches ONLY the siteSettings document (unlike
 * `npm run seed:more`, which also re-creates homePage / stores / etc.).
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:service
 *
 * These values mirror the defaults in scripts/seed-home-stores.ts
 * (SETTINGS_DEFAULTS) and the in-code fallbacks in app/service/page.tsx.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const FIELDS: Record<string, unknown> = {
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
};

async function run() {
  await client
    .patch('siteSettings')
    .setIfMissing(FIELDS)
    .commit({ returnDocuments: false });
  console.log('Base English /service + /support copy set (only fields that were empty; editor values untouched).');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
