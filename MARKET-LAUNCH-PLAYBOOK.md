# MARKET-LAUNCH-PLAYBOOK, how to stand up a new STROXX market

> The repeatable checklist for taking a market from "not live" to live. Because the codebase
> already runs every market (see ARCHITECTURE.md), launching one is a content + settings job,
> not an engineering project. Work top to bottom; nothing here needs a code change unless a row
> says so.

Last reviewed: 2026-07-10.

The reference market is **International English** (`int`). Every new market starts as a copy of its content, then gets translated and adapted. The live markets and their dealers: Denmark / Carl Ras, Germany / Meesenburg, France / Foussier, Belgium / Lecot (bilingual NL + FR on one `.be` domain).

---

## Phase 0, prerequisites (once per market)

- Confirm the market's dealer partner and get their real details: HQ legal address, support phone, support hours, dealer shop URL, dealer logo (single-colour SVG for the masked mark).
- Confirm the market's languages (Belgium is two: `nl` default + `fr` on `/fr`).
- Get the market's own Cookiebot ID, GTM container ID, social profile URLs, and any analytics/tracking IDs. (If the schema fields for these do not exist yet, they are added as a one-time platform change, see Phase 3.)

---

## Phase 1, turn the market on in code (small, one-time)

- **`lib/i18n.ts`** — the locale/market is already listed; set it active and confirm its `domain` / `path` / `domainPath`.
- Verify the coupling chain fires (all driven from the registry): `middleware.ts` resolution, both `LocaleSwitcher` variants, `supportedLanguages` in the `documentInternationalization` config (`sanity.config.ts`), and the seed scripts. This is the "A locale / market" row in DEPENDENCIES.md, follow it.
- No component code should need editing. If it does, that string was hardcoded and belongs on the Market doc instead, fix that first.

---

## Phase 2, create and seed the Market document

Set on the market's **Market** doc (`lib/markets.ts` seed + the `market` Sanity schema), then `npm run seed:markets`:

- `dealerName`, `dealerCtaUrl` (their ecommerce shop, the "where to buy" and dealer-logo link target).
- `supportPhone`, `supportHours`.
- `legalLine` — the dealer's real HQ legal address. This is what renders in the footer for this market. NEVER leave it pointing at another market's dealer. (See the footer legal-line coupling row in DEPENDENCIES.md.)
- `legalLinks` — the market's Privacy / Cookies / Terms targets.
- Dealer logo wired in `lib/dealer-logos.ts` (code, src SVG, aspect ratio) so the footer / chooser / brand guide show the right mark.

---

## Phase 3, tracking, consent and social (per-market)

Legal and consent tooling differs by market and must never inherit another market's IDs.

- **Cookiebot** — the market's own Cookiebot ID (consent gates GTM/GA).
- **Google Tag Manager / GA** — the market's own GTM container / analytics ID.
- **Social profiles** — the market's own profile URLs (footer + structured data).
- **Tracking** — any market-specific pixels/IDs.

If the dedicated Sanity fields for these do not exist yet, adding them is a one-time platform change: add the fields to the `market` schema (and `lib/markets.ts` + the `getMarkets` projection), wire them where they render (consent script, GTM snippet, footer socials), then document the coupling in DEPENDENCIES.md. After that, every future market just fills them in, no code change. Note: a full CSP is deferred because GTM + Cookiebot inject scripts and need an allow-list pass, do that CSP pass when the first market goes live with real IDs.

---

## Phase 4, duplicate and localise the content

- Duplicate the International English master documents into the new locale (document-internationalization creates the per-language copies).
- Hand off to the market's editors to translate and adapt: copy, sections, campaigns, imagery. They own this and can restructure freely.
- Products and media come from PIM/DAM, not re-keyed, confirm the market's assortment pulls through.
- Localise the surfaces still known to carry Denmark / Carl Ras defaults as each market launches (tracked in `STROXX-multimarket-audit.md`): footer *about* paragraph (`footerAbout`), `/service`, the guarantee terms + PDF, org structured data, `lib/llms-fallback.ts`.

---

## Phase 5, stores and dealer coverage

- Ensure the market's stores carry a valid `country` (`dk`/`de`/`fr`/`be`) so the store finder scopes correctly (a local market shows its own country; international shows all of Europe). Seed via `npm run seed:more`.
- Confirm the store-finder filter chips and map auto-zoom behave for this market (see the store-country coupling row in DEPENDENCIES.md).

---

## Phase 6, domain, SEO and go-live

- Point the market's domain (or `/fr` sub-path for Belgium) and add it to the Vercel project domains + `docs/STROXX-domains-guide.md`.
- Add hreflang at cutover (blocked until real domains exist).
- Confirm `lib/site.ts` `SITE_URL` and the email templates' absolute URLs are correct for launch.
- Run the QA gate below, then flip live.

---

## Go-live QA gate (do not skip)

- Footer shows THIS market's dealer logo and THIS market's HQ legal line (not Carl Ras unless it is Denmark).
- Language switcher offers the right languages and links to the right host/path.
- "Where to buy" / dealer CTA points at this dealer's shop.
- Support phone / hours are the market's own.
- Store finder shows this market's country and zooms correctly.
- Cookiebot loads the market's consent banner; GTM/GA fire only after consent.
- Legal links (Privacy / Cookies / Terms) resolve to the market's own pages.
- No prices anywhere; no em/en dashes in copy.
- Spot-check that a recent platform change (component/fix) is present, confirming the market is on the shared codebase.

---

## The one-line summary

Launching a market = turn it on in the registry, seed its Market doc (dealer + legal + support), set its tracking/social IDs, copy the English master content and localise it, wire stores, point the domain, QA. The code is already done, because the code is shared.
