# ARCHITECTURE, how STROXX runs every market from one codebase

> **The one thing to never forget:** there is ONE codebase. It serves every market.
> "Making a copy for Denmark" copies the *content*, never the code. When we add a component,
> fix a bug, or ship a feature, it lands on every market on the next deploy, because a market
> is not a code fork, it is the same app rendering that market's content.

Last reviewed: 2026-07-10.

---

## The model in one paragraph

STROXX is a single Next.js app (App Router, React 19) deployed once on Vercel, with content in Sanity. The same code renders International English, Denmark, Germany, France and Belgium. What differs per market is **content** (pages, sections, campaigns, copy, translations) and a small set of **market settings** (dealer, support details, legal line, and later tracking/social IDs). Code is shared and global; content is per-locale and owned by each market's editors. This is why a bug fix or a new feature reaches all markets for free, and why a local team can rewrite their whole site without ever touching code.

---

## Why one codebase, not a fork per market

The alternative, copying the code for each market, would mean every bug fix and every feature has to be re-applied by hand to four, five, ten separate codebases, and they drift apart within weeks. The whole point of Clem's model, "push from Int Eng through all the local sites so the code is shared, the content is theirs", is served by keeping exactly one codebase and moving all the per-market difference into data.

So the rule is: **anything that should be the same everywhere is code; anything that differs per market is content or a market setting.** If we ever find ourselves wanting to hardcode a market-specific string in a component, that is the signal it belongs on a Market document or a localised page instead.

---

## How a single deploy serves many markets

Three layers turn one app into many localised sites.

**1. The locale registry, `lib/i18n.ts`.** One array (`locales[]`) is the single source of truth for every language/market: its code, its domain, its path, and how Belgium runs bilingually on one `.be` domain via a `/fr` sub-path. Add or retire a market here and it flows out to the middleware, both language switchers, the market registry, the Sanity internationalization config, and the seed scripts (this coupling is tracked in DEPENDENCIES.md).

**2. Locale resolution, `middleware.ts` + `lib/locale.ts`.** The middleware resolves the incoming request to a locale, domain first (e.g. a `.dk` domain), then sub-path (e.g. `/fr` on the Belgian domain), and sets an `x-stroxx-locale` header. `getLocale()` reads that header and returns the active Locale, which carries its `.market`. Every server component that needs to know "which market am I rendering right now" asks `getLocale()`; nothing hardcodes a market.

**3. Content by locale, Sanity.** Content documents are internationalised with document-internationalization: each page/section exists once per language, and queries fetch `language == $lang`. Market-level settings live on **Market** documents (`lib/markets.ts` is the seed + fallback registry; `getMarkets()` reads the live Sanity docs). So the same `<Footer/>` component renders Carl Ras's Herlev address on the Danish site and Meesenburg's Flensburg address on the German site, purely from data, because it resolves `marketByCode(currentMarket)?.legalLine`.

The payoff: deploy once, and Vercel serves all markets from that single build. There is no per-market pipeline to run.

---

## What is shared vs. what is local

**Shared (code, global, one change reaches everyone):** components, layout, design system and tokens, the store finder, the product explorer, routing and middleware, SEO scaffolding, security headers, analytics wiring, and the Sanity schema itself. A local market cannot edit these and does not need to.

**Local (content + market settings, owned by each market):** every page's copy and structure, campaigns, the sections on a page, translations, and the Market document fields, dealer name and shop URL, support phone and hours, the legal line / HQ address, legal links, and (once built) the market's Cookiebot ID, GTM container, social profile URLs and tracking IDs. Legal text differs by market by law, so it is always per-market.

**Fed by systems, not authored by hand:** products come from the PIM, media/assets from the DAM. Markets do not re-key product data; when the PIM or DAM gets new data we pull it in and every market reflects it. A market's job on products is presentation and campaigns, not data entry.

---

## What launching a market actually is

Because the code already runs every market, standing up a new market is a content and settings operation, not an engineering project:

1. Turn the market on in the locale registry (already listed; flip `active`).
2. Create/seed its **Market** document (dealer, support, legal line, legal links).
3. Duplicate the International English master content into the new locale, then let the market translate and adapt it.
4. Set the market's tracking/social config (Cookiebot, GTM, socials) when those fields exist.
5. Point the domain (or sub-path for Belgium) and add hreflang.
6. QA against the launch checklist, then go live.

The step-by-step version of this lives in `MARKET-LAUNCH-PLAYBOOK.md`.

---

## The content lifecycle after launch

Once live, a market runs mostly on its own. Editors own their pages and campaigns and can add, delete and restructure freely. Support and product pages "just run" off shared code plus PIM/DAM data. When we improve the platform, a component, a fix, a feature, it deploys once and every market gets it, with their content untouched. The only things that flow the other way (from a market back into the platform) are bug reports and feature requests, which become code changes that then propagate to everyone again.

---

## Guardrails that keep the model honest

- **Never hardcode a single market's string in a component.** Put it on the Market doc or a localised page and resolve it by locale. (The footer legal line is the canonical example of fixing this, see DEPENDENCIES.md.)
- **The CMS is the runtime source of truth.** Code constants in `lib/*.ts` are seeds and emergency fallback only; a change is not live until the matching `npm run seed:*` has pushed it to Sanity.
- **One registry per concern.** Locales in `lib/i18n.ts`, markets in `lib/markets.ts` + the `market` schema, the domain in `lib/site.ts`. Add in one place, let it flow.
- **Per-market difference is data, shared behaviour is code.** When in doubt, ask which side a thing is on.
