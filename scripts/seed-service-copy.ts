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
  serviceContactBody: 'Your dealer\'s customer service is ready on the number in the footer. Or skip the queue and call a specialist directly at your nearest store.',
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
