# STROXX, brand site

> A modern, experiential brand site for STROXX, the European tool brand for professional tradespeople,
> sold through one dealer per market: Carl Ras (Denmark), Meesenburg (Germany), Foussier (France) and
> Lecot (Belgium). The site introduces, convinces and **routes to the local dealer** for the actual
> purchase. No cart lives here, and the site shows no prices anywhere.

Updated 1 October 2026.

The site is final production, not a prototype. It runs one codebase across all four markets
(DK, DE, FR, BE) plus the international English base, with all content editable in the Sanity CMS
(content management system).

&nbsp;
## What's in it

| Route | What it is |
|---|---|
| `/` | Home. A single scrolling page. The STROXX tool bag is a **load-time intro** (`BagJourney`): it falls into the hero, settles, and the tools cascade in on load, then scrolls away with the hero. Below it: range, category storytelling, specialists, the month, guarantee, EU footprint, campaign band (campaigns per market). |
| `/products`, `/category/[slug]` | **Product finder**: filter by category, search, sort. A particle hero per category. Every "buy" goes to the current market's dealer (`lib/buy.ts`); on the international base it opens the dealer chooser. Never another market's shop. |
| `/product/[slug]` | **Product page**, the heavy page type, with the **scroll-driven experience**: a pinned product cut-out travels down the gutter as you scroll (`ProductExperience`), alongside selling points, a specialist quote, spec table, Pro Club signup and related products. |
| `/stores` | Full-screen store finder (Leaflet) across all four markets: opening hours, phone, and a Specialists tab. |
| `/trades`, `/trades/[slug]` | Trade pages, tools grouped by craft. |
| `/try-it`, `/campaign/[...slug]` | Campaign and landing pages, built from CMS section blocks (including the reusable hotspot image). |
| `/monthly`, `/monthly/[period]`, `/monthly/archive` | Månedens STROXX (the monthly lineup): the live month, a permanent address per month (`/monthly/YYYY-MM`) and the archive. |
| `/news`, `/news/[slug]` | News and articles, with correct social share previews. |
| `/support`, `/support/[slug]`, `/qr/[code]` | Manuals and the packaging QR system. `/qr/<code>` is a repointable 302 that counts scans. |
| `/studio` | The Sanity Studio: visual (click-to-edit) editing on top of the live site, plus the analytics dashboard. |
| `/brand` | The brand guide (code-owned). |
| `/test` | The tester landing page and bug-report form (noindex, no login). Reports land as `feedback` docs in the Studio. |
| `/guide`, `/components` | The content-team editor guide, and an internal gallery of every CMS section block. |
| `/api/tool/[id]` | Image proxy. Pulls a real product photo from the Carl Ras image CDN, **knocks out the white background** with `sharp`, serves it CORS-safe. |
| `/api/*` | Chat, newsletter (signup, confirm, Brevo webhook), tracking, forms, feedback, the signed Sanity revalidation webhook, draft mode. |

Legal pages (`/privacy`, `/cookies`, `/terms`, `/satisfaction-guarantee`, `/service`, content in the CMS),
`/llms.txt`, sitemap, robots and a PWA manifest ship too.

### Stack
Next.js 16 (App Router, TypeScript, React 19), Node 22.12 or later, Tailwind, GSAP and Lenis smooth-scroll,
Leaflet, Sanity CMS (`sanity` and `next-sanity`, Studio embedded at `/studio`), `sharp` (image knockout),
`qrcode`, Vitest. The specialist chat is built in on the Claude API (no third-party chat licence) and can
be switched off in the CMS.

### Request proxy
`proxy.ts` (it was `middleware.ts` until 31 August 2026; Next.js 16 renamed the convention, and it now
runs on the Node.js runtime) resolves market and language from the domain first, then the path, and
applies CMS-managed redirects plus the legacy URL map that printed QR codes depend on.

### Brand tokens
Ink `#0B0C0E`, signature blue `#0088C2` (the single sanctioned accent), red `#EB0029` (extended
palette only), fog for muted text. Display type is the system Helvetica Neue stack (no external font
licence). The logo lockup is the "Proud Professionals" lockup (since 1 September 2026); motion rules are in `MOTION.md`.

