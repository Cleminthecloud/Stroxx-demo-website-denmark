---
name: focus-page
description: Build a STROXX "Focus on…" (Fokus på…) product page as an unpublished Sanity draft from a Word brief, PDF data sheet, product links or PIM data. Use when someone asks to make, draft or update a focus page / fokusside / månedens fokusprodukt.
---

# Focus on… page builder

You turn the editor's material into a page spec (JSON) and write it to Sanity as a
DRAFT with `scripts/focus-draft.mjs`. You never publish. The editor (Søren or Clem)
reviews the draft in the Studio's Edit site and presses Publish.

Full reference: `REFERENCE.md` next to this file. Example spec: `example.da.json` next to this file.
Live samples of every block: `/components` on the site.

## 1. Gather, then ask only what is missing

Read everything you were given first: the Word brief (.docx), the PDF data sheet or
manual, product page links, and PIM data (if `data/pim/` snapshots exist in the repo,
look the item numbers up there; never invent specs). Then ask, in one message, only
for what you could not find:

- the focus month (first of the month, e.g. 2026-12-01)
- the category (an existing filter key: `lighting`, `security`, or ask to create one)
- languages: Danish (`da-DK`) always first; English base (`en`) too unless told not to
- images and films: which to use, and whether any are AI-made (needs a disclosure line)

## 2. Hard rules (the validator enforces most of them; do not try to get round it)

- NO PRICES. Never a number next to kr/DKK/€. Value claims without numbers are fine.
- English slugs only, the SAME slug on every language version (`smart-lock-st-3`).
- Danish copy may name Carl Ras. The English base (`en`) must be dealer-neutral: no
  "Carl Ras", buttons say "Where to buy", product links use `itemNumber` only.
- Product shots stay in colour (`colour: true`); mood scenes are black and white.
- AI-generated or AI-altered film/images need a visible disclosure line next to them
  (`disclosure` on the hero or mosaic, `footnote` on a film). EU AI Act art. 50.
- Never write safety-relevant claims the source does not state. Copy forbidden
  terms from the brief exactly (e.g. the LED reel: never lit while coiled).
- No long dashes (– or —) in copy. Use commas, colons or full stops.
- Headlines: wrap one word in `*asterisks*` for the blue accent.

## 3. Shape of a good page (the two ported pages follow it)

1. `photoHero` (film or photo, product name, one promise, button)
2. `splitMedia` with the product photo in colour (`colour: true`) and the story
3. `numberedTabs`: three selling points, each with its own photo
4. `hotspotImage` (`frame` matching the photo, `showList: true`)
5. `filmSection` if there is real footage
6. `comparisonTable` against the alternatives (`+` tick, `-` cross)
7. `specGrid` hard numbers, then `modelCards` for variants / in-the-box
8. `rangeAdvisor` when the buyer must pick a size (door thickness → spindle)
9. `stepList` for installation or set-up, `safetyNotice` for the one critical rule
10. `linkCards` related products (`itemNumber` on every card), `faqSection`
11. `textIntro` guarantee (`ctaHref: /satisfaction-guarantee`), `ctaBanner` close

The "More focus products" strip is added automatically. Do not build it.

## 4. Write the spec, validate, draft

Spec fields: `language, title, slug, month, teaser, categoryKey, tags[], itemNumbers[],
cardImage, cutout, seoTitle (≤60), seoDescription (≤155), sections[]`. Section fields
are exactly the Studio field names (see `sanity/schemaTypes/focusBlocks.ts` and
`landingPage.ts`). Images: `{ "imageUrl": "https://...", "alt": "..." }` or
`{ "imagePath": "./file.jpg", "alt": "..." }` (path relative to the spec file). Videos:
`"videoFileUrl"` or `"videoFilePath"`.

```
node scripts/focus-draft.mjs path/to/page.da.json --env .env.local --check
node scripts/focus-draft.mjs path/to/page.da.json --env .env.local
```

On Clem's Mac the token is in `.env.local`. If a draft already exists the script stops;
only pass `--replace-draft` when the editor confirms the old draft can go.

## 5. Hand over

Tell the editor, in plain words: the draft is in the Studio under Pages → Focus on…,
it is not live, what you were unsure of (list it), and to open Edit site, check each
block, then Publish. If a block the page needs does not exist, say so: new block TYPES
are code (a developer change and a deploy), not something to fake with existing blocks.
