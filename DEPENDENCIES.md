# DEPENDENCIES, what breaks what

> **The "if I change X, also update Y and Z" map for the whole STROXX project.**
> Purpose: stop us shipping half a change. Before you (or Claude) touch anything in the list below,
> check the coupled items in the same row so nothing silently breaks: a page, a design token, a brand
> doc, a printed QR code, an email template.

**How to use this file**

1. **Tier 1 (Quick checklist)** is for fast lookups. Find the thing you're changing in the left column, do everything in the right column.
2. **Tier 2 (Deep reference)** explains the *why* behind the trickier couplings (layout geometry, the CMS, the QR print contract, brand docs).
3. This file is the canonical list. Claude keeps it current: whenever we make a change that creates or touches a dependency, it updates this file in the **same** push. If you spot a coupling that's missing, add a row and it'll be folded in.

Last reviewed: 2026-07-07.

---

## Tier 1, the quick checklist

| If you change... | Also update / check... |
|---|---|
| **The live domain** (currently the Vercel placeholder, later `stroxx.eu`) | It lives in ONE place: `lib/site.ts` (`SITE_URL`). Swap there and it flows to `app/layout.tsx` (metadataBase, JSON-LD), `app/robots.ts`, `app/sitemap.ts`, `app/fag` + `[slug]`, `app/produkt/[slug]`, `EmailPreviews.tsx`. The 3 email templates in `public/emails/*.html` use hardcoded absolute URLs, fix those by hand at launch. |
| **Nav height** (`components/Nav.tsx`, `h-20` / `h-14` scrolled) | Sticky filter bar offset in `components/ProductExplorer.tsx` (`sticky top-14` must equal the SCROLLED nav height). Any other `sticky top-*` bar and `scroll-mt-*` anchor offset. |
| **Add a public route** (new page) | `app/sitemap.ts` (add it), `components/Footer.tsx` (nav links), `public/llms.txt` (page directory), and `KNOWN_PATH` in `app/api/track/route.ts` (else analytics logs it as "other"). Hidden/internal route instead? Add `robots: noindex` + a Cmd+K entry in `components/CommandMenu.tsx`. |
| **Add / rename a product category slug** (`lib/data.ts`) | `lib/trades.ts` (trade to category mappings), `featuredCategorySlugs` + `PARTICLE_*` maps in `lib/data.ts`, `app/sitemap.ts` (auto-includes, verify), any specialist `quoteTopic` tag naming it. |
| **A specialist quote** (`lib/data.ts` `specialists[]`) | A quote that names a product/category MUST carry `quoteTopic: <categorySlug>` or it can surface on an unrelated product. Untagged = generic = safe anywhere. |
| **A testimonial** (`lib/testimonials.ts`) | If `productCode` is set, the matching product page emits Review/AggregateRating schema. Keep `productCode` valid against `lib/data.ts`; `trades` controls which `/fag` pages show it. |
| **Månedens STROXX / the featured month** (`lib/ska.ts`) | The månedens email template, `/maanedens` page (auto), homepage `#maanedens` section (hero name auto from `SKA.hero`). Product codes are looked up via `products.find`, so an unknown code throws. Never say "DB2" in customer copy. |
| **Brand colours / tokens** | `tailwind.config.ts` (`stroxx.*`), `app/globals.css`, README "Brand tokens", and this file's Tier 2. Blue `#0088C2` is the only sanctioned accent; red `#EB0029` is extended-palette only. |
| **The bag hero geometry** | `components/BagJourney.tsx` and `components/BagFill.tsx` share constants (TOOLS, BAG_AR, panels). Change one dimension, recheck both, plus the hero headline padding in `app/page.tsx` (they overlap). |
| **A translucent panel behind the product cut-out** (`/produkt/[slug]`) | Any glass panel the travelling cut-out passes behind needs `.glass-panel--frost` or the product bleeds through. See Tier 2 "Layout geometry". |
| **A support page slug** (`/support/[slug]`) | The slug is a PRINT contract: packaging QRs hit `/pages/<slug>`. Renaming breaks printed codes, add a CMS redirect if forced. Never rename a printed `qrCode` code, repoint its `target` instead. |
| **Security headers / CSP** (`next.config.mjs`) | `X-Frame-Options` must stay `SAMEORIGIN` (not DENY), Sanity Presentation iframes the site at `/studio`. |
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

### The glass / CSS system (`app/globals.css`)
`.glass-panel` is the shared base, left untouched. Modifiers layer on top: `.glass-panel--frost` (desktop only, heavier blur to hide busy art behind cards) and `.glass-panel--glow` (blue rim + hover lift). `.glass-cta` sets its transform from `--tx`/`--ty` CSS vars that `GlassButton.tsx` updates on mousemove for the magnetic lean, rewrite the transform without the vars and the lean dies silently. Gotcha: `.glass-cta` forces `display:inline-flex` after the utilities layer, so Tailwind `hidden`/`sm:inline-flex` on the button itself loses the cascade, hide GlassButtons via a wrapper span.

### CMS / Sanity
The Studio (`/studio`) does click-to-edit on top of the live site via Presentation, which is why `X-Frame-Options` must be `SAMEORIGIN`. `sanity/ShareCard.tsx` renders the social preview for both the Share tab and the in-document `SharePreviewField` (reads live form values via `useFormValue`, hooks must stay unconditional). The post schema has a display-only `sharePreview` field whose input is `SharePreviewField`, deleting it kills the in-article preview.

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

### Build / deploy gotchas
- `npm run check` (tsc + eslint) is the push gate. Vercel "Ready" does NOT mean local-green; a passing Vercel build has silently masked failures before, verify locally.
- The sandbox can commit to the mounted repo but cannot push (no credentials); Clem pushes from the Mac. `npm install --package-lock-only` works in the sandbox.
- No em or en dashes anywhere in copy or docs (project rule): use commas or "to" for ranges.

---

## Maintenance

Claude owns keeping this current. The trigger: any time a change creates, removes, or moves a dependency, the matching row/section here is updated in the same commit, and the change is mirrored to Claude's internal coupling-map memory so it survives across sessions. When in doubt, over-document: a stale row is cheaper than a silent break.
