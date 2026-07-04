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
    tags: ['Lasers', 'Regulations', 'Tips'],
    excerpt: 'Class 2 or class 3R, green or red: what the rules actually say, and what it means for the laser you bring to work.',
    seoTitle: 'Which laser class is allowed on site?',
    seoDescription: 'Class 2 is the safe default on construction sites. What the classes mean, when green beats red, and what to check before you buy.',
    body: [
      block('Short answer: class 2 is the safe default on a construction site, and it is what most line and rotation lasers for the trades are. Class 3R exists and is legal to use, but it comes with extra duties, so most crews never need it.', 'b1'),
      block('What the classes mean', 'b2', 'h2'),
      block('Laser classes describe how much power the beam carries and what it can do to an unprotected eye. Class 2 is limited enough that your blink reflex protects you. Class 3R is stronger, which buys you visibility in bright conditions but requires you to control who is in the beam path. For everyday interior work, level, alignment, tiling, class 2 does the job without paperwork.', 'b3'),
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
    tags: ['Guarantee', 'Specialist advice'],
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
    tags: ['Sealants', 'Painting', 'Tips'],
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
];

async function run() {
  for (const p of POSTS) {
    const img = await client.assets.upload('image', readFileSync(p.image), {
      filename: p.slug + '.jpg',
    });
    await client.createOrReplace({
      _id: p._id,
      _type: 'post',
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
