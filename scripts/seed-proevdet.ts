/**
 * Migrates the hand-built /proev-det campaign into a CMS landingPage so it
 * becomes fully editor-managed (and click-to-edit) at /kampagne/proev-det,
 * and points the homepage campaign band's "Read more" reference at it.
 *
 * Faithful reconstruction of app/proev-det/page.tsx using the landingPage
 * section blocks (photoHero, statement, reframe, productProof, videoProof,
 * testimonialProof, photoBreak, guaranteeAsk, faqSection). Images reuse the
 * existing /public/Images/campaign shots via the section "image" (path) field.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:proevdet
 *
 * Idempotent: createOrReplace with a fixed _id, and a set() patch on the
 * homepage singleton. Re-running restores this exact campaign.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const LANDING_ID = 'landingPage-proev-det';

const landing = {
  _id: LANDING_ID,
  _type: 'landingPage',
  title: 'Try It — afford more than just tools',
  slug: { current: 'proev-det' }, // historic slug preserved; now lives at /kampagne/proev-det
  seoTitle: 'Afford more than just tools',
  seoDescription:
    'You pay for the logo, not the steel. STROXX is professional quality without the brand markup, backed by a 100% satisfaction guarantee. Try it for 30 days.',
  sections: [
    {
      _type: 'photoHero',
      _key: 'hero',
      eyebrow: 'Campaign · Try It',
      headline: 'Pro-grade tools. \n Without the *brand* tax.',
      sub: 'Professional tools without the logo markup. And yes, it sounds too good to be true. That’s why you get *30 days* to prove us wrong.',
      ctaLabel: 'Buy at Carl Ras',
      secondaryLabel: 'Why so affordable?',
      image: '/Images/campaign/rings.jpg',
      align: 'left',
      height: 'full',
    },
    {
      _type: 'statement',
      _key: 'frustration',
      eyebrow: 'The feeling',
      headline: 'You’re not paying for the tool. \n You’re paying for *the name.*',
      paragraphs: [
        'A new machine, a set of bits, a knife. You put it on the counter and pay a price you’ve learned to accept. But somewhere in the back of your mind, you know it: part of that amount doesn’t go to the steel in your hand. It goes to the advertising, the sponsorships and the logo on the side.',
      ],
      align: 'left',
    },
    {
      _type: 'statement',
      _key: 'habit',
      eyebrow: 'The habit',
      headline: 'Expensive feels safe. \n That’s the whole *trick.*',
      paragraphs: [
        'When you’re holding two tools, the brain picks the expensive one. Not because you’ve tested it, but because the price feels like a guarantee. And because nobody looks foolish for buying the well-known brand.',
        'But price doesn’t measure quality. Tolerances, materials and durability do. And those aren’t printed on the price tag.',
      ],
      align: 'right',
    },
    {
      _type: 'reframe',
      _key: 'reframe',
      eyebrow: 'How it’s possible',
      headline: '*Same* steel. \n Without the brand tax.',
      paragraphs: [
        'STROXX is developed in close collaboration between trade pros in Denmark, Germany, France and Belgium. We set the specifications ourselves, choose the materials ourselves and cut every unnecessary step, logo premium and costly markup.',
        'What you pay for is the tool. Not the advertising for it.',
      ],
      stats: [
        { _type: 'stat', _key: 's1', value: 4, suffix: '', label: 'countries behind it' },
        { _type: 'stat', _key: 's2', value: 227, suffix: '+', label: 'stores in Europe' },
        { _type: 'stat', _key: 's3', value: 1400, suffix: '+', label: 'item numbers' },
      ],
    },
    {
      _type: 'productProof',
      _key: 'proof',
      eyebrow: 'The proof',
      headline: 'Built to *perform.* \n Not to shine.',
      sub: 'Built to take the beating. To go the distance. To handle the pressure. See for yourself, right below.',
      skus: ['34011573', '34009021', '35011812', '35011846'],
    },
    {
      _type: 'videoProof',
      _key: 'video',
      eyebrow: 'See it in action',
      headline: 'Words are cheap. \n See for yourself.',
      sub: 'The tools at work, filmed by our European partners. No studio lights, no filters.',
    },
    {
      _type: 'testimonialProof',
      _key: 'testi',
      eyebrow: 'From the people who use it',
      headline: 'Don’t take our word. \n Take *the trade’s.*',
    },
    {
      _type: 'photoBreak',
      _key: 'payoff',
      eyebrow: 'What changes',
      headline: 'Room for the *fine china.*',
      sub: 'Same work. Same quality. But there’s money left over for the rest of life.',
      image: '/Images/campaign/tea.jpg',
    },
    {
      _type: 'guaranteeAsk',
      _key: 'ask',
      eyebrow: 'And if we’re wrong?',
      headline: '100% *happy.* Or \n your money back.',
      sub: 'Still sounds too good to be true? That’s exactly why we say: *TRY IT.* Here’s how.',
      steps: [
        { _type: 'step', _key: 'st1', title: 'Find your store', body: '26 stores across the country, or buy online at Carl Ras. Get the tool in your hand first, if you like.' },
        { _type: 'step', _key: 'st2', title: 'Use it on real work', body: 'Not five minutes in the driveway. 30 days on site, where it counts.' },
        { _type: 'step', _key: 'st3', title: 'Happy? Or your money back', body: 'If you’re not satisfied, you get your money back. No need for faults, your judgment is enough.' },
      ],
      ctaLabel: 'Buy at Carl Ras',
      secondaryLabel: 'Find your store',
      secondaryHref: '/butikker',
    },
    {
      _type: 'faqSection',
      _key: 'faq',
      eyebrow: 'Questions',
      headline: 'What you’re probably \n *thinking* anyway.',
      items: [
        { _type: 'faqItem', _key: 'q1', q: 'How does the STROXX satisfaction guarantee work?', a: 'You try the tool on real work for 30 days. If you’re not happy, you get your money back. No need for faults or defects, your judgment is enough. The guarantee applies to business customers with an account at Carl Ras.' },
        { _type: 'faqItem', _key: 'q2', q: 'What does the guarantee cover, and what does it not?', a: 'It covers all STROXX products except access control. For bulk purchases, the guarantee applies to the first item bought. Returns are handled at your Carl Ras store with an invoice or delivery note, and for online orders via customer service on 44 85 55 11.' },
        { _type: 'faqItem', _key: 'q3', q: 'Where can I buy STROXX?', a: 'In Denmark, STROXX is available exclusively at Carl Ras, in 26 stores across the country and online at carl-ras.dk. Across the rest of Europe, the brand is sold through chains like Meesenburg in Germany, Foussier in France and Lecot in Belgium.' },
        { _type: 'faqItem', _key: 'q4', q: 'How can STROXX be so affordable?', a: 'STROXX is developed by trade pros in Denmark, Germany, France and Belgium, who set the specifications and choose the materials themselves. There are no logo premiums, sponsorships or costly middlemen. You pay for the tool, not for the advertising.' },
        { _type: 'faqItem', _key: 'q5', q: 'Is STROXX professional quality?', a: 'Yes. STROXX is built for professional use and spans over 1,400 item numbers, sold in more than 227 stores across Europe. Tolerances, materials and durability measure quality, not the price tag. That’s why we back it with a 30-day satisfaction guarantee.' },
      ],
    },
  ],
};

async function run() {
  console.log('Writing the proev-det landing page…');
  await client.createOrReplace(landing);

  console.log('Pointing the homepage campaign band at it…');
  const homeId: string | null = await client.fetch('*[_type == "homePage"][0]._id');
  if (homeId) {
    await client
      .patch(homeId)
      .set({ campaignLink: { _type: 'reference', _ref: LANDING_ID } })
      .commit({ visibility: 'async' });
    console.log(`  homePage (${homeId}).campaignLink → ${LANDING_ID}`);
  } else {
    console.log('  no homePage document yet — set the "Read more → campaign page" reference in the Studio.');
  }

  console.log('Done. /kampagne/proev-det is now CMS-driven; /proev-det redirects to it.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
