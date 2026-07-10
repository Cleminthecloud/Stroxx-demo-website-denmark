/** The dealer partner logos, one source of truth for the chooser, footer and
 *  brand guide. Single-colour SVGs under /public/brand/partners, normalised to
 *  currentColor and tinted via CSS mask. `ar` is the logo's aspect ratio
 *  (viewBox w / h) so a masked box can size itself to a fixed height without
 *  distortion or uneven scaling. */
export type DealerLogo = { code: string; name: string; src: string; href: string; ar: string };

export const DEALER_LOGOS: DealerLogo[] = [
  { code: 'dk', name: 'Carl Ras', src: '/brand/partners/carl-ras.svg', href: 'https://www.carl-ras.dk', ar: '211 / 60' },
  { code: 'de', name: 'Meesenburg', src: '/brand/partners/meesenburg.svg', href: 'https://www.meesenburg.com', ar: '214 / 51' },
  { code: 'fr', name: 'Foussier', src: '/brand/partners/foussier.svg', href: 'https://www.foussier.fr', ar: '203 / 35' },
  { code: 'be', name: 'Lecot', src: '/brand/partners/lecot.svg', href: 'https://lecot.be', ar: '217 / 45' },
];

export const dealerLogoByCode = (code?: string): DealerLogo | undefined =>
  code ? DEALER_LOGOS.find((d) => d.code === code) : undefined;
