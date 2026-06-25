/** Trade ("fag") landing pages: the job-first navigation competitors like
 *  Milwaukee structure their whole catalog around. Each trade maps to the
 *  existing category slugs in lib/data.ts; products are pulled from those.
 *  Copy follows the brand voice: name the job, sell the outcome, no hype. */

export type Trade = {
  slug: string;
  name: string;
  title: string; // h1
  accent: string; // the payoff phrase inside `title` rendered in STROXX blue
  blurb: string;
  categories: string[]; // category slugs from lib/data.ts
  faq: { q: string; a: string }[]; // rendered as accordion + FAQPage JSON-LD
};

export const trades: Trade[] = [
  {
    slug: 'toemrer',
    name: 'Carpenter and joiner',
    title: 'For the ones who build in wood.',
    accent: 'in wood.',
    blurb:
      'Blades that hold their edge, drills that do not wander, and measurements that line up at both ends. The kit for woodworkers, with no badge premium.',
    categories: ['rundsavklinger', 'bor-borsaet', 'bits-skruetraekkere', 'maalevaerktoej', 'knive', 'lasere'],
    faq: [
      {
        q: 'Which STROXX tools do carpenters reach for most?',
        a: 'Circular saw blades for wood and laminate, wood drills and drill sets, impact bits, levels and squares, plus knives with auto-lock. All professional quality, no badge premium.',
      },
      {
        q: 'Does a lower-priced circular saw blade really hold up?',
        a: 'Tolerances, carbide and tooth geometry decide the quality, not the logo. That is why you get a 30-day satisfaction guarantee: put the blade to work on real jobs, and if you are not happy, you get your money back at Carl Ras.',
      },
    ],
  },
  {
    slug: 'elektriker',
    name: 'Electrician',
    title: 'Power on the job. Not on the price.',
    accent: 'Not on the price.',
    blurb:
      'Hole saws for back boxes, bits that bite, cable reels that survive the site, and light that turns night work into day work.',
    categories: ['hulsave', 'bits-skruetraekkere', 'kabeltromler', 'belysning', 'multicutterklinger', 'maalevaerktoej'],
    faq: [
      {
        q: 'Which STROXX tools matter most to electricians?',
        a: 'Hole saw sets for back boxes and pass-throughs (19 to 83 mm), impact bits and bit holders, cable reels, work lights and head torches, plus multi-tool blades. Available at Carl Ras across 26 stores or online.',
      },
      {
        q: 'Is there a hole saw set built for electrical work?',
        a: 'Yes. STROXX has an HSS bi-metal hole saw set for electricians with 13 pieces from 19 to 83 mm, covering the common box and conduit dimensions. It is backed by the 30-day satisfaction guarantee.',
      },
    ],
  },
  {
    slug: 'vvs',
    name: 'Plumber',
    title: 'Tight work. Tight prices.',
    accent: 'Tight prices.',
    blurb:
      'Socket sets that grip, hole saws for pass-throughs, sealant that seals, and measuring tools you can trust in a wet basement.',
    categories: ['topnoegler', 'hulsave', 'bor-borsaet', 'fugemasse', 'maalevaerktoej', 'knive'],
    faq: [
      {
        q: 'What does STROXX have for plumbers?',
        a: 'Socket sets in 1/4", 3/8" and 1/2", hole saws for pass-throughs, metal drills, sealant and caulk guns, plus torpedo levels that sit firm on pipe. All available at Carl Ras.',
      },
      {
        q: 'Can I try a socket set before I commit?',
        a: 'Yes. With the 30-day satisfaction guarantee you can put the set to work on real jobs for a month. If the grip or the ratchet is not what you expected, hand it back at your Carl Ras store and get your money back.',
      },
    ],
  },
  {
    slug: 'maler',
    name: 'Painter',
    title: 'Clean lines. Clear conscience.',
    accent: 'Clear conscience.',
    blurb:
      'Rollers, brushes, tape and chemicals for a finish the customer can see themselves in. And knives for everything that needs a clean cut first.',
    categories: ['malergrej', 'tape', 'kemi', 'fugemasse', 'knive'],
    faq: [
      {
        q: 'What does STROXX painting gear cover?',
        a: 'Rollers, brushes, masking tape, sheeting, sealant and chemicals like cleaners and sprays, plus sharp knives for trimming. Professional quality at a price that does not eat your margin.',
      },
      {
        q: 'Does cheap masking tape not mean adhesion problems?',
        a: 'Price says nothing about the adhesive. STROXX tape is made to stick clean and release clean, and you can test it on a whole job for 30 days. Not happy? Money back at Carl Ras.',
      },
    ],
  },
  {
    slug: 'murer',
    name: 'Bricklayer',
    title: 'Hard ground. Soft price.',
    accent: 'Soft price.',
    blurb:
      'Masonry and hammer drills that chew through concrete, lasers that set the line, and safety gear so you get home in one piece.',
    categories: ['bor-borsaet', 'lasere', 'maalevaerktoej', 'sikkerhed', 'kemi'],
    faq: [
      {
        q: 'Which STROXX tools suit bricklaying and concrete work?',
        a: 'SDS hammer drills with 2 and 4 cutting edges, masonry and multi-construction drills, rotary and line lasers for lines and levels, levels, plus safety gear like helmets, glasses and gloves.',
      },
      {
        q: 'Do budget hammer drills hold up in reinforced concrete?',
        a: 'STROXX SDS drills come with 4 cutting edges made for exactly that, reinforced concrete. And you do not have to take our word for it: run them on site for 30 days, and get your money back at Carl Ras if they do not deliver.',
      },
    ],
  },
];

export const tradeBySlug = (slug: string) => trades.find((t) => t.slug === slug);
