# STROXX — brand experience (demo)

> **Dyrt værktøj til udyr pris.** A modern, experiential brand site for STROXX — the value-tier
> professional tool brand from Carl Ras. The site introduces, convinces and **routes to the local
> partner** (Carl Ras in DK) for the actual purchase. No cart lives here.

This is the **v1 demo**: a WebGL hero experience, a filterable product explorer, and one richly-built
Focus Product page. Built to scale toward the full multi-market brand hub described in the strategy.

---

## What's in it

| Route | What it is |
|---|---|
| `/` | Scroll experience. A **physics tool-bag** (Three.js + Rapier) shuffles real Carl-Ras tools as you scroll, with dust, depth-of-field and brand ambience. Below it: range, focus product, category storytelling, specialists, EU footprint, campaign band. |
| `/produkter` | **Product explorer** — filter by category, search, sort. Every "buy" deep-links to Carl Ras with the live UTM convention. |
| `/produkt/[slug]` | **Focus Product page** — the heavy page type: hero, price-honest tagline, why-STROXX + specialist quote, in-use, spec table, Pro Club signup, related products, *Køb hos Carl Ras*. |
| `/api/tool/[id]` | Image proxy. Pulls a real product photo from the Carl-Ras CDN, **knocks out the white background** with `sharp`, serves it CORS-safe for the WebGL textures. |

### Stack
Next.js 14 (App Router, TS) · Tailwind · react-three-fiber · @react-three/rapier · drei ·
@react-three/postprocessing · Lenis smooth-scroll · sharp.

### Brand tokens (pulled from stroxx.dk)
Ink `#0A0A0B` · signature red `#E30613` · CTA blue `#0089CC` · paper `#F6F5F3` · fog `#7D8387`.
Display type is a tight grotesk (Archivo, standing in for the brand's Helvetica-Neue-LT-Pro); body Inter (for Neo Sans).

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start
```

> Real product names, prices and imagery are pulled live from `carl-ras.dk` at request time, so the
> dev machine needs internet. Nothing is committed from Carl Ras.

---

## Push to Git + deploy on Vercel

```bash
git init
git add .
git commit -m "STROXX brand experience — v1 demo"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

On **vercel.com → New Project → Import** the repo. No env vars needed for the demo. Vercel
auto-detects Next.js; `sharp` is supported on the Node runtime out of the box. Each push gets a
preview URL.

---

## Where this goes next (per the strategy docs)

- **Supabase backend** — move the product catalogue, hero/variation model, badges and Focus-Product
  content into Supabase (or sync from the Carl Ras PIM). The current `lib/data.ts` is the seam: swap
  the static arrays for Supabase queries and nothing else changes. The Supabase connector is already
  available in this workspace.
- **Pro Club / Marketo** — the signup module (`components/ProClubSignup.tsx`) is a stub; wire it to a
  Marketo Engage form per the digital-strategy doc.
- **CMS / multi-market** — the data model (categories, multi-tag taxonomy, focus products) mirrors the
  Webflow CMS plan, ready for hreflang locale variants (DK → DE → FR → BE).
- **3D fidelity** — phase 2 can replace the photo-cutout tools with fully modeled GLTF hero tools.

## Project layout
```
app/            routes (home, produkter, produkt/[slug], api/tool)
components/      Nav, Footer, HeroStage, ProductExplorer, ProductCard, ProClubSignup, Reveal, SmoothScroll
components/scene ToolBagScene — the r3f physics canvas
lib/data.ts     categories, real products, brand tokens, image helpers
docs/           the two strategy Word docs
```
