# STROXX, brand site

> **Dyrt værktøj til udyr pris.** A modern, experiential brand site for STROXX, the value-tier
> professional tool brand from Carl Ras. The site introduces, convinces and **routes to the local
> partner** (Carl Ras in DK) for the actual purchase. No cart lives here, and the brand pages show no prices.

The site is a full production build, not a prototype. It runs one codebase across all four markets
(DK, DE, FR, BE), with all content editable in the Sanity CMS.

---

## What's in it

| Route | What it is |
|---|---|
| `/` | Home. A single scrolling page. The STROXX tool-bag is a **load-time intro** (`BagJourney`): it falls into the hero, settles, and the tools cascade in on load, then scrolls away with the hero. Below it: range, category storytelling, specialists, the month, guarantee, EU footprint, campaign band. |
| `/produkter` | **Product finder**, filter by category, search, sort. A particle hero per category. Every "buy" deep-links to Carl Ras with the live UTM convention. |
| `/produkt/[slug]` | **Product page**, the heavy page type. This is the one with the **scroll-driven experience**: a pinned product cut-out travels down the gutter as you scroll (`ProductExperience`), alongside selling points, a specialist quote, spec table, Pro Club signup and related products. |
| `/butikker` | Full-screen store finder (Leaflet), opening hours, phone, and a Specialists tab. |
| `/fag`, `/fag/[slug]` | Trade pages, tools grouped by craft. |
| `/proev-det`, `/maanedens` | Campaign ("Try it") and month ("Tool of the Month") landing pages, built from CMS section blocks. |
| `/nyheder`, `/nyheder/[slug]` | News and articles, with correct social share previews. |
| `/support`, `/support/[slug]`, `/qr/[code]` | Manuals and the packaging QR system. `/qr/<code>` is a repointable 302 that counts scans. |
| `/studio` | The Sanity Studio, visual (click-to-edit) editing on top of the live site, plus the analytics dashboard. |
| `/test` | The tester landing page and bug-report form (noindex, no login). Reports land as `feedback` docs in the Studio. |
| `/guide`, `/komponenter` | The content-team editor guide, and an internal gallery of every CMS section block. |
| `/api/tool/[id]` | Image proxy. Pulls a real product photo from the Carl-Ras CDN, **knocks out the white background** with `sharp`, serves it CORS-safe. |

Legal pages (`/privatliv`, `/cookies`, `/handelsbetingelser`, `/service`) and a PWA manifest ship too.

### Stack
Next.js 16 (App Router, TS, React 19) · Tailwind · GSAP + Lenis smooth-scroll · Leaflet · Sanity CMS
(`sanity` + `next-sanity`) · `sharp` (image knockout) · `qrcode`. The old Three.js/Rapier physics bag
was retired in favour of the lighter load-time bag intro.

### Brand tokens
Ink `#0B0C0E` · signature blue `#0088C2` (the single sanctioned accent) · red `#EB0029` (extended
palette only) · fog for muted text. Display type is the system Helvetica Neue stack (no external font
license); no prices appear on brand pages.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # tsc --noEmit + eslint (the push gate)
npm run build && npm run start
```

> The public site works from built-in fallbacks with no env vars. The Studio's draft preview and
> content writes need the Sanity env vars (`.env.local`); see the Sanity integration guide in `docs/`.
> Full list of every env var, what it powers and what breaks if missing: [`docs/STROXX-env-vars.md`](docs/STROXX-env-vars.md).
> Product names, imagery and specs originate from `carl-ras.dk`; the proxy fetches photos at request time.

Content seeding scripts (`npm run seed`, `seed:more`, `seed:news`, `seed:support`) populate the Sanity
dataset; each runs `sanity exec ... --with-user-token`. Weekly content backups run via `npm run backup`
and a GitHub Action.

---

## Deploy

Hosted on Vercel (GitHub connected). Every push builds; `npm run build` runs types + lint as the gate.
Set the Sanity env vars in Vercel before deploy. `sharp` runs on the Node runtime out of the box.
Security headers and a CSP ship in `next.config.mjs`; rate limiting uses Upstash Redis.

The production domain cutover (to `stroxx.eu` with locale subpaths) is a coordinated step; the domain
constant lives in `lib/site.ts` (`SITE_URL`), swapped once at launch. See `docs/STROXX-domain-takeover.md`.

---

## Where this goes next

- **PIM/DAM** — join the Carl Ras product feed and Digizuite media into the catalogue. `lib/data.ts`
  and the `productAugment` schema are the seams. See `docs/STROXX-pim-dam-integration.md`.
- **Specialist chat** — scripted demo today; production is an LLM with retrieval over the CMS
  FAQ/products/stores.
- **Multi-market** — locale subpaths and hreflang for DE/FR/BE; see `docs/I18N-STRATEGY.md`.

## Before you change something

See [`DEPENDENCIES.md`](DEPENDENCIES.md), the "if I change X, also update Y and Z" map for the whole
project (code, design tokens, CMS, printed QR codes, brand docs). Check it before any non-trivial edit
so a change doesn't ship half-done. It's kept current with every dependency-touching change.

## Project layout
```
app/            routes (home, produkter, produkt/[slug], butikker, fag, nyheder,
                support, qr, studio, test, api/*, legal pages)
components/      Nav, Footer, BagJourney/BagFill, ProductExperience, ProductExplorer,
                ParticleImage, FeedbackForm, GlassButton, Reveal, cms/*, ...
lib/            data.ts (catalogue), cms.ts, stores.ts, ska.ts, site.ts (SITE_URL), ...
sanity/         schema types, Studio config, Dashboard, QR + share preview fields
docs/           strategy, editor guide, domain/security/CMS docs
DEPENDENCIES.md the coupling map, read before changing anything
```