&nbsp;
## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # tsc --noEmit + eslint
npm test             # Vitest suite in tests/ (buy contract, campaigns, catalogue, price firewall, i18n, redirects, revalidation, rate limiting and more)
npm run build && npm run start
```

> The public site works from built-in fallbacks with no env vars. The Studio's draft preview and
> content writes need the Sanity env vars (`.env.local`); see `docs/STROXX-sanity-guide.md`.
> Full list of every env var, what it powers and what breaks if missing: the Environment Variables
> (IT setup) document in the handover pack.
> Product names, imagery and specs come from a fixed snapshot of Carl Ras data through `lib/catalog`
> (the single product seam); the proxy fetches photos at request time.

Content seeding and migration scripts (`npm run seed`, `seed:more`, `seed:news`, `seed:support`,
`seed:videos`, `seed:markets`, `seed:qr`, `seed:i18n-base`, `migrate:*` and others, see `package.json`)
write to the Sanity dataset; each runs `sanity exec ... --with-user-token`. Most merge-preserve existing
values, so re-running a seed does not change content that editors have already edited. Content backups:
`npm run backup` locally, and a GitHub Action exports the dataset every Monday.

&nbsp;
## Deploy

Hosted on Vercel (GitHub connected). Every push builds; CI (GitHub Actions) runs `npm run check`
(typecheck and lint), `npm test` and a production build as the gate.
Set the Sanity env vars in Vercel before deploy. `sharp` runs on the Node runtime out of the box.
Security headers and a Content Security Policy ship in `next.config.mjs`; rate limiting uses Upstash Redis.
Published CMS changes reach the site through the signed Sanity webhook at `/api/revalidate`.

The production domain cutover is a coordinated step. The recommended plan is one country domain per
market (stroxx.dk, .de, .fr, .be, with stroxx.eu as the international hub), with sub-paths under
stroxx.eu as the fallback. The domain constant lives in `lib/site.ts` (`SITE_URL`), swapped once at
launch. See `docs/STROXX-domains-guide.md` and `docs/STROXX-domain-takeover.md`.

&nbsp;
## Where this goes next

- **PIM/DAM** (product information and digital asset management): replace the fixed snapshot with
  dealer feeds. `lib/catalog` (the product seam, with the price firewall) and the `productAugment` schema
  are the seams; nothing is agreed with the dealers yet. See `docs/STROXX-pim-dam-integration.md`.
- **Multi-market**: Danish content first, then the other markets; hreflang at domain cutover. See
  `docs/STROXX-market-localisation-plan.md`.
- **Permission database**: built, switches on when the Sanity dataset is made private. See
  `docs/STROXX-permission-database.md`.

&nbsp;
## Before you change something

See [`DEPENDENCIES.md`](DEPENDENCIES.md), the "if I change X, also update Y and Z" map for the whole
project (code, design tokens, CMS, printed QR codes, brand docs). Check it before any non-trivial edit
so a change does not ship half-done. It is kept current with every dependency-touching change.

&nbsp;
## Project layout
```
app/            routes (home, products, product/[slug], category, stores, trades, monthly,
                campaign, try-it, news, support, qr, studio, test, brand, api/*, legal pages)
components/     Nav, Footer, BagJourney/BagFill, ProductExperience, ProductExplorer, HotspotImage,
                MonthlyLineupView, ParticleImage, FeedbackForm, GlassButton, Reveal, cms/*, ...
lib/            catalog/ (product seam), buy.ts, campaigns.ts, cms.ts, i18n.ts, markets.ts,
                permissions.ts, redirects.ts, stores.ts, site.ts (SITE_URL), ...
sanity/         schema types, Studio structure and tools, Dashboard, hotspot placer, QR and preview fields
scripts/        seed and migration scripts, handover pack build
tests/          Vitest suite (run in CI)
docs/           strategy, editor guide, domain, security and CMS docs
proxy.ts        request proxy: locale resolution and redirects
DEPENDENCIES.md the coupling map, read before changing anything
```
