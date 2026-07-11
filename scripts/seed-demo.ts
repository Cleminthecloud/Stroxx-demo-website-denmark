/**
 * Seeds the Sanity `demo` dataset with the site's current hardcoded content,
 * so the first Studio session shows real copy, not lorem.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed
 *
 * Idempotent: createOrReplace with fixed _ids, safe to run again.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const k = (n: number) => `seed-${n}`;

/* Dealer identity/contact lives on the MARKET docs (seed:markets), and this is
   the dealer-neutral ENGLISH BASE settings doc: no retailer/phone/legal here.
   BOOTSTRAP ONLY: written with createIfNotExists, never createOrReplace. The
   full settings body is owned by seed:more (merge-preserving); replacing the
   doc from here would WIPE every editor-entered value incl. the encrypted
   newsletter keys. */
const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  language: 'en', // English base tag — see seed-home-stores note
};

const landingPage = {
  _id: 'landing-try-it',
  _type: 'landingPage',
  language: 'en',
  title: 'Campaign: Try It',
  slug: { _type: 'slug', current: 'try-it' },
  seoTitle: 'Afford more than just tools',
  seoDescription:
    'You pay for the logo, not the steel. STROXX is professional quality without the brand markup, backed by a 100% satisfaction guarantee. Try it for 30 days.',
  sections: [
    {
      _type: 'photoHero',
      _key: k(1),
      eyebrow: 'Campaign · Try It',
      headline: 'Pro-grade tools.\nWithout the *brand* tax.',
      sub: "Professional tools without the logo markup. And yes, it sounds too good to be true. That's why you get *30 days* to prove us wrong.",
      ctaLabel: 'Where to buy',
      secondaryLabel: 'Why so affordable?',
      image: '/Images/campaign/rings.jpg',
    },
    {
      _type: 'statement',
      _key: k(2),
      eyebrow: 'The feeling',
      headline: "You're not paying for the tool. \n You're paying for *the name.*",
      paragraphs: [
        "A new machine, a set of bits, a knife. You put it on the counter and pay a price you've learned to accept. But somewhere in the back of your mind, you know it: part of that amount doesn't go to the steel in your hand. It goes to the advertising, the sponsorships and the logo on the side.",
      ],
      align: 'left',
    },
    {
      _type: 'statement',
      _key: k(3),
      eyebrow: 'The habit',
      headline: "Expensive feels safe. \n That's the whole *trick.*",
      paragraphs: [
        "When you're holding two tools, the brain picks the expensive one. Not because you've tested it, but because the price feels like a guarantee. And because nobody looks foolish for buying the well-known brand.",
        "But price doesn't measure quality. Tolerances, materials and durability do. And those aren't printed on the price tag.",
      ],
      align: 'right',
    },
    {
      _type: 'reframe',
      _key: k(4),
      eyebrow: "How it's possible",
      headline: '*Same* steel. \n Without the brand tax.',
      paragraphs: [
        'STROXX is developed in close collaboration between trade pros in Denmark, Germany, France and Belgium. We set the specifications ourselves, choose the materials ourselves and cut every unnecessary step, logo premium and costly markup.',
        'What you pay for is the tool. Not the advertising for it.',
      ],
      stats: [
        { _type: 'stat', _key: k(41), value: 4, suffix: '', label: 'countries behind it' },
        { _type: 'stat', _key: k(42), value: 227, suffix: '+', label: 'stores in Europe' },
        { _type: 'stat', _key: k(43), value: 1400, suffix: '+', label: 'item numbers' },
      ],
    },
    {
      _type: 'productProof',
      _key: k(5),
      eyebrow: 'The proof',
      headline: 'Built to *perform.* \n Not to shine.',
      sub: 'Built to take the beating. To go the distance. To handle the pressure. See for yourself, right below.',
      skus: ['34011573', '34009021', '35011812', '35011846'],
    },
    {
      _type: 'videoProof',
      _key: k(6),
      eyebrow: 'See it in action',
      headline: 'Words are cheap. \n See for yourself.',
      sub: 'The tools at work, filmed by our European partners. No studio lights, no filters.',
    },
    {
      _type: 'testimonialProof',
      _key: k(7),
      eyebrow: 'From the people who use it',
      headline: "Don't take our word. \n Take *the trade's.*",
    },
    {
      _type: 'photoBreak',
      _key: k(8),
      eyebrow: 'What changes',
      headline: 'Room for the *fine china.*',
      sub: "Same work. Same quality. But there's money left over for the rest of life.",
      image: '/Images/campaign/tea.jpg',
    },
    {
      _type: 'guaranteeAsk',
      _key: k(9),
      eyebrow: "And if we're wrong?",
      headline: '100% *happy.* Or \n your money back.',
      sub: "Still sounds too good to be true? That's exactly why we say: *TRY IT.* Here's how.",
      steps: [
        {
          _type: 'step',
          _key: k(91),
          title: 'Find your store',
          body: '26 stores across the country, or buy online at Carl Ras. Get the tool in your hand first, if you like.',
        },
        {
          _type: 'step',
          _key: k(92),
          title: 'Use it on real work',
          body: 'Not five minutes in the driveway. 30 days on site, where it counts.',
        },
        {
          _type: 'step',
          _key: k(93),
          title: 'Happy? Or your money back',
          body: "If you're not satisfied, you get your money back. No need for faults, your judgment is enough.",
        },
      ],
      ctaLabel: 'Where to buy',
      secondaryLabel: 'Find your store',
    },
    {
      _type: 'faqSection',
      _key: k(10),
      eyebrow: 'Questions',
      headline: "What you're probably \n *thinking* anyway.",
      items: [
        {
          _type: 'faqItem',
          _key: k(101),
          q: 'How does the STROXX satisfaction guarantee work?',
          a: "You try the tool on real work for 30 days. If you're not happy, you get your money back. No need for faults or defects, your judgment is enough. The guarantee applies to business customers with an account at Carl Ras.",
        },
        {
          _type: 'faqItem',
          _key: k(102),
          q: 'What does the guarantee cover, and what does it not?',
          a: 'It covers all STROXX products except access control. For bulk purchases, the guarantee applies to the first item bought. Returns are handled at your Carl Ras store with an invoice or delivery note, and for online orders via customer service on 44 85 55 11.',
        },
        {
          _type: 'faqItem',
          _key: k(103),
          q: 'Where can I buy STROXX?',
          a: 'In Denmark, STROXX is available exclusively at Carl Ras, in 26 stores across the country and online at carl-ras.dk. Across the rest of Europe, the brand is sold through chains like Meesenburg in Germany, Foussier in France and Lecot in Belgium.',
        },
        {
          _type: 'faqItem',
          _key: k(104),
          q: 'How can STROXX be so affordable?',
          a: 'STROXX is developed by trade pros in Denmark, Germany, France and Belgium, who set the specifications and choose the materials themselves. There are no logo premiums, sponsorships or costly middlemen. You pay for the tool, not for the advertising.',
        },
        {
          _type: 'faqItem',
          _key: k(105),
          q: 'Is STROXX professional quality?',
          a: "Yes. STROXX is built for professional use and spans over 1,400 item numbers, sold in more than 227 stores across Europe. Tolerances, materials and durability measure quality, not the price tag. That's why we back it with a 30-day satisfaction guarantee.",
        },
      ],
    },
  ],
};

