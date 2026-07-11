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
  /** Footer legal line: the market's local dealer/HQ address. */
  legalLine?: string;
  legalLinks?: MarketLegalLink[];
  order?: number;
  /* Per-market OPERATIONS (moved from siteSettings 2026-07-11): tracking +
     consent IDs and the newsletter provider config. Not seeded from code, so
     the fallback registry below never carries them; editors enter them on the
     Market doc in the Studio. The *ApiKey / *Client* / WebhookUrl fields hold
     RSA ciphertext only (see lib/newsletter-secrets.ts). */
  gtmId?: string;
  cookiebotId?: string;
  newsletterEnabled?: boolean;
  newsletterProvider?: string;
  newsletterListId?: string;
  mailchimpApiKey?: string;
  klaviyoApiKey?: string;
  marketoBaseUrl?: string;
  marketoClientId?: string;
  marketoClientSecret?: string;
  newsletterWebhookUrl?: string;
};

/** Fallback market registry (same seam philosophy as lib/stores.ts). The
 *  international English version is the reference: root + hreflang x-default.
 *  The four dealer markets are scaffolded here and go live one at a time,
 *  by dealer readiness, Belgium last. See docs/STROXX-market-localisation-plan.md. */
export const markets: Market[] = [
  { _id: 'market-int', name: 'International (English)', code: 'int', languages: ['en'], defaultLanguage: 'en', isReference: true, active: true, legalLine: '© STROXX', order: 0 },
  { _id: 'market-dk', name: 'Denmark', code: 'dk', languages: ['da'], defaultLanguage: 'da', isReference: false, active: false, dealerName: 'Carl Ras', dealerCtaUrl: 'https://www.carl-ras.dk/', supportPhone: '44 85 55 11', supportHours: 'Mon-Thu 07-16, Fri 07-15', legalLine: '© Carl Ras A/S | Mileparken 31 | 2730 Herlev | CVR: DK 70 58 71 14', order: 1 },
  { _id: 'market-de', name: 'Germany', code: 'de', languages: ['de'], defaultLanguage: 'de', isReference: false, active: false, dealerName: 'Meesenburg', dealerCtaUrl: 'https://www.meesenburg.com', supportPhone: '+49 461 5808 2000', legalLine: '© Meesenburg GmbH & Co. KG | Westerallee 162 | 24941 Flensburg | USt-IdNr: DE134633096', order: 2 },
  { _id: 'market-fr', name: 'France', code: 'fr', languages: ['fr'], defaultLanguage: 'fr', isReference: false, active: false, dealerName: 'Foussier', dealerCtaUrl: 'https://www.foussier.fr', supportPhone: '02 50 821 821', supportHours: 'Mon-Fri 07-19', legalLine: '© Foussier SA | ZAC du Monné, Rue du Châtelet | 72700 Allonnes | SIREN 329 681 340', order: 3 },
  { _id: 'market-be', name: 'Belgium', code: 'be', languages: ['nl', 'fr'], defaultLanguage: 'nl', isReference: false, active: false, dealerName: 'Lecot', dealerCtaUrl: 'https://lecot.be', supportPhone: '056 36 45 11', supportHours: 'Mon-Fri 08-12, 13-17', legalLine: '© Lecot NV | Vier Linden 7 | 8501 Heule (België)', order: 4 },
];

export const referenceMarket = (list: Market[] = markets): Market | undefined => list.find((m) => m.isReference) ?? list[0];
export const activeMarkets = (list: Market[] = markets): Market[] => list.filter((m) => m.active);
export const marketByCode = (code: string, list: Market[] = markets): Market | undefined => list.find((m) => m.code === code);

/** Market codes are 2 to 5 lowercase letters, same rule as the market schema's
 *  slug validation (dk, de, fr, be, int). */
export const MARKET_CODE_RE = /^[a-z]{2,5}$/;

/** Resolve which market's OPERATIONS (tracking + newsletter provider config)
 *  a request belongs to, from a CLIENT-SENT market code (middleware skips
 *  /api, so headers cannot tell us; same pattern as /api/chat). The code is
 *  untrusted input: anything that is not a well-formed, registered code falls
 *  back to the REFERENCE market, never to another dealer market. The reference
 *  market normally carries no tracking or newsletter credentials, so a missing
 *  or bogus code can never reach another market's keys. */
export function resolveOpsMarket(code: unknown, list: Market[] = markets): Market | undefined {
  if (typeof code === 'string' && MARKET_CODE_RE.test(code)) {
    const m = marketByCode(code, list);
    if (m) return m;
  }
  return referenceMarket(list);
}
