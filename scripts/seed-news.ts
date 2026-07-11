/**
 * Seeds three placeholder news articles (relevant topics, dummy copy) with
 * hero images uploaded from public/Images/campaign, and adds a "News" link
 * to the footer in Site settings if it is not there yet.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:news
 *
 * Idempotent: createOrReplace with fixed _ids; the footer link is only
 * appended once.
 */
import { readFileSync } from 'fs';
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const span = (text: string, key: string, marks: string[] = []) => ({ _type: 'span', _key: key, text, marks });
const block = (text: string, key: string, style = 'normal') => ({
  _type: 'block',
  _key: key,
  style,
  markDefs: [],
  children: [span(text, `${key}-s`)],
});

const POSTS = [
  {
    _id: 'post-seed-laser-class',
    title: 'Which laser class are you allowed to use on site?',
    slug: 'which-laser-class-on-site',
    publishedAt: '2026-07-01T07:00:00Z',
    image: 'public/Images/campaign/rings.jpg',
    alt: 'Line laser projecting green rings in a dark workshop',
    tags: ['Tips', 'Regulations', 'Lasers'],
    excerpt: 'Class 2 or class 3R, green or red: what the rules actually say, and what it means for the laser you bring to work.',
    seoTitle: 'Which laser class is allowed on site?',
    seoDescription: 'Class 2 is the safe default on construction sites. What the classes mean, when green beats red, and what to check before you buy.',
    body: [
      block('Short answer: class 2 is the safe default on a construction site, and it is what most line and rotation lasers for the trades are. Class 3R exists and is legal to use, but it comes with extra duties, so most crews never need it.', 'b1'),
      block('What the classes mean', 'b2', 'h2'),
      block('Laser classes describe how much power the beam carries and what it can do to an unprotected eye. Class 2 is limited enough that your blink reflex protects you. Class 3R is stronger, which buys you visibility in bright conditions but requires you to control who is in the beam path. For everyday interior work, level, alignment, tiling, class 2 does the job without paperwork.', 'b3'),
      {
        _type: 'productSlider',
        _key: 'ps1',
        title: 'The lasers in question',
        skus: ['35011932', '35011938', '35011908', '35011418'],
      },
      block('Green or red?', 'b4', 'h2'),
      block('Green light sits where the eye is most sensitive, so a green class 2 laser looks brighter than a red one at the same power. That is why green has taken over on site: better visibility without moving up a class. The trade-off is battery life, green draws more power.', 'b5'),
      block('This is placeholder content for the demo. Swap it for the market’s real article before launch, and check national rules with the local safety authority.', 'b6'),
    ],
  },
  {
    _id: 'post-seed-guarantee-practice',
    title: 'How does a 30-day satisfaction guarantee work in practice?',
    slug: 'how-the-30-day-guarantee-works',
    publishedAt: '2026-06-24T07:00:00Z',
    image: 'public/Images/campaign/tea.jpg',
    alt: 'Tradesperson taking a break with tools on the workbench',
    tags: ['Quality proof', 'Guarantee', 'Specialist advice'],
    excerpt: 'No fault needed, your own judgment is enough. What the guarantee covers, how returns actually happen, and why we can afford to offer it.',
    seoTitle: 'How the 30-day satisfaction guarantee works',
    seoDescription: 'Use the tool on real work for 30 days. Not convinced? Money back, no defect required. Here is exactly how the process works.',
    body: [
      block('The pitch is simple: use the tool on real work for 30 days, and if you are not convinced, you get your money back. No defect required, no forms arguing about what counts as a fault. Your judgment is the standard.', 'b1'),
      block('What it covers', 'b2', 'h2'),
      block('Every STROXX product except access control. Buy ten of something and the guarantee covers the first unit you put to work, so you can prove the tool before committing the whole crew.', 'b3'),
      block('How a return actually happens', 'b4', 'h2'),
      block('Bring the tool and the invoice or delivery note to the store; bought online, call customer service instead. That is the whole process. The guarantee exists because returns are rare: when tradespeople set the specification, the tool usually survives the first month.', 'b5'),
      block('This is placeholder content for the demo. The legal terms live in the guarantee PDF; keep this article aligned with them.', 'b6'),
    ],
  },
  {
    _id: 'post-seed-winter-sealants',
    title: 'Can you use sealant in freezing weather?',
    slug: 'sealant-in-freezing-weather',
    publishedAt: '2026-06-15T07:00:00Z',
    image: 'public/Images/campaign/glasses.jpg',
    alt: 'Safety glasses on a site table in cold morning light',
    tags: ['Tips', 'Sealants', 'Painting'],
    excerpt: 'Some cure, some just pretend to. What happens to common sealant chemistries below 5 degrees, and how to keep joints honest in winter.',
    seoTitle: 'Sealant in freezing weather: what actually cures',
    seoDescription: 'Below 5 degrees most sealants slow down or stop curing. Which chemistries handle the cold, and the winter habits that save call-backs.',
    body: [
      block('Most sealant failures blamed on the product are really temperature stories. Below about 5 degrees, common chemistries slow dramatically; below zero, water-based products can freeze in the joint and never film properly.', 'b1'),
      block('Know your chemistry', 'b2', 'h2'),
      block('Hybrid polymers and silicones tolerate cold application better than acrylics, but every product has a stated application window, and the joint surface temperature matters more than the air. A joint in shade stays cold long after the thermometer says otherwise.', 'b3'),
      block('Winter habits that save call-backs', 'b4', 'h2'),
      block('Store cartridges indoors overnight, a warm cartridge guns easier and tools cleaner. Dry joints matter twice as much in winter: moisture that would evaporate in July sits in the joint in January.', 'b5'),
      block('This is placeholder content for the demo. Replace with the market’s real product guidance and the datasheets for the products you sell.', 'b6'),
    ],
  },
  {
    _id: 'post-seed-professional-favorites',
    title: 'Professional favorites: the five tools crews keep rebuying',
    slug: 'professional-favorites-july',
    publishedAt: '2026-07-03T07:00:00Z',
    image: 'public/Images/campaign/rings-sm.jpg',
    alt: 'Well-used everyday tools laid out on a dark workbench',
    tags: ['Professional favorites', 'Tools'],
    excerpt: 'Not the flashiest tools, the ones that come back on the order list month after month. Five quiet workhorses, and why the pros keep choosing them.',
    seoTitle: 'Professional favorites: five tools pros rebuy',
    seoDescription: 'The five STROXX tools professional crews reorder most, and what that repeat business says about quality at a fair price.',
    body: [
      block('There are two kinds of proof in this business. The spec sheet, and the reorder. This list is the second kind: the five tools that professional crews come back for, month after month. Nobody rebuys a disappointment.', 'b1'),
      block('The workhorses', 'b2', 'h2'),
      {
        _type: 'productSlider',
        _key: 'ps1',
        title: 'This month\u2019s professional favorites',
        skus: ['34011573', '34009021', '35011812', '35011846', '49011269'],
      },
      block('What they have in common', 'b3', 'h2'),
      block('None of them are glamorous. All of them get picked up fifty times a day, and that is exactly the point: the tools you stop thinking about are the ones doing their job. Same steel, same tolerances as the expensive names, without the logo tax.', 'b4'),
      block('Every one is covered by the 30-day satisfaction guarantee: put it to work, and if it does not earn its place in the van, money back.', 'b5'),
      block('This is placeholder content. Each month, swap the five SKUs for the real reorder winners; the slider updates itself from the item numbers.', 'b6'),
    ],
  },
];

