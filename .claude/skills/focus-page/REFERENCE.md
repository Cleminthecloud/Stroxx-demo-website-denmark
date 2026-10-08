# Focus on… (Fokus på…): how it works

Built 8 October 2026. Successor of the Webflow `/fokus-paa` pages on stroxx-dk.webflow.io (which are untouched and keep running).

## What it is

- **One page per focus product** at `/focus-on/<slug>`, built from section blocks in the Studio, exactly like a campaign page. Danish at `/dk/focus-on/<slug>` (or `stroxx.dk/focus-on/<slug>` once the domain points here), English base at `/focus-on/<slug>`. Slugs are English and the same in every language.
- **The overview** at `/focus-on`: every focus page as a card, newest month first, with a "Current" badge on the newest month that has started and "Coming" on later months. Filters: Category (shown from two categories), Topic (shown from six pages), Year (shown from two years). Filter state is in the address (`/focus-on?category=lighting`), so a filtered view can be shared. All cards are in the HTML for search engines; the filter only hides cards.
- **"More focus products"**: added automatically at the bottom of every focus page (newest seven, never the current page). Unlike Webflow, nothing to copy per page.
- **Menu**: the code default menu says "Focus on…" → `/focus-on`. The live menu comes from Site settings in the CMS; `node scripts/seed-focus.mjs --env .env.local --nav` changes "Tool of the Month" to "Focus on…" there. Run it only after the code is live.
- **The Monthly lineup** (`/monthly`, the five DB2 winners) is untouched and still reachable; it is no longer in the default menu.

## In the Studio

Pages → **Focus on… (focus product pages)**:

- **Focus pages, newest first**: each page has three tabs. *Card + filters* (name, slug, focus month, teaser, category, topics, card photo, cut-out, item numbers), *Page sections* (the blocks), *SEO + sharing*.
- **Categories (overview filters)**: one per language, sharing an English *filter key* (`lighting` is Belysning in Danish and Lighting in English).

Translations use the globe menu like every other page. Changing a published slug creates a redirect automatically.

## The blocks

All blocks work on focus pages AND campaign pages. Live samples at `/components`.

| Block (Studio name) | Use it for |
|---|---|
| Hero: full-screen photo or video | Now takes an uploaded film file, square and portrait cuts for tablet/phone, an AI-disclosure line and a scroll cue; with no headline it is a film-only opener |
| Image + text, side by side | Now with "keep in colour" (product shots), "show the whole product" and a product item number for the button |
| Text: headline + paragraph (+ button) | The quiet block between louder ones; also the guarantee teaser |
| Numbered points with photo (tabs) | Three selling points, photo follows the selected point |
| Hotspot image | Now with a frame shape (wide, square, portrait) and an optional visible list of the points |
| Film (self-hosted, plays in view) | Our own mp4, no YouTube cookie wall; caption and AI/real-footage footnote |
| Comparison table | 2 to 4 options, `+` tick, `-` cross, one highlighted column, notes under it |
| Two-way comparison tiles | Finger versus palm style A/B tiles |
| Specifications (big numbers) | Hard facts; whole numbers count up |
| Variant / fact cards | Lengths, "in the box", "power and running"; each card can link |
| Slider advisor | Value → recommendation (door thickness → spindle), rule edited as steps |
| Safety notice | The one rule people must follow, framed in red |
| Step-by-step list | Installation and set-up |
| Photo mosaic | 2, 1, 2 photo layout with a disclosure line |
| Product cards with links (manual) | Related products with your own words, plus an optional "new" second group |
| Explainer | Lux levels, Kelvin strip, two notes, a read-more button |
| People to call | Specialists with photo, store, bio, tap-to-call/mail |
| Call-to-action banner | Now with a small-print line and link (availability) |

## Rules built into the code

- **Buy contract** (`lib/buy.ts`): a product link with an *item number* goes to the visitor's own dealer, the dealer chooser on the international site. A hard `carl-ras.dk` link is only ever shown to Danish visitors; elsewhere it is replaced by the visitor's dealer or the chooser (`lib/focus.ts isForeignDealerUrl`, unit-tested).
- **No prices**: nothing in the blocks shows a price, and the AI writer rejects any text that looks like one.
- **Links from the CMS**: only `https:`, `mailto:`, `tel:` and `/paths` are rendered (`safeHref`); internal paths keep the visitor's locale prefix (`/dk/...`).
- **Accessibility**: one `h1` per page (a text-less film hero gets a screen-reader-only one), the tabs are a real ARIA tablist with arrow keys, the slider is a labelled range input with a live result, filter buttons expose `aria-pressed`, films have controls and respect reduced motion.

## The AI page builder (Claude Cowork or Claude Code)

Give Claude the Word brief, the PDF data sheet, product links and item numbers. Claude writes a page spec and runs:

```
node scripts/focus-draft.mjs page.da.json --env .env.local --check
node scripts/focus-draft.mjs page.da.json --env .env.local
```

The result is an **unpublished draft**; nothing reaches the site until an editor presses Publish in the Studio. Guard rails (`scripts/focus/validate.mjs`, unit-tested in `tests/focus-draft.test.ts`): only blocks that exist, only safe links, no prices, no script text, the English base dealer-neutral, never overwriting an existing draft without `--replace-draft`, uploads only from https or from files next to the spec. The instructions Claude follows are in `.claude/skills/focus-page/SKILL.md`; the example spec is `.claude/skills/focus-page/example.da.json`.

New block TYPES are code: ask the developer, it is one schema object plus one renderer, and it then appears in the Studio for every page.

## Content seeded (scripts/seed-focus.mjs)

The two Webflow pages, ported in Danish (verbatim) and English (translated, dealer-neutral): `led-strip-cable-reel` (October 2026, Lighting) and `smart-lock-st-3` (November 2026, Security). 57 images and films were copied from the Webflow CDN into Sanity, so the new site does not depend on Webflow. The parked "Let there be light / Lorem ipsum" band was not ported. The English pages leave out the Carl Ras specialists block (dealer-specific people).

Re-run: `node scripts/seed-focus.mjs --env .env.local` creates what is missing; `--force` overwrites Studio edits on those documents, so do not use it once editors have worked on them.
