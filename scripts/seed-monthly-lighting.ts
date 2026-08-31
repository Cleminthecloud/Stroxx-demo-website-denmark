/**
 * Seeds September 2026's Månedens STROXX: the four-head tripod work light as
 * the hero, with an interactive hotspot photo, the month's five DB2 winners
 * and three new arrivals, all drawn from the lighting range we actually carry.
 *
 * It also back-fills the June 2026 lineup's archive address and summary, so
 * that month lands cleanly at /monthly/2026-06 and reads correctly in the
 * archive list instead of describing the wrong tool.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:monthly-lighting
 *
 * Idempotent: the new lineup is createOrReplace on a fixed _id, and June is
 * PATCHED (setIfMissing) so nothing an editor typed there is overwritten.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const k = (n: number) => `lit-${n}`;

/* Every SKU below is a real item number from the lighting range in
   lib/data.ts. An unknown code would simply be dropped at render, so they are
   listed here with their names to make a typo obvious in review.

   Hero    55011789  Work light LED 4 lights, 14.000 lumen, 230 V with tripod
   Winners 55000195  Work light LED 55 W, 600-6000 lumen
           55011699  Torch Aluminium 500L
           55011715  LED strip 1500 L, 150W, 10m
           55011862  Inspection light 1200L, rechargeable
           55011703  Rechargeable headlamp 1200L
   News    55011803  Mega power LED (360°), 800W (2 x 400W)
           55011801  LED Strip 1500 L, 1500W, 100 m
           55011791  Work light LED 360° Clips, 5.000 lumen, 230 V
   Linked from a hotspot
           55011715  LED strip (the corridor answer) */

