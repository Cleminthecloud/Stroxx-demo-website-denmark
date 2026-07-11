# STROXX multi-market coherence audit

After making the buy layer market-first, we reviewed the whole platform against
how it now works: multiple markets (international + Denmark, Germany, France,
Belgium) and CMS-first content. This is the corrected, verified picture.

## The platform is already market-ready by design
Most per-market content resolves per locale through **document-internationalized
`siteSettings`**: `getSiteSettings()` fetches the current locale's settings
(`language == <locale>`) and falls back to the English reference. The hardcoded
Danish strings scattered in the code are **fallbacks** (the "empty field shows
the default copy" system), not the live source. So these surfaces are already
per-market — launching a market means authoring that market's `siteSettings`
document, not changing code:
- Footer: hours + about text (`s.supportHours` / `s.footerAbout`); the dealer PHONE, legal line and legal links come from the current MARKET doc (2026-07-11 dealer-contact model — the old siteSettings phone/legalLine/retailer fields are removed).
- Service page: legal documents, FAQ, returns steps, all copy (`s.serviceDocs` / `s.serviceFaq` / `s.serviceReturnSteps` / headings).
- `/llms.txt` for AI engines (`s.llmsTxt`).
- Chat assistant dealer name + phone (the chat client sends its market code; the route reads the MARKET doc).
- Homepage, landing pages, support pages, news: all `language == <locale>` documents.

## Done in code
- Buy is fully market-first: `lib/buy.ts dealerBuyUrl(currentDealer, code)`,
  current market resolved once in `app/layout.tsx`, every buy CTA derives dealer
  + label (DK Carl Ras, DE Meesenburg, FR Foussier, BE Lecot, international
  chooser). Dead Carl-Ras fallbacks, the unused `international` field and the
  orphaned `BuyButton` removed. See stroxx-buy-foundation.md.
- Store finder is market-scoped: every `store` carries a `country` (dk/de/fr/be);
  `getStores()` filters to the current market's country, the international site
  shows all of Europe (`fitBounds` auto-zooms to the set), and empty markets fall
  back to all-countries-all-stores. The separate "specialists" tab/map was folded
  into an optional per-store **STROXX Specialist** on the store card; store +
  specialist totals feed the Studio Dashboard's brand-footprint tiles.

## Genuinely still single-market (the real remainder)
1. (content) **Per-market `siteSettings` documents** — the biggest lever. Author
   the German / French / Belgian settings (contact, hours, legal line, legal
   documents, service copy, llms.txt, about text) and every surface above
   localises with no code change. This is editor / launch work.
2. (DONE, seeded 2026-07-11: all 222 stores live in the CMS) **European store data** — captured. `lib/stores.ts` now
   carries the real dealer networks: Meesenburg (DE, 28 locations), Foussier
   (FR, 84 stores), Lecot (BE, 84 stores), each with real address + coordinates
   (FR/BE read from the dealers' own store-locator data; DE geocoded via Google
   Maps). 222 stores total (26 DK + 196 EU). Dealer stores abroad have no named
   manager, so the model gained an optional `manager` plus a store-level
   `phone`/`email` contact line, and `StoreBrand` gained Meesenburg/Foussier/Lecot.
   Seeded via `npm run seed:more` on 2026-07-11.
3. (content) **Guarantee terms PDF** (`/STROXX-tilfredshedsgaranti.pdf`): a static
   Danish file. The guarantee seal + guarantee copy are already per-market in the
   CMS; a per-market terms PDF is content.
4. (decision) **Org structured data** (`app/layout.tsx` orgLd): names Carl Ras as
   `parentOrganization` with a `+45` phone. This may be STROXX's actual corporate
   structure rather than a market artifact — confirm before changing; if STROXX
   is market-neutral, drop the single parent and list all dealers in `sameAs`.
5. (blocked) **hreflang / language alternates**: pages set `canonical` but emit no
   `hreflang`. This needs the FINAL domain strategy first (`lib/i18n.ts` carries
   per-locale domains — stroxx.eu / .dk / .de / .fr / .be — but the site currently
   runs on one demo domain with subpaths). Wire hreflang once domains are decided.

## Principle
CMS is the runtime source of truth; per-market content lives on locale-specific
documents (siteSettings, homePage, landingPage, supportPage…) or Market docs
(dealer contact), never hardcoded. After authoring/localising, run the matching
`npm run seed:*` where a seed exists and verify live (Sanity CDN caches a few
minutes).
