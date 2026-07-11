/** Tradesman testimonials. Stage-4 market = proof beats claims, so these are
 *  the engine of trust alongside the guarantee.
 *
 *  DEMO DATA — seeded, realistic quotes. In production these come from real
 *  customers: Pro Club emails invite owners of a product to submit a quote
 *  (incentivised), and we cross-check against sales data so the quote is tied
 *  to a product the person actually bought. `productCode` links a quote to a
 *  product in lib/data; `trades` lets fag pages show relevant voices. */

export type Testimonial = {
  quote: string;
  name: string;
  role: string; // trade + town
  rating: 5;
  productCode?: string; // varenummer the quote is about (verified via sales data in prod)
  trades: string[]; // trade slugs from lib/trades.ts this quote suits
};

export const testimonials: Testimonial[] = [
  {
    quote: 'I thought there had to be a catch. There just was not any badge premium. The blade lasts just as long as the expensive one.',
    name: 'Martin K.',
    role: 'Carpenter, Aarhus',
    rating: 5,
    productCode: '34011573', // Rundsavklinge Ø160 Z42W Træ
    trades: ['carpenter'],
  },
  {
    quote: 'I used the knife every day for a month before I bothered to believe in it. Now the whole crew has them.',
    name: 'Dennis P.',
    role: 'Fitter, Odense',
    rating: 5,
    productCode: '34009021', // Kniv Black 25 mm med autolås
    trades: ['carpenter', 'electrician', 'plumber'],
  },
  {
    quote: 'A line laser at that price sounded too good to be true. It stays razor sharp, even in daylight.',
    name: 'Søren B.',
    role: 'Bricklayer, Vejle',
    rating: 5,
    productCode: '35011932', // Streglaser 3D Green
    trades: ['bricklayer', 'carpenter'],
  },
  {
    quote: 'The hole saw set handled 40 back boxes without blinking. I have paid double for the same thing before.',
    name: 'Henrik L.',
    role: 'Electrician, København',
    rating: 5,
    productCode: '32012588', // Hulsavsæt Elektriker
    trades: ['electrician'],
  },
  {
    quote: 'The guarantee gave me the nerve to try it. I never needed it. That says it all.',
    name: 'Jonas M.',
    role: 'Plumber, Aalborg',
    rating: 5,
    trades: ['plumber', 'painter', 'bricklayer'],
  },
  {
    quote: 'The tape sticks clean and releases clean. No glue left on the trim. Simple, but that is what counts.',
    name: 'Camilla R.',
    role: 'Painter, Roskilde',
    rating: 5,
    trades: ['painter'],
  },
];

/** Quotes relevant to a trade (falls back to all if a trade has too few). */
export const testimonialsForTrade = (slug: string, min = 2) => {
  const hit = testimonials.filter((t) => t.trades.includes(slug));
  return hit.length >= min ? hit : testimonials;
};

export const averageRating = () =>
  testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length;