const lineup = {
  _id: 'monthly-2026-09',
  _type: 'monthlyLineup',
  language: 'en',
  month: 'September',
  year: '2026',
  period: '2026-09',
  /* goes live immediately so it can be reviewed today; move to 2026-09-01 if
     it should flip over on the first instead */
  activeFrom: '2026-08-31',
  summary:
    'This month it is the four-head tripod work light: 14,000 lumen from a single socket, and the rest of the lighting range around it.',
  heroSku: '55011789',
  heroClaims: [
    {
      _type: 'claim',
      _key: k(1),
      title: '14,000 lumen. One socket.',
      body: 'Four heads on one tripod off a single 230 V lead. One thing to plug in and one lead across the floor, instead of four lamps and four extension reels.',
    },
    {
      _type: 'claim',
      _key: k(2),
      title: 'Light from above the work.',
      body: 'On the tripod the light comes down onto the job, so your own body stops casting the shadow you are trying to work in. Each head aims separately.',
    },
    {
      _type: 'claim',
      _key: k(3),
      title: 'IP54. Built for the shell.',
      body: 'Rated against dust and splashing water, with a 3 metre lead. It lives on site through the whole job, not in the van until the weather improves.',
    },
  ],
  heroCases: [
    {
      _type: 'case',
      _key: k(11),
      trade: 'Carpenter',
      use: 'First fix in a shell with no lighting circuit yet. One setup lights the whole floor, so nobody is working off a head torch at three in the afternoon.',
    },
    {
      _type: 'case',
      _key: k(12),
      trade: 'Electrician',
      use: 'Boards, risers and ceiling voids. Aim two heads at the board and two at the run, and both ends of the job are lit at once.',
    },
    {
      _type: 'case',
      _key: k(13),
      trade: 'Painter',
      use: 'Raking light across a wall shows every miss and every roller mark while you can still fix it, instead of the morning the client walks in.',
    },
  ],
  heroFaq: [
    {
      _type: 'faqItem',
      _key: k(21),
      q: 'Can I run it from a site transformer?',
      a: 'It is a 230 V set, so it runs from a normal site supply or a generator. On a 110 V site you need a transformer rated for the full load of all four heads.',
    },
    {
      _type: 'faqItem',
      _key: k(22),
      q: 'What does IP54 actually cover?',
      a: 'Protected against dust and against water splashing from any direction. That covers a dusty shell and normal site weather. It is not made to sit in standing water or be jetted clean.',
    },
    {
      _type: 'faqItem',
      _key: k(23),
      q: 'What if I need to light a corridor rather than a room?',
      a: 'A tripod lights a space from one point. For a long run, the LED strip in this month\'s lineup is the better tool: it lays light along the whole length instead of throwing it from one end.',
    },
    {
      _type: 'faqItem',
      _key: k(24),
      q: 'Is it covered by the satisfaction guarantee?',
      a: 'Yes. Work it hard for 30 days. If it does not do what you needed, your money back at your dealer, and your own judgement is enough.',
    },
  ],
  /* The interactive photo: the hero's own product shot with the points placed
     on it. `image` is a path (the product image route), so no upload is
     needed to seed it; an editor can swap in a real site photograph later and
     the points stay where they are. */
  heroHotspots: {
    _type: 'hotspotImage',
    eyebrow: 'Up close',
    headline: 'One setup. *Four decisions.*',
    sub: 'Tap a point to see what each part of the set is actually for.',
    /* the hero's own product shot, served by our same-origin image route. No
       cache-buster: the route ignores it, so the path stays valid when IMG_V
       is bumped. Swap in a real site photograph and the points stay put. */
    image: '/api/tool/151942',
    fit: 'contain',
    spots: [
      {
        _type: 'hotspot',
        _key: k(31),
        x: 50,
        y: 16,
        title: 'Four heads, aimed separately',
        body: 'Each head swivels on its own, so you light the wall you are working on rather than the back of your own head.',
      },
      {
        _type: 'hotspot',
        _key: k(32),
        x: 27,
        y: 44,
        title: 'One 230 V lead',
        body: '14,000 lumen from a single socket. One lead to trip over instead of four, and one thing to unplug at the end of the day.',
      },
      {
        _type: 'hotspot',
        _key: k(33),
        x: 52,
        y: 72,
        title: 'The tripod does the work',
        body: 'Height adjustable and stable on a rough slab. The light comes from above the job, so the shadow falls behind you and not on it.',
      },
      {
        _type: 'hotspot',
        _key: k(34),
        x: 73,
        y: 38,
        title: 'IP54, and it means it',
        body: 'Dust and splashing water from any direction. It stays on site through the shell phase instead of going back in the van.',
      },
      {
        _type: 'hotspot',
        _key: k(35),
        x: 38,
        y: 88,
        title: 'Lighting a corridor instead?',
        body: 'A tripod throws light from one point. For a long run, the LED strip lays it along the whole length.',
        sku: '55011715',
      },
    ],
  },
  cashCowSkus: ['55000195', '55011715', '55011862', '55011699', '55011703'],
  news: [
    {
      _type: 'newsItem',
      _key: k(41),
      label: 'Premium new arrival',
      sku: '55011803',
      pitch: '96,000 lumen from two 400 W heads. When a floor plate has to be lit end to end and one tripod will not reach.',
    },
    {
      _type: 'newsItem',
      _key: k(42),
      label: 'For the long runs',
      sku: '55011801',
      pitch: '100 metres of strip in one set. Corridors, tunnels and stairwells lit evenly, with no dark stretch between lamps.',
    },
    {
      _type: 'newsItem',
      _key: k(43),
      label: 'Problem solver',
      sku: '55011791',
      pitch: 'Clips where there is nowhere to stand a tripod, and throws 5,000 lumen a full 360 degrees from a ceiling joist or a scaffold tube.',
    },
  ],
};

/* June 2026 keeps its content; it only gains the two fields the archive needs
   so it lands at /monthly/2026-06 and reads correctly in the list. */
const JUNE_SUMMARY =
  'June was the green 3D line laser: three self-levelling 360 degree planes, visible all day long.';

async function run() {
  const tx = client.transaction();
  tx.createOrReplace(lineup as never);
  await tx.commit();

  const june = await client.getDocument('monthly-2026-06');
  if (june) {
    await client
      .patch('monthly-2026-06')
      .setIfMissing({ period: '2026-06', summary: JUNE_SUMMARY, activeFrom: '2026-06-01' })
      .commit();
    // eslint-disable-next-line no-console
    console.log('Patched monthly-2026-06 with its archive address (/monthly/2026-06)');
  } else {
    // eslint-disable-next-line no-console
    console.log('No monthly-2026-06 document found; skipped the archive back-fill');
  }

  // eslint-disable-next-line no-console
  console.log('Seeded monthly-2026-09 (September: the four-head tripod work light)');
  // eslint-disable-next-line no-console
  console.log('Live at /monthly, archived months at /monthly/archive');
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
