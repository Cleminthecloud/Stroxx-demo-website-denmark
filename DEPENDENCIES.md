# DEPENDENCIES, what breaks what

> **The "if I change X, also update Y and Z" map for the whole STROXX project.**
> Purpose: stop us shipping half a change. Before you (or Claude) touch anything in the list below,
> check the coupled items in the same row so nothing silently breaks: a page, a design token, a brand
> doc, a printed QR code, an email template.

**How to use this file**

1. **Tier 1 (Quick checklist)** is for fast lookups. Find the thing you're changing in the left column, do everything in the right column.
2. **Tier 2 (Deep reference)** explains the *why* behind the trickier couplings (layout geometry, the CMS, the QR print contract, brand docs).
3. This file is the canonical list. Claude keeps it current: whenever we make a change that creates or touches a dependency, it updates this file in the **same** push. If you spot a coupling that's missing, add a row and it'll be folded in.

Last reviewed: 2026-07-10. Companion docs: `ARCHITECTURE.md` (the one-codebase / content-per-market model) and `MARKET-LAUNCH-PLAYBOOK.md` (the new-market checklist).

---

## Tier 1, the quick checklist

| If you change... | Also update / check... |
|---|---|
| **The live domain** (currently the Vercel placeholder, later `stroxx.eu`) | It lives in ONE place: `lib/site.ts` (`SITE_URL`). Swap there and it flows to `app/layout.tsx` (metadataBase, JSON-LD), `app/robots.ts`, `app/sitemap.ts`, `app/fag` + `[slug]`, `app/produkt/[slug]`, `EmailPreviews.tsx`. The 3 email templates in `public/emails/*.html` use hardcoded absolute URLs, fix those by hand at launch. |
| **Nav height** (`components/Nav.tsx`, `h-20` / `h-14` scrolled) | Sticky filter bar offset in `components/ProductExplorer.tsx` (`sticky top-14` must equal the SCROLLED nav height). Any other `sticky top-*` bar and `scroll-mt-*` anchor offset. |
| **A locale / market** (add, rename or retire a language or country) | Driven from ONE registry: `lib/i18n.ts` (`locales[]`). Add/rename there and it flows to `middleware.ts` (domain-first, then sub-path resolution), BOTH `LocaleSwitcher` variants (they map over `locales`, no separate list), `lib/markets.ts` + the `market` schema (per-market dealer / CTA / assortment), `supportedLanguages` in the `documentInternationalization` config (`sanity.config.ts`), and the seed scripts. New ccTLD? Add it to `docs/STROXX-domains-guide.md`, the Vercel project domains, and hreflang at cutover. Belgium is bilingual on ONE `.be` domain via `domainPath` (`/fr`). |
| **Footer legal line / local HQ address** | Per-market. Sourced from `Market.legalLine` — `lib/markets.ts` (fallback registry, carries the real dealer HQ address per market), the `market` Sanity schema field, and the `getMarkets` GROQ projection (all three must list it). `components/Footer.tsx` resolves the current market with `getLocale()` + `marketByCode()` and renders THAT market's line: Carl Ras (DK, Herlev), Meesenburg (DE, Flensburg), Foussier (FR, Allonnes), Lecot (BE, Heule); the international/reference market shows a neutral `© STROXX`. **NEVER hardcode one market's address in the footer** (that is the bug this row exists to prevent — the Danish Carl Ras address showed on every market). Seed with `npm run seed:markets`. Same rule applies to any other single-market string that leaks site-wide: put it on the Market doc, resolve it by locale. |
| **Per-market tracking / consent / social** (Cookiebot ID, GTM container / GA, social profile URLs, tracking pixels) | Per-market, same rule as the legal line: NEVER hardcode one market's ID or handle site-wide. Each of these differs by market and belongs on the **Market** doc (or per-locale `siteSettings`), resolved by locale, never baked into a component. Dedicated Sanity fields are **not built yet** (placeholders today: `GTM-XXXX` in the CSP, a shared Cookiebot script) — when the first market nears launch, add the fields to the `market` schema + `lib/markets.ts` + the `getMarkets` projection, wire them where they render (consent script, GTM snippet, footer socials + org structured data), then update this row. Consent (Cookiebot) MUST gate GTM/GA. A full CSP is deferred precisely because GTM + Cookiebot inject scripts and need an allow-list pass, do that pass with the real IDs. See `MARKET-LAUNCH-PLAYBOOK.md` Phase 3 and the External services table below. |
| **The language switcher** (`components/LocaleSwitcher.tsx`) | Lives in TWO places: the desktop header dropdown (`Nav.tsx`, wrapped in `hidden sm:inline-flex`) and the mobile menu sheet (`<LocaleSwitcher variant="inline" />`, the pill row above the phone / Buy footer). Both share the same host+path link logic; options come straight from `lib/i18n.ts` `locales[]`. If you move the header's `sm` breakpoint, move the mobile variant in step or a band of widths shows the switcher twice, or not at all. |
| **Add a public route** (new page) | `app/sitemap.ts` (add it), `components/Footer.tsx` (nav links), `public/llms.txt` (page directory), and `KNOWN_PATH` in `app/api/track/route.ts` (else analytics logs it as "other"). Hidden/internal route instead? Add `robots: noindex` + a Cmd+K entry in `components/CommandMenu.tsx`. |
| **Add / rename a product category slug** (`lib/data.ts`) | `lib/trades.ts` (trade to category mappings), `featuredCategorySlugs` + `PARTICLE_*` maps in `lib/data.ts`, `app/sitemap.ts` (auto-includes, verify), any specialist `quoteTopic` tag naming it. |
| **Any content/text that mirrors the CMS** (`lib/markets.ts`, `lib/stores.ts`, `lib/data.ts` `specialists[]`, `lib/testimonials.ts`, `lib/videos.ts`, `lib/trades.ts`) | **The CMS (Sanity) is the runtime source of truth. These code constants are SEEDS + emergency fallback, NOT the live source.** `getX()` reads Sanity and only falls back to the constant when the WHOLE collection is empty (all-or-nothing: `data.length ? data : fallback`), so a CMS doc that already exists but is missing fields is **never** backfilled from code, editing the constant alone changes nothing on the live site. A content/text change is NOT done until the matching `npm run seed:<x>` has pushed it to Sanity AND it's verified live (Sanity read is live, no redeploy needed). Testing in code is fine mid-dev; shipping = seed + verify. **Seed map:** markets→`seed:markets`, stores/home→`seed:more`, specialists+testimonials+core demo→`seed`, videos→`seed:videos`, news→`seed:news`, support→`seed:support`, service copy→`seed:service`, prøv-det→`seed:proevdet`, QR→`seed:qr`, i18n base→`seed:i18n-base`. The seed scripts need `npx sanity login` and run from a machine with network to Sanity (NOT the sandbox), so Clem runs them. |
| **A specialist quote** (`lib/data.ts` `specialists[]`) | A quote that names a product/category MUST carry `quoteTopic: <categorySlug>` or it can surface on an unrelated product. Untagged = generic = safe anywhere. |
| **A store's `country`** (`store` doc + `lib/stores.ts`) | Drives the whole store-finder scoping chain: `getStores()` (`lib/cms.ts`) filters to the current market's country (international = all of Europe, `fitBounds` auto-zooms to the set; empty market = all countries all stores), and `components/StoreFinder.tsx` switches its filter chips between per-country (multi-country/international) and per-region (single-country) automatically. Every store MUST have a valid `country` (`dk`/`de`/`fr`/`be`) or it drops out of localised maps. A store's optional `specialist` also feeds the Dashboard footprint tile (`sanity/DashboardTool.tsx` counts `defined(specialist.name)`). Seed via `seed:more` (mapping carries `country` + `specialist`). |
| **A testimonial** (`lib/testimonials.ts`) | If `productCode` is set, the matching product page emits Review/AggregateRating schema. Keep `productCode` valid against `lib/data.ts`; `trades` controls which `/fag` pages show it. |
| **Månedens STROXX / the featured month** (`lib/ska.ts`) | The månedens email template, `/maanedens` page (auto), homepage `#maanedens` section (hero name auto from `SKA.hero`). Product codes are looked up via `products.find`, so an unknown code throws. Never say "DB2" in customer copy. |
| **Brand colours / tokens** | `tailwind.config.ts` (`stroxx.*`), `app/globals.css`, README "Brand tokens", and this file's Tier 2. Blue `#0088C2` is the only sanctioned accent; red `#EB0029` is extended-palette only. |
| **The bag hero geometry** | `components/BagJourney.tsx` and `components/BagFill.tsx` share constants (TOOLS, BAG_AR, panels). Change one dimension, recheck both, plus the hero headline padding in `app/page.tsx` (they overlap). |
| **A translucent panel behind the product cut-out** (`/produkt/[slug]`) | Any glass panel the travelling cut-out passes behind needs `.glass-panel--frost` or the product bleeds through. See Tier 2 "Layout geometry". |
| **A support page slug** (`/support/[slug]`) | The slug is a PRINT contract: packaging QRs hit `/pages/<slug>`. Renaming breaks printed codes, add a CMS redirect if forced. Never rename a printed `qrCode` code, repoint its `target` instead. |
| **A support-page video** (MMEXO films; `supportPage` `video` field) | Hosted in Sanity, NOT the repo (promos are ~117MB, over GitHub's 100MB/file limit). Masters live in the gitignored `Meena videos/`; run `npm run seed:videos` to upload or swap. CSP `media-src 'self' https:` in `next.config.mjs` already allows Sanity's CDN. Legacy QR paths `/mmexo-skeleton-{dk,de,nl,fr}-video` redirect to `/support/mmexo` (wired in `scripts/seed-videos.ts`). ST-2 lock tutorial videos do not exist (never produced). |
| **Security headers / CSP** (`next.config.mjs`) | `X-Frame-Options` must stay `SAMEORIGIN` (not DENY), Sanity Presentation iframes the site at `/studio`. Adding any external script/API/image host means adding it to the CSP allow-list here (see "External services"). |
| **A share-image (OG) fallback** | Change BOTH the live route's `generateMetadata` AND the matching Studio preview component (`SharePreviewField` for articles, `SeoPreviewField` for landing/site) in the same commit, or the Studio "Shared link" card lies. See Tier 2 "OG / social share image resolution". |
| **How the CMS works for editors** (new field, new section, changed workflow, renamed thing) | Update the THREE editor-facing surfaces together so they don't drift: `lib/help-knowledge.ts` (the Help assistant's brain), `docs/STROXX-editor-guide.md` (the Guide tab), and `sanity/WelcomeTool.tsx` (the Welcome text). If any is stale, editors get wrong answers. |
| **The guarantee seal block** (`components/GuaranteeSeal.tsx`) | Four coupled pieces: the `guaranteeSeal` object in `sanity/schemaTypes/landingPage.ts` (the `sections` array), its render case in `components/cms/LandingSections.tsx`, the component itself, and its `.gseal-*` styles in `app/globals.css`. Add/rename a field = touch the schema AND the component's props/JSX. The peel is overflow-masked (akapowl technique, no clip/SVG-arc), and the text auto-fits (measures line widths, scales the block) so CMS copy can never break out of the circle, even on mobile. It's a landing-page section block, so it's per-market automatically (localised pages carry their own copy). It ALSO renders in the homepage guarantee section (`app/page.tsx`) from `sealLine1`/`sealConnector`/`sealLine2`/`sealSub1`/`sealSub2` in `lib/home-copy.ts` + `sanity/schemaTypes/homePage.ts` (change those five together). Runtime dep is `gsap` only, no NEW package, see the GSAP row. |
| **GSAP (the motion library)** | Pinned at `gsap` `3.12.5` in `package.json` (see `MOTION.md`). The seal peel, `Reveal`, `ScrollText`/scroll motion and the Lenis smooth-scroll bridge all import it directly, so no new component adds a NEW npm dependency, they reuse this one. A GSAP MAJOR bump (4.x) is the risk: timeline/ease APIs can shift, so regression-test the seal peel + `Reveal`/`ScrollText` before merging any GSAP upgrade. `npm run check` won't catch a motion regression (it's runtime), eyeball the animations. |
| **A product Buy CTA / the dealer chooser** (`components/BuyCTA.tsx`, `components/LandingBuyButton.tsx`, `components/FooterBuyLink.tsx`, `components/DealerChooser.tsx`) | **The chooser is the DEFAULT buy behaviour; a single-dealer market short-circuits to a direct dealer link.** ALL customer-facing buy buttons route through a buy primitive (`BuyCTA` for products/nav, `LandingBuyButton` for CMS landing sections, `FooterBuyLink` for the footer) (NEVER a raw `productBuyUrl` / `${CR_BRAND}` / `GlassButton href=` buy link, those aren't market-aware and dead-end international visitors on Carl Ras — `productBuyUrl`/`CR_BRAND` are internal to the buy primitives only). BuyCTA reads the shared `DealerChooserProvider` context (wired once in `app/layout.tsx` from `getLocale()` + `getMarkets()`): on the **international** market (`locale.market === 'int'`) Buy opens the dealer-chooser modal; on a single-dealer market it links to THAT market's dealer via `dealerBuyUrl(currentDealer, code)` (`lib/buy.ts`, the ONE place market→buy-URL lives: DK→Carl Ras product deep-link, DE→Meesenburg, FR→Foussier, BE→Lecot storefront). `currentDealer` is resolved once in `app/layout.tsx` (the current locale's market) and passed to the provider; labels derive ("Buy at <dealer>" / "Where to buy"), never hardcode a dealer name. The chooser lists every dealer from `lib/markets.ts` (`dealerName`/`dealerCtaUrl`/`supportPhone`/`supportHours`), the SAME source as the homepage `WhereToBuy` section, so a new dealer appears in both automatically. Adding a new buy surface = use `BuyCTA`, not a hand-rolled Carl Ras link. |
| **A Sanity schema** (`sanity/schemaTypes/*.ts`) | The page(s) that read it (schema to route map in Tier 2), any custom Studio field component, and re-run the matching seed script if the shape changed. `productAugment` and `store`/`qrCode`/`redirect` have the widest reach. **A brand-new type must also be added to the grouped Studio menu (`sanity/structure.ts`) or it won't appear in the Content pane** (the structure lists types explicitly; it does not auto-include). |
| **Multi-market coherence** (any content that reads Carl Ras / Denmark) | The site is multi-market (international + DK/DE/FR/BE). Buy is already market-first (see the buy CTA row). Other surfaces still carry Denmark/Carl-Ras content that must be localised per market as each launches: footer *about* paragraph (`footerAbout`), `/service`, the guarantee terms + PDF, org structured data, hreflang, `lib/llms-fallback.ts`. (Footer legal line/HQ is now per-market, see that coupling row; footer dealer logos + which show are market-aware too.) (The store finder is now market-scoped in code, see the store-country coupling row; only the DE/FR/BE store *data* is still to be populated.) Per-market content belongs on **Market** documents (`dealerName`/`dealerCtaUrl`/`supportPhone`/`supportHours`/`legalLine`/`legalLinks`) or localised page docs, never hardcoded. The full checklist with severity is in `STROXX-multimarket-audit.md`. |
| **A new external service, API, CDN or embed** | `next.config.mjs`: add the host to CSP (`script-src`/`img-src`/`connect-src`/`frame-src`) AND `images.remotePatterns` if it serves images. Add the env var to `.env.local` AND Vercel. Note it in Tier 2 "External services". |
| **An env var** (add/rename/remove) | Set it in BOTH `.env.local` (local) and the Vercel dashboard (prod), or the feature silently no-ops in one environment. Newsletter/Marketo/chat all fail closed if their key is missing. |
| **A client-facing doc** (`docs/*.md`) | Regenerate the branded `.docx`/`.pdf` via the pandoc pipeline (Tier 2). The `.md` is the source of truth. |
| **Brand facts** (colours, taglines, positioning, store count) | These originate in `INFO/` (brandbook, brand strategy, playbook). If site copy contradicts them, the docs win. See Tier 2 "Brand + strategy source docs". |

---

## Tier 2, the deep reference

### Domain and URLs
One constant, `SITE_URL` in `lib/site.ts`, feeds every canonical, sitemap, robots, and JSON-LD reference. The only place it does NOT reach is the three email templates (`public/emails/*.html`), which use hardcoded absolute URLs because emails can't import from the app. At launch: swap `SITE_URL` once, then find-and-replace the domain in the email HTML. `previewify()` in `components/EmailPreviews.tsx` strips the domain for the hidden `/email-skabeloner` preview.

### Routes and navigation
Adding a public route touches four registries that don't know about each other: the sitemap, the footer, `public/llms.txt`, and the analytics `KNOWN_PATH` list in `app/api/track/route.ts`. Miss the last one and the route's traffic is bucketed as "other" in the dashboard. Internal/hidden routes skip the footer and sitemap but should be `noindex` and added to the Cmd+K command menu so the team can still reach them.

### Product data and categories
`lib/data.ts` is the catalogue seam (production will be CMS/PIM-driven through the same shape). A category slug is referenced in several sibling files that won't error if they drift: `lib/trades.ts`, the `featuredCategorySlugs` and `PARTICLE_*` maps, and specialist `quoteTopic` tags. The rule that catches the most bugs: a specialist quote naming a specific product or category needs `quoteTopic` set, or `specialistForProduct()` can place it on an unrelated product.

### Layout geometry (the fragile visual couplings)
These are pixel/scroll couplings that look fine in isolation and break when combined:

- **Nav to sticky bar:** the scrolled nav is `h-14`; the `/produkter` filter bar is `sticky top-14`. If those numbers diverge, a gap opens under the nav. Same logic for any `scroll-mt-*` anchor offset.
- **Bag hero:** `BagJourney.tsx` imports geometry from `BagFill.tsx`. The bag is `absolute top-0 h-screen z-20`; the hero headline (`app/page.tsx`) sits behind it with `pt-[13-14vh] z-10`. Tune `POSE_Y` and the hero padding together or they overlap. The front-panel PNG (`public/Images/Bag-test/newfront_trythis.png`) must be a clean cut-out (everything but the front wall fully transparent) or a faint ghost rectangle appears. Use ONE drop-shadow, two stacked reads as a doubled silhouette.
- **Product cut-out travel** (`ProductExperience.tsx`, desktop only): a `fixed` product image zig-zags down the gutter and blurs/dims itself while crossing the content zone (backdrop-filter can't blur a GPU-promoted fixed layer, so the layer blurs itself). Any translucent panel it passes behind needs `.glass-panel--frost`. Mobile is a plain inline figure, no travel.
- **`position:fixed` inside a filtered ancestor:** an ancestor with `filter`/`backdrop-filter` becomes the containing block for fixed children. The header gets `backdrop-blur-xl` when scrolled, so a fixed menu rendered *inside* the header collapses to the header box. The mobile menu sheet is therefore a body-level sibling of the header, never a child. Rule: never put `position:fixed` UI inside the header or any filtered/transformed ancestor.

### Internationalisation, routing and the language switcher
The whole locale system hangs off ONE edge-safe registry, `lib/i18n.ts` (`locales[]`, pure TS, no `next/headers` so both middleware and client can import it). Six locales: `en` (reference / x-default, `stroxx.eu`, empty path), `da-DK` (`stroxx.dk`, `/dk`), `de-DE` (`stroxx.de`, `/de`), `fr-FR` (`stroxx.fr`, `/fr`), `nl-BE` (`stroxx.be`, `/be/nl`), `fr-BE` (`stroxx.be` `/fr`, `/be/fr`). Region-qualified IDs (`fr-FR` vs `fr-BE`) keep France and Belgium's French as separate, independent documents.

The couplings, in order of the request lifecycle:
- **`middleware.ts`** calls `resolveLocale(host, pathname)`: domain (ccTLD) first, then sub-path fallback. It strips the locale prefix to an app path, runs the existing CMS + legacy redirects on that app path (re-adding the prefix to destinations), sets the `x-stroxx-locale` request header, and rewrites sub-path URLs. Adding a locale with a new domain or path means the resolver must know it, which it does automatically via `locales[]`, but a genuinely new URL SHAPE (e.g. a third Belgian language) needs the resolver logic checked.
- **`lib/locale.ts`** (`getLocale()`, server-only) reads that header via `next/headers`; `app/layout.tsx` uses it for `<html lang>`. NEVER import `lib/cms.ts` (which calls `getLocale`) from a client component, it would drag `next/headers` into the client bundle.
- **`lib/cms.ts` fetchers are locale-aware:** they query `language == $lang` and fall back to `language == "en"`. A new fetcher for translatable content must follow the same fallback or non-English markets get nothing.
- **The switcher** (`components/LocaleSwitcher.tsx`) mirrors the middleware's link logic (cross-domain on real ccTLDs, sub-path on `.eu`/preview) and renders in two variants: `dropdown` (desktop header) and `inline` (mobile menu pills). Both walk `locales[]`, so a new locale appears in both with no extra work. The two placements in `Nav.tsx` are breakpoint-paired (see the Tier 1 row).
- **hreflang** is DEFERRED until real ccTLD URLs exist at domain cutover; `en` is `x-default`.
- **Sanity side:** `documentInternationalization` (`sanity.config.ts`) lists `supportedLanguages` (from `lib/i18n.ts`) and the i18n'd `schemaTypes`; each carries a hidden read-only `language` field. `productAugment` is i18n'd ON PURPOSE, markets have different assortments. Never click "Remove field" on the `language` warning (it deletes the base-language tag); a stale Studio tab is the usual cause, hard-refresh.

### The glass / CSS system (`app/globals.css`)
`.glass-panel` is the shared base, left untouched. Modifiers layer on top: `.glass-panel--frost` (desktop only, heavier blur to hide busy art behind cards) and `.glass-panel--glow` (blue rim + hover lift). `.glass-cta` sets its transform from `--tx`/`--ty` CSS vars that `GlassButton.tsx` updates on mousemove for the magnetic lean, rewrite the transform without the vars and the lean dies silently. Gotcha: `.glass-cta` forces `display:inline-flex` after the utilities layer, so Tailwind `hidden`/`sm:inline-flex` on the button itself loses the cascade, hide GlassButtons via a wrapper span.

### CMS / Sanity
The Studio (`/studio`) does click-to-edit on top of the live site via Presentation, which is why `X-Frame-Options` must be `SAMEORIGIN`. `sanity/ShareCard.tsx` renders the social preview for both the Share tab and the in-document `SharePreviewField` (reads live form values via `useFormValue`, hooks must stay unconditional). The post schema has a display-only `sharePreview` field whose input is `SharePreviewField`, deleting it kills the in-article preview.

### Campaign application templates are DAM-bound (editable IDML, not repo JPEGs)
The `/brand` "STROXX in the world" section shows JPEG PREVIEWS only (`public/brand/applications/`, rendered from `INFO/Prøv_Det_Kampagne/Layouts/*.pdf`). The real deliverable for dealers is the EDITABLE template so they can localise + print: distribute **IDML** (InDesign's portable, version-safe exchange format), packaged with its linked photos + fonts, NOT raw `.indd` (version-locked) and NOT the flat JPEG. English is the localisation master (DK copy translates cleanly, e.g. "Få råd til andet end værktøj" = "Afford more than just tools"). These editable source files belong in the **DAM** (per the 2026 Brand Plan's DAM-driven activation), not the website repo (they are large print files). The DAM is **Carl Ras's Digizuite** (the SAME DAM the product/shader images already render from, `images.carl-ras.dk`); Clem has a Digizuite login for when we wire it. So: the guide keeps the JPEG preview, and the download should point at the IDML package in Digizuite once it exists (Clem will upload the files). An interim IDML may sit in `public/brand/applications/` "so dealers understand the format", but the permanent home is the DAM. `.indd` sources live under `INFO/Prøv_Det_Kampagne/Layouts/` (A3/A-buk/info posters, facade banners ×11 sizes, entrances ×7, shelf-talkers, matrix banners, kidney table, M65 folder, t-shirts, sleeves).

### Managed /qr codes seed
`scripts/seed-qr.ts` (`npm run seed:qr`) creates the repointable `/qr/<code>` codes, one per support page (`st2`, `xlock`, `cylinders`, `worklight`, `ppe`, `keybox`, `tools`), idempotent via `qr-<code>` ids. These are PROVISIONAL proposals, the `code` is a print contract, so confirm with packaging before print and never rename a printed code (repoint `target` instead). Legacy in-circulation codes are NOT seeded here, they resolve via middleware (`docs/STROXX-legacy-redirects.csv` + `/pages/<slug>` → `/support/<slug>`).

### QR and support (the print contract)
Physical packaging is the hard constraint here. Printed QRs hit `/pages/<slug>`, middleware 301s them to `/support/<slug>`, so a support slug is effectively immutable once printed (repoint via a CMS redirect if forced). `qrCode` codes: never rename a printed code, repoint its `target`. `/qr/[code]` is deliberately a 302 (a 301 would let scanners cache a stale target). `dayStats` has a `qr` map keyed by code with `-` to `_`. Middleware order matters: CMS `redirect` docs are evaluated first, then legacy rules, so an editor redirect can override a legacy one.

### Security / config
Security headers live in `next.config.mjs` `headers()`: nosniff, `X-Frame-Options SAMEORIGIN`, Referrer-Policy, Permissions-Policy, HSTS. A full CSP is deferred on purpose (GTM + Cookiebot inject scripts and need an allow-list pass). Rate limiting uses Upstash Redis.

### Brand and strategy source docs (`INFO/` and `docs/`)
When site copy and a brand doc disagree, the doc wins. The authoritative sources:

- **`INFO/Brand Information/`** — the brandbook (`STROXX_Brandbook_2024`), historik, analysis decks. The visual + verbal identity of record.
- **`INFO/Brand Strategy/`** — brand strategy versions (currently up to `V5.1`), messaging, taglines, "Got It. Got You." positioning.
- **`INFO/Playbook - communication/`** — the current playbook (`STROXX_Playbook_July25_BOARDvs1`), budget/MoSCoW model.
- **`INFO/New logo (NO Proud Pro)/`** — the current logo in every format (AI/EPS/SVG/PNG/WebP/JPG/PDF). The "no Proud Pro" version is the live one.
- **`INFO/Brand assets (logo + font)/`** — logo + font of record. Web uses the system Helvetica Neue stack (no external license) to match.
- **`INFO/Danmark2026/`** — the DK 2026 launch, "Prøv Det" / "Try It" campaign, Carl Ras materials, `stroxx_site_document.pdf`.
- **`INFO/Stroxx Product Categories/`** — sourcing analysis + category HTML that back `lib/data.ts`.
- **`docs/`** — the working project docs (domain takeover, security review, CMS/editor guides, i18n, PIM/DAM, plans). These are living `.md` files.

If a change alters a brand fact that these docs assert (colour, tagline, store count, positioning), flag it, the docs are the reference and may need updating too, not just the site.

### Client-doc pipeline
Client-facing docs are generated, not hand-formatted: `pandoc <doc>.md --reference-doc=docs/STROXX-editor-guide.docx -o "docs/client-docs/<Name (for Recipient)>.docx"` inherits the branded styles; PDFs come from `soffice` on the docx. The recipient belongs in the filename. The `.md` stays the source of truth, regenerate after every edit.

### Studio Help assistant (editor how-to chatbot)
A "Help" tab in the Studio (`sanity/HelpTool.tsx`, chat UI) posts to `app/api/help/route.ts`, which answers editor how-to questions grounded ONLY in `lib/help-knowledge.ts` (the maintainable knowledge base) using the Anthropic model (`claude-haiku-4-5`, reuses `ANTHROPIC_API_KEY`; same-origin + rate-limited; degrades gracefully with no key). COUPLING: `lib/help-knowledge.ts` is the assistant's ONLY source of truth, keep it CURRENT when CMS behaviour changes (field names, where things live, new sections) or the bot gives stale answers. Registered in `sanity.config.ts` `tools()`. No CSP change (Studio calls same-origin `/api/help`; the route calls `api.anthropic.com` server-side). Distinct from the site's specialist chat (`/api/chat`) and Article AI (`/api/blog-agent`).

### Studio document actions (See page, Edit site, auto-redirect)
Per-document actions are wired in `sanity.config.ts` `document.actions`, backed by `sanity/SeePageAction.tsx` (See page → new tab; Open in Edit site → Presentation) and `sanity/slugRedirectAction.tsx` (auto-301). All three resolve a document's public URL through ONE helper, `sanity/lib/docPageUrl.ts` `primaryHref(type, doc)`. COUPLINGS:
- `primaryHref` MIRRORS the primary location in the Presentation `resolve.locations` map (same file, `sanity.config.ts`). If you add a page type or change a slug pattern (e.g. `/kampagne/<slug>`), update BOTH the resolver and `primaryHref`, or the actions point somewhere the visual editor doesn't.
- **Auto-redirect on slug change:** wrapping the Publish action for `REDIRECTABLE` types (`post`, `landingPage`, `supportPage`, `trade`, `legalPage`). On publish, if the slug changed it creates a `redirect` doc (old path → new path, `permanent: true`), with a loop guard (renaming back) and chain repointing. The redirect doc shape MUST match `sanity/schemaTypes/redirect.ts` and is consumed by `middleware.ts` (CMS redirects run before legacy rules). Adding a redirectable type = add it to `REDIRECTABLE` AND give it a `primaryHref` case. Note: support-page renames still rely on the legacy `/pages/<slug>` → `/support/<slug>` hop, so a renamed support slug resolves in two hops (legacy then the new redirect), fine, but never rename a printed code's target blindly.
- Redirect creation is best-effort (never blocks publish) and uses the editor's own Studio credentials via `useClient`.

### SKU pickers (searchable product inputs) and the catalogue
Every SKU field in the Studio uses a searchable product picker instead of free text: `SkuInput` (single-SKU string fields) and `SkuListInput` (array-of-SKU fields, with reorder), both feeding off `SkuSearch` and the shared option list `sanity/lib/skuOptions.ts`. That module derives its options from the code-side catalogue (`lib/data.ts` `products`, needs `code` + `name` + `category`). COUPLINGS: (a) `sanity/lib/skuOptions.ts` imports `lib/data.ts`, which must stay client-safe (no `server-only`, no node APIs) or the Studio bundle breaks, when the PIM feed lands, swap ONLY this module to read the feed and every picker updates. (b) The pickers store plain item numbers and are wired via `components: { input: ... }` on: `monthlyLineup.heroSku` / `news[].sku` / `cashCowSkus`, `post.productSlider.skus` / `relatedSkus`, `landingPage.productProof.skus`, `collections` testimonial `productCode`, `productAugment.sku`. Adding a new SKU field means wiring the same component. (c) Studio inputs here use plain elements + inline styles ON PURPOSE (no `@sanity/ui` in this project, it is not an installed dep), match `EncryptedSecretField` if you add another.

### Film picker (reference + create-on-paste) and the render join
The landing-page film section (`videoProof` block) has a `films` field: an array of references to `video` docs, edited with `sanity/FilmPicker.tsx`. The picker searches the existing Film collection AND, on pasting a YouTube URL not yet in the collection, CREATES a `video` doc (via `useClient`) and links it, so films stay documents and are reusable everywhere. THREE things must agree or the section renders wrong:
1. The field is references `to: [{ type: 'video' }]`; changing the target type means changing `FilmPicker` and the render.
2. `getLandingPage` (`lib/cms.ts`) dereferences the picked films in its query (`_type == "videoProof" => { "films": films[]->{ _id, youtubeId, title, by } }`). Without this projection the renderer gets raw refs and shows nothing.
3. `components/cms/LandingSections.tsx` `videoProof` case maps the dereferenced films to `Video[]` and falls back to all-active (`getVideos()`) when empty.
Films created from a URL are `active: true`, so they also appear in any other section still using the all-active fallback. Title + channel are auto-filled from YouTube via `app/api/film-meta/route.ts` (server-side oEmbed lookup; oEmbed sends no CORS headers so it can't be called from the browser, hence the route, same-origin + rate-limited, blanks on failure). No CSP change needed (the picker calls our same-origin route; the route calls YouTube server-side).

**The film picker is used in three places, each with the same field → query-deref → renderer pattern:**
1. Landing film section (`videoProof` block): `getLandingPage` deref, `LandingSections` videoProof case.
2. Månedens (`monthlyLineup.films`): `getSka` deref + maps to `SkaData.films` (added to `lib/ska.ts` SKA fallback as `films: [] as Video[]`), rendered in `app/maanedens/page.tsx` (`SKA.films.length ? SKA.films : getVideos()`).
3. Homepage featured film (`homePage.films` + `showFilm`/`filmEyebrow`/`filmHeadline`): `getHomePage` deref (sets `merged.films`), rendered in `app/page.tsx` after Specialists, before Guarantee, gated on `hp.showFilm` (default OFF in `HOME_DEFAULTS`). NOTE `lib/home-copy.ts` must stay import-free (seed script constraint), so `films` is typed `unknown[]` there and cast in the page. The section is toggleable like every other homepage section (the `show*` booleans).

Applying the picker to a new placement = add a `films` reference field + dereference it in that page's query + map it in the renderer (+ a `show*` toggle if it's a homepage-style optional section).

### Månedens STROXX is date-driven
`getSka()` (`lib/cms.ts`) selects the latest `monthlyLineup` whose `activeFrom` date has passed: `... && (!defined(activeFrom) || activeFrom <= $today)] | order(activeFrom desc, _createdAt desc)[0]`. So the live month is decided by the `activeFrom` field, NOT creation order (lineups without a date fall back to newest-created). Editors stage next month ahead by setting a future `activeFrom`. Changing this query or removing `activeFrom` reverts to "newest created wins". Still pairs with `lib/ska.ts` as the hardcoded fallback when no lineup matches or SKUs don't resolve.

### The Sanity Studio (`/studio`), schema to page map
The Studio is embedded in the app (`app/studio/[[...tool]]/page.tsx`), so its config, schemas and custom tools all live in-repo under `sanity/` and ship with every deploy. The **Content** pane uses a custom grouped structure (`sanity/structure.ts`, wired via `structureTool({ title: 'Content', structure })`): doc types are organised into ordered, labelled folders (Pages / Support & QR codes / Products / News / Social proof & media / Stores / a divider / Settings / System) for human legibility, not a flat A-Z list. It lists types EXPLICITLY, so a new schema type is invisible in the menu until added here, put it in the group it belongs to. Changing a schema ripples to whatever renders it:

| Schema (`sanity/schemaTypes/`) | Rendered by / drives |
|---|---|
| `homePage` | `app/page.tsx` (home section blocks) |
| ~~`brandPage`~~ | REMOVED Jul 7, `/brand` is now fully code-owned (`app/brand/page.tsx`), no CMS doc. Assets under `public/brand/`: `logos/` (Black/White × SVG/PNG/WebP/PDF/EPS/AI), `motion/` (SMIL SVGs `stroxx-logo-reveal.svg` + `stroxx-logo-loop.svg`, particle embed `stroxx-particle-logo.html`, ffmpeg film `stroxx-logo.mp4`+`.gif`), `fonts/HelveticaNeue.zip`, `stroxx-type.css`, `gallery/`, `applications/` (campaign-in-the-world previews rendered from `INFO/Prøv_Det_Kampagne/Layouts` PDFs via ghostscript). Campaign photography reuses `public/Images/campaign/{tea,glasses,rings}.jpg`. Page data = plain arrays (`GALLERY`, `CAMPAIGN`, `APPLICATIONS`, `LOGO_SETS`), extend by dropping a file + adding a row. Photo grids use `components/PhotoGallery.tsx` (client lightbox). **Asset freshness (SOLVED):** `next.config.mjs` serves `/brand/{motion,applications,gallery}/*` with `Cache-Control: max-age=0, must-revalidate`, so re-exported SVGs/films/photos always show on next load, no cache-bust query needed. `LogoMotion.tsx` keeps only `?r=k` (restarts the SMIL animation on Replay, not a cache-buster). If you add a new brand-asset folder you iterate on, add it to that headers rule too.** Motion SVGs animate as `<img>` via SMIL. `components/BrandMarks.tsx` is an unused orphan. **Brand photography is ALWAYS black & white.** |
| `landingPage` | `/proev-det`, `/maanedens` (CMS section blocks) |
| `monthlyLineup` | Månedens STROXX, pairs with `lib/ska.ts` |
| `post` | `/nyheder`, `/nyheder/[slug]`; carries the share-preview field |
| `productAugment` | overlays `lib/data.ts` product data (the PIM seam), touches every product surface |
| `trade` | `/fag`, `/fag/[slug]` |
| `store` | `/butikker` store finder (each store carries its own optional STROXX Specialist); country-scoped, see the store-scoping coupling below. `brand` spans Carl Ras/3Aktive (DK) + Meesenburg/Foussier/Lecot (DE/FR/BE). Dealer stores abroad have no named `manager`; they use the store-level `storePhone`/`storeEmail` contact instead, and `monThu`/`fri` hours are optional (hidden when unknown). |
| `supportPage` | `/support/[slug]` (slug is the print contract) |
| `qrCode` | `/qr/[code]`, dashboard scan stats (never rename a printed code) |
| `redirect` | middleware (evaluated before legacy rules) |
| `collections` | product groupings |
| `feedback` | `/test` bug reports land here |
| `siteSettings` | global site config, referenced app-wide. Header-logo override: `siteSettings.logo` (image) → `SiteSettings.logo` → `layout.tsx` `assetUrl(settings.logo)` → `Nav` `logoSrc` prop → falls back to `brandImages.logoWhite` (`/brand/logo-white.svg`) when empty. Guidelines live in the field description (white version, SVG/PNG transparent, ~28px tall, ~5:1). |

The Studio SEO preview (`SeoPreviewField`) resolves a root-relative og-image path (e.g. `/brand/og.jpg`) against the CURRENT origin (localhost in dev, real domain in prod), NOT `SITE_URL`. Reason: while `SITE_URL` is the placeholder Vercel domain, prefixing it made the preview image 404 (broken-image icon). The shared-card URL label still shows `SITE_URL` on purpose (that's the canonical shared link). Local Studio "network error" console noise is almost always the embedded Studio's Sanity connection, add `http://localhost:3000` to the Sanity project CORS origins (sanity.io/manage), it is not our newsletter-status probe (that swallows its own errors).

### OG / social share image resolution (preview MUST mirror the live page)
Every page type resolves its share image through a fallback chain, and there are TWO places that must agree: the live route's `generateMetadata` (what actually gets shared) and the Studio preview component (what the editor sees). If they drift, the preview lies. The chains:

| Page type | Live route | Studio preview | Fallback chain |
|---|---|---|---|
| **Site settings** (global default) | `app/layout.tsx` metadata | `SeoPreviewField` | `ogImage` string path only (resolved against origin in preview) |
| **Article** (`/nyheder/[slug]`) | `app/nyheder/[slug]/page.tsx` | `SharePreviewField` | `ogImage` (upload) → `heroImage` (upload) |

(Aside, unrelated to OG.) **Test feedback screenshots** (`/test` → `/api/feedback` → `feedback` schema): the form downscales images in the browser (max edge 1600, WebP), sends `images[]` (up to 4); the API uploads each and stores `screenshots[]` PLUS `screenshot` (first, for the Studio list thumbnail + older reports). Change the count in three places together: `MAX_IMAGES` in `FeedbackForm.tsx` and `app/api/feedback/route.ts`. IT-facing env setup doc lives in the handover pack: `Client Handover - Carl Ras/01 - IT/Overview - stack, security, costs/STROXX Environment Variables (IT setup)` (md/docx/pdf, gitignored like the rest of the pack).
| **Landing page** (`/kampagne/...`, `/proev-det`) | `app/kampagne/[...slug]/page.tsx` | `SeoPreviewField` | `ogImage` (upload) → first `photoHero` section `imageUpload` → its `image` `/public` path |

Field names differ by type: articles have a top-level `heroImage`; landing pages have NO top-level hero, the hero lives inside `sections[]` as a `photoHero` block (`imageUpload` upload, `image` path, defaulting to `/Images/campaign/rings.jpg`). RULE: if you change a share-image fallback, change BOTH the route and the matching preview component in the same commit, or the "Shared link" card in the Studio will disagree with the real share. (`SeoPreviewField` is shared by site settings AND landing pages, so it reads `sections` defensively, undefined on site settings is fine.)

Custom Studio tools/fields (also in `sanity/`) have their own couplings: `DashboardTool` (analytics), `BrandTool`/`GuideTool`/`WelcomeTool` (embedded internal pages), `ArticleAgentTool` (`/api/blog-agent`), `EncryptedSecretField` (browser-side RSA, pairs with `NEXT_PUBLIC_NEWSLETTER_PUBKEY` + `NEWSLETTER_SECRET_KEY`), `QrImageField` (`/api/qr-image/[code]`), `ShareCard`/`SharePreviewField`/`SeoPreviewField`/`NewsletterStatusField` (live-preview components, unconditional hooks). Content lives in the `demo` dataset (see backup script). After a schema shape change, re-run the relevant `npm run seed*` script so seeded content still matches.

### External services and env vars (the third-party map)
Every service the site depends on, the env var(s) it hangs off, what it does, and the coupling if it changes. Env vars must be set in BOTH `.env.local` and Vercel. Any new host must also be added to the CSP in `next.config.mjs`. Full launch-facing env reference (required vs optional, what breaks if missing, current status): `docs/STROXX-env-vars.md`.

| Service | Env / config | Role | If it changes / breaks |
|---|---|---|---|
| **Vercel** | GitHub-connected; `VERCEL` env auto-set | Hosting + build + deploy | Every push builds (`npm run build` = types + lint gate). "Ready" can still mask a real failure, verify locally. Env vars set here, not in the repo. |
| **Sanity** | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (`demo`), `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN` | CMS: all editable content + the Studio | Public site falls back to built-in data without these; Studio draft preview + writes need them. CSP already allows `*.api.sanity.io`, `wss://*.api.sanity.io`, `cdn.sanity.io`. |
| **Upstash Redis** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting (`lib/rate-limit.ts`) | Missing = limiter degrades. Used by chat/form/newsletter/feedback API routes. |
| **Anthropic API** | `ANTHROPIC_API_KEY` | Specialist chat (`/api/chat`, `claude-haiku-4-5`) | Missing = chat can't reach the model. `api.anthropic.com` is server-side (not in CSP, which is browser-scoped). |
| **Newsletter (self-serve crypto)** | `NEXT_PUBLIC_NEWSLETTER_PUBKEY`, `NEWSLETTER_SECRET_KEY`, `NEWSLETTER_WEBHOOK_URL` | Browser RSA-encrypts keys, server decrypts (`lib/newsletter-secrets.ts`) | Pubkey/secret are a matched pair, rotate together or decryption fails. |
| **Marketo** | `MARKETO_BASE_URL`, `MARKETO_CLIENT_ID`, `MARKETO_CLIENT_SECRET` | Lead/newsletter delivery target | Fails closed if any of the three is missing. |
| **Mailchimp / Klaviyo** | `MAILCHIMP_API_KEY`, `KLAVIYO_API_KEY` | Alternate email/marketing integrations | Optional providers, feature-gated on key presence. |
| **Form webhook** | `FORM_WEBHOOK_URL` | Generic form submissions (`/api/form`) | Missing = submissions have nowhere to go. |
| **Google Tag Manager + GA** | `GTM-XXXX` placeholder (swap at launch) | Analytics/tag loading | Injects scripts, which is why a full CSP is deferred. CSP allows `googletagmanager.com`, `*.google-analytics.com`. |
| **Cookiebot** | consent script | Cookie consent gate | CSP allows `consent.cookiebot.com`, `consentcdn.cookiebot.com`. Consent gates GTM/GA. |
| **Carl Ras CDN** | `images.carl-ras.dk`, `assets.carl-ras.dk` | Real product photos (proxied + knocked out via `/api/tool/[id]`) | In `remotePatterns` AND CSP `img-src`. The proxy adds a Referer the CDN needs. This is the product-image source of record until PIM/DAM. |
| **Webflow CDN** | `cdn.prod.website-files.com` | Legacy asset host | In `remotePatterns` + CSP. From the old site; retire as assets migrate. |
| **DAWA / Dataforsyningen** | `api.dataforsyningen.dk` | Danish address autocomplete (store finder) | CSP `connect-src`. DK-specific; other markets need their own provider. |
| **Carto basemaps** | `*.basemaps.cartocdn.com` | Leaflet map tiles (`/butikker`) | CSP `img-src`. Tiles load AFTER globals, map bg needs `!important` to stay dark before they arrive. |
| **YouTube / Vimeo** | `youtube-nocookie.com`, `player.vimeo.com`, `i.ytimg.com` | Video embeds + poster images | CSP `frame-src` + `img-src`. |
| **GitHub Actions** | `.github/workflows/ci.yml`, `backup.yml` | CI gate + weekly Sanity dataset backup (`npm run backup`) | Backup exports the `demo` dataset; changing the dataset name means updating the backup script + workflow. |

### Documentation, guides and memory (the index)
Where knowledge about this project lives, so we update the right place, not just the code. When a change contradicts one of these, update the doc too.

**Root docs**
- `README.md` — overview, stack, routes, run/deploy. Links here.
- `DEPENDENCIES.md` — this file, the coupling map.
- `MOTION.md` — motion/animation conventions (GSAP, Lenis, reduced-motion rules).
- `CMS-anbefaling.md` — the CMS recommendation writeup.

**`docs/` (working project docs, `.md` is source of truth)**
- Plans + status: `STROXX-production-plan.md`, `STROXX-realistic-plan.md`, `STROXX-status-and-next.md`, `STROXX-project-plan.html`.
- Launch + infra: `STROXX-domain-takeover.md`, `STROXX-country-onboarding.md`, `I18N-STRATEGY.md`, `STROXX-production-and-multimarket-overview.md`.
- Security: `SECURITY-REVIEW.md`, `STROXX-tech-stack-security.md`.
- CMS + editing: `STROXX-sanity-guide.md`, `STROXX-editor-guide.md` (+ `.docx`, the pandoc reference doc).
- Systems: `STROXX-support-qr-workflow.md`, `STROXX-pim-dam-integration.md`, `STROXX-feature-backlog.md`, `STROXX-engagement-plan.md`.
- Legacy migration: `STROXX-legacy-files-manifest.md`, `STROXX-legacy-redirects.csv`, `legacy-pdfs/`.
- Client + email: `client-docs/` (generated per recipient), `email-copydocs/`.
- Demo: `STROXX-demo-cheatsheet.md`.

**In-app guides (for the content team, live pages)**
- `/guide` — editor guide, `/komponenter` — gallery of every CMS section block. Both should track schema changes.

**`INFO/` (client-supplied brand source, see "Brand + strategy source docs" above)** — brandbook, brand strategy versions, playbook, logo pack, DK 2026 campaign, product-category sourcing.

**Claude's memory (persists across sessions, not in the repo)** — the internal coupling map mirrors this file, plus notes on brand tokens, guarantee terms, copywriting principles, deploy-check habits, the WEB-STARTER template, and project posture. This `DEPENDENCIES.md` is the canonical, Clem-facing version; the memory is Claude's working copy and is kept in sync with it.

### Build / deploy gotchas
- `npm run check` (tsc + eslint) is the push gate. Vercel "Ready" does NOT mean local-green; a passing Vercel build has silently masked failures before, verify locally.
- The sandbox can commit to the mounted repo but cannot push (no credentials); Clem pushes from the Mac. `npm install --package-lock-only` works in the sandbox.
- No em or en dashes anywhere in copy or docs (project rule): use commas or "to" for ranges.

---

## Maintenance

Claude owns keeping this current. The trigger: any time a change creates, removes, or moves a dependency, the matching row/section here is updated in the same commit, and the change is mirrored to Claude's internal coupling-map memory so it survives across sessions. When in doubt, over-document: a stale row is cheaper than a silent break.
