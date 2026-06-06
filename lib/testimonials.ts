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
    quote: 'Jeg troede, der var en fidus. Der var bare ikke noget mærke-tillæg. Klingen holder lige så længe som den dyre.',
    name: 'Martin K.',
    role: 'Tømrer, Aarhus',
    rating: 5,
    productCode: '34011573', // Rundsavklinge Ø160 Z42W Træ
    trades: ['toemrer'],
  },
  {
    quote: 'Brugte kniven hver dag i en måned før jeg gad tro på den. Nu har hele sjakket dem.',
    name: 'Dennis P.',
    role: 'Montør, Odense',
    rating: 5,
    productCode: '34009021', // Kniv Black 25 mm med autolås
    trades: ['toemrer', 'elektriker', 'vvs'],
  },
  {
    quote: 'En streglaser til den pris lød for godt til at være sandt. Den står knivskarpt, også i dagslys.',
    name: 'Søren B.',
    role: 'Murer, Vejle',
    rating: 5,
    productCode: '35011932', // Streglaser 3D Green
    trades: ['murer', 'toemrer'],
  },
  {
    quote: 'Hulsavsættet klarede 40 dåser uden at blinke. Jeg har betalt det dobbelte for det samme før.',
    name: 'Henrik L.',
    role: 'Elektriker, København',
    rating: 5,
    productCode: '32012588', // Hulsavsæt Elektriker
    trades: ['elektriker'],
  },
  {
    quote: 'Garantien gjorde, at jeg turde prøve. Jeg fik aldrig brug for den. Det siger vist alt.',
    name: 'Jonas M.',
    role: 'VVS, Aalborg',
    rating: 5,
    trades: ['vvs', 'maler', 'murer'],
  },
  {
    quote: 'Tapen klæber rent og slipper rent. Ingen lim tilbage på listerne. Simpelt, men det er det, der tæller.',
    name: 'Camilla R.',
    role: 'Maler, Roskilde',
    rating: 5,
    trades: ['maler'],
  },
];

/** Quotes relevant to a trade (falls back to all if a trade has too few). */
export const testimonialsForTrade = (slug: string, min = 2) => {
  const hit = testimonials.filter((t) => t.trades.includes(slug));
  return hit.length >= min ? hit : testimonials;
};

export const averageRating = () =>
  testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length;
