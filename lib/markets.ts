export type MarketLegalLink = { label?: string; href?: string };

export type Market = {
  _id?: string;
  name?: string;
  code?: string;
  languages?: string[];
  defaultLanguage?: string;
  isReference?: boolean;
  active?: boolean;
  dealerName?: string;
  dealerCtaUrl?: string;
  supportPhone?: string;
  supportHours?: string;
  legalLinks?: MarketLegalLink[];
  order?: number;
};

/** Fallback market registry (same seam philosophy as lib/stores.ts). The
 *  international English version is the reference: root + hreflang x-default.
 *  The four dealer markets are scaffolded here and go live one at a time,
 *  by dealer readiness, Belgium last. See docs/STROXX-market-localisation-plan.md. */
export const markets: Market[] = [
  { _id: 'market-int', name: 'International (English)', code: 'int', languages: ['en'], defaultLanguage: 'en', isReference: true, active: true, order: 0 },
  { _id: 'market-dk', name: 'Denmark', code: 'dk', languages: ['da'], defaultLanguage: 'da', isReference: false, active: false, dealerName: 'Carl Ras', dealerCtaUrl: 'https://www.carl-ras.dk/', supportPhone: '44 85 55 11', supportHours: 'Mon-Thu 07-16, Fri 07-15', order: 1 },
  { _id: 'market-de', name: 'Germany', code: 'de', languages: ['de'], defaultLanguage: 'de', isReference: false, active: false, dealerName: 'Meesenburg', dealerCtaUrl: 'https://www.meesenburg.com', supportPhone: '+49 461 5808 2000', order: 2 },
  { _id: 'market-fr', name: 'France', code: 'fr', languages: ['fr'], defaultLanguage: 'fr', isReference: false, active: false, dealerName: 'Foussier', dealerCtaUrl: 'https://www.foussier.fr', supportPhone: '02 50 821 821', supportHours: 'Mon-Fri 07-19', order: 3 },
  { _id: 'market-be', name: 'Belgium', code: 'be', languages: ['nl', 'fr'], defaultLanguage: 'nl', isReference: false, active: false, dealerName: 'Lecot', dealerCtaUrl: 'https://lecot.be', supportPhone: '056 36 45 11', supportHours: 'Mon-Fri 08-12, 13-17', order: 4 },
];

export const referenceMarket = (list: Market[] = markets): Market | undefined => list.find((m) => m.isReference) ?? list[0];
export const activeMarkets = (list: Market[] = markets): Market[] => list.filter((m) => m.active);
export const marketByCode = (code: string, list: Market[] = markets): Market | undefined => list.find((m) => m.code === code);
