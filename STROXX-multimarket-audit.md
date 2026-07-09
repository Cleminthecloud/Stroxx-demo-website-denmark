# STROXX multi-market coherence audit

After the buy layer was made market-first, we did a ground-up review of the
platform against how it now works: multiple markets (international + Denmark,
Germany, France, Belgium) and CMS-first content. This file records what was made
coherent in code and what is still single-market (Denmark / Carl Ras) content to
localise as each market launches. It is a living checklist, not a bug list.

## Done (in code)
- Buy is fully market-first. One resolver, `lib/buy.ts` `dealerBuyUrl(currentDealer, code)`;
  the current market is resolved once in `app/layout.tsx` and shared through the
  dealer-chooser context. Every buy CTA derives its dealer and label:
  Denmark to Carl Ras (product deep-link), Germany to Meesenburg, France to
  Foussier, Belgium to Lecot, international to the "Where to buy" chooser.
  Primitives: `BuyCTA`, `LandingBuyButton`, `FooterBuyLink`; `CampaignBand` and
  `ProductExperience` resolve inline. No component hand-writes a Carl Ras link.
- Removed the dead Carl-Ras buy fallback that was threaded through the landing
  pages, removed an unused context field, and deleted the orphaned `BuyButton`.

## Still single-market (Denmark / Carl Ras) — localise per market at launch
Severity: H = customer-visible and wrong on a non-Danish market, M = SEO /
structured data, L = content nicety. These are content, not bugs: they are
correct for Denmark today and there is no other-market content to replace them
with yet, so they were not changed blind.

1. (H) Footer contact, `components/Footer.tsx`: customer-service phone, hours and
   the legal line come from global Site settings, not the current market. Market
   documents already carry `supportPhone` / `supportHours` / `legalLinks`; the
   footer should resolve the current market first, then fall back. Note the
   Denmark market phone has no `+45`, normalise before using it in a `tel:` link,
   and a per-market legal-entity line needs a small schema field.
2. (H) Service page, `app/service/page.tsx`: hardcoded Carl Ras terms / privacy /
   cookie links, the `44 85 55 11` number, "26 stores" and returns-at-Carl-Ras
   copy. Should read the current market's legal links and dealer contact.
3. (H) Store finder, `components/StoreFinder.tsx` / `/butikker`: Carl Ras Denmark
   stores only. Per market this is the dealer's own network (or hidden until the
   data exists).
4. (H) Guarantee terms, `GuaranteeModal` / `/proev-det` / the tilfredsgaranti
   PDF: the Danish Carl Ras 30-day terms. The guarantee seal is already
   per-market in the CMS; the terms, PDF and returns flow are not.
5. (M) Organisation structured data, `app/layout.tsx`: `sameAs` and
   `parentOrganization` name Carl Ras only, with a `+45` phone.
6. (M) hreflang: pages set `canonical` but no `hreflang` / language alternates
   for the locale set. Wire once the domain and locale strategy is final
   (`lib/i18n.ts` already carries the domains and paths).
7. (L) `lib/llms-fallback.ts` and the AI chat brain: Denmark / Carl Ras centric.
8. (L) `app/api/chat/route.ts`: default support phone hardcoded as a fallback.

## Principle
The CMS is the runtime source of truth. Per-market content lives on Market
documents (dealer, contact, legal) or localised page documents, never hardcoded.
After localising any of the above, run the matching `npm run seed:*` and verify
live (Sanity CDN caches for a few minutes). See DEPENDENCIES.md.