async function run() {
  for (const p of POSTS) {
    const img = await client.assets.upload('image', readFileSync(p.image), {
      filename: p.slug + '.jpg',
    });
    await client.createOrReplace({
      _id: p._id,
      _type: 'post',
  language: 'en',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      publishedAt: p.publishedAt,
      heroImage: { _type: 'image', asset: { _type: 'reference', _ref: img._id }, alt: p.alt },
      excerpt: p.excerpt,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      tags: (p as { tags?: string[] }).tags ?? [],
      body: p.body,
    });
    console.log('seeded', p._id);
  }

  /* the manifesto page: the Brand Plan's words as a CMS landing page at
     /kampagne/manifesto — the About page every big tool brand has, fully
     editable like any other landing page */
  await client.createOrReplace({
    _id: 'landing-manifesto',
    _type: 'landingPage',
  language: 'en',
    title: 'The STROXX manifesto',
    slug: { _type: 'slug', current: 'manifesto' },
    seoTitle: 'The STROXX manifesto',
    seoDescription: 'Made to perform. Not to shine. What STROXX believes about craftsmanship, quality and honest value for money.',
    sections: [
      {
        _type: 'statement', _key: 'm1',
        eyebrow: 'The STROXX manifesto',
        headline: 'Made to perform.\n*Not to shine.*',
        paragraphs: [
          'Great craftsmanship has never been about noise. It is about precision. Consistency. Pride in the details. The right cut. The right fit. The right finish.',
          'Professionals know the feeling when everything aligns. When the tool in your hand responds exactly the way it should. Solid. Balanced. Reliable. Because it is made to perform. Not to shine.',
        ],
      },
      {
        _type: 'quote', _key: 'm2',
        text: 'Professional quality should not be defined by how expensive it is, but by how well it works.',
      },
      {
        _type: 'statement', _key: 'm3',
        eyebrow: 'How we build',
        headline: 'Our own specifications.\n*Our own rules.*',
        paragraphs: [
          'STROXX is developed in close collaboration between partners in Denmark, Germany, France and Belgium. Together we define our own specifications, select our own materials, disrupt conventional thinking, and refine every detail with a clear focus on function, form, reliability and efficiency.',
          'The standards are high. The tolerances are tight. Durability is non-negotiable. STROXX is available in more than 227 stores across Europe.',
        ],
      },
      {
        _type: 'ctaBanner', _key: 'm4',
        eyebrow: 'Tough stuff and real value',
        headline: 'Made for professionals who care about *the results.*',
        sub: 'Nothing else. That is STROXX.',
        primaryLabel: 'See the tools',
        primaryHref: '/produkter',
        secondaryLabel: 'The 30-day guarantee',
        secondaryHref: '/proev-det',
      },
    ],
  });
  console.log('seeded landing-manifesto (/kampagne/manifesto)');

  /* add News to the footer links in Site settings, once */
  const settings = await client.getDocument('siteSettings');
  const links = (settings?.footerPageLinks ?? []) as { href?: string }[];
  if (settings && !links.some((l) => l.href === '/nyheder')) {
    await client
      .patch('siteSettings')
      .append('footerPageLinks', [{ _type: 'navLink', _key: 'seed-news', label: 'News', href: '/nyheder' }])
      .commit();
    console.log('footer: News link added to Site settings');
  } else {
    console.log('footer: News link already present (or no settings doc)');
  }
  console.log('done: 3 articles + footer link. /nyheder is live.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