const monthlyLineup: Record<string, unknown> = {
  _id: 'monthly-2026-06',
  _type: 'monthlyLineup',
  language: 'en',
  month: 'June',
  year: '2026',
  heroSku: '35011932',
  heroClaims: [
    {
      _type: 'claim',
      _key: k(1),
      title: 'Green lines. All day long.',
      body: 'A green diode is up to four times more visible than red in daylight. The lines stay sharp at 40 metres, and 70 with a receiver.',
    },
    {
      _type: 'claim',
      _key: k(2),
      title: '±1.5 mm at 5 metres.',
      body: 'Self-levelling 3D lines across three planes, a full 360 degrees. The accuracy is on the data sheet, not just in the ad.',
    },
    {
      _type: 'claim',
      _key: k(3),
      title: 'Set it. Forget it.',
      body: 'One person sets the laser, the same person fits. It saves you a colleague on the layout, every single time.',
    },
  ],
  heroCases: [
    { _type: 'case', _key: k(11), trade: 'Carpenter', use: 'Ceilings, partitions and floor levelling in one setup. The 3D planes hit all four walls at once.' },
    { _type: 'case', _key: k(12), trade: 'Electrician', use: 'Boxes and runs at the same height through the whole flat, no string and no helper.' },
    { _type: 'case', _key: k(13), trade: 'Plumber', use: 'Falls and fixed heights on pipe runs. The line holds while you work, even in bright light.' },
  ],
  heroFaq: [
    {
      _type: 'faqItem',
      _key: k(21),
      q: 'How good is the green laser in daylight?',
      a: 'A green diode reads up to four times clearer than red. Indoors in normal work light the lines stay sharp across the full range, 40 metres, and outdoors or in bright light you use the receiver and reach 70 metres.',
    },
    {
      _type: 'faqItem',
      _key: k(22),
      q: 'What does 3D actually mean here?',
      a: 'Three self-levelling 360-degree planes: one horizontal and two vertical, perpendicular to each other. So you can set a level line, a plumb line and a square all at once, the whole way around the room.',
    },
    {
      _type: 'faqItem',
      _key: k(23),
      q: 'How accurate is it in practice?',
      a: '±1.5 mm at 5 metres. That is the same class as the A-brand green 3D lasers, and plenty for fit-out, ceilings, tiling and electrical work.',
    },
    {
      _type: 'faqItem',
      _key: k(24),
      q: 'What if it does not hold up to what I expect?',
      a: 'Then the satisfaction guarantee kicks in: try it on real jobs for 30 days, and if you are not happy, you get your money back at Carl Ras. No fault required, your judgement is enough.',
    },
  ],
  cashCowSkus: ['34011573', '34009021', '35011812', '35011846', '49011269'],
  news: [
    { _type: 'newsItem', _key: k(31), label: 'Premium new arrival', sku: '64012039', pitch: 'Compressor cool box for the site hut. Cold lunch in July, no ice needed.' },
    { _type: 'newsItem', _key: k(32), label: 'Problem solver', sku: '63143492', pitch: 'Beanie with a built-in head torch. Light on the job, hands free.' },
  ],
};

async function run() {
  const tx = client.transaction();
  tx.createIfNotExists(siteSettings as any);
  /* duplicate guard: seed-proevdet may own the try-it page under another
     _id — two docs with one slug would make getLandingPage/[0] nondeterministic */
  const slugOwner = (await client.fetch(
    `*[_type == "landingPage" && slug.current == "try-it"][0]._id`
  )) as string | null;
  if (!slugOwner || slugOwner === landingPage._id) tx.createOrReplace(landingPage as any);
  tx.createOrReplace(monthlyLineup as any);
  const res = await tx.commit();
  // eslint-disable-next-line no-console
  console.log('Seeded:', res.results.map((r) => r.id).join(', '));
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
